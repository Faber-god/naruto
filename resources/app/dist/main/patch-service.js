"use strict";

// Local game-asset patch service for the packaged v1.2.1 bundle.
// It is intentionally self-contained so the rest of index.js stays untouched.
const { app, net, session: electronSession } = require("electron");
const fs = require("fs");
const path = require("path");
const { createHash } = require("crypto");

const USER_DATA = app.getPath("userData");
const HTTP2_ENABLED = process.env.NARUTO_HTTP2 === "1" || fs.existsSync(path.join(USER_DATA, "http2.flag"));
if (!HTTP2_ENABLED) app.commandLine.appendSwitch("disable-http2");

// ---- performance flags (ported idea from Optimized Launcher 5.2) -------------
// Chromium defaults throttle background/occluded windows and frame scheduling,
// which shows up as stutter when the game window loses focus. Opt out unless the
// user drops perf-flags.off next to patch.log.
try {
  if (!fs.existsSync(path.join(USER_DATA, "perf-flags.off"))) {
    // balanced default: keep the CPU side from being throttled and let CEF pace
    // Flash frames, but leave rendering-path changes opt-in (they are the ones
    // that can alter how the plugin surface is composited/scaled)
    const flags = [
      "disable-background-timer-throttling",
      "disable-renderer-backgrounding",
      "disable-backgrounding-occluded-windows",
      "enable-begin-frame-scheduling",
    ];
    if (fs.existsSync(path.join(USER_DATA, "perf-gpu.flag"))) {
      flags.push("enable-accelerated-2d-canvas",
        "enable-gpu-rasterization", "enable-zero-copy");
    }
    for (const flag of flags) app.commandLine.appendSwitch(flag);
    app.on("web-contents-created", (_event, contents) => {
      try {
        contents.setBackgroundThrottling(false);
      } catch (_) {
        /* older runtime */
      }
    });
  }
} catch (_) {
  /* never block startup */
}

function normalizeUrlPath(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    let pathname;
    try {
      pathname = decodeURIComponent(url.pathname);
    } catch (_) {
      pathname = url.pathname;
    }
    pathname = pathname.replace(/\\/g, "/");
    if (!pathname.startsWith("/")) pathname = "/" + pathname;
    return pathname;
  } catch (_) {
    return null;
  }
}

function normalizePatchPath(value) {
  const raw = String(value == null ? "" : value).trim().replace(/\\/g, "/");
  if (!raw || raw.startsWith("/") || /^[a-zA-Z]:/.test(raw) || raw.split("/").includes("..")) return null;
  return raw;
}

function parsePatchManifest(raw) {
  if (!raw || typeof raw !== "object") return null;
  if (typeof raw.enabled !== "boolean" || typeof raw.version !== "number" || !Array.isArray(raw.patches)) return null;
  const patches = [];
  for (const item of raw.patches) {
    if (!item || typeof item !== "object") return null;
    if (typeof item.path !== "string" || typeof item.file !== "string") return null;
    const file = normalizePatchPath(item.file);
    if (!file) return null;
    patches.push({
      path: item.path,
      file,
      ...(typeof item.sha256 === "string" ? { sha256: item.sha256 } : {}),
      ...(typeof item.mimeType === "string" ? { mimeType: item.mimeType } : {}),
      ...(typeof item.note === "string" ? { note: item.note } : {})
    });
  }
  return {
    enabled: raw.enabled,
    version: raw.version,
    ...(typeof raw.region === "string" ? { region: raw.region } : {}),
    ...(typeof raw.textRegion === "string" ? { textRegion: raw.textRegion } : {}),
    ...(Array.isArray(raw.hosts) ? { hosts: raw.hosts.filter(host => typeof host === "string") } : {}),
    patches
  };
}

function matchPatch(manifest, requestUrl) {
  if (!manifest || !manifest.enabled || !manifest.patches.length) return null;
  const pathname = normalizeUrlPath(requestUrl);
  if (!pathname) return null;
  if (manifest.hosts && manifest.hosts.length) {
    try {
      const host = new URL(requestUrl).hostname.toLowerCase();
      if (!manifest.hosts.some(item => {
        const allowed = item.toLowerCase();
        return host === allowed || host.endsWith("." + allowed);
      })) return null;
    } catch (_) {
      return null;
    }
  }
  const lower = pathname.toLowerCase();
  for (const entry of manifest.patches) {
    const candidate = "/" + entry.path.replace(/^\/+/, "").toLowerCase();
    if (lower === candidate || lower.endsWith(candidate)) return entry;
  }
  return null;
}

