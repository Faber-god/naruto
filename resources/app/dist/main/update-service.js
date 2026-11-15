"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { spawn } = require("child_process");
const { app, net, session, dialog, shell } = require("electron");

const MAX_MANIFEST_BYTES = 256 * 1024;
const MAX_ASSET_BYTES = 200 * 1024 * 1024;
const MANIFEST_TIMEOUT_MS = 15 * 1000;
const DOWNLOAD_IDLE_TIMEOUT_MS = 30 * 1000;
const DOWNLOAD_TOTAL_TIMEOUT_MS = 15 * 60 * 1000;
const REDIRECT_LIMIT = 5;
const AUTO_CHECK_DELAY_MS = 20 * 1000;
const AUTO_CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;
const AUTO_CHECK_MIN_GAP_MS = 24 * 60 * 60 * 1000;

function updateError(code, detail) {
  const error = new Error(detail || code);
  error.code = code;
  return error;
}

function format(template, vars) {
  return String(template).replace(/\{([a-zA-Z0-9_]+)\}/g, (match, key) =>
    Object.prototype.hasOwnProperty.call(vars || {}, key) ? String(vars[key]) : match
  );
}

function parseVersion(value) {
  const match = /^v?(\d{1,6})\.(\d{1,6})\.(\d{1,6})$/.exec(String(value || "").trim());
  return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : null;
}

function compareVersions(left, right) {
  for (let index = 0; index < 3; index += 1) {
    if (left[index] > right[index]) return 1;
    if (left[index] < right[index]) return -1;
  }
  return 0;
}

function readJson(file) {
  const raw = fs.readFileSync(file, "utf8").replace(/^﻿/, "");
  return JSON.parse(raw);
}

function writeJsonAtomic(file, value) {
  const temporary = file + "." + crypto.randomBytes(6).toString("hex") + ".tmp";
  fs.writeFileSync(temporary, JSON.stringify(value, null, 2), { encoding: "utf8", mode: 384 });
  fs.renameSync(temporary, file);
}

function removeFile(file) {
  try {
    if (fs.existsSync(file)) fs.unlinkSync(file);
  } catch (_) {
  }
}

function hashFile(file) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(file);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(hash.digest("hex")));
  });
}

function headerValue(headers, name) {
  const value = headers && headers[name];
  return Array.isArray(value) ? value[0] : value;
}

class UpdateService {
  constructor(options) {
    this.options = options;
    this.root = options.root;
    this.userData = options.userData;
    this.installRoot = options.installRoot;
    this.appDir = path.join(this.installRoot, "resources", "app");
    this.updatesRoot = path.join(this.userData, "updates");
    this.backupRoot = path.join(this.userData, "update-backup");
    this.logPath = path.join(this.userData, "update.log");
    this.resultPath = path.join(this.userData, "update-result.json");
    this.pendingPath = path.join(this.userData, "update-pending.json");
    this.testMode = process.env.NARUTO_TEST_MODE === "1" || process.env.NARUTO_UPDATE_TEST === "1";
    this.netSession = session.fromPartition("naruto-update");
    this.proxyConfigured = false;
    this.config = this.loadConfig();
    this.manifest = null;
    this.generation = 0;
    this.checkPromise = null;
    this.currentRequest = null;
    this.currentStream = null;
    this.currentPart = null;
    this.autoTimer = null;
    this.autoInterval = null;
    this.lastProgressAt = 0;
    const layout = this.getLayout();
    const persisted = layout && layout.update && typeof layout.update === "object" ? layout.update : {};
    this.state = {
      phase: "idle",
      currentVersion: app.getVersion(),
      latestVersion: "",
      minVersion: "",
      notes: "",
      publishedAt: "",
      size: 0,
      assetName: "",
      progress: { received: 0, total: 0, percent: 0 },
      errorCode: "",
      errorDetail: "",
      lastCheckedAt: Number(persisted.lastCheckedAt) || 0,
      lastResult: typeof persisted.lastResult === "string" ? persisted.lastResult : "",
      consecutiveFailures: Number(persisted.consecutiveFailures) || 0,
      hasDownload: false,
      installResult: null,
      autoCheck: !(layout && layout.preferences && layout.preferences.updateAutoCheck === false)
    };
  }

