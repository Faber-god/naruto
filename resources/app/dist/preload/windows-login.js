"use strict";

// src/preload/windows-login.ts
var import_electron = require("electron");

// src/preload/login-credentials.ts
var STYLE = `:host{color-scheme:light dark}*{box-sizing:border-box}
.box{font:13px "Segoe UI","Microsoft YaHei",sans-serif;background:#fafafa;color:#292929;border:1px solid #e4e4e4;border-radius:10px;box-shadow:0 8px 28px #00000020;padding:7px;max-height:210px;overflow:auto}
.caption{font-size:10px;color:#747474;padding:6px 8px 8px}
button{font:inherit;width:100%;display:flex;align-items:center;gap:10px;border:0;background:transparent;text-align:left;color:inherit;padding:10px 8px;border-radius:5px;cursor:pointer}
button:hover,button:focus-visible{background:#ededed;outline:2px solid #747474}
.avatar{background:#e2e2e2;border-radius:5px;width:27px;height:27px;display:grid;place-items:center}
.note{font-size:11px;color:#747474;padding:7px 8px}
.name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
@media(prefers-color-scheme:dark){.box{background:#202020;color:#e5e5e5;border-color:#383838}.caption,.note{color:#aaa}button:hover,button:focus-visible{background:#303030}.avatar{background:#3c3c3c}}`;
function installLoginCredentialPicker(choose, allowed) {
  var _a3;
  let host = null;
  let panel = null;
  let promptHost = null;
  let lastSubmission = "";
  let request = 0;
  let suppress = false;
  const dismiss = () => {
    host == null ? void 0 : host.remove();
    host = null;
    panel = null;
    request++;
  };
  const visible = (element) => {
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  };
  const pairFor = (doc) => {
    var _a4, _b;
    const passwords = Array.from(doc.querySelectorAll('input[type="password"]')).filter((input) => visible(input) && input.autocomplete !== "new-password");
    for (const password of passwords) {
      const scope = (_a4 = password.form) != null ? _a4 : doc;
      const texts = Array.from(scope.querySelectorAll('input[type="text"],input[type="email"],input:not([type])')).filter((input) => visible(input) && input.autocomplete !== "new-password");
      const username = (_b = texts.filter((input) => input.compareDocumentPosition(password) & Node.DOCUMENT_POSITION_FOLLOWING).pop()) != null ? _b : texts[0];
      if (username) return { username, password };
    }
    return null;
  };
  const setValue = (input, value) => {
    var _a4, _b;
    const view = input.ownerDocument.defaultView;
    (_b = (_a4 = Object.getOwnPropertyDescriptor(view.HTMLInputElement.prototype, "value")) == null ? void 0 : _a4.set) == null ? void 0 : _b.call(input, value);
    input.dispatchEvent(new view.Event("input", { bubbles: true }));
    input.dispatchEvent(new view.Event("change", { bubbles: true }));
  };
  const place = (anchor) => {
    if (!host) return;
    const rect = anchor.getBoundingClientRect();
    const width = Math.min(Math.max(260, rect.width), window.innerWidth - 24);
    host.style.left = `${Math.max(12, Math.min(rect.left, window.innerWidth - width - 12))}px`;
    host.style.top = `${Math.min(rect.top + rect.height + 6, window.innerHeight - 210)}px`;
    host.style.width = `${width}px`;
  };
  const show = async (pair) => {
    const sequence = ++request;
    const records = await choose(
      "naruto-login-candidates",
      { origin: location.origin, query: pair.username.value }
    ).catch(() => []);
    if (sequence !== request || !pair.username.isConnected || !pair.password.isConnected) return;
    host == null ? void 0 : host.remove();
    host = document.createElement("div");
    host.style.cssText = "all:initial;position:fixed;z-index:2147483647;";
    panel = host.attachShadow({ mode: "closed" });
    const style = document.createElement("style");
    style.textContent = STYLE;
    const box = document.createElement("div");
    box.className = "box";
    box.setAttribute("role", "listbox");
    box.setAttribute("aria-label", "\u5DF2\u4FDD\u5B58\u7684\u8D26\u53F7");
    const caption = document.createElement("div");
    caption.className = "caption";
    caption.textContent = "NARUTO OS \xB7 \u5DF2\u4FDD\u5B58\u7684\u8D26\u53F7";
    box.append(caption);
    for (const record of records.slice(0, 20)) {
      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("role", "option");
      const avatar = document.createElement("span");
      avatar.className = "avatar";
      avatar.textContent = record.username.slice(0, 1).toLocaleUpperCase();
      const name = document.createElement("span");
      name.className = "name";
      name.textContent = record.username;
      button.append(avatar, name);
      button.addEventListener("mousedown", (event) => event.preventDefault());
      button.addEventListener("click", async (event) => {
        if (!event.isTrusted) return;
        const selected = await choose("naruto-login-choose", { origin: location.origin, id: record.id }).catch(() => null);
        if (!selected || !pair.username.isConnected || !pair.password.isConnected) {
          dismiss();
          return;
        }
        setValue(pair.username, selected.username);
        setValue(pair.password, selected.password);
        dismiss();
        suppress = true;
        pair.password.focus();
        suppress = false;
      });
      box.append(button);
    }
    const note = document.createElement("div");
    note.className = "note";
    note.textContent = records.length ? "\u9009\u62E9\u540E\u586B\u5145\uFF0C\u4E0D\u4F1A\u81EA\u52A8\u767B\u5F55" : "\u6CA1\u6709\u5339\u914D\u7684\u5DF2\u4FDD\u5B58\u8D26\u53F7";
    box.append(note);
    panel.append(style, box);
    document.documentElement.append(host);
    place(pair.username);
  };
  document.addEventListener("focusin", (event) => {
    if (suppress || !allowed()) return;
    if (!(event.target instanceof HTMLInputElement)) {
      dismiss();
      return;
    }
    const pair = pairFor(document);
    if (pair && (event.target === pair.username || event.target === pair.password)) void show(pair);
    else dismiss();
  }, true);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") dismiss();
  }, true);
  document.addEventListener("click", (event) => {
    if (!host || event.composedPath().includes(host)) return;
    const active = pairFor(document);
    if (active && (event.target === active.username || event.target === active.password)) return;
    dismiss();
  }, true);
  (_a3 = globalThis.addEventListener) == null ? void 0 : _a3.call(globalThis, "resize", () => {
    if (!host) return;
    const active = pairFor(document);
    if (active) place(active.username);
  });
  const dismissPrompt = () => {
    promptHost == null ? void 0 : promptHost.remove();
    promptHost = null;
  };
  const showPrompt = (record, update) => {
    var _a4, _b;
    dismissPrompt();
    const anchor = (_b = document.querySelector(".login_btn")) != null ? _b : (_a4 = pairFor(document)) == null ? void 0 : _a4.password;
    if (!anchor) return;
    promptHost = document.createElement("div");
    promptHost.style.cssText = "all:initial;position:fixed;z-index:2147483647;";
    const root = promptHost.attachShadow({ mode: "closed" });
    const style = document.createElement("style");
    style.textContent = ':host{color-scheme:light dark}*{box-sizing:border-box}.box{font:13px "Segoe UI","Microsoft YaHei",sans-serif;background:#fafafa;color:#292929;border:1px solid #e4e4e4;border-radius:10px;box-shadow:0 8px 28px #00000020;padding:12px;width:280px}.text{margin:0 0 10px}.row{display:flex;gap:8px;justify-content:flex-end}button{font:inherit;padding:7px 14px;border-radius:6px;border:1px solid #d0d0d0;background:#fff;cursor:pointer}button.primary{background:#c62828;border-color:#c62828;color:#fff}@media(prefers-color-scheme:dark){.box{background:#202020;color:#e5e5e5;border-color:#383838}button{background:#2c2c2c;border-color:#3c3c3c;color:#e5e5e5}.primary{background:#c62828;border-color:#c62828}}';
    const box = document.createElement("div");
    box.className = "box";
    box.setAttribute("role", "dialog");
    const text = document.createElement("p");
    text.className = "text";
    text.textContent = update ? `\u66F4\u65B0\u5DF2\u4FDD\u5B58\u7684\u8D26\u53F7 ${record.username}\uFF1F` : `\u4FDD\u5B58\u8D26\u53F7 ${record.username}\uFF1F`;
    const row = document.createElement("div");
    row.className = "row";
    const later = document.createElement("button");
    later.type = "button";
    later.textContent = "\u4E0D\u4FDD\u5B58";
    later.addEventListener("click", (event) => {
      if (event.isTrusted) dismissPrompt();
    });
    const save = document.createElement("button");
    save.type = "button";
    save.className = "primary";
    save.textContent = update ? "\u66F4\u65B0" : "\u4FDD\u5B58";
    save.addEventListener("click", async (event) => {
      if (!event.isTrusted) return;
      await choose("naruto-login-save", { origin: record.origin, username: record.username, password: record.password }).catch(() => null);
      dismissPrompt();
    });
    row.append(later, save);
    box.append(text, row);
    root.append(style, box);
    document.documentElement.append(promptHost);
    const rect = anchor.getBoundingClientRect();
    promptHost.style.left = `${Math.max(12, Math.min(rect.left, window.innerWidth - 292))}px`;
    promptHost.style.top = `${Math.min(rect.bottom + 8, window.innerHeight - 120)}px`;
  };
  const remember = async (pair) => {
    if (!allowed()) return;
    const username = pair.username.value.trim(), password = pair.password.value;
    if (!username || !password) return;
    const signature = `${username}\0${password}`;
    if (signature === lastSubmission) return;
    lastSubmission = signature;
    const result = await choose("naruto-login-submit", { origin: location.origin, username, password }).catch(() => null);
    if (result == null ? void 0 : result.needed) showPrompt({ origin: location.origin, username, password }, !!result.update);
  };
  const isLoginControl = (target) => {
    var _a4, _b, _c;
    if (!(target instanceof Element)) return false;
    const control = target.closest('button, input[type="submit"], a, [role="button"], .login_btn, .login-btn');
    if (!control) return false;
    return /log.?in|entrar|acessar|sign.?in|登录/i.test(`${control.textContent} ${(_a4 = control.getAttribute("id")) != null ? _a4 : ""} ${(_b = control.getAttribute("class")) != null ? _b : ""} ${(_c = control.getAttribute("type")) != null ? _c : ""}`);
  };
  document.addEventListener("submit", (event) => {
    if (!event.isTrusted || !allowed()) return;
    const pair = pairFor(document);
    if (pair) void remember(pair);
  }, true);
  document.addEventListener("click", (event) => {
    if (!event.isTrusted || !allowed() || !isLoginControl(event.target)) return;
    const pair = pairFor(document);
    if (pair) void remember(pair);
  }, true);
  document.addEventListener("keydown", (event) => {
    if (!event.isTrusted || !allowed() || event.key !== "Enter") return;
    const pair = pairFor(document);
    if (pair) void remember(pair);
  }, true);
}