function defaultMimeType(file) {  if (/\.swf$/i.test(file)) return "application/x-shockwave-flash";
  if (/\.(html?|txt|cfg|xml|json)$/i.test(file)) return "text/plain; charset=utf-8";
  return "application/octet-stream";
}

// ---- local asset cache (B) ---------------------------------------------------
// The PT CDN is often the slowest part of a launch, and every response currently
// passes through the JS proxy. Cache static assets by host+path so later launches
// serve them from disk. Build-tagged paths (PT_NarutoAlpha9.38Build301/...) bust
// the key on each game update by themselves.
const CACHE_DIR = path.join(USER_DATA, "asset-cache");
const CACHE_OFF = path.join(USER_DATA, "asset-cache.off");
const CACHE_INDEX_FILE = path.join(USER_DATA, "asset-cache-index.json");
const CACHE_MAX_TOTAL = 512 * 1024 * 1024;
const CACHE_MAX_FILE = 24 * 1024 * 1024;
// configs can change without a new build path, so they expire sooner than assets
const CACHE_TTL_ASSET = 30 * 24 * 3600 * 1000;
const CACHE_TTL_DATA = 3 * 24 * 3600 * 1000;
const CACHE_SKIP = /(^\/?$|\/entry\.swf|resource\.cfg|LoginConfig\.xml|\/api\/|\/cgi|\/login|socket)/i;
const CACHE_EXT = /\.(swf|cfg|xml|png|jpe?g|gif|mp3|ogg|dat|bin|pkg)$/i;
let cacheWrites = 0;
let cachePruneRunning = false;
let cacheIndexTimer;
let cacheIndexDirty = false;
let cacheIndex = {};
try {
  const parsed = JSON.parse(fs.readFileSync(CACHE_INDEX_FILE, "utf8"));
  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) cacheIndex = parsed;
} catch (_) {
  cacheIndex = {};
}

function cachePaths(url) {
  try {
    const u = new URL(url);
    if (CACHE_SKIP.test(u.pathname)) return null;
    const m = CACHE_EXT.exec(u.pathname);
    if (!m) return null;
    const identity = u.hostname + u.pathname;
    const key = createHash("sha1").update(identity + u.search).digest("hex");
    const legacyKey = createHash("sha1").update(identity).digest("hex");
    return {
      key,
      file: path.join(CACHE_DIR, key + "." + m[1].toLowerCase()),
      legacyFile: path.join(CACHE_DIR, legacyKey + "." + m[1].toLowerCase()),
      record: {
        url: u.href,
        query: u.search,
        mimeType: defaultMimeType(u.pathname),
        legacy: false
      }
    };
  } catch (_) {
    return null;
  }
}

function cacheFile(url) {
  return cachePaths(url)?.file ?? null;
}

function scheduleCacheIndexWrite() {
  cacheIndexDirty = true;
  if (cacheIndexTimer) return;
  cacheIndexTimer = setTimeout(() => {
    cacheIndexTimer = void 0;
    if (!cacheIndexDirty) return;
    const temp = `${CACHE_INDEX_FILE}.${process.pid}.${Date.now()}.tmp`;
    try {
      fs.writeFileSync(temp, JSON.stringify(cacheIndex));
      fs.renameSync(temp, CACHE_INDEX_FILE);
      cacheIndexDirty = false;
    } catch (_) {
      try { fs.unlinkSync(temp); } catch (_) {}
    }
  }, 500);
  cacheIndexTimer.unref?.();
}