  getLayout() {
    try {
      return this.options.getLayout();
    } catch (_) {
      return null;
    }
  }

  messages() {
    try {
      return this.options.messages() || {};
    } catch (_) {
      return {};
    }
  }

  t(key, vars) {
    const ui = this.messages().ui && this.messages().ui.update ? this.messages().ui.update : {};
    return format(typeof ui[key] === "string" ? ui[key] : key, vars || {});
  }

  log(key, vars) {
    const logs = this.messages().logs && this.messages().logs.update ? this.messages().logs.update : {};
    const template = typeof logs[key] === "string" ? logs[key] : key;
    const line = "[" + new Date().toISOString() + "] " + format(template, vars || {}) + "\n";
    try {
      fs.mkdirSync(this.userData, { recursive: true });
      if (fs.existsSync(this.logPath) && fs.statSync(this.logPath).size > 512 * 1024) fs.unlinkSync(this.logPath);
      fs.appendFileSync(this.logPath, line, "utf8");
    } catch (_) {
    }
  }

  loadConfig() {
    const fallback = {
      feedUrl: "https://github.com/Faber-god/naruto/releases/latest/download/update.json",
      openPageUrl: "https://github.com/Faber-god/naruto/releases/latest",
      enabled: true
    };
    let config = fallback;
    try {
      const parsed = readJson(path.join(this.root, "config", "update.json"));
      if (parsed && typeof parsed === "object") config = { ...fallback, ...parsed };
    } catch (error) {
      this.log("configInvalid", { detail: error && error.message ? error.message : String(error) });
    }
    if (process.env.NARUTO_UPDATE_FEED) config.feedUrl = process.env.NARUTO_UPDATE_FEED;
    if (process.env.NARUTO_UPDATE_PAGE) config.openPageUrl = process.env.NARUTO_UPDATE_PAGE;
    return config;
  }

  allowedUrl(value) {
    let url;
    try {
      url = new URL(String(value || ""));
    } catch (_) {
      return false;
    }
    if (url.username || url.password) return false;
    if (url.protocol === "http:") {
      return this.testMode && (url.hostname === "127.0.0.1" || url.hostname === "localhost");
    }
    if (url.protocol !== "https:") return false;
    const host = url.hostname.toLowerCase();
    return host === "github.com" ||
      host.endsWith(".github.com") ||
      host.endsWith(".githubusercontent.com");
  }

  snapshot() {
    const layout = this.getLayout();
    return {
      phase: this.state.phase,
      currentVersion: this.state.currentVersion,
      latestVersion: this.state.latestVersion,
      minVersion: this.state.minVersion,
      notes: this.state.notes,
      publishedAt: this.state.publishedAt,
      size: this.state.size,
      assetName: this.state.assetName,
      progress: { ...this.state.progress },
      errorCode: this.state.errorCode,
      errorDetail: this.state.errorDetail,
      lastCheckedAt: this.state.lastCheckedAt,
      lastResult: this.state.lastResult,
      consecutiveFailures: this.state.consecutiveFailures,
      hasDownload: this.state.hasDownload,
      installResult: this.state.installResult,
      autoCheck: !(layout && layout.preferences && layout.preferences.updateAutoCheck === false)
    };
  }

  emit() {
    try {
      this.options.broadcast();
    } catch (_) {
    }
    this.emitProgress();
  }

  emitProgress() {
    const win = this.options.getWindow();
    if (!win || win.isDestroyed()) return;
    try {
      win.webContents.send("shell:update-progress", {
        generation: this.generation,
        phase: this.state.phase,
        received: this.state.progress.received,
        total: this.state.progress.total,
        percent: this.state.progress.percent
      });
    } catch (_) {
    }
  }