// src/compat/brazil-login.ts
function installBrazilLoginCompatibility() {
  if (location.origin !== "https://naruto.narutowebgame.com" || !/^\/pt(?:\/login|\/serverlist)?\/?$/.test(location.pathname)) return;
  const page = window;
  if (page.__narutoBrazilLogin) return;
  page.__narutoBrazilLogin = true;
  const timeout = 15e3;
  let hooked = null;
  let mode = "preparing", message = "", cooldownUntil = 0;
  const readinessStarted = Date.now();
  let attempt = null;
  const form = () => ({
    button: document.querySelector(".login_btn"),
    username: document.querySelector('input[name="oasun"]'),
    password: document.querySelector('input[name="oaspd"]')
  });
  function render() {
    var _a3, _b, _c, _d;
    (_a3 = document.documentElement) == null ? void 0 : _a3.setAttribute("data-naruto-login", mode);
    const { button } = form();
    if (!button) {
      (_b = document.querySelector("[data-naruto-login-message]")) == null ? void 0 : _b.remove();
      return;
    }
    button.setAttribute("aria-busy", String(mode === "busy"));
    button.setAttribute("aria-disabled", String(mode !== "ready" && mode !== "server-error"));
    let note = document.querySelector("[data-naruto-login-message]");
    if (!note) {
      note = document.createElement("p");
      note.setAttribute("data-naruto-login-message", "");
      note.setAttribute("role", "status");
      note.style.cssText = 'all:initial;display:none;clear:both;float:none;position:static;box-sizing:border-box;max-width:100%;font:12px/1.5 -apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif;margin:6px auto;color:inherit;text-align:left;white-space:normal;overflow-wrap:break-word;';
      const box = (_c = button.closest(".login")) != null ? _c : button.closest(".login_cont");
      if (box == null ? void 0 : box.parentElement) {
        note.style.width = `${box.clientWidth}px`;
        box.after(note);
      } else {
        note.style.width = "100%";
        (_d = button.parentElement) == null ? void 0 : _d.append(note);
      }
    }
    const text = mode === "cooldown" ? `\u8BF7\u6C42\u8FC7\u4E8E\u9891\u7E41\uFF0C\u8BF7\u5728 ${Math.max(1, Math.ceil((cooldownUntil - Date.now()) / 1e3))} \u79D2\u540E\u91CD\u8BD5\u3002` : message;
    if (note.textContent !== text) note.textContent = text;
    note.hidden = !text;
    note.style.display = text ? "block" : "none";
  }
  function finish(next, text = "", seconds = 0) {
    const previous = attempt;
    attempt = null;
    if (previous) {
      clearTimeout(previous.watchdog);
      for (const request of previous.requests) if (request.xhr.readyState !== 4) request.xhr.abort("naruto-finished");
    }
    mode = next;
    message = text;
    cooldownUntil = seconds ? Date.now() + seconds * 1e3 : 0;
    render();
  }
  function serverFailure(text) {
    finish("server-error", `${text}\u53EF\u91CD\u65B0\u767B\u5F55\uFF0C\u6216\u7A0D\u540E\u624B\u52A8\u5237\u65B0\u3002`);
  }
  function failed(stage, status, timedOut = false, retryAfter = 30) {
    if (!attempt) return;
    if (stage === "userinfo") {
      serverFailure(timedOut ? "\u767B\u5F55\u72B6\u6001\u8BFB\u53D6\u8D85\u65F6\u3002" : `\u767B\u5F55\u72B6\u6001\u8BFB\u53D6\u5931\u8D25${status >= 400 ? `\uFF08${status}\uFF09` : ""}\u3002`);
    } else if (stage === "servers" || attempt.authenticated) {
      serverFailure(timedOut ? "\u767B\u5F55\u5DF2\u901A\u8FC7\uFF0C\u533A\u670D\u5217\u8868\u52A0\u8F7D\u8D85\u65F6\u3002" : `\u767B\u5F55\u5DF2\u901A\u8FC7\uFF0C\u533A\u670D\u5217\u8868\u52A0\u8F7D\u5931\u8D25${status >= 400 ? `\uFF08${status}\uFF09` : ""}\u3002`);
    } else if (status === 429) finish("cooldown", "", Math.max(1, Math.min(300, retryAfter)));
    else finish("ready", timedOut ? "\u767B\u5F55\u8BF7\u6C42\u8D85\u65F6\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002" : status === 403 ? "\u767B\u5F55\u8BF7\u6C42\u88AB\u62D2\u7EDD\uFF08403\uFF09\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002" : "\u767B\u5F55\u8BF7\u6C42\u672A\u5B8C\u6210\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002");
  }
  function begin(restoring = false) {
    mode = "busy";
    message = restoring ? "\u6B63\u5728\u8BFB\u53D6\u767B\u5F55\u72B6\u6001\u2026" : "\u6B63\u5728\u767B\u5F55\u2026";
    const current = { authenticated: false, restoring, requests: [], watchdog: setTimeout(() => {
      if (attempt === current) failed(current.authenticated ? "servers" : current.restoring ? "userinfo" : "auth", 0, true);
    }, timeout) };
    attempt = current;
    render();
    return current;
  }
  function stageOf(options) {
    try {
      const url = new URL(options.url, location.href);
      const auth = url.searchParams.get("m") === "login" || typeof options.data === "string" && /(?:^|&)m=login(?:&|$)/.test(options.data);
      if (url.origin === "https://passport.oasgames.com" && /^\/(?:index.php)?$/.test(url.pathname) && auth) return "auth";
      if (url.origin === "https://passport.oasgames.com" && /^\/(?:index.php)?$/.test(url.pathname) && (url.searchParams.get("m") === "getLoginUser" || typeof options.data === "string" && /(?:^|&)m=getLoginUser(?:&|$)/.test(options.data))) return "userinfo";
      if (url.origin === "https://odp3.oasgames.com" && url.pathname === "/api/game/get-user-servers") return "servers";
    } catch {
    }
    return null;
  }
  function requestKey(value) {
    var _a3, _b;
    try {
      const url = new URL(value, location.href);
      const callback = (_a3 = url.searchParams.get("callback")) != null ? _a3 : "";
      const cache = (_b = url.searchParams.get("_")) != null ? _b : "";
      return /^[A-Za-z_$][\w$]{0,119}$/.test(callback) && /^\d{1,20}$/.test(cache) ? callback + ":" + cache : "";
    } catch {
      return "";
    }
  }
  function hook(jq) {
    if (hooked === jq) return;
    hooked = jq;
    jq.ajaxPrefilter((options, _original, xhr) => {
      const stage = stageOf(options);
      if (!stage) return;
      if (stage === "userinfo" && !attempt && mode !== "server-error") begin(true);
      if (stage === "userinfo" && !(attempt == null ? void 0 : attempt.restoring)) return;
      if (stage === "auth" && !attempt) {
        if (mode === "ready" || mode === "server-error") begin();
        else {
          xhr.abort("naruto-blocked");
          return;
        }
      }
      const current = attempt;
      if (!current) return;
      if (current.requests.some((request2) => request2.stage === stage)) {
        xhr.abort("naruto-duplicate");
        return;
      }
      const request = { stage, xhr, key: "" };
      current.requests.push(request);
      options.timeout = timeout;
      const success = options.success;
      options.success = function(data, ...args) {
        if (stage === "auth" && (data == null ? void 0 : data.status) !== "ok") return;
        if (typeof success === "function") success.call(this, data, ...args);
      };
      const before = options.beforeSend;
      options.beforeSend = function(active, settings) {
        request.key = requestKey(settings.url);
        return before ? before.call(this, active, settings) : void 0;
      };
      xhr.done((data) => {
        if (attempt !== current) return;
        if (stage === "auth" || stage === "userinfo") {
          if ((data == null ? void 0 : data.status) !== "ok") {
            finish("ready", stage === "userinfo" ? "\u767B\u5F55\u72B6\u6001\u5DF2\u5931\u6548\uFF0C\u8BF7\u91CD\u65B0\u767B\u5F55\u3002" : (data == null ? void 0 : data.err_code) === 1 ? "\u8D26\u53F7\u4E0D\u5B58\u5728\uFF0C\u8BF7\u68C0\u67E5\u3002" : (data == null ? void 0 : data.err_code) === 3 ? "\u5BC6\u7801\u4E0D\u6B63\u786E\uFF0C\u8BF7\u91CD\u8BD5\u3002" : "\u767B\u5F55\u672A\u6210\u529F\uFF0C\u8BF7\u68C0\u67E5\u8D26\u53F7\u6216\u7A0D\u540E\u91CD\u8BD5\u3002");
            return;
          }
          current.authenticated = true;
          message = "\u6B63\u5728\u52A0\u8F7D\u533A\u670D\u2026";
          render();
          clearTimeout(current.watchdog);
          current.watchdog = setTimeout(() => {
            if (attempt === current) failed("servers", 0, true);
          }, timeout);
        } else {
          setTimeout(() => {
            if (attempt !== current) return;
            if (form().password) serverFailure("\u767B\u5F55\u5DF2\u901A\u8FC7\uFF0C\u533A\u670D\u9875\u9762\u672A\u80FD\u66F4\u65B0\u3002");
            else finish("ready");
          }, 0);
        }
      });
      xhr.fail((_xhr, reason) => {
        if (attempt === current) failed(stage, xhr.status || 0, reason === "timeout");
      });
    });
  }
  function tick() {
    const jq = page.jQuery;
    if (jq == null ? void 0 : jq.ajaxPrefilter) hook(jq);
    if ((attempt == null ? void 0 : attempt.restoring) && !form().password && document.querySelector(".login_aft")) {
      finish("ready");
      return;
    }
    if (mode === "cooldown" && Date.now() >= cooldownUntil) {
      mode = "ready";
      message = "";
    }
    if (!attempt && mode !== "cooldown" && mode !== "server-error") {
      const ready = hooked === jq && !!(jq == null ? void 0 : jq.ajaxPrefilter) && typeof page.ajax_login === "function" && typeof page.GameCode === "string";
      mode = ready ? "ready" : "preparing";
      if (mode === "preparing") message = Date.now() - readinessStarted >= timeout ? "\u767B\u5F55\u7EC4\u4EF6\u672A\u80FD\u52A0\u8F7D\uFF0C\u8BF7\u5237\u65B0\u9875\u9762\u91CD\u8BD5\u3002" : "\u6B63\u5728\u51C6\u5907\u767B\u5F55\u2026";
      else if (/^(正在准备登录|登录组件未能加载)/.test(message)) message = "";
    }
    render();
  }
  function submit() {
    tick();
    if (mode !== "ready" && mode !== "server-error") return;
    const fields = form();
    if (!fields.username || !fields.password) return;
    if (!fields.username.value.trim()) {
      message = "\u8BF7\u8F93\u5165\u8D26\u53F7\u3002";
      render();
      fields.username.focus();
      return;
    }
    if (!fields.password.value) {
      message = "\u8BF7\u8F93\u5165\u5BC6\u7801\u3002";
      render();
      fields.password.focus();
      return;
    }
    const current = begin();
    try {
      page.ajax_login();
    } catch {
      if (attempt === current) failed("auth", 0);
    }
  }
  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element) || !event.target.closest(".login_btn")) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    submit();
  }, true);
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || !(event.target instanceof Element) || !event.target.matches('input[name="oasun"],input[name="oaspd"]')) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    submit();
  }, true);
  window.addEventListener("naruto:login-network-error", (event) => {
    const detail = event.detail;
    if (!attempt || !detail || !["auth", "userinfo", "servers"].includes(detail.stage) || ![403, 429, 500, 502, 503, 504].includes(detail.status)) return;
    const key = detail.callback + ":" + detail.cache;
    if (attempt.requests.some((request) => request.stage === detail.stage && request.key && request.key === key)) failed(detail.stage, detail.status, false, detail.retryAfter);
  });
  tick();
  const interval = setInterval(tick, 250);
  window.addEventListener("pagehide", () => {
    clearInterval(interval);
    if (attempt) clearTimeout(attempt.watchdog);
    attempt = null;
  }, { once: true });
}

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