async function cachePrune() {
  if (cachePruneRunning || fs.existsSync(CACHE_OFF)) return;
  cachePruneRunning = true;
  try {
    const names = await fs.promises.readdir(CACHE_DIR).catch(() => []);
    const lastAccessByFile = new Map();
    for (const record of Object.values(cacheIndex)) {
      if (record?.file) lastAccessByFile.set(record.file, Number(record.lastAccess) || 0);
    }
    let total = 0;
    const entries = [];
    for (const n of names) {
      const st = await fs.promises.stat(path.join(CACHE_DIR, n)).catch(() => null);
      if (!st?.isFile()) continue;
      total += st.size;
      entries.push([lastAccessByFile.get(n) || st.mtimeMs, st.size, n]);
    }
    if (total <= CACHE_MAX_TOTAL) return;
    entries.sort((a, b) => a[0] - b[0]);
    for (const [, size, n] of entries) {
      if (total <= CACHE_MAX_TOTAL) break;
      try {
        await fs.promises.unlink(path.join(CACHE_DIR, n));
        total -= size;
        for (const [key, record] of Object.entries(cacheIndex)) {
          if (record.file === n) {
            delete cacheIndex[key];
            scheduleCacheIndexWrite();
          }
        }
      } catch (_) {
        /* ignore */
      }
    }
  } catch (_) {
    /* ignore */
  } finally {
    cachePruneRunning = false;
  }
}

function cacheFresh(file, record) {
  try {
    const st = fs.statSync(file);
    if (record?.expiresAt) return Date.now() < Number(record.expiresAt);
    const ttl = /\.(swf|png|jpe?g|gif|mp3|ogg)$/i.test(file) ? CACHE_TTL_ASSET : CACHE_TTL_DATA;
    return Date.now() - st.mtimeMs < ttl;
  } catch (_) {
    return false;
  }
}

function cacheRead(url) {
  const paths = cachePaths(url);
  if (!paths) return null;
  const record = cacheIndex[paths.key];
  const indexedFile = record?.file ? path.join(CACHE_DIR, record.file) : paths.file;
  if (record && cacheFresh(indexedFile, record)) return { ...record, file: indexedFile };
  if (fs.existsSync(paths.legacyFile) && cacheFresh(paths.legacyFile)) {
    const st = fs.statSync(paths.legacyFile);
    const ttl = /\.(swf|png|jpe?g|gif|mp3|ogg)$/i.test(paths.legacyFile) ? CACHE_TTL_ASSET : CACHE_TTL_DATA;
    const migrated = {
      ...paths.record,
      file: path.basename(paths.legacyFile),
      legacy: true,
      expiresAt: st.mtimeMs + ttl,
      size: st.size,
      lastAccess: Date.now()
    };
    cacheIndex[paths.key] = migrated;
    scheduleCacheIndexWrite();
    return { ...migrated, file: paths.legacyFile };
  }
  return null;
}

function cacheWrite(url, data, response, durationMs) {
  if (fs.existsSync(CACHE_OFF) || !data || data.length > CACHE_MAX_FILE) return;
  const paths = cachePaths(url);
  if (!paths) return;
  const temp = `${paths.file}.${process.pid}.${Date.now()}.tmp`;
  const headers = response?.headers || {};
  const getHeader = name => {
    const key = Object.keys(headers).find(item => item.toLowerCase() === name);
    const value = key ? headers[key] : "";
    return Array.isArray(value) ? value.join(", ") : String(value || "");
  };
  const ttl = /\.(swf|png|jpe?g|gif|mp3|ogg)$/i.test(paths.file) ? CACHE_TTL_ASSET : CACHE_TTL_DATA;
  fs.promises.mkdir(CACHE_DIR, { recursive: true })
    .then(() => fs.promises.writeFile(temp, data))
    .then(() => fs.promises.rename(temp, paths.file))
    .then(() => {
      cacheIndex[paths.key] = {
        ...paths.record,
        file: path.basename(paths.file),
        contentType: getHeader("content-type"),
        contentEncoding: getHeader("content-encoding"),
        etag: getHeader("etag"),
        lastModified: getHeader("last-modified"),
        responseTimeMs: Math.max(0, Number(durationMs) || 0),
        expiresAt: Date.now() + ttl,
        size: data.length,
        lastAccess: Date.now()
      };
      scheduleCacheIndexWrite();
    })
    .catch(async () => {
      await fs.promises.unlink(temp).catch(() => {});
    });
  if (++cacheWrites % 200 === 0) setTimeout(() => void cachePrune(), 1500).unref?.();
}