  persist(patch) {
    const layout = this.getLayout();
    if (!layout) return;
    if (!layout.update || typeof layout.update !== "object") layout.update = {};
    Object.assign(layout.update, patch);
    try {
      this.options.saveLayout();
    } catch (_) {
    }
  }

  async configureProxy() {
    if (this.proxyConfigured) return;
    this.proxyConfigured = true;
    const proxy = process.env.NARUTO_UPDATE_PROXY;
    if (!proxy) return;
    try {
      await this.netSession.setProxy({ proxyRules: proxy });
    } catch (error) {
      this.log("checkFailed", { code: "network", detail: error && error.message ? error.message : String(error) });
    }
  }

  requestBuffer(url, limit, timeoutMs, generation) {
    return new Promise((resolve, reject) => {
      let settled = false;
      let redirects = 0;
      let total = 0;
      let request;
      let timer;
      const finish = (error, value) => {
        if (settled) return;
        settled = true;
        if (timer) clearTimeout(timer);
        this.currentRequest = null;
        if (error) reject(error);
        else resolve(value);
      };
      const fail = (code, detail) => finish(updateError(code, detail));
      if (!this.allowedUrl(url)) return fail("asset_mismatch", "url-not-allowed");
      timer = setTimeout(() => {
        try { if (request) request.abort(); } catch (_) {}
        fail("network", "timeout");
      }, timeoutMs);
      try {
        request = net.request({
          url,
          method: "GET",
          session: this.netSession,
          redirect: "manual",
          useSessionCookies: false
        });
      } catch (error) {
        return fail("network", error && error.message ? error.message : String(error));
      }
      this.currentRequest = request;
      request.on("redirect", (statusCode, method, redirectUrl) => {
        if (generation !== this.generation) return fail("cancelled", "stale");
        redirects += 1;
        if (redirects > REDIRECT_LIMIT) return fail("asset_mismatch", "too-many-redirects");
        if (!this.allowedUrl(redirectUrl)) return fail("asset_mismatch", "redirect-not-allowed");
        try {
          request.followRedirect();
        } catch (error) {
          fail("network", error && error.message ? error.message : String(error));
        }
      });
      request.on("response", (response) => {
        const status = response.statusCode;
        if (status !== 200) return fail("http_status", "http-" + status);
        const chunks = [];
        response.on("data", (chunk) => {
          if (generation !== this.generation) return;
          const data = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
          total += data.length;
          if (total > limit) {
            try { request.abort(); } catch (_) {}
            return fail("size_exceeded", "manifest-too-large");
          }
          chunks.push(data);
        });
        response.on("end", () => {
          if (generation !== this.generation) return fail("cancelled", "stale");
          finish(null, { body: Buffer.concat(chunks), headers: response.headers, statusCode: status });
        });
        response.on("error", (error) => fail("network", error && error.message ? error.message : "stream"));
      });
      request.on("error", (error) => fail("network", error && error.message ? error.message : String(error)));
      request.end();
    });
  }

  async fetchManifest(generation) {
    let response;
    try {
      response = await this.requestBuffer(this.config.feedUrl, MAX_MANIFEST_BYTES, MANIFEST_TIMEOUT_MS, generation);
    } catch (error) {
      if (error && error.code) throw error;
      throw updateError("network", error && error.message ? error.message : String(error));
    }
    let manifest;
    try {
      manifest = JSON.parse(response.body.toString("utf8").replace(/^﻿/, ""));
    } catch (error) {
      throw updateError("manifest_invalid", "json");
    }
    return this.validateManifest(manifest);
  }