// src/preload/windows-login.ts
var _a;
var nonce = (_a = process.argv.find((value) => value.startsWith("--naruto-login-nonce="))) == null ? void 0 : _a.slice("--naruto-login-nonce=".length);
var wrapperPath = /^\/pt(?:\/login|\/serverlist\/s\d{1,6})?\/?$/;
var gameHost = /^(?:s\d+-naruto(?:pt|br)?|naruto-(?:pt|br)(?:-s?\d+)?)\.oasgames\.com$/;
var targetsGame = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.port && !url.username && !url.password && gameHost.test(url.hostname);
  } catch {
    return false;
  }
};
var targetsFixtureGame = (value) => {
  if (!fixtureOrigin) return false;
  try {
    const url = new URL(value);
    return url.origin === fixtureOrigin && url.pathname === "/game";
  } catch {
    return false;
  }
};
var _a2;
var fixtureOrigin = (_a2 = process.argv.find((value) => value.startsWith("--naruto-login-fixture="))) == null ? void 0 : _a2.slice("--naruto-login-fixture=".length);
var wrapperPage = (value) => {
  try {
    const url = new URL(value);
    if (url.username || url.password || !wrapperPath.test(url.pathname)) return false;
    return fixtureOrigin ? url.origin === fixtureOrigin : isBrazilWrapperPage(value);
  } catch {
    return false;
  }
};
if (nonce && process.isMainFrame) {
  installLoginCredentialPicker(
    async (channel, data) => {
      const response = await import_electron.ipcRenderer.invoke(channel, data);
      if (!(response == null ? void 0 : response.ok)) throw new Error("unavailable");
      return response.value;
    },
    () => fixtureOrigin ? location.origin === fixtureOrigin : isBrazilLoginPage(location.href)
  );
  if (!fixtureOrigin && isBrazilLoginPage(location.href)) {
    const install = () => {
      void import_electron.webFrame.executeJavaScript(`(${installBrazilLoginCompatibility.toString()})()`).catch(() => {
      });
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install);
    else install();
  }
  document.addEventListener("click", (event) => {
    if (!event.isTrusted || !(event.target instanceof Element)) return;
    const anchor = event.target.closest("a[href]");
    if (!anchor || anchor.target && anchor.target !== "_self" && anchor.target !== "_top" && anchor.target !== "_blank") return;
    if (anchor.hasAttribute("download") || anchor.target === "_blank" && !wrapperPage(location.href) || !(targetsGame(anchor.href) || targetsFixtureGame(anchor.href))) return;
    event.preventDefault();
    import_electron.ipcRenderer.send("naruto-login-handoff", nonce, location.href, anchor.href, anchor.target || "_self");
  }, true);
}
//# sourceMappingURL=windows-login.js.map