class PatchService {
  constructor() {
    this.manifest = null;
    this.dir = "";
    this.loaded = false;
    this.attached = new Map();
    this.attachedTargeted = new Map();
    this.logFile = "";
    this.metrics = null;
    this.targetedMetrics = null;
    this.prefetchPromise = null;
  }

  log(message) {
    const line = `[patch] ${new Date().toISOString()} ${message}\n`;
    try {
      if (!this.logFile) this.logFile = path.join(app.getPath("userData"), "patch.log");
      fs.appendFileSync(this.logFile, line);
    } catch (_) {
      /* diagnostics must never break the game */
    }
  }

  resolveDir() {
    if (process.env.NARUTO_PATCH_DIR) return process.env.NARUTO_PATCH_DIR;
    const executableDir = path.join(path.dirname(process.execPath), "patches");
    if (fs.existsSync(path.join(executableDir, "patch-manifest.json"))) return executableDir;
    const userDir = path.join(app.getPath("userData"), "patches");
    if (fs.existsSync(path.join(userDir, "patch-manifest.json"))) return userDir;
    return path.join(app.getAppPath(), "patches");
  }

  reload() {
    this.dir = this.resolveDir();
    this.manifest = null;
    try {
      const raw = fs.readFileSync(path.join(this.dir, "patch-manifest.json"), "utf8").replace(/^\uFEFF/, "");
      this.manifest = parsePatchManifest(JSON.parse(raw));
    } catch (_) {
      this.manifest = null;
    }
    this.loaded = true;
    this.log(`manifest=${this.manifest ? "loaded" : "missing"} enabled=${this.enabled} dir=${this.dir} exe=${process.execPath}`);
    return this.manifest;
  }

  get enabled() {
    return process.env.NARUTO_PATCHES !== "0" && !!(this.manifest && this.manifest.enabled);
  }

  ensure() {
    if (!this.loaded) this.reload();
    return this.enabled ? this.manifest : null;
  }

  async attachTargeted(webContents, region) {
    if (region !== "br") {
      this.log(`targeted skip region=${region}`);
      return false;
    }
    this.reload();
    const manifest = this.enabled ? this.manifest : null;
    if (!manifest || this.attachedTargeted.has(webContents)) return false;
    if (manifest.region && manifest.region !== region) return false;
    const debuggerApi = webContents.debugger;
    this.targetedMetrics = { startedAt: Date.now(), hits: 0, cacheHits: 0, passed: 0, errors: 0 };
    try {
      if (!debuggerApi.isAttached()) debuggerApi.attach("1.3");
      await debuggerApi.sendCommand("Fetch.enable", {
        patterns: [{ urlPattern: "*", requestStage: "Request" }]
      });
    } catch (error) {
      this.log(`targeted attach-failed ${error?.message || String(error)}`);
      try {
        if (debuggerApi.isAttached()) debuggerApi.detach();
      } catch (_) {}
      return false;
    }
    const onMessage = (_event, method, params) => {
      if (method !== "Fetch.requestPaused") return;
      const requestId = params.requestId;
      const url = params.request?.url || "";
      const entry = matchPatch(manifest, url);
      if (!entry) {
        if (params.request?.method === "GET" && !fs.existsSync(CACHE_OFF)) {
          const cached = cacheRead(url);
          if (cached) {
            try {
              const data = fs.readFileSync(cached.file);
              if (data.length) {
                this.targetedMetrics.cacheHits += 1;
                cached.lastAccess = Date.now();
                const key = cachePaths(url)?.key;
                if (key && cacheIndex[key]) {
                  cacheIndex[key].lastAccess = cached.lastAccess;
                  scheduleCacheIndexWrite();
                }
                const responseHeaders = [];
                if (cached.contentType || cached.mimeType) {
                  responseHeaders.push({ name: "Content-Type", value: cached.contentType || cached.mimeType });
                }
                if (cached.contentEncoding) {
                  responseHeaders.push({ name: "Content-Encoding", value: cached.contentEncoding });
                }
                if (cached.etag) responseHeaders.push({ name: "ETag", value: cached.etag });
                if (cached.lastModified) responseHeaders.push({ name: "Last-Modified", value: cached.lastModified });
                responseHeaders.push({ name: "Content-Length", value: String(data.length) });
                void debuggerApi.sendCommand("Fetch.fulfillRequest", {
                  requestId,
                  responseCode: 200,
                  responseHeaders,
                  body: data.toString("base64")
                }).catch(() => {});
                return;
              }
            } catch (_) {}
          }
        }
        this.targetedMetrics.passed += 1;
        void debuggerApi.sendCommand("Fetch.continueRequest", { requestId }).catch(() => {});
        return;
      }
      try {
        const data = fs.readFileSync(path.join(this.dir, entry.file));
        if (entry.sha256 && createHash("sha256").update(data).digest("hex") !== entry.sha256.toLowerCase()) {
          this.targetedMetrics.errors += 1;
          this.log(`targeted hash-mismatch ${entry.path}`);
          void debuggerApi.sendCommand("Fetch.failRequest", { requestId, errorReason: "Failed" }).catch(() => {});
          return;
        }
        this.log(`targeted hit ${entry.path}`);
        this.targetedMetrics.hits += 1;
        void debuggerApi.sendCommand("Fetch.fulfillRequest", {
          requestId,
          responseCode: 200,
          responseHeaders: [
            { name: "Content-Type", value: entry.mimeType || defaultMimeType(entry.file) },
            { name: "Content-Length", value: String(data.length) },
            { name: "Access-Control-Allow-Origin", value: "*" },
            { name: "Cache-Control", value: "no-store" }
          ],
          body: data.toString("base64")
        }).catch(() => {});
      } catch (_) {
        this.targetedMetrics.errors += 1;
        this.log(`targeted read-failed ${entry.path}`);
        void debuggerApi.sendCommand("Fetch.failRequest", { requestId, errorReason: "Failed" }).catch(() => {});
      }
    };
    debuggerApi.on("message", onMessage);
    this.attachedTargeted.set(webContents, { debugger: debuggerApi, onMessage });
    this.log(`targeted attached patches=${manifest.patches.length}`);
    void this.prefetch();
    return true;
  }

