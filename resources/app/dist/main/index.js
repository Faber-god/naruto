"use strict";
const patchService = require("./patch-service.js");
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/shared/model.ts
var ENTRY_URL, REGIONS, validRegion, CHROME_HEIGHT, SAVE_PROMPT_HEIGHT, RECOVERY_PROMPT_HEIGHT;
var init_model = __esm({
  "src/shared/model.ts"() {
    "use strict";
    ENTRY_URL = "https://naruto.narutowebgame.com/pt/";
    REGIONS = {
      br: { label: "\u5DF4\u897F\u670D", url: ENTRY_URL },
      cn: { label: "\u56FD\u670D", url: "https://huoying.qq.com/server/website/" }
    };
    validRegion = (value) => value === "br" || value === "cn";
    CHROME_HEIGHT = 42;
    SAVE_PROMPT_HEIGHT = 44;
    RECOVERY_PROMPT_HEIGHT = 44;
  }
});

// src/shared/appearance.ts
function validTheme(value) {
  return value === "system" || value === "light" || value === "dark";
}
function validTitleColor(value) {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
}
var init_appearance = __esm({
  "src/shared/appearance.ts"() {
    "use strict";
  }
});

// src/main/config.ts
function defaultLayout() {
  return { version: 1, tabs: [], activeId: null, preferences: { muted: false, flash: "34", theme: "system", titleBarColor: null, region: "br", lobbyBackground: null, lobbyMotion: true }, bounds: { width: 1280, height: 850 }, maximized: false, fullscreen: false };
}
function normalizeLayout(raw) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i;
  if (!raw || typeof raw !== "object" || raw.version !== 1) return defaultLayout();
  const value = raw;
  const seen = /* @__PURE__ */ new Set();
  const tabs = Array.isArray(value.tabs) ? value.tabs.filter((tab) => tab && typeof tab.id === "string" && /^[a-f0-9]{24}$/.test(tab.id) && !seen.has(tab.id) && !!seen.add(tab.id)).map((tab) => {
    const region = validRegion(tab.region) ? tab.region : "br";
    return {
      id: tab.id,
      name: typeof tab.name === "string" ? tab.name.trim().slice(0, 40) : "",
      region,
      ...typeof tab.profileId === "string" && tab.profileId.startsWith(`${region}-`) && /^(br|cn)-[1-9]\d*$/.test(tab.profileId) ? { profileId: tab.profileId } : {}
    };
  }) : [];
  const bounds = value.bounds;
  return {
    version: 1,
    tabs,
    activeId: value.activeId === null ? null : tabs.some((t) => t.id === value.activeId) ? value.activeId : (_b = (_a = tabs[0]) == null ? void 0 : _a.id) != null ? _b : null,
    preferences: {
      muted: ((_c = value.preferences) == null ? void 0 : _c.muted) === true,
      flash: ((_d = value.preferences) == null ? void 0 : _d.flash) === "31" ? "31" : "34",
      theme: validTheme((_e = value.preferences) == null ? void 0 : _e.theme) ? value.preferences.theme : "system",
      titleBarColor: validTitleColor((_f = value.preferences) == null ? void 0 : _f.titleBarColor) ? value.preferences.titleBarColor.toLowerCase() : null,
      region: validRegion((_g = value.preferences) == null ? void 0 : _g.region) ? value.preferences.region : "br",
      lobbyBackground: validTitleColor((_h = value.preferences) == null ? void 0 : _h.lobbyBackground) ? value.preferences.lobbyBackground.toLowerCase() : null,
      lobbyMotion: ((_i = value.preferences) == null ? void 0 : _i.lobbyMotion) !== false
    },
    bounds: {
      width: Math.round(Math.max(800, Math.min(3840, Number(bounds == null ? void 0 : bounds.width) || 1280))),
      height: Math.round(Math.max(560, Math.min(2160, Number(bounds == null ? void 0 : bounds.height) || 850))),
      ...Number.isFinite(bounds == null ? void 0 : bounds.x) && Number.isFinite(bounds == null ? void 0 : bounds.y) ? { x: Math.round(bounds.x), y: Math.round(bounds.y) } : {}
    },
    maximized: value.maximized === true,
    fullscreen: value.fullscreen === true
  };
}
var import_fs, import_path, import_crypto, newTab, ConfigStore;
var init_config = __esm({
  "src/main/config.ts"() {
    "use strict";
    import_fs = __toESM(require("fs"));
    import_path = __toESM(require("path"));
    import_crypto = __toESM(require("crypto"));
    init_model();
    init_appearance();
    newTab = (region = "br") => ({ id: import_crypto.default.randomBytes(12).toString("hex"), name: "", region });
    ConfigStore = class {
      constructor(directory) {
        import_fs.default.mkdirSync(directory, { recursive: true, mode: 448 });
        this.file = import_path.default.join(directory, "layout.json");
      }
      read() {
        try {
          return normalizeLayout(JSON.parse(import_fs.default.readFileSync(this.file, "utf8")));
        } catch {
          return defaultLayout();
        }
      }
      write(layout2) {
        const temporary = this.file + ".tmp";
        import_fs.default.writeFileSync(temporary, JSON.stringify(layout2, null, 2), { mode: 384 });
        import_fs.default.renameSync(temporary, this.file);
      }
    };
  }
});

// src/main/policy.ts
function webURL(value) {
  try {
    const url = new URL(value);
    return /^https?:$/.test(url.protocol) && !url.username && !url.password ? url : null;
  } catch {
    return null;
  }
}
function internalURL(value) {
  const url = webURL(value);
  if (!url) return false;
  return internalHosts.includes(url.hostname) || gameServerHost.test(url.hostname);
}
function credentialOrigin(value) {
  const url = webURL(value);
  return (url == null ? void 0 : url.protocol) === "https:" && internalURL(value) ? url.origin : null;
}
function manualCredentialSite(id) {
  var _a;
  return typeof id === "string" ? (_a = manualCredentialSites.find((site) => site.id === id)) != null ? _a : null : null;
}
function manualCredentialSiteForOrigin(origin2) {
  var _a;
  return typeof origin2 === "string" ? (_a = manualCredentialSites.find((site) => site.origin === origin2)) != null ? _a : null : null;
}
function manualCredentialSiteOptions() {
  return manualCredentialSites.map(({ id, label }) => ({ id, label }));
}
function credentialStorageOrigin(value) {
  return credentialOrigin(value) === value || manualCredentialSiteForOrigin(value) !== null;
}
function savePromptDestination(origin2, value) {
  const target = webURL(value);
  if (!target || target.protocol !== "https:") return false;
  if (credentialOrigin(value) === origin2) return true;
  return ["https://naruto.narutowebgame.com", "https://naruto.oasgames.com"].includes(origin2) && !target.port && gameServerHost.test(target.hostname);
}
var internalHosts, gameServerHost, manualCredentialSites;
var init_policy = __esm({
  "src/main/policy.ts"() {
    "use strict";
    init_model();
    internalHosts = ["naruto.narutowebgame.com", "naruto.oasgames.com", "passport.oasgames.com", "passport.narutowebgame.com"];
    gameServerHost = /^(?:s\d+-naruto(?:pt|br)?|naruto-(?:pt|br)(?:-s?\d+)?)\.oasgames\.com$/;
    manualCredentialSites = [
      { id: "br", label: "\u5DF4\u897F\u670D", origin: new URL(REGIONS.br.url).origin },
      { id: "cn", label: "\u56FD\u670D", origin: new URL(REGIONS.cn.url).origin }
    ];
  }
});

// src/main/windows-vault.ts
var windows_vault_exports = {};
__export(windows_vault_exports, {
  windowsVaultTransport: () => windowsVaultTransport
});
function windowsVaultTransport(service) {
  if (!/^(cn\.youye\.naruto-os\.(credentials|sessions)|cn\.youye\.naruto-os\.test\.[a-zA-Z0-9.-]+)$/.test(service))
    throw new Error("\u65E0\u6CD5\u8BBF\u95EE\u94A5\u5319\u4E32\uFF0C\u8BF7\u68C0\u67E5\u7CFB\u7EDF\u6388\u6743\u540E\u91CD\u8BD5");
  return (action, value) => new Promise((resolve, reject) => {
    if (action === "list-partitions" && service !== "cn.youye.naruto-os.sessions" && !service.startsWith("cn.youye.naruto-os.test.sessions.")) {
      reject(new Error("\u65E0\u6CD5\u8BBF\u95EE\u94A5\u5319\u4E32\uFF0C\u8BF7\u68C0\u67E5\u7CFB\u7EDF\u6388\u6743\u540E\u91CD\u8BD5"));
      return;
    }
    const { app: app5 } = require("electron");
    const script = import_path3.default.resolve(__dirname, "../../scripts/windows-vault.ps1");
    const child = (0, import_child_process.spawn)("powershell.exe", [
      "-NoLogo",
      "-NoProfile",
      "-NonInteractive",
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      script,
      "-Root",
      app5.getPath("userData"),
      "-Service",
      service
    ], { stdio: ["pipe", "pipe", "ignore"], windowsHide: true });
    let output = "";
    child.stdout.setEncoding("utf8");
    const timeout = setTimeout(() => {
      child.kill();
      reject(new Error("\u94A5\u5319\u4E32\u54CD\u5E94\u8D85\u65F6\uFF0C\u8BF7\u91CD\u8BD5"));
    }, 6e4);
    child.stdout.on("data", (bytes) => {
      output += bytes;
    });
    child.on("error", () => {
      clearTimeout(timeout);
      reject(new Error("\u65E0\u6CD5\u542F\u52A8\u94A5\u5319\u4E32\u7EC4\u4EF6\uFF0C\u8BF7\u5148\u68C0\u67E5\u7CFB\u7EDF PowerShell"));
    });
    child.on("close", () => {
      var _a;
      clearTimeout(timeout);
      try {
        const response = JSON.parse(output);
        if (response.ok) resolve((_a = response.value) != null ? _a : "");
        else reject(new Error("\u65E0\u6CD5\u8BBF\u95EE\u94A5\u5319\u4E32\uFF0C\u8BF7\u68C0\u67E5\u7CFB\u7EDF\u6388\u6743\u540E\u91CD\u8BD5"));
      } catch {
        reject(new Error("\u65E0\u6CD5\u8BBF\u95EE\u94A5\u5319\u4E32\uFF0C\u8BF7\u68C0\u67E5\u7CFB\u7EDF\u6388\u6743\u540E\u91CD\u8BD5"));
      }
    });
    child.stdin.on("error", () => {
    });
    child.stdin.end(JSON.stringify({ action, value }));
  });
}
var import_child_process, import_path3;
var init_windows_vault = __esm({
  "src/main/windows-vault.ts"() {
    "use strict";
    import_child_process = require("child_process");
    import_path3 = __toESM(require("path"));
  }
});

// scripts/webkit-handoff.cjs
var require_webkit_handoff = __commonJS({
  "scripts/webkit-handoff.cjs"(exports2, module2) {
    "use strict";
    var { spawn: spawn3 } = require("child_process");
    var { URL: URL2 } = require("url");
    var gameHost = /^(?:s\d+-naruto(?:pt|br)?|naruto-(?:pt|br)(?:-s?\d+)?)\.oasgames\.com$/;
    var authHosts = ["oasgames.com", "narutowebgame.com", "naruto.narutowebgame.com", "naruto.oasgames.com", "passport.oasgames.com", "passport.narutowebgame.com"];
    var allowedDomain3 = (value) => typeof value === "string" && (authHosts.includes(value.replace(/^\./, "")) || gameHost.test(value.replace(/^\./, "")));
    function validateHandoff4(event, fixture2) {
      if (!event || event.type !== "handoff" || typeof event.url !== "string" || event.url.length > 16384) throw new Error("invalid-handoff");
      const url = new URL2(event.url);
      const local = fixture2 && new URL2(fixture2);
      const targetOK = local ? url.origin === local.origin && url.pathname === "/game" : url.protocol === "https:" && !url.port && gameHost.test(url.hostname);
      if (!targetOK || url.username || url.password || !Array.isArray(event.cookies) || event.cookies.length > 256) throw new Error("invalid-target");
      const cookies = cookieDetails3(event.cookies, fixture2, url.hostname);
      return { url: url.href, cookies };
    }
    function cookieDetails3(records, fixture2, targetHost) {
      const local = fixture2 && new URL2(fixture2);
      if (!Array.isArray(records) || records.length > 256) throw new Error("invalid-cookie-list");
      return records.map((record) => {
        if (!record || typeof record.domain !== "string" || typeof record.name !== "string" || typeof record.value !== "string" || !record.name || record.name.length > 256 || record.value.length > 8192 || typeof record.path !== "string" || !record.path.startsWith("/") || record.path.length > 2048 || /[\x00-\x20\x7f;]/.test(record.name) || /[\r\n\0]/.test(record.value)) throw new Error("invalid-cookie");
        const domain = record.domain.replace(/^\./, "");
        const allowed = local ? domain === "127.0.0.1" : targetHost ? authHosts.includes(domain) || domain === targetHost : allowedDomain3(record.domain);
        if (!allowed || !["secure", "httpOnly", "hostOnly", "session"].every((key) => typeof record[key] === "boolean") || record.hostOnly !== !record.domain.startsWith(".")) throw new Error("invalid-cookie-domain");
        const cookie = {
          url: `${record.secure ? "https" : "http"}://${domain}${local ? ":" + local.port : ""}${record.path}`,
          name: record.name,
          value: record.value,
          path: record.path,
          secure: record.secure,
          httpOnly: record.httpOnly
        };
        if (!record.hostOnly) cookie.domain = record.domain;
        if (!record.session) {
          if (!Number.isFinite(record.expirationDate)) throw new Error("invalid-cookie-expiry");
          cookie.expirationDate = record.expirationDate;
        } else if (record.expirationDate !== void 0) throw new Error("invalid-cookie-expiry");
        if (record.sameSite !== void 0) {
          if (!["lax", "strict", "none"].includes(record.sameSite)) throw new Error("invalid-cookie-samesite");
          cookie.sameSite = record.sameSite === "none" ? "no_restriction" : record.sameSite;
        }
        return cookie;
      });
    }
    function startLogin(binary, { fixture: fixture2, visible = true, production = false, initialCookies, onSnapshot = async () => {
    }, onReady = () => {
    }, onBlocked = () => {
    }, timeout = 9e5 } = {}) {
      var _a;
      const sessionMode = initialCookies !== void 0;
      const args = ["--bridge"];
      if (visible) args.push("--visible");
      if (fixture2) args.push("--fixture-url", fixture2);
      if (production) args.push("--production");
      if (sessionMode) args.push("--session");
      const child = spawn3(binary, args, { stdio: [sessionMode ? "pipe" : "ignore", "pipe", "ignore"] });
      child.stdout.setEncoding("utf8");
      (_a = child.stdin) == null ? void 0 : _a.on("error", () => {
      });
      const send = (value) => {
        var _a2;
        if ((_a2 = child.stdin) == null ? void 0 : _a2.writable) child.stdin.write(JSON.stringify(value) + "\n");
      };
      const stopChild = () => new Promise((resolve) => {
        var _a2;
        if (child.exitCode !== null || child.signalCode !== null) {
          resolve();
          return;
        }
        const force = setTimeout(() => child.kill("SIGKILL"), 1500);
        child.once("close", () => {
          clearTimeout(force);
          resolve();
        });
        (_a2 = child.stdin) == null ? void 0 : _a2.end();
        child.kill("SIGTERM");
      });
      if (sessionMode) send({ type: "seed", cookies: initialCookies });
      let stop, settled = false, buffer = "", cancellation = false, cancelTimer;
      const result = new Promise((resolve, reject) => {
        const finish = (error, value, records) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          clearTimeout(cancelTimer);
          child.stdout.removeAllListeners("data");
          let details2;
          try {
            if (records !== void 0) details2 = cookieDetails3(records, fixture2);
          } catch {
            void stopChild().then(() => reject(new Error("invalid-snapshot")));
            return;
          }
          Promise.resolve().then(() => details2 === void 0 ? void 0 : onSnapshot(details2)).then(() => {
            return stopChild().then(() => {
              if (error) reject(error);
              else resolve(value);
            });
          }, () => stopChild().then(() => reject(new Error("snapshot-failed"))));
        };
        stop = () => {
          if (settled || cancellation) return;
          cancellation = true;
          if (!sessionMode) {
            finish(new Error("cancelled"));
            return;
          }
          send({ type: "close" });
          cancelTimer = setTimeout(() => finish(new Error("cancelled")), 4e3);
        };
        const timer = setTimeout(() => finish(new Error("timeout")), timeout);
        child.on("error", () => finish(new Error("native-launch-failed")));
        child.on("close", () => finish(new Error("native-closed")));
        child.stdout.on("data", (chunk) => {
          var _a2;
          buffer += chunk.toString("utf8");
          if (Buffer.byteLength(buffer) > 1048576) {
            finish(new Error("native-response-too-large"));
            return;
          }
          let index;
          while (!settled && (index = buffer.indexOf("\n")) !== -1) {
            const line = buffer.slice(0, index);
            buffer = buffer.slice(index + 1);
            let event;
            try {
              event = JSON.parse(line);
            } catch {
              finish(new Error("native-invalid-response"));
              return;
            }
            if (event.type === "result") {
              if ((_a2 = event.result) == null ? void 0 : _a2.ok) onReady();
              else finish(new Error("login-page-unavailable"));
            } else if (event.type === "handoff") {
              try {
                const value = validateHandoff4(event, fixture2);
                if (sessionMode && !Array.isArray(event.sessionCookies)) throw new Error("missing-snapshot");
                finish(cancellation ? new Error("cancelled") : null, value, sessionMode ? event.sessionCookies : void 0);
              } catch {
                finish(new Error("invalid-handoff"));
              }
            } else if (event.type === "blocked" && event.code === "game-source") onBlocked();
            else if (event.type === "cancelled") finish(new Error("cancelled"), void 0, sessionMode ? event.cookies : void 0);
            else if (event.type === "error") finish(new Error("native-failed"));
          }
        });
      });
      return { result, cancel: () => stop(), focus: () => send({ type: "focus" }), child };
    }
    module2.exports = { validateHandoff: validateHandoff4, cookieDetails: cookieDetails3, allowedDomain: allowedDomain3, startLogin };
  }
});

// src/main/br-session-recovery.js
var require_br_session_recovery = __commonJS({
  "src/main/br-session-recovery.js"(exports2, module2) {
    "use strict";
    var fs7 = require("fs");
    var path11 = require("path");
    var https = require("https");
    var zlib = require("zlib");
    var { spawn: spawn3 } = require("child_process");
    var PORTAL_HOST = "naruto.narutowebgame.com";
    var PORTAL_PATH = "/pt/serverlist/s";
    var PORTAL_QUERY = "leftbar_collapse=yes&logintype=4&landing_position=new_gamebox_v3.";
    var COOKIE_SUFFIXES = ["narutowebgame.com", "oasgames.com"];
    var SKIP_INJECTION = /* @__PURE__ */ new Set(["imsdk_param_login"]);
    var CHROMIUM_EPOCH_OFFSET_SECONDS = 11644473600;
    var GAME_HOST_RE = /^(?:s[1-9][0-9]*-naruto(?:pt|br)?|naruto-(?:pt|br)(?:-s?[1-9][0-9]*)?)\.oasgames\.com$/i;
    var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";
    function codeError(code) {
      const error = new Error(code);
      error.code = code;
      return error;
    }
    function validServerId(value) {
      const sid = Number(value);
      if (!Number.isSafeInteger(sid) || sid < 1 || sid > 99999) throw codeError("INVALID_SERVER_ID");
      return sid;
    }
    function safeAccountName(value) {
      return typeof value === "string" && value.length > 0 && value.length <= 128 && value !== "." && value !== ".." && !/[\\/\u0000-\u001f\u007f]/.test(value);
    }
    function normalizeDomain(value) {
      if (typeof value !== "string") return "";
      let host = value.toLowerCase();
      if (host.charAt(0) === ".") host = host.slice(1);
      if (!host || host.length > 253) return "";
      const labels = host.split(".");
      for (let i = 0; i < labels.length; i += 1) {
        if (!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(labels[i])) return "";
      }
      return host;
    }
    function domainMatches(host, domain) {
      const h = normalizeDomain(host);
      const d = normalizeDomain(domain);
      return !!(h && d && (h === d || h.slice(-(d.length + 1)) === "." + d));
    }
    function allowedCookieDomain(host) {
      return COOKIE_SUFFIXES.some(function(suffix) {
        return domainMatches(host, suffix);
      });
    }
    function validCookieName(value) {
      return typeof value === "string" && /^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/.test(value);
    }
    function validCookieValue(value) {
      return typeof value === "string" && !/[\u0000-\u0020\u007f;,\\"]/.test(value);
    }
    function pathMatches(cookiePath, requestPath) {
      const cp = typeof cookiePath === "string" && cookiePath.charAt(0) === "/" ? cookiePath : "/";
      const rp = requestPath || "/";
      if (rp === cp) return true;
      if (rp.indexOf(cp) !== 0) return false;
      return cp.charAt(cp.length - 1) === "/" || rp.charAt(cp.length) === "/";
    }
    function cookieApplies(cookie, destination, nowMs) {
      let url;
      try {
        url = new URL(destination);
      } catch (_) {
        return false;
      }
      if (url.protocol !== "https:" || !cookie || typeof cookie !== "object") return false;
      const rawHost = cookie.host || cookie.domain || "";
      const domain = normalizeDomain(rawHost);
      if (!domain || !allowedCookieDomain(domain)) return false;
      const hostOnly = cookie.hostOnly === void 0 ? rawHost.charAt(0) !== "." : !!cookie.hostOnly;
      if (hostOnly ? url.hostname.toLowerCase() !== domain : !domainMatches(url.hostname, domain)) return false;
      if (cookie.secure && url.protocol !== "https:") return false;
      const now = typeof nowMs === "number" ? nowMs : Date.now();
      if (cookie.expiresAt && cookie.expiresAt * 1e3 <= now) return false;
      if (!pathMatches(cookie.path || "/", url.pathname || "/")) return false;
      return true;
    }
    function cookieHeader(cookies, destination) {
      const pairs = [];
      const seen = /* @__PURE__ */ new Set();
      (cookies || []).forEach(function(cookie) {
        if (!cookieApplies(cookie, destination)) return;
        if (!validCookieName(cookie.name) || !validCookieValue(cookie.value)) return;
        const key = [cookie.host, cookie.path || "/", cookie.name].join("|");
        if (seen.has(key)) return;
        seen.add(key);
        pairs.push(cookie.name + "=" + cookie.value);
      });
      return pairs.join("; ");
    }
    function defaultProfileRoot(env) {
      const source = env || process.env;
      if (!source.APPDATA) throw codeError("APPDATA_NOT_SET");
      return path11.join(source.APPDATA, "Naruto Online", "Browers", "Cache");
    }
    function listAccounts(root2) {
      const profileRoot = root2 || defaultProfileRoot();
      let entries;
      try {
        entries = fs7.readdirSync(profileRoot, { withFileTypes: true });
      } catch (_) {
        return [];
      }
      return entries.filter(function(entry) {
        if (!entry.isDirectory() || !safeAccountName(entry.name)) return false;
        try {
          return fs7.statSync(path11.join(profileRoot, entry.name, "Cookies")).isFile();
        } catch (_) {
          return false;
        }
      }).map(function(entry) {
        const dbPath = path11.join(profileRoot, entry.name, "Cookies");
        const stat = fs7.statSync(dbPath);
        return { account: entry.name, dbPath, mtimeMs: stat.mtimeMs, size: stat.size };
      }).sort(function(a, b) {
        return b.mtimeMs - a.mtimeMs;
      });
    }
    function readBrConfig(userDataDirectory, profileId2) {
      if (!/^(br)-[1-9][0-9]*$/.test(String(profileId2 || ""))) return null;
      const file = path11.join(userDataDirectory, "br-session-recovery.json");
      let raw;
      try {
        raw = JSON.parse(fs7.readFileSync(file, "utf8"));
      } catch (_) {
        return null;
      }
      if (!raw || raw.version !== 1 || !raw.profiles || typeof raw.profiles !== "object" || Array.isArray(raw.profiles)) return null;
      const entry = raw.profiles[profileId2];
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) return null;
      let serverId;
      try {
        serverId = validServerId(entry.serverId);
      } catch (_) {
        return null;
      }
      if (entry.officialAccount !== void 0 && !safeAccountName(entry.officialAccount)) return null;
      if (entry.profileRoot !== void 0 && (typeof entry.profileRoot !== "string" || !entry.profileRoot.trim())) return null;
      return {
        serverId,
        officialAccount: entry.officialAccount || "",
        profileRoot: entry.profileRoot ? path11.resolve(entry.profileRoot) : ""
      };
    }
    function parseRows(rows) {
      const now = Date.now();
      const sameSiteMap = { 0: "None", 1: "Lax", 2: "Strict" };
      const cookies = [];
      let encryptedCount = 0;
      let skippedCount = 0;
      (Array.isArray(rows) ? rows : []).forEach(function(row) {
        const host = String(row.host_key || "");
        if (!allowedCookieDomain(host)) return;
        const value = typeof row.value === "string" ? row.value : "";
        if (!value) {
          if (Number(row.encrypted_len || 0) > 0) encryptedCount += 1;
          skippedCount += 1;
          return;
        }
        if (!validCookieName(row.name || "") || !validCookieValue(value)) {
          skippedCount += 1;
          return;
        }
        let expiresAt = null;
        if (Number(row.has_expires || 0)) {
          const micros = Number(row.expires_utc || 0);
          if (Number.isFinite(micros) && micros > 0) {
            const seconds = micros / 1e6 - CHROMIUM_EPOCH_OFFSET_SECONDS;
            if (seconds > 0) expiresAt = seconds;
          }
        }
        if (expiresAt && expiresAt * 1e3 <= now) {
          skippedCount += 1;
          return;
        }
        const sameSiteKey = row.samesite === null || row.samesite === void 0 ? -1 : Number(row.samesite);
        cookies.push({
          host,
          hostOnly: host.charAt(0) !== ".",
          name: String(row.name),
          value,
          path: typeof row.path === "string" && row.path.charAt(0) === "/" ? row.path : "/",
          secure: !!Number(row.is_secure || 0),
          httpOnly: !!Number(row.is_httponly || 0),
          sameSite: Object.prototype.hasOwnProperty.call(sameSiteMap, sameSiteKey) ? sameSiteMap[sameSiteKey] : void 0,
          expiresAt
        });
      });
      return { cookies, encryptedCount, skippedCount };
    }
    function readCookies(dbPath, helperPath, timeoutMs) {
      return new Promise(function(resolve, reject) {
        try {
          const wal = dbPath + "-wal";
          if (fs7.existsSync(wal) && fs7.statSync(wal).size > 32) {
            reject(codeError("COOKIE_DB_WAL_NOT_CHECKPOINTED"));
            return;
          }
        } catch (error) {
          reject(codeError("COOKIE_DB_STAT_FAILED"));
          return;
        }
        const args = [
          "-NoLogo",
          "-NoProfile",
          "-NonInteractive",
          "-ExecutionPolicy",
          "Bypass",
          "-File",
          helperPath,
          "-Database",
          dbPath
        ];
        let child;
        try {
          child = spawn3("powershell.exe", args, { stdio: ["ignore", "pipe", "ignore"], windowsHide: true });
        } catch (_) {
          reject(codeError("POWERSHELL_UNAVAILABLE"));
          return;
        }
        let output = "";
        let settled = false;
        const finish = function(error, value) {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          if (error) reject(error);
          else resolve(value);
        };
        const timer = setTimeout(function() {
          try {
            child.kill();
          } catch (_) {
          }
          finish(codeError("COOKIE_DB_READ_TIMEOUT"));
        }, Number(timeoutMs) > 0 ? Number(timeoutMs) : 15e3);
        child.stdout.setEncoding("utf8");
        child.stdout.on("data", function(chunk) {
          output += chunk;
          if (Buffer.byteLength(output, "utf8") > 2 * 1024 * 1024) {
            try {
              child.kill();
            } catch (_) {
            }
            finish(codeError("COOKIE_DB_OUTPUT_TOO_LARGE"));
          }
        });
        child.on("error", function() {
          finish(codeError("POWERSHELL_UNAVAILABLE"));
        });
        child.on("close", function(code) {
          if (settled) return;
          if (code !== 0) {
            finish(codeError("COOKIE_DB_READ_FAILED"));
            return;
          }
          try {
            const parsed = JSON.parse(output.trim() || "[]");
            const rows = Array.isArray(parsed) ? parsed : parsed ? [parsed] : [];
            finish(null, parseRows(rows));
          } catch (_) {
            finish(codeError("COOKIE_DB_INVALID_OUTPUT"));
          }
        });
      });
    }
    function serverListUrl(serverId) {
      const sid = validServerId(serverId);
      return "https://" + PORTAL_HOST + PORTAL_PATH + sid + "?" + PORTAL_QUERY;
    }
    function decodeBody(headers, raw) {
      const encoding = String(headers["content-encoding"] || "").toLowerCase();
      if (encoding.indexOf("gzip") !== -1) return zlib.gunzipSync(raw).toString("utf8");
      if (encoding.indexOf("deflate") !== -1) {
        try {
          return zlib.inflateSync(raw).toString("utf8");
        } catch (_) {
          return zlib.inflateRawSync(raw).toString("utf8");
        }
      }
      return raw.toString("utf8");
    }
    function serverIdFromHost(hostname) {
      let match = /^s([1-9][0-9]*)-naruto(?:pt|br)?\.oasgames\.com$/i.exec(hostname);
      if (!match) match = /^naruto-(?:pt|br)-s?([1-9][0-9]*)\.oasgames\.com$/i.exec(hostname);
      return match ? match[1] : null;
    }
    function validateServerBoundEntry(value, expectedServerId, portalBound) {
      try {
        const sid = String(validServerId(expectedServerId));
        if (typeof value !== "string" || value.length > 16384 || /[\u0000-\u0020\u007f]/.test(value)) return null;
        const url = new URL(value);
        if (url.protocol !== "https:" || url.username || url.password || url.port || url.hash || !GAME_HOST_RE.test(url.hostname) || url.pathname !== "/main.html") return null;
        const hostSid = serverIdFromHost(url.hostname);
        if (hostSid && hostSid !== sid) return null;
        const signs = url.searchParams.getAll("sign");
        const serverIds = url.searchParams.getAll("server_id");
        if (signs.length !== 1 || !signs[0] || signs[0].length > 2048) return null;
        if (serverIds.length > 1) return null;
        if (serverIds.length === 1 && serverIds[0] !== sid) return null;
        if (!hostSid && serverIds.length !== 1 && portalBound !== true) return null;
        return url.href;
      } catch (_) {
        return null;
      }
    }
    function extractLaunchUrl(html, serverId) {
      if (typeof html !== "string" || !html) return null;
      const normalized = html.replace(/&amp;/g, "&");
      const re = /https:\/\/[^"'\s<>\\]+/ig;
      let match;
      while ((match = re.exec(normalized)) !== null) {
        const candidate = match[0].replace(/[),;]+$/, "");
        const valid = validateServerBoundEntry(candidate, serverId, true);
        if (valid) return valid;
      }
      return null;
    }
    function requestPortal(cookies, serverId, options) {
      const opts = options || {};
      const url = serverListUrl(serverId);
      const cookie = cookieHeader(cookies, url);
      if (!cookie) return Promise.resolve({ ok: false, stage: "portal", reason: "no_portal_cookies" });
      return new Promise(function(resolve) {
        let request;
        let settled = false;
        const finish = function(value) {
          if (settled) return;
          settled = true;
          resolve(value);
        };
        const headers = {
          "User-Agent": opts.userAgent || UA,
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
          "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8,zh-CN;q=0.7,zh;q=0.6",
          "Accept-Encoding": "gzip, deflate",
          "Cache-Control": "max-age=0",
          "Upgrade-Insecure-Requests": "1",
          "sec-ch-ua": '"Chromium";v="140", "Not=A?Brand";v="24"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "document",
          "sec-fetch-mode": "navigate",
          "sec-fetch-site": "none",
          "sec-fetch-user": "?1",
          "Referer": "https://" + PORTAL_HOST + "/"
        };
        headers.Cookie = cookie;
        const maxBytes = Number(opts.maxBytes) > 0 ? Number(opts.maxBytes) : 8 * 1024 * 1024;
        try {
          request = https.request({
            protocol: "https:",
            hostname: PORTAL_HOST,
            method: "GET",
            path: new URL(url).pathname + new URL(url).search,
            headers,
            timeout: Number(opts.timeoutMs) > 0 ? Number(opts.timeoutMs) : 2e4,
            rejectUnauthorized: true
          }, function(response) {
            const chunks = [];
            let total = 0;
            response.on("data", function(chunk) {
              total += chunk.length;
              if (total > maxBytes) {
                request.destroy(codeError("PORTAL_RESPONSE_TOO_LARGE"));
                return;
              }
              chunks.push(chunk);
            });
            response.on("end", function() {
              const status = Number(response.statusCode || 0);
              if (status >= 300 && status < 400) {
                finish({ ok: false, stage: "portal", reason: "portal_redirect_rejected", status });
                return;
              }
              let html;
              try {
                html = decodeBody(response.headers, Buffer.concat(chunks));
              } catch (_) {
                finish({ ok: false, stage: "portal", reason: "portal_decode_failed", status });
                return;
              }
              const low = html.slice(0, 2e4).toLowerCase();
              if (status === 403 || status === 429 || ["cloudflare", "attention required", "just a moment", "you have been blocked"].some(function(m) {
                return low.indexOf(m) !== -1;
              })) {
                finish({ ok: false, stage: "portal", reason: "portal_blocked", status });
                return;
              }
              if (["user_password", "passport.oasgames.com", 'id="loginform"', 'name="user_email"'].some(function(m) {
                return low.indexOf(m) !== -1;
              })) {
                finish({ ok: false, stage: "portal", reason: "session_expired", status });
                return;
              }
              if (status < 200 || status >= 300) {
                finish({ ok: false, stage: "portal", reason: "portal_http_error", status });
                return;
              }
              const launchUrl = extractLaunchUrl(html, serverId);
              if (!launchUrl) {
                finish({ ok: false, stage: "extract", reason: "br_signed_entry_not_found", status });
                return;
              }
              finish({ ok: true, stage: "portal", launchUrl, status });
            });
          });
        } catch (_) {
          finish({ ok: false, stage: "portal", reason: "portal_request_failed" });
          return;
        }
        request.on("timeout", function() {
          request.destroy(codeError("PORTAL_TIMEOUT"));
        });
        request.on("error", function(error) {
          const code = error && error.code === "PORTAL_RESPONSE_TOO_LARGE" ? "portal_response_too_large" : error && error.code === "PORTAL_TIMEOUT" ? "portal_timeout" : "portal_request_failed";
          finish({ ok: false, stage: "portal", reason: code });
        });
        request.end();
      });
    }
    function requestPortalViaCurlImpersonate(cookies, serverId, options) {
      const opts = options || {};
      const url = serverListUrl(serverId);
      const cookie = cookieHeader(cookies, url);
      if (!cookie) return Promise.resolve({ ok: false, stage: "portal", reason: "no_portal_cookies" });
      const path8 = require("path");
      const fs8 = require("fs");
      const exe = opts.curlImpersonatePath || path8.join(__dirname, "../../bin/curl-impersonate/curl-impersonate.exe");
      if (!fs8.existsSync(exe)) return Promise.resolve({ ok: false, stage: "portal", reason: "curl_impersonate_missing" });
      const target = opts.curlImpersonateTarget || "chrome131";
      return new Promise(function(resolve) {
        let settled = false;
        const finish = function(value) {
          if (settled) return;
          settled = true;
          resolve(value);
        };
        const args = [
          "--impersonate", target,
          "-sS", "--max-time", "25",
          "-H", "cookie: " + cookie,
          "-H", "referer: https://" + PORTAL_HOST + "/",
          "-w", "\n%{http_code}",
          url
        ];
        try {
          require("child_process").execFile(exe, args, {
            timeout: (opts.timeoutMs || 9e4),
            maxBuffer: 8 * 1024 * 1024,
            windowsHide: true
          }, function(error, stdout) {
            if (error) {
              const code = String((error && (error.code || error.signal)) || "spawn").replace(/[^a-zA-Z0-9_]/g, "_");
              finish({ ok: false, stage: "portal", reason: "curl_impersonate_failed_" + code.slice(0, 24) });
              return;
            }
            const text = String(stdout || "");
            const cut = text.lastIndexOf("\n");
            if (cut < 0) {
              finish({ ok: false, stage: "portal", reason: "curl_impersonate_invalid_output" });
              return;
            }
            const status = parseInt(text.slice(cut + 1), 10) || 0;
            const html = text.slice(0, cut);
            if (status >= 400) {
              finish({ ok: false, stage: "portal", reason: status === 403 ? "portal_blocked" : "portal_http_error", status });
              return;
            }
            if (status >= 300) {
              finish({ ok: false, stage: "portal", reason: "portal_redirect_rejected", status });
              return;
            }
            const launchUrl2 = extractLaunchUrl(html, serverId);
            if (!launchUrl2) {
              finish({ ok: false, stage: "portal", reason: "portal_decode_failed", status });
              return;
            }
            finish({ ok: true, stage: "portal", launchUrl: launchUrl2, status });
          });
        } catch (error) {
          finish({ ok: false, stage: "portal", reason: "curl_impersonate_failed" });
        }
      });
    }

    function requestPortalViaEdge(cookies, serverId, helperPath, options) {
      const opts = options || {};
      const url = serverListUrl(serverId);
      if (!cookieHeader(cookies, url)) return Promise.resolve({ ok: false, stage: "portal", reason: "no_portal_cookies" });
      return new Promise(function(resolve) {
        let child;
        try {
          child = spawn3("powershell.exe", [
            "-NoLogo",
            "-NoProfile",
            "-NonInteractive",
            "-ExecutionPolicy",
            "Bypass",
            "-File",
            helperPath
          ], { stdio: ["pipe", "pipe", "ignore"], windowsHide: true });
        } catch (_) {
          resolve({ ok: false, stage: "portal", reason: "portal_helper_unavailable" });
          return;
        }
        let output = "";
        let settled = false;
        const killTree = function() {
          try {
            spawn3("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore", windowsHide: true });
          } catch (_) {
          }
        };
        const finish = function(value) {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          try {
            child.kill();
          } catch (_) {
          }
          resolve(value);
        };
        const timer = setTimeout(function() {
          killTree();
          finish({ ok: false, stage: "portal", reason: "portal_timeout" });
        }, Number(opts.timeoutMs) > 0 ? Number(opts.timeoutMs) : 9e4);
        child.stdout.setEncoding("utf8");
        child.stdout.on("data", function(chunk) {
          output += chunk;
          if (Buffer.byteLength(output, "utf8") > 8 * 1024 * 1024) {
            killTree();
            finish({ ok: false, stage: "portal", reason: "portal_response_too_large" });
          }
        });
        child.on("error", function() {
          finish({ ok: false, stage: "portal", reason: "portal_helper_unavailable" });
        });
        child.on("close", function() {
          if (settled) return;
          let parsed;
          try {
            parsed = JSON.parse((output || "").trim());
          } catch (_) {
            finish({ ok: false, stage: "portal", reason: "portal_helper_invalid_output" });
            return;
          }
          if (!parsed || parsed.ok !== true || typeof parsed.html !== "string") {
            finish({ ok: false, stage: "portal", reason: parsed && parsed.reason || "portal_helper_failed", status: parsed && parsed.status || null });
            return;
          }
          const launchUrl = extractLaunchUrl(parsed.html, serverId);
          if (!launchUrl) {
            finish({ ok: false, stage: "extract", reason: "br_signed_entry_not_found", status: parsed.status || 200 });
            return;
          }
          finish({ ok: true, stage: "portal", launchUrl, status: parsed.status || 200 });
        });
        try {
          child.stdin.write(JSON.stringify({ url, cookies }));
          child.stdin.end();
        } catch (_) {
          finish({ ok: false, stage: "portal", reason: "portal_helper_write_failed" });
        }
      });
    }
    function electronCookieDetails(cookie) {
      const host = normalizeDomain(cookie.host);
      if (!host || !allowedCookieDomain(host) || !validCookieName(cookie.name) || !validCookieValue(cookie.value)) return null;
      const details2 = {
        url: "https://" + host + (cookie.path || "/"),
        name: cookie.name,
        value: cookie.value,
        path: cookie.path || "/",
        secure: !!cookie.secure,
        httpOnly: !!cookie.httpOnly
      };
      if (!cookie.hostOnly) details2.domain = "." + host;
      if (cookie.expiresAt) details2.expirationDate = cookie.expiresAt;
      if (cookie.sameSite === "None" && details2.secure) details2.sameSite = "no_restriction";
      else if (cookie.sameSite === "Lax") details2.sameSite = "lax";
      else if (cookie.sameSite === "Strict") details2.sameSite = "strict";
      return details2;
    }
    var BrSessionRecovery2 = class {
      constructor(options) {
        const opts = options || {};
        this.profileRoot = opts.profileRoot || defaultProfileRoot();
        this.helperPath = opts.helperPath || path11.join(__dirname, "../../scripts/br-cookie-reader.ps1");
        this.portalHelperPath = opts.portalHelperPath || path11.join(__dirname, "../../scripts/br-portal-fetch.ps1");
        this.timeoutMs = opts.timeoutMs || 15e3;
        this.portalTimeoutMs = opts.portalTimeoutMs || 9e4;
        this.portalOptions = opts.portalOptions || {};
      }
      listAccounts() {
        return listAccounts(this.profileRoot);
      }
      async recover(options) {
        const opts = options || {};
        let serverId;
        try {
          serverId = validServerId(opts.serverId);
        } catch (error) {
          return { ok: false, stage: "selection", reason: error.code || "invalid_server_id" };
        }
        const accounts = this.listAccounts();
        let account = opts.account;
        if (!account && accounts.length === 1) account = accounts[0].account;
        if (!safeAccountName(account)) return { ok: false, stage: "selection", reason: "official_account_selection_required" };
        const selected = accounts.find(function(item) {
          return item.account.toLowerCase() === account.toLowerCase();
        });
        if (!selected) return { ok: false, stage: "selection", reason: "exact_official_profile_not_found" };
        if (typeof opts.isCancelled === "function" && opts.isCancelled()) return { ok: false, stage: "cancel", reason: "cancelled" };
        let cookieRead;
        try {
          cookieRead = await readCookies(selected.dbPath, this.helperPath, this.timeoutMs);
        } catch (error) {
          return { ok: false, stage: "cookies", reason: error.code || "cookie_db_read_failed" };
        }
        if (!cookieRead.cookies.length) {
          return {
            ok: false,
            stage: "cookies",
            reason: cookieRead.encryptedCount ? "encrypted_cookie_values_unsupported" : "no_valid_game_cookies",
            encryptedCount: cookieRead.encryptedCount || 0
          };
        }
        let launch = await requestPortalViaCurlImpersonate(cookieRead.cookies, serverId, this.portalOptions);
        const onDiag = typeof opts.onDiag === "function" ? opts.onDiag : function() {};
        if (launch.ok) {
          onDiag("BR_RECOVERY_CURL_IMPERSONATE_OK");
        } else {
          const curlReason = String(launch.reason || "unknown").replace(/[^a-zA-Z0-9_]/g, "_").toUpperCase();
          onDiag("BR_RECOVERY_CURL_" + curlReason.slice(0, 50));
        }
        if (!launch.ok) {
          launch = await requestPortalViaEdge(cookieRead.cookies, serverId, this.portalHelperPath, { timeoutMs: this.portalTimeoutMs });
        }
        if (!launch.ok && (/^portal_helper_/.test(String(launch.reason || "")) || launch.reason === "edge_unavailable" || launch.reason === "portal_timeout")) {
          launch = await requestPortal(cookieRead.cookies, serverId, this.portalOptions);
        }
        if (!launch.ok || validateServerBoundEntry(launch.launchUrl, serverId, true) !== launch.launchUrl) {
          return { ok: false, stage: launch.stage || "portal", reason: launch.reason || "invalid_launch_entry", status: launch.status || null };
        }
        if (typeof opts.isCancelled === "function" && opts.isCancelled()) return { ok: false, stage: "cancel", reason: "cancelled" };
        if (typeof opts.updateCookies !== "function") return { ok: false, stage: "inject", reason: "cookie_session_update_unavailable" };
        let injected = 0;
        let skipped = 0;
        try {
          await opts.updateCookies(async function(ses) {
            const existing = await ses.cookies.get({ name: "imsdk_param_login" });
            for (let i = 0; i < existing.length; i += 1) {
              const old = existing[i];
              const oldHost = normalizeDomain(old.domain || "");
              if (!allowedCookieDomain(oldHost)) continue;
              const oldUrl = "https://" + oldHost + (old.path || "/");
              try {
                await ses.cookies.remove(oldUrl, old.name);
              } catch (_) {
              }
            }
            for (let i = 0; i < cookieRead.cookies.length; i += 1) {
              const cookie = cookieRead.cookies[i];
              if (SKIP_INJECTION.has(String(cookie.name || "").toLowerCase())) {
                skipped += 1;
                continue;
              }
              const details2 = electronCookieDetails(cookie);
              if (!details2) {
                skipped += 1;
                continue;
              }
              try {
                await ses.cookies.set(details2);
                injected += 1;
              } catch (_) {
                skipped += 1;
              }
            }
            if (ses.cookies && typeof ses.cookies.flushStore === "function") await ses.cookies.flushStore();
          });
        } catch (_) {
          return { ok: false, stage: "inject", reason: "electron_cookie_import_failed", injected, skipped };
        }
        if (!injected) return { ok: false, stage: "inject", reason: "no_game_cookies_accepted", skipped };
        if (typeof opts.isCancelled === "function" && opts.isCancelled()) return { ok: false, stage: "cancel", reason: "cancelled" };
        return {
          ok: true,
          stage: "session_restored",
          region: "br",
          language: "pt-BR",
          account,
          serverId,
          cookieCount: cookieRead.cookies.length,
          injected,
          skipped,
          status: launch.status || null,
          launchUrl: launch.launchUrl
        };
      }
    };
    module2.exports = {
      BrSessionRecovery: BrSessionRecovery2,
      readConfig: readBrConfig,
      listAccounts,
      validateServerBoundEntry,
      extractLaunchUrl,
      serverListUrl,
      cookieHeader,
      parseRows,
      electronCookieDetails
    };
  }
});

// src/main/traffic-lights.ts
function measureTrafficLights(window) {
  return controls ? JSON.parse(controls.measure(window.getNativeWindowHandle())) : [];
}
function attachTrafficLights(window) {
  if (!controls) return;
  let immediate = null;
  let transition = null;
  const apply = () => {
    immediate = null;
    if (!window.isDestroyed() && !window.isFullScreen()) controls.apply(window.getNativeWindowHandle());
  };
  const schedule = () => {
    if (immediate) clearImmediate(immediate);
    immediate = setImmediate(apply);
  };
  const settled = () => {
    schedule();
    if (transition) clearTimeout(transition);
    transition = setTimeout(schedule, 100);
  };
  window.on("resize", schedule);
  window.on("show", schedule);
  window.on("focus", schedule);
  window.on("restore", schedule);
  window.on("leave-full-screen", settled);
  import_electron5.nativeTheme.on("updated", settled);
  window.once("closed", () => {
    if (immediate) clearImmediate(immediate);
    if (transition) clearTimeout(transition);
    import_electron5.nativeTheme.removeListener("updated", settled);
  });
  schedule();
}
var import_electron5, import_path7, controls;
var init_traffic_lights = __esm({
  "src/main/traffic-lights.ts"() {
    "use strict";
    import_electron5 = require("electron");
    import_path7 = __toESM(require("path"));
    controls = process.platform === "darwin" ? require(import_path7.default.join(__dirname, "../native/traffic-lights.node")) : void 0;
  }
});

// src/main/windows-smoke.ts
var windows_smoke_exports = {};
__export(windows_smoke_exports, {
  runWindowsSmoke: () => runWindowsSmoke
});
function assert(condition, name, results) {
  results.push({ name, passed: !!condition });
  console.log(`SMOKE_ASSERT ${name}=${condition ? "PASS" : "FAIL"}`);
  if (!condition) throw new Error(`Windows smoke assertion failed: ${name}`);
}
function waitFor(predicate, label, timeout = 4e3) {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const timer = setInterval(() => {
      if (predicate()) {
        clearInterval(timer);
        resolve();
      } else if (Date.now() - started > timeout) {
        clearInterval(timer);
        reject(new Error(`Timed out waiting for ${label}`));
      }
    }, 50);
  });
}
async function runWindowsSmoke(win2, root2, shellURL2, fixture2) {
  const { results, output } = fixture2;
  let failed = false;
  const assertDone = (condition, name) => assert(condition, name, results);
  try {
    const dataDir = import_path8.default.resolve(process.env.NARUTO_DATA_DIR || "");
    const testRoot = import_path8.default.resolve(root2, ".test-artifacts");
    assertDone(process.env.NARUTO_TEST_MODE === "1" && process.env.NARUTO_TEST_WINDOWS_SMOKE === "1", "dual-test-gates");
    assertDone(dataDir.startsWith(testRoot + import_path8.default.sep), "isolated-data-path");
    const files = import_fs4.default.readdirSync(dataDir);
    assertDone(files.every((file) => !/profiles|credentials|sessions/i.test(file)), "no-real-profile-data");
    assertDone(win2.getTitle() === "Naruto OS", "native-window-title");
    assertDone(win2.getBrowserView() === null, "no-game-browser-view");
    assertDone(win2.webContents.getURL() === shellURL2, "local-shell-url");
    assertDone(await win2.webContents.executeJavaScript('document.readyState === "complete" && !!document.querySelector("#surface") && !!document.querySelector("#lobby")'), "renderer-dom-loaded");
    assertDone(await win2.webContents.executeJavaScript("document.documentElement.scrollWidth <= window.innerWidth + 1"), "renderer-content-bounds");
    assertDone(win2.webContents.session === import_electron6.session.defaultSession, "isolated-shell-session");
    const bounds = win2.getBounds();
    win2.minimize();
    await waitFor(() => win2.isMinimized(), "minimize");
    assertDone(win2.isMinimized(), "minimize");
    win2.restore();
    await waitFor(() => !win2.isMinimized(), "restore");
    assertDone(!win2.isMinimized(), "restore");
    win2.maximize();
    await waitFor(() => win2.isMaximized(), "maximize");
    assertDone(win2.isMaximized(), "maximize");
    win2.unmaximize();
    await waitFor(() => !win2.isMaximized(), "unmaximize");
    assertDone(!win2.isMaximized(), "unmaximize");
    win2.setFullScreen(true);
    await waitFor(() => win2.isFullScreen(), "fullscreen");
    assertDone(win2.isFullScreen(), "fullscreen");
    win2.setFullScreen(false);
    await waitFor(() => !win2.isFullScreen(), "fullscreen exit");
    assertDone(!win2.isFullScreen(), "fullscreen-exit");
    const current = win2.getBounds();
    const resized = { ...current, width: current.width + 20, height: current.height + 20 };
    const resizeChanged = new Promise((resolve) => win2.once("resize", () => resolve()));
    win2.setBounds(resized);
    await resizeChanged;
    await waitFor(() => win2.getBounds().width > current.width && win2.getBounds().height > current.height, "resize");
    assertDone(win2.getBounds().width > current.width && win2.getBounds().height > current.height, "resize-window-bounds");
    assertDone(await win2.webContents.executeJavaScript("document.documentElement.clientWidth > 0 && document.documentElement.clientHeight > 0"), "resize-content-bounds");
  } catch (error) {
    failed = true;
    console.error("WINDOWS_SMOKE_FAILURE", error instanceof Error ? error.stack : String(error));
  } finally {
    try {
      import_fs4.default.writeFileSync(output, JSON.stringify({ results, failed }, null, 2));
    } catch (error) {
      console.error("SMOKE_REPORT_WRITE_FAILED", error);
      failed = true;
    }
    win2.close();
    if (failed) process.exitCode = 1;
    import_electron6.app.once("will-quit", () => {
      if (failed) process.exitCode = 1;
    });
  }
}
var import_electron6, import_fs4, import_path8;
var init_windows_smoke = __esm({
  "src/main/windows-smoke.ts"() {
    "use strict";
    import_electron6 = require("electron");
    import_fs4 = __toESM(require("fs"));
    import_path8 = __toESM(require("path"));
  }
});

// src/main/integration.ts
var integration_exports = {};
__export(integration_exports, {
  runIntegration: () => runIntegration
});
async function until(check) {
  for (let i = 0; i < 200; i++) {
    if (check()) return;
    await pause(50);
  }
  throw new Error("integration-state-timeout");
}
async function untilUI(ui, check) {
  for (let i = 0; i < 200; i++) {
    if (await ui(check)) return;
    await pause(50);
  }
  throw new Error("integration-ui-timeout");
}
function captureWithin(capture, timeoutMs) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(void 0), timeoutMs);
    capture.then((value) => {
      clearTimeout(timer);
      resolve(value);
    }, () => {
      clearTimeout(timer);
      resolve(void 0);
    });
  });
}
function swf() {
  const bits = "01110" + [0, 8e3, 0, 4e3].map((v) => v.toString(2).padStart(14, "0")).join("");
  const rect = Buffer.from((bits + "0".repeat((8 - bits.length % 8) % 8)).match(/.{8}/g).map((v) => parseInt(v, 2)));
  const body = Buffer.concat([rect, Buffer.from([0, 24, 1, 0, 67, 2, 100, 129, 90, 64, 0, 0, 0])]);
  const header = Buffer.alloc(8);
  header.write("FWS", 0);
  header[3] = 10;
  header.writeUInt32LE(body.length + 8, 4);
  return Buffer.concat([header, body]);
}
async function install(tab) {
  if (tab.state === "loading") await new Promise((resolve) => tab.view.webContents.once("did-stop-loading", () => resolve()));
  const installed = tab.view.webContents.session.protocol.interceptBufferProtocol("https", (request, callback) => {
    const url = new URL(request.url);
    if (url.pathname === "/fixture.swf") callback({ mimeType: "application/x-shockwave-flash", data: swf() });
    else callback({ mimeType: "text/html", data: Buffer.from(url.pathname === "/pt/fixture-success" ? success : fixture) });
  });
  (0, import_assert.default)(installed, "fixture protocol installed");
  await tab.view.webContents.loadURL(ENTRY_URL);
}
async function recoveryFixtureTab(games2) {
  const partition = `naruto-integration-recovery-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const profile = { partition, session: import_electron7.session.fromPartition(partition), ready: Promise.resolve(), release: () => {
  }, updateCookies: async () => {
  } };
  const tab = games2.create(newTab("br"), ENTRY_URL, profile);
  await install(tab);
  return tab;
}
async function runIntegration(win2, games2, vault2, root2, finish, webLogin2) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s;
  const watchdog = setTimeout(() => {
    console.error("Integration timeout");
    finish(1);
  }, 9e4);
  const directory = process.env.NARUTO_TEST_ARTIFACTS || import_path9.default.join(root2, ".test-artifacts");
  import_fs5.default.mkdirSync(directory, { recursive: true });
  const results = [];
  const skipped = [];
  const diagnostics = {};
  const check = (name, condition) => {
    (0, import_assert.default)(condition, name);
    results.push(name);
    console.log("PASS", name);
  };
  const skip = (name) => {
    skipped.push(name);
    console.log("SKIP", name);
  };
  const ui = (js) => win2.webContents.executeJavaScript(js);
  const chooseProfile = async (id) => {
    await ui('document.getElementById("lobby-current").click()');
    await untilUI(ui, `document.querySelector('#profile-deck [data-id="${id}"]') !== null`);
    await ui(`document.querySelector('#profile-deck [data-id="${id}"]').click()`);
    await untilUI(ui, `window.naruto.state().then(s=>s.selectedProfileId===${JSON.stringify(id)})`);
  };
  const sessionService = `cn.youye.naruto-os.test.sessions.${(0, import_crypto5.createHash)("sha256").update(import_electron7.app.getPath("userData")).digest("hex").slice(0, 16)}`;
  const readSessionSnapshot = () => {
    const response = JSON.parse((0, import_child_process4.execFileSync)(import_path9.default.join(root2, "dist/native/keychain"), [], {
      input: JSON.stringify({ action: "read", service: sessionService }),
      encoding: "utf8"
    }));
    if (!response.ok) throw new Error("Synthetic session snapshot read failed");
    return JSON.parse(response.value || "[]");
  };
  let releaseRecoveryProbe;
  try {
    if (process.env.NARUTO_TEST_HIDDEN !== "1") {
      import_electron7.app.focus({ steal: true });
      win2.focus();
    }
    check("startup creates zero game WebContents before an explicit open", games2.tabs.length === 0 && win2.getBrowserViews().length === 0);
    check("startup has zero game tabs in state and in the visible tab bar", await ui('window.naruto.state().then(s=>s.tabs.length===0 && document.getElementById("tabs").children.length===0)'));
    check("startup shows only launcher home with start button", await ui('!document.getElementById("lobby").hidden && !document.getElementById("open-game").hidden && document.getElementById("new-tab").hidden'));
    await untilUI(ui, 'window.naruto.state().then(s=>s.profileDiscovery==="ready")');
    const initialProfiles = await ui("window.naruto.state()");
    check(
      "startup discovers directory-only and keychain-only legacy slots without creating Sessions",
      initialProfiles.profileDiscovery === "ready" && initialProfiles.profiles.some((profile) => profile.id === "br-7") && initialProfiles.profiles.some((profile) => profile.id === "cn-8") && initialProfiles.tabs.length === 0 && !import_fs5.default.existsSync(import_path9.default.join(import_electron7.app.getPath("userData"), "Partitions", "naruto-br-1"))
    );
    check(
      "home shows the remembered account in the v9 capsule without opening a popup",
      await ui('document.getElementById("lobby-account-name").textContent === "\u5408\u6210\u5DF4\u897F\u8D26\u53F7A" && document.getElementById("profile-deck").hidden && document.getElementById("profile-picker-backdrop").hidden && document.getElementById("open-game").disabled === false')
    );
    await ui('document.getElementById("lobby-current").click()');
    const keyboardOption = await ui(`(()=>{const deck=document.getElementById('profile-deck');deck.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true}));return deck.getAttribute('aria-activedescendant')})()`);
    check("capsule account list supports listbox arrow navigation and stable profile ids", keyboardOption === "lobby-option-br-2" && await ui(`document.querySelector('#profile-deck [data-id="br-2"]').getAttribute('role')==='option'`));
    await ui('document.getElementById("profile-deck").dispatchEvent(new KeyboardEvent("keydown",{key:"Enter",bubbles:true}))');
    await untilUI(ui, 'window.naruto.state().then(s=>s.selectedProfileId==="br-2")');
    check("choosing a capsule account changes only the next launch account", games2.tabs.length === 0 && await ui('document.getElementById("lobby-account-name").textContent === "\u5408\u6210\u5DF4\u897F\u8D26\u53F7B"'));
    await chooseProfile("br-1");
    void webLogin2.open({ id: "c".repeat(24), name: "", region: "br", profileId: "br-1" }, 1);
    await until(() => webLogin2.busy);
    await ui('window.naruto.command({type:"home"})');
    await untilUI(ui, "window.naruto.state().then(s=>!s.activeId)");
    await chooseProfile("br-2");
    await ui('document.getElementById("open-game").click()');
    await pause(50);
    const busyLaunchState = await ui("window.naruto.state()");
    check(
      "busy launch rejection restores the home button and leaves no launch animation behind",
      !busyLaunchState.activeId && busyLaunchState.notice.includes("\u53E6\u4E00\u4E2A\u8D26\u53F7") && games2.tabs.length === 0 && await ui('!document.getElementById("open-game").disabled && !document.getElementById("lobby").classList.contains("leaving")')
    );
    await webLogin2.cancel("restore-original");
    await until(() => !webLogin2.busy);
    await chooseProfile("br-1");
    await ui('window.naruto.command({type:"settings"})');
    await untilUI(ui, "window.naruto.state().then(s=>s.canCreateProfile)");
    await ui('(()=>{const select=document.getElementById("lobby-bg-mode");select.value="#e8bf55";select.dispatchEvent(new Event("change",{bubbles:true}));return true})()');
    await untilUI(ui, 'window.naruto.state().then(s=>s.preferences.lobbyBackground==="#e8bf55")');
    let savedLayout = JSON.parse(import_fs5.default.readFileSync(import_path9.default.join(import_electron7.app.getPath("userData"), "layout.json"), "utf8"));
    check("background preset saves to the existing preferences file", savedLayout.preferences.lobbyBackground === "#e8bf55");
    const rejectedBackground = await ui('window.naruto.command({type:"lobby-background",value:"url(https://invalid.test)"}).then(()=>false,e=>e.message.includes("\u989C\u8272"))');
    check("main process rejects non-hex background values", rejectedBackground && (await ui("window.naruto.state()")).preferences.lobbyBackground === "#e8bf55");
    await ui('(()=>{const select=document.getElementById("lobby-bg-mode");select.value="custom";select.dispatchEvent(new Event("change",{bubbles:true}));const input=document.getElementById("lobby-bg-custom");input.value="#a1b2c3";input.dispatchEvent(new Event("input",{bubbles:true}));input.dispatchEvent(new Event("change",{bubbles:true}));return true})()');
    await untilUI(ui, 'window.naruto.state().then(s=>s.preferences.lobbyBackground==="#a1b2c3")');
    savedLayout = JSON.parse(import_fs5.default.readFileSync(import_path9.default.join(import_electron7.app.getPath("userData"), "layout.json"), "utf8"));
    check("custom background input persists its final selected color", savedLayout.preferences.lobbyBackground === "#a1b2c3");
    await ui('(()=>{const select=document.getElementById("lobby-bg-mode");select.value="theme";select.dispatchEvent(new Event("change",{bubbles:true}));return true})()');
    await untilUI(ui, "window.naruto.state().then(s=>s.preferences.lobbyBackground===null)");
    await ui('(()=>{const select=document.getElementById("lobby-bg-mode");select.value="#e8bf55";select.dispatchEvent(new Event("change",{bubbles:true}));return true})()');
    await untilUI(ui, 'window.naruto.state().then(s=>s.preferences.lobbyBackground==="#e8bf55")');
    await ui('document.getElementById("lobby-motion").click()');
    await untilUI(ui, "window.naruto.state().then(s=>s.preferences.lobbyMotion===false)");
    check("motion preference can be disabled and persisted", JSON.parse(import_fs5.default.readFileSync(import_path9.default.join(import_electron7.app.getPath("userData"), "layout.json"), "utf8")).preferences.lobbyMotion === false);
    const rejectedMotion = await ui('window.naruto.command({type:"lobby-motion",value:"off"}).then(()=>false,e=>e.message.includes("\u52A8\u6001"))');
    check("main process rejects non-boolean motion values", rejectedMotion && (await ui("window.naruto.state()")).preferences.lobbyMotion === false);
    const settingsPreview = await captureWithin(win2.capturePage(), 3e3);
    if (settingsPreview) import_fs5.default.writeFileSync(import_path9.default.join(directory, "lobby-settings-yellow-motion-off.png"), settingsPreview.toPNG());
    await ui('document.getElementById("lobby-motion").click()');
    await untilUI(ui, "window.naruto.state().then(s=>s.preferences.lobbyMotion===true)");
    await ui('(()=>{const select=document.getElementById("lobby-bg-mode");select.value="theme";select.dispatchEvent(new Event("change",{bubbles:true}));return true})()');
    await untilUI(ui, "window.naruto.state().then(s=>s.preferences.lobbyBackground===null)");
    check(
      "unnamed legacy slot warns that its website identity must be checked manually",
      await ui('document.querySelector("#profile-list [data-id=br-7] .profile-detail").textContent === "\u767B\u5F55\u8EAB\u4EFD\u5F85\u81EA\u884C\u786E\u8BA4"')
    );
    await ui('document.querySelector("#profile-list [data-id=br-7] [data-action=edit]").click()');
    await pause(60);
    await ui('document.getElementById("edit-name").value="\u5408\u6210\u547D\u540D\u5386\u53F2\u69FD\u4F4D";document.getElementById("edit-server-note").value="\u5408\u6210\u65E7\u533A\u670D";document.getElementById("edit-form").dispatchEvent(new Event("submit",{bubbles:true,cancelable:true}))');
    await untilUI(ui, 'window.naruto.state().then(s=>s.profiles.some(p=>p.id==="br-7"&&p.name==="\u5408\u6210\u547D\u540D\u5386\u53F2\u69FD\u4F4D"&&p.serverNote==="\u5408\u6210\u65E7\u533A\u670D"))');
    const savedProfiles = JSON.parse(import_fs5.default.readFileSync(import_path9.default.join(import_electron7.app.getPath("userData"), "account-profiles.json"), "utf8"));
    check(
      "editing a discovered history slot persists its name without changing selection or slot",
      savedProfiles.profiles.some((profile) => profile.id === "br-7" && profile.slot === 7 && profile.name === "\u5408\u6210\u547D\u540D\u5386\u53F2\u69FD\u4F4D") && savedProfiles.selectedByRegion.br === "br-1"
    );
    await ui('document.getElementById("profile-create").click()');
    await pause(60);
    await ui(`(()=>{document.getElementById('edit-name').value='\u5408\u6210\u8D26\u53F7C';document.getElementById('edit-server-note').value='\u5408\u6210\u4E09\u533A';document.getElementById('edit-form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));return true})()`);
    await untilUI(ui, 'window.naruto.state().then(s=>s.profiles.some(p=>p.id==="br-8"&&p.name==="\u5408\u6210\u8D26\u53F7C"&&p.serverNote==="\u5408\u6210\u4E09\u533A"))');
    await ui(`document.querySelector('#profile-list [data-id="br-8"] [data-action=edit]').click()`);
    await pause(60);
    await ui(`(()=>{document.getElementById('edit-name').value='\u5408\u6210\u8D26\u53F7C\u6539\u540D';document.getElementById('edit-server-note').value='';document.getElementById('edit-form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));return true})()`);
    await untilUI(ui, 'window.naruto.state().then(s=>s.profiles.some(p=>p.id==="br-8"&&p.name==="\u5408\u6210\u8D26\u53F7C\u6539\u540D"&&p.serverNote===""))');
    await ui('document.getElementById("profile-create").click()');
    await pause(60);
    await ui('document.getElementById("edit-name").value="\u5E94\u53D6\u6D88\u7684\u65B0\u6863\u6848";document.getElementById("edit-server-note").value="\u672A\u4FDD\u5B58";document.getElementById("dialog-cancel").click()');
    await untilUI(ui, 'document.getElementById("dialog-backdrop").hidden');
    const afterCreateCancel = await ui("window.naruto.state()");
    check("cancelling profile creation leaves no saved draft", afterCreateCancel.profiles.length === 6 && afterCreateCancel.selectedProfileId === "br-8");
    await ui('document.querySelector("#profile-list [data-id=br-8] [data-action=edit]").click()');
    await pause(60);
    await ui('document.getElementById("edit-name").value="\u672A\u4FDD\u5B58\u7684\u6539\u540D";document.getElementById("edit-server-note").value="\u672A\u4FDD\u5B58\u7684\u5907\u6CE8";document.getElementById("dialog-cancel").click()');
    await untilUI(ui, 'document.getElementById("dialog-backdrop").hidden');
    const afterEditCancel = await ui("window.naruto.state()");
    const savedC = afterEditCancel.profiles.find((profile) => profile.id === "br-8");
    check("cancelling profile edits preserves saved name and server note", (savedC == null ? void 0 : savedC.name) === "\u5408\u6210\u8D26\u53F7C\u6539\u540D" && savedC.serverNote === "");
    await ui('document.getElementById("close-settings").click()');
    await pause(80);
    await chooseProfile("br-8");
    await untilUI(ui, `document.getElementById('profile-choice-note').hidden`);
    check(
      "profile management creates, renames, and clears a server note through the actual controls",
      (await ui("window.naruto.state()")).selectedProfileId === "br-8" && await ui(`document.getElementById('profile-choice-note').hidden`)
    );
    await chooseProfile("br-2");
    check(
      "selecting an account updates the capsule and informational server note",
      await ui(`document.getElementById('lobby-account-name').textContent==='\u5408\u6210\u5DF4\u897F\u8D26\u53F7B'&&document.getElementById('profile-choice-note').textContent==='\u5E38\u7528\u533A\u670D\uFF1A\u5408\u6210\u4E8C\u533A'`)
    );
    await ui('document.getElementById("open-game").click()');
    await pause(150);
    const syntheticB = games2.tabs.find((tab) => tab.profileId === "br-2");
    if (!(syntheticB == null ? void 0 : syntheticB.profile)) throw new Error("Profile B did not open with an explicit session");
    check("starting the selected home account displays its game surface", !games2.hidden && syntheticB.view.getBounds().height > 0);
    await syntheticB.profile.ready;
    await syntheticB.profile.session.cookies.set({ url: "https://synthetic.example", name: "profile-proof", value: "br-2" });
    await ui('document.getElementById("new-tab").click()');
    await pause(100);
    check(
      "plus picker remains limited to the current region",
      await ui(`(()=>Array.from(document.querySelectorAll('#profile-picker-list .profile-option')).map(e=>e.dataset.id).sort().join(',')==='br-1,br-2,br-7,br-8')()`)
    );
    await ui(`document.querySelector('#profile-picker-list [data-id="br-1"] button:last-child').click()`);
    await pause(150);
    const syntheticA = games2.tabs.find((tab) => tab.profileId === "br-1");
    if (!(syntheticA == null ? void 0 : syntheticA.profile)) throw new Error("Profile A did not open with an explicit session");
    check("opening a profile from the plus picker displays its game surface", !games2.hidden && games2.activeId === syntheticA.id && syntheticA.view.getBounds().height > 0);
    await syntheticA.profile.ready;
    await syntheticA.profile.session.cookies.set({ url: "https://synthetic.example", name: "profile-proof", value: "br-1" });
    check(
      "opening B then A preserves their explicit slots and synthetic Cookie separation",
      syntheticB.profile.partition === "persist:naruto-br-2" && syntheticA.profile.partition === "persist:naruto-br-1" && ((_a = (await syntheticA.profile.session.cookies.get({ url: "https://synthetic.example", name: "profile-proof" }))[0]) == null ? void 0 : _a.value) === "br-1" && ((_b = (await syntheticB.profile.session.cookies.get({ url: "https://synthetic.example", name: "profile-proof" }))[0]) == null ? void 0 : _b.value) === "br-2"
    );
    await ui('document.getElementById("new-tab").click()');
    await pause(100);
    await ui(`document.querySelector('#profile-picker-list [data-id="br-2"] button:last-child').click()`);
    await pause(100);
    check("opening an already open profile focuses its existing visible tab", games2.tabs.length === 2 && games2.activeId === syntheticB.id && !games2.hidden && syntheticB.view.getBounds().height > 0);
    await ui('window.naruto.command({type:"settings"})');
    await untilUI(ui, "window.naruto.state().then(s=>s.settingsOpen)");
    check(
      "delete control is disabled while its profile has an active game tab",
      await ui('document.querySelector("#profile-list [data-id=br-2] [data-action=delete]").disabled')
    );
    const activeDeleteRefused = await ui('window.naruto.command({type:"profile-delete",id:"br-2"}).then(()=>false,e=>e.message.includes("\u7ED3\u675F"))');
    check("main process independently refuses deletion of an active profile", activeDeleteRefused && !((_c = (await ui("window.naruto.state()")).profiles.find((profile) => profile.id === "br-2")) == null ? void 0 : _c.cleanupStatus));
    await ui('document.getElementById("new-tab").click()');
    await pause(100);
    await ui(`document.querySelector('#profile-picker-list [data-id="br-2"] button:last-child').click()`);
    await pause(100);
    check(
      "opening a profile from the plus picker while settings are open closes settings and shows the game",
      !games2.hidden && games2.activeId === syntheticB.id && syntheticB.view.getBounds().height > 0 && await ui('document.getElementById("settings-panel").hidden')
    );
    games2.close(syntheticA.id);
    games2.close(syntheticB.id);
    await pause(700);
    await chooseProfile("br-1");
    await ui('document.getElementById("open-game").click()');
    await pause(150);
    const reopenedA = games2.tabs.find((tab) => tab.profileId === "br-1");
    await ui('document.getElementById("new-tab").click()');
    await pause(100);
    await ui(`document.querySelector('#profile-picker-list [data-id="br-2"] button:last-child').click()`);
    await pause(150);
    const reopenedB = games2.tabs.find((tab) => tab.profileId === "br-2");
    check(
      "opening A then B also preserves the same sessions after closing and reopening",
      games2.tabs.length === 2 && ((_d = reopenedA == null ? void 0 : reopenedA.profile) == null ? void 0 : _d.partition) === "persist:naruto-br-1" && ((_e = reopenedB == null ? void 0 : reopenedB.profile) == null ? void 0 : _e.partition) === "persist:naruto-br-2" && ((_f = (await reopenedA.profile.session.cookies.get({ url: "https://synthetic.example", name: "profile-proof" }))[0]) == null ? void 0 : _f.value) === "br-1" && ((_g = (await reopenedB.profile.session.cookies.get({ url: "https://synthetic.example", name: "profile-proof" }))[0]) == null ? void 0 : _g.value) === "br-2"
    );
    games2.close(reopenedA.id);
    games2.close(reopenedB.id);
    await pause(700);
    await ui('window.naruto.command({type:"settings"})');
    await untilUI(ui, "window.naruto.state().then(s=>s.settingsOpen)");
    await vault2.save(origin, "profile-delete-proof", "synthetic-password-preserved");
    const passwordsBeforeDelete = (await vault2.list()).map(({ id, username }) => [id, username]);
    const snapshotBeforeDelete = readSessionSnapshot();
    check("synthetic deletion target has an isolated Keychain login snapshot", Object.prototype.hasOwnProperty.call(snapshotBeforeDelete.partitions, "persist:naruto-br-7"));
    await ui('document.querySelector("#profile-list [data-id=br-7] [data-action=delete]").click()');
    await pause(80);
    const deletionDescription = await ui('document.getElementById("dialog-description").textContent');
    check(
      "delete confirmation identifies local data and preserves website account and saved passwords",
      deletionDescription.includes("\u5408\u6210\u547D\u540D\u5386\u53F2\u69FD\u4F4D") && deletionDescription.includes("Cookie") && deletionDescription.includes("\u4E0D\u4F1A\u6CE8\u9500\u5B98\u7F51\u8D26\u53F7") && deletionDescription.includes("\u5DF2\u4FDD\u5B58\u7684\u5BC6\u7801\u4F1A\u4FDD\u7559")
    );
    await ui('document.getElementById("dialog-cancel").click()');
    await untilUI(ui, 'document.getElementById("dialog-backdrop").hidden');
    const afterDeleteCancel = await ui("window.naruto.state()");
    check(
      "cancelling deletion leaves the profile and its Keychain snapshot untouched",
      afterDeleteCancel.profiles.some((profile) => profile.id === "br-7") && !((_h = afterDeleteCancel.profiles.find((profile) => profile.id === "br-7")) == null ? void 0 : _h.cleanupStatus) && Object.prototype.hasOwnProperty.call(readSessionSnapshot().partitions, "persist:naruto-br-7")
    );
    await ui('document.querySelector("#profile-list [data-id=br-7] [data-action=delete]").click()');
    await pause(60);
    await ui('document.getElementById("dialog-save").click()');
    await untilUI(ui, 'window.naruto.state().then(s=>!s.profiles.some(p=>p.id==="br-7"))');
    await untilUI(ui, 'document.getElementById("dialog-backdrop").hidden');
    const deletedMetadata = JSON.parse(import_fs5.default.readFileSync(import_path9.default.join(import_electron7.app.getPath("userData"), "account-profiles.json"), "utf8"));
    const snapshotAfterDelete = readSessionSnapshot();
    check(
      "confirmed deletion removes the profile and leaves a tombstone against legacy rediscovery",
      !deletedMetadata.profiles.some((profile) => profile.id === "br-7") && deletedMetadata.deletedIds.includes("br-7") && !deletedMetadata.pendingDeletes.includes("br-7")
    );
    check(
      "confirmed deletion removes only its session snapshot and preserves other profiles",
      !Object.prototype.hasOwnProperty.call(snapshotAfterDelete.partitions, "persist:naruto-br-7") && Object.prototype.hasOwnProperty.call(snapshotAfterDelete.partitions, "persist:naruto-br-2") && Object.prototype.hasOwnProperty.call(snapshotAfterDelete.partitions, "persist:naruto-cn-8")
    );
    await ui('window.naruto.command({type:"profiles-retry"})');
    await untilUI(ui, 'window.naruto.state().then(s=>s.profileDiscovery==="ready")');
    check("rediscovery does not resurrect a deleted directory-only profile", !(await ui("window.naruto.state()")).profiles.some((profile) => profile.id === "br-7"));
    check("profile deletion leaves the independent saved-password vault unchanged", JSON.stringify((await vault2.list()).map(({ id, username }) => [id, username])) === JSON.stringify(passwordsBeforeDelete));
    await vault2.remove((await vault2.list()).find((item) => item.username === "profile-delete-proof").id);
    await ui('document.getElementById("close-settings").click()');
    await pause(80);
    await chooseProfile("br-1");
    await ui('document.getElementById("lobby-region").click()');
    await untilUI(ui, 'window.naruto.state().then(s=>s.preferences.region==="cn")');
    check("changing region on cold home creates no tabs or game WebContents", games2.tabs.length === 0 && win2.getBrowserViews().length === 0 && await ui("window.naruto.state().then(s=>s.tabs.length===0)"));
    await untilUI(ui, 'window.naruto.state().then(s=>s.selectedProfileId==="cn-1" && !document.getElementById("open-game").disabled)');
    check(
      "changing the home region immediately updates its account selector",
      await ui('document.getElementById("lobby-account-name").textContent==="\u5408\u6210\u56FD\u670D\u8D26\u53F7" && !document.getElementById("open-game").disabled')
    );
    await ui('window.naruto.command({type:"region",value:"br"})');
    await ui('document.getElementById("open-game").click()');
    const first = games2.active;
    if (!first) throw new Error("Start button did not create a game tab");
    check("start creates exactly one visible game tab and one guest", games2.tabs.length === 1 && win2.getBrowserViews().length === 1 && !games2.hidden && first.view.getBounds().height > 0);
    if (first.state === "loading") await new Promise((resolve) => first.view.webContents.once("did-stop-loading", () => resolve()));
    const initialGeneration = first.generation;
    await ui('window.naruto.command({type:"home"})');
    await pause(200);
    check("home keeps existing game session alive offscreen", games2.activeId === null && games2.tabs.length === 1 && first.view.getBounds().x < 0);
    check("launcher character loads from bundled local WebP", await ui('document.querySelector(".lobby-character").complete && document.querySelector(".lobby-character").naturalWidth > 0'));
    for (const theme of ["light", "dark"]) {
      await ui(`window.naruto.command({type:"theme",value:"${theme}"})`);
      await pause(100);
      for (const region of ["br", "cn"]) {
        await ui(`window.naruto.command({type:"region",value:"${region}"})`);
        await pause(100);
        check(`region ${region} uses its dedicated local WebP illustration`, await ui(`document.getElementById('lobby-character').getAttribute('src') === 'lobby-art-${region}.webp' && document.getElementById('lobby-character').complete && document.getElementById('lobby-character').naturalWidth>0`));
        for (const [width, height] of [[1280, 850], [800, 560], [1920, 1080], [2560, 1080]]) {
          win2.setContentSize(width, height);
          await pause(150);
          check(`launcher controls stay in the window at ${region} ${theme} ${width}x${height}`, await ui(`(()=>{const button=document.getElementById('open-game'),r=button.getBoundingClientRect(),image=document.querySelector('.lobby-character').getBoundingClientRect(),title=document.getElementById('lobby-title').getBoundingClientRect();return !document.getElementById('lobby').hidden && r.left>=0 && r.right<=innerWidth && r.bottom<innerHeight && image.top>=42 && title.bottom<r.top && document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('button')===button})()`));
          if (theme === "light" && region === "br" && (width === 1280 || width === 1920)) {
            const image = await captureWithin(win2.capturePage(), 3e3);
            if (image) import_fs5.default.writeFileSync(import_path9.default.join(directory, `lobby-${region}-${theme}-${width}x${height}.png`), image.toPNG());
          }
        }
      }
    }
    win2.setContentSize(1280, 850);
    await ui('window.naruto.command({type:"theme",value:"system"})');
    await ui('document.getElementById("region-select").value="cn";document.getElementById("region-select").dispatchEvent(new Event("change"))');
    await pause(150);
    check("region selector changes next launch without navigating existing game", first.generation === initialGeneration && await ui('window.naruto.state().then(s=>s.preferences.region==="cn" && s.tabs[0].region==="br")'));
    await ui('document.getElementById("open-game").click()');
    await pause(250);
    const regionalTab = games2.active;
    check("start button creates a China-labelled isolated tab", (regionalTab == null ? void 0 : regionalTab.region) === "cn" && games2.tabs.length === 2 && regionalTab.view.webContents.session !== first.view.webContents.session);
    if (regionalTab) games2.close(regionalTab.id);
    await ui('window.naruto.command({type:"region",value:"br"})');
    games2.select(first.id);
    first.view.webContents.on("preload-error", (_e2, _file, error) => console.log("PRELOAD_ERROR", error.message));
    await install(first);
    await pause(1200);
    first.state = "failed";
    games2.select(first.id);
    await pause(100);
    check("failed Brazil game offers the unified refresh action", await ui(`(() => {
      const pane = document.getElementById('placeholder'), button = document.getElementById('placeholder-recover');
      const toolbar = document.getElementById('refresh');
      return !pane.hidden && !button.hidden && button.textContent === '\u91CD\u65B0\u8FDB\u5165\u6E38\u620F' && button.getBoundingClientRect().width > 0 && !document.getElementById('recover-game');
    })()`));
    first.state = "ready";
    games2.select(first.id);
    let recovered = [];
    const realRecover = webLogin2.recover;
    const realLoginRefresh = webLogin2.refresh.bind(webLogin2);
    let loginRefreshes = 0;
    webLogin2.recover = async (tab) => {
      recovered.push(tab);
    };
    webLogin2.refresh = () => {
      loginRefreshes++;
    };
    const refreshMenu = (_i = import_electron7.Menu.getApplicationMenu()) == null ? void 0 : _i.getMenuItemById("refresh-current-tab");
    const generationsPreserved = [];
    for (const route of [
      "https://naruto-pt.oasgames.com/main.html?user_name=fixture&server_id=776&time=123&sign=synthetic",
      "https://huoying.qq.com/redirected-error",
      "https://fixture.invalid/403-error"
    ]) {
      await first.view.webContents.loadURL(route);
      first.state = "failed";
      games2.select(first.id);
      const generation = first.generation;
      await ui('document.getElementById("refresh").click()');
      generationsPreserved.push(first.generation === generation);
    }
    check("Brazil signed, redirected-error, and failed pages all use the same fresh-entry route", recovered.length === 3 && recovered.every((tab) => tab === first) && generationsPreserved.every(Boolean));
    check("application menu refresh label and availability match the active Brazil game", (refreshMenu == null ? void 0 : refreshMenu.label) === "\u91CD\u65B0\u8FDB\u5165\u6E38\u620F" && refreshMenu.enabled);
    if (refreshMenu == null ? void 0 : refreshMenu.click) refreshMenu.click(void 0, win2, win2.webContents);
    check("application menu refresh invokes the same Brazil recovery action", recovered.length === 4 && recovered[3] === first);
    await ui('window.naruto.command({type:"settings"})');
    check("settings disables refresh in both toolbar and application menu", (refreshMenu == null ? void 0 : refreshMenu.enabled) === false && await ui('document.getElementById("refresh").disabled'));
    await ui('window.naruto.command({type:"settings"})');
    await ui('window.naruto.command({type:"overlay",shown:true})');
    check("modal editor overlay disables refresh in both toolbar and application menu", (refreshMenu == null ? void 0 : refreshMenu.enabled) === false && await ui('document.getElementById("refresh").disabled'));
    await ui('window.naruto.command({type:"overlay",shown:false})');
    const backgroundGeneration = first.generation;
    games2.select(null);
    check("refresh menu and toolbar disable together on home while background game stays unchanged", (refreshMenu == null ? void 0 : refreshMenu.enabled) === false && await ui('document.getElementById("refresh").disabled') && first.generation === backgroundGeneration);
    games2.select(first.id);
    await first.view.webContents.loadURL(ENTRY_URL);
    if (import_electron7.app.isPackaged) {
      check("actual application bundle runs without development dependencies", import_fs5.default.existsSync(import_path9.default.join(root2, "assets/app-icon.png")) && !import_fs5.default.existsSync(import_path9.default.join(root2, "node_modules")));
      check(
        "packaged game session follows the system proxy route",
        await first.view.webContents.session.resolveProxy(ENTRY_URL) === await import_electron7.session.defaultSession.resolveProxy(ENTRY_URL)
      );
    }
    const nativeControlsMatch = () => measureTrafficLights(win2).every((b, i) => Math.abs(b.circle - 14) < 0.01 && Math.abs(b.x + b.width / 2 - (21 + i * 22)) < 0.01 && Math.abs(b.y + b.height / 2 - 21) < 0.01 && b.nativeHit);
    check("actual shell uses 14pt native window controls", nativeControlsMatch());
    if (process.env.NARUTO_TEST_HIDDEN !== "1") {
      win2.blur();
      await pause(200);
      win2.focus();
      await pause(350);
    }
    check("packaged controls retain centers and hit areas after activation", nativeControlsMatch());
    check("Intel Electron 11 host", process.arch === "x64" && process.versions.electron === "11.5.0");
    check("remote has no Node or shell API", await first.view.webContents.executeJavaScript('typeof require === "undefined" && typeof window.naruto === "undefined" && typeof process === "undefined"'));
    check("sandbox enabled", first.view.webContents.getLastWebPreferences().sandbox === true);
    check("PPAPI Flash registered", await first.view.webContents.executeJavaScript("Array.from(navigator.plugins).some(p=>/Shockwave Flash/.test(p.name))"));
    await vault2.save(origin, "fixture-alpha", "synthetic-password-one");
    await vault2.save(origin, "fixture-beta", "synthetic-password-two");
    check("keychain metadata omits secrets", (await vault2.list(origin)).every((r) => !("password" in r)));
    const second = games2.create(newTab());
    await install(second);
    games2.select(second.id);
    await first.view.webContents.executeJavaScript('document.cookie="naruto_fixture=alpha; path=/; SameSite=Lax"; localStorage.setItem("naruto_fixture","alpha"); window.fixtureTicks=0; setInterval(()=>window.fixtureTicks++,100)');
    check("cookie isolation", await second.view.webContents.executeJavaScript('!document.cookie.includes("naruto_fixture")'));
    check("storage isolation", await second.view.webContents.executeJavaScript('localStorage.getItem("naruto_fixture") === null'));
    await pause(400);
    check("background keeps executing", await first.view.webContents.executeJavaScript("window.fixtureTicks > 1"));
    check("only active audible", first.view.webContents.isAudioMuted() && !second.view.webContents.isAudioMuted());
    games2.muted = true;
    games2.syncAudio();
    check("global mute", games2.tabs.every((t) => t.view.webContents.isAudioMuted()));
    games2.select(first.id);
    check("mute persists on tab switch", games2.tabs.every((t) => t.view.webContents.isAudioMuted()));
    games2.muted = false;
    games2.syncAudio();
    const cancellationIntents = [], cancellationTasks = [];
    const realCancel = webLogin2.cancel.bind(webLogin2);
    webLogin2.cancel = (intent) => {
      cancellationIntents.push(intent);
      const task = realCancel(intent);
      cancellationTasks.push(task);
      return task;
    };
    let probeNumber = 0;
    const pendingRecovery = (replacesTabId, stage = "login", candidateId, profileId2) => {
      let finish2;
      const task = new Promise((resolve) => {
        finish2 = resolve;
      });
      const saved = { id: candidateId != null ? candidateId : String(++probeNumber).padStart(24, "0"), name: "", region: "br", ...profileId2 ? { profileId: profileId2 } : {} };
      const attempt = { saved, task, cancelled: false, replacesTabId, stage, ...candidateId ? { replacementTabId: candidateId } : {} };
      webLogin2.pending = attempt;
      releaseRecoveryProbe = finish2;
      return { id: attempt.saved.id, attempt, finish: finish2, clear: () => {
        if (webLogin2.pending === attempt) delete webLogin2.pending;
      } };
    };
    const pendingLogin = (profileId2) => {
      let finish2;
      const task = new Promise((resolve) => {
        finish2 = resolve;
      });
      const saved = { id: String(++probeNumber).padStart(24, "0"), name: "", region: "br", profileId: profileId2 };
      const attempt = { saved, task, cancelled: false, stage: "login" };
      webLogin2.pending = attempt;
      releaseRecoveryProbe = finish2;
      return { id: saved.id, attempt, finish: finish2, clear: () => {
        if (webLogin2.pending === attempt) delete webLogin2.pending;
      } };
    };
    const settleCancellation = async (attempt, offset2) => {
      attempt.finish();
      await Promise.all(cancellationTasks.slice(offset2));
      attempt.clear();
      cancellationTasks.length = offset2;
      if (releaseRecoveryProbe === attempt.finish) releaseRecoveryProbe = void 0;
    };
    const loginProbe = pendingRecovery(first.id);
    await ui(`window.naruto.command({type:"select",id:${JSON.stringify(loginProbe.id)}})`);
    await pause(100);
    check("refresh switches to the visible WK login page while recovery is in progress", (refreshMenu == null ? void 0 : refreshMenu.label) === "\u5237\u65B0\u767B\u5F55/\u9009\u670D\u9875\u9762" && refreshMenu.enabled && await ui("window.naruto.state().then(s=>s.refresh.enabled)"));
    await ui('document.getElementById("refresh").click()');
    if (refreshMenu == null ? void 0 : refreshMenu.click) refreshMenu.click(void 0, win2, win2.webContents);
    check("toolbar and menu share WK refresh, and the menu binds \u2318R to that same item", loginRefreshes === 2 && (refreshMenu == null ? void 0 : refreshMenu.accelerator) === "CmdOrCtrl+R");
    const loginCancelOffset = cancellationTasks.length;
    await ui(`window.naruto.command({type:"close",id:${JSON.stringify(loginProbe.id)}})`);
    await settleCancellation(loginProbe, loginCancelOffset);
    webLogin2.refresh = realLoginRefresh;
    webLogin2.recover = realRecover;
    games2.select(first.id);
    const ordinary = pendingLogin("br-2");
    const hiddenLoginDeleteRefused = await ui('window.naruto.command({type:"profile-delete",id:"br-2"}).then(()=>false,e=>e.message.includes("\u767B\u5F55/\u6062\u590D\u4EFB\u52A1"))');
    check("main process refuses deletion while the profile has a hidden login task", hiddenLoginDeleteRefused && !((_j = (await ui("window.naruto.state()")).profiles.find((profile) => profile.id === "br-2")) == null ? void 0 : _j.cleanupStatus));
    games2.select(second.id);
    const cancelsBeforeNavigation = cancellationIntents.length;
    await ui(`window.naruto.command({type:"select",id:${JSON.stringify(ordinary.id)}})`);
    check("ordinary login tab becomes the selected foreground page", games2.activeId === null && (await ui("window.naruto.state()")).activeId === ordinary.id);
    await ui(`window.naruto.command({type:"select",id:${JSON.stringify(first.id)}})`);
    check("switching from B login to existing A preserves B and selects A", games2.activeId === first.id && webLogin2.pending === ordinary.attempt && !ordinary.attempt.cancelled && (await ui("window.naruto.state()")).activeId === first.id);
    await ui(`window.naruto.command({type:"select",id:${JSON.stringify(ordinary.id)}})`);
    check("returning to B restores the same pending login tab", games2.activeId === null && webLogin2.pending === ordinary.attempt && (await ui("window.naruto.state()")).activeId === ordinary.id);
    await ui('window.naruto.command({type:"home"})');
    check("home hides ordinary login without cancelling its task", games2.activeId === null && webLogin2.pending === ordinary.attempt && !ordinary.attempt.cancelled && (await ui("window.naruto.state()")).activeId === null);
    await ui(`window.naruto.command({type:"select",id:${JSON.stringify(ordinary.id)}})`);
    await ui('window.naruto.command({type:"new"})');
    await ui('window.naruto.command({type:"profile-open",id:"br-2"})');
    check("opening the already pending B profile focuses the same login task", webLogin2.pending === ordinary.attempt && games2.activeId === null && (await ui("window.naruto.state()")).activeId === ordinary.id);
    await ui('window.naruto.command({type:"new"})');
    await ui('window.naruto.command({type:"profile-open",id:"br-1"})');
    check("an existing A profile remains selectable while B is logging in", games2.activeId === first.id && webLogin2.pending === ordinary.attempt && !ordinary.attempt.cancelled);
    await ui('window.naruto.command({type:"new"})');
    await ui('window.naruto.command({type:"profile-open",id:"br-8"})');
    await untilUI(ui, 'document.getElementById("profile-picker-status").textContent.includes("\u53E6\u4E00\u4E2A\u8D26\u53F7\u6B63\u5728\u767B\u5F55\u6216\u6062\u590D")');
    check("opening an unopened C profile reports busy and keeps B alive", games2.tabs.length === 2 && webLogin2.pending === ordinary.attempt && !ordinary.attempt.cancelled && (await ui("window.naruto.state()")).profilePickerOpen);
    check("busy notice is visible inside the profile picker", await ui('document.getElementById("profile-picker-status").textContent.includes("\u53E6\u4E00\u4E2A\u8D26\u53F7\u6B63\u5728\u767B\u5F55\u6216\u6062\u590D")'));
    await ui('window.naruto.command({type:"profiles-close-picker"})');
    const ordinaryCancelOffset = cancellationTasks.length;
    await ui(`window.naruto.command({type:"close",id:${JSON.stringify(ordinary.id)}})`);
    await settleCancellation(ordinary, ordinaryCancelOffset);
    check("explicitly closing background B cancels it without moving away from A", games2.activeId === first.id && !webLogin2.pending);
    check("home and tab navigation did not send cancellation to B", cancellationIntents.length === cancelsBeforeNavigation + 1 && cancellationIntents[cancellationIntents.length - 1] === "restore-original");
    let offset = cancellationTasks.length, probe = pendingRecovery(first.id);
    games2.select(first.id);
    await pause(100);
    const cancelsBeforeBlockedClose = cancellationIntents.length;
    await ui(`window.naruto.command({type:"close",id:${JSON.stringify(first.id)}})`);
    check("closing the original game is blocked during WK recovery, with its tab close disabled", games2.tabs.includes(first) && cancellationIntents.length === cancelsBeforeBlockedClose && await ui(`document.querySelector('[data-id="${first.id}"] .tab-close').disabled`));
    await ui('window.naruto.command({type:"home"})');
    check("home hides recovery without cancelling its task", cancellationIntents.length === cancelsBeforeBlockedClose && !probe.attempt.cancelled && webLogin2.pending === probe.attempt && games2.activeId === null);
    await settleCancellation(probe, offset);
    check("home remains selected after recovery cancellation finishes", games2.activeId === null && games2.tabs.includes(first));
    games2.select(first.id);
    offset = cancellationTasks.length;
    probe = pendingRecovery(first.id);
    const cancelsBeforeSelect = cancellationIntents.length;
    await ui(`window.naruto.command({type:"select",id:${JSON.stringify(second.id)}})`);
    check("selecting another game hides recovery without cancelling it", cancellationIntents.length === cancelsBeforeSelect && !probe.attempt.cancelled && webLogin2.pending === probe.attempt && games2.activeId === second.id);
    await settleCancellation(probe, offset);
    check("selected tab remains active after recovery cancellation finishes", games2.activeId === second.id && games2.tabs.includes(first));
    games2.select(second.id);
    offset = cancellationTasks.length;
    probe = pendingRecovery(first.id);
    await ui(`window.naruto.command({type:"select",id:${JSON.stringify(probe.id)}})`);
    await ui(`window.naruto.command({type:"close",id:${JSON.stringify(probe.id)}})`);
    check("closing the recovery tab sends return-to-original intent", cancellationIntents[cancellationIntents.length - 1] === "restore-original");
    await settleCancellation(probe, offset);
    check("closing the recovery tab returns to the original game", games2.activeId === first.id && games2.tabs.includes(first));
    const closingTarget = games2.create(newTab("cn"));
    await install(closingTarget);
    const closeNeighbor = games2.create(newTab("br"));
    await install(closeNeighbor);
    games2.select(closingTarget.id);
    offset = cancellationTasks.length;
    probe = pendingRecovery(first.id);
    await ui(`window.naruto.command({type:"close",id:${JSON.stringify(probe.id)}})`);
    check("closing the recovery tab starts return-to-original cancellation", cancellationIntents[cancellationIntents.length - 1] === "restore-original");
    await ui(`window.naruto.command({type:"close",id:${JSON.stringify(closingTarget.id)}})`);
    const selectedByClose = games2.activeId;
    await settleCancellation(probe, offset);
    check("closing the selected destination during cancellation preserves GameSessions selection", selectedByClose === closeNeighbor.id && games2.activeId === closeNeighbor.id && games2.tabs.includes(first));
    games2.close(closeNeighbor.id);
    games2.select(first.id);
    const backgroundDuringCancel = await recoveryFixtureTab(games2);
    offset = cancellationTasks.length;
    probe = pendingRecovery(first.id);
    await ui(`window.naruto.command({type:"select",id:${JSON.stringify(probe.id)}})`);
    await ui(`window.naruto.command({type:"close",id:${JSON.stringify(probe.id)}})`);
    await ui(`window.naruto.command({type:"close",id:${JSON.stringify(backgroundDuringCancel.id)}})`);
    await settleCancellation(probe, offset);
    check(
      "closing a background game while recovery cancellation is pending still returns to the original",
      !games2.tabs.includes(backgroundDuringCancel) && games2.tabs.includes(first) && games2.activeId === first.id
    );
    games2.select(first.id);
    offset = cancellationTasks.length;
    probe = pendingRecovery(first.id);
    await ui(`window.naruto.command({type:"select",id:${JSON.stringify(probe.id)}})`);
    await ui(`window.naruto.command({type:"close",id:${JSON.stringify(probe.id)}})`);
    await ui(`window.naruto.command({type:"select",id:${JSON.stringify(second.id)}})`);
    await settleCancellation(probe, offset);
    check("selection after closing the recovery tab overrides the earlier return intent", games2.activeId === second.id && games2.tabs.includes(first));
    webLogin2.cancel = realCancel;
    delete webLogin2.pending;
    games2.select(first.id);
    const embeddedLogin = require(import_path9.default.join(root2, "dist/native/embedded-login.node"));
    const previousManualLogin = process.env.NARUTO_TEST_MANUAL_LOGIN;
    process.env.NARUTO_TEST_MANUAL_LOGIN = "1";
    await ui('window.naruto.command({type:"profile-open",id:"br-8"})');
    await until(() => {
      var _a2;
      return !!((_a2 = webLogin2.pending) == null ? void 0 : _a2.handle);
    });
    const foregroundLogin = webLogin2.operation;
    const foregroundLoginState = await ui("window.naruto.state()");
    check(
      "starting another account login from A shows WK and preserves A in the background",
      embeddedLogin.attached() && embeddedLogin.visible() && games2.activeId === null && games2.tabs.includes(first) && foregroundLoginState.activeId === foregroundLogin.tabId
    );
    await until(() => !webLogin2.busy && games2.tabs.some((tab) => tab.profileId === "br-8"));
    const profileGame = games2.tabs.find((tab) => tab.profileId === "br-8");
    await games2.waitForReady(profileGame.id);
    check(
      "synthetic profile login hands off into its own isolated game tab",
      ((_k = profileGame.profile) == null ? void 0 : _k.partition) === "persist:naruto-br-8" && games2.activeId === profileGame.id
    );
    const profileGameContents = profileGame.view.webContents;
    await ui('window.naruto.command({type:"refresh"})');
    await until(() => {
      var _a2, _b2;
      return ((_a2 = webLogin2.operation) == null ? void 0 : _a2.recovering) === true && webLogin2.operation.stage === "login" && !!((_b2 = webLogin2.pending) == null ? void 0 : _b2.handle);
    });
    const recoveryLogin = webLogin2.operation;
    const recoveryLoginState = await ui("window.naruto.state()");
    check(
      "real refresh command keeps the recovery WK page visible over the original game",
      embeddedLogin.attached() && embeddedLogin.visible() && games2.tabs.includes(profileGame) && games2.activeId === null && recoveryLoginState.activeId === recoveryLogin.tabId && recoveryLoginState.tabs.some((tab) => tab.id === profileGame.id)
    );
    await until(() => {
      var _a2;
      return ((_a2 = webLogin2.operation) == null ? void 0 : _a2.stage) === "confirming" && games2.activeId === webLogin2.operation.candidateId;
    });
    const recoveryCandidate = games2.tabs.find((tab) => {
      var _a2;
      return tab.id === ((_a2 = webLogin2.operation) == null ? void 0 : _a2.candidateId);
    });
    check(
      "real recovery handoff selects a ready candidate without losing its original",
      recoveryCandidate.state === "ready" && recoveryCandidate.profileId === profileGame.profileId && games2.tabs.includes(profileGame)
    );
    const originalContents = profileGameContents;
    await ui('document.getElementById("complete-recovery").click()');
    await until(() => !games2.tabs.includes(profileGame) && !webLogin2.operation);
    await until(() => originalContents.isDestroyed());
    check(
      "real recovery completion keeps the candidate and closes only the original game",
      games2.tabs.includes(recoveryCandidate) && games2.activeId === recoveryCandidate.id && ((_l = recoveryCandidate.profile) == null ? void 0 : _l.partition) === ((_m = profileGame.profile) == null ? void 0 : _m.partition)
    );
    const recoveryCandidateContents = recoveryCandidate.view.webContents;
    await ui(`window.naruto.command({type:"close",id:${JSON.stringify(recoveryCandidate.id)}})`);
    await until(() => recoveryCandidateContents.isDestroyed());
    games2.select(first.id);
    if (previousManualLogin === void 0) delete process.env.NARUTO_TEST_MANUAL_LOGIN;
    else process.env.NARUTO_TEST_MANUAL_LOGIN = previousManualLogin;
    const before = second.generation;
    games2.refresh(first.id);
    await pause(1400);
    check("underlying GameSessions reload remains scoped to the requested tab", second.generation === before && first.state === "ready");
    if (process.env.NARUTO_TEST_HIDDEN === "1") {
      skip("trusted game-page keyboard input requires a focused native window; hidden integration keeps the desktop undisturbed");
    } else {
      const candidateDiagnostics = { targetTabId: first.id, targetWebContentsId: first.view.webContents.id, attempts: [] };
      diagnostics.savedCandidates = candidateDiagnostics;
      let activeCandidateAttempt;
      const originalVaultList = vault2.list;
      vault2.list = async function(requestOrigin, query = "") {
        const isCandidateRequest = requestOrigin === origin;
        if (isCandidateRequest && activeCandidateAttempt) {
          activeCandidateAttempt.requestCount++;
          activeCandidateAttempt.activeTabAtRequest = games2.activeId;
          activeCandidateAttempt.targetContentsFocusedAtRequest = first.view.webContents.isFocused();
          activeCandidateAttempt.pageGenerationAtRequest = first.generation;
        }
        const records = await originalVaultList.call(vault2, requestOrigin, query);
        if (isCandidateRequest && activeCandidateAttempt) {
          activeCandidateAttempt.responseCount++;
          activeCandidateAttempt.candidateCount = records.length;
        }
        return records;
      };
      const readGuestState = () => first.view.webContents.executeJavaScript(`(()=>{
      const active=document.activeElement;
      return {input:!!document.querySelector('input'),activeTag:active?.tagName??null,activeId:active?.id??null,
        usernameFocused:active?.id==='username',shadowHostCount:Array.from(document.querySelectorAll('div')).filter(x=>x.style.zIndex==='2147483647').length,
        filled:document.getElementById('username')?.value==='fixture-alpha'&&document.getElementById('password')?.value==='synthetic-password-one',
        stillOnLogin:location.pathname==='/pt/serverlist'};
    })()`);
      const waitForGuest = async (predicate, phase) => {
        for (let attempt = 0; attempt < 200; attempt++) {
          const state2 = await readGuestState();
          if (predicate(state2)) return state2;
          await pause(50);
        }
        throw new Error(`saved-candidate-${phase}-timeout`);
      };
      try {
        for (let index = 1; index <= 3; index++) {
          if (index > 1) {
            await first.view.webContents.loadURL(ENTRY_URL);
            await until(() => first.state === "ready");
          }
          const attempt = {
            iteration: index,
            pageGeneration: first.generation,
            targetWebContentsId: first.view.webContents.id,
            activeTabBeforeInput: games2.activeId,
            windowFocusedAtInput: null,
            targetContentsFocusedAtInput: null,
            requestCount: 0,
            responseCount: 0,
            candidateCount: null,
            activeTabAtRequest: null,
            targetContentsFocusedAtRequest: null,
            pageGenerationAtRequest: null,
            usernameFocusState: null,
            candidateListState: null,
            fillState: null
          };
          candidateDiagnostics.attempts.push(attempt);
          activeCandidateAttempt = attempt;
          win2.focus();
          first.view.webContents.focus();
          attempt.windowFocusedAtInput = win2.isFocused();
          attempt.targetContentsFocusedAtInput = first.view.webContents.isFocused();
          first.view.webContents.sendInputEvent({ type: "keyDown", keyCode: "Tab" });
          first.view.webContents.sendInputEvent({ type: "keyUp", keyCode: "Tab" });
          const focusedState = await waitForGuest((state2) => state2.usernameFocused, `username-focus-${index}`);
          attempt.usernameFocusState = {
            activeElement: { tag: focusedState.activeTag, id: focusedState.activeId },
            usernameFocused: focusedState.usernameFocused,
            shadowHostCount: focusedState.shadowHostCount
          };
          check(`login form account input receives focus on attempt ${index}`, focusedState.usernameFocused);
          await until(() => attempt.requestCount > 0);
          await until(() => attempt.responseCount > 0);
          const guestState = await waitForGuest((state2) => state2.shadowHostCount > 0, `list-render-${index}`);
          attempt.candidateListState = {
            activeElement: { tag: guestState.activeTag, id: guestState.activeId },
            usernameFocused: guestState.usernameFocused,
            shadowHostCount: guestState.shadowHostCount
          };
          check(
            `attempt ${index} requests and displays candidates for the selected page generation`,
            attempt.requestCount === 1 && attempt.responseCount === 1 && attempt.candidateCount === 2 && attempt.activeTabAtRequest === first.id && (process.env.NARUTO_TEST_HIDDEN === "1" || attempt.targetContentsFocusedAtRequest) && attempt.pageGenerationAtRequest === attempt.pageGeneration && guestState.shadowHostCount > 0
          );
          if (index === 1) {
            first.view.webContents.sendInputEvent({ type: "keyDown", keyCode: "Down" });
            first.view.webContents.sendInputEvent({ type: "keyUp", keyCode: "Down" });
            first.view.webContents.sendInputEvent({ type: "keyDown", keyCode: "Return" });
            first.view.webContents.sendInputEvent({ type: "char", keyCode: "Return" });
            first.view.webContents.sendInputEvent({ type: "keyUp", keyCode: "Return" });
            const filledState = await waitForGuest((state2) => state2.filled, "selection-fill");
            attempt.fillState = {
              activeElement: { tag: filledState.activeTag, id: filledState.activeId },
              filled: filledState.filled,
              stillOnLogin: filledState.stillOnLogin,
              shadowHostCount: filledState.shadowHostCount
            };
            check("chosen credential fills without submit", filledState.filled && filledState.stillOnLogin);
          } else {
            first.view.webContents.sendInputEvent({ type: "keyDown", keyCode: "Escape" });
            first.view.webContents.sendInputEvent({ type: "keyUp", keyCode: "Escape" });
            await waitForGuest((state2) => state2.shadowHostCount === 0, `dismiss-${index}`);
          }
        }
      } finally {
        vault2.list = originalVaultList;
      }
    }
    if (process.env.NARUTO_TEST_MANUAL_ACCEPTANCE === "1") {
      import_fs5.default.writeFileSync(import_path9.default.join(directory, "integration.json"), JSON.stringify({ ok: true, results, skipped, diagnostics, manualAcceptancePending: true }, null, 2));
      process.env.NARUTO_TEST_MANUAL_LOGIN = "1";
      console.log("MANUAL_ACCEPTANCE_READY", results.length);
      finish(0);
      return;
    }
    await ui('window.naruto.command({type:"rename",id:' + JSON.stringify(first.id) + ',name:"\u9A8C\u8BC1\u6807\u7B7E"})');
    check("rename independent of credential", first.name === "\u9A8C\u8BC1\u6807\u7B7E" && (await vault2.list(origin)).length === 2);
    await ui('window.naruto.command({type:"settings"})');
    await pause(900);
    check("settings hides game views", win2.getBrowserViews().every((view) => view.getBounds().x < 0));
    check("credential manager loaded", await ui('document.querySelectorAll(".credential").length === 2'));
    const manualUsername = `synthetic-manual-${process.pid}`;
    const manualPassword = '  \u5F15\u53F7"\u53CD\u659C\u7EBF\\\u4E0EUnicode\u5FCD\u8005  ';
    const changedManualPassword = "updated-synthetic-password";
    const chinaManualPassword = "\u56FD\u670D-synthetic-password";
    const openManualDialog = async () => {
      await ui('document.getElementById("credential-create").click()');
      await untilUI(ui, '!document.getElementById("dialog-backdrop").hidden && document.getElementById("credential-site").options.length===2');
    };
    const fillManualDialog = async (siteId, password, usernameValue = manualUsername) => {
      const [site, username, secret] = [siteId, usernameValue, password].map((value) => JSON.stringify(value));
      await ui(`(()=>{document.getElementById("credential-site").value=${site};document.getElementById("edit-name").value=${username};document.getElementById("edit-password").value=${secret};return true})()`);
    };
    const submitManualDialog = () => ui('document.getElementById("edit-form").dispatchEvent(new Event("submit",{bubbles:true,cancelable:true}))');
    await openManualDialog();
    check("manual password form offers only Brazil and China and masks the password", await ui('(()=>{const s=document.getElementById("credential-site"),p=document.getElementById("edit-password");return s.options.length===2&&s.options[0].value==="br"&&s.options[1].value==="cn"&&p.type==="password"})()'));
    const runtimeVault = vault2;
    const originalCredentialTransport = runtimeVault.transport;
    let failNextCredentialWrite = true;
    runtimeVault.transport = async (action, value) => {
      if (action === "write" && failNextCredentialWrite) {
        failNextCredentialWrite = false;
        throw new Error("synthetic keychain write failure");
      }
      return originalCredentialTransport(action, value);
    };
    try {
      await fillManualDialog("br", manualPassword);
      await submitManualDialog();
      await untilUI(ui, 'document.getElementById("dialog-error").textContent.length>0');
      check("a failed keychain write keeps the masked form and entered values for retry", await ui(`(()=>{const n=document.getElementById("edit-name"),p=document.getElementById("edit-password");return !document.getElementById("dialog-backdrop").hidden&&n.value===${JSON.stringify(manualUsername)}&&p.value===${JSON.stringify(manualPassword)}&&p.type==="password"})()`));
      await submitManualDialog();
      await untilUI(ui, 'document.getElementById("dialog-backdrop").hidden && document.querySelectorAll("#credentials .credential").length===3');
    } finally {
      runtimeVault.transport = originalCredentialTransport;
    }
    let manualRecords = await vault2.list();
    const brazilManual = manualRecords.find((record) => record.username === manualUsername && record.origin === "https://naruto.narutowebgame.com");
    check("manual Brazil credential saves trimmed username and exact password without exposing password in list", !!brazilManual && ((_n = await vault2.selected(brazilManual.id, brazilManual.origin)) == null ? void 0 : _n.password) === manualPassword && manualRecords.every((record) => !Object.prototype.hasOwnProperty.call(record, "password")));
    await openManualDialog();
    await fillManualDialog("br", manualPassword);
    await submitManualDialog();
    await untilUI(ui, 'document.getElementById("dialog-backdrop").hidden');
    check("same site username and password does not create a duplicate", (await vault2.list()).filter((record) => record.origin === brazilManual.origin && record.username === manualUsername).length === 1);
    await openManualDialog();
    await fillManualDialog("br", changedManualPassword);
    await submitManualDialog();
    await untilUI(ui, 'document.getElementById("dialog-title").textContent==="\u66F4\u65B0\u5DF2\u4FDD\u5B58\u5BC6\u7801\uFF1F"');
    check("updating an existing password requires confirmation and does not show the secret in the confirmation step", await ui('(()=>{const p=document.getElementById("edit-password");return p.hidden&&p.value===""&&document.getElementById("dialog-save").textContent==="\u786E\u8BA4\u66F4\u65B0"})()'));
    await ui('document.getElementById("dialog-cancel").click()');
    await untilUI(ui, 'document.getElementById("dialog-backdrop").hidden');
    check("cancelling a duplicate update leaves the old password unchanged", ((_o = await vault2.selected(brazilManual.id, brazilManual.origin)) == null ? void 0 : _o.password) === manualPassword);
    await openManualDialog();
    await fillManualDialog("br", changedManualPassword);
    await submitManualDialog();
    await untilUI(ui, 'document.getElementById("dialog-title").textContent==="\u66F4\u65B0\u5DF2\u4FDD\u5B58\u5BC6\u7801\uFF1F"');
    await ui('document.getElementById("dialog-save").click()');
    await untilUI(ui, 'document.getElementById("dialog-backdrop").hidden');
    check("confirmed update replaces the same Brazil record", ((_p = await vault2.selected(brazilManual.id, brazilManual.origin)) == null ? void 0 : _p.password) === changedManualPassword && (await vault2.list()).length === 3);
    await openManualDialog();
    await fillManualDialog("cn", chinaManualPassword);
    await submitManualDialog();
    await untilUI(ui, 'document.getElementById("dialog-backdrop").hidden && document.querySelectorAll("#credentials .credential").length===4');
    manualRecords = await vault2.list();
    const chinaManual = manualRecords.find((record) => record.username === manualUsername && record.origin === "https://huoying.qq.com");
    check("same username on China and Brazil stays in separate site records", !!chinaManual && chinaManual.id !== brazilManual.id && ((_q = await vault2.selected(chinaManual.id, chinaManual.origin)) == null ? void 0 : _q.password) === chinaManualPassword && manualRecords.length === 4);
    const invalidManualRequests = await ui(`Promise.all([
      window.naruto.addCredential("unsupported",${JSON.stringify(manualUsername)},"synthetic-password").then(()=>false,()=>true),
      window.naruto.addCredential("br","","synthetic-password").then(()=>false,()=>true)
    ])`);
    check("main process rejects unsupported sites and empty usernames", invalidManualRequests[0] && invalidManualRequests[1]);
    check("credential list API returns metadata without password fields", await ui('window.naruto.credentials().then(items=>items.every(item=>!Object.prototype.hasOwnProperty.call(item,"password")))'));
    let notifyPendingWrite = () => {
    };
    let releasePendingWrite = () => {
    };
    const pendingWriteStarted = new Promise((resolve) => {
      notifyPendingWrite = resolve;
    });
    const pendingWriteGate = new Promise((resolve) => {
      releasePendingWrite = resolve;
    });
    const lateUsername = `${manualUsername}-late`;
    let delayNextCredentialWrite = true;
    runtimeVault.transport = async (action, value) => {
      if (action === "write" && delayNextCredentialWrite) {
        delayNextCredentialWrite = false;
        notifyPendingWrite();
        await pendingWriteGate;
      }
      return originalCredentialTransport(action, value);
    };
    try {
      await openManualDialog();
      await fillManualDialog("br", "synthetic-late-write", lateUsername);
      await submitManualDialog();
      await pendingWriteStarted;
      check("saving disables account fields and repeat submission while keeping cancel available", await ui('(()=>{const ids=["edit-name","edit-password","credential-site","dialog-save"],c=document.getElementById("dialog-cancel");return ids.every(id=>document.getElementById(id).disabled)&&!c.disabled})()'));
      await ui('document.getElementById("dialog-cancel").click()');
      await untilUI(ui, 'document.getElementById("dialog-backdrop").hidden');
      await openManualDialog();
      releasePendingWrite();
      await untilUI(ui, 'document.getElementById("toast").textContent==="\u5DF2\u4FDD\u5B58\u5230 macOS \u94A5\u5319\u4E32"');
      check("a late save result does not close or overwrite a newly opened form", await ui('!document.getElementById("dialog-backdrop").hidden&&document.getElementById("dialog-title").textContent==="\u65B0\u589E\u5DF2\u4FDD\u5B58\u5BC6\u7801"&&document.getElementById("edit-name").value===""&&document.getElementById("edit-password").value===""'));
    } finally {
      releasePendingWrite();
      runtimeVault.transport = originalCredentialTransport;
    }
    const lateRecord = (await vault2.list()).find((record) => record.username === lateUsername && record.origin === "https://naruto.narutowebgame.com");
    check("closing during a write clears temporary form values and keeps the submitted test record isolated", !!lateRecord && await ui('document.getElementById("edit-name").value===""&&document.getElementById("edit-password").value===""'));
    await fillManualDialog("br", "synthetic-cleared-on-exit");
    await ui('window.naruto.command({type:"settings"})');
    await untilUI(ui, 'window.naruto.state().then(s=>!s.settingsOpen)&&document.getElementById("dialog-backdrop").hidden');
    check("leaving Settings while the add form is open clears temporary values", await ui('document.getElementById("edit-name").value===""&&document.getElementById("edit-password").value===""&&document.getElementById("credential-site").options.length===0'));
    if (lateRecord) await vault2.remove(lateRecord.id);
    await ui('window.naruto.command({type:"settings"})');
    await untilUI(ui, "window.naruto.state().then(s=>s.settingsOpen)");
    await openManualDialog();
    await fillManualDialog("br", "synthetic-preview-only-password");
    await untilUI(ui, 'document.getElementById("toast").hidden');
    for (const [width, height] of [[1280, 850], [800, 560]]) {
      win2.setContentSize(width, height);
      await pause(120);
      const image = await captureWithin(win2.capturePage(), 3e3);
      if (!image) throw new Error(`manual-credential-preview-capture-timeout-${width}x${height}`);
      import_fs5.default.writeFileSync(import_path9.default.join(directory, `manual-credential-${width}x${height}.png`), image.toPNG());
      check(`manual password form fits the ${width}x${height} preview with its password masked`, await ui(`(()=>{const p=document.getElementById("edit-password"),r=document.getElementById("dialog-backdrop").getBoundingClientRect();return !document.getElementById("dialog-backdrop").hidden&&p.type==="password"&&r.top>=0&&r.bottom<=innerHeight})()`));
    }
    win2.setContentSize(1280, 850);
    await ui('document.getElementById("dialog-cancel").click()');
    await untilUI(ui, 'document.getElementById("dialog-backdrop").hidden');
    check("cancelling clears temporary username and password inputs", await ui('document.getElementById("edit-name").value===""&&document.getElementById("edit-password").value===""&&document.getElementById("credential-site").options.length===0'));
    await vault2.remove(brazilManual.id);
    await vault2.remove(chinaManual.id);
    await ui('document.getElementById("reload-credentials").click()');
    await untilUI(ui, 'document.querySelectorAll("#credentials .credential").length===2');
    await ui('document.dispatchEvent(new PointerEvent("pointerdown",{bubbles:true}));document.getElementById("theme-select").focus()');
    check("actual shell suppresses pointer focus frames on all settings selects", await ui('document.documentElement.dataset.inputModality === "pointer" && ["theme-select","title-mode","lobby-bg-mode","flash-select"].every(id=>{const e=document.getElementById(id);e.focus();const s=getComputedStyle(e);return s.outlineStyle==="none"&&s.boxShadow==="none"})'));
    const keyboardFocus = await ui('(()=>{const e=document.getElementById("theme-select");e.blur();document.dispatchEvent(new KeyboardEvent("keydown",{key:"Tab",bubbles:true}));e.focus();return {modality:document.documentElement.dataset.inputModality,active:document.activeElement.id,boxShadow:getComputedStyle(e).boxShadow}})()');
    if (keyboardFocus.modality !== "keyboard" || keyboardFocus.boxShadow === "none") console.log("FOCUS_MODALITY_DIAGNOSTIC", JSON.stringify(keyboardFocus));
    check("actual shell retains keyboard focus frames on settings selects", keyboardFocus.modality === "keyboard" && keyboardFocus.boxShadow !== "none");
    import_electron7.nativeTheme.themeSource = "light";
    await pause(200);
    check("system theme follows native light appearance", await ui('document.documentElement.dataset.dark === "false"'));
    check("scheme C toolbar and tab dimensions", await ui('document.querySelector(".chrome").getBoundingClientRect().height === 42 && document.querySelector(".tab").getBoundingClientRect().height === 28'));
    check("game surface starts below compact toolbar", games2.top === 42 && first.view.getBounds().y === 42);
    await ui('document.getElementById("theme-select").value="dark";document.getElementById("theme-select").dispatchEvent(new Event("change"))');
    await pause(200);
    check("theme control updates native and shell appearance", String(import_electron7.nativeTheme.themeSource) === "dark" && await ui('document.documentElement.dataset.dark === "true"'));
    await ui('document.getElementById("title-mode").value="custom";document.getElementById("title-mode").dispatchEvent(new Event("change"))');
    await pause(200);
    await ui('document.getElementById("title-color").value="#294059";document.getElementById("title-color").dispatchEvent(new Event("input"));document.getElementById("title-color").dispatchEvent(new Event("change"))');
    await pause(200);
    check("custom color affects titlebar only", await ui('getComputedStyle(document.querySelector(".chrome")).backgroundColor === "rgb(41, 64, 89)" && getComputedStyle(document.getElementById("settings-panel")).backgroundColor === "rgb(32, 32, 32)"'));
    const persisted = JSON.parse(import_fs5.default.readFileSync(import_path9.default.join(import_electron7.app.getPath("userData"), "layout.json"), "utf8"));
    check("appearance saved to isolated configuration", persisted.preferences.theme === "dark" && persisted.preferences.titleBarColor === "#294059");
    await ui('window.naruto.command({type:"title-color",value:null})');
    check("default titlebar color restored", await ui('getComputedStyle(document.querySelector(".chrome")).backgroundColor === "rgb(39, 39, 39)"'));
    await ui('window.naruto.command({type:"theme",value:"system"})');
    await ui('window.naruto.command({type:"settings"})');
    await first.view.webContents.loadURL(origin + "/pt/fixture-success");
    await pause(3e3);
    const pluginInfo = await first.view.webContents.executeJavaScript("Array.from(navigator.plugins).map(p=>({name:p.name,description:p.description}))");
    if (process.env.NARUTO_TEST_HIDDEN === "1") {
      skip("real Flash pixel rendering requires a visible compositor; hidden integration keeps the user desktop undisturbed");
    } else {
      const bounds = await first.view.webContents.executeJavaScript('(()=>{let r=document.getElementById("flash").getBoundingClientRect();return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2),width:1,height:1}})()');
      const flashImage = await captureWithin(first.view.webContents.capturePage(bounds), 5e3);
      const pixel = flashImage == null ? void 0 : flashImage.getBitmap();
      check("real Flash renders authored SWF", !!pixel && Math.abs(pixel[0] - 90) < 8 && Math.abs(pixel[1] - 129) < 8 && Math.abs(pixel[2] - 100) < 8);
    }
    check("Flash preserves aspect ratio", await first.view.webContents.executeJavaScript('(()=>{const r=document.getElementById("flash").getBoundingClientRect();return Math.abs(r.width/r.height-2)<.01})()'));
    const gameContents = first.view.webContents;
    const oldDocument = await gameContents.executeJavaScript("performance.timeOrigin");
    const otherGeneration = second.generation;
    let unloadPrompts = 0;
    const observedUnload = () => {
      unloadPrompts++;
    };
    gameContents.on("will-prevent-unload", observedUnload);
    await gameContents.executeJavaScript("window.onbeforeunload=()=>false;document.body.click()", true);
    games2.refresh(first.id);
    await pause(1200);
    check("GameSessions reloads the Flash document despite website unload protection", unloadPrompts === 1 && await gameContents.executeJavaScript("performance.timeOrigin") > oldDocument && first.state === "ready");
    check("GameSessions refresh preserves session and leaves other tab unchanged", await gameContents.executeJavaScript('document.cookie.includes("naruto_fixture=alpha") && !!document.getElementById("flash")') && second.generation === otherGeneration);
    gameContents.removeListener("will-prevent-unload", observedUnload);
    const chinaContents = second.view.webContents;
    second.region = "cn";
    games2.select(second.id);
    const chinaDocument = await chinaContents.executeJavaScript("performance.timeOrigin");
    await chinaContents.executeJavaScript("window.onbeforeunload=()=>false;document.body.click()", true);
    let chinaUnloadPrompts = 0;
    const observedChinaUnload = () => {
      chinaUnloadPrompts++;
    };
    chinaContents.on("will-prevent-unload", observedChinaUnload);
    await ui('document.getElementById("refresh").click()');
    await pause(1200);
    check("China toolbar refresh remains an ordinary page reload", chinaUnloadPrompts === 1 && await chinaContents.executeJavaScript("performance.timeOrigin") > chinaDocument && second.state === "ready");
    chinaContents.removeListener("will-prevent-unload", observedChinaUnload);
    second.region = "br";
    games2.select(first.id);
    await first.view.webContents.loadURL(ENTRY_URL);
    await first.view.webContents.executeJavaScript('void window.open("https://navigation-fixture.test/news/example", "_blank")');
    await pause(900);
    check("cross-site popup stays inside launcher", first.view.webContents.getURL().startsWith("https://navigation-fixture.test/") && !first.view.webContents.isDestroyed());
    await first.view.webContents.loadURL(ENTRY_URL);
    await pause(400);
    await first.view.webContents.executeJavaScript('document.getElementById("username").value="fixture-alpha"; document.getElementById("password").value="synthetic-password-updated";document.querySelector("form").requestSubmit()');
    await pause(1600);
    check("password update prompt after login", await ui('window.naruto.state().then(s=>s.prompt?.username==="fixture-alpha" && s.prompt.update)'));
    const promptPoint = () => ui('(()=>{const b=document.getElementById("save-password"),r=b.getBoundingClientRect();return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2),hit:document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.id}})()');
    check("save prompt is visible and hit-testable above background", (await promptPoint()).hit === "save-password" && first.view.getBounds().y === 86);
    await first.view.webContents.loadURL("https://s776-naruto.oasgames.com/pt/fixture-success");
    await pause(1e3);
    check("save prompt survives Brazil server navigation with original credential origin", await ui('window.naruto.state().then(s=>s.prompt?.origin==="https://naruto.narutowebgame.com" && !document.getElementById("save-prompt").hidden)'));
    const savePoint = await promptPoint();
    win2.webContents.focus();
    win2.webContents.sendInputEvent({ type: "mouseDown", x: savePoint.x, y: savePoint.y, button: "left", clickCount: 1 });
    win2.webContents.sendInputEvent({ type: "mouseUp", x: savePoint.x, y: savePoint.y, button: "left", clickCount: 1 });
    await pause(500);
    const alpha = (await vault2.list(origin)).find((r) => r.username === "fixture-alpha");
    check("password update saved to test keychain", ((_r = await vault2.selected(alpha.id, origin)) == null ? void 0 : _r.password) === "synthetic-password-updated");
    check("saving removes prompt and restores 42px game inset", first.view.getBounds().y === 42 && await ui('document.getElementById("save-prompt").hidden'));
    await first.view.webContents.loadURL(ENTRY_URL);
    await pause(250);
    await first.view.webContents.executeJavaScript('document.getElementById("username").value="fixture-alpha";document.getElementById("password").value="synthetic-unused-update";document.querySelector("form").requestSubmit()');
    await pause(1400);
    check("new submission stages another save decision", await ui("window.naruto.state().then(s=>!!s.prompt)"));
    await first.view.webContents.loadURL("https://navigation-fixture.test/unrelated");
    await pause(1e3);
    check("unrelated navigation clears prompt and inset together", first.view.getBounds().y === 42 && await ui('window.naruto.state().then(s=>!s.prompt && document.getElementById("save-prompt").hidden)'));
    const confirmOriginal = await recoveryFixtureTab(games2);
    const confirmCandidate = await recoveryFixtureTab(games2);
    const loadingProbe = pendingRecovery(confirmOriginal.id, "loading", confirmCandidate.id);
    confirmCandidate.recoveryStage = "loading";
    games2.select(confirmCandidate.id);
    await pause(120);
    check(
      "candidate loading keeps unique tabs, blocks original close, and disables refresh",
      await ui("window.naruto.state().then(s=>!s.refresh.enabled && new Set(s.tabs.map(t=>t.id)).size===s.tabs.length && s.tabs.find(t=>t.id===" + JSON.stringify(confirmOriginal.id) + ").closeDisabled)") && (refreshMenu == null ? void 0 : refreshMenu.enabled) === false && confirmOriginal.view.webContents && games2.tabs.includes(confirmOriginal)
    );
    const loadingGeneration = confirmCandidate.generation;
    await ui('window.naruto.command({type:"refresh"})');
    check("refresh during candidate loading does not navigate or start another attempt", confirmCandidate.generation === loadingGeneration && webLogin2.pending === loadingProbe.attempt);
    await ui(`window.naruto.command({type:"close",id:${JSON.stringify(confirmOriginal.id)}})`);
    check("direct original close command is refused before candidate confirmation", games2.tabs.includes(confirmOriginal) && games2.tabs.includes(confirmCandidate) && webLogin2.pending === loadingProbe.attempt);
    loadingProbe.attempt.stage = "confirming";
    confirmCandidate.recoveryStage = "confirming";
    games2.select(confirmCandidate.id);
    await pause(150);
    for (const [width, height] of [[800, 560], [1280, 850]]) {
      win2.setContentSize(width, height);
      await pause(150);
      const preview = await ui(`(()=>{const bar=document.getElementById('recovery-prompt'),done=document.getElementById('complete-recovery'),cancel=document.getElementById('cancel-recovery'),b=bar.getBoundingClientRect(),d=done.getBoundingClientRect(),c=cancel.getBoundingClientRect();return {visible:!bar.hidden,text:document.getElementById('recovery-text').textContent,buttons:done.textContent==='\u5B8C\u6210\u5207\u6362'&&cancel.textContent==='\u53D6\u6D88',inside:b.top>=42&&b.bottom<=innerHeight&&d.right<=innerWidth&&c.bottom<=innerHeight}})()`);
      const uniqueTabs = await ui("window.naruto.state().then(s=>new Set(s.tabs.map(t=>t.id)).size===s.tabs.length)");
      check(`confirmation bar and controls are visible at ${width}x${height}`, preview.visible && preview.text === "\u786E\u8BA4\u65B0\u6E38\u620F\u53EF\u4EE5\u6B63\u5E38\u64CD\u4F5C\u540E\uFF0C\u5B8C\u6210\u5207\u6362\u3002" && preview.buttons && preview.inside && uniqueTabs && games2.top === 86 && confirmCandidate.view.getBounds().y === 86);
    }
    await ui('document.getElementById("complete-recovery").click()');
    check("explicit completion click closes old page and keeps the new page active", !games2.tabs.includes(confirmOriginal) && games2.tabs.includes(confirmCandidate) && games2.activeId === confirmCandidate.id && !webLogin2.pending);
    loadingProbe.clear();
    games2.close(confirmCandidate.id);
    const closeOriginal = await recoveryFixtureTab(games2);
    const closeCandidate = await recoveryFixtureTab(games2);
    const unrelatedActive = await recoveryFixtureTab(games2);
    const closeProbe = pendingRecovery(closeOriginal.id, "confirming", closeCandidate.id, "br-2");
    closeCandidate.recoveryStage = "confirming";
    games2.select(closeCandidate.id);
    await pause(120);
    const recoveryDeleteRefused = await ui('window.naruto.command({type:"profile-delete",id:"br-2"}).then(()=>false,e=>e.message.includes("\u767B\u5F55/\u6062\u590D\u4EFB\u52A1"))');
    check("main process refuses deletion while the account is held by a recovery task", recoveryDeleteRefused && !((_s = (await ui("window.naruto.state()")).profiles.find((profile) => profile.id === "br-2")) == null ? void 0 : _s.cleanupStatus));
    await ui(`window.naruto.command({type:"select",id:${JSON.stringify(unrelatedActive.id)}})`);
    await ui(`window.naruto.command({type:"close",id:${JSON.stringify(closeOriginal.id)}})`);
    check("closing the original during background confirmation preserves the selected game", !games2.tabs.includes(closeOriginal) && games2.tabs.includes(closeCandidate) && games2.activeId === unrelatedActive.id && !webLogin2.pending);
    closeProbe.clear();
    games2.close(closeCandidate.id);
    games2.close(unrelatedActive.id);
    const foregroundCloseOriginal = await recoveryFixtureTab(games2);
    const foregroundCloseNeighbor = await recoveryFixtureTab(games2);
    const foregroundCloseCandidate = await recoveryFixtureTab(games2);
    const foregroundCloseProbe = pendingRecovery(foregroundCloseOriginal.id, "confirming", foregroundCloseCandidate.id, "br-2");
    foregroundCloseCandidate.recoveryStage = "confirming";
    games2.select(foregroundCloseOriginal.id);
    await pause(120);
    await ui(`window.naruto.command({type:"close",id:${JSON.stringify(foregroundCloseOriginal.id)}})`);
    check(
      "closing the selected original during confirmation selects the candidate, not its tab neighbor",
      !games2.tabs.includes(foregroundCloseOriginal) && games2.tabs.includes(foregroundCloseNeighbor) && games2.tabs.includes(foregroundCloseCandidate) && games2.activeId === foregroundCloseCandidate.id && !webLogin2.pending
    );
    foregroundCloseProbe.clear();
    games2.close(foregroundCloseNeighbor.id);
    games2.close(foregroundCloseCandidate.id);
    const destroyedOriginal = await recoveryFixtureTab(games2);
    const destroyedCandidate = await recoveryFixtureTab(games2);
    const destroyedProbe = pendingRecovery(destroyedOriginal.id, "loading", destroyedCandidate.id);
    destroyedCandidate.recoveryStage = "loading";
    games2.select(destroyedCandidate.id);
    const destroyedCancelOffset = cancellationTasks.length;
    games2.close(destroyedOriginal.id);
    destroyedProbe.finish();
    await until(() => !webLogin2.pending);
    cancellationTasks.length = destroyedCancelOffset;
    destroyedProbe.clear();
    check("unexpected original destruction cancels recovery and removes its candidate without restoring a stale tab", !games2.tabs.includes(destroyedOriginal) && !games2.tabs.includes(destroyedCandidate) && !webLogin2.pending && (!games2.activeId || games2.tabs.some((t) => t.id === games2.activeId)));
    const secondContents = second.view.webContents;
    games2.close(second.id);
    check("closing destroys only target", secondContents.isDestroyed() && !first.view.webContents.isDestroyed());
    await ui(`window.naruto.command({type:"close",id:"${first.id}"})`);
    check("last tab stays empty", games2.tabs.length === 0 && games2.activeId === null && await ui("window.naruto.state().then(s=>s.tabs.length===0)"));
    await pause(300);
    check("empty state open button", await ui('!document.getElementById("open-game").hidden'));
    await ui('window.naruto.command({type:"region",value:"br"})');
    for (let index = 0; index < 10; index++) await ui(`window.naruto.command({type:"profile-create",name:${JSON.stringify(`\u5408\u6210\u6EDA\u52A8\u6863\u6848${index + 1}`)},serverNote:""})`);
    const longName = "\u5408\u6210\u6F14\u793A\u7528\u7684\u8D85\u957F\u8D26\u53F7\u540D\u79F0\u7528\u4E8E\u68C0\u67E5\u80F6\u56CA\u548C\u5217\u8868\u7701\u7565\u663E\u793A";
    await ui(`window.naruto.command({type:"profile-update",id:"br-2",name:${JSON.stringify(longName)},serverNote:""})`);
    await ui('window.naruto.command({type:"profile-select",id:"br-2"})');
    await untilUI(ui, 'window.naruto.state().then(s=>s.preferences.region==="br" && s.selectedProfileId==="br-2")');
    win2.setContentSize(800, 560);
    await pause(150);
    await ui('document.getElementById("lobby-current").click()');
    const longOption = await ui(`(()=>{const option=document.querySelector('#profile-deck [data-id="br-2"]'),name=option.querySelector('b'),deck=document.getElementById('profile-deck'),r=deck.getBoundingClientRect();return {title:option.title,text:name.textContent,overflow:getComputedStyle(name).textOverflow,truncated:name.scrollWidth>name.clientWidth,emptyNote:!option.querySelector('small')&&document.getElementById('profile-choice-note').hidden,scrollable:deck.scrollHeight>deck.clientHeight,inside:r.top>=42&&r.bottom<=innerHeight&&r.left>=0&&r.right<=innerWidth}})()`);
    await ui('document.getElementById("profile-deck").dispatchEvent(new KeyboardEvent("keydown",{key:"End",bubbles:true}))');
    await pause(50);
    const deckScroll = await ui('(()=>{const deck=document.getElementById("profile-deck");return {top:deck.scrollTop,height:deck.clientHeight,scrollHeight:deck.scrollHeight}})()');
    check(
      "long account names truncate with a full-name tooltip, empty notes stay hidden, and long profile lists scroll",
      longOption.title === longName && longOption.text === longName && longOption.overflow === "ellipsis" && longOption.truncated && longOption.emptyNote && longOption.scrollable && longOption.inside && deckScroll.top > 0 && deckScroll.scrollHeight > deckScroll.height
    );
    const longListPreview = await captureWithin(win2.capturePage(), 3e3);
    if (longListPreview) import_fs5.default.writeFileSync(import_path9.default.join(directory, "lobby-long-list-800x560.png"), longListPreview.toPNG());
    await ui('document.getElementById("profile-deck").dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}))');
    await ui('window.naruto.command({type:"profile-update",id:"br-2",name:"\u5408\u6210\u5DF4\u897F\u8D26\u53F7B",serverNote:"\u5408\u6210\u4E8C\u533A"})');
    await untilUI(ui, 'window.naruto.state().then(s=>s.profiles.find(p=>p.id==="br-2").name==="\u5408\u6210\u5DF4\u897F\u8D26\u53F7B")');
    win2.setContentSize(1280, 850);
    await pause(100);
    let remainingBrazil = (await ui("window.naruto.state()")).profiles.filter((profile) => profile.region === "br").map((profile) => profile.id);
    if (!await ui("window.naruto.state().then(s=>s.settingsOpen)")) await ui('window.naruto.command({type:"settings"})');
    await untilUI(ui, "window.naruto.state().then(s=>s.settingsOpen)");
    for (const id of remainingBrazil) {
      await ui(`document.querySelector('#profile-list [data-id="${id}"] [data-action=delete]').click()`);
      await pause(50);
      await ui('document.getElementById("dialog-save").click()');
      await untilUI(ui, `window.naruto.state().then(s=>!s.profiles.some(p=>p.id===${JSON.stringify(id)}))`);
      await untilUI(ui, 'document.getElementById("dialog-backdrop").hidden');
    }
    await ui('document.getElementById("close-settings").click()');
    await pause(80);
    check(
      "empty region shows no accounts, disables start, and offers direct profile creation",
      await ui('document.getElementById("lobby-account-name").textContent==="\u6682\u65E0\u8D26\u53F7\u6863\u6848" && document.getElementById("open-game").disabled && !document.getElementById("lobby-create-profile").hidden')
    );
    await ui('document.getElementById("lobby-create-profile").click()');
    await pause(50);
    await ui('document.getElementById("edit-name").value="\u7A7A\u72B6\u6001\u65B0\u5EFA\u8D26\u53F7";document.getElementById("edit-server-note").value="";document.getElementById("edit-form").dispatchEvent(new Event("submit",{bubbles:true,cancelable:true}))');
    await untilUI(ui, 'window.naruto.state().then(s=>s.profiles.some(p=>p.name==="\u7A7A\u72B6\u6001\u65B0\u5EFA\u8D26\u53F7"))');
    check(
      "creating from the empty-state entry selects the new profile and enables start",
      (await ui("window.naruto.state()")).selectedProfileId !== null && await ui('document.getElementById("lobby-account-name").textContent==="\u7A7A\u72B6\u6001\u65B0\u5EFA\u8D26\u53F7" && !document.getElementById("open-game").disabled')
    );
    console.log("INTEGRATION_COMPLETE", results.length);
    import_fs5.default.writeFileSync(import_path9.default.join(directory, "integration.json"), JSON.stringify({ ok: true, results, skipped, diagnostics, plugins: pluginInfo }, null, 2));
  } catch (error) {
    console.error("INTEGRATION_ERROR", error.message);
    releaseRecoveryProbe == null ? void 0 : releaseRecoveryProbe();
    releaseRecoveryProbe = void 0;
    import_fs5.default.writeFileSync(import_path9.default.join(directory, "integration.json"), JSON.stringify({ ok: false, results, skipped, diagnostics, error: error.message }, null, 2));
    finish(1);
    return;
  } finally {
    clearTimeout(watchdog);
    (0, import_child_process4.execFileSync)(import_path9.default.join(root2, "dist/native/keychain"), { input: JSON.stringify({ action: "delete-test", service: "cn.youye.naruto-os.test.integration" }), stdio: ["pipe", "ignore", "ignore"] });
  }
  finish(0);
}
var import_child_process4, import_crypto5, import_electron7, import_fs5, import_path9, import_assert, pause, origin, fixture, success;
var init_integration = __esm({
  "src/main/integration.ts"() {
    "use strict";
    import_child_process4 = require("child_process");
    import_crypto5 = require("crypto");
    import_electron7 = require("electron");
    import_fs5 = __toESM(require("fs"));
    import_path9 = __toESM(require("path"));
    import_assert = __toESM(require("assert"));
    init_policy();
    init_config();
    init_traffic_lights();
    pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    origin = new URL(ENTRY_URL).origin;
    fixture = `<!doctype html><html><head><meta charset="utf-8"><title>Offline fixture</title><style>body{margin:0;background:#e8ede3;color:#38432f;font:16px sans-serif}main{padding:50px}form{display:grid;gap:12px;width:280px}input,button{padding:12px;font:inherit}h1{font-size:22px}p{font-size:13px}object{margin:0 auto}</style></head><body><main><h1>Naruto OS \xB7 \u9694\u79BB\u9A8C\u8BC1\u9875\u9762</h1><p>\u5408\u6210\u8D26\u53F7 \xB7 \u4E0D\u8FDE\u63A5\u6E38\u620F\u670D\u52A1\u5668</p><form method="post" action="/pt/fixture-success"><label>Conta<input name="username" id="username" autocomplete="username"></label><label>Senha<input name="password" id="password" type="password"></label><button type="submit">Entrar</button></form></main></body></html>`;
    success = `<!doctype html><html><head><meta charset="utf-8"><title>Flash fixture</title><style>body{margin:0;background:#202420;color:#dae1d3;text-align:center;font:14px sans-serif}p{margin:15px}</style></head><body><p>Flash \u6D4B\u8BD5\u753B\u9762 \xB7 \u7EFF\u8272\u533A\u57DF\u5E94\u7531\u771F\u5B9E PPAPI \u63D2\u4EF6\u6E32\u67D3</p><object id="flash" type="application/x-shockwave-flash" data="/fixture.swf" width="600" height="300"><param name="movie" value="/fixture.swf"><param name="wmode" value="opaque"></object></body></html>`;
  }
});

// src/main/index.ts
var import_electron8 = require("electron");
var import_fs6 = __toESM(require("fs"));
var import_path10 = __toESM(require("path"));
var import_crypto6 = require("crypto");

var brRecoverySettingsApi = require("./br-session-recovery.js");
function brRecoveryUserDataDirectory() {
  return import_electron8.app.getPath("userData");
}
function readBrRecoverySettingsForUI(profileId) {
  try {
    const config = brRecoverySettingsApi.readConfig(brRecoveryUserDataDirectory(), profileId);
    return config ? {
      enabled: true,
      serverId: config.serverId,
      officialAccount: config.officialAccount || ""
    } : { enabled: false, serverId: "", officialAccount: "" };
  } catch (_) {
    return { enabled: false, serverId: "", officialAccount: "" };
  }
}
function listBrOfficialAccountsForUI(profileId) {
  let profileRoot;
  if (profileId) {
    const existing = brRecoverySettingsApi.readConfig(brRecoveryUserDataDirectory(), profileId);
    if (existing && existing.profileRoot) profileRoot = existing.profileRoot;
  }
  try {
    return brRecoverySettingsApi.listAccounts(profileRoot).map((item) => ({
      account: item.account,
      modifiedAt: Number.isFinite(item.mtimeMs) ? Math.floor(item.mtimeMs) : 0
    }));
  } catch (_) {
    return [];
  }
}
function saveBrRecoverySettingsForUI(profileId, recovery) {
  if (typeof profileId !== "string" || !/^br-[1-9]\d*$/.test(profileId)) {
    throw new Error("巴西区登录档案编号无效");
  }
  const file = import_path10.default.join(brRecoveryUserDataDirectory(), "br-session-recovery.json");
  let raw = { version: 1, profiles: {} };
  if (import_fs6.default.existsSync(file)) {
    try {
      raw = JSON.parse(import_fs6.default.readFileSync(file, "utf8"));
    } catch (_) {
      throw new Error("会话恢复配置无法读取，原文件已保留");
    }
    if (!raw || raw.version !== 1 || !raw.profiles || typeof raw.profiles !== "object" || Array.isArray(raw.profiles)) {
      throw new Error("会话恢复配置格式异常，未覆盖原文件");
    }
  }
  const profiles = { ...raw.profiles };
  if (!recovery || recovery.enabled !== true) {
    delete profiles[profileId];
  } else {
    const serverId = Number(recovery.serverId);
    if (!Number.isSafeInteger(serverId) || serverId < 1 || serverId > 99999) {
      throw new Error("请输入有效的巴西区服务器编号（1–99999）");
    }
    let officialAccount = typeof recovery.officialAccount === "string" ? recovery.officialAccount.trim() : "";
    if (officialAccount.length > 128 || officialAccount === "." || officialAccount === ".." || /[\\/\x00-\x1f\x7f]/.test(officialAccount)) {
      throw new Error("官方客户端账号目录名无效");
    }
    const existing = brRecoverySettingsApi.readConfig(brRecoveryUserDataDirectory(), profileId);
    const profileRoot = existing && existing.profileRoot ? existing.profileRoot : undefined;
    const accounts = brRecoverySettingsApi.listAccounts(profileRoot);
    if (!officialAccount) {
      if (accounts.length !== 1) {
        throw new Error(accounts.length ? "检测到多个官方客户端账号，请明确选择一个" : "未发现官方客户端账号，请先登录官方客户端并退出后刷新");
      }
    } else {
      const matched = accounts.find((item) => item.account.toLowerCase() === officialAccount.toLowerCase());
      if (!matched) throw new Error("所选官方客户端账号已不存在，请刷新账号列表");
      officialAccount = matched.account;
    }
    profiles[profileId] = {
      serverId,
      ...(officialAccount ? { officialAccount } : {}),
      ...(profileRoot ? { profileRoot } : {})
    };
  }
  const next = { version: 1, profiles };
  const temporary = file + "." + import_crypto6.randomBytes(6).toString("hex") + ".tmp";
  try {
    import_fs6.default.writeFileSync(temporary, JSON.stringify(next, null, 2), { encoding: "utf8", mode: 384 });
    import_fs6.default.renameSync(temporary, file);
  } catch (_) {
    try { if (import_fs6.default.existsSync(temporary)) import_fs6.default.unlinkSync(temporary); } catch (_) {}
    throw new Error("会话恢复映射保存失败，请检查用户数据目录权限");
  }
  return readBrRecoverySettingsForUI(profileId);
}
init_config();


// src/main/account-profiles.ts
var import_fs2 = __toESM(require("fs"));
var import_path2 = __toESM(require("path"));
var import_crypto2 = __toESM(require("crypto"));
init_model();
var slotPartition = /^persist:naruto-(br|cn)-([1-9]\d*)$/;
var directoryPartition = /^naruto-(br|cn)-([1-9]\d*)$/;
var profileId = /^(br|cn)-([1-9]\d*)$/;
function accountProfileId(region, slot) {
  return `${region}-${slot}`;
}
function parseSlot(value, pattern) {
  const match = pattern.exec(value);
  if (!match) return null;
  const slot = Number(match[2]);
  return Number.isSafeInteger(slot) && slot > 0 ? { region: match[1], slot } : null;
}
function parseStoredPartitionNames(serialized) {
  let raw;
  try {
    raw = JSON.parse(serialized || "[]");
  } catch {
    throw new Error("\u94A5\u5319\u4E32\u4E2D\u7684\u767B\u5F55\u69FD\u4F4D\u4FE1\u606F\u683C\u5F0F\u5F02\u5E38");
  }
  if (!Array.isArray(raw) || raw.some((item) => typeof item !== "string" || !parseSlot(item, slotPartition))) {
    throw new Error("\u94A5\u5319\u4E32\u4E2D\u7684\u767B\u5F55\u69FD\u4F4D\u4FE1\u606F\u683C\u5F0F\u5F02\u5E38");
  }
  return [...new Set(raw)];
}
function profilesFromLegacySources(directoryNames, storedPartitions) {
  const slots = /* @__PURE__ */ new Map();
  for (const name of directoryNames) {
    const match = parseSlot(name, directoryPartition);
    if (match) slots.set(accountProfileId(match.region, match.slot), legacyProfile(match.region, match.slot));
  }
  for (const name of storedPartitions) {
    const match = parseSlot(name, slotPartition);
    if (match) slots.set(accountProfileId(match.region, match.slot), legacyProfile(match.region, match.slot));
  }
  return [...slots.values()].sort((a, b) => a.region.localeCompare(b.region) || a.slot - b.slot);
}
function legacyProfile(region, slot) {
  return { id: accountProfileId(region, slot), region, slot, name: `\u5386\u53F2\u767B\u5F55\u69FD\u4F4D${slot}`, serverNote: "" };
}
function readPartitionDirectoryNames(userDataDirectory) {
  const partitions = import_path2.default.join(userDataDirectory, "Partitions");
  try {
    return import_fs2.default.readdirSync(partitions, { withFileTypes: true }).filter((item) => item.isDirectory()).map((item) => item.name);
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw new Error("\u65E0\u6CD5\u8BFB\u53D6\u65E7\u767B\u5F55\u69FD\u4F4D\u76EE\u5F55\uFF0C\u8BF7\u91CD\u8BD5");
  }
}
function profileIds(value, field) {
  if (value === void 0) return [];
  if (!Array.isArray(value) || value.some((id) => typeof id !== "string" || !profileId.test(id)) || new Set(value).size !== value.length) {
    throw new Error(`\u8D26\u53F7\u6863\u6848\u6587\u4EF6\u4E2D\u7684${field}\u65E0\u6548`);
  }
  return value;
}
function emptyData() {
  return { version: 1, profiles: [], selectedByRegion: { br: null, cn: null }, pendingDeletes: [], deletedIds: [] };
}
function validateData(raw) {
  if (!raw || typeof raw !== "object") throw new Error("\u8D26\u53F7\u6863\u6848\u6587\u4EF6\u683C\u5F0F\u5F02\u5E38");
  const value = raw;
  if (value.version !== 1 || !Array.isArray(value.profiles) || !value.selectedByRegion || typeof value.selectedByRegion !== "object") {
    throw new Error("\u8D26\u53F7\u6863\u6848\u6587\u4EF6\u683C\u5F0F\u5F02\u5E38");
  }
  const seen = /* @__PURE__ */ new Set();
  const profiles = value.profiles.map((item) => {
    if (!item || typeof item !== "object" || !validRegion(item.region) || !Number.isSafeInteger(item.slot) || item.slot < 1 || item.id !== accountProfileId(item.region, item.slot) || !profileId.test(item.id) || seen.has(item.id) || typeof item.name !== "string" || !item.name.trim() || item.name.trim().length > 40 || typeof item.serverNote !== "string" || item.serverNote.trim().length > 40) throw new Error("\u8D26\u53F7\u6863\u6848\u6587\u4EF6\u683C\u5F0F\u5F02\u5E38\u6216\u5B58\u5728\u91CD\u590D\u69FD\u4F4D\u6620\u5C04");
    seen.add(item.id);
    return { id: item.id, region: item.region, slot: item.slot, name: item.name.trim(), serverNote: item.serverNote.trim() };
  });
  const pendingDeletes = profileIds(value.pendingDeletes, "\u5F85\u6E05\u7406\u72B6\u6001");
  const deletedIds = profileIds(value.deletedIds, "\u5DF2\u5220\u9664\u8BB0\u5F55");
  if (pendingDeletes.some((id) => !seen.has(id)) || deletedIds.some((id) => seen.has(id) || pendingDeletes.includes(id))) {
    throw new Error("\u8D26\u53F7\u6863\u6848\u6587\u4EF6\u4E2D\u7684\u6E05\u7406\u72B6\u6001\u4E0E\u6863\u6848\u4E0D\u4E00\u81F4");
  }
  const pending2 = new Set(pendingDeletes);
  const selected = value.selectedByRegion;
  const selectedByRegion = { br: null, cn: null };
  for (const region of ["br", "cn"]) {
    const id = selected[region];
    if (id !== null && id !== void 0 && (typeof id !== "string" || pending2.has(id) || !profiles.some((item) => item.id === id && item.region === region))) {
      throw new Error("\u8D26\u53F7\u6863\u6848\u6587\u4EF6\u4E2D\u7684\u4E0A\u6B21\u9009\u62E9\u65E0\u6548");
    }
    selectedByRegion[region] = typeof id === "string" ? id : null;
  }
  return { version: 1, profiles, selectedByRegion, pendingDeletes, deletedIds };
}
var AccountProfileStore = class {
  constructor(userDataDirectory) {
    this.loadError = null;
    this.data = null;
    this.file = import_path2.default.join(userDataDirectory, "account-profiles.json");
    this.reload();
  }
  reload() {
    let error = null, loaded = null;
    try {
      if (!import_fs2.default.existsSync(this.file)) loaded = emptyData();
      else loaded = validateData(JSON.parse(import_fs2.default.readFileSync(this.file, "utf8")));
    } catch {
      error = "\u8D26\u53F7\u6863\u6848\u8D44\u6599\u65E0\u6CD5\u8BFB\u53D6\uFF0C\u539F\u6587\u4EF6\u5DF2\u4FDD\u7559\u3002\u6062\u590D\u8BE5\u6587\u4EF6\u540E\u53EF\u91CD\u8BD5\u3002";
    }
    this.data = loaded;
    this.loadError = error;
  }
  profiles() {
    var _a, _b;
    return (_b = (_a = this.data) == null ? void 0 : _a.profiles.map((profile) => ({ ...profile }))) != null ? _b : [];
  }
  selected(region) {
    var _a, _b;
    return (_b = (_a = this.data) == null ? void 0 : _a.selectedByRegion[region]) != null ? _b : null;
  }
  get(id) {
    var _a;
    return (_a = this.data) == null ? void 0 : _a.profiles.find((profile) => profile.id === id);
  }
  pendingDeletes() {
    var _a, _b;
    return [...(_b = (_a = this.data) == null ? void 0 : _a.pendingDeletes) != null ? _b : []];
  }
  deletedIds() {
    var _a, _b;
    return [...(_b = (_a = this.data) == null ? void 0 : _a.deletedIds) != null ? _b : []];
  }
  isPendingDelete(id) {
    var _a, _b;
    return (_b = (_a = this.data) == null ? void 0 : _a.pendingDeletes.includes(id)) != null ? _b : false;
  }
  isDeleted(id) {
    var _a, _b;
    return (_b = (_a = this.data) == null ? void 0 : _a.deletedIds.includes(id)) != null ? _b : false;
  }
  current() {
    var _a;
    if (this.loadError || !this.data) throw new Error((_a = this.loadError) != null ? _a : "\u8D26\u53F7\u6863\u6848\u8D44\u6599\u65E0\u6CD5\u8BFB\u53D6");
    return this.data;
  }
  save(next) {
    const directory = import_path2.default.dirname(this.file), temp = `${this.file}.${process.pid}.${import_crypto2.default.randomBytes(6).toString("hex")}.tmp`;
    let fd;
    try {
      fd = import_fs2.default.openSync(temp, "wx", 384);
      import_fs2.default.writeFileSync(fd, JSON.stringify(next, null, 2), "utf8");
      import_fs2.default.fsyncSync(fd);
      import_fs2.default.closeSync(fd);
      fd = void 0;
      import_fs2.default.renameSync(temp, this.file);
      this.data = next;
    } catch {
      if (fd !== void 0) {
        try {
          import_fs2.default.closeSync(fd);
        } catch {
        }
      }
      try {
        import_fs2.default.unlinkSync(temp);
      } catch {
      }
      throw new Error(`\u8D26\u53F7\u6863\u6848\u4FDD\u5B58\u5931\u8D25\uFF0C\u539F\u8D44\u6599\u4FDD\u6301\u4E0D\u53D8\u3002\u8BF7\u68C0\u67E5\u78C1\u76D8\u7A7A\u95F4\u540E\u91CD\u8BD5\u3002(${directory})`);
    }
  }
  select(profile) {
    const current = this.current();
    if (!profile || !validRegion(profile.region) || profile.id !== accountProfileId(profile.region, profile.slot)) throw new Error("\u8D26\u53F7\u6863\u6848\u65E0\u6548");
    if (current.pendingDeletes.includes(profile.id) || current.deletedIds.includes(profile.id)) throw new Error("\u8BE5\u6863\u6848\u6B63\u5728\u6E05\u7406\uFF0C\u6682\u65F6\u65E0\u6CD5\u9009\u62E9");
    const profiles = current.profiles.some((item) => item.id === profile.id) ? current.profiles : [...current.profiles, { ...profile }];
    const next = { ...current, profiles: profiles.map((item) => ({ ...item })), selectedByRegion: { ...current.selectedByRegion, [profile.region]: profile.id } };
    this.save(next);
  }
  remember(profile) {
    const current = this.current();
    if (!profile || !validRegion(profile.region) || !Number.isSafeInteger(profile.slot) || profile.slot < 1 || profile.id !== accountProfileId(profile.region, profile.slot)) throw new Error("\u8D26\u53F7\u6863\u6848\u65E0\u6548");
    if (current.pendingDeletes.includes(profile.id) || current.deletedIds.includes(profile.id)) throw new Error("\u8BE5\u6863\u6848\u6B63\u5728\u6E05\u7406\uFF0C\u6682\u65F6\u65E0\u6CD5\u4F7F\u7528");
    if (current.profiles.some((item) => item.id === profile.id)) return;
    this.save({ ...current, profiles: [...current.profiles, { ...profile }] });
  }
  create(region, slot, name, serverNote) {
    const current = this.current();
    const normalizedName = name.trim(), normalizedNote = serverNote.trim();
    if (!validRegion(region) || !Number.isSafeInteger(slot) || slot < 1 || !normalizedName || normalizedName.length > 40 || normalizedNote.length > 40) {
      throw new Error("\u8D26\u53F7\u540D\u79F0\u9700\u4E3A1\u201340\u4E2A\u5B57\u7B26\uFF0C\u533A\u670D\u5907\u6CE8\u6700\u591A40\u4E2A\u5B57\u7B26");
    }
    const id = accountProfileId(region, slot);
    if (current.pendingDeletes.includes(id) || current.deletedIds.includes(id)) throw new Error("\u8BE5\u767B\u5F55\u69FD\u4F4D\u6B63\u5728\u6E05\u7406\u6216\u5DF2\u5220\u9664\uFF0C\u4E0D\u80FD\u91CD\u65B0\u5206\u914D");
    if (current.profiles.some((profile2) => profile2.id === id)) throw new Error("\u8BE5\u767B\u5F55\u69FD\u4F4D\u5DF2\u5173\u8054\u8D26\u53F7\u6863\u6848");
    const profile = { id, region, slot, name: normalizedName, serverNote: normalizedNote };
    this.save({ ...current, profiles: [...current.profiles, profile], selectedByRegion: { ...current.selectedByRegion, [region]: id } });
    return { ...profile };
  }
  update(id, name, serverNote) {
    const current = this.current(), normalizedName = name.trim(), normalizedNote = serverNote.trim();
    if (current.pendingDeletes.includes(id) || current.deletedIds.includes(id)) throw new Error("\u8BE5\u6863\u6848\u6B63\u5728\u6E05\u7406\uFF0C\u6682\u65F6\u65E0\u6CD5\u7F16\u8F91");
    if (!normalizedName || normalizedName.length > 40 || normalizedNote.length > 40) throw new Error("\u8D26\u53F7\u540D\u79F0\u9700\u4E3A1\u201340\u4E2A\u5B57\u7B26\uFF0C\u533A\u670D\u5907\u6CE8\u6700\u591A40\u4E2A\u5B57\u7B26");
    const previous = current.profiles.find((profile2) => profile2.id === id);
    if (!previous) throw new Error("\u8D26\u53F7\u6863\u6848\u5DF2\u4E0D\u5B58\u5728");
    const profile = { ...previous, name: normalizedName, serverNote: normalizedNote };
    this.save({ ...current, profiles: current.profiles.map((item) => item.id === id ? profile : item) });
    return { ...profile };
  }
  beginDelete(profile, fallback) {
    var _a;
    const current = this.current();
    if (!profile || !validRegion(profile.region) || profile.id !== accountProfileId(profile.region, profile.slot)) throw new Error("\u8D26\u53F7\u6863\u6848\u65E0\u6548");
    if (current.deletedIds.includes(profile.id)) throw new Error("\u8BE5\u6863\u6848\u5DF2\u7ECF\u5220\u9664");
    if (current.pendingDeletes.includes(profile.id)) return;
    if (fallback && (fallback.region !== profile.region || current.pendingDeletes.includes(fallback.id) || current.deletedIds.includes(fallback.id))) {
      throw new Error("\u5907\u7528\u9009\u62E9\u7684\u8D26\u53F7\u6863\u6848\u65E0\u6548");
    }
    const profiles = new Map(current.profiles.map((item) => [item.id, { ...item }]));
    profiles.set(profile.id, { ...profile });
    if (fallback) profiles.set(fallback.id, { ...fallback });
    const selectedByRegion = { ...current.selectedByRegion };
    if (selectedByRegion[profile.region] === profile.id) selectedByRegion[profile.region] = (_a = fallback == null ? void 0 : fallback.id) != null ? _a : null;
    this.save({
      ...current,
      profiles: [...profiles.values()],
      selectedByRegion,
      pendingDeletes: [...current.pendingDeletes, profile.id]
    });
  }
  completeDelete(id) {
    const current = this.current();
    if (!current.pendingDeletes.includes(id)) throw new Error("\u8BE5\u6863\u6848\u6CA1\u6709\u5F85\u5B8C\u6210\u7684\u6E05\u7406");
    const profile = current.profiles.find((item) => item.id === id);
    if (!profile) throw new Error("\u5F85\u6E05\u7406\u6863\u6848\u8D44\u6599\u5DF2\u4E0D\u5B58\u5728");
    const selectedByRegion = { ...current.selectedByRegion };
    if (selectedByRegion[profile.region] === id) selectedByRegion[profile.region] = null;
    this.save({
      ...current,
      profiles: current.profiles.filter((item) => item.id !== id),
      selectedByRegion,
      pendingDeletes: current.pendingDeletes.filter((item) => item !== id),
      deletedIds: [...current.deletedIds, id]
    });
  }
};
var AccountProfiles = class {
  constructor(store, userDataDirectory, listStoredPartitions) {
    this.store = store;
    this.userDataDirectory = userDataDirectory;
    this.listStoredPartitions = listStoredPartitions;
    this.discovered = [];
    this.discoveryStatus = "idle";
    this.discoveryError = "";
  }
  get status() {
    return this.store.loadError ? "failed" : this.discoveryStatus;
  }
  get error() {
    var _a;
    return (_a = this.store.loadError) != null ? _a : this.discoveryError;
  }
  get canCreate() {
    return !this.store.loadError && this.discoveryStatus === "ready";
  }
  list() {
    const profiles = /* @__PURE__ */ new Map();
    for (const profile of this.discovered) if (!this.store.isDeleted(profile.id)) profiles.set(profile.id, { ...profile });
    for (const profile of this.store.profiles()) if (!this.store.isDeleted(profile.id)) profiles.set(profile.id, { ...profile });
    return [...profiles.values()].sort((a, b) => a.region.localeCompare(b.region) || a.slot - b.slot);
  }
  get(id) {
    return this.list().find((profile) => profile.id === id);
  }
  selected(region) {
    return this.store.selected(region);
  }
  async discover(retry = false) {
    if (retry) {
      this.store.reload();
      this.discovered = [];
      this.discoveryStatus = "idle";
      this.discoveryError = "";
    }
    if (this.store.loadError) throw new Error(this.store.loadError);
    if (!retry && this.discoveryStatus === "ready") return;
    if (this.pending) return this.pending;
    this.discoveryStatus = "loading";
    this.discoveryError = "";
    this.pending = (async () => {
      try {
        const [stored, directories] = await Promise.all([
          this.listStoredPartitions(),
          Promise.resolve(readPartitionDirectoryNames(this.userDataDirectory))
        ]);
        this.discovered = profilesFromLegacySources(directories, stored).filter((profile) => !this.store.isDeleted(profile.id));
        this.discoveryStatus = "ready";
        this.discoveryError = "";
      } catch (error) {
        this.discoveryStatus = "failed";
        this.discoveryError = error instanceof Error ? error.message : "\u65E0\u6CD5\u8BFB\u53D6\u65E7\u767B\u5F55\u69FD\u4F4D\uFF0C\u8BF7\u91CD\u8BD5";
        throw new Error(this.discoveryError);
      } finally {
        this.pending = void 0;
      }
    })();
    return this.pending;
  }
  select(id) {
    const profile = this.get(id);
    if (!profile) throw new Error("\u8D26\u53F7\u6863\u6848\u5DF2\u4E0D\u5B58\u5728\uFF0C\u8BF7\u5237\u65B0\u5217\u8868\u540E\u91CD\u8BD5");
    if (this.store.isPendingDelete(id)) throw new Error("\u8BE5\u6863\u6848\u6B63\u5728\u6E05\u7406\uFF0C\u6682\u65F6\u65E0\u6CD5\u9009\u62E9");
    this.store.select(profile);
    return { ...profile };
  }
  create(region, name, serverNote) {
    if (!this.canCreate) throw new Error(this.error || "\u8BF7\u5148\u5B8C\u6210\u65E7\u767B\u5F55\u69FD\u4F4D\u68C0\u67E5");
    const known = [
      ...this.list().filter((profile) => profile.region === region).map((profile) => profile.slot),
      ...this.store.deletedIds().map((id) => parseSlot(id, profileId)).filter((slot2) => !!slot2 && slot2.region === region).map((slot2) => slot2.slot)
    ];
    const slot = known.length ? Math.max(...known) + 1 : 1;
    if (!Number.isSafeInteger(slot)) throw new Error("\u65E0\u6CD5\u5B89\u5168\u5206\u914D\u65B0\u7684\u767B\u5F55\u69FD\u4F4D");
    return this.store.create(region, slot, name, serverNote);
  }
  update(id, name, serverNote) {
    if (this.store.loadError) throw new Error(this.store.loadError);
    const profile = this.get(id);
    if (!profile) throw new Error("\u8D26\u53F7\u6863\u6848\u5DF2\u4E0D\u5B58\u5728");
    this.store.remember(profile);
    return this.store.update(id, name, serverNote);
  }
  isPendingDelete(id) {
    return this.store.isPendingDelete(id);
  }
  beginDelete(id) {
    if (this.store.loadError) throw new Error(this.store.loadError);
    const profile = this.get(id);
    if (!profile) throw new Error("\u8D26\u53F7\u6863\u6848\u5DF2\u4E0D\u5B58\u5728");
    if (this.store.isPendingDelete(id)) return { ...profile };
    const fallback = this.selected(profile.region) === id ? this.list().find((item) => item.region === profile.region && item.id !== id && !this.store.isPendingDelete(item.id)) : void 0;
    this.store.beginDelete(profile, fallback);
    return { ...profile };
  }
  completeDelete(id) {
    this.store.completeDelete(id);
    this.discovered = this.discovered.filter((profile) => profile.id !== id);
  }
};

// src/main/credentials.ts
var import_child_process2 = require("child_process");
var import_crypto3 = __toESM(require("crypto"));
init_policy();
function keychainTransport(binary, service = "cn.youye.naruto-os.credentials") {
  if (process.platform === "win32") return (init_windows_vault(), __toCommonJS(windows_vault_exports)).windowsVaultTransport(service);
  return (action, value) => new Promise((resolve, reject) => {
    const child = (0, import_child_process2.spawn)(binary, [], { stdio: ["pipe", "pipe", "ignore"] });
    let output = "";
    const timeout = setTimeout(() => {
      child.kill();
      reject(new Error("\u94A5\u5319\u4E32\u54CD\u5E94\u8D85\u65F6\uFF0C\u8BF7\u91CD\u8BD5"));
    }, 6e4);
    child.stdout.on("data", (bytes) => {
      output += bytes;
    });
    child.on("error", () => {
      clearTimeout(timeout);
      reject(new Error("\u65E0\u6CD5\u542F\u52A8\u94A5\u5319\u4E32\u7EC4\u4EF6\uFF0C\u8BF7\u5148\u6784\u5EFA\u9879\u76EE"));
    });
    child.on("close", () => {
      var _a;
      clearTimeout(timeout);
      try {
        const response = JSON.parse(output);
        if (!response.ok) throw new Error();
        resolve((_a = response.value) != null ? _a : "");
      } catch {
        reject(new Error("\u65E0\u6CD5\u8BBF\u95EE\u94A5\u5319\u4E32\uFF0C\u8BF7\u68C0\u67E5\u7CFB\u7EDF\u6388\u6743\u540E\u91CD\u8BD5"));
      }
    });
    child.stdin.on("error", () => {
    });
    child.stdin.end(JSON.stringify({ action, service, value }));
  });
}
var CredentialVault = class {
  constructor(transport) {
    this.transport = transport;
    this.queue = Promise.resolve();
    this.revisionSecret = import_crypto3.default.randomBytes(32);
  }
  revision(record) {
    return import_crypto3.default.createHmac("sha256", this.revisionSecret).update(`${record.id}\0${record.updatedAt}\0${record.password}`).digest("hex");
  }
  async read() {
    const serialized = await this.transport("read");
    let records;
    try {
      records = JSON.parse(serialized);
    } catch {
      throw new Error("\u94A5\u5319\u4E32\u6570\u636E\u683C\u5F0F\u5F02\u5E38");
    }
    if (!Array.isArray(records) || records.some((r) => !r || typeof r.id !== "string" || !credentialStorageOrigin(r.origin) || typeof r.username !== "string" || typeof r.password !== "string")) throw new Error("\u94A5\u5319\u4E32\u6570\u636E\u683C\u5F0F\u5F02\u5E38");
    return records;
  }
  async change(update) {
    const task = this.queue.then(async () => {
      await this.transport("write", JSON.stringify(update(await this.read())));
    });
    this.queue = task.catch(() => {
    });
    await task;
  }
  async list(origin2, query = "") {
    await this.queue;
    return (await this.read()).filter((r) => (!origin2 || r.origin === origin2) && r.username.toLocaleLowerCase().includes(query.toLocaleLowerCase())).map(({ password: _, ...info }) => info);
  }
  async selected(id, origin2) {
    var _a;
    await this.queue;
    return (_a = (await this.read()).find((r) => r.id === id && r.origin === origin2)) != null ? _a : null;
  }
  async needsSave(origin2, username, password) {
    const normalizedUsername = username.trim();
    await this.queue;
    const record = (await this.read()).find((r) => r.origin === origin2 && r.username.trim() === normalizedUsername);
    return { needed: (record == null ? void 0 : record.password) !== password, update: !!record };
  }
  async save(origin2, username, password, id) {
    const normalizedUsername = username.trim();
    if (!credentialStorageOrigin(origin2) || !normalizedUsername || normalizedUsername.length > 320 || !password || password.length > 4096) throw new Error("\u8D26\u53F7\u6216\u7F51\u7AD9\u4FE1\u606F\u65E0\u6548");
    await this.change((records) => {
      var _a;
      const previous = id ? records.find((r) => r.id === id && r.origin === origin2) : records.find((r) => r.origin === origin2 && r.username.trim() === normalizedUsername);
      if (id && !previous) throw new Error("\u8D26\u53F7\u5DF2\u4E0D\u5B58\u5728");
      if (records.some((r) => r.origin === origin2 && r.username.trim() === normalizedUsername && r.id !== (previous == null ? void 0 : previous.id))) throw new Error("\u8BE5\u7F51\u7AD9\u5DF2\u4FDD\u5B58\u540C\u540D\u8D26\u53F7");
      const record = { id: (_a = previous == null ? void 0 : previous.id) != null ? _a : import_crypto3.default.randomBytes(16).toString("hex"), origin: origin2, username: normalizedUsername, password, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
      return [...records.filter((r) => r.id !== record.id), record];
    });
  }
  async addManual(origin2, username, password, expected) {
    const normalizedUsername = username.trim();
    if (!manualCredentialSiteForOrigin(origin2) || !normalizedUsername || normalizedUsername.length > 320 || !password || password.length > 4096) throw new Error("\u8D26\u53F7\u6216\u7F51\u7AD9\u4FE1\u606F\u65E0\u6548");
    const task = this.queue.then(async () => {
      var _a;
      const records = await this.read();
      const existing = records.find((record2) => record2.origin === origin2 && record2.username.trim() === normalizedUsername);
      if ((existing == null ? void 0 : existing.password) === password) return { status: "unchanged" };
      if (existing && (!expected || expected.id !== existing.id || expected.version !== this.revision(existing))) {
        return { status: "confirm-update", id: existing.id, version: this.revision(existing) };
      }
      if (!existing && expected) return { status: "stale" };
      const record = {
        id: (_a = existing == null ? void 0 : existing.id) != null ? _a : import_crypto3.default.randomBytes(16).toString("hex"),
        origin: origin2,
        username: normalizedUsername,
        password,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      await this.transport("write", JSON.stringify([...records.filter((item) => item.id !== record.id), record]));
      return { status: "saved" };
    });
    this.queue = task.then(() => void 0, () => void 0);
    return task;
  }
  async remove(id) {
    await this.change((records) => records.filter((r) => r.id !== id));
  }
  async reveal(id) {
    await this.queue;
    const item = (await this.read()).find((r) => r.id === id);
    if (!item) throw new Error("\u8D26\u53F7\u5DF2\u4E0D\u5B58\u5728");
    return item.password;
  }
};

// src/main/flash.ts
var import_fs3 = __toESM(require("fs"));
var import_path4 = __toESM(require("path"));
var import_child_process3 = require("child_process");
var peMachine = (file) => {
  const bytes = import_fs3.default.readFileSync(file);
  if (bytes.toString("ascii", 0, 2) !== "MZ") return 0;
  const pe = bytes.readUInt32LE(60);
  if (bytes.toString("ascii", pe, pe + 4) !== "PE\0\0") return 0;
  return bytes.readUInt16LE(pe + 4);
};
var expectedMachine = process.arch === "x64" ? 34404 : process.arch === "ia32" ? 332 : 0;
var signedByAdobe = (file) => {
  try {
    (0, import_child_process3.execFileSync)(
      "powershell.exe",
      [
        "-NoProfile",
        "-NonInteractive",
        "-Command",
        `$s=Get-AuthenticodeSignature -LiteralPath '${file.replace(/'/g, "''")}'; if ($s.Status -ne 'Valid') { exit 1 }; if ($s.SignerCertificate.Subject -notmatch 'Adobe') { exit 1 }`
      ],
      { stdio: "ignore", timeout: 8e3, windowsHide: true }
    );
    return true;
  } catch {
    return false;
  }
};
var installedFlash = (preferred) => {
  const root2 = import_path4.default.join(process.env.WINDIR || "C:\\Windows", process.arch === "x64" ? "System32" : "SysWOW64", "Macromed", "Flash");
  const rank = (version) => version.split(".").reduce((total, part) => total * 1e3 + Number(part), 0);
  let best;
  try {
    for (const name of import_fs3.default.readdirSync(root2)) {
      const match = /^pepflashplayer(?:64|32)_(\d+)_(\d+)_(\d+)_(\d+)\.dll$/.exec(name);
      if (!match || match[1] !== preferred) continue;
      const version = match.slice(1).join(".");
      const file = import_path4.default.join(root2, name);
      if (!expectedMachine || peMachine(file) !== expectedMachine || !signedByAdobe(file)) continue;
      if (!best || rank(version) > rank(best.version)) best = { file, version };
    }
  } catch {
    return null;
  }
  return best ? { path: best.file, version: best.version, available: true } : null;
};
function findFlash(root2, preferred) {
  var _a, _b;
  if (process.platform === "win32") {
    const plugin2 = import_path4.default.join(root2, "runtime", `flash-${preferred}`, "PepperFlashPlayer.dll");
    try {
      const machine = peMachine(plugin2);
      if (!expectedMachine || machine !== expectedMachine) throw new Error();
      const metadata = JSON.parse(import_fs3.default.readFileSync(import_path4.default.join(root2, "runtime", `flash-${preferred}`, "version.json"), "utf8"));
      if (((_a = metadata.version) == null ? void 0 : _a.split(".")[0]) !== preferred || metadata.arch !== process.arch) throw new Error();
      return { path: plugin2, version: metadata.version, available: true };
    } catch {
      return (_b = installedFlash(preferred)) != null ? _b : { path: plugin2, version: preferred, available: false };
    }
  }
  const plugin = import_path4.default.join(root2, "runtime", `flash-${preferred}`, "PepperFlashPlayer.plugin");
  try {
    const version = (0, import_child_process3.execFileSync)("/usr/libexec/PlistBuddy", ["-c", "Print :CFBundleShortVersionString", import_path4.default.join(plugin, "Contents/Info.plist")], { encoding: "utf8" }).trim();
    if (version.split(".")[0] !== preferred || !import_fs3.default.existsSync(import_path4.default.join(plugin, "Contents/MacOS/PepperFlashPlayer"))) throw new Error();
    return { path: plugin, version, available: true };
  } catch {
    return { path: plugin, version: preferred, available: false };
  }
}

// src/main/game.ts
var import_electron = require("electron");
var import_path5 = __toESM(require("path"));
init_model();
init_policy();

// src/main/extensions.ts
var import_events = require("events");
var GameLifecycle = class extends import_events.EventEmitter {
  opened(context) {
    this.emit("opened", context);
  }
  changed(context) {
    this.emit("changed", context);
  }
  closed(id) {
    this.emit("closed", id);
  }
};

// src/shared/brazil-login.ts
function isBrazilLoginPage(value) {
  try {
    const url = new URL(value);
    return !url.username && !url.password && url.origin === "https://naruto.narutowebgame.com" && /^\/pt(?:\/login|\/serverlist)?\/?$/.test(url.pathname);
  } catch {
    return false;
  }
}
function isBrazilWrapperPage(value) {
  try {
    const url = new URL(value);
    return !url.username && !url.password && url.origin === "https://naruto.narutowebgame.com" && /^\/pt(?:\/login|\/serverlist\/s\d{1,6})?\/?$/.test(url.pathname);
  } catch {
    return false;
  }
}
function loginRequestKey(value) {
  var _a, _b;
  try {
    const url = new URL(value);
    let stage;
    if (url.origin === "https://passport.oasgames.com" && /^\/(?:index.php)?$/.test(url.pathname) && url.searchParams.get("m") === "login") stage = "auth";
    else if (url.origin === "https://passport.oasgames.com" && /^\/(?:index.php)?$/.test(url.pathname) && url.searchParams.get("m") === "getLoginUser") stage = "userinfo";
    else if (url.origin === "https://odp3.oasgames.com" && url.pathname === "/api/game/get-user-servers") stage = "servers";
    else return null;
    const callback = (_a = url.searchParams.get("callback")) != null ? _a : "";
    const cache = (_b = url.searchParams.get("_")) != null ? _b : "";
    return /^[A-Za-z_$][\w$]{0,119}$/.test(callback) && /^\d{1,20}$/.test(cache) ? { stage, callback, cache } : null;
  } catch {
    return null;
  }
}
function retryAfterSeconds(value, now = Date.now()) {
  if (!value) return 30;
  const seconds = /^\d+$/.test(value) ? Number(value) : Math.ceil((Date.parse(value) - now) / 1e3);
  return Number.isFinite(seconds) ? Math.max(1, Math.min(300, seconds)) : 30;
}

// src/main/game.ts
var GameSessions = class {
  constructor(window, changed2, report2, entry = ENTRY_URL, isolated = false, loginSessions2, diagnostic = () => {
  }) {
    this.window = window;
    this.changed = changed2;
    this.report = report2;
    this.entry = entry;
    this.isolated = isolated;
    this.loginSessions = loginSessions2;
    this.diagnostic = diagnostic;
    this.tabs = [];
    this.activeId = null;
    this.muted = false;
    this.hidden = false;
    this.top = CHROME_HEIGHT;
    this.lifecycle = new GameLifecycle();
    this.inspectNextGame = false;
    this.refreshIntents = /* @__PURE__ */ new Map();
    this.sessionCleanup = /* @__PURE__ */ new Map();
    this.sessionListeners = /* @__PURE__ */ new Map();
  }
  create(saved, entry, preparedProfile, profileSlot) {
    var _a, _b, _c, _d;
    const inspectOnStart = this.inspectNextGame;
    this.inspectNextGame = false;
    const region = validRegion(saved.region) ? saved.region : "br";
    const initialURL = entry != null ? entry : this.entry === ENTRY_URL ? REGIONS[region].url : this.entry;
    const profile = preparedProfile != null ? preparedProfile : profileSlot === void 0 ? (_a = this.loginSessions) == null ? void 0 : _a.acquire(region) : (_b = this.loginSessions) == null ? void 0 : _b.acquireSlot(region, profileSlot);
    const view = new import_electron.BrowserView({ webPreferences: {
      partition: (_c = profile == null ? void 0 : profile.partition) != null ? _c : `naruto-${saved.id}`,
      plugins: true,
      preload: import_path5.default.join(__dirname, "../preload/game.js"),
      nodeIntegration: false,
      nodeIntegrationInWorker: false,
      nodeIntegrationInSubFrames: false,
      contextIsolation: true,
      worldSafeExecuteJavaScript: true,
      sandbox: true,
      enableRemoteModule: false,
      backgroundThrottling: false,
      webSecurity: true,
      allowRunningInsecureContent: false,
      nativeWindowOpen: false,
      spellcheck: false
    } });
    const tab = { ...saved, region, entry: initialURL, state: "loading", title: "\u706B\u5F71\u5FCD\u8005 Online", view, generation: 0, profile };
    this.tabs.push(tab);
    this.window.addBrowserView(view);
    view.setBounds({ x: -1e4, y: this.top, width: 1280, height: 700 });
    view.setBackgroundColor(import_electron.nativeTheme.shouldUseDarkColors ? "#1c1c1c" : "#f5f5f5");
    view.webContents.setAudioMuted(true);
    const contents = view.webContents;
    const session5 = contents.session;
    try {
      patchService.attach(session5, region);
    } catch (error) {
      console.error("PATCH_ATTACH_FAILED", error);
    }
    session5.setPermissionRequestHandler((_wc, permission, callback) => callback(permission === "fullscreen"));
    session5.setPermissionCheckHandler((_wc, permission) => permission === "fullscreen");
    const blockDownload = (event) => {
      event.preventDefault();
      this.report("\u6682\u4E0D\u652F\u6301\u6587\u4EF6\u4E0B\u8F7D");
    };
    session5.on("will-download", blockDownload);
    const contentsId = view.webContents.id;
    let listeners = this.sessionListeners.get(session5);
    if (!listeners) {
      listeners = /* @__PURE__ */ new Map();
      this.sessionListeners.set(session5, listeners);
      const shared = listeners;
      session5.webRequest.onErrorOccurred({ urls: ["http://*/*", "https://*/*"] }, (details2) => {
        const listener = details2.webContentsId === void 0 ? Array.from(shared.values())[0] : shared.get(details2.webContentsId);
        listener == null ? void 0 : listener.error(details2);
      });
      session5.webRequest.onResponseStarted({ urls: ["http://*/*", "https://*/*"] }, (details2) => {
        if (details2.webContentsId === void 0 && details2.resourceType !== "mainFrame") {
          for (const listener2 of shared.values()) listener2.response(details2);
          return;
        }
        const matches = details2.webContentsId === void 0 && details2.resourceType === "mainFrame" ? Array.from(shared.values()).filter((listener2) => listener2.matchesNavigation(details2.url)) : [];
        const listener = details2.webContentsId !== void 0 ? shared.get(details2.webContentsId) : matches.length === 1 ? matches[0] : void 0;
        listener == null ? void 0 : listener.response(details2);
      });
    }
    this.sessionCleanup.set(contentsId, () => {
      try {
        patchService.detach(session5);
      } catch (error) {
        console.error("PATCH_DETACH_FAILED", error);
      }
      session5.removeListener("will-download", blockDownload);
      listeners.delete(contentsId);
      if (!listeners.size) {
        session5.webRequest.onResponseStarted(null);
        session5.webRequest.onErrorOccurred(null);
        session5.setPermissionRequestHandler(null);
        session5.setPermissionCheckHandler(null);
        this.sessionListeners.delete(session5);
      }
      profile == null ? void 0 : profile.release();
    });
    const clearRefresh = () => this.clearRefreshIntent(contentsId);
    view.webContents.on("will-prevent-unload", (event) => {
      if (!this.refreshIntents.has(contentsId)) return;
      clearRefresh();
      event.preventDefault();
    });
    view.webContents.on("did-navigate", clearRefresh);
    view.webContents.once("destroyed", () => {
      clearRefresh();
      this.releaseSession(contentsId);
    });
    const update = (state2) => {
      if (contents.isDestroyed()) return;
      tab.state = state2;
      this.lifecycle.changed(this.context(tab));
      this.changed();
    };
    let pendingNavigation = "";
    view.webContents.on("did-start-navigation", (_event, url, inPlace, mainFrame) => {
      if (mainFrame && !inPlace) {
        pendingNavigation = url;
        tab.generation++;
        update("loading");
      }
    });
    const ready = () => {
      if (tab.state === "loading") update("ready");
    };
    view.webContents.on("dom-ready", ready);
    view.webContents.on("did-finish-load", ready);
    view.webContents.on("did-stop-loading", ready);
    const service = (url) => {
      try {
        const host = new URL(url).hostname;
        return ["passport.oasgames.com", "odp3.oasgames.com", "naruto.narutowebgame.com", "naruto.oasgames.com"].includes(host) ? host.replace(/\./g, "_") : "OTHER";
      } catch {
        return "UNKNOWN";
      }
    };
    const onError = (details2) => {
      if (/^net::ERR_[A-Z_]+$/.test(details2.error)) this.diagnostic("GAME_NETWORK_" + service(details2.url) + "_" + details2.error.slice(5));
    };
    const onResponse = (details2) => {
      var _a2, _b2;
      if (details2.statusCode >= 400) this.diagnostic("GAME_HTTP_" + details2.statusCode + "_" + service(details2.url));
      if ((details2.webContentsId === contents.id || details2.webContentsId === void 0 && pendingNavigation === details2.url) && details2.resourceType === "mainFrame" && details2.statusCode >= 400 && !contents.isDestroyed()) {
        clearRefresh();
        update("failed");
      }
      if (details2.statusCode === 403 && details2.resourceType === "mainFrame") {
        try {
          if (new URL(details2.url).pathname === "/") {
            this.diagnostic("GAME_ROOT_403_" + service(details2.url));
            this.report("\u6E38\u620F\u5165\u53E3\u8FD4\u56DE\u6839\u8DEF\u5F84 403\uFF1B\u8FD9\u662F\u6062\u590D\u9636\u6BB5\u4FE1\u53F7\uFF0C\u4E0D\u4EE3\u8868\u5DF2\u786E\u8BA4\u6545\u969C\u539F\u56E0\uFF0C\u53EF\u5C1D\u8BD5\u201C\u91CD\u65B0\u83B7\u53D6\u6E38\u620F\u5165\u53E3\u201D");
          }
        } catch {
        }
      }
      if (view.webContents.isDestroyed() || !isBrazilLoginPage(view.webContents.getURL()) || ![403, 429, 500, 502, 503, 504].includes(details2.statusCode)) return;
      const key = loginRequestKey(details2.url);
      if (!key) return;
      const headers = (_a2 = details2.responseHeaders) != null ? _a2 : {};
      const retry = Object.keys(headers).find((name) => name.toLowerCase() === "retry-after");
      view.webContents.send("game:login-network-error", { ...key, status: details2.statusCode, retryAfter: retryAfterSeconds(retry ? (_b2 = headers[retry]) == null ? void 0 : _b2[0] : void 0) });
    };
    listeners.set(contentsId, { error: onError, response: onResponse, matchesNavigation: (url) => pendingNavigation === url });
    view.webContents.on("did-fail-load", (_event, code, _description, _url, mainFrame) => {
      if (mainFrame && code !== -3) {
        clearRefresh();
        update("failed");
      }
    });
    view.webContents.on("render-process-gone", () => {
      clearRefresh();
      update("crashed");
    });
    view.webContents.on("plugin-crashed", () => update("crashed"));
    view.webContents.on("page-title-updated", (event, title) => {
      event.preventDefault();
      tab.title = title.slice(0, 120);
      this.changed();
    });
    const navigate = (event, url) => {
      if (webURL(url)) return;
      event.preventDefault();
      this.report("\u6B64\u94FE\u63A5\u4E0D\u662F\u7F51\u9875\uFF0C\u65E0\u6CD5\u5728\u542F\u52A8\u5668\u5185\u6253\u5F00");
    };
    view.webContents.on("will-navigate", (event, url) => {
      clearRefresh();
      navigate(event, url);
    });
    view.webContents.on("will-redirect", (event, url, _inPlace, mainFrame) => {
      if (mainFrame) pendingNavigation = url;
      navigate(event, url);
    });
    view.webContents.on("new-window", (event, url) => {
      clearRefresh();
      event.preventDefault();
      if (webURL(url)) void view.webContents.loadURL(url).catch(() => {
      });
      else if (url !== "about:blank") this.report("\u6B64\u94FE\u63A5\u4E0D\u662F\u7F51\u9875\uFF0C\u65E0\u6CD5\u5728\u542F\u52A8\u5668\u5185\u6253\u5F00");
    });
    view.webContents.on("will-attach-webview", (event) => event.preventDefault());
    this.lifecycle.opened(this.context(tab));
    const open = () => {
      if (contents.isDestroyed()) return;
      if (inspectOnStart) contents.openDevTools({ mode: "detach" });
      void contents.loadURL(initialURL).catch(() => {
      });
    };
    const restore = (_d = profile == null ? void 0 : profile.ready.catch(() => {
    })) != null ? _d : Promise.resolve();
    const proxy = process.env.NARUTO_PROXY;
    const route = this.isolated ? { proxyRules: "direct://" } : proxy ? { proxyRules: proxy } : null;
    if (route) void Promise.all([restore, session5.setProxy(route)]).then(open).catch(() => {
      update("failed");
      this.report("\u6E38\u620F\u4F1A\u8BDD\u7F51\u7EDC\u521D\u59CB\u5316\u5931\u8D25");
    });
    else if (profile) void restore.then(open);
    else open();
    return tab;
  }
  context(tab) {
    return { id: tab.id, state: tab.state, refresh: () => this.refresh(tab.id), setMuted: (muted) => tab.view.webContents.setAudioMuted(muted) };
  }
  waitForReady(id, timeoutMs = 6e4) {
    const tab = this.tabs.find((item) => item.id === id);
    if (!tab) return Promise.reject(new Error("game-tab-missing"));
    if (tab.state === "ready") return Promise.resolve();
    if (tab.state === "failed" || tab.state === "crashed") return Promise.reject(new Error("game-tab-failed"));
    return new Promise((resolve, reject) => {
      let timer;
      const cleanup = () => {
        clearTimeout(timer);
        this.lifecycle.removeListener("changed", check);
        this.lifecycle.removeListener("closed", closed);
      };
      const check = (context) => {
        if (context.id !== id) return;
        if (context.state === "ready") {
          cleanup();
          resolve();
        } else if (context.state === "failed" || context.state === "crashed") {
          cleanup();
          reject(new Error("game-tab-failed"));
        }
      };
      const closed = (closedId) => {
        if (closedId === id) {
          cleanup();
          reject(new Error("game-tab-closed"));
        }
      };
      timer = setTimeout(() => {
        cleanup();
        reject(new Error("game-tab-timeout"));
      }, timeoutMs);
      this.lifecycle.on("changed", check);
      this.lifecycle.on("closed", closed);
      check({ id, state: tab.state });
    });
  }
  get active() {
    return this.tabs.find((tab) => tab.id === this.activeId);
  }
  toggleDeveloperTools() {
    var _a;
    const contents = (_a = this.active) == null ? void 0 : _a.view.webContents;
    if (!contents || contents.isDestroyed()) {
      this.inspectNextGame = !this.inspectNextGame;
      this.report(this.inspectNextGame ? "\u4E0B\u6B21\u6253\u5F00\u6E38\u620F\u65F6\u5C06\u81EA\u52A8\u6253\u5F00\u5F00\u53D1\u8005\u5DE5\u5177" : "\u5DF2\u53D6\u6D88\u4E0B\u6B21\u81EA\u52A8\u6253\u5F00\u5F00\u53D1\u8005\u5DE5\u5177");
      return;
    }
    if (contents.isDevToolsOpened()) {
      contents.closeDevTools();
      return;
    }
    contents.openDevTools({ mode: "detach" });
  }
  fromSender(id) {
    return this.tabs.find((tab) => tab.view.webContents.id === id);
  }
  select(id) {
    var _a;
    if (id && !this.tabs.some((t) => t.id === id)) return;
    this.activeId = id;
    this.layout();
    this.syncAudio();
    this.changed();
    if (!this.hidden) (_a = this.active) == null ? void 0 : _a.view.webContents.focus();
  }
  updateSurfaceTheme() {
    for (const tab of this.tabs) if (!tab.view.webContents.isDestroyed()) tab.view.setBackgroundColor(import_electron.nativeTheme.shouldUseDarkColors ? "#1c1c1c" : "#f5f5f5");
  }
  syncAudio() {
    for (const tab of this.tabs) if (!tab.view.webContents.isDestroyed()) tab.view.webContents.setAudioMuted(this.muted || tab.id !== this.activeId);
  }
  layout() {
    const active = this.active;
    const target = !this.hidden && active && !["crashed", "failed"].includes(active.state) ? active.view : null;
    const [width, height] = this.window.getContentSize();
    for (const tab of this.tabs) {
      const next = { x: tab.view === target ? 0 : -1e4, y: this.top, width, height: Math.max(0, height - this.top) };
      const previous = tab.view.getBounds();
      if (Object.keys(next).some((key) => next[key] !== previous[key])) tab.view.setBounds(next);
    }
    if (target && this.window.getBrowserViews().slice(-1)[0] !== target) this.window.setTopBrowserView(target);
  }
  clearRefreshIntent(id) {
    const timer = this.refreshIntents.get(id);
    if (timer) clearTimeout(timer);
    this.refreshIntents.delete(id);
  }
  releaseSession(id) {
    const cleanup = this.sessionCleanup.get(id);
    this.sessionCleanup.delete(id);
    cleanup == null ? void 0 : cleanup();
  }
  refresh(id = this.activeId) {
    const tab = this.tabs.find((t) => t.id === id);
    if (!tab || tab.view.webContents.isDestroyed()) return;
    const contentsId = tab.view.webContents.id;
    this.clearRefreshIntent(contentsId);
    this.refreshIntents.set(contentsId, setTimeout(() => this.clearRefreshIntent(contentsId), 3e4));
    tab.state = "loading";
    this.layout();
    this.changed();
    if (!tab.view.webContents.getURL() || tab.view.webContents.isCrashed()) void tab.view.webContents.loadURL(tab.entry).catch(() => {
    });
    else tab.view.webContents.reload();
  }
  close(id, options = {}) {
    var _a, _b;
    const index = this.tabs.findIndex((t) => t.id === id);
    if (index < 0) return;
    const [tab] = this.tabs.splice(index, 1);
    this.clearRefreshIntent(tab.view.webContents.id);
    this.releaseSession(tab.view.webContents.id);
    this.window.removeBrowserView(tab.view);
    if (!tab.view.webContents.isDestroyed()) tab.view.webContents.stop();
    const contents = tab.view.webContents;
    if (options.deferDestroy) setTimeout(() => {
      if (!contents.isDestroyed()) contents.destroy();
    }, 50);
    else contents.destroy();
    this.lifecycle.closed(id);
    if (this.activeId === id) this.activeId = (_b = (_a = this.tabs[Math.min(index, this.tabs.length - 1)]) == null ? void 0 : _a.id) != null ? _b : null;
    this.layout();
    this.syncAudio();
    this.changed();
  }
  destroy() {
    for (const tab of [...this.tabs]) this.close(tab.id);
  }
};

// src/main/login-sessions.ts
var import_electron2 = require("electron");
function cookieIdentity(cookie) {
  var _a;
  return JSON.stringify([cookie.name, ((_a = cookie.domain) != null ? _a : "").replace(/^\./, "").toLowerCase(), cookie.path, cookie.hostOnly === true]);
}
function restoreEventIdentity(cookie, removed) {
  return JSON.stringify([cookieIdentity(cookie), cookie.value, removed]);
}
function sameCookie(a, b) {
  return JSON.stringify([
    a.name,
    a.value,
    a.domain,
    a.path,
    a.secure,
    a.httpOnly,
    a.sameSite,
    a.session,
    a.hostOnly,
    a.expirationDate
  ]) === JSON.stringify([
    b.name,
    b.value,
    b.domain,
    b.path,
    b.secure,
    b.httpOnly,
    b.sameSite,
    b.session,
    b.hostOnly,
    b.expirationDate
  ]);
}
function changedCookies(before, after) {
  const oldById = new Map(before.filter((cookie) => cookie.session).map((cookie) => [cookieIdentity(cookie), cookie]));
  const nextById = new Map(after.filter((cookie) => cookie.session).map((cookie) => [cookieIdentity(cookie), cookie]));
  const result = [];
  for (const id of /* @__PURE__ */ new Set([...oldById.keys(), ...nextById.keys()])) {
    const oldCookie = oldById.get(id), nextCookie = nextById.get(id);
    if (oldCookie && nextCookie && sameCookie(oldCookie, nextCookie)) continue;
    if (nextCookie) result.push({ cookie: nextCookie, removed: false });
    else if (oldCookie) result.push({ cookie: oldCookie, removed: true });
  }
  return result;
}
function mergeCookieChanges(base, changes) {
  if (!changes.size) return base;
  const result = [], applied = /* @__PURE__ */ new Set();
  for (const cookie of base) {
    const id = cookieIdentity(cookie), change = changes.get(id);
    if (!change) {
      result.push(cookie);
      continue;
    }
    if (applied.has(id)) continue;
    if (change.cookie) result.push(change.cookie);
    applied.add(id);
  }
  for (const [id, change] of changes) if (!applied.has(id) && change.cookie) result.push(change.cookie);
  return result;
}
var LoginSessions = class {
  constructor(transport, report2) {
    this.transport = transport;
    this.report = report2;
    this.profiles = /* @__PURE__ */ new Map();
    this.deleting = /* @__PURE__ */ new Set();
    this.blockedDeletes = /* @__PURE__ */ new Set();
    this.queue = Promise.resolve();
    this.pendingPreparations = 0;
    this.failureReported = false;
  }
  async listStoredPartitions() {
    return parseStoredPartitionNames(await this.transport("list-partitions"));
  }
  leaseCount(region, slot) {
    var _a, _b;
    return (_b = (_a = this.profiles.get(`persist:naruto-${region}-${slot}`)) == null ? void 0 : _a.leases) != null ? _b : 0;
  }
  acquire(region) {
    var _a, _b;
    let slot = 1;
    while (((_b = (_a = this.profiles.get(`persist:naruto-${region}-${slot}`)) == null ? void 0 : _a.leases) != null ? _b : 0) > 0 || this.deleting.has(`persist:naruto-${region}-${slot}`) || this.blockedDeletes.has(`persist:naruto-${region}-${slot}`)) slot++;
    return this.acquirePartition(`persist:naruto-${region}-${slot}`);
  }
  acquireSlot(region, slot) {
    var _a, _b;
    if (!Number.isSafeInteger(slot) || slot < 1 || region !== "br" && region !== "cn") throw new Error("\u8D26\u53F7\u767B\u5F55\u69FD\u4F4D\u65E0\u6548");
    const partition = `persist:naruto-${region}-${slot}`;
    if (this.deleting.has(partition) || this.blockedDeletes.has(partition)) throw new Error("\u8BE5\u8D26\u53F7\u6863\u6848\u6B63\u5728\u6E05\u7406\uFF0C\u8BF7\u5148\u5B8C\u6210\u6E05\u7406");
    if (((_b = (_a = this.profiles.get(partition)) == null ? void 0 : _a.leases) != null ? _b : 0) > 0) throw new Error("\u8BE5\u8D26\u53F7\u6863\u6848\u5DF2\u6709\u6253\u5F00\u4E2D\u7684\u6807\u7B7E");
    return this.acquirePartition(partition);
  }
  acquirePartition(partition) {
    if (this.deleting.has(partition) || this.blockedDeletes.has(partition)) throw new Error("\u8BE5\u8D26\u53F7\u6863\u6848\u6B63\u5728\u6E05\u7406\uFF0C\u8BF7\u5148\u5B8C\u6210\u6E05\u7406");
    let profile = this.profiles.get(partition);
    if (!profile) {
      const ses = import_electron2.session.fromPartition(partition);
      profile = {
        session: ses,
        leases: 0,
        ready: Promise.resolve(),
        readyStatus: "pending",
        changed: () => {
        },
        restorePending: true,
        mergeRequired: false,
        applyingStored: false,
        revision: 0,
        persistedRevision: 0,
        forceDirty: false,
        changes: /* @__PURE__ */ new Map(),
        ignoredRestoreChanges: /* @__PURE__ */ new Map()
      };
      const current = profile;
      current.changed = (_event, cookie, _cause, removed) => {
        var _a;
        const restoreKey = restoreEventIdentity(cookie, removed), ignored = (_a = current.ignoredRestoreChanges.get(restoreKey)) != null ? _a : 0;
        if (ignored > 0) {
          if (ignored === 1) current.ignoredRestoreChanges.delete(restoreKey);
          else current.ignoredRestoreChanges.set(restoreKey, ignored - 1);
          return;
        }
        if (current.applyingStored || !cookie.session) return;
        if (current.restorePending || current.mergeRequired) {
          if (this.recordChange(current, cookie, removed) && current.mergeRequired) this.scheduleSave(partition, current);
          return;
        }
        current.revision++;
        this.scheduleSave(partition, current);
      };
      this.profiles.set(partition, current);
      this.prepare(partition, current);
    } else if (profile.leases === 0 && (profile.restorePending && profile.readyStatus === "failed" || profile.mergeRequired || this.hasPendingChanges(profile))) {
      if (profile.mergeRequired) profile.restorePending = true;
      this.prepare(partition, profile);
    }
    return this.lease(partition, profile);
  }
  retain(partition) {
    const profile = this.profiles.get(partition);
    if (!/^persist:naruto-(br|cn)-[1-9]\d*$/.test(partition) || this.deleting.has(partition) || this.blockedDeletes.has(partition) || !profile || profile.leases === 0) throw new Error("profile-not-active");
    return this.lease(partition, profile);
  }
  async clearProfile(region, slot, onStage = () => {
  }) {
    var _a;
    if (region !== "br" && region !== "cn" || !Number.isSafeInteger(slot) || slot < 1) throw new Error("\u8D26\u53F7\u767B\u5F55\u69FD\u4F4D\u65E0\u6548");
    const partition = `persist:naruto-${region}-${slot}`;
    if (this.deleting.has(partition)) throw new Error("\u8BE5\u8D26\u53F7\u6863\u6848\u6B63\u5728\u6E05\u7406\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5");
    const profile = this.profiles.get(partition);
    if (((_a = profile == null ? void 0 : profile.leases) != null ? _a : 0) > 0) throw new Error("\u8BE5\u8D26\u53F7\u6863\u6848\u4ECD\u6709\u6253\u5F00\u4E2D\u7684\u6807\u7B7E\u6216\u767B\u5F55\u4EFB\u52A1\uFF0C\u8BF7\u5148\u7ED3\u675F\u540E\u91CD\u8BD5");
    this.blockedDeletes.add(partition);
    this.deleting.add(partition);
    if (profile) {
      this.cancelTimer(profile);
      profile.session.cookies.removeListener("changed", profile.changed);
    }
    let stage = "\u6E05\u7406 Chromium \u7F51\u7AD9\u6570\u636E";
    try {
      await this.enqueue(async () => {
        var _a2, _b, _c;
        if (((_b = (_a2 = this.profiles.get(partition)) == null ? void 0 : _a2.leases) != null ? _b : 0) > 0) throw new Error("\u8BE5\u8D26\u53F7\u6863\u6848\u4ECD\u6709\u6253\u5F00\u4E2D\u7684\u6807\u7B7E\u6216\u767B\u5F55\u4EFB\u52A1");
        onStage(stage);
        const target = (_c = profile == null ? void 0 : profile.session) != null ? _c : import_electron2.session.fromPartition(partition);
        await target.clearStorageData();
        await target.clearCache();
        target.flushStorageData();
        if (profile) {
          this.cancelTimer(profile);
          profile.session.cookies.removeListener("changed", profile.changed);
          profile.changes.clear();
          profile.ignoredRestoreChanges.clear();
          profile.restorePending = false;
          profile.mergeRequired = false;
          profile.forceDirty = false;
          profile.revision = profile.persistedRevision;
          this.profiles.delete(partition);
        }
        stage = "\u6E05\u7406\u94A5\u5319\u4E32\u767B\u5F55\u5FEB\u7167";
        onStage(stage);
        const stored = await this.read();
        const next = { version: 1, partitions: { ...stored.partitions } };
        delete next.partitions[partition];
        const serialized = JSON.stringify(next);
        if (serialized !== this.serialized) await this.transport("write", serialized);
        this.serialized = serialized;
        this.stored = Promise.resolve(next);
        this.failedRead = void 0;
        this.failureReported = false;
      });
      this.blockedDeletes.delete(partition);
    } catch (error) {
      const detail = error instanceof Error ? error.message : "\u672A\u77E5\u9519\u8BEF";
      throw new Error(`${stage}\u5931\u8D25\uFF1A${detail}`);
    } finally {
      this.deleting.delete(partition);
    }
  }
  lease(partition, current) {
    current.leases++;
    current.session.cookies.removeListener("changed", current.changed);
    current.session.cookies.on("changed", current.changed);
    let released = false;
    return { partition, session: current.session, ready: current.ready, updateCookies: (change) => {
      const task = this.enqueue(async () => {
        this.cancelTimer(current);
        const before = await current.session.cookies.get({ session: true });
        current.session.cookies.removeListener("changed", current.changed);
        let changed2 = [];
        try {
          await change(current.session);
          changed2 = changedCookies(before, await current.session.cookies.get({ session: true }));
        } finally {
          if (current.leases > 0) current.session.cookies.on("changed", current.changed);
        }
        if (current.restorePending || current.mergeRequired) {
          for (const item of changed2) this.recordChange(current, item.cookie, item.removed);
        } else if (changed2.some((item) => item.cookie.session)) {
          current.revision++;
        }
        if (changed2.some((item) => item.cookie.session) && !current.restorePending) this.scheduleSave(partition, current);
      });
      return task;
    }, release: () => {
      if (released) return;
      released = true;
      current.leases = Math.max(0, current.leases - 1);
      if (current.leases === 0) {
        current.session.cookies.removeListener("changed", current.changed);
        if (!current.restorePending) current.forceDirty = true;
        this.cancelTimer(current);
        this.save(partition, current);
      }
    } };
  }
  prepare(partition, profile) {
    profile.readyStatus = "pending";
    this.pendingPreparations++;
    const task = this.enqueue(async () => {
      var _a, _b, _c, _d;
      if (this.deleting.has(partition) || this.blockedDeletes.has(partition)) return;
      if (profile.mergeRequired) {
        await this.persist([[partition, profile]]);
        profile.restorePending = true;
      } else if (this.hasPendingChanges(profile)) await this.persist([[partition, profile]]);
      const stored = await this.read();
      if (this.deleting.has(partition) || this.blockedDeletes.has(partition)) return;
      if (!profile.restorePending) return;
      if (profile.changes.size) {
        profile.restorePending = false;
        profile.mergeRequired = true;
        return;
      }
      profile.applyingStored = true;
      try {
        for (const cookie of (_a = stored.partitions[partition]) != null ? _a : []) {
          if (this.deleting.has(partition) || this.blockedDeletes.has(partition)) return;
          const url = `${cookie.secure ? "https" : "http"}://${((_b = cookie.domain) != null ? _b : "").replace(/^\./, "")}${cookie.path}`;
          const restoreKey = restoreEventIdentity(cookie, false);
          profile.ignoredRestoreChanges.set(restoreKey, ((_c = profile.ignoredRestoreChanges.get(restoreKey)) != null ? _c : 0) + 1);
          try {
            await profile.session.cookies.set({
              url,
              name: cookie.name,
              value: cookie.value,
              path: cookie.path,
              ...cookie.hostOnly ? {} : { domain: cookie.domain },
              secure: cookie.secure,
              httpOnly: cookie.httpOnly,
              sameSite: cookie.sameSite
            });
          } catch (error) {
            const ignored = (_d = profile.ignoredRestoreChanges.get(restoreKey)) != null ? _d : 0;
            if (ignored <= 1) profile.ignoredRestoreChanges.delete(restoreKey);
            else profile.ignoredRestoreChanges.set(restoreKey, ignored - 1);
            throw error;
          }
        }
        profile.restorePending = false;
        profile.mergeRequired = false;
        profile.changes.clear();
        profile.persistedRevision = profile.revision;
        profile.forceDirty = false;
      } finally {
        profile.applyingStored = false;
      }
    });
    const preparationFinished = () => {
      this.pendingPreparations = Math.max(0, this.pendingPreparations - 1);
      this.clearFailedRead();
    };
    void task.then(preparationFinished, preparationFinished);
    profile.ready = task.then(() => {
      profile.readyStatus = "ready";
      this.failureReported = false;
    }, (error) => {
      profile.readyStatus = "failed";
      this.reportFailure();
      throw error;
    });
  }
  enqueue(operation) {
    const task = this.queue.catch(() => {
    }).then(operation);
    this.queue = task.then(() => void 0, () => void 0);
    return task;
  }
  recordChange(profile, cookie, removed) {
    if (!cookie.session) return false;
    profile.revision++;
    profile.changes.set(cookieIdentity(cookie), { revision: profile.revision, cookie: removed ? null : { ...cookie } });
    return true;
  }
  read() {
    if (!this.stored) {
      this.failedRead = void 0;
      const task = Promise.resolve().then(() => this.transport("read")).then((value) => {
        const parsed = JSON.parse(value || "[]");
        if (Array.isArray(parsed) && parsed.length === 0) return { version: 1, partitions: {} };
        if ((parsed == null ? void 0 : parsed.version) !== 1 || !parsed.partitions || typeof parsed.partitions !== "object" || Array.isArray(parsed.partitions) || Object.entries(parsed.partitions).some(([key, cookies]) => !/^persist:naruto-(br|cn)-[1-9]\d*$/.test(key) || !Array.isArray(cookies) || cookies.some((c) => !c || c.session !== true || typeof c.name !== "string" || typeof c.value !== "string" || typeof c.domain !== "string" || typeof c.path !== "string"))) {
          throw new Error("\u767B\u5F55\u72B6\u6001\u683C\u5F0F\u5F02\u5E38");
        }
        const stored = parsed;
        if (this.serialized === void 0) this.serialized = JSON.stringify(stored);
        return stored;
      });
      this.stored = task;
      void task.catch(() => {
        this.failedRead = task;
        this.clearFailedRead();
      });
    }
    return this.stored;
  }
  clearFailedRead() {
    if (this.pendingPreparations !== 0 || !this.failedRead) return;
    if (this.stored === this.failedRead) this.stored = void 0;
    this.failedRead = void 0;
  }
  cancelTimer(profile) {
    if (profile.timer) clearTimeout(profile.timer);
    profile.timer = void 0;
  }
  scheduleSave(partition, profile) {
    if (this.deleting.has(partition) || this.blockedDeletes.has(partition)) return;
    this.cancelTimer(profile);
    profile.timer = setTimeout(() => {
      profile.timer = void 0;
      this.save(partition, profile);
    }, 500);
  }
  save(partition, profile) {
    if (this.deleting.has(partition) || this.blockedDeletes.has(partition)) return;
    const task = this.enqueue(() => this.persist([[partition, profile]]));
    void task.catch(() => this.reportFailure());
  }
  async persist(entries) {
    var _a, _b;
    entries = entries.filter(([partition, profile]) => !this.deleting.has(partition) && !this.blockedDeletes.has(partition) && this.profiles.get(partition) === profile);
    if (!entries.length) return;
    for (const [partition, profile] of entries) {
      this.cancelTimer(profile);
      if (profile.restorePending && !profile.changes.size) continue;
      await profile.session.cookies.flushStore();
      profile.session.flushStorageData();
    }
    const stored = await this.read();
    const next = { version: 1, partitions: { ...stored.partitions } };
    const snapshots = [];
    for (const [partition, profile] of entries) {
      if (profile.restorePending) {
        if (!profile.changes.size) continue;
        profile.restorePending = false;
        profile.mergeRequired = true;
      }
      const cookies = await profile.session.cookies.get({ session: true });
      const changes = new Map(profile.changes);
      const revision = profile.revision;
      next.partitions[partition] = profile.mergeRequired ? mergeCookieChanges((_a = stored.partitions[partition]) != null ? _a : [], changes) : cookies;
      snapshots.push({ profile, changes, revision });
    }
    const serialized = JSON.stringify(next);
    if (serialized !== this.serialized) {
      for (const snapshot of snapshots) snapshot.profile.forceDirty = true;
      await this.transport("write", serialized);
      this.serialized = serialized;
      this.stored = Promise.resolve(next);
      this.failedRead = void 0;
    }
    for (const snapshot of snapshots) {
      for (const [identity2, change] of snapshot.changes) {
        if (((_b = snapshot.profile.changes.get(identity2)) == null ? void 0 : _b.revision) === change.revision) snapshot.profile.changes.delete(identity2);
      }
      if (snapshot.profile.revision === snapshot.revision) {
        snapshot.profile.persistedRevision = snapshot.revision;
        snapshot.profile.forceDirty = false;
      }
    }
    this.failureReported = false;
  }
  reportFailure() {
    if (this.failureReported) return;
    this.failureReported = true;
    this.report();
  }
  async flush() {
    const entries = Array.from(this.profiles.entries()).filter(([partition]) => !this.deleting.has(partition) && !this.blockedDeletes.has(partition));
    for (const [, profile] of entries) this.cancelTimer(profile);
    if (!entries.length) return;
    const task = this.enqueue(async () => {
      await this.persist(entries);
      const current = () => entries.filter(([partition, profile]) => this.profiles.get(partition) === profile && !this.deleting.has(partition) && !this.blockedDeletes.has(partition));
      if (current().some(([, profile]) => this.hasPendingChanges(profile))) await this.persist(entries);
      if (current().some(([, profile]) => this.hasPendingChanges(profile))) throw new Error("\u767B\u5F55\u72B6\u6001\u4ECD\u6709\u5C1A\u672A\u4FDD\u5B58\u7684 Cookie \u53D8\u66F4");
    });
    try {
      await task;
    } catch (error) {
      this.reportFailure();
      throw error;
    }
  }
  hasPendingChanges(profile) {
    return profile.forceDirty || profile.revision !== profile.persistedRevision || profile.mergeRequired && profile.changes.size > 0;
  }
};

// src/main/web-login.ts
var import_electron4 = require("electron");
init_config();
var import_webkit_handoff5 = __toESM(require_webkit_handoff());

// src/main/embedded-login.ts
var import_webkit_handoff3 = __toESM(require_webkit_handoff());
var import_webkit_handoff4 = __toESM(require_webkit_handoff());

// src/main/windows-login.ts
var import_electron3 = require("electron");
var import_crypto4 = require("crypto");
var import_path6 = __toESM(require("path"));
var import_webkit_handoff2 = __toESM(require_webkit_handoff());
init_model();

// src/main/windows-navigation.ts
var import_webkit_handoff = __toESM(require_webkit_handoff());
var MAX = 512;
var NavigationAuthority = class {
  constructor(opts = {}) {
    this.opts = opts;
    this.contexts = /* @__PURE__ */ new Map();
    this.scripts = /* @__PURE__ */ new Map();
    this.contextHistory = /* @__PURE__ */ new Map();
    this.scriptHistory = /* @__PURE__ */ new Map();
    this.destroyedContexts = /* @__PURE__ */ new Set();
    this.frames = /* @__PURE__ */ new Map();
    this.requests = /* @__PURE__ */ new Map();
    this.chains = /* @__PURE__ */ new Map();
    this.tokens = /* @__PURE__ */ new Set();
    this.generation = 0;
    this.topFrame = "";
    this.topLoader = "";
    this.topURL = "";
    this.revision = 0;
    this.invalid = false;
  }
  clearMaps() {
    this.contexts.clear();
    this.scripts.clear();
    this.frames.clear();
    this.requests.clear();
    this.chains.clear();
    this.tokens.clear();
  }
  bounded(map, key, value) {
    if (!map.has(key) && map.size >= MAX) {
      this.invalid = true;
      this.generation++;
      this.clearMaps();
      return;
    }
    map.set(key, value);
  }
  event(method, p) {
    var _a, _b, _c, _d, _e, _f;
    if (this.invalid) return;
    if (method === "Page.frameNavigated") {
      const f = p == null ? void 0 : p.frame;
      if (!(f == null ? void 0 : f.id)) return;
      if (!f.parentId) {
        this.generation++;
        this.revision++;
        this.topFrame = f.id;
        this.topLoader = f.loaderId || "";
        this.topURL = f.url || "";
        this.contexts.clear();
        this.scripts.clear();
        this.frames.clear();
        this.requests.clear();
        this.chains.clear();
        this.tokens.clear();
        this.contextHistory.clear();
        this.scriptHistory.clear();
        this.destroyedContexts.clear();
      }
      if (!this.frames.has(f.id) || this.frames.get(f.id) !== f.parentId) this.revision++;
      this.bounded(this.frames, f.id, f.parentId);
    } else if (method === "Page.navigatedWithinDocument") {
      if (p.frameId === this.topFrame && p.url !== this.topURL) {
        this.topURL = p.url || "";
        this.revision++;
        this.requests.clear();
        this.chains.clear();
        this.tokens.clear();
      }
    } else if (method === "Page.frameAttached") {
      if (!this.frames.has(p.frameId) || this.frames.get(p.frameId) !== p.parentFrameId) this.revision++;
      this.bounded(this.frames, p.frameId, p.parentFrameId);
    } else if (method === "Page.frameDetached") {
      const removed = /* @__PURE__ */ new Set([p.frameId]);
      let changed2 = true;
      while (changed2) {
        changed2 = false;
        for (const [fid, parent] of this.frames) if (parent && removed.has(parent) && !removed.has(fid)) {
          removed.add(fid);
          changed2 = true;
        }
      }
      for (const fid of removed) this.frames.delete(fid);
      this.revision++;
      for (const [rid, req] of this.requests) if (removed.has(req.frameId)) this.requests.delete(rid);
      for (const [rid, chain] of this.chains) if (removed.has(chain.frameId)) this.chains.delete(rid);
      for (const token of this.tokens) if (removed.has(token.frameId)) this.tokens.delete(token);
      for (const [cid, c] of this.contexts) if (removed.has(c.frameId)) this.contexts.delete(cid);
      for (const [sid, cid] of this.scripts) if (!this.contexts.has(cid)) this.scripts.delete(sid);
      for (const chain of this.chains.values()) if (removed.has(chain.frameId) || !this.contexts.has(chain.sourceContextId)) chain.valid = false;
    } else if (method === "Runtime.executionContextCreated") {
      const c = p.context, a = c == null ? void 0 : c.auxData;
      if ((c == null ? void 0 : c.id) != null && (a == null ? void 0 : a.frameId)) {
        const id = String(c.id), value = { origin: c.origin || "", frameId: a.frameId, isDefault: a.isDefault === true, generation: this.generation };
        if (this.destroyedContexts.has(id)) {
          this.invalidate();
          return;
        }
        const prior = this.contextHistory.get(id);
        if (prior && JSON.stringify(prior) !== JSON.stringify(value)) {
          this.invalidate();
          return;
        }
        this.bounded(this.contextHistory, id, value);
        if (this.invalid) return;
        this.bounded(this.contexts, id, value);
      }
    } else if (method === "Runtime.executionContextDestroyed") {
      const id = String(p.executionContextId);
      this.contexts.delete(id);
      this.destroyedContexts.add(id);
      for (const token of this.tokens) if (token.contextId === id) this.tokens.delete(token);
      for (const [sid, cid] of this.scripts) if (cid === id) this.scripts.delete(sid);
      for (const chain of this.chains.values()) if (chain.sourceContextId === id) chain.valid = false;
    } else if (method === "Runtime.executionContextsCleared") {
      this.contexts.clear();
      this.scripts.clear();
      this.tokens.clear();
      this.chains.clear();
    } else if (method === "Debugger.scriptParsed") {
      if (p.scriptId != null && p.executionContextId != null) {
        const sid = String(p.scriptId), cid = String(p.executionContextId), prior = this.scriptHistory.get(sid);
        if (prior !== void 0 && prior !== cid) {
          this.invalidate();
          return;
        }
        this.bounded(this.scriptHistory, sid, cid);
        if (this.invalid) return;
        this.bounded(this.scripts, sid, cid);
      }
    } else if (method === "Network.requestWillBeSent") {
      const id = String(p.requestId), prev = this.requests.get(id), initiator = p.initiator || {}, call = (_b = (_a = initiator.stack) == null ? void 0 : _a.callFrames) == null ? void 0 : _b[0];
      const hop = { url: ((_c = p.request) == null ? void 0 : _c.url) || "", method: ((_d = p.request) == null ? void 0 : _d.method) || "", frameId: p.frameId || "", loaderId: p.loaderId || "", type: p.type || "", redirectURL: (_e = p.redirectResponse) == null ? void 0 : _e.url, callerScript: initiator.type === "script" && (call == null ? void 0 : call.scriptId) != null ? String(call.scriptId) : void 0, topGeneration: this.generation, topLoader: this.topLoader, topURL: this.topURL };
      this.bounded(this.requests, id, hop);
      if (prev) {
        const chain = this.chains.get(id);
        if (chain) {
          const responseURL = (_f = p.redirectResponse) == null ? void 0 : _f.url;
          if (!responseURL || p.redirectResponse.status !== 302 || responseURL !== prev.url || prev.method !== "GET" || hop.method !== "GET" || hop.frameId !== chain.frameId || hop.loaderId !== chain.loaderId || !this.chainLive(chain)) chain.valid = false;
          else chain.hops.push(hop.url);
        }
      }
    } else if (method === "Network.loadingFailed" || method === "Network.loadingFinished") {
      const id = String(p.requestId);
      this.requests.delete(id);
      this.chains.delete(id);
    }
  }
  decide(pause2) {
    var _a, _b;
    if (this.invalid) return { action: "block", reason: "invalidated" };
    const id = (pause2 == null ? void 0 : pause2.networkId) == null ? "" : String(pause2.networkId), req = id && this.requests.get(id);
    const url = ((_a = pause2 == null ? void 0 : pause2.request) == null ? void 0 : _a.url) || "", method = ((_b = pause2 == null ? void 0 : pause2.request) == null ? void 0 : _b.method) || "";
    if (!req) return { action: "wait", reason: "network-correlation-pending" };
    if (req.url !== url || req.method !== method || req.frameId !== pause2.frameId) return { action: "block", reason: "network-correlation-mismatch" };
    if (req.topGeneration !== this.generation || req.topLoader !== this.topLoader || req.topURL !== this.topURL) return { action: "block", reason: "stale-document-request" };
    if (pause2.resourceType !== "Document" || req.type !== "Document") return { action: "block", reason: "not-document" };
    if (!this.topFrame || !this.isWrapper(this.topURL)) return { action: "block", reason: "top-not-wrapper" };
    const target = this.isGame(url);
    if (!target && method !== "GET") return { action: "continue", reason: "ordinary-navigation" };
    if (target && !this.validGame(url)) return { action: "block", reason: "invalid-target" };
    if (!req.frameId || req.frameId === this.topFrame || !this.isDescendant(req.frameId)) return { action: "block", reason: "invalid-target-frame" };
    const chain = this.chains.get(id);
    let sourceContextId;
    if (chain) {
      if (!chain.valid || chain.frameId !== req.frameId || chain.loaderId !== req.loaderId || !this.chainLive(chain) || chain.hops[chain.hops.length - 2] !== req.redirectURL) return { action: "block", reason: "invalid-redirect-chain" };
      sourceContextId = chain.sourceContextId;
      if (method !== "GET" || !target && this.origin(url) !== this.origin(this.topURL)) {
        chain.valid = false;
        return { action: "block", reason: "invalid-redirect-hop" };
      }
    } else {
      if (req.redirectURL) return { action: "block", reason: "missing-authorized-chain" };
      if (!req.callerScript) return target ? { action: "block", reason: "missing-synchronous-script-stack" } : { action: "continue", reason: "ordinary-navigation" };
      const contextId = this.scripts.get(req.callerScript);
      if (contextId === void 0) return { action: "wait", reason: "script-context-pending" };
      const ctx = this.contexts.get(contextId);
      if (!ctx) return { action: "wait", reason: "script-context-pending" };
      if (!this.contextTrusted(ctx)) return { action: "block", reason: "untrusted-script-context" };
      sourceContextId = contextId;
      if (!target) {
        if (this.origin(url) !== this.origin(this.topURL) || method !== "GET") return { action: "continue", reason: "ordinary-navigation" };
        this.bounded(this.chains, id, { frameId: req.frameId, loaderId: req.loaderId, sourceContextId, hops: [url], valid: true });
        return { action: "continue", reason: "authorized-redirect-start" };
      }
    }
    if (target && method === "GET") {
      const ctx = this.contexts.get(sourceContextId);
      if (!ctx || !this.contextTrusted(ctx)) return { action: "block", reason: "invalid-source-context" };
      const token = { generation: this.generation, url, contextId: sourceContextId, frameId: req.frameId };
      this.tokens.add(token);
      return { action: "handoff", token };
    }
    return { action: "continue", reason: "ordinary-navigation" };
  }
  valid(token) {
    if (this.invalid || !token || token.generation !== this.generation || !this.tokens.has(token)) return false;
    const ctx = this.contexts.get(token.contextId);
    return !!ctx && this.contextTrusted(ctx) && this.frames.has(token.frameId) && token.frameId !== this.topFrame && this.isDescendant(token.frameId);
  }
  identity() {
    return { revision: this.revision, topFrame: this.topFrame, topLoader: this.topLoader, topURL: this.topURL };
  }
  applyFrameTree(snapshot, captured) {
    var _a;
    if (this.invalid || JSON.stringify(captured) !== JSON.stringify(this.identity())) return false;
    const root2 = snapshot == null ? void 0 : snapshot.frameTree;
    if (!((_a = root2 == null ? void 0 : root2.frame) == null ? void 0 : _a.id)) return false;
    const next = /* @__PURE__ */ new Map();
    const walk = (node, parent) => {
      var _a2;
      if (!((_a2 = node == null ? void 0 : node.frame) == null ? void 0 : _a2.id)) return;
      next.set(node.frame.id, parent);
      for (const child of node.childFrames || []) walk(child, node.frame.id);
    };
    walk(root2);
    if (next.size > MAX) {
      this.invalidate();
      return false;
    }
    const top = root2.frame;
    if (this.topFrame && (top.id !== this.topFrame || top.loaderId !== this.topLoader || top.url !== this.topURL)) return false;
    if (!this.topFrame) {
      this.topFrame = top.id;
      this.topLoader = top.loaderId || "";
      this.topURL = top.url || "";
      this.generation++;
      this.revision++;
    }
    const removed = new Set([...this.frames.keys()].filter((id) => !next.has(id) || this.frames.get(id) !== next.get(id)));
    let changed2 = true;
    while (changed2) {
      changed2 = false;
      for (const [id, parent] of this.frames) if (parent && removed.has(parent) && !removed.has(id)) {
        removed.add(id);
        changed2 = true;
      }
      for (const [id, parent] of next) if (parent && removed.has(parent) && !removed.has(id)) {
        removed.add(id);
        changed2 = true;
      }
    }
    const topologyChanged = next.size !== this.frames.size || [...next].some(([id, parent]) => !this.frames.has(id) || this.frames.get(id) !== parent);
    this.frames = next;
    if (topologyChanged) this.revision++;
    if (removed.size) {
      for (const [rid, req] of this.requests) if (removed.has(req.frameId)) this.requests.delete(rid);
      for (const [rid, chain] of this.chains) if (removed.has(chain.frameId)) this.chains.delete(rid);
      for (const token of this.tokens) if (removed.has(token.frameId)) this.tokens.delete(token);
    }
    return true;
  }
  invalidate() {
    this.invalid = true;
    this.generation++;
    this.revision++;
    this.clearMaps();
    this.contextHistory.clear();
    this.scriptHistory.clear();
    this.destroyedContexts.clear();
    this.topFrame = this.topLoader = this.topURL = "";
  }
  contextTrusted(c) {
    return c.isDefault && c.frameId === this.topFrame && c.generation === this.generation && c.origin === this.origin(this.topURL);
  }
  chainLive(c) {
    const ctx = this.contexts.get(c.sourceContextId);
    return c.valid && !!ctx && this.contextTrusted(ctx) && this.frames.has(c.frameId) && this.isDescendant(c.frameId);
  }
  origin(raw) {
    try {
      const u = new URL(raw);
      return u.origin === "null" ? "" : u.origin;
    } catch {
      return "";
    }
  }
  isWrapper(raw) {
    try {
      const u = new URL(raw);
      if (this.opts.fixture) return u.origin === this.opts.fixture && u.protocol === "http:" && u.hostname === "127.0.0.1" && /^\/pt(?:\/login|\/serverlist\/s\d{1,6})?\/?$/.test(u.pathname);
      return isBrazilWrapperPage(raw);
    } catch {
      return false;
    }
  }
  isGame(raw) {
    try {
      (0, import_webkit_handoff.validateHandoff)({ type: "handoff", url: raw, cookies: [] }, this.opts.fixture);
      return true;
    } catch {
      return false;
    }
  }
  validGame(raw) {
    return this.isGame(raw);
  }
  isDescendant(id) {
    let parent = this.frames.get(id), seen = /* @__PURE__ */ new Set();
    while (parent && !seen.has(id)) {
      if (parent === this.topFrame) return true;
      seen.add(id);
      id = parent;
      parent = this.frames.get(id);
    }
    return false;
  }
};

// src/main/windows-navigation-monitor.ts
var COMMAND_TIMEOUT = 4e3;
var DECISION_TIMEOUT = 1e3;
var WindowsNavigationMonitor = class {
  constructor(contents, options) {
    this.contents = contents;
    this.options = options;
    this.disposed = false;
    this.pending = /* @__PURE__ */ new Map();
    this.detachRequested = false;
    this.onEvent = (_event, method, params) => {
      if (this.disposed) return;
      if (method === "Fetch.requestPaused") {
        const item = { params, timer: setTimeout(() => void this.expire(params.requestId), DECISION_TIMEOUT), identity: this.authority.identity(), snapshotState: "loading" };
        this.pending.set(params.requestId, item);
        void this.snapshot(params.requestId, item);
      } else this.authority.event(method, params);
      void this.processPending();
    };
    this.onDetach = () => {
      if (!this.disposed && !this.detachRequested) this.options.onFailure(new Error("navigation-debugger-detached"));
    };
    this.authority = new NavigationAuthority({ fixture: options.fixture ? new URL(options.fixture).origin : void 0 });
  }
  async start() {
    const d = this.contents.debugger;
    try {
      if (!d.isAttached()) d.attach("1.3");
      d.on("message", this.onEvent);
      d.on("detach", this.onDetach);
      for (const method of ["Runtime.enable", "Debugger.enable", "Page.enable", "Network.enable", "Fetch.enable"]) {
        await this.command(method, method === "Fetch.enable" ? { patterns: [{ urlPattern: "*", resourceType: "Document", requestStage: "Request" }] } : {});
      }
    } catch (e) {
      this.options.onFailure(e instanceof Error ? e : new Error("navigation-debugger-failed"));
      throw e;
    }
  }
  command(method, params) {
    let timer;
    return Promise.race([this.contents.debugger.sendCommand(method, params), new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(`debugger-command-timeout:${method}`)), COMMAND_TIMEOUT);
    })]).finally(() => clearTimeout(timer));
  }
  async processPending() {
    var _a;
    for (const [requestId, item] of this.pending) {
      if (item.snapshotState !== "ready") continue;
      const decision = this.authority.decide(item.params);
      if (decision.action === "wait") continue;
      clearTimeout(item.timer);
      this.pending.delete(requestId);
      try {
        if (decision.action === "handoff" && decision.token) {
          await this.command("Fetch.failRequest", { requestId, errorReason: "Aborted" });
          const token = decision.token;
          await this.options.onHandoff(token.url, () => this.authority.valid(token));
        } else if (decision.action === "block" && this.isGame((_a = item.params.request) == null ? void 0 : _a.url)) await this.command("Fetch.failRequest", { requestId, errorReason: "Aborted" });
        else await this.command("Fetch.continueRequest", { requestId });
      } catch (e) {
        this.options.onFailure(e instanceof Error ? e : new Error("navigation-command-failed"));
      }
    }
  }
  async snapshot(requestId, item) {
    try {
      const tree = await this.command("Page.getFrameTree", {});
      if (this.disposed || this.pending.get(requestId) !== item || this.authority.identity().revision !== item.identity.revision) return;
      item.snapshotState = this.authority.applyFrameTree(tree, item.identity) ? "ready" : "failed";
    } catch {
      if (this.pending.get(requestId) === item) item.snapshotState = "failed";
    }
    if (this.pending.get(requestId) === item) {
      if (item.snapshotState === "failed") {
        this.pending.delete(requestId);
        clearTimeout(item.timer);
        await this.failOrContinue(item);
      } else void this.processPending();
    }
  }
  async failOrContinue(item) {
    var _a;
    try {
      if (this.isGame((_a = item.params.request) == null ? void 0 : _a.url)) await this.command("Fetch.failRequest", { requestId: item.params.requestId, errorReason: "Aborted" });
      else await this.command("Fetch.continueRequest", { requestId: item.params.requestId });
    } catch (e) {
      this.options.onFailure(e instanceof Error ? e : new Error("navigation-snapshot-failed"));
    }
  }
  async expire(requestId) {
    var _a;
    const item = this.pending.get(requestId);
    if (!item || this.disposed) return;
    this.pending.delete(requestId);
    try {
      if (this.isGame((_a = item.params.request) == null ? void 0 : _a.url)) await this.command("Fetch.failRequest", { requestId, errorReason: "Aborted" });
      else await this.command("Fetch.continueRequest", { requestId });
    } catch (e) {
      this.options.onFailure(e instanceof Error ? e : new Error("navigation-timeout-failed"));
    }
  }
  isGame(url) {
    try {
      const { validateHandoff: validateHandoff4 } = require_webkit_handoff();
      validateHandoff4({ type: "handoff", url, cookies: [] }, this.options.fixture);
      return true;
    } catch {
      return false;
    }
  }
  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.authority.invalidate();
    for (const item of this.pending.values()) clearTimeout(item.timer);
    this.pending.clear();
    const d = this.contents.debugger;
    try {
      d.removeListener("message", this.onEvent);
      d.removeListener("detach", this.onDetach);
      if (d.isAttached()) {
        this.detachRequested = true;
        d.detach();
      }
    } catch {
    }
  }
};

// src/main/windows-login.ts
function startWindowsLogin(parent, options) {
  var _a;
  const fixtureURL = options.fixture ? new URL(options.fixture) : void 0;
  if (options.fixture && (process.env.NARUTO_TEST_MODE !== "1" || (fixtureURL == null ? void 0 : fixtureURL.protocol) !== "http:" || fixtureURL.hostname !== "127.0.0.1"))
    throw new Error("invalid-login-fixture");
  const partition = `naruto-login-${(0, import_crypto4.randomBytes)(16).toString("hex")}`;
  const nonce = (0, import_crypto4.randomBytes)(24).toString("hex");
  const channel = "naruto-login-handoff";
  const ses = import_electron3.session.fromPartition(partition);
  const win2 = new import_electron3.BrowserWindow({
    parent,
    modal: false,
    show: false,
    frame: false,
    resizable: false,
    skipTaskbar: true,
    backgroundColor: "#f5f5f5",
    webPreferences: {
      partition,
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      plugins: false,
      enableRemoteModule: false,
      webSecurity: true,
      allowRunningInsecureContent: false,
      preload: import_path6.default.join(__dirname, "../preload/windows-login.js"),
      additionalArguments: [
        `--naruto-login-nonce=${nonce}`,
        ...options.fixture ? [`--naruto-login-fixture=${fixtureURL.origin}`] : []
      ]
    }
  });
  const fitToParent = () => {
    var _a2;
    if (!alive() || ((_a2 = parent.isDestroyed) == null ? void 0 : _a2.call(parent))) return;
    if (typeof parent.getContentBounds !== "function" || typeof win2.setBounds !== "function") return;
    try {
      const { x, y, width, height } = parent.getContentBounds();
      win2.setBounds({ x, y: y + CHROME_HEIGHT, width, height: Math.max(0, height - CHROME_HEIGHT) });
    } catch {
    }
  };
  let surfaceRequested = false;
  const parentOnScreen = () => !(typeof parent.isDestroyed === "function" && parent.isDestroyed()) && !(typeof parent.isVisible === "function" && !parent.isVisible()) && !(typeof parent.isMinimized === "function" && parent.isMinimized());
  const syncSurface = () => {
    if (!alive()) return;
    if (surfaceRequested && parentOnScreen()) {
      fitToParent();
      if (typeof win2.show === "function") win2.show();
    } else if (win2.isVisible()) win2.hide();
  };
  const host = parent;
  const surfaceEvents = ["resize", "move", "maximize", "unmaximize", "enter-full-screen", "leave-full-screen", "hide", "minimize", "show", "restore"];
  surfaceEvents.forEach((event) => host.on(event, syncSurface));
  let settled = false, cancelled = false;
  let timer;
  let resolve;
  let reject;
  const result = new Promise((yes, no) => {
    resolve = yes;
    reject = no;
  });
  const alive = () => !win2.isDestroyed();
  let handingOff = false;
  let monitor;
  const gameGuard = (_details, callback) => callback({ cancel: acceptTarget(_details.url) });
  ses.webRequest.onBeforeSendHeaders({ urls: options.fixture ? ["*://127.0.0.1/*"] : ["*://*.oasgames.com/*"] }, gameGuard);
  const authHost = (url) => url.includes("//odp3.oasgames.com") ? "odp3" : "passport";
  ses.webRequest.onResponseStarted(
    { urls: options.fixture ? [] : ["*://passport.oasgames.com/*", "*://odp3.oasgames.com/*"] },
    (details2) => {
      var _a2;
      if (details2.statusCode >= 400) (_a2 = options.onStatus) == null ? void 0 : _a2.call(options, `LOGIN_HTTP_${details2.statusCode}_${authHost(details2.url)}`);
    }
  );
  const onWillNavigate = (event, raw) => {
    if (acceptTarget(raw) || !safeNavigation(raw)) event.preventDefault();
  };
  const onWillRedirect = (event, raw, _inPlace, isMainFrame) => {
    if (isMainFrame && (acceptTarget(raw) || !safeNavigation(raw))) event.preventDefault();
  };
  let followed = 0;
  const follow = async (raw) => {
    var _a2;
    if (!alive() || settled) return;
    const attempt = ++followed;
    try {
      await win2.loadURL(raw);
    } catch {
      if (attempt !== followed || !alive() || settled || win2.webContents.isLoading()) return;
      try {
        await win2.loadURL(raw);
      } catch {
        if (attempt === followed) (_a2 = options.onStatus) == null ? void 0 : _a2.call(options, "NAVIGATION_FOLLOW_FAILED");
      }
    }
  };
  const onNewWindow = (event, raw) => {
    event.preventDefault();
    if (safeNavigation(raw) && !acceptTarget(raw)) void follow(raw);
  };
  const beginCancel = () => {
    if (settled || cancelled) return;
    cancelled = true;
    void (async () => {
      const records = await ses.cookies.get({});
      await finish(new Error("cancelled"), void 0, records);
    })().catch(() => finish(new Error("cancelled")));
  };
  const onClose = (event) => {
    if (!settled) {
      event.preventDefault();
      beginCancel();
    }
  };
  const onEscape = (event, input) => {
    if (settled || input.type !== "keyDown" || input.key !== "Escape") return;
    event.preventDefault();
    beginCancel();
  };
  let offered = null;
  const pageOrigin = () => {
    try {
      const url = new URL(win2.webContents.getURL());
      return url.origin === "null" ? "" : url.origin;
    } catch {
      return "";
    }
  };
  const credentialOrigin2 = (value) => {
    if (typeof value !== "string" || !value || pageOrigin() !== value) return false;
    if (options.fixture) return value === fixtureURL.origin;
    try {
      const url = new URL(value);
      return url.protocol === "https:" && !url.port && !url.username && !url.password && ["naruto.narutowebgame.com", "naruto.oasgames.com", "passport.oasgames.com", "passport.narutowebgame.com"].includes(url.hostname);
    } catch {
      return false;
    }
  };
  const credentialChannel = (name) => `naruto-login-${name}`;
  if (options.credentials) {
    const credentials = options.credentials;
    import_electron3.ipcMain.handle(credentialChannel("candidates"), async (event, input) => {
      if (event.sender !== win2.webContents || !alive() || settled || !credentialOrigin2(input == null ? void 0 : input.origin)) return { ok: false };
      if (typeof input.query !== "string" || input.query.length > 320) return { ok: false };
      const records = await credentials.candidates(input.origin, input.query);
      if (!alive() || settled) return { ok: false };
      offered = { origin: input.origin, ids: records.map((record) => record.id), expires: Date.now() + 3e4 };
      return { ok: true, value: records };
    });
    import_electron3.ipcMain.handle(credentialChannel("choose"), async (event, input) => {
      const pending2 = offered;
      if (event.sender !== win2.webContents || !alive() || settled || !pending2 || pending2.expires < Date.now() || pending2.origin !== (input == null ? void 0 : input.origin) || !pending2.ids.includes(input == null ? void 0 : input.id) || !credentialOrigin2(input == null ? void 0 : input.origin)) return { ok: false };
      offered = null;
      const record = await credentials.choose(input.origin, input.id);
      return record ? { ok: true, value: record } : { ok: false };
    });
    let savable = null;
    const credentialInput = (input) => {
      if (!input || typeof input.username !== "string" || typeof input.password !== "string" || !input.username.trim() || !input.password) return false;
      return input.username.length <= 320 && input.password.length <= 4096;
    };
    import_electron3.ipcMain.handle(credentialChannel("submit"), async (event, input) => {
      if (event.sender !== win2.webContents || !alive() || settled || !credentialOrigin2(input == null ? void 0 : input.origin) || !credentialInput(input)) return { ok: false };
      const result2 = await credentials.needsSave(input.origin, input.username.trim(), input.password);
      if (!alive() || settled) return { ok: false };
      savable = result2.needed ? { origin: input.origin, username: input.username.trim(), password: input.password, expires: Date.now() + 12e4 } : null;
      return { ok: true, value: result2 };
    });
    import_electron3.ipcMain.handle(credentialChannel("save"), async (event, input) => {
      const pending2 = savable;
      if (event.sender !== win2.webContents || !alive() || settled || !pending2 || pending2.expires < Date.now() || pending2.origin !== (input == null ? void 0 : input.origin) || pending2.username !== (input == null ? void 0 : input.username) || pending2.password !== (input == null ? void 0 : input.password) || !credentialOrigin2(input == null ? void 0 : input.origin)) return { ok: false };
      savable = null;
      await credentials.save(input.origin, input.username, input.password);
      return { ok: true };
    });
  }
  const exportHandoff = async (target, authorized = () => true) => {
    var _a2;
    if (settled || cancelled || handingOff || !alive() || !authorized()) return;
    handingOff = true;
    try {
      const records = await ses.cookies.get({});
      if (settled || cancelled || !alive() || !authorized()) {
        handingOff = false;
        return;
      }
      const converted = records.map((c) => ({
        name: c.name,
        value: c.value,
        domain: c.domain,
        path: c.path,
        secure: c.secure,
        httpOnly: c.httpOnly,
        hostOnly: c.hostOnly,
        session: c.session,
        ...!c.session && c.expirationDate !== void 0 ? { expirationDate: c.expirationDate } : {},
        ...c.sameSite && c.sameSite !== "unspecified" ? { sameSite: c.sameSite === "no_restriction" ? "none" : c.sameSite } : {}
      }));
      const scoped = converted.filter((c) => typeof c.domain === "string" && (options.fixture ? c.domain.replace(/^\./, "") === "127.0.0.1" : (0, import_webkit_handoff2.allowedDomain)(c.domain)));
      (0, import_webkit_handoff2.cookieDetails)(scoped, options.fixture);
      const handoffCookies = scoped.filter((c) => {
        try {
          (0, import_webkit_handoff2.validateHandoff)({ type: "handoff", url: target, cookies: [c] }, options.fixture);
          return true;
        } catch {
          return false;
        }
      });
      const value = (0, import_webkit_handoff2.validateHandoff)({ type: "handoff", url: target, cookies: handoffCookies }, options.fixture);
      if (!authorized()) {
        handingOff = false;
        return;
      }
      void finish(void 0, value, records);
    } catch {
      handingOff = false;
      (_a2 = options.onStatus) == null ? void 0 : _a2.call(options, "HANDOFF_FAILED");
    }
  };
  const onHandoff = (_event, suppliedNonce, source, target, targetName) => {
    if (settled || cancelled || handingOff || suppliedNonce !== nonce || !alive() || _event.sender !== win2.webContents || source !== win2.webContents.getURL() || targetName !== "_self" && targetName !== "_top" && targetName !== "_blank") return;
    const safeSource = (url) => {
      try {
        const parsed = new URL(url);
        return options.fixture ? parsed.origin === fixtureURL.origin : parsed.protocol === "https:" && !parsed.port && !parsed.username && !parsed.password && ["naruto.narutowebgame.com", "naruto.oasgames.com", "passport.oasgames.com", "passport.narutowebgame.com"].includes(parsed.hostname);
      } catch {
        return false;
      }
    };
    if (!safeSource(source) || !acceptTarget(target)) return;
    const sourceURL = new URL(source);
    const wrapperSource = options.fixture ? sourceURL.origin === fixtureURL.origin && /^\/pt(?:\/login|\/serverlist\/s\d{1,6})?\/?$/.test(sourceURL.pathname) : isBrazilWrapperPage(source);
    if (targetName === "_blank" && !wrapperSource) return;
    void exportHandoff(target, () => {
      if (win2.webContents.getURL() !== source) return false;
      return true;
    });
  };
  const cleanup = async () => {
    clearTimeout(timer);
    import_electron3.ipcMain.removeListener(channel, onHandoff);
    if (options.credentials) {
      for (const name of ["candidates", "choose", "submit", "save"]) import_electron3.ipcMain.removeHandler(credentialChannel(name));
      offered = null;
    }
    parent.removeListener("closed", onParentClosed);
    surfaceEvents.forEach((event) => host.removeListener(event, syncSurface));
    win2.removeListener("closed", onWindowClosed);
    win2.removeListener("close", onClose);
    win2.webContents.removeListener("will-navigate", onWillNavigate);
    win2.webContents.removeListener("will-redirect", onWillRedirect);
    win2.webContents.removeListener("new-window", onNewWindow);
    win2.webContents.removeListener("before-input-event", onEscape);
    win2.webContents.removeListener("render-process-gone", onRenderGone);
    win2.webContents.removeListener("destroyed", onContentsDestroyed);
    if (alive()) win2.destroy();
    monitor == null ? void 0 : monitor.dispose();
    monitor = void 0;
    ses.webRequest.onBeforeSendHeaders(null);
    ses.webRequest.onResponseStarted(null);
    await ses.clearStorageData();
  };
  const finish = async (error, value, records) => {
    var _a2;
    if (settled) return;
    settled = true;
    try {
      if (records !== void 0) await options.onSnapshot(exportSnapshot(records));
      await cleanup();
      if (error) reject(error);
      else resolve(value);
    } catch {
      await cleanup().catch(() => {
      });
      (_a2 = options.onStatus) == null ? void 0 : _a2.call(options, "SNAPSHOT_FAILED");
      reject(new Error("snapshot-failed"));
    }
  };
  const exportSnapshot = (records) => {
    const converted = records.map((c) => ({
      name: c.name,
      value: c.value,
      domain: c.domain,
      path: c.path,
      secure: c.secure,
      httpOnly: c.httpOnly,
      hostOnly: c.hostOnly,
      session: c.session,
      ...!c.session && c.expirationDate !== void 0 ? { expirationDate: c.expirationDate } : {},
      ...c.sameSite && c.sameSite !== "unspecified" ? { sameSite: c.sameSite === "no_restriction" ? "none" : c.sameSite } : {}
    }));
    return (0, import_webkit_handoff2.cookieDetails)(converted.filter((c) => options.fixture ? c.domain.replace(/^\./, "") === "127.0.0.1" : (0, import_webkit_handoff2.allowedDomain)(c.domain)), options.fixture);
  };
  const acceptTarget = (url) => {
    try {
      (0, import_webkit_handoff2.validateHandoff)({ type: "handoff", url, cookies: [] }, options.fixture);
      return true;
    } catch {
      return false;
    }
  };
  const safeNavigation = (raw) => {
    let parsed;
    try {
      parsed = new URL(raw);
    } catch {
      return false;
    }
    return options.fixture ? parsed.origin === fixtureURL.origin : parsed.protocol === "https:" && !parsed.port && !parsed.username && !parsed.password && ["naruto.narutowebgame.com", "naruto.oasgames.com", "passport.oasgames.com", "passport.narutowebgame.com"].includes(parsed.hostname);
  };
  const onParentClosed = () => {
    void finish(new Error("parent-destroyed"));
  };
  const onWindowClosed = () => {
    void ses.cookies.get({}).then((records) => finish(new Error("cancelled"), void 0, records), () => finish(new Error("cancelled")));
  };
  const onRenderGone = () => {
    void finish(new Error("renderer-gone"));
  };
  const onContentsDestroyed = () => {
    if (!settled) void finish(new Error("contents-destroyed"));
  };
  parent.once("closed", onParentClosed);
  win2.once("closed", onWindowClosed);
  import_electron3.ipcMain.on(channel, onHandoff);
  win2.webContents.on("will-navigate", onWillNavigate);
  win2.webContents.on("will-redirect", onWillRedirect);
  win2.webContents.on("new-window", onNewWindow);
  win2.webContents.on("before-input-event", onEscape);
  win2.on("close", onClose);
  win2.webContents.on("render-process-gone", onRenderGone);
  win2.webContents.once("destroyed", onContentsDestroyed);
  timer = setTimeout(() => {
    void finish(new Error("timeout"));
  }, (_a = options.timeout) != null ? _a : 9e5);
  const open = async () => {
    var _a2;
    surfaceRequested = true;
    syncSurface();
    await ses.setProxy({ proxyRules: "direct://" });
    for (const details2 of options.initialCookies) {
      if (settled || cancelled) return;
      const normalized = (0, import_webkit_handoff2.cookieDetails)([details2], options.fixture);
      await ses.cookies.set(normalized[0]);
    }
    if (settled || cancelled) return;
    const entry = (_a2 = options.fixture) != null ? _a2 : REGIONS.br.url;
    await win2.loadURL("about:blank");
    if (settled || cancelled) return;
    monitor = new WindowsNavigationMonitor(win2.webContents, {
      fixture: options.fixture,
      onHandoff: (url, valid) => exportHandoff(url, valid),
      onFailure: (error) => {
        void finish(error);
      }
    });
    await monitor.start();
    if (settled || cancelled) return;
    await win2.loadURL(entry);
  };
  void open().catch(() => {
    void finish(new Error("login-failed"));
  });
  return {
    result,
    focus: () => {
      if (alive()) win2.focus();
    },
    hide: (hidden) => {
      surfaceRequested = !hidden;
      syncSurface();
    },
    reload: () => {
      if (alive()) win2.webContents.reload();
    },
    cancel: () => beginCancel()
  };
}

// src/main/embedded-login.ts
function startEmbeddedLogin(binary, window, options) {
  if (process.platform === "win32") return startWindowsLogin(window, options);
  const native = require(binary);
  let settled = false, cancelled = false, cancelTimer;
  let finish;
  const result = new Promise((resolve, reject) => {
    var _a;
    const timer = setTimeout(() => finish(new Error("timeout")), (_a = options.timeout) != null ? _a : 9e5);
    finish = (error, value, records) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      clearTimeout(cancelTimer);
      Promise.resolve().then(async () => {
        if (records !== void 0) await options.onSnapshot((0, import_webkit_handoff3.cookieDetails)(records, options.fixture));
      }).then(() => {
        native.dispose();
        if (error) reject(error);
        else resolve(value);
      }, (failure) => {
        var _a2;
        const code = failure == null ? void 0 : failure.message;
        (_a2 = options.onStatus) == null ? void 0 : _a2.call(options, "SNAPSHOT_" + (/^[a-zA-Z0-9_-]{1,100}$/.test(code) ? code : "FAILED"));
        native.dispose();
        reject(new Error("snapshot-failed"));
      });
    };
    try {
      native.open(window.getNativeWindowHandle(), JSON.stringify({ fixture: options.fixture, cookies: options.initialCookies }), (json) => {
        var _a2, _b, _c, _d, _e, _f;
        if (settled) return;
        try {
          const event = JSON.parse(json);
          if (event.type === "cookie-scope" && Number.isInteger(event.partitionedExcluded) && event.partitionedExcluded > 0 && event.partitionedExcluded <= 256) {
            (_a2 = options.onStatus) == null ? void 0 : _a2.call(options, "PARTITIONED_EXCLUDED_" + event.partitionedExcluded);
            return;
          }
          if (event.type === "result" && Number.isInteger((_b = event.result) == null ? void 0 : _b.status) && event.result.status >= 400 && event.result.status <= 599) {
            (_c = options.onStatus) == null ? void 0 : _c.call(options, "HTTP_" + event.result.status);
            return;
          }
          if (event.type === "handoff") {
            (_d = options.onStatus) == null ? void 0 : _d.call(options, "HANDOFF_RECEIVED");
            const value = (0, import_webkit_handoff4.validateHandoff)(event, options.fixture);
            if (!Array.isArray(event.sessionCookies)) throw new Error("missing-snapshot");
            finish(cancelled ? new Error("cancelled") : void 0, value, event.sessionCookies);
          } else if (event.type === "cancelled") finish(new Error("cancelled"), void 0, event.cookies);
          else if (event.type === "error" || event.type === "result" && !((_e = event.result) == null ? void 0 : _e.ok)) {
            const code = Number.isInteger((_f = event.result) == null ? void 0 : _f.errorCode) ? "NAVIGATION_" + event.result.errorCode : /^[a-z-]{1,40}$/.test(event.code || "") ? event.code : "login-failed";
            finish(new Error(code));
          }
        } catch {
          finish(new Error("invalid-response"));
        }
      });
    } catch {
      finish(new Error("native-load-failed"));
    }
  });
  return {
    result,
    focus: () => native.focus(),
    hide: (value) => native.hide(value),
    reload: () => native.reload(),
    cancel: () => {
      if (settled || cancelled) return;
      cancelled = true;
      native.close();
      cancelTimer = setTimeout(() => finish(new Error("cancelled")), 4e3);
    }
  };
}

// src/main/web-login.ts
var import_br_session_recovery = __toESM(require("./br-session-recovery.js"));
var identity = (c) => {
  var _a, _b;
  if (!c.name) throw new Error("invalid-cookie");
  return JSON.stringify([c.name, (_a = c.domain) != null ? _a : new URL(c.url).hostname, (_b = c.path) != null ? _b : "/"]);
};
function cookieSeed(cookies, fixture2) {
  return cookies.filter((c) => {
    var _a;
    return fixture2 ? ((_a = c.domain) == null ? void 0 : _a.replace(/^\./, "")) === "127.0.0.1" : (0, import_webkit_handoff5.allowedDomain)(c.domain);
  }).map((c) => ({
    name: c.name,
    value: c.value,
    domain: c.domain,
    path: c.path,
    hostOnly: !!c.hostOnly,
    secure: !!c.secure,
    httpOnly: !!c.httpOnly,
    session: !!c.session,
    ...!c.session && c.expirationDate !== void 0 ? { expirationDate: c.expirationDate } : {},
    ...c.sameSite && c.sameSite !== "unspecified" ? { sameSite: c.sameSite === "no_restriction" ? "none" : c.sameSite } : {}
  }));
}
function details(c, fixture2) {
  const host = c.domain.replace(/^\./, "");
  return {
    url: `${c.secure ? "https" : "http"}://${host}${fixture2 ? ":" + new URL(fixture2).port : ""}${c.path}`,
    name: c.name,
    value: c.value,
    path: c.path,
    ...c.hostOnly ? {} : { domain: c.domain },
    secure: c.secure,
    httpOnly: c.httpOnly,
    sameSite: c.sameSite,
    ...!c.session ? { expirationDate: c.expirationDate } : {}
  };
}
async function reconcileCookies(ses, seed, snapshot, fixture2) {
  var _a;
  const original = await ses.cookies.get({});
  const next = /* @__PURE__ */ new Map();
  for (const c of snapshot) {
    const key = identity(c), previous = next.get(key);
    if (previous) {
      const fields = ["value", "secure", "httpOnly", "sameSite", "expirationDate", "domain", "path", "url"];
      const different = fields.filter((field) => previous[field] !== c[field]);
      if (different.length) throw new Error("duplicate-cookie-conflict-" + different.join("-"));
    }
    next.set(key, c);
  }
  snapshot = [...next.values()];
  const removed = seed.filter((c) => !next.has(identity(c)));
  const touched = new Set([...snapshot, ...removed].map(identity));
  try {
    for (const c of removed) await ses.cookies.remove(details(c, fixture2).url, c.name);
    for (const c of snapshot) {
      try {
        await ses.cookies.set(c);
      } catch {
        throw new Error(`cookie-set-${c.secure ? "secure" : "plain"}-${c.httpOnly ? "httpOnly" : "script"}-${(_a = c.sameSite) != null ? _a : "unspecified"}-${c.domain ? "domain" : "host"}`);
      }
    }
  } catch (error) {
    const current = await ses.cookies.get({});
    for (const c of current) if (touched.has(identity(c))) await ses.cookies.remove(details(c, fixture2).url, c.name);
    for (const c of original) if (touched.has(identity(c))) await ses.cookies.set(details(c, fixture2));
    const code = error.message;
    throw new Error(/^cookie-set-[a-zA-Z_-]{1,80}$/.test(code) ? code : "cookie-sync-failed");
  }
}
var WebLogin = class {
  constructor(window, games2, profiles, navigation2, binary, report2, test, changed2 = () => {
  }, diagnostic = () => {
  }, onForegroundHandoff = () => {
  }, credentials) {
    this.window = window;
    this.games = games2;
    this.profiles = profiles;
    this.navigation = navigation2;
    this.binary = binary;
    this.report = report2;
    this.test = test;
    this.changed = changed2;
    this.diagnostic = diagnostic;
    this.onForegroundHandoff = onForegroundHandoff;
    this.credentials = credentials;
    this.stopping = false;
    this.onGameChanged = (context) => {
      const attempt = this.pending;
      if ((attempt == null ? void 0 : attempt.stage) === "confirming" && attempt.replacementTabId === context.id && (context.state === "failed" || context.state === "crashed")) {
        this.failCandidate(attempt, "\u65B0\u6E38\u620F\u9875\u9762\u968F\u540E\u52A0\u8F7D\u5931\u8D25\uFF0C\u539F\u6E38\u620F\u6807\u7B7E\u4ECD\u4FDD\u7559\uFF1B\u53EF\u91CD\u65B0\u83B7\u53D6\u5165\u53E3");
      }
    };
    this.onGameClosed = (id) => {
      const attempt = this.pending;
      if (!attempt || attempt.cancelled || attempt.completed || attempt.completing) return;
      if (id === attempt.replacesTabId) {
        void this.cancel("closed-original");
      } else if (id === attempt.replacementTabId) {
        this.failCandidate(attempt, "\u65B0\u6E38\u620F\u6807\u7B7E\u5DF2\u5173\u95ED\uFF0C\u539F\u6E38\u620F\u6807\u7B7E\u4ECD\u4FDD\u7559");
      }
    };
    this.games.lifecycle.on("changed", this.onGameChanged);
    this.games.lifecycle.on("closed", this.onGameClosed);
  }
  get tabInfo() {
    const p = this.pending;
    if (!p || p.cancelled || p.replacementTabId && this.games.tabs.some((tab) => tab.id === p.replacementTabId)) return void 0;
    return {
      ...p.saved,
      name: p.replacesTabId ? "\u91CD\u65B0\u83B7\u53D6\u6E38\u620F\u5165\u53E3\u2026" : p.saved.name,
      title: "\u5DF4\u897F\u670D",
      state: "loading",
      ...p.replacesTabId ? { recoveryStage: p.stage } : {}
    };
  }
  get operation() {
    var _a;
    const p = this.pending;
    if (!p || p.cancelled || p.completed || p.completing) return void 0;
    return {
      tabId: (_a = p.replacementTabId) != null ? _a : p.saved.id,
      stage: p.stage,
      recovering: !!p.replacesTabId,
      ...p.saved.profileId ? { profileId: p.saved.profileId } : {},
      ...p.replacesTabId ? { originalId: p.replacesTabId } : {},
      ...p.replacementTabId ? { candidateId: p.replacementTabId } : {}
    };
  }
  get busy() {
    return !!this.pending;
  }
  open(saved, profileSlot) {
    return this.start(saved, void 0, void 0, profileSlot);
  }
  recover(tab) {
    if (tab.region !== "br" || tab.view.webContents.isDestroyed()) return Promise.resolve();
    if (this.pending) {
      if (!this.pending.cancelled && this.pending.replacesTabId === tab.id) return this.pending.task;
      throw new Error(this.pending.cancelled ? "\u4E0A\u4E00\u9879\u767B\u5F55\u6216\u6062\u590D\u6D41\u7A0B\u6B63\u5728\u7ED3\u675F\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5" : "\u53E6\u4E00\u4E2A\u8D26\u53F7\u6B63\u5728\u767B\u5F55\u6216\u6062\u590D\uFF0C\u8BF7\u5148\u5B8C\u6210\u6216\u53D6\u6D88\u5F53\u524D\u6D41\u7A0B");
    }
    if (!tab.profile) {
      this.report("\u65E0\u6CD5\u6CBF\u7528\u5F53\u524D\u6E38\u620F\u4F1A\u8BDD\uFF1B\u539F\u6E38\u620F\u6807\u7B7E\u4ECD\u4FDD\u7559");
      return Promise.resolve();
    }
    let retained;
    try {
      retained = this.profiles.retain(tab.profile.partition);
    } catch {
      this.report("\u65E0\u6CD5\u4FDD\u7559\u5F53\u524D\u8D26\u53F7\u4F1A\u8BDD\uFF1B\u539F\u6E38\u620F\u6807\u7B7E\u4ECD\u4FDD\u7559");
      return Promise.resolve();
    }
    const saved = { id: newTab("br").id, name: tab.name, region: "br", ...tab.profileId ? { profileId: tab.profileId } : {} };
    this.navigation.selectLogin(saved.id);
    return this.start(saved, { replacesTabId: tab.id }, retained);
  }
  focus() {
    var _a, _b, _c;
    if (process.env.NARUTO_TEST_HIDDEN === "1" || ((_a = this.test) == null ? void 0 : _a.visible) === false) return;
    (_c = (_b = this.pending) == null ? void 0 : _b.handle) == null ? void 0 : _c.focus();
  }
  start(saved, replacement, retainedProfile, profileSlot) {
    var _a;
    if (this.stopping || this.window.isDestroyed()) {
      retainedProfile == null ? void 0 : retainedProfile.release();
      return Promise.resolve();
    }
    if (this.pending) {
      retainedProfile == null ? void 0 : retainedProfile.release();
      if (this.pending.cancelled) throw new Error("\u4E0A\u4E00\u9879\u767B\u5F55\u6216\u6062\u590D\u6D41\u7A0B\u6B63\u5728\u7ED3\u675F\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5");
      if (this.pending.saved.id !== saved.id || this.pending.replacesTabId !== (replacement == null ? void 0 : replacement.replacesTabId)) {
        throw new Error("\u53E6\u4E00\u4E2A\u8D26\u53F7\u6B63\u5728\u767B\u5F55\u6216\u6062\u590D\uFF0C\u8BF7\u5148\u5B8C\u6210\u6216\u53D6\u6D88\u5F53\u524D\u6D41\u7A0B");
      }
      if (this.taskIsForeground(this.pending)) (_a = this.pending.handle) == null ? void 0 : _a.focus();
      return this.pending.task;
    }
    const region = saved.region === "cn" ? "cn" : "br";
    const profile = retainedProfile != null ? retainedProfile : profileSlot === void 0 ? this.profiles.acquire(region) : this.profiles.acquireSlot(region, profileSlot);
    const attempt = { saved, task: Promise.resolve(), cancelled: false, stage: "login", ...replacement };
    this.pending = attempt;
    this.changed();
    attempt.task = (async () => {
      var _a2;
      let transferred = false;
      try {
        await profile.ready.catch(() => {
        });
        if (attempt.cancelled) return;
        if (region === "br" && process.env.NARUTO_BR_SESSION_RECOVERY !== "0" && saved.profileId) {
          this.diagnostic("BR_RECOVERY_START");
          try {
            const recoveryConfig = (0, import_br_session_recovery.readConfig)(import_electron4.app.getPath("userData"), saved.profileId);
            if (!recoveryConfig) this.diagnostic("BR_RECOVERY_NO_CONFIG");
            if (recoveryConfig) {
              const recovery = new import_br_session_recovery.BrSessionRecovery({ profileRoot: recoveryConfig.profileRoot || void 0 });
              const restored = await recovery.recover({
                account: recoveryConfig.officialAccount,
                serverId: recoveryConfig.serverId,
                onDiag: (code) => this.diagnostic(code),
                updateCookies: profile.updateCookies,
                isCancelled: () => attempt.cancelled || this.stopping
              });
              if (restored.ok && restored.launchUrl && !attempt.cancelled && !this.stopping) {
                const tab2 = this.games.create(saved, restored.launchUrl, profile);
                transferred = true;
                if (this.navigation.handoffGame(saved.id, tab2.id)) this.onForegroundHandoff();
                return;
              }
              const reason = restored.reason;
              if (typeof reason === "string" && /^[a-zA-Z0-9_-]{1,60}$/.test(reason)) this.diagnostic("BR_RECOVERY_" + reason.toUpperCase());
              if (["encrypted_cookie_values_unsupported", "cef_master_key_unavailable", "cef_cookie_decryption_failed", "cef_app_bound_encryption_unsupported", "dpapi_unprotect_failed"].includes(reason)) {
                this.report("官方客户端 CEF 登录凭证仍受加密保护，当前 Windows 账户无法恢复。请确认使用相同 Windows 用户登录官方客户端，完全退出客户端后重试；不会打开已知被 Passport 403 拒绝的旧登录窗口。");
                return;
              }
              if (reason === "no_portal_cookies" || reason === "no_valid_game_cookies") {
                this.report("未找到可供巴西区门户使用的登录 Cookie。请重新在官方客户端登录对应账号、正常退出后再尝试。");
                return;
              }
              if (reason === "portal_blocked" || reason === "portal_timeout") {
                this.report("BR \u95E8\u6237\u88AB Cloudflare \u62E6\u622A\uFF08403\uFF09\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\uFF1B\u5DF2\u4FDD\u7559\u6062\u590D\u4F1A\u8BDD\uFF0C\u672A\u6253\u5F00\u767B\u5F55\u7A97\u53E3\u3002");
                return;
              }
            }
          } catch {
            this.diagnostic("BR_RECOVERY_FAILED");
          }
        }
        const all = await profile.session.cookies.get({});
        const seed = all.filter((c) => {
          var _a3;
          return this.test ? ((_a3 = c.domain) == null ? void 0 : _a3.replace(/^\./, "")) === "127.0.0.1" : (0, import_webkit_handoff5.allowedDomain)(c.domain);
        });
        if (attempt.cancelled) return;
        const handle = startEmbeddedLogin(this.binary, this.window, {
          ...this.test,
          initialCookies: cookieSeed(seed, (_a2 = this.test) == null ? void 0 : _a2.fixture),
          credentials: this.credentials,
          onSnapshot: (snapshot) => profile.updateCookies((ses) => {
            var _a3;
            return reconcileCookies(ses, seed, snapshot, (_a3 = this.test) == null ? void 0 : _a3.fixture);
          }),
          onStatus: (code) => {
            var _a3;
            this.diagnostic("WEB_LOGIN_" + code);
            const status = (_a3 = /^(?:LOGIN_)?HTTP_(\d{3})\b/.exec(code)) == null ? void 0 : _a3[1];
            if (status) this.report(attempt.replacesTabId ? `\u5B98\u7F51\u767B\u5F55/\u9009\u670D\u9875\u8FD4\u56DE ${status}\uFF1B\u8BF7\u6309\u9875\u9762\u63D0\u793A\u91CD\u65B0\u767B\u5F55\u6216\u9009\u62E9\u533A\u670D\uFF0C\u53D6\u6D88\u540E\u539F\u6E38\u620F\u6807\u7B7E\u4ECD\u4FDD\u7559` : `\u5B98\u7F51\u8FD4\u56DE ${status}\uFF0C\u53EF\u68C0\u67E5\u7F51\u7EDC\u540E\u624B\u52A8\u5237\u65B0`);
          }
        });
        attempt.handle = handle;
        handle.hide(!this.taskIsForeground(attempt));
        const handoff = await handle.result;
        attempt.handle = void 0;
        if (attempt.cancelled || this.stopping || this.window.isDestroyed()) return;
        if (attempt.replacesTabId) {
          attempt.stage = "loading";
          attempt.replacementTabId = saved.id;
          this.changed();
        }
        const tab = this.games.create(saved, handoff.url, profile);
        transferred = true;
        if (attempt.replacesTabId) tab.recoveryStage = "loading";
        if (this.navigation.handoffGame(saved.id, tab.id)) this.onForegroundHandoff();
        if (attempt.replacesTabId) {
          try {
            await this.games.waitForReady(tab.id);
            if (attempt.cancelled || this.stopping || tab.state !== "ready" || tab.view.webContents.isDestroyed()) throw new Error("cancelled");
            attempt.stage = "confirming";
            tab.recoveryStage = "confirming";
            this.changed();
          } catch {
            if (!attempt.cancelled) throw new Error("replacement-game-not-ready");
          }
        }
      } catch (error) {
        const code = error.message;
        const wasCancelled = attempt.cancelled;
        this.diagnostic("WEB_LOGIN_" + (/^[a-zA-Z0-9_-]{1,60}$/.test(code) ? code : "FAILED"));
        if (attempt.replacesTabId && !wasCancelled) {
          attempt.foregroundAtCancel = this.taskIsForeground(attempt);
          attempt.selectionVersionAtCancel = this.navigation.selectionVersion;
          attempt.cancelIntent = "restore-original";
          attempt.cancelled = true;
          const candidate = attempt.replacementTabId && this.games.tabs.find((tab) => tab.id === attempt.replacementTabId);
          if (candidate) this.closeCandidate(attempt);
          attempt.replacementTabId = void 0;
        }
        this.returnToOriginal(attempt);
        if (!wasCancelled && error.message !== "cancelled") this.report(attempt.replacesTabId ? code === "replacement-game-not-ready" ? "\u65B0\u6E38\u620F\u9875\u9762\u672A\u6210\u529F\u542F\u52A8\uFF0C\u539F\u6E38\u620F\u6807\u7B7E\u4ECD\u4FDD\u7559\uFF1B\u53EF\u68C0\u67E5\u7F51\u7EDC\u540E\u91CD\u8BD5" : "\u91CD\u65B0\u83B7\u53D6\u6E38\u620F\u5165\u53E3\u672A\u5B8C\u6210\uFF1B\u539F\u6E38\u620F\u6807\u7B7E\u4ECD\u4FDD\u7559\uFF0C\u53EF\u518D\u6B21\u5C1D\u8BD5\u6216\u53D6\u6D88" : "\u5DF4\u897F\u670D\u767B\u5F55\u672A\u5B8C\u6210\uFF0C\u8BF7\u91CD\u65B0\u6253\u5F00\u767B\u5F55\u7A97\u53E3");
      } finally {
        if (!transferred) profile.release();
        if (this.pending === attempt && (attempt.cancelled || !attempt.replacesTabId || attempt.stage !== "confirming")) this.pending = void 0;
        this.changed();
      }
    })();
    return attempt.task;
  }
  async close() {
    this.stopping = true;
    await this.cancel("exit");
    this.games.lifecycle.removeListener("changed", this.onGameChanged);
    this.games.lifecycle.removeListener("closed", this.onGameClosed);
  }
  hide(hidden) {
    var _a, _b;
    if (((_a = this.pending) == null ? void 0 : _a.stage) === "login") (_b = this.pending.handle) == null ? void 0 : _b.hide(hidden || !!this.pending.cancelled);
  }
  refresh() {
    var _a, _b, _c;
    if (((_a = this.operation) == null ? void 0 : _a.stage) === "login") (_c = (_b = this.pending) == null ? void 0 : _b.handle) == null ? void 0 : _c.reload();
  }
  completeRecovery(candidateId) {
    const attempt = this.pending;
    if (!attempt || attempt.cancelled || attempt.completed || attempt.completing || attempt.stage !== "confirming" || attempt.replacementTabId !== candidateId || !attempt.replacesTabId) return false;
    const candidate = this.games.tabs.find((tab) => tab.id === candidateId);
    if (!candidate || candidate.state !== "ready" || candidate.view.webContents.isDestroyed() || !this.games.tabs.some((tab) => tab.id === attempt.replacesTabId)) return false;
    attempt.completing = true;
    attempt.completed = true;
    candidate.recoveryStage = void 0;
    this.pending = void 0;
    this.navigation.completeRecovery(attempt.replacesTabId, candidateId);
    this.games.close(attempt.replacesTabId, { deferDestroy: true });
    this.changed();
    return true;
  }
  async cancelRecovery(candidateId) {
    const attempt = this.pending;
    if (!attempt || attempt.stage !== "confirming" || attempt.replacementTabId !== candidateId || attempt.cancelled || attempt.completed) return;
    await this.cancel("restore-original");
  }
  canCloseOriginal(id) {
    const attempt = this.pending;
    return !!attempt && !attempt.cancelled && !attempt.completed && attempt.replacesTabId === id && attempt.stage !== "confirming";
  }
  returnToOriginal(attempt) {
    var _a;
    const id = attempt.replacesTabId;
    if (!id || attempt.originalSelected || this.stopping || this.window.isDestroyed() || attempt.cancelIntent !== "restore-original") return;
    attempt.originalSelected = this.navigation.restoreOriginal(id, (_a = attempt.selectionVersionAtCancel) != null ? _a : 0, !!attempt.foregroundAtCancel);
  }
  async cancel(intent = "restore-original") {
    var _a, _b;
    const attempt = this.pending;
    if (!attempt || attempt.completed) return;
    if (!attempt.cancelled) {
      attempt.foregroundAtCancel = this.taskIsForeground(attempt);
      attempt.selectionVersionAtCancel = this.navigation.selectionVersion;
      attempt.cancelIntent = intent;
      attempt.cancelled = true;
      if (attempt.stage === "login") {
        (_a = attempt.handle) == null ? void 0 : _a.hide(true);
        (_b = attempt.handle) == null ? void 0 : _b.cancel();
      }
      this.changed();
      if (attempt.replacesTabId && attempt.replacementTabId) this.closeCandidate(attempt);
    }
    await attempt.task;
    if (this.pending === attempt) this.pending = void 0;
    this.returnToOriginal(attempt);
    this.changed();
  }
  failCandidate(attempt, message) {
    if (this.pending !== attempt || attempt.cancelled || attempt.completed || attempt.completing || !attempt.replacesTabId) return;
    attempt.foregroundAtCancel = this.taskIsForeground(attempt);
    attempt.selectionVersionAtCancel = this.navigation.selectionVersion;
    attempt.cancelIntent = "restore-original";
    attempt.cancelled = true;
    this.closeCandidate(attempt);
    this.pending = void 0;
    this.returnToOriginal(attempt);
    if (!this.stopping) this.report(message);
    this.changed();
  }
  closeCandidate(attempt) {
    const id = attempt.replacementTabId;
    if (!id || !this.games.tabs.some((tab) => tab.id === id)) return;
    if (!this.stopping) this.navigation.prepareCandidateClose(id, attempt.replacesTabId);
    this.games.close(id, { deferDestroy: true });
  }
  taskIsForeground(attempt) {
    var _a;
    const operation = {
      tabId: (_a = attempt.replacementTabId) != null ? _a : attempt.saved.id,
      stage: attempt.stage,
      recovering: !!attempt.replacesTabId,
      ...attempt.replacesTabId ? { originalId: attempt.replacesTabId } : {},
      ...attempt.replacementTabId ? { candidateId: attempt.replacementTabId } : {}
    };
    return this.navigation.isLoginForeground(attempt.saved.id, operation);
  }
};

// src/main/navigation.ts
var Navigation = class {
  constructor(games2) {
    this.games = games2;
    this.foregroundLoginId = null;
    this.version = 0;
    this.obscured = false;
  }
  get selectionVersion() {
    return this.version;
  }
  get isObscured() {
    return this.obscured;
  }
  snapshot(operationTabId) {
    const target = this.games.activeId ? { kind: "game", id: this.games.activeId } : this.foregroundLoginId && this.foregroundLoginId === operationTabId ? { kind: "login", id: this.foregroundLoginId } : { kind: "home" };
    return { version: this.version, target, obscured: this.obscured };
  }
  isLoginForeground(id, operation) {
    if (!operation || operation.tabId !== id || this.obscured) return false;
    if (operation.candidateId && this.games.activeId === operation.candidateId) return true;
    if (operation.recovering && operation.originalId === this.games.activeId && this.foregroundLoginId === id) return true;
    return this.games.activeId === null && this.foregroundLoginId === id;
  }
  syncOverlay(settingsOpen2, modalOpen2) {
    const obscured = settingsOpen2 || modalOpen2;
    if (obscured !== this.obscured) this.version++;
    this.obscured = obscured;
    this.games.hidden = obscured;
  }
  syncOperation(operationTabId) {
    if (this.foregroundLoginId && this.foregroundLoginId !== operationTabId) this.foregroundLoginId = null;
  }
  selectHome() {
    this.version++;
    this.foregroundLoginId = null;
    this.obscured = false;
    this.games.hidden = false;
    this.games.select(null);
  }
  selectGame(id) {
    this.version++;
    this.foregroundLoginId = null;
    this.obscured = false;
    this.games.hidden = false;
    this.games.select(id);
  }
  selectLogin(id) {
    this.version++;
    this.obscured = false;
    this.games.hidden = false;
    this.games.select(null);
    this.foregroundLoginId = id;
  }
  clearLoginTask(id) {
    if (this.foregroundLoginId === id) this.foregroundLoginId = null;
  }
  selectGameForTask(id) {
    this.foregroundLoginId = null;
    this.games.select(id);
  }
  handoffGame(taskId, gameId) {
    if (this.obscured || this.foregroundLoginId !== taskId || this.games.activeId !== null) return false;
    this.selectGameForTask(gameId);
    return true;
  }
  closeGame(id) {
    if (this.games.activeId !== id) return;
    this.version++;
    this.foregroundLoginId = null;
  }
  completeRecovery(originalId, candidateId) {
    if (this.games.activeId !== originalId) return false;
    this.selectGame(candidateId);
    return true;
  }
  prepareCandidateClose(candidateId, originalId) {
    var _a, _b;
    if (this.games.activeId !== candidateId) return;
    const fallback = originalId && this.games.tabs.some((tab) => tab.id === originalId) ? originalId : (_b = (_a = this.games.tabs.find((tab) => tab.id !== candidateId)) == null ? void 0 : _a.id) != null ? _b : null;
    this.selectGameForTask(fallback);
  }
  restoreOriginal(id, version, wasForeground) {
    if (!wasForeground || version !== this.version || !this.games.tabs.some((tab) => tab.id === id)) return false;
    if (this.games.activeId !== id) this.selectGameForTask(id);
    else this.foregroundLoginId = null;
    return true;
  }
};

// src/main/index.ts
init_policy();
init_model();
init_traffic_lights();
init_appearance();

// src/main/window-platform.ts
function windowOptions(platform, bounds, backgroundColor) {
  return {
    ...bounds,
    minWidth: 800,
    minHeight: 560,
    title: "Naruto OS",
    ...platform === "darwin" ? { titleBarStyle: "hidden", trafficLightPosition: { x: 14, y: 15 } } : {},
    backgroundColor,
    show: false
  };
}
function menuPlatform(platform) {
  return {
    application: platform === "darwin" ? [{ role: "hide" }, { role: "hideOthers" }, { role: "unhide" }, { type: "separator" }] : [],
    window: [{ role: "minimize" }, platform === "darwin" ? { role: "zoom" } : { label: "\u6700\u5927\u5316/\u8FD8\u539F", click: (_item, window) => (window == null ? void 0 : window.isMaximized()) ? window.unmaximize() : window == null ? void 0 : window.maximize() }, { role: "togglefullscreen" }]
  };
}

// src/main/index.ts
var root = import_path10.default.resolve(__dirname, "../..");
var windowsSmoke = process.env.NARUTO_TEST_MODE === "1" && process.env.NARUTO_TEST_WINDOWS_SMOKE === "1";
if (windowsSmoke) {
  const dataDir = import_path10.default.resolve(process.env.NARUTO_DATA_DIR || "");
  if (!dataDir.startsWith(import_path10.default.resolve(root, ".test-artifacts") + import_path10.default.sep)) throw new Error("Windows smoke requires isolated .test-artifacts NARUTO_DATA_DIR");
  import_fs6.default.mkdirSync(dataDir, { recursive: true });
  if (import_fs6.default.readdirSync(dataDir).some((file) => /profiles|credentials|sessions/i.test(file))) throw new Error("Windows smoke data directory contains profile data");
  import_electron8.app.commandLine.appendSwitch("disable-plugins");
  import_electron8.app.on("session-created", (ses) => ses.webRequest.onBeforeRequest({ urls: ["http://*/*", "https://*/*", "ws://*/*", "wss://*/*"] }, (details2, callback) => {
    console.log(`SMOKE_NETWORK_BLOCK ${details2.url.slice(0, 96)}`);
    callback({ cancel: true });
  }));
}
var testLoginFixture = (() => {
  const value = process.env.NARUTO_TEST_LOGIN_FIXTURE_URL;
  if (!value) return void 0;
  if (process.env.NARUTO_TEST_MODE !== "1") throw new Error("login fixture requires isolated test mode");
  const url = new URL(value);
  if (url.protocol !== "http:" || url.hostname !== "127.0.0.1") throw new Error("login fixture must use loopback HTTP");
  return url.href;
})();
import_electron8.app.setName("Naruto OS");
if (process.env.NARUTO_DATA_DIR) import_electron8.app.setPath("userData", import_path10.default.resolve(process.env.NARUTO_DATA_DIR));
var config = new ConfigStore(import_electron8.app.getPath("userData"));
var layout = config.read();
import_electron8.nativeTheme.themeSource = layout.preferences.theme;
var flash = windowsSmoke ? { available: false } : findFlash(root, layout.preferences.flash);
if (flash.available) {
  import_electron8.app.commandLine.appendSwitch("ppapi-flash-path", flash.path);
  import_electron8.app.commandLine.appendSwitch("ppapi-flash-version", flash.version);
}
import_electron8.app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");
var vault = new CredentialVault(keychainTransport(
  import_path10.default.join(root, "dist/native/keychain"),
  process.env.NARUTO_TEST_MODE === "1" ? "cn.youye.naruto-os.test.integration" : void 0
));
var loginSessions = new LoginSessions(keychainTransport(
  import_path10.default.join(root, "dist/native/keychain"),
  process.env.NARUTO_TEST_MODE === "1" ? `cn.youye.naruto-os.test.sessions.${(0, import_crypto6.createHash)("sha256").update(import_electron8.app.getPath("userData")).digest("hex").slice(0, 16)}` : "cn.youye.naruto-os.sessions"
), () => {
  log("LOGIN_STATE_SAVE_FAILED");
  report("\u767B\u5F55\u72B6\u6001\u4FDD\u5B58\u6216\u8BFB\u53D6\u5931\u8D25\uFF0C\u4E0B\u6B21\u53EF\u80FD\u9700\u8981\u91CD\u65B0\u767B\u5F55");
});
var accountProfiles = new AccountProfiles(new AccountProfileStore(import_electron8.app.getPath("userData")), import_electron8.app.getPath("userData"), () => loginSessions.listStoredPartitions());
var win;
var games;
var navigation;
var webLogin;
var settingsOpen = false;
var modalOpen = false;
var profilePickerOpen = false;
var profilePickerIntent = "select";
var notice = "";
var noticeTimer;
var shuttingDown = false;
var deletingProfiles = /* @__PURE__ */ new Map();
var refreshMenuItem;
var closeMenuItem;
var quitApproved = false;
var confirming = false;
var pending = /* @__PURE__ */ new Map();
var candidates = /* @__PURE__ */ new Map();
var queries = /* @__PURE__ */ new Map();
function log(code) {
  try {
    const file = import_path10.default.join(import_electron8.app.getPath("userData"), "errors.log");
    if (import_fs6.default.existsSync(file) && import_fs6.default.statSync(file).size > 256 * 1024) import_fs6.default.writeFileSync(file, "", { mode: 384 });
    import_fs6.default.appendFileSync(file, `${(/* @__PURE__ */ new Date()).toISOString()} ${code}
`, { mode: 384 });
  } catch {
  }
}
function report(message) {
  notice = message;
  if (noticeTimer) clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => {
    notice = "";
    broadcast();
  }, 6e3);
  broadcast();
}
async function discoverProfiles(retry = false) {
  try {
    await accountProfiles.discover(retry);
  } catch {
  }
  broadcast();
}
function profileTabsFor(id) {
  var _a;
  return (_a = games == null ? void 0 : games.tabs.filter((tab) => tab.profileId === id)) != null ? _a : [];
}
function profileDeletionBlockReason(profile) {
  var _a;
  if (profileTabsFor(profile.id).length || ((_a = webLogin == null ? void 0 : webLogin.operation) == null ? void 0 : _a.profileId) === profile.id || loginSessions.leaseCount(profile.region, profile.slot) > 0) {
    return "\u8BF7\u5148\u7ED3\u675F\u8BE5\u6863\u6848\u7684\u6E38\u620F\u6807\u7B7E\u6216\u767B\u5F55/\u6062\u590D\u4EFB\u52A1";
  }
  return "";
}
async function deleteProfile(id) {
  if (typeof id !== "string" || !/^(br|cn)-[1-9]\d*$/.test(id)) throw new Error("\u8D26\u53F7\u6863\u6848\u65E0\u6548");
  if (deletingProfiles.has(id)) throw new Error("\u8BE5\u8D26\u53F7\u6863\u6848\u6B63\u5728\u6E05\u7406\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5");
  const profile = accountProfiles.get(id);
  if (!profile) throw new Error("\u8D26\u53F7\u6863\u6848\u5DF2\u4E0D\u5B58\u5728");
  const blocked = profileDeletionBlockReason(profile);
  if (blocked) throw new Error(blocked);
  if (!accountProfiles.isPendingDelete(id)) {
    accountProfiles.beginDelete(id);
    changed();
  }
  deletingProfiles.set(id, "\u51C6\u5907\u6E05\u7406");
  changed();
  try {
    await loginSessions.clearProfile(profile.region, profile.slot, (stage) => {
      deletingProfiles.set(id, stage);
      broadcast();
    });
    accountProfiles.completeDelete(id);
    try { saveBrRecoverySettingsForUI(id, { enabled: false }); } catch (_) { log("BR_RECOVERY_MAPPING_CLEANUP_FAILED"); }
    deletingProfiles.delete(id);
    changed();
    report(`\u5DF2\u5220\u9664\u8D26\u53F7\u6863\u6848\u201C${profile.name}\u201D`);
  } catch (error) {
    deletingProfiles.delete(id);
    changed();
    throw error;
  }
}
function focusWindow() {
  if (!win || win.isDestroyed() || process.env.NARUTO_TEST_HIDDEN === "1") return;
  win.show();
  win.focus();
}
function focusGameTab(id) {
  profilePickerOpen = false;
  modalOpen = false;
  settingsOpen = false;
  navigation.selectGame(id);
  focusWindow();
  broadcast();
}
function focusLoginTab(id) {
  profilePickerOpen = false;
  modalOpen = false;
  settingsOpen = false;
  navigation.selectLogin(id);
  broadcast();
  webLogin.focus();
  focusWindow();
}
function focusProfile(profile) {
  var _a, _b, _c, _d;
  const operation = webLogin == null ? void 0 : webLogin.operation;
  const candidate = (operation == null ? void 0 : operation.candidateId) ? games.tabs.find((tab2) => tab2.id === operation.candidateId) : void 0;
  const original = (operation == null ? void 0 : operation.originalId) ? games.tabs.find((tab2) => tab2.id === operation.originalId) : void 0;
  const operationProfileId = (_c = (_b = (_a = webLogin == null ? void 0 : webLogin.tabInfo) == null ? void 0 : _a.profileId) != null ? _b : candidate == null ? void 0 : candidate.profileId) != null ? _c : original == null ? void 0 : original.profileId;
  if (operation && operationProfileId === profile.id) {
    accountProfiles.select(profile.id);
    if (candidate) focusGameTab(candidate.id);
    else focusLoginTab(operation.tabId);
    return "focused";
  }
  const tab = (_d = profileTabsFor(profile.id).find((item) => !item.recoveryStage)) != null ? _d : profileTabsFor(profile.id)[0];
  if (tab) {
    accountProfiles.select(profile.id);
    focusGameTab(tab.id);
    return "focused";
  }
  if (webLogin == null ? void 0 : webLogin.busy) {
    report("\u53E6\u4E00\u4E2A\u8D26\u53F7\u6B63\u5728\u767B\u5F55\u6216\u6062\u590D\uFF0C\u8BF7\u5148\u5B8C\u6210\u6216\u53D6\u6D88\u5F53\u524D\u6D41\u7A0B");
    return "busy";
  }
  return "none";
}
function openProfile(profile) {
  if (shuttingDown || !win || win.isDestroyed()) return false;
  if (accountProfiles.isPendingDelete(profile.id)) {
    report("\u8BE5\u8D26\u53F7\u6863\u6848\u6E05\u7406\u672A\u5B8C\u6210\uFF0C\u8BF7\u5728\u8BBE\u7F6E\u4E2D\u91CD\u8BD5\u6E05\u7406");
    return false;
  }
  const focused = focusProfile(profile);
  if (focused !== "none") return focused === "focused";
  try {
    const saved = { ...newTab(profile.region), name: "", profileId: profile.id };
    profilePickerOpen = false;
    modalOpen = false;
    settingsOpen = false;
    accountProfiles.select(profile.id);
    if (profile.region === "br" && (process.env.NARUTO_TEST_MODE !== "1" || process.env.NARUTO_TEST_MANUAL_LOGIN === "1")) {
      navigation.selectLogin(saved.id);
      void webLogin.open(saved, profile.slot);
    } else {
      const tab = games.create(saved, void 0, void 0, profile.slot);
      navigation.selectGame(tab.id);
      focusWindow();
    }
    broadcast();
    return true;
  } catch (error) {
    report(error instanceof Error ? error.message : "\u65E0\u6CD5\u6253\u5F00\u8BE5\u8D26\u53F7\u6863\u6848\uFF0C\u8BF7\u91CD\u8BD5");
    return false;
  }
}
function startSelectedProfile() {
  const selected = accountProfiles.selected(layout.preferences.region);
  const profile = selected ? accountProfiles.get(selected) : void 0;
  if (!profile) {
    profilePickerIntent = "select";
    profilePickerOpen = true;
    modalOpen = true;
    void discoverProfiles();
    broadcast();
    return false;
  }
  if (accountProfiles.isPendingDelete(profile.id)) {
    report("\u8BE5\u8D26\u53F7\u6863\u6848\u6E05\u7406\u672A\u5B8C\u6210\uFF0C\u8BF7\u5728\u8BBE\u7F6E\u4E2D\u91CD\u8BD5\u6E05\u7406");
    return false;
  }
  return openProfile(profile);
}
function visibleActiveId() {
  var _a;
  const snapshot = navigation == null ? void 0 : navigation.snapshot((_a = webLogin == null ? void 0 : webLogin.operation) == null ? void 0 : _a.tabId);
  return snapshot && snapshot.target.kind !== "home" ? snapshot.target.id : null;
}
function tabInfos() {
  var _a;
  const operation = webLogin == null ? void 0 : webLogin.operation;
  const withProfileName = (tab) => {
    const profile = tab.profileId ? accountProfiles.get(tab.profileId) : void 0;
    return {
      id: tab.id,
      name: tab.name,
      region: tab.region,
      state: tab.state,
      title: tab.title,
      ...tab.profileId ? { profileId: tab.profileId } : {},
      ...profile ? { profileName: profile.name } : {},
      ...(operation == null ? void 0 : operation.candidateId) === tab.id ? { recoveryStage: operation.stage } : {},
      ...(operation == null ? void 0 : operation.originalId) === tab.id && operation.stage !== "confirming" ? { closeDisabled: true } : {}
    };
  };
  const tabs = ((_a = games == null ? void 0 : games.tabs) != null ? _a : []).map(withProfileName);
  const loginTab = webLogin == null ? void 0 : webLogin.tabInfo;
  if (loginTab && !tabs.some((tab) => tab.id === loginTab.id)) {
    const profile = loginTab.profileId ? accountProfiles.get(loginTab.profileId) : void 0;
    tabs.push({ ...loginTab, ...profile ? { profileName: profile.name } : {} });
  }
  return tabs;
}
function refreshRequiresFreshEntry(tab) {
  return tab.region === "br" && (tab.state === "failed" || tab.state === "crashed");
}
function refreshState() {
  const operation = webLogin == null ? void 0 : webLogin.operation;
  if ((navigation == null ? void 0 : navigation.isObscured) || shuttingDown) return { enabled: false, label: (operation == null ? void 0 : operation.stage) === "loading" ? "\u6B63\u5728\u91CD\u65B0\u8FDB\u5165\u2026" : "\u5237\u65B0\u5F53\u524D\u9875\u9762" };
  if (operation && navigation.isLoginForeground(operation.tabId, operation) && operation.stage === "login") {
    return { enabled: true, label: "\u5237\u65B0\u767B\u5F55/\u9009\u670D\u9875\u9762" };
  }
  const tab = games == null ? void 0 : games.tabs.find((item) => item.id === (games == null ? void 0 : games.activeId));
  if (!tab) return { enabled: false, label: "\u5237\u65B0\u5F53\u524D\u9875\u9762" };
  if (tab.recoveryStage) return { enabled: false, label: tab.recoveryStage === "loading" ? "\u6B63\u5728\u91CD\u65B0\u8FDB\u5165\u2026" : "\u7B49\u5F85\u786E\u8BA4\u65B0\u6E38\u620F" };
  return { enabled: true, label: refreshRequiresFreshEntry(tab) ? "\u91CD\u65B0\u8FDB\u5165\u6E38\u620F" : "\u5237\u65B0\u5F53\u524D\u9875\u9762" };
}
function saveLayout() {
  if (!games || shuttingDown || !win || win.isDestroyed()) return false;
  layout = {
    ...layout,
    tabs: tabInfos().map(({ id, name, region, profileId: profileId2 }) => ({ id, name, region, ...profileId2 ? { profileId: profileId2 } : {} })),
    activeId: visibleActiveId(),
    bounds: win.getNormalBounds(),
    maximized: win.isMaximized(),
    fullscreen: win.isFullScreen()
  };
  try {
    config.write(layout);
    return true;
  } catch {
    log("CONFIG_WRITE_FAILED");
    report("\u5E03\u5C40\u4FDD\u5B58\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5\u78C1\u76D8\u7A7A\u95F4");
    return false;
  }
}
function saveLobbyPreference(key, value) {
  const previous = layout.preferences[key];
  layout.preferences[key] = value;
  if (!saveLayout()) {
    layout.preferences[key] = previous;
    broadcast();
    return false;
  }
  broadcast();
  return true;
}
function firstRunSetupStatus() {
  const file = import_path10.default.join(import_electron8.app.getPath("userData"), "first-run-setup.json");
  try {
    const raw = JSON.parse(import_fs6.default.readFileSync(file, "utf8"));
    if (raw && raw.version === 1 && raw.completed === true) {
      return { required: false, completed: true, mode: typeof raw.mode === "string" ? raw.mode : "manual" };
    }
  } catch (_) {
  }
  return { required: true, completed: false, mode: "" };
}
function completeFirstRunSetup(mode) {
  if (!["recovery", "manual", "later"].includes(mode)) throw new Error("首次配置状态无效");
  const directory = import_electron8.app.getPath("userData");
  const file = import_path10.default.join(directory, "first-run-setup.json");
  const temporary = file + "." + import_crypto6.randomBytes(6).toString("hex") + ".tmp";
  const value = { version: 1, completed: true, mode: mode, completedAt: new Date().toISOString() };
  try {
    import_fs6.default.mkdirSync(directory, { recursive: true });
    import_fs6.default.writeFileSync(temporary, JSON.stringify(value, null, 2), { encoding: "utf8", mode: 384 });
    import_fs6.default.renameSync(temporary, file);
  } catch (_) {
    try { if (import_fs6.default.existsSync(temporary)) import_fs6.default.unlinkSync(temporary); } catch (_) {}
    throw new Error("无法保存首次配置状态，请检查用户数据目录权限");
  }
  return firstRunSetupStatus();
}
function state() {
  const active = visibleActiveId();
  const item = active ? pending.get(active) : void 0;
  const prompt = (item == null ? void 0 : item.ready) && item.expires > Date.now() ? { tabId: active, username: item.username, origin: item.origin, update: item.update } : null;
  const operation = webLogin == null ? void 0 : webLogin.operation;
  const recovery = (operation == null ? void 0 : operation.recovering) && operation.stage === "confirming" && operation.originalId && operation.candidateId && active === operation.candidateId ? { originalId: operation.originalId, candidateId: operation.candidateId } : null;
  return {
    tabs: tabInfos(),
    activeId: active,
    preferences: layout.preferences,
    settingsOpen,
    prompt,
    recovery,
    refresh: refreshState(),
    flash,
    notice,
    profiles: accountProfiles.list().map(({ id, region, slot, name, serverNote }) => {
      var _a;
      return {
        id,
        region,
        name,
        serverNote,
        recovery: region === "br" ? readBrRecoverySettingsForUI(id) : null,
        identityNeedsConfirmation: name === `\u5386\u53F2\u767B\u5F55\u69FD\u4F4D${slot}`,
        cleanupStatus: deletingProfiles.has(id) ? "deleting" : accountProfiles.isPendingDelete(id) ? "pending" : null,
        cleanupStage: (_a = deletingProfiles.get(id)) != null ? _a : "",
        deleteBlockedReason: profileDeletionBlockReason({ id, region, slot, name, serverNote })
      };
    }),
    selectedProfileId: accountProfiles.selected(layout.preferences.region),
    profileDiscovery: accountProfiles.status,
    profileError: accountProfiles.error,
    canCreateProfile: accountProfiles.canCreate,
    profilePickerOpen,
    profilePickerIntent,
    setup: firstRunSetupStatus(),
    system: {
      platform: process.platform,
      architecture: process.arch,
      electron: process.versions.electron || "",
      flashAvailable: !!flash.available,
      flashVersion: flash.version || ""
    }
  };
}
function broadcast() {
  var _a;
  if (!win || win.isDestroyed() || !games) return;
  navigation.syncOperation((_a = webLogin == null ? void 0 : webLogin.operation) == null ? void 0 : _a.tabId);
  navigation.syncOverlay(settingsOpen, modalOpen);
  for (const [id, item] of pending) {
    const tab = games.tabs.find((tab2) => tab2.id === id);
    if (item.expires <= Date.now() || !tab || tab.view.webContents.isDestroyed() || !savePromptDestination(item.origin, tab.view.webContents.getURL())) pending.delete(id);
  }
  const nextState = state();
  games.top = CHROME_HEIGHT + (!settingsOpen && nextState.prompt ? SAVE_PROMPT_HEIGHT : 0) + (!settingsOpen && nextState.recovery ? RECOVERY_PROMPT_HEIGHT : 0);
  const operation = webLogin == null ? void 0 : webLogin.operation;
  const loginVisible = !!operation && operation.stage === "login" && navigation.isLoginForeground(operation.tabId, operation);
  webLogin == null ? void 0 : webLogin.hide(!loginVisible);
  games.layout();
  win.webContents.send("shell:state", nextState);
  updateMenuItems(nextState);
}
function changed() {
  if (!shuttingDown) {
    broadcast();
    saveLayout();
  }
}
function assertShell(event) {
  if (!win || event.sender !== win.webContents || event.sender.getURL() !== shellURL) throw new Error("\u65E0\u6548\u7684\u754C\u9762\u8BF7\u6C42");
}
function assertGame(event, origin2) {
  const tab = games.fromSender(event.sender.id);
  if (!tab || tab.id !== games.activeId || settingsOpen || typeof origin2 !== "string" || credentialOrigin(event.sender.getURL()) !== origin2) throw new Error("\u65E0\u6548\u7684\u7F51\u7AD9\u8BF7\u6C42");
  return tab;
}
function safeHandler(channel, handler) {
  import_electron8.ipcMain.handle(channel, async (event, input) => {
    try {
      return { ok: true, value: await handler(event, input) };
    } catch (error) {
      const message = error instanceof Error ? error.message : "\u64CD\u4F5C\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5";
      log(`${channel.replace(/[^a-z:-]/g, "").toUpperCase()}_FAILED`);
      return { ok: false, message: message.length < 100 ? message : "\u64CD\u4F5C\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5" };
    }
  });
}
var shellURL = require("url").pathToFileURL(import_path10.default.join(root, "dist/renderer/index.html")).href;
safeHandler("shell:state", (event) => {
  assertShell(event);
  return state();
});
safeHandler("shell:command", async (event, input) => {
  assertShell(event);
  return command(input);
});
safeHandler("shell:br-recovery-accounts", (event, input) => {
  assertShell(event);
  const profileId = input && typeof input.profileId === "string" ? input.profileId : "";
  if (profileId) {
    const profile = accountProfiles.get(profileId);
    if (!profile || profile.region !== "br") throw new Error("巴西区登录档案不存在");
  }
  return listBrOfficialAccountsForUI(profileId);
});
safeHandler("shell:credentials", (event) => {
  assertShell(event);
  return vault.list();
});
safeHandler("shell:credential-sites", (event) => {
  assertShell(event);
  if (!settingsOpen) throw new Error("\u8BF7\u5148\u6253\u5F00\u8BBE\u7F6E");
  return manualCredentialSiteOptions();
});
safeHandler("shell:credential-add", (event, input) => {
  assertShell(event);
  if (!settingsOpen || !input || typeof input.siteId !== "string" || typeof input.username !== "string" || typeof input.password !== "string") throw new Error("\u8D26\u53F7\u4FE1\u606F\u65E0\u6548");
  const site = manualCredentialSite(input.siteId);
  if (!site) throw new Error("\u767B\u5F55\u7AD9\u70B9\u65E0\u6548");
  const expected = input.expected;
  if (expected !== void 0 && (!expected || typeof expected.id !== "string" || typeof expected.version !== "string")) throw new Error("\u786E\u8BA4\u4FE1\u606F\u65E0\u6548\uFF0C\u8BF7\u91CD\u65B0\u64CD\u4F5C");
  return vault.addManual(site.origin, input.username, input.password, expected);
});
safeHandler("shell:reveal", (event, id) => {
  assertShell(event);
  if (!settingsOpen || typeof id !== "string") throw new Error("\u8BF7\u5148\u6253\u5F00\u8BBE\u7F6E");
  return vault.reveal(id);
});
safeHandler("shell:edit", async (event, input) => {
  assertShell(event);
  if (!settingsOpen || !input || typeof input.id !== "string" || typeof input.username !== "string" || typeof input.password !== "string") throw new Error("\u8D26\u53F7\u4FE1\u606F\u65E0\u6548");
  const item = (await vault.list()).find((item2) => item2.id === input.id);
  if (!item) throw new Error("\u8D26\u53F7\u5DF2\u4E0D\u5B58\u5728");
  await vault.save(item.origin, input.username, input.password, item.id);
});
safeHandler("shell:remove", (event, id) => {
  assertShell(event);
  if (!settingsOpen || typeof id !== "string") throw new Error("\u8BF7\u5148\u6253\u5F00\u8BBE\u7F6E");
  return vault.remove(id);
});
safeHandler("game:candidates", async (event, input) => {
  var _a;
  const tab = assertGame(event, input == null ? void 0 : input.origin);
  if (typeof input.query !== "string" || input.query.length > 320) throw new Error("\u8D26\u53F7\u4FE1\u606F\u65E0\u6548");
  const generation = tab.generation;
  const sequence = ((_a = queries.get(tab.id)) != null ? _a : 0) + 1;
  queries.set(tab.id, sequence);
  const records = await vault.list(input.origin, input.query);
  if (queries.get(tab.id) !== sequence || generation !== tab.generation || tab.id !== games.activeId || !games.tabs.includes(tab)) return [];
  candidates.set(tab.id, { origin: input.origin, ids: records.map((r) => r.id), expires: Date.now() + 3e4 });
  return records;
});
safeHandler("game:choose", async (event, input) => {
  const tab = assertGame(event, input == null ? void 0 : input.origin);
  const offered = candidates.get(tab.id);
  if (!offered || offered.expires < Date.now() || offered.origin !== input.origin || !offered.ids.includes(input.id)) throw new Error("\u8BF7\u91CD\u65B0\u9009\u62E9\u8D26\u53F7");
  candidates.delete(tab.id);
  const generation = tab.generation;
  const record = await vault.selected(input.id, input.origin);
  if (!record || generation !== tab.generation || tab.id !== games.activeId || credentialOrigin(event.sender.getURL()) !== input.origin) throw new Error("\u9875\u9762\u5DF2\u53D8\u5316\uFF0C\u8BF7\u91CD\u65B0\u9009\u62E9");
  return { username: record.username, password: record.password };
});
safeHandler("game:submit", async (event, input) => {
  const tab = assertGame(event, input == null ? void 0 : input.origin);
  if (typeof input.username !== "string" || typeof input.password !== "string" || !input.username.trim() || !input.password || input.username.length > 320 || input.password.length > 4096) return;
  const submission = {
    origin: input.origin,
    username: input.username.trim(),
    password: input.password,
    expires: Date.now() + 12e4,
    update: false,
    ready: false,
    checked: false
  };
  pending.set(tab.id, submission);
  broadcast();
  try {
    const result = await vault.needsSave(input.origin, submission.username, submission.password);
    if (pending.get(tab.id) !== submission) return;
    if (!result.needed || !games.tabs.includes(tab) || tab.view.webContents.isDestroyed() || !savePromptDestination(submission.origin, event.sender.getURL())) {
      pending.delete(tab.id);
      broadcast();
      return;
    }
    submission.update = result.update;
    submission.checked = true;
  } catch (error) {
    if (pending.get(tab.id) === submission) {
      pending.delete(tab.id);
      broadcast();
    }
    throw error;
  }
});
safeHandler("game:form-state", (event, input) => {
  const tab = games.fromSender(event.sender.id);
  if (!tab || typeof (input == null ? void 0 : input.hasPassword) !== "boolean") return;
  const item = pending.get(tab.id);
  if (item && (item.expires <= Date.now() || !savePromptDestination(item.origin, event.sender.getURL()))) {
    pending.delete(tab.id);
    broadcast();
  } else if ((item == null ? void 0 : item.checked) && !item.ready && !input.hasPassword && tab.state === "ready") {
    item.ready = true;
    broadcast();
  }
});
async function command(input) {
  var _a, _b, _c, _d;
  if (!input || typeof input !== "object") return;
  switch (input.type) {
    case "new": {
      if (shuttingDown) break;
      profilePickerIntent = "open";
      profilePickerOpen = true;
      modalOpen = true;
      broadcast();
      void discoverProfiles();
      break;
    }
    case "setup-complete": {
      const result = completeFirstRunSetup(input && input.mode);
      changed();
      return result;
    }
    case "profile-start":
      return startSelectedProfile();
    case "profiles-picker":
      profilePickerIntent = "select";
      profilePickerOpen = true;
      modalOpen = true;
      broadcast();
      void discoverProfiles();
      break;
    case "profiles-close-picker":
      profilePickerOpen = false;
      modalOpen = false;
      broadcast();
      break;
    case "profiles-retry":
      void discoverProfiles(true);
      break;
    case "profile-select": {
      const profile = accountProfiles.get(input.id);
      if (!profile || profile.region !== layout.preferences.region || accountProfiles.isPendingDelete(profile.id)) break;
      accountProfiles.select(profile.id);
      profilePickerOpen = false;
      modalOpen = false;
      changed();
      break;
    }
    case "profile-open": {
      const profile = accountProfiles.get(input.id);
      if (!profile || profile.region !== layout.preferences.region) break;
      openProfile(profile);
      break;
    }
    case "profile-create": {
      if (!validRegion(layout.preferences.region)) break;
      const profile = accountProfiles.create(layout.preferences.region, input.name, input.serverNote);
      profilePickerOpen = false;
      modalOpen = false;
      changed();
      report(`\u5DF2\u521B\u5EFA\u8D26\u53F7\u6863\u6848\u201C${profile.name}\u201D`);
      return { id: profile.id };
    }
    case "profile-update": {
      const profile = accountProfiles.update(input.id, input.name, input.serverNote);
      changed();
      report(`\u5DF2\u4FDD\u5B58\u8D26\u53F7\u6863\u6848\u201C${profile.name}\u201D`);
      return { id: profile.id };
    }
    case "profile-recovery-update": {
      const profile = accountProfiles.get(input.id);
      if (!profile || profile.region !== "br" || accountProfiles.isPendingDelete(profile.id)) throw new Error("仅巴西区有效账号支持会话恢复映射");
      saveBrRecoverySettingsForUI(profile.id, input.recovery);
      changed();
      report(input.recovery && input.recovery.enabled ? "巴西区账号映射和服务器设置已保存" : "已关闭该账号的官方会话恢复");
      return readBrRecoverySettingsForUI(profile.id);
    }
    case "profile-delete":
      await deleteProfile(input.id);
      break;
    case "region":
      if (validRegion(input.value)) {
        layout.preferences.region = input.value;
        changed();
      }
      break;
    case "home":
      profilePickerOpen = false;
      modalOpen = false;
      settingsOpen = false;
      navigation.selectHome();
      win.webContents.focus();
      broadcast();
      break;
    case "select":
      if (!navigation.isObscured && typeof input.id === "string") {
        const operation = webLogin.operation;
        if ((operation == null ? void 0 : operation.tabId) === input.id && !games.tabs.some((tab) => tab.id === input.id)) focusLoginTab(input.id);
        else if (games.tabs.some((tab) => tab.id === input.id)) focusGameTab(input.id);
      }
      break;
    case "close":
      if (typeof input.id === "string") {
        if (navigation.isObscured) break;
        if (games.activeId === input.id) navigation.closeGame(input.id);
        const operation = webLogin.operation;
        const isTaskTab = (operation == null ? void 0 : operation.tabId) === input.id && !games.tabs.some((tab) => tab.id === input.id);
        if (isTaskTab || (operation == null ? void 0 : operation.candidateId) === input.id) {
          void webLogin.cancel("restore-original");
          navigation.clearLoginTask(input.id);
          break;
        }
        if ((operation == null ? void 0 : operation.originalId) === input.id) {
          if (operation.stage === "confirming") webLogin.completeRecovery(operation.candidateId);
          else report("\u8BF7\u5148\u53D6\u6D88\u6062\u590D\uFF0C\u518D\u5173\u95ED\u539F\u6E38\u620F");
          break;
        }
        pending.delete(input.id);
        candidates.delete(input.id);
        queries.delete(input.id);
        if (games.tabs.some((tab) => tab.id === input.id)) {
          games.close(input.id, { deferDestroy: true });
        } else changed();
      }
      break;
    case "rename": {
      const tab = games.tabs.find((t) => t.id === input.id);
      if (tab && typeof input.name === "string") {
        tab.name = input.name.trim().slice(0, 40);
        changed();
      }
      break;
    }
    case "refresh": {
      const status = refreshState();
      if (!status.enabled) break;
      const operation = webLogin.operation;
      if ((operation == null ? void 0 : operation.stage) === "login" && navigation.isLoginForeground(operation.tabId, operation)) {
        webLogin.refresh();
        break;
      }
      const tab = games.tabs.find((item) => item.id === games.activeId);
      if (!tab) break;
      if (webLogin.busy && tab.region === "br") {
        report("\u53E6\u4E00\u4E2A\u8D26\u53F7\u6B63\u5728\u767B\u5F55\u6216\u6062\u590D\uFF0C\u8BF7\u5148\u5B8C\u6210\u6216\u53D6\u6D88\u5F53\u524D\u6D41\u7A0B");
        break;
      }
      pending.delete(tab.id);
      candidates.delete(tab.id);
      queries.delete(tab.id);
      if (refreshRequiresFreshEntry(tab)) {
        try {
          void webLogin.recover(tab);
          broadcast();
        } catch (error) {
          report(error instanceof Error ? error.message : "\u91CD\u65B0\u83B7\u53D6\u6E38\u620F\u5165\u53E3\u672A\u5B8C\u6210\uFF0C\u8BF7\u91CD\u8BD5");
        }
      } else games.refresh(tab.id);
      break;
    }
    case "complete-recovery":
      if (typeof input.id === "string") webLogin.completeRecovery(input.id);
      break;
    case "cancel-recovery":
      if (typeof input.id === "string") await webLogin.cancelRecovery(input.id);
      break;
    case "mute":
      layout.preferences.muted = !layout.preferences.muted;
      games.muted = layout.preferences.muted;
      games.syncAudio();
      changed();
      break;
    case "settings":
      if (profilePickerOpen) {
        profilePickerOpen = false;
        modalOpen = false;
      }
      settingsOpen = !settingsOpen;
      broadcast();
      if (settingsOpen) {
        win.webContents.focus();
        void discoverProfiles();
      }
      break;
    case "overlay":
      modalOpen = input.shown === true;
      broadcast();
      if (modalOpen) win.webContents.focus();
      break;
    case "theme":
      if (validTheme(input.value)) {
        layout.preferences.theme = input.value;
        import_electron8.nativeTheme.themeSource = input.value;
        changed();
      }
      break;
    case "title-color":
      if (input.value === null || validTitleColor(input.value)) {
        layout.preferences.titleBarColor = (_b = (_a = input.value) == null ? void 0 : _a.toLowerCase()) != null ? _b : null;
        changed();
      }
      break;
    case "lobby-background":
      if (input.value !== null && !validTitleColor(input.value)) throw new Error("\u542F\u52A8\u9875\u80CC\u666F\u989C\u8272\u65E0\u6548");
      return saveLobbyPreference("lobbyBackground", (_d = (_c = input.value) == null ? void 0 : _c.toLowerCase()) != null ? _d : null);
    case "lobby-motion":
      if (typeof input.value !== "boolean") throw new Error("\u542F\u52A8\u9875\u52A8\u6001\u6548\u679C\u8BBE\u7F6E\u65E0\u6548");
      return saveLobbyPreference("lobbyMotion", input.value);
    case "flash":
      if (input.version === "34" || input.version === "31") {
        if (!findFlash(root, input.version).available) {
          report("\u8BE5\u7248\u672C\u7EC4\u4EF6\u5C1A\u672A\u51C6\u5907\uFF0C\u8BF7\u8FD0\u884C\u5F00\u53D1\u73AF\u5883\u51C6\u5907\u811A\u672C");
          break;
        }
        layout.preferences.flash = input.version;
        changed();
        report("Flash \u504F\u597D\u5DF2\u4FDD\u5B58\uFF0C\u4E0B\u6B21\u542F\u52A8\u751F\u6548");
      }
      break;
    case "dismiss-prompt":
      if (games.activeId) pending.delete(games.activeId);
      broadcast();
      break;
    case "save-password": {
      const id = games.activeId;
      const item = id ? pending.get(id) : void 0;
      if (!item || !item.ready || item.expires < Date.now()) {
        if (id) pending.delete(id);
        broadcast();
        return;
      }
      await vault.save(item.origin, item.username, item.password);
      pending.delete(id);
      broadcast();
      report("\u8D26\u53F7\u5DF2\u4FDD\u5B58\u5230 macOS \u94A5\u5319\u4E32");
      break;
    }
  }
}
function menu() {
  var _a, _b;
  const perform = (type) => () => {
    void command({ type }).catch(() => report("\u64CD\u4F5C\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5"));
  };
  const switchTab = (offset) => () => {
    const tabs = tabInfos();
    const index = tabs.findIndex((t) => t.id === visibleActiveId());
    if (tabs.length) {
      const next = index < 0 ? offset > 0 ? 0 : tabs.length - 1 : (index + offset + tabs.length) % tabs.length;
      void command({ type: "select", id: tabs[next].id });
    }
  };
  const applicationMenu = import_electron8.Menu.buildFromTemplate([
    { label: "Naruto OS", submenu: [{ role: "about" }, { type: "separator" }, { label: "\u8BBE\u7F6E\u2026", accelerator: "CmdOrCtrl+,", click: perform("settings") }, { type: "separator" }, ...menuPlatform(process.platform).application, { role: "quit" }] },
    { label: "\u6E38\u620F", submenu: [
      { label: "\u542F\u52A8\u9875", accelerator: "CmdOrCtrl+Shift+H", click: perform("home") },
      { label: "\u65B0\u5EFA\u6807\u7B7E", accelerator: "CmdOrCtrl+T", click: perform("new") },
      { id: "close-current-tab", label: "\u5173\u95ED\u6807\u7B7E", accelerator: "CmdOrCtrl+W", click: () => {
        const id = visibleActiveId();
        if (id) void command({ type: "close", id });
      } },
      { id: "refresh-current-tab", label: "\u5237\u65B0\u5F53\u524D\u9875\u9762", accelerator: "CmdOrCtrl+R", click: perform("refresh") },
      { label: "\u5F00\u53D1\u8005\u5DE5\u5177\uFF08Network\uFF09", accelerator: "F2", click: () => games.toggleDeveloperTools() },
      { label: "\u603B\u9759\u97F3", accelerator: "CmdOrCtrl+Shift+M", click: perform("mute") },
      { type: "separator" },
      { label: "\u4E0B\u4E00\u4E2A\u6807\u7B7E", accelerator: "Ctrl+Tab", click: switchTab(1) },
      { label: "\u4E0A\u4E00\u4E2A\u6807\u7B7E", accelerator: "Ctrl+Shift+Tab", click: switchTab(-1) },
      ...Array.from({ length: 9 }, (_, i) => ({ label: `\u5207\u6362\u5230\u6807\u7B7E ${i + 1}`, accelerator: `CmdOrCtrl+${i + 1}`, click: () => {
        const tabs = tabInfos();
        const tab = tabs[i === 8 ? tabs.length - 1 : i];
        if (tab) void command({ type: "select", id: tab.id });
      } }))
    ] },
    { label: "\u7F16\u8F91", submenu: [{ role: "undo" }, { role: "redo" }, { type: "separator" }, { role: "cut" }, { role: "copy" }, { role: "paste" }, { role: "selectAll" }] },
    { label: "\u7A97\u53E3", submenu: [...menuPlatform(process.platform).window, { type: "separator" }, { label: "\u5173\u95ED\u7A97\u53E3", accelerator: "CmdOrCtrl+Shift+W", click: () => win.close() }] }
  ]);
  import_electron8.Menu.setApplicationMenu(applicationMenu);
  refreshMenuItem = (_a = applicationMenu.getMenuItemById("refresh-current-tab")) != null ? _a : void 0;
  closeMenuItem = (_b = applicationMenu.getMenuItemById("close-current-tab")) != null ? _b : void 0;
  updateMenuItems();
}
function updateMenuItems(current = state()) {
  if (refreshMenuItem) {
    refreshMenuItem.label = current.refresh.label;
    refreshMenuItem.enabled = current.refresh.enabled;
  }
  if (closeMenuItem) {
    const id = visibleActiveId();
    const active = id ? tabInfos().find((tab) => tab.id === id) : void 0;
    closeMenuItem.enabled = !settingsOpen && !modalOpen && !!id && !(active == null ? void 0 : active.closeDisabled);
  }
}
async function createWindow() {
  var _a, _b;
  const restoreMaximized = layout.maximized;
  const restoreFullscreen = layout.fullscreen;
  const b = layout.bounds;
  if (!import_electron8.screen.getAllDisplays().some((d) => b.x !== void 0 && b.y !== void 0 && b.x < d.workArea.x + d.workArea.width && b.x + b.width > d.workArea.x && b.y < d.workArea.y + d.workArea.height && b.y + b.height > d.workArea.y)) {
    delete b.x;
    delete b.y;
  }
  win = new import_electron8.BrowserWindow({
    ...windowOptions(process.platform, b, import_electron8.nativeTheme.shouldUseDarkColors ? "#202020" : "#fafafa"),
    webPreferences: { preload: import_path10.default.join(root, "dist/preload/shell.js"), nodeIntegration: false, contextIsolation: true, sandbox: true, enableRemoteModule: false, webviewTag: false }
  });
  attachTrafficLights(win);
  const icon = import_path10.default.join(root, "assets/app-icon.png");
  if (import_fs6.default.existsSync(icon)) (_a = import_electron8.app.dock) == null ? void 0 : _a.setIcon(icon);
  else if (import_fs6.default.existsSync(import_path10.default.join(root, "assets/character-icon-chibi.png"))) (_b = import_electron8.app.dock) == null ? void 0 : _b.setIcon(import_path10.default.join(root, "assets/character-icon-chibi.png"));
  win.webContents.on("will-navigate", (e) => e.preventDefault());
  win.webContents.on("new-window", (e) => e.preventDefault());
  const qqProbe = process.env.NARUTO_TEST_PROBE === "qq";
  games = new GameSessions(win, changed, report, process.env.NARUTO_TEST_MODE === "1" ? "about:blank" : qqProbe ? "https://huoying.qq.com/server/website/" : void 0, false, loginSessions, log);
  navigation = new Navigation(games);
  webLogin = new WebLogin(
    win,
    games,
    loginSessions,
    navigation,
    import_path10.default.join(root, "dist/native/embedded-login.node"),
    report,
    testLoginFixture ? { fixture: testLoginFixture, visible: true } : void 0,
    changed,
    log,
    focusWindow,
    {
      candidates: (origin2, query) => vault.list(origin2, query),
      choose: (origin2, id) => vault.selected(id, origin2),
      needsSave: (origin2, username, password) => vault.needsSave(origin2, username, password),
      save: (origin2, username, password) => vault.save(origin2, username, password)
    }
  );
  games.muted = layout.preferences.muted;
  import_electron8.nativeTheme.on("updated", () => {
    if (win.isDestroyed()) return;
    win.setBackgroundColor(import_electron8.nativeTheme.shouldUseDarkColors ? "#202020" : "#fafafa");
    games.updateSurfaceTheme();
  });
  menu();
  win.on("resize", () => {
    games.layout();
    saveLayout();
  });
  win.on("move", saveLayout);
  win.on("enter-full-screen", () => {
    win.webContents.send("shell:fullscreen", true);
    saveLayout();
  });
  win.on("leave-full-screen", () => {
    win.webContents.send("shell:fullscreen", false);
    saveLayout();
  });
  let savingSessions = false, sessionsSaved = false;
  win.on("close", (event) => {
    if (!quitApproved && games.tabs.length && process.env.NARUTO_TEST_MANUAL_ACCEPTANCE !== "1") {
      event.preventDefault();
      if (confirming) return;
      confirming = true;
      void import_electron8.dialog.showMessageBox(win, { type: "question", title: "\u7ED3\u675F\u6E38\u620F\uFF1F", message: "\u9000\u51FA Naruto OS\uFF1F", detail: "\u6240\u6709\u6E38\u620F\u4F1A\u8BDD\u90FD\u4F1A\u7ED3\u675F\u3002\u4E0B\u6B21\u542F\u52A8\u663E\u793A\u4E3B\u9875\u9762\uFF0C\u6E38\u620F\u9700\u91CD\u65B0\u6253\u5F00\u3002", buttons: ["\u7EE7\u7EED\u6E38\u620F", "\u9000\u51FA"], defaultId: 0, cancelId: 0, noLink: true }).then((result) => {
        confirming = false;
        if (result.response === 1) {
          quitApproved = true;
          win.close();
        }
      });
      return;
    }
    if (!sessionsSaved) {
      event.preventDefault();
      if (savingSessions) return;
      savingSessions = true;
      saveLayout();
      shuttingDown = true;
      pending.clear();
      candidates.clear();
      games.destroy();
      void webLogin.close().then(() => loginSessions.flush()).catch(async () => {
        await import_electron8.dialog.showMessageBox(win, { type: "warning", message: "\u767B\u5F55\u72B6\u6001\u672A\u80FD\u4FDD\u5B58", detail: "\u4E0B\u6B21\u6253\u5F00\u6E38\u620F\u53EF\u80FD\u9700\u8981\u91CD\u65B0\u767B\u5F55\u3002", buttons: ["\u5173\u95ED"], noLink: true });
      }).finally(() => {
        sessionsSaved = true;
        win.close();
      });
    }
  });
  await win.loadURL(shellURL);
  navigation.selectHome();
  if (restoreMaximized) win.maximize();
  if (process.env.NARUTO_TEST_HIDDEN !== "1") win.show();
  if (restoreFullscreen) win.setFullScreen(true);
  broadcast();
  void discoverProfiles();
  if (!flash.available) report(import_electron8.app.isPackaged ? "Flash \u7EC4\u4EF6\u7F3A\u5931\uFF0C\u8BF7\u91CD\u65B0\u83B7\u53D6\u5B8C\u6574\u5E94\u7528" : "Flash \u7EC4\u4EF6\u5C1A\u672A\u51C6\u5907\uFF0C\u8BF7\u8FD0\u884C\u5F00\u53D1\u73AF\u5883\u51C6\u5907\u811A\u672C");
  games.lifecycle.on("changed", (context) => {
    if (context.state === "failed" || context.state === "crashed") log("GAME_" + context.state.toUpperCase());
  });
  if (windowsSmoke) {
    const { runWindowsSmoke: runWindowsSmoke2 } = await Promise.resolve().then(() => (init_windows_smoke(), windows_smoke_exports));
    void runWindowsSmoke2(win, root, shellURL, { results: [], output: import_path10.default.join(process.env.NARUTO_DATA_DIR, "windows-smoke.json") });
  } else if (process.env.NARUTO_TEST_MODE === "1" && process.env.NARUTO_TEST_MANUAL_PREVIEW !== "1") {
    const { runIntegration: runIntegration2 } = await Promise.resolve().then(() => (init_integration(), integration_exports));
    void runIntegration2(win, games, vault, root, (code) => {
      if (code) log("INTEGRATION_FAILED");
      process.exitCode = code;
      if (process.env.NARUTO_TEST_MANUAL_ACCEPTANCE !== "1") {
        quitApproved = true;
        win.close();
      }
    }, webLogin);
  }
}
if (!import_electron8.app.requestSingleInstanceLock()) import_electron8.app.quit();
else {
  import_electron8.app.on("second-instance", () => {
    if (win && !win.isDestroyed()) {
      if (win.isMinimized()) win.restore();
      win.show();
      win.focus();
    }
  });
  import_electron8.app.whenReady().then(createWindow).catch(() => {
    log("STARTUP_FAILED");
    import_electron8.dialog.showErrorBox("Naruto OS \u542F\u52A8\u5931\u8D25", import_electron8.app.isPackaged ? "\u8BF7\u91CD\u65B0\u6253\u5F00\u5E94\u7528\uFF0C\u9519\u8BEF\u8BB0\u5F55\u4FDD\u5B58\u5728\u5E94\u7528\u6570\u636E\u76EE\u5F55\u4E2D\u3002" : "\u8BF7\u68C0\u67E5\u5F00\u53D1\u6784\u5EFA\u4E0E\u8FD0\u884C\u7EC4\u4EF6\uFF0C\u9519\u8BEF\u8BB0\u5F55\u4FDD\u5B58\u5728\u72EC\u7ACB\u6570\u636E\u76EE\u5F55\u4E2D\u3002");
    import_electron8.app.exit(1);
  });
  import_electron8.app.on("window-all-closed", () => import_electron8.app.quit());
}
setInterval(() => {
  for (const [id, item] of pending) if (item.expires < Date.now()) {
    pending.delete(id);
    broadcast();
  }
}, 15e3).unref();
//# sourceMappingURL=index.js.map