  validateManifest(manifest) {
    if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) throw updateError("manifest_invalid", "object");
    if (manifest.schema !== 1) throw updateError("schema", "schema-" + String(manifest.schema));
    const version = parseVersion(manifest.version);
    if (!version) throw updateError("manifest_invalid", "version");
    const minVersion = manifest.minVersion === undefined ? [0, 0, 0] : parseVersion(manifest.minVersion);
    if (!minVersion) throw updateError("manifest_invalid", "minVersion");
    if (typeof manifest.url !== "string" || !this.allowedUrl(manifest.url)) throw updateError("asset_mismatch", "url");
    let url;
    try {
      url = new URL(manifest.url);
    } catch (_) {
      throw updateError("asset_mismatch", "url-parse");
    }
    const assetName = typeof manifest.assetName === "string" ? manifest.assetName : "";
    if (!/^[A-Za-z0-9._-]+\.zip$/.test(assetName)) throw updateError("asset_mismatch", "asset-name");
    const lastSegment = decodeURIComponent(url.pathname.split("/").pop() || "");
    if (lastSegment !== assetName) throw updateError("asset_mismatch", "asset-name-mismatch");
    if (!Number.isInteger(manifest.size) || manifest.size <= 0 || manifest.size > MAX_ASSET_BYTES) {
      throw updateError("size_exceeded", "declared-size");
    }
    if (typeof manifest.sha256 !== "string" || !/^[a-fA-F0-9]{64}$/.test(manifest.sha256)) {
      throw updateError("manifest_invalid", "sha256");
    }
    const notes = typeof manifest.notes === "string" ? manifest.notes.slice(0, 4000) : "";
    const publishedAt = typeof manifest.publishedAt === "string" ? manifest.publishedAt.slice(0, 64) : "";
    return {
      schema: 1,
      version: version.join("."),
      minVersion: minVersion.join("."),
      assetName,
      url: manifest.url,
      size: manifest.size,
      sha256: manifest.sha256.toLowerCase(),
      notes,
      publishedAt,
      patchesIncluded: manifest.patchesIncluded === true
    };
  }

  check(input) {
    const manual = !!(input && input.manual === true);
    if (this.checkPromise) return this.checkPromise;
    this.checkPromise = this.doCheck(manual).finally(() => {
      this.checkPromise = null;
    });
    return this.checkPromise;
  }

  async doCheck(manual) {
    if (this.config.enabled === false) {
      this.log("checkSkipped", { reason: "disabled" });
      if (manual) {
        this.state.phase = "error";
        this.state.errorCode = "manifest_invalid";
        this.state.errorDetail = "feed-disabled";
        this.emit();
      }
      return this.snapshot();
    }
    this.generation += 1;
    const generation = this.generation;
    this.state.phase = "checking";
    this.state.errorCode = "";
    this.state.errorDetail = "";
    this.emit();
    this.log("checkStart", { current: app.getVersion(), manual: String(manual) });
    try {
      await this.configureProxy();
      const manifest = await this.fetchManifest(generation);
      if (generation !== this.generation) return this.snapshot();
      this.manifest = manifest;
      this.state.latestVersion = manifest.version;
      this.state.minVersion = manifest.minVersion;
      this.state.notes = manifest.notes;
      this.state.publishedAt = manifest.publishedAt;
      this.state.size = manifest.size;
      this.state.assetName = manifest.assetName;
      this.state.progress = { received: 0, total: manifest.size, percent: 0 };
      this.state.hasDownload = false;
      const current = parseVersion(app.getVersion());
      if (!current) throw updateError("unsupported_version", "current");
      const latest = parseVersion(manifest.version);
      const minimum = parseVersion(manifest.minVersion);
      if (compareVersions(current, minimum) < 0) {
        this.state.phase = "blocked";
        this.state.lastResult = "blocked";
      } else if (compareVersions(latest, current) <= 0) {
        this.state.phase = "up-to-date";
        this.state.lastResult = "up-to-date";
      } else {
        this.state.phase = "available";
        this.state.lastResult = "available";
      }
      this.state.lastCheckedAt = Date.now();
      this.state.consecutiveFailures = 0;
      this.persist({
        lastCheckedAt: this.state.lastCheckedAt,
        lastResult: this.state.lastResult,
        lastVersion: manifest.version,
        consecutiveFailures: 0
      });
      this.log("manifestLoaded", {
        version: manifest.version,
        asset: manifest.assetName,
        size: manifest.size
      });
      this.log("checkOk", { current: app.getVersion(), latest: manifest.version });
    } catch (error) {
      const code = error && error.code ? error.code : "network";
      const detail = error && error.message ? error.message : String(error);
      this.state.lastCheckedAt = Date.now();
      this.state.lastResult = "error";
      this.state.consecutiveFailures = Math.min(99, this.state.consecutiveFailures + 1);
      this.state.errorCode = code;
      this.state.errorDetail = detail;
      this.state.phase = manual ? "error" : (this.manifest && this.state.hasDownload ? "ready" : "idle");
      this.persist({
        lastCheckedAt: this.state.lastCheckedAt,
        lastResult: "error",
        consecutiveFailures: this.state.consecutiveFailures
      });
      this.log("checkFailed", { code, detail });
      this.log("manifestInvalid", { detail });
    }
    if (generation === this.generation) this.emit();
    return this.snapshot();
  }

  requestToFile(url, file, manifest, generation) {
    return new Promise((resolve, reject) => {
      let settled = false;
      let redirects = 0;
      let received = 0;
      let idleTimer;
      let totalTimer;
      let request;
      let stream;
      const hash = crypto.createHash("sha256");
      const finish = (error, value) => {
        if (settled) return;
        settled = true;
        if (idleTimer) clearTimeout(idleTimer);
        if (totalTimer) clearTimeout(totalTimer);
        this.currentRequest = null;
        this.currentStream = null;
        this.currentPart = null;
        if (error) {
          try { if (stream) stream.destroy(); } catch (_) {}
          removeFile(file);
          reject(error);
        } else {
          resolve(value);
        }
      };
      const fail = (code, detail) => finish(updateError(code, detail));
      if (!this.allowedUrl(url)) return fail("asset_mismatch", "url-not-allowed");
      try {
        fs.mkdirSync(path.dirname(file), { recursive: true });
        stream = fs.createWriteStream(file, { flags: "w" });
      } catch (error) {
        return fail("io", error && error.message ? error.message : String(error));
      }
      this.currentStream = stream;
      this.currentPart = file;
      const resetIdle = () => {
        if (idleTimer) clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
          try { if (request) request.abort(); } catch (_) {}
          fail("network", "idle-timeout");
        }, DOWNLOAD_IDLE_TIMEOUT_MS);
      };
      resetIdle();
      totalTimer = setTimeout(() => {
        try { if (request) request.abort(); } catch (_) {}
        fail("network", "total-timeout");
      }, DOWNLOAD_TOTAL_TIMEOUT_MS);
      try {
        request = net.request({
          url,
          method: "GET",
          session: this.netSession,
          redirect: "manual",
          useSessionCookies: false
        });
      } catch (error) {
        return fail("network", error && error.message ? error.message : String(error));
      }
      this.currentRequest = request;
      request.on("redirect", (statusCode, method, redirectUrl) => {
        if (generation !== this.generation) return fail("cancelled", "stale");
        redirects += 1;
        if (redirects > REDIRECT_LIMIT) return fail("asset_mismatch", "too-many-redirects");
        if (!this.allowedUrl(redirectUrl)) return fail("asset_mismatch", "redirect-not-allowed");
        try {
          request.followRedirect();
        } catch (error) {
          fail("network", error && error.message ? error.message : String(error));
        }
      });
      request.on("response", (response) => {
        if (response.statusCode !== 200) return fail("http_status", "http-" + response.statusCode);
        const declared = Number(headerValue(response.headers, "content-length"));
        if (Number.isFinite(declared) && declared > 0 && declared !== manifest.size) {
          return fail("size_exceeded", "content-length-mismatch");
        }
        response.on("data", (chunk) => {
          if (generation !== this.generation) return;
          resetIdle();
          const data = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
          received += data.length;
          if (received > manifest.size || received > MAX_ASSET_BYTES) {
            try { request.abort(); } catch (_) {}
            return fail("size_exceeded", "download-too-large");
          }
          hash.update(data);
          const percent = manifest.size ? Math.min(100, Math.floor(received * 100 / manifest.size)) : 0;
          const now = Date.now();
          this.state.progress = { received, total: manifest.size, percent };
          if (now - this.lastProgressAt >= 100 || percent === 100) {
            this.lastProgressAt = now;
            this.emitProgress();
          }
          if (!stream.write(data)) {
            try { response.pause(); } catch (_) {}
            stream.once("drain", () => {
              try { response.resume(); } catch (_) {}
            });
          }
        });
        response.on("end", () => {
          if (generation !== this.generation) return fail("cancelled", "stale");
          stream.end(() => {
            if (received !== manifest.size) return fail("size_exceeded", "actual-size-mismatch");
            const actual = hash.digest("hex");
            if (actual !== manifest.sha256) return fail("hash_mismatch", actual);
            finish(null, { received, sha256: actual });
          });
        });
        response.on("error", (error) => fail("network", error && error.message ? error.message : "stream"));
      });
      request.on("error", (error) => fail("network", error && error.message ? error.message : String(error)));
      request.end();
    });
  }

  async download() {
    if (!this.manifest) return this.check({ manual: true });
    if (this.state.phase !== "available" && this.state.phase !== "error") return this.snapshot();
    const manifest = this.manifest;
    this.generation += 1;
    const generation = this.generation;
    const directory = path.join(this.updatesRoot, manifest.version);
    const finalPath = path.join(directory, manifest.assetName);
    const partPath = finalPath + ".part";
    removeFile(partPath);
    this.state.phase = "downloading";
    this.state.errorCode = "";
    this.state.errorDetail = "";
    this.state.progress = { received: 0, total: manifest.size, percent: 0 };
    this.emit();
    this.log("downloadStart", { version: manifest.version, asset: manifest.assetName });
    try {
      await this.configureProxy();
      await this.requestToFile(manifest.url, partPath, manifest, generation);
      if (generation !== this.generation) return this.snapshot();
      this.state.phase = "verifying";
      this.emit();
      const actual = await hashFile(partPath);
      if (generation !== this.generation) {
        removeFile(partPath);
        return this.snapshot();
      }
      if (actual !== manifest.sha256) throw updateError("hash_mismatch", actual);
      fs.renameSync(partPath, finalPath);
      this.state.phase = "ready";
      this.state.hasDownload = true;
      this.state.progress = { received: manifest.size, total: manifest.size, percent: 100 };
      this.state.lastResult = "ready";
      this.persist({ lastResult: "ready", lastVersion: manifest.version });
      this.log("downloadOk", { version: manifest.version, sha256: actual });
    } catch (error) {
      if (generation !== this.generation) return this.snapshot();
      const code = error && error.code ? error.code : "network";
      this.state.phase = "error";
      this.state.errorCode = code;
      this.state.errorDetail = error && error.message ? error.message : String(error);
      this.state.hasDownload = false;
      removeFile(partPath);
      this.log("downloadFailed", { code, detail: this.state.errorDetail });
    }
    this.emit();
    return this.snapshot();
  }

  cancel() {
    if (this.state.phase !== "downloading" && this.state.phase !== "verifying") return this.snapshot();
    this.generation += 1;
    try { if (this.currentRequest) this.currentRequest.abort(); } catch (_) {}
    try { if (this.currentStream) this.currentStream.destroy(); } catch (_) {}
    if (this.currentPart) removeFile(this.currentPart);
    this.state.phase = this.manifest ? "available" : "idle";
    this.state.progress = { received: 0, total: this.manifest ? this.manifest.size : 0, percent: 0 };
    this.state.errorCode = "";
    this.state.errorDetail = "";
    this.log("downloadCancelled", { version: this.manifest ? this.manifest.version : "" });
    this.emit();
    return this.snapshot();
  }

  async install() {
    if (this.state.phase !== "ready" || !this.manifest) throw updateError("install_failed", "not-ready");
    if (!app.isPackaged) throw updateError("unsupported_layout", "not-packaged");
    if (path.resolve(app.getAppPath()) !== path.resolve(this.appDir)) throw updateError("unsupported_layout", "app-path");
    const version = this.manifest.version;
    const archivePath = path.join(this.updatesRoot, version, this.manifest.assetName);
    if (!fs.existsSync(archivePath)) throw updateError("install_failed", "archive-missing");
    const probe = path.join(this.installRoot, ".naruto-update-write-test-" + process.pid);
    try {
      fs.writeFileSync(probe, "", { mode: 384 });
      fs.unlinkSync(probe);
    } catch (error) {
      throw updateError("permission", error && error.message ? error.message : String(error));
    }
    const win = this.options.getWindow();
    if (!win || win.isDestroyed()) throw updateError("unsupported_layout", "no-window");
    const jobDirectory = path.join(this.updatesRoot, version);
    const jobPath = path.join(jobDirectory, "install-job.json");
    const helperSource = path.join(this.root, "scripts", "update-helper.ps1");
    if (!fs.existsSync(helperSource)) throw updateError("spawn_failed", "helper-missing");
    const helperDirectory = path.join(jobDirectory, "helper");
    fs.mkdirSync(helperDirectory, { recursive: true });
    const helperPath = path.join(helperDirectory, "Update-Naruto-Windows.ps1");
    fs.copyFileSync(helperSource, helperPath);
    const job = {
      schema: 1,
      version,
      pid: process.pid,
      createdAt: new Date().toISOString(),
      installRoot: this.installRoot,
      appDir: this.appDir,
      patchesDir: path.join(this.installRoot, "patches"),
      zipPath: archivePath,
      sha256: this.manifest.sha256,
      size: this.manifest.size,
      updatesRoot: this.updatesRoot,
      backupRoot: this.backupRoot,
      resultPath: this.resultPath,
      pendingPath: this.pendingPath,
      logPath: this.logPath,
      messagesPath: path.join(this.root, "config", "messages.json"),
      exePath: process.execPath,
      patchesIncluded: this.manifest.patchesIncluded === true
    };
    try {
      writeJsonAtomic(jobPath, job);
      writeJsonAtomic(this.pendingPath, { version, createdAt: job.createdAt, jobPath });
    } catch (error) {
      throw updateError("io", error && error.message ? error.message : String(error));
    }
    const hasGames = !!(this.options.hasGameSessions && this.options.hasGameSessions());
    const detail = hasGames ? this.t("installConfirmGameDetail") : this.t("installConfirmDetail");
    const choice = await dialog.showMessageBox(win, {
      type: "question",
      title: this.t("installConfirmTitle"),
      message: this.t("installConfirmMessage", { version }),
      detail,
      buttons: [this.t("installConfirmButton"), this.t("installLaterButton")],
      defaultId: 1,
      cancelId: 1,
      noLink: true
    });
    if (!choice || choice.response !== 0) {
      removeFile(this.pendingPath);
      this.log("installCancel", { version });
      return { scheduled: false };
    }
    let child;
    try {
      child = spawn("powershell.exe", [
        "-NoLogo",
        "-NoProfile",
        "-NonInteractive",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        helperPath,
        "-JobPath",
        jobPath
      ], { detached: true, stdio: "ignore", windowsHide: true });
      await new Promise((resolve, reject) => {
        child.once("error", reject);
        child.once("spawn", resolve);
      });
      child.unref();
    } catch (error) {
      removeFile(this.pendingPath);
      this.log("installSpawnFailed", { detail: error && error.message ? error.message : String(error) });
      throw updateError("spawn_failed", error && error.message ? error.message : String(error));
    }
    this.state.phase = "installing";
    this.state.installResult = null;
    this.persist({ lastResult: "installing", lastVersion: version });
    this.log("installStart", { version, pid: process.pid });
    this.log("installPending", { version });
    this.emit();
    setTimeout(() => {
      try {
        this.options.requestQuit();
      } catch (_) {
      }
    }, 250);
    return { scheduled: true };
  }

  consumeInstallResult() {
    let result = null;
    if (fs.existsSync(this.resultPath)) {
      try {
        result = readJson(this.resultPath);
      } catch (_) {
        result = { ok: false, code: "install_failed", detail: "result-unreadable" };
      }
      try {
        removeFile(this.resultPath + ".last");
        fs.renameSync(this.resultPath, this.resultPath + ".last");
      } catch (_) {
      }
    }
    if (result && result.ok === true) {
      this.state.installResult = { type: "success", version: String(result.version || "") };
      this.state.phase = "idle";
      this.state.lastResult = "ok";
      this.log("resultOk", { version: result.version || "" });
      removeFile(this.pendingPath);
      try {
        this.options.report(this.t("updatedDetail", { version: result.version || "" }));
      } catch (_) {
      }
      this.emit();
      return;
    }
    if (result && result.ok === false) {
      this.state.installResult = { type: "failed", code: String(result.code || "install_failed") };
      this.state.phase = "error";
      this.state.errorCode = String(result.code || "install_failed");
      this.state.errorDetail = String(result.detail || "");
      this.log("resultFailed", { code: this.state.errorCode, detail: this.state.errorDetail });
      removeFile(this.pendingPath);
      this.emit();
      return;
    }
    if (fs.existsSync(this.pendingPath)) {
      this.state.installResult = { type: "failed", code: "install_failed" };
      this.state.phase = "error";
      this.state.errorCode = "install_failed";
      this.state.errorDetail = "pending-without-result";
      this.log("resultFailed", { code: "install_failed", detail: "pending-without-result" });
      removeFile(this.pendingPath);
      this.emit();
    }
  }

  async openPage() {
    if (!this.allowedUrl(this.config.openPageUrl)) throw updateError("asset_mismatch", "open-page");
    await shell.openExternal(this.config.openPageUrl);
    return true;
  }

  scheduleAutoCheck() {
    if (process.env.NARUTO_TEST_MODE === "1" && process.env.NARUTO_UPDATE_TEST !== "1") return;
    if (this.autoTimer) return;
    this.autoTimer = setTimeout(() => {
      void this.autoCheck();
      this.autoInterval = setInterval(() => void this.autoCheck(), AUTO_CHECK_INTERVAL_MS);
      this.autoInterval.unref();
    }, AUTO_CHECK_DELAY_MS);
    this.autoTimer.unref();
  }

  async autoCheck() {
    const layout = this.getLayout();
    if (!app.isPackaged) return;
    if (!layout || !layout.preferences || layout.preferences.updateAutoCheck === false) {
      this.log("checkSkipped", { reason: "disabled" });
      return;
    }
    if (["checking", "downloading", "verifying", "ready", "installing"].includes(this.state.phase)) return;
    const lastCheckedAt = Number(layout.update && layout.update.lastCheckedAt) || 0;
    if (lastCheckedAt && Date.now() - lastCheckedAt < AUTO_CHECK_MIN_GAP_MS) return;
    if (lastCheckedAt > Date.now() + 5 * 60 * 1000) {
      this.persist({ lastCheckedAt: 0 });
    }
    await this.check({ manual: false });
  }

  shutdown() {
    if (this.state.phase === "installing") return;
    if (this.autoTimer) clearTimeout(this.autoTimer);
    if (this.autoInterval) clearInterval(this.autoInterval);
    this.autoTimer = null;
    this.autoInterval = null;
    if (this.state.phase === "downloading" || this.state.phase === "verifying") {
      this.generation += 1;
      try { if (this.currentRequest) this.currentRequest.abort(); } catch (_) {}
      try { if (this.currentStream) this.currentStream.destroy(); } catch (_) {}
      if (this.currentPart) removeFile(this.currentPart);
    }
  }
}

module.exports = { UpdateService, parseVersion, compareVersions };