  async detachTargeted(webContents) {
    const item = this.attachedTargeted.get(webContents);
    if (!item) return;
    this.attachedTargeted.delete(webContents);
    try {
      item.debugger.removeListener("message", item.onMessage);
      if (item.debugger.isAttached()) {
        await item.debugger.sendCommand("Fetch.disable").catch(() => {});
        item.debugger.detach();
      }
    } catch (_) {}
    const metrics = this.targetedMetrics;
    this.log(metrics
      ? `targeted detached elapsed=${Date.now() - metrics.startedAt}ms hits=${metrics.hits} cache=${metrics.cacheHits} passed=${metrics.passed} errors=${metrics.errors}`
      : "targeted detached");
    this.targetedMetrics = null;
  }

  attach(gameSession, region) {
    if (region !== "br") {
      this.log(`skip region=${region}`);
      return;
    }
    this.reload();
    const manifest = this.enabled ? this.manifest : null;
    if (!manifest || this.attached.has(gameSession)) return;
    if (manifest.region && manifest.region !== region) {
      this.log(`region-mismatch game=${region} manifest=${manifest.region}`);
      return;
    }
    const proxy = electronSession.fromPartition(
      `naruto-patch-proxy-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
    );
    const self = this;
    const debug = process.env.NARUTO_PATCH_DEBUG === "1" || fs.existsSync(path.join(app.getPath("userData"), "patch-debug.flag"));
    this.stats = { hitN: 0, hitMs: 0, netN: 0, netMs: 0, bytes: 0 };
    this.metrics = {
      startedAt: Date.now(),
      region,
      http2: HTTP2_ENABLED,
      patchHits: 0,
      cacheHits: 0,
      network: 0,
      bytes: 0,
      retries: 0,
      errors: 0,
      httpVersions: {}
    };
    const installed = gameSession.protocol.interceptBufferProtocol("https", function (request, callback) {
      const t0 = Date.now();
      let sent = 0;
      const done = (payload, kind) => {
        sent = payload && payload.data ? payload.data.length : 0;
        if (kind === "hit") self.metrics.patchHits += 1;
        else if (kind === "cache") self.metrics.cacheHits += 1;
        else if (kind === "net") self.metrics.network += 1;
        self.metrics.bytes += sent;
        if (debug) {
          const ms = Date.now() - t0;
          const st = self.stats;
          if (kind === "hit") { st.hitN += 1; st.hitMs += ms; }
          else if (kind === "cache") { st.hitN += 1; st.hitMs += ms; }
          else { st.netN += 1; st.netMs += ms; }
          st.bytes += sent;
          if (ms > 300 || kind !== "net") {
            self.log(`timing ${kind} ${ms}ms ${sent}b ${request.url}`);
          }
          if ((st.hitN + st.netN) % 50 === 0) {
            self.log(`stats hit=${st.hitN}/${st.hitMs}ms net=${st.netN}/${st.netMs}ms bytes=${st.bytes}`);
          }
        }
        callback(payload);
      };
      if (debug && /\.(swf|cfg|xml|bin|dat|key|json|txt|pkg)(\?|$)/i.test(request.url)) {
        self.log(`request ${request.method} ${request.url}`);
      }
      const entry = matchPatch(manifest, request.url);
      if (entry) {
        try {
          const file = path.join(self.dir, entry.file);
          const data = fs.readFileSync(file);
          if (entry.sha256) {
            const digest = createHash("sha256").update(data).digest("hex");
            if (digest !== entry.sha256.toLowerCase()) {
              self.log(`hash-mismatch ${entry.path}`);
              done({ error: -2 }, "hit");
              return;
            }
          }
          self.log(`hit ${entry.path}`);
          done({ mimeType: entry.mimeType || defaultMimeType(entry.file), data }, "hit");
          return;
        } catch (_) {
          self.log(`read-failed ${entry.path}`);
        }
      }
      if (!fs.existsSync(CACHE_OFF) && request.method === "GET") {
        const cached = cacheRead(request.url);
        if (cached) {
          try {
            const data = fs.readFileSync(cached.file);
            if (data.length) {
              cached.lastAccess = Date.now();
              const key = cachePaths(request.url)?.key;
              if (key && cacheIndex[key]) {
                cacheIndex[key].lastAccess = cached.lastAccess;
                scheduleCacheIndexWrite();
              }
              const headers = {};
              if (cached.contentType) headers["Content-Type"] = cached.contentType;
              if (cached.contentEncoding) headers["Content-Encoding"] = cached.contentEncoding;
              done({ mimeType: cached.contentType || cached.mimeType || defaultMimeType(cached.file), headers, data }, "cache");
              return;
            }
          } catch (_) {
            /* cache miss */
          }
        }
      }
      self.proxy(request, gameSession, proxy, payload => done(payload, "net"));
    });
    if (!installed) {
      this.log("intercept-failed");
      return;
    }
    this.attached.set(gameSession, { proxy });
    this.log(`attached patches=${manifest.patches.length} http2=${HTTP2_ENABLED ? "on" : "off"}`);
    void this.prefetch();
  }

  detach(gameSession) {
    if (!this.attached.has(gameSession)) return;
    try {
      gameSession.protocol.uninterceptProtocol("https");
    } catch (_) {
      /* session may already be gone */
    }
    this.attached.delete(gameSession);
    const metrics = this.metrics;
    this.log(metrics
      ? `detached elapsed=${Date.now() - metrics.startedAt}ms patch=${metrics.patchHits} cache=${metrics.cacheHits} net=${metrics.network} retries=${metrics.retries} errors=${metrics.errors} bytes=${metrics.bytes} http=${JSON.stringify(metrics.httpVersions)} http2=${metrics.http2 ? "on" : "off"}`
      : "detached");
    this.metrics = null;
  }

  prefetch() {
    if (this.prefetchPromise) return this.prefetchPromise;
    if (process.env.NARUTO_PREFETCH === "0" || fs.existsSync(CACHE_OFF)) return Promise.resolve({ skipped: "disabled" });
    let config;
    try {
      config = JSON.parse(fs.readFileSync(path.join(this.dir, "prefetch.json"), "utf8").replace(/^\uFEFF/, ""));
    } catch (_) {
      return Promise.resolve({ skipped: "missing-config" });
    }
    const urls = Array.isArray(config?.urls)
      ? config.urls.filter(url => typeof url === "string" && /^https:\/\//i.test(url)).slice(0, 16)
      : [];
    if (config?.enabled !== true || !urls.length) return Promise.resolve({ skipped: "disabled" });
    const startedAt = Date.now();
    const session = electronSession.fromPartition(`naruto-prefetch-${Date.now().toString(36)}`);
    const queue = [...urls];
    const results = [];
    const worker = async () => {
      while (queue.length) {
        const url = queue.shift();
        if (cacheRead(url)) {
          results.push({ url, status: "cache" });
          continue;
        }
        results.push(await this.fetchToCache(session, url));
      }
    };
    this.prefetchPromise = Promise.all(Array.from({ length: Math.min(4, urls.length) }, () => worker()))
      .then(() => {
        const cached = results.filter(item => item.status === "ok" || item.status === "cache").length;
        this.log(`prefetch done cached=${cached}/${results.length} elapsed=${Date.now() - startedAt}ms`);
        return { cached, total: results.length };
      })
      .catch(error => {
        this.log(`prefetch failed ${error?.message || String(error)}`);
        return { cached: 0, total: urls.length };
      });
    return this.prefetchPromise;
  }

  fetchToCache(session, url) {
    return new Promise(resolve => {
      const startedAt = Date.now();
      let settled = false;
      let timer;
      let client;
      const done = result => {
        if (settled) return;
        settled = true;
        if (timer) clearTimeout(timer);
        try { client?.abort(); } catch (_) {}
        resolve(result);
      };
      try {
        client = net.request({ url, method: "GET", session, redirect: "follow", useSessionCookies: false });
      } catch (_) {
        resolve({ url, status: "request-failed" });
        return;
      }
      timer = setTimeout(() => done({ url, status: "timeout" }), 8000);
      timer.unref?.();
      client.on("response", response => {
        const chunks = [];
        let size = 0;
        response.on("data", chunk => {
          const data = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
          size += data.length;
          if (size <= CACHE_MAX_FILE) chunks.push(data);
        });
        response.on("end", () => {
          if (size > CACHE_MAX_FILE) return done({ url, status: "too-large" });
          if (response.statusCode !== 200) return done({ url, status: `http-${response.statusCode}` });
          const body = Buffer.concat(chunks);
          cacheWrite(url, body, response, Date.now() - startedAt);
          done({ url, status: "ok" });
        });
        response.on("error", () => done({ url, status: "stream-error" }));
      });
      client.on("error", () => done({ url, status: "network-error" }));
      client.end();
    });
  }

  resetProxy(gameSession) {
    const proxy = electronSession.fromPartition(
      `naruto-patch-proxy-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
    );
    const item = this.attached.get(gameSession);
    if (item) item.proxy = proxy;
    return proxy;
  }

