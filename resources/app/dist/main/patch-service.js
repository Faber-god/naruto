"use strict";

// Local game-asset patch service for the packaged v1.2.1 bundle.
// It is intentionally self-contained so the rest of index.js stays untouched.
const { app, net, session: electronSession } = require("electron");
const fs = require("fs");
const path = require("path");
const { createHash } = require("crypto");

// The passthrough proxy re-issues every HTTPS request from a throwaway session.
// Chromium keeps one shared HTTP/2 connection per host and marks it dead after a
// failed PING (net::ERR_HTTP2_PING_FAILED), which then fails every later request
// on that host until the socket is rebuilt. Plain HTTP/1.1 has no such shared
// session state, so pin the whole app to 1.1.
app.commandLine.appendSwitch("disable-http2");

// ---- performance flags (ported idea from Optimized Launcher 5.2) -------------
// Chromium defaults throttle background/occluded windows and frame scheduling,
// which shows up as stutter when the game window loses focus. Opt out unless the
// user drops perf-flags.off next to patch.log.
try {
  const userData = app.getPath("userData");
  if (!fs.existsSync(path.join(userData, "perf-flags.off"))) {
    // balanced default: keep the CPU side from being throttled and let CEF pace
    // Flash frames, but leave rendering-path changes opt-in (they are the ones
    // that can alter how the plugin surface is composited/scaled)
    const flags = [
      "disable-background-timer-throttling",
      "disable-renderer-backgrounding",
      "disable-backgrounding-occluded-windows",
      "enable-begin-frame-scheduling",
    ];
    if (fs.existsSync(path.join(userData, "perf-gpu.flag"))) {
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
const CACHE_DIR = path.join(app.getPath("userData"), "asset-cache");
const CACHE_OFF = path.join(app.getPath("userData"), "asset-cache.off");
const CACHE_MAX_TOTAL = 512 * 1024 * 1024;
const CACHE_MAX_FILE = 24 * 1024 * 1024;
// configs can change without a new build path, so they expire sooner than assets
const CACHE_TTL_ASSET = 30 * 24 * 3600 * 1000;
const CACHE_TTL_DATA = 3 * 24 * 3600 * 1000;
const CACHE_SKIP = /(^\/?$|\/entry\.swf|resource\.cfg|LoginConfig\.xml|\/api\/|\/cgi|\/login|socket)/i;
const CACHE_EXT = /\.(swf|cfg|xml|png|jpe?g|gif|mp3|ogg|dat|bin|pkg)$/i;
let cacheWrites = 0;

function cacheFile(url) {
  try {
    const u = new URL(url);
    if (CACHE_SKIP.test(u.pathname)) return null;
    const m = CACHE_EXT.exec(u.pathname);
    if (!m) return null;
    const key = createHash("sha1").update(u.hostname + u.pathname).digest("hex");
    return path.join(CACHE_DIR, key + "." + m[1].toLowerCase());
  } catch (_) {
    return null;
  }
}

function cachePrune() {
  try {
    const names = fs.readdirSync(CACHE_DIR);
    let total = 0;
    const entries = [];
    for (const n of names) {
      const st = fs.statSync(path.join(CACHE_DIR, n));
      total += st.size;
      entries.push([st.mtimeMs, st.size, n]);
    }
    if (total <= CACHE_MAX_TOTAL) return;
    entries.sort((a, b) => a[0] - b[0]);
    for (const [, size, n] of entries) {
      if (total <= CACHE_MAX_TOTAL) break;
      try {
        fs.unlinkSync(path.join(CACHE_DIR, n));
        total -= size;
      } catch (_) {
        /* ignore */
      }
    }
  } catch (_) {
    /* ignore */
  }
}

function cacheFresh(file) {
  try {
    const st = fs.statSync(file);
    const ttl = /\.(swf|png|jpe?g|gif|mp3|ogg)$/i.test(file) ? CACHE_TTL_ASSET : CACHE_TTL_DATA;
    return Date.now() - st.mtimeMs < ttl;
  } catch (_) {
    return false;
  }
}

function cacheWrite(url, data) {
  if (fs.existsSync(CACHE_OFF) || !data || data.length > CACHE_MAX_FILE) return;
  const file = cacheFile(url);
  if (!file) return;
  fs.mkdir(CACHE_DIR, { recursive: true }, () => {
    fs.writeFile(file, data, () => {});
  });
  if (++cacheWrites % 200 === 0) cachePrune();
}

class PatchService {
  constructor() {
    this.manifest = null;
    this.dir = "";
    this.loaded = false;
    this.attached = new Map();
    this.logFile = "";
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
    const installed = gameSession.protocol.interceptBufferProtocol("https", function (request, callback) {
      const t0 = Date.now();
      let sent = 0;
      const done = (payload, kind) => {
        sent = payload && payload.data ? payload.data.length : 0;
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
        const file = cacheFile(request.url);
        if (file && cacheFresh(file)) {
          try {
            const data = fs.readFileSync(file);
            if (data.length) {
              done({ mimeType: defaultMimeType(file), data }, "cache");
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
    this.log(`attached patches=${manifest.patches.length}`);
  }

  detach(gameSession) {
    if (!this.attached.has(gameSession)) return;
    try {
      gameSession.protocol.uninterceptProtocol("https");
    } catch (_) {
      /* session may already be gone */
    }
    this.attached.delete(gameSession);
    this.log("detached");
  }

  async proxy(request, gameSession, proxySession, callback) {
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
      response.on("data", chunk => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
      response.on("error", error => {
        const msg = error && error.message ? error.message : String(error);
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
          cacheWrite(request.url, body);
        }
        finish({ statusCode: response.statusCode, headers: out, data: body });
      });
    });
    client.on("error", error => {
      const msg = error && error.message ? error.message : String(error);
      if (/Redirect was cancelled/i.test(msg)) return;
      this.log(`proxy-error ${msg}`);
      if (retryOnce(msg)) return;
      finish({ error: -2 });
    });
    for (const item of request.uploadData || []) {
      if (item.bytes) client.write(item.bytes);
    }
    client.end();
    } catch (error) {
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

module.exports = new PatchService();