  async proxy(request, gameSession, proxySession, callback) {
    const startedAt = Date.now();
    let settled = false;
    const finish = response => {
      if (settled) return;
      settled = true;
      callback(response);
    };

    try {
    let client;
    try {
      client = net.request({
        url: request.url,
        method: request.method,
        session: proxySession,
        useSessionCookies: true,
        redirect: "manual"
      });
    } catch (_) {
      finish({ error: -2 });
      return;
    }

    const headers = {};
    const HOP_BY_HOP = new Set(["host", "cookie", "content-length", "connection", "keep-alive",
      "proxy-connection", "transfer-encoding", "upgrade", "http2-settings", "te", "trailer"]);
    for (const [key, value] of Object.entries(request.headers || {})) {
      if (HOP_BY_HOP.has(key.toLowerCase())) continue;
      headers[key] = value;
    }
    if (request.referrer && !headers.Referer && !headers.referrer) headers.Referer = request.referrer;
    try {
      const cookies = await gameSession.cookies.get({ url: request.url });
      if (cookies.length) headers.Cookie = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join("; ");
    } catch (_) {
      /* continue without cookies */
    }
    for (const [key, value] of Object.entries(headers)) {
      try {
        client.setHeader(key, value);
      } catch (_) {
        /* ignore headers the network stack rejects */
      }
    }

    const chunks = [];
    let retried = false;
    const retryOnce = message => {
      if (retried) return false;
      if (!/ERR_HTTP2|ERR_EMPTY_RESPONSE|ERR_CONNECTION|ERR_NETWORK_CHANGED|ERR_TIMED_OUT/i.test(message)) return false;
      retried = true;
      if (this.metrics) this.metrics.retries += 1;
      if (HTTP2_ENABLED && /ERR_HTTP2/.test(message)) proxySession = this.resetProxy(gameSession);
      this.log(`proxy-retry ${message} ${request.url}`);
      setTimeout(() => this.proxy(request, gameSession, proxySession, finish), 150);
      return true;
    };
    client.on("redirect", function (statusCode, _method, redirectUrl, responseHeaders) {
      const out = {};
      for (const [key, value] of Object.entries(responseHeaders || {})) {
        if (/^set-cookie$/i.test(key) && Array.isArray(value)) out[key] = value;
        else out[key] = Array.isArray(value) ? value.join(", ") : String(value);
      }
      out["Location"] = redirectUrl;
      this.log(`redirect ${request.url} -> ${redirectUrl}`);
      finish({ statusCode, headers: out, mimeType: "text/html", data: Buffer.from("") });
    }.bind(this));
    client.on("response", response => {
      if (this.metrics) {
        const version = String(response.httpVersion || "unknown");
        this.metrics.httpVersions[version] = (this.metrics.httpVersions[version] || 0) + 1;
      }
      response.on("data", chunk => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
      response.on("error", error => {
        const msg = error && error.message ? error.message : String(error);
        if (this.metrics) this.metrics.errors += 1;
        this.log(`proxy-stream-error ${request.url} ${msg}`);
        if (retryOnce(msg)) return;
        finish({ error: -2 });
      });
      response.on("end", () => {
        if (!chunks.length && response.statusCode === 200 && request.method === "GET") {
          // CDN occasionally closes with an empty body; the game treats that as a
          // failed asset load and stalls, so rebuild the request once.
          this.log(`proxy-empty-body ${request.url}`);
          if (retryOnce("ERR_EMPTY_RESPONSE")) return;
        }
        this.syncCookies(proxySession, gameSession, request.url);
        const out = {};
        for (const [key, value] of Object.entries(response.headers || {})) {
          if (/^set-cookie$/i.test(key) && Array.isArray(value)) out[key] = value;
          else out[key] = Array.isArray(value) ? value.join(", ") : String(value);
        }
        delete out["content-encoding"];
        delete out["content-length"];
        delete out["transfer-encoding"];
        const body = Buffer.concat(chunks);
        if (response.statusCode === 200 && request.method === "GET" && !out["set-cookie"]) {
          cacheWrite(request.url, body, response, Date.now() - startedAt);
        }
        finish({ statusCode: response.statusCode, headers: out, data: body });
      });
    });
    client.on("error", error => {
      const msg = error && error.message ? error.message : String(error);
      if (/Redirect was cancelled/i.test(msg)) return;
      if (this.metrics) this.metrics.errors += 1;
      this.log(`proxy-error ${msg}`);
      if (retryOnce(msg)) return;
      finish({ error: -2 });
    });
    for (const item of request.uploadData || []) {
      if (item.bytes) client.write(item.bytes);
    }
    client.end();
    } catch (error) {
      if (this.metrics) this.metrics.errors += 1;
      this.log(`proxy-failed ${error && error.message ? error.message : String(error)}`);
      finish({ error: -2 });
    }
  }

  async syncCookies(from, to, url) {
    try {
      const cookies = await from.cookies.get({ url });
      for (const cookie of cookies) {
        try {
          await to.cookies.set({
            url,
            name: cookie.name,
            value: cookie.value,
            domain: cookie.domain,
            path: cookie.path,
            secure: cookie.secure,
            httpOnly: cookie.httpOnly,
            ...(cookie.expirationDate ? { expirationDate: cookie.expirationDate } : {})
          });
        } catch (_) {
          /* best effort */
        }
      }
    } catch (_) {
      /* best effort */
    }
  }
}

app.whenReady().then(() => {
  setTimeout(() => void cachePrune(), 3000).unref?.();
}).catch(() => {});
app.on("before-quit", () => {
  if (!cacheIndexDirty) return;
  const temp = `${CACHE_INDEX_FILE}.${process.pid}.quit.tmp`;
  try {
    fs.writeFileSync(temp, JSON.stringify(cacheIndex));
    fs.renameSync(temp, CACHE_INDEX_FILE);
  } catch (_) {
    try { fs.unlinkSync(temp); } catch (_) {}
  }
});

module.exports = new PatchService();
