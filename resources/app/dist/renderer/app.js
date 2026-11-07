"use strict";
(() => {
  // src/renderer/icons.ts
  var nativeIcons = { "refresh": '<svg class="native-symbol" viewBox="0 0 24 24" aria-hidden="true"><defs><mask id="sf-refresh"><image href="data:image/png;base64,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" x="0" y="0" width="24" height="24"/></mask></defs><rect width="24" height="24" fill="currentColor" stroke="none" mask="url(#sf-refresh)"/></svg>', "volume": '<svg class="native-symbol" viewBox="0 0 24 24" aria-hidden="true"><defs><mask id="sf-volume"><image href="data:image/png;base64,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" x="0" y="0" width="24" height="24"/></mask></defs><rect width="24" height="24" fill="currentColor" stroke="none" mask="url(#sf-volume)"/></svg>', "muted": '<svg class="native-symbol" viewBox="0 0 24 24" aria-hidden="true"><defs><mask id="sf-muted"><image href="data:image/png;base64,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" x="0" y="0" width="24" height="24"/></mask></defs><rect width="24" height="24" fill="currentColor" stroke="none" mask="url(#sf-muted)"/></svg>', "settings": '<svg class="native-symbol" viewBox="0 0 24 24" aria-hidden="true"><defs><mask id="sf-settings"><image href="data:image/png;base64,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" x="0" y="0" width="24" height="24"/></mask></defs><rect width="24" height="24" fill="currentColor" stroke="none" mask="url(#sf-settings)"/></svg>' };
  var paths = { plus: '<path d="M12 5v14M5 12h14"/>', close: '<path d="m6 6 12 12M6 18 18 6"/>', recover: '<path d="M15 4h5v16h-5M10 17l5-5-5-5M15 12H4"/>' };
  function svg(name) {
    if (name in nativeIcons) return nativeIcons[name];
    return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name]}</svg>`;
  }

  // src/renderer/focus.ts
  var keyboardModifiers = /* @__PURE__ */ new Set(["Alt", "Control", "Meta", "Shift", "AltGraph"]);
  var textInputTypes = /* @__PURE__ */ new Set(["text", "search", "url", "tel", "email", "password", "number"]);
  function isTextEditor(target) {
    if (!(target instanceof Element)) return false;
    const editor = target.closest('input, textarea, [contenteditable="true"]');
    if (!editor) return false;
    if (editor instanceof HTMLInputElement) return textInputTypes.has(editor.type);
    return editor instanceof HTMLTextAreaElement || editor.isContentEditable;
  }
  function installFocusModality() {
    const root = document.documentElement;
    root.dataset.inputModality = "pointer";
    document.addEventListener("pointerdown", () => {
      root.dataset.inputModality = "pointer";
    }, true);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Tab") {
        root.dataset.inputModality = "keyboard";
        return;
      }
      if (!keyboardModifiers.has(event.key) && !isTextEditor(event.target)) root.dataset.inputModality = "keyboard";
    }, true);
  }

  // src/shared/model.ts
  var ENTRY_URL = "https://naruto.narutowebgame.com/pt/";
  var REGIONS = {
    br: { label: "\u5DF4\u897F\u670D", url: ENTRY_URL },
    cn: { label: "\u56FD\u670D", url: "https://huoying.qq.com/server/website/" }
  };
  var CHROME_HEIGHT = 42;
  var SAVE_PROMPT_HEIGHT = 44;

  // src/renderer/lobby.ts
  var LOBBY_PRESETS = [
    { name: "\u7EB8\u767D", color: "#fdfcfa" },
    { name: "\u5BA3\u7EB8", color: "#f3ede2" },
    { name: "\u96FE\u7070", color: "#e8e8ea" },
    { name: "\u6A31\u7C89", color: "#f5e3df" },
    { name: "\u62B9\u8336", color: "#e1e7d6" },
    { name: "\u5929\u9752", color: "#dde7ec" },
    { name: "\u82A5\u9EC4", color: "#e8bf55" },
    { name: "\u7070\u84DD", color: "#6f8aa6" },
    { name: "\u591C\u58A8", color: "#161514" },
    { name: "\u85CF\u9752", color: "#19202c" },
    { name: "\u677E\u70DF", color: "#2b2d2a" }
  ];
  var $ = (id) => document.getElementById(id);
  var svgNS = "http://www.w3.org/2000/svg";
  function darkTheme(state) {
    return state.preferences.theme === "dark" || state.preferences.theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches;
  }
  function defaultBackground(state) {
    return darkTheme(state) ? "#161514" : "#fdfcfa";
  }
  function hexToHsl(hex) {
    const value = parseInt(hex.slice(1), 16), r = (value >> 16 & 255) / 255, g = (value >> 8 & 255) / 255, b = (value & 255) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min;
    const s = d ? d / (1 - Math.abs(2 * l - 1)) : 0;
    const h = d ? ((max === r ? (g - b) / d % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4) * 60 + 360) % 360 : 0;
    const linear = (channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    return { h, s: s * 100, l: l * 100, y: 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b) };
  }
  function avatarColors(name, dark) {
    let hue = 0;
    for (const character of name) hue = (hue * 31 + character.codePointAt(0)) % 360;
    return dark ? [`hsl(${hue},28%,30%)`, `hsl(${hue},45%,88%)`] : [`hsl(${hue},32%,88%)`, `hsl(${hue},35%,28%)`];
  }
  function profileNotes(profile) {
    const notes = [];
    if (profile.identityNeedsConfirmation) notes.push("\u767B\u5F55\u8EAB\u4EFD\u5F85\u81EA\u884C\u786E\u8BA4");
    if (profile.serverNote) notes.push(`\u5E38\u7528\u533A\u670D\uFF1A${profile.serverNote}`);
    if (profile.recovery && profile.recovery.enabled) {
      const mapped = profile.recovery.officialAccount || "\u81EA\u52A8\u5339\u914D";
      notes.push(`BR \u4F1A\u8BDD\uFF1AS${profile.recovery.serverId} \xB7 ${mapped}`);
    }
    return notes;
  }
  var LobbyView = class {
    constructor(send) {
      this.send = send;
      this.visible = false;
      this.deckOpen = false;
      this.renderedRegion = null;
      this.renderedProfileId = "";
      this.renderedProfileSignature = "";
      this.renderedDeckSignature = "";
      this.renderedBackground = "";
      this.activeIndex = 0;
      this.artGeneration = 0;
      this.artFrame = 0;
      this.profileFrame = 0;
      this.profileGeneration = 0;
      this.resizeFrame = 0;
      this.requestedRegion = null;
      this.startPending = false;
      this.ink = { color: "#302a24", alpha: 0.28 };
      this.reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
      this.root = $("lobby");
      this.art = $("lobby-character");
      this.deck = $("profile-deck");
      this.current = $("lobby-current");
      this.regionButton = $("lobby-region");
      this.startButton = $("open-game");
      this.dots = $("lobby-dots");
      this.lines = $("lobby-lines");
      this.focusPoint = { x: 0.68, y: 0.24 };
      this.lineSeed = 7;
      this.artImage = null;
      this.current.addEventListener("click", () => this.deckOpen ? this.closeDeck() : this.openDeck());
      this.regionButton.addEventListener("click", () => this.toggleRegion());
      this.startButton.addEventListener("click", () => void this.start());
      this.startButton.addEventListener("pointerenter", () => {
        if (this.root.dataset.motion !== "off") this.root.classList.add("charge");
      });
      this.startButton.addEventListener("pointerleave", () => this.root.classList.remove("charge"));
      this.startButton.addEventListener("pointermove", (event) => {
        const rect = this.startButton.getBoundingClientRect();
        this.startButton.style.setProperty("--mouse-x", `${event.clientX - rect.left}px`);
      });
      this.startButton.addEventListener("focus", () => {
        if (document.documentElement.dataset.inputModality === "keyboard" && this.root.dataset.motion !== "off") this.root.classList.add("charge");
      });
      this.startButton.addEventListener("blur", () => this.root.classList.remove("charge"));
      this.deck.addEventListener("keydown", (event) => this.onDeckKeydown(event));
      this.deck.addEventListener("click", (event) => {
        var _a;
        const option = event.target.closest(".lobby-option");
        const profile = (option == null ? void 0 : option.dataset.id) ? (_a = this.state) == null ? void 0 : _a.profiles.find((item) => item.id === option.dataset.id) : void 0;
        if (profile && !profile.cleanupStatus) void this.chooseProfile(profile);
      });
      document.addEventListener("pointerdown", (event) => {
        if (this.deckOpen && !this.root.contains(event.target)) this.closeDeck();
        else if (this.deckOpen && !event.target.closest("#profile-deck,#lobby-current")) this.closeDeck();
      });
      this.reduceMotion.addEventListener("change", () => {
        if (this.state) this.applyMotion(this.state);
      });
      window.addEventListener("resize", () => {
        if (!this.visible || this.resizeFrame) return;
        this.resizeFrame = requestAnimationFrame(() => {
          this.resizeFrame = 0;
          this.drawScene();
        });
      });
    }
    render(state) {
      this.state = state;
      const shouldShow = !state.activeId && !state.settingsOpen;
      if (!shouldShow) {
        this.hide();
        this.renderedProfileSignature = "";
        return;
      }
      const wasVisible = this.visible;
      this.visible = true;
      if (!wasVisible) this.root.classList.remove("leaving", "charge");
      const region = state.preferences.region;
      if (this.requestedRegion === region) this.requestedRegion = null;
      if (this.renderedRegion !== region || !this.artImage) {
        if (this.artImage) this.art.classList.add("is-swapping");
        this.renderedRegion = region;
        this.closeDeck(false);
        $("lobby-region-label").textContent = REGIONS[region].label;
        this.regionButton.setAttribute("aria-label", `\u5F53\u524D${REGIONS[region].label}\uFF0C\u70B9\u51FB\u5207\u6362\u5730\u533A`);
        this.loadArtwork(region);
      }
      this.applyBackground(this.previewColor !== void 0 ? this.previewColor ?? defaultBackground(state) : state.preferences.lobbyBackground ?? defaultBackground(state));
      this.applyMotion(state);
      this.renderProfiles(state);
      if (this.deckOpen) this.renderDeck(state);
      if (!wasVisible) this.scheduleDraw();
    }
    refreshTheme() {
      if (this.state && this.visible) this.render(this.state);
    }
    backgroundFor(state) {
      return state.preferences.lobbyBackground ?? defaultBackground(state);
    }
    previewBackground(value) {
      this.previewColor = value;
      if (this.state && this.visible) this.applyBackground(value ?? defaultBackground(this.state));
    }
    clearBackgroundPreview() {
      this.previewColor = void 0;
      if (this.state && this.visible) this.applyBackground(this.backgroundFor(this.state));
    }
    hide() {
      if (!this.visible) return;
      this.visible = false;
      this.closeDeck(false);
      this.startPending = false;
      this.root.classList.remove("leaving", "charge");
      this.artGeneration++;
      if (this.artFrame) cancelAnimationFrame(this.artFrame);
      if (this.profileFrame) cancelAnimationFrame(this.profileFrame);
      if (this.resizeFrame) cancelAnimationFrame(this.resizeFrame);
      this.artFrame = this.profileFrame = this.resizeFrame = 0;
    }
    applyMotion(state) {
      const enabled = state.preferences.lobbyMotion && !this.reduceMotion.matches;
      this.root.dataset.motion = enabled ? "on" : "off";
      if (!enabled) this.root.classList.remove("charge", "leaving");
    }
    applyBackground(hex) {
      if (this.renderedBackground === hex) return;
      this.renderedBackground = hex;
      const { h, s, l, y } = hexToHsl(hex), isDark = y < 0.28;
      this.root.dataset.tone = isDark ? "dark" : "light";
      this.root.style.setProperty("--bg-top", `hsl(${h},${s}%,${Math.min(l + (isDark ? 2.5 : 1.2), 99.5)}%)`);
      this.root.style.setProperty("--bg-bottom", `hsl(${h},${s}%,${Math.max(l - (isDark ? 1.5 : 2.5), 0)}%)`);
      this.ink = isDark ? { color: `hsl(${h},${Math.min(s, 25)}%,88%)`, alpha: 0.14 + y * 1.2 } : { color: `hsl(${h},${Math.min(s * 0.7, 50)}%,${Math.max(l * 0.22, 6)}%)`, alpha: 0.2 + (1 - y) * 0.32 };
      this.scheduleDraw();
      if (this.state) this.paintCurrent(this.state, false);
    }
    renderProfiles(state) {
      const regionProfiles = state.profiles.filter((profile) => profile.region === state.preferences.region);
      const selectable = regionProfiles.filter((profile) => !profile.cleanupStatus);
      const selected = selectable.find((profile) => profile.id === state.selectedProfileId);
      const signature = JSON.stringify([
        state.profiles,
        state.profileDiscovery,
        state.profileError,
        state.canCreateProfile,
        state.preferences.region,
        state.selectedProfileId
      ]);
      if (signature !== this.renderedProfileSignature) {
        const previousId = this.renderedProfileId;
        this.renderedProfileSignature = signature;
        this.renderedProfileId = (selected == null ? void 0 : selected.id) ?? "";
        this.paintCurrent(state, previousId !== "" && previousId !== this.renderedProfileId);
        if (this.deckOpen) this.renderedDeckSignature = "";
      }
      this.current.disabled = state.profileDiscovery !== "ready" || !regionProfiles.length;
      this.current.setAttribute("aria-expanded", String(this.deckOpen));
      this.current.setAttribute("aria-label", selected ? `\u5F53\u524D\u8D26\u53F7${selected.name}${selected.serverNote ? `\uFF0C\u5E38\u7528\u533A\u670D\uFF1A${selected.serverNote}` : ""}\uFF0C\u70B9\u51FB\u5207\u6362\u8D26\u53F7` : state.profileDiscovery === "failed" ? "\u767B\u5F55\u6863\u6848\u8BFB\u53D6\u5931\u8D25" : !regionProfiles.length ? "\u6682\u65E0\u8D26\u53F7\u6863\u6848" : "\u8D26\u53F7\u6863\u6848\u6B63\u5728\u6E05\u7406");
      this.startButton.disabled = state.profileDiscovery !== "ready" || !selected || this.startPending;
      this.startButton.setAttribute("aria-label", `\u5F00\u59CB\u6E38\u620F\uFF1A${REGIONS[state.preferences.region].label}${selected ? `\uFF0C${selected.name}` : ""}`);
      const status = $("profile-launch-status");
      status.textContent = state.profileDiscovery === "loading" || state.profileDiscovery === "idle" ? "\u6B63\u5728\u8BFB\u53D6\u672C\u5730\u767B\u5F55\u6863\u6848\u2026" : state.profileDiscovery === "failed" ? state.profileError || "\u8BFB\u53D6\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5" : !regionProfiles.length ? "\u5F53\u524D\u5730\u533A\u8FD8\u6CA1\u6709\u767B\u5F55\u6863\u6848" : !selectable.length ? "\u8BF7\u5148\u5B8C\u6210\u5F85\u6E05\u7406\u6863\u6848\uFF0C\u6216\u65B0\u5EFA\u4E00\u4E2A\u6863\u6848" : "";
      status.hidden = !status.textContent;
      $("lobby-create-profile").hidden = !state.canCreateProfile || selectable.length > 0;
      $("lobby-create-profile").disabled = !state.canCreateProfile;
      $("lobby-profile-retry").hidden = state.profileDiscovery !== "failed";
    }
    paintCurrent(state, animate) {
      const selected = state.profiles.find((profile) => profile.id === state.selectedProfileId && profile.region === state.preferences.region && !profile.cleanupStatus);
      const name = (selected == null ? void 0 : selected.name) ?? (state.profileDiscovery === "failed" ? "\u8BFB\u53D6\u5931\u8D25" : state.profileDiscovery === "loading" || state.profileDiscovery === "idle" ? "\u6B63\u5728\u8BFB\u53D6\u2026" : "\u6682\u65E0\u8D26\u53F7\u6863\u6848");
      const dark = this.root.dataset.tone === "dark";
      const [background, foreground] = avatarColors(name, dark);
      const avatar = $("lobby-avatar");
      avatar.textContent = selected ? [...name][0] ?? "" : "\xB7";
      avatar.style.setProperty("--avatar-bg", background);
      avatar.style.setProperty("--avatar-ink", foreground);
      $("lobby-account-name").textContent = name;
      const note = selected ? profileNotes(selected).join(" \xB7 ") : "";
      $("profile-choice-note").textContent = note;
      $("profile-choice-note").hidden = !note;
      $("lobby-current").title = selected ? `${name}${note ? ` \xB7 ${note}` : ""}` : name;
      const stack = $("lobby-stack");
      stack.replaceChildren();
      for (let i = 0; i < Math.min(Math.max(0, state.profiles.filter((profile) => profile.region === state.preferences.region).length - 1), 2); i++) {
        stack.append(document.createElement("i"));
      }
      if (animate && this.visible && this.root.dataset.motion !== "off") {
        this.root.classList.add("account-changing");
        const generation = ++this.profileGeneration;
        if (this.profileFrame) cancelAnimationFrame(this.profileFrame);
        this.profileFrame = requestAnimationFrame(() => {
          this.profileFrame = 0;
          if (!this.visible || generation !== this.profileGeneration) return;
          this.profileFrame = requestAnimationFrame(() => {
            this.profileFrame = 0;
            if (generation === this.profileGeneration) this.root.classList.remove("account-changing");
          });
        });
      } else {
        this.profileGeneration++;
        if (this.profileFrame) cancelAnimationFrame(this.profileFrame);
        this.profileFrame = 0;
        this.root.classList.remove("account-changing");
      }
    }
    renderDeck(state) {
      const profiles = state.profiles.filter((profile) => profile.region === state.preferences.region);
      const signature = JSON.stringify([profiles, state.selectedProfileId]);
      if (signature === this.renderedDeckSignature) return;
      this.renderedDeckSignature = signature;
      this.deck.replaceChildren();
      if (!profiles.length) {
        const empty = document.createElement("div");
        empty.className = "lobby-empty";
        empty.textContent = state.profileDiscovery === "failed" ? state.profileError || "\u8BFB\u53D6\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5" : "\u5F53\u524D\u5730\u533A\u8FD8\u6CA1\u6709\u767B\u5F55\u6863\u6848";
        this.deck.append(empty);
        this.deck.removeAttribute("aria-activedescendant");
        return;
      }
      const preferred = profiles.findIndex((profile) => profile.id === state.selectedProfileId && !profile.cleanupStatus);
      this.activeIndex = preferred >= 0 ? preferred : profiles.findIndex((profile) => !profile.cleanupStatus);
      if (this.activeIndex < 0) this.activeIndex = 0;
      profiles.forEach((profile, index) => {
        const option = document.createElement("div");
        option.className = "lobby-option";
        option.dataset.id = profile.id;
        option.id = `lobby-option-${profile.id}`;
        option.style.setProperty("--option-delay", `${(profiles.length - 1 - index) * 30}ms`);
        option.setAttribute("role", "option");
        option.setAttribute("aria-selected", String(profile.id === state.selectedProfileId));
        option.setAttribute("aria-disabled", String(!!profile.cleanupStatus));
        option.title = profile.name;
        if (profile.cleanupStatus) option.classList.add("is-disabled");
        const [background, foreground] = avatarColors(profile.name, this.root.dataset.tone === "dark");
        const avatar = document.createElement("span");
        avatar.className = "lobby-avatar";
        avatar.textContent = [...profile.name][0] ?? "";
        avatar.style.setProperty("--avatar-bg", background);
        avatar.style.setProperty("--avatar-ink", foreground);
        const name = document.createElement("b");
        name.textContent = profile.name;
        const detailText = profile.cleanupStatus ? "\u6E05\u7406\u672A\u5B8C\u6210" : profileNotes(profile).join(" \xB7 ");
        const detail = document.createElement("small");
        detail.textContent = detailText;
        const grow = document.createElement("span");
        grow.className = "lobby-grow";
        const tick = document.createElementNS(svgNS, "svg");
        tick.setAttribute("class", "lobby-tick");
        tick.setAttribute("viewBox", "0 0 14 14");
        const path = document.createElementNS(svgNS, "path");
        path.setAttribute("d", "M3 7.4 5.8 10 11 4.4");
        tick.append(path);
        option.append(avatar, name);
        if (detailText) option.append(detail);
        option.append(grow, tick);
        if (index === this.activeIndex) option.classList.add("is-active");
        this.deck.append(option);
      });
      this.updateActiveOption();
    }
    updateActiveOption() {
      const options = Array.from(this.deck.querySelectorAll(".lobby-option"));
      const active = options[this.activeIndex];
      for (let i = 0; i < options.length; i++) options[i].classList.toggle("is-active", i === this.activeIndex);
      if (active) {
        this.deck.setAttribute("aria-activedescendant", active.id);
        active.scrollIntoView({ block: "nearest" });
      } else this.deck.removeAttribute("aria-activedescendant");
    }
    openDeck() {
      if (!this.state || this.current.disabled || !this.visible) return;
      this.deckOpen = true;
      this.renderedDeckSignature = "";
      this.renderDeck(this.state);
      this.deck.hidden = false;
      this.current.setAttribute("aria-expanded", "true");
      this.deck.focus();
    }
    closeDeck(restoreFocus = false) {
      if (!this.deckOpen && this.deck.hidden) return;
      this.deckOpen = false;
      this.deck.hidden = true;
      this.current.setAttribute("aria-expanded", "false");
      this.deck.removeAttribute("aria-activedescendant");
      if (restoreFocus && this.visible && !this.current.hidden && !this.current.disabled) this.current.focus();
    }
    onDeckKeydown(event) {
      var _a;
      if (!this.deckOpen || !this.state) return;
      const options = Array.from(this.deck.querySelectorAll(".lobby-option"));
      const enabled = options.map((option, index) => option.getAttribute("aria-disabled") === "true" ? -1 : index).filter((index) => index >= 0);
      if (event.key === "Escape") {
        event.preventDefault();
        this.closeDeck(true);
        return;
      }
      if (event.key === "Tab") {
        this.closeDeck();
        return;
      }
      if (!enabled.length) return;
      if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Home" || event.key === "End") {
        event.preventDefault();
        if (event.key === "Home") this.activeIndex = enabled[0];
        else if (event.key === "End") this.activeIndex = enabled[enabled.length - 1];
        else {
          const at = enabled.indexOf(this.activeIndex), step = event.key === "ArrowDown" ? 1 : -1;
          this.activeIndex = enabled[(at + step + enabled.length) % enabled.length];
        }
        this.updateActiveOption();
        return;
      }
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        const id = (_a = options[this.activeIndex]) == null ? void 0 : _a.dataset.id;
        const profile = id ? this.state.profiles.find((item) => item.id === id) : void 0;
        if (profile && !profile.cleanupStatus) void this.chooseProfile(profile);
      }
    }
    async chooseProfile(profile) {
      this.closeDeck(true);
      await this.send({ type: "profile-select", id: profile.id });
    }
    toggleRegion() {
      if (!this.state || !this.visible) return;
      const current = this.requestedRegion ?? this.state.preferences.region;
      const region = current === "br" ? "cn" : "br";
      this.requestedRegion = region;
      this.closeDeck();
      void this.send({ type: "region", value: region }).then(() => {
        var _a;
        if (this.requestedRegion === region && ((_a = this.state) == null ? void 0 : _a.preferences.region) === region) this.requestedRegion = null;
      }).catch(() => {
        if (this.requestedRegion === region) this.requestedRegion = null;
      });
    }
    async start() {
      if (this.startPending || !this.state || this.startButton.disabled) return;
      this.startPending = true;
      this.startButton.disabled = true;
      if (this.root.dataset.motion !== "off") this.root.classList.add("leaving", "charge");
      try {
        const accepted = await this.send({ type: "profile-start" });
        if (accepted !== true) this.resetLaunch();
      } catch {
        this.resetLaunch();
      }
    }
    resetLaunch() {
      this.startPending = false;
      this.root.classList.remove("leaving", "charge");
      if (this.state) this.startButton.disabled = this.state.profileDiscovery !== "ready" || !this.state.profiles.some((profile) => {
        var _a, _b;
        return profile.id === ((_a = this.state) == null ? void 0 : _a.selectedProfileId) && profile.region === ((_b = this.state) == null ? void 0 : _b.preferences.region) && !profile.cleanupStatus;
      });
    }
    loadArtwork(region) {
      const generation = ++this.artGeneration;
      if (this.artFrame) cancelAnimationFrame(this.artFrame);
      this.artFrame = 0;
      const extension = region === "br" ? "png" : "webp";
      const artwork = new Image();
      const source = `lobby-art-${region}.${extension}`;
      artwork.onload = () => {
        if (generation === this.artGeneration) this.installArtwork(region, artwork, source, generation);
      };
      artwork.onerror = () => {
        if (generation !== this.artGeneration) return;
        const fallback = new Image();
        fallback.onload = () => {
          if (generation === this.artGeneration) this.installArtwork(region, fallback, `zhiyan-${region}.png`, generation);
        };
        fallback.onerror = () => {
          if (generation === this.artGeneration) this.root.dataset.artworkFailed = "true";
        };
        fallback.src = `zhiyan-${region}.png`;
      };
      artwork.src = source;
    }
    installArtwork(region, image, src, generation) {
      var _a;
      if (generation !== this.artGeneration || !this.visible || ((_a = this.state) == null ? void 0 : _a.preferences.region) !== region) return;
      this.root.removeAttribute("data-artwork-failed");
      this.art.src = src;
      this.artImage = image;
      try {
        this.measureFocus(image);
        this.root.removeAttribute("data-canvas-error");
        this.scheduleDraw();
      } catch {
        this.root.dataset.canvasError = "true";
      }
      if (this.artFrame) cancelAnimationFrame(this.artFrame);
      this.artFrame = requestAnimationFrame(() => {
        this.artFrame = 0;
        if (generation === this.artGeneration && this.visible) this.art.classList.remove("is-swapping");
      });
    }
    measureFocus(image) {
      const canvas = document.createElement("canvas");
      canvas.width = 96;
      canvas.height = 144;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas unavailable");
      context.drawImage(image, 0, 0, 96, 144);
      const data = context.getImageData(0, 0, 96, 144).data;
      let top = 144, bottom = 0;
      for (let y = 0; y < 144; y++) for (let x = 0; x < 96; x++) if (data[(y * 96 + x) * 4 + 3] > 128) {
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
      }
      if (top === 144) throw new Error("Artwork has no visible pixels");
      const limit = top + (bottom - top) * 0.25;
      let sx = 0, sy = 0, count = 0;
      for (let y = top; y < limit; y++) for (let x = 0; x < 96; x++) if (data[(y * 96 + x) * 4 + 3] > 128) {
        sx += x;
        sy += y;
        count++;
      }
      if (count) this.focusPoint = { x: sx / count / 96, y: (sy / count / 144 + limit / 144) / 2 };
    }
    scheduleDraw() {
      if (!this.visible || this.resizeFrame) return;
      this.resizeFrame = requestAnimationFrame(() => {
        this.resizeFrame = 0;
        this.drawScene();
      });
    }
    drawScene() {
      var _a, _b;
      if (!this.visible || !this.artImage || this.root.hidden || this.root.dataset.canvasError === "true") return;
      try {
        const width = this.root.clientWidth, height = this.root.clientHeight, dpr = Math.min(window.devicePixelRatio || 1, 2);
        if (!width || !height) return;
        const rootRect = this.root.getBoundingClientRect(), artRect = this.art.getBoundingClientRect();
        const art = { x: artRect.left - rootRect.left, y: artRect.top - rootRect.top, w: artRect.width, h: artRect.height };
        const fx = art.x + this.focusPoint.x * art.w, fy = art.y + this.focusPoint.y * art.h;
        this.root.style.setProperty("--focus-x", `${fx}px`);
        this.root.style.setProperty("--focus-y", `${fy}px`);
        const prepare = (canvas) => {
          canvas.width = Math.max(1, Math.round(width * dpr));
          canvas.height = Math.max(1, Math.round(height * dpr));
          const context = canvas.getContext("2d");
          if (!context) throw new Error("Canvas unavailable");
          context.setTransform(dpr, 0, 0, dpr, 0, 0);
          context.clearRect(0, 0, width, height);
          return context;
        };
        const dots = prepare(this.dots), cell = 6.5, k = cell / Math.SQRT2;
        const right = art.x + art.w / 2 > width / 2, cx = right ? width * 1.02 : -width * 0.02, cy = height * 1.04;
        const reach = Math.hypot(width, height) * 0.62;
        dots.fillStyle = this.ink.color;
        dots.globalAlpha = Math.min(this.ink.alpha, 0.5);
        dots.beginPath();
        const count = Math.ceil((width + height) / k) + 2;
        for (let i = -count; i <= count; i++) for (let j = 0; j <= count * 2; j++) {
          const x = (i + j) * k - height, y = (j - i) * k;
          if (x < -4 || x > width + 4 || y < -4 || y > height + 4) continue;
          const amount = 1 - Math.hypot(x - cx, y - cy) / reach;
          if (amount <= 0) continue;
          const radius = cell * 0.46 * Math.pow(amount, 1.35);
          if (radius < 0.32) continue;
          dots.moveTo(x + radius, y);
          dots.arc(x, y, radius, 0, Math.PI * 2);
        }
        dots.fill();
        dots.globalAlpha = 1;
        const lines = prepare(this.lines);
        this.lineSeed = 7;
        lines.fillStyle = this.ink.color;
        const lineFactor = this.ink.alpha / 0.22, far = Math.hypot(width, height) * 1.1, base = Math.min(width, height);
        const random = () => (this.lineSeed = this.lineSeed * 16807 % 2147483647) / 2147483647;
        for (let angle = 0; angle < Math.PI * 2; ) {
          angle += (0.6 + random() * 2.6) * Math.PI / 180;
          if (random() < 0.18) angle += random() * 5 * Math.PI / 180;
          const start = base * (0.34 + random() * 0.3), lineWidth = 0.5 + random() * 1.6, alpha = 0.03 + random() * 0.045;
          const cos = Math.cos(angle), sin = Math.sin(angle), px = -sin, py = cos, halfEnd = lineWidth * 1.7;
          lines.globalAlpha = Math.min(alpha * lineFactor, 0.2);
          lines.beginPath();
          lines.moveTo(fx + cos * start, fy + sin * start);
          lines.lineTo(fx + cos * far + px * halfEnd, fy + sin * far + py * halfEnd);
          lines.lineTo(fx + cos * far - px * halfEnd, fy + sin * far - py * halfEnd);
          lines.closePath();
          lines.fill();
        }
        lines.globalAlpha = 1;
        for (const [context, blur] of [[dots, 9], [lines, 14]]) {
          context.save();
          context.globalCompositeOperation = "destination-out";
          context.filter = `blur(${blur}px)`;
          for (let i = 0; i < 3; i++) context.drawImage(this.artImage, art.x, art.y, art.w, art.h);
          context.restore();
        }
      } catch {
        this.root.dataset.canvasError = "true";
        (_a = this.dots.getContext("2d")) == null ? void 0 : _a.clearRect(0, 0, this.dots.width, this.dots.height);
        (_b = this.lines.getContext("2d")) == null ? void 0 : _b.clearRect(0, 0, this.lines.width, this.lines.height);
      }
    }
  };

  // src/shared/appearance.ts
  function validTitleColor(value) {
    return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
  }
  function titlePalette(color) {
    if (!validTitleColor(color)) throw new Error("\u6807\u9898\u680F\u989C\u8272\u65E0\u6548");
    const linear = [1, 3, 5].map((i) => {
      const v = parseInt(color.slice(i, i + 2), 16) / 255;
      return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
    const light = linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722 < 0.179;
    return {
      bg: color,
      fg: light ? "#ffffff" : "#000000",
      secondary: light ? "#ffffff" : "#000000",
      hover: light ? "#ffffff14" : "#00000009",
      selected: light ? "#ffffff25" : "#00000011",
      border: light ? "#ffffff28" : "#00000018"
    };
  }

  // src/renderer/app.ts
  installFocusModality();
  var $2 = (id) => document.getElementById(id);
  var api = window.naruto;
  $2("new-tab").innerHTML = svg("plus");
  $2("refresh").innerHTML = svg("refresh");
  $2("settings").innerHTML = svg("settings");
  var latest;
  var displayedTabs = "";
  var settingsWasOpen = false;
  var toastTimer;
  var lobbyBackgroundTimer;
  var pendingLobbyBackground;
  var lobbyBackgroundRevision = 0;
  var customLobbyColorMode = false;
  var dialogAction = null;
  var dialogSequence = 0;
  var lastFocus = null;
  var profileListSignature = "";
  var profilePickerSignature = "";
  var profilePickerWasOpen = false;
  var secretTimers = /* @__PURE__ */ new Set();
  var credentialLoad = 0;
  var setupWizardOpen = false;
  var setupWizardShown = false;
  var setupWizardStep = 0;
  var setupWizardBusy = false;
  var setupWizardAccounts = [];
  var setupWizardAccountChoice = "__manual__";
  var setupWizardProfileChoice = "__new__";
  var setupWizardProfileSignature = "";
  var setupWizardAccountMessage = "";
  function toast(message) {
    $2("status-text").textContent = message;
    $2("status-text").parentElement.hidden = false;
    if ((latest == null ? void 0 : latest.settingsOpen) || !$2("dialog-backdrop").hidden) {
      $2("toast").textContent = message;
      $2("toast").hidden = false;
    }
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      $2("toast").hidden = true;
      if (latest) render(latest);
    }, 5e3);
  }
  async function command(input) {
    try {
      return await api.command(input);
    } catch (error) {
      toast(error.message);
      return false;
    }
  }
  var lobby = new LobbyView(command);
  function queueLobbyBackground(value, delay = 180) {
    lobbyBackgroundRevision++;
    pendingLobbyBackground = value;
    lobby.previewBackground(value);
    if (lobbyBackgroundTimer) clearTimeout(lobbyBackgroundTimer);
    lobbyBackgroundTimer = setTimeout(() => {
      lobbyBackgroundTimer = void 0;
      void flushLobbyBackground();
    }, delay);
  }
  async function flushLobbyBackground() {
    if (lobbyBackgroundTimer) clearTimeout(lobbyBackgroundTimer);
    lobbyBackgroundTimer = void 0;
    if (pendingLobbyBackground === void 0) return;
    const revision = lobbyBackgroundRevision;
    const value = pendingLobbyBackground;
    pendingLobbyBackground = void 0;
    const result = await command({ type: "lobby-background", value });
    if (revision === lobbyBackgroundRevision) {
      lobby.clearBackgroundPreview();
      if (latest) renderLobbyPreferences(latest);
    }
    return result;
  }
  function scrubSecrets() {
    for (const timer of secretTimers) clearTimeout(timer);
    secretTimers.clear();
    for (const element of Array.from(document.querySelectorAll(".credential-password"))) element.remove();
    $2("edit-password").setAttribute("value", "");
    $2("edit-password").value = "";
  }
  async function editProfile(profile) {
    const create = !profile;
    const region = profile ? profile.region : (latest && latest.preferences ? latest.preferences.region : "br");
    let recoveryAccounts = [];
    let recoveryLoadError = "";
    if (region === "br") {
      try {
        recoveryAccounts = await api.recoveryAccounts(profile ? profile.id : "");
      } catch (error) {
        recoveryLoadError = error && error.message ? error.message : "无法读取官方客户端账号列表";
      }
    }
    let creating = create;
    let targetId = profile ? profile.id : "";
    await openDialog({
      title: create ? "\u65B0\u5EFA\u767B\u5F55\u6863\u6848" : "\u7F16\u8F91\u767B\u5F55\u6863\u6848",
      label: "\u6863\u6848\u540D\u79F0",
      value: (profile == null ? void 0 : profile.name) ?? "",
      serverNote: (profile == null ? void 0 : profile.serverNote) ?? "",
      serverNoteLabel: "\u5E38\u7528\u533A\u670D\u5907\u6CE8\uFF08\u4EC5\u4F9B\u63D0\u9192\uFF09",
      recoveryVisible: region === "br",
      recoveryProfileId: profile ? profile.id : "",
      recoveryAccounts,
      recoveryLoadError,
      recovery: (profile == null ? void 0 : profile.recovery) ?? { enabled: false, serverId: "", officialAccount: "" },
      submit: create ? "\u521B\u5EFA" : "\u4FDD\u5B58",
      action: async (name, _password, serverNote, recovery) => {
        if (creating) {
          const created = await api.command({ type: "profile-create", name, serverNote });
          targetId = created && created.id;
          if (!targetId) throw new Error("账号档案已创建，但未能确认档案编号；请重新打开档案设置");
          creating = false;
        } else {
          await api.command({ type: "profile-update", id: targetId, name, serverNote });
        }
        if (region === "br") {
          await api.command({ type: "profile-recovery-update", id: targetId, recovery });
        }
      }
    });
  }
  function confirmDeleteProfile(profile) {
    void openDialog({
      title: "\u5220\u9664\u767B\u5F55\u6863\u6848",
      label: "",
      hideInput: true,
      description: `\u5C06\u6E05\u9664${REGIONS[profile.region].label}\u300C${profile.name}\u300D\u5728\u672C\u673A\u4FDD\u5B58\u7684 Cookie\u3001\u7F51\u7AD9\u6570\u636E\u548C\u4F1A\u8BDD\u767B\u5F55\u5FEB\u7167\u3002\u4E0D\u4F1A\u6CE8\u9500\u5B98\u7F51\u8D26\u53F7\uFF0C\u5DF2\u4FDD\u5B58\u7684\u5BC6\u7801\u4F1A\u4FDD\u7559\u3002\u6B64\u64CD\u4F5C\u65E0\u6CD5\u64A4\u9500\u3002`,
      submit: "\u5220\u9664\u6863\u6848",
      dangerSubmit: true,
      action: async () => api.command({ type: "profile-delete", id: profile.id })
    });
  }
  function profileNotes2(profile) {
    const notes = [];
    if (profile.identityNeedsConfirmation) notes.push("\u767B\u5F55\u8EAB\u4EFD\u5F85\u81EA\u884C\u786E\u8BA4");
    if (profile.serverNote) notes.push(`\u5E38\u7528\u533A\u670D\uFF1A${profile.serverNote}`);
    if (profile.recovery && profile.recovery.enabled) {
      const mapped = profile.recovery.officialAccount || "\u81EA\u52A8\u5339\u914D";
      notes.push(`BR \u4F1A\u8BDD\uFF1AS${profile.recovery.serverId} \xB7 ${mapped}`);
    }
    return notes;
  }
  function renderProfileControls(state) {
    const regionProfiles = state.profiles.filter((profile) => profile.region === state.preferences.region);
    const signature = JSON.stringify([state.profiles, state.profileDiscovery, state.profileError, state.canCreateProfile]);
    if (signature !== profileListSignature) {
      profileListSignature = signature;
      const list = $2("profile-list");
      list.replaceChildren();
      for (const profile of state.profiles) {
        const row = document.createElement("div");
        row.className = "profile-row";
        row.dataset.id = profile.id;
        const info = document.createElement("div");
        info.className = "profile-info";
        const name = document.createElement("div");
        name.className = "profile-name";
        name.textContent = `${REGIONS[profile.region].label} \xB7 ${profile.name}`;
        const detail = document.createElement("div");
        detail.className = "profile-detail";
        if (profile.cleanupStatus === "deleting") detail.textContent = profile.cleanupStage || "\u6B63\u5728\u6E05\u7406\u2026";
        else if (profile.cleanupStatus === "pending") detail.textContent = "\u6E05\u7406\u672A\u5B8C\u6210 \xB7 \u70B9\u51FB\u91CD\u8BD5\u6E05\u7406";
        else detail.textContent = profileNotes2(profile).join(" \xB7 ") || "\u533A\u670D\u5907\u6CE8\u672A\u8BBE\u7F6E";
        info.append(name, detail);
        const actions = document.createElement("div");
        actions.className = "profile-actions";
        if (profile.cleanupStatus) {
          row.dataset.cleanup = profile.cleanupStatus;
          const retry = document.createElement("button");
          retry.className = "quiet small";
          retry.type = "button";
          retry.textContent = profile.cleanupStatus === "deleting" ? "\u6E05\u7406\u4E2D\u2026" : "\u91CD\u8BD5\u6E05\u7406";
          retry.dataset.action = "retry-delete";
          retry.disabled = profile.cleanupStatus === "deleting" || !!profile.deleteBlockedReason;
          retry.title = profile.deleteBlockedReason || "";
          if (profile.cleanupStatus === "pending") retry.addEventListener("click", () => void command({ type: "profile-delete", id: profile.id }));
          actions.append(retry);
        } else {
          const edit = document.createElement("button");
          edit.className = "quiet small";
          edit.type = "button";
          edit.textContent = "\u7F16\u8F91";
          edit.dataset.action = "edit";
          edit.addEventListener("click", () => editProfile(profile));
          const remove = document.createElement("button");
          remove.className = "quiet small danger";
          remove.type = "button";
          remove.textContent = "\u5220\u9664";
          remove.dataset.action = "delete";
          remove.disabled = !!profile.deleteBlockedReason;
          remove.title = profile.deleteBlockedReason || "";
          remove.addEventListener("click", () => confirmDeleteProfile(profile));
          actions.append(edit, remove);
        }
        row.append(info, actions);
        list.append(row);
      }
      if (!state.profiles.length && state.profileDiscovery === "ready") {
        const empty = document.createElement("div");
        empty.className = "profile-row";
        empty.textContent = "\u8FD8\u6CA1\u6709\u767B\u5F55\u6863\u6848";
        list.append(empty);
      }
    }
    $2("profile-error").textContent = state.profileError;
    $2("profile-error").hidden = !state.profileError;
    $2("profile-retry").hidden = !state.profileError || state.profileDiscovery !== "failed";
    $2("profile-create").disabled = !state.canCreateProfile;
    const picker = $2("profile-picker-backdrop");
    picker.hidden = !state.profilePickerOpen;
    if (state.profilePickerOpen) {
      $2("profile-picker-title").textContent = state.profilePickerIntent === "open" ? "\u6253\u5F00\u8D26\u53F7\u6863\u6848" : "\u9009\u62E9\u767B\u5F55\u6863\u6848";
      $2("profile-picker-help").textContent = `${REGIONS[state.preferences.region].label} \xB7 \u6BCF\u4E2A\u6863\u6848\u4FDD\u7559\u72EC\u7ACB\u767B\u5F55\u72B6\u6001`;
      const pickerStatus = $2("profile-picker-status");
      pickerStatus.className = state.profileDiscovery === "failed" || !!state.profileError || !!state.notice ? "error" : "";
      pickerStatus.textContent = state.profileDiscovery === "loading" ? "\u6B63\u5728\u8BFB\u53D6\u672C\u5730\u767B\u5F55\u6863\u6848\u548C\u5386\u53F2\u69FD\u4F4D\u2026" : state.profileError || state.notice || "";
      const pickerSignature = JSON.stringify([state.profiles, state.profileDiscovery, state.profileError, state.selectedProfileId, state.preferences.region, state.profilePickerIntent]);
      if (pickerSignature !== profilePickerSignature) {
        profilePickerSignature = pickerSignature;
        const list = $2("profile-picker-list");
        list.replaceChildren();
        for (const profile of regionProfiles) {
          const row = document.createElement("div");
          row.className = "profile-option";
          row.dataset.id = profile.id;
          const info = document.createElement("div");
          info.className = "profile-option-info";
          const name = document.createElement("div");
          name.className = "profile-option-name";
          name.textContent = `${profile.name}${profile.id === state.selectedProfileId ? " \xB7 \u5F53\u524D\u9009\u62E9" : ""}`;
          info.append(name);
          const notes = profile.cleanupStatus ? ["\u6E05\u7406\u672A\u5B8C\u6210\uFF0C\u8BF7\u5728\u8BBE\u7F6E\u4E2D\u91CD\u8BD5"] : profileNotes2(profile);
          if (notes.length) {
            const note = document.createElement("div");
            note.className = "profile-option-note";
            note.textContent = notes.join(" \xB7 ");
            info.append(note);
          }
          if (state.profilePickerIntent === "select") {
            const choose = document.createElement("button");
            choose.className = "quiet small";
            choose.type = "button";
            choose.textContent = "\u9009\u62E9";
            choose.disabled = !!profile.cleanupStatus;
            choose.addEventListener("click", () => void command({ type: "profile-select", id: profile.id }));
            row.append(info, choose);
          } else row.append(info);
          const open = document.createElement("button");
          open.className = "primary small";
          open.type = "button";
          open.textContent = "\u6253\u5F00";
          open.disabled = !!profile.cleanupStatus;
          open.addEventListener("click", () => void command({ type: "profile-open", id: profile.id }));
          row.append(open);
          list.append(row);
        }
        if (state.profileDiscovery === "ready" && !regionProfiles.length) {
          const empty = document.createElement("div");
          empty.className = "profile-row";
          empty.textContent = "\u8FD9\u4E2A\u5730\u533A\u8FD8\u6CA1\u6709\u767B\u5F55\u6863\u6848";
          list.append(empty);
        }
      }
      $2("profile-picker-create").disabled = !state.canCreateProfile;
      $2("profile-picker-create").hidden = !state.canCreateProfile;
      $2("profile-picker-retry").hidden = state.profileDiscovery !== "failed";
      if (!profilePickerWasOpen) {
        const first = $2("profile-picker-list").querySelector("button") ?? $2("profile-picker-create");
        first.focus();
      }
    } else {
      profilePickerSignature = "";
    }
    profilePickerWasOpen = state.profilePickerOpen;
  }
  function setSetupError(message) {
    const error = $2("setup-error");
    error.textContent = message || "";
    error.hidden = !message;
  }
  function populateSetupProfiles(state) {
    const select = $2("setup-profile-select");
    const profiles = state.profiles.filter((profile) => profile.region === "br" && !profile.cleanupStatus);
    const signature = JSON.stringify(profiles.map((profile) => [profile.id, profile.name, profile.recovery]));
    if (signature === setupWizardProfileSignature && select.options.length) return;
    setupWizardProfileSignature = signature;
    const previous = setupWizardProfileChoice;
    select.replaceChildren();
    for (const profile of profiles) {
      const option = document.createElement("option");
      option.value = profile.id;
      option.textContent = profile.name;
      select.append(option);
    }
    const create = document.createElement("option");
    create.value = "__new__";
    create.textContent = "Criar um novo perfil";
    select.append(create);
    const selected = profiles.some((profile) => profile.id === previous) ? previous :
      profiles.some((profile) => profile.id === state.selectedProfileId) ? state.selectedProfileId :
      profiles.length ? profiles[0].id : "__new__";
    setupWizardProfileChoice = selected;
    select.value = selected;
    $2("setup-new-profile-fields").hidden = selected !== "__new__";
    $2("setup-profile-help").textContent = profiles.length
      ? "Você pode usar um perfil existente ou criar outro sem apagar os dados atuais."
      : state.profileDiscovery === "failed" ? (state.profileError || "Não foi possível verificar os perfis existentes.")
      : "Nenhum perfil BR encontrado. Crie um perfil para continuar.";
  }
  function populateSetupAccounts() {
    const select = $2("setup-official-account");
    const previous = setupWizardAccountChoice;
    select.replaceChildren();
    const manual = document.createElement("option");
    manual.value = "__manual__";
    manual.textContent = "Usar login normal (sem recuperação automática)";
    select.append(manual);
    for (const item of setupWizardAccounts) {
      const option = document.createElement("option");
      option.value = item.account;
      option.textContent = item.account;
      select.append(option);
    }
    const selected = setupWizardAccounts.some((item) => item.account.toLowerCase() === String(previous).toLowerCase())
      ? previous : setupWizardAccounts.length === 1 ? setupWizardAccounts[0].account : "__manual__";
    setupWizardAccountChoice = selected;
    select.value = selected;
    $2("setup-server-id").disabled = selected === "__manual__";
    $2("setup-account-status").textContent = setupWizardAccountMessage || (setupWizardAccounts.length === 0
      ? "Nenhuma conta oficial foi encontrada. Você ainda pode usar o login normal."
      : setupWizardAccounts.length === 1
        ? "Uma conta oficial foi encontrada neste computador."
        : `${setupWizardAccounts.length} contas oficiais encontradas. Escolha a conta correta.`);
  }
  async function refreshSetupAccounts() {
    const button = $2("setup-refresh-accounts");
    const status = $2("setup-account-status");
    button.disabled = true;
    status.textContent = "Procurando contas oficiais…";
    setupWizardAccountMessage = "";
    try {
      setupWizardAccounts = await api.recoveryAccounts("");
      setupWizardAccountMessage = setupWizardAccounts.length
        ? `${setupWizardAccounts.length} conta(s) oficial(is) encontrada(s).`
        : "Nenhuma conta encontrada. Entre no cliente oficial, feche-o completamente e tente atualizar. Você também pode continuar com login normal.";
      populateSetupAccounts();
    } catch (error) {
      setupWizardAccounts = [];
      setupWizardAccountMessage = error && error.message ? error.message : "Não foi possível verificar as contas oficiais.";
      populateSetupAccounts();
    } finally {
      button.disabled = false;
    }
  }
  function syncSetupPage(state) {
    for (const page of document.querySelectorAll("[data-setup-page]")) {
      page.hidden = Number(page.dataset.setupPage) !== setupWizardStep;
    }
    $2("setup-step-count").textContent = `${setupWizardStep + 1} / 3`;
    $2("setup-progress-bar").style.width = `${(setupWizardStep + 1) / 3 * 100}%`;
    $2("setup-back").hidden = setupWizardStep === 0;
    $2("setup-next").hidden = setupWizardStep === 2;
    $2("setup-finish").hidden = setupWizardStep !== 2;
    $2("setup-title").textContent = setupWizardStep === 0 ? "Configuração inicial" : setupWizardStep === 1 ? "Seu perfil de jogo" : "Conta oficial e servidor";
    $2("setup-subtitle").textContent = setupWizardStep === 0 ? "Vamos preparar sua conta em poucos passos." : setupWizardStep === 1 ? "Escolha onde seus dados de jogo serão guardados." : "Vincule o cliente oficial ou use o login normal.";
    if (setupWizardStep === 0) {
      const system = state.system || {};
      $2("setup-system-status").textContent = system.platform === "win32" && system.architecture === "x64"
        ? `Windows 64 bits · Electron ${system.electron || "11"}` : `${system.platform || "Sistema"} · ${system.architecture || "arquitetura"}`;
      $2("setup-flash-icon").textContent = system.flashAvailable ? "✓" : "!";
      $2("setup-flash-icon").className = system.flashAvailable ? "setup-check-icon" : "setup-check-icon warning";
      $2("setup-flash-status").textContent = system.flashAvailable
        ? `Flash ${system.flashVersion || "incluído"} encontrado. A renderização será confirmada ao abrir o jogo.`
        : "O Flash não foi detectado agora. A configuração pode continuar, mas será necessário verificar o pacote do jogo.";
    }
    if (setupWizardStep === 1) populateSetupProfiles(state);
    $2("setup-wizard").hidden = !setupWizardOpen;
    for (const id of ["setup-later", "setup-back", "setup-next", "setup-finish", "setup-profile-select", "setup-profile-name", "setup-official-account", "setup-server-id", "setup-refresh-accounts"]) {
      const element = $2(id);
      if (element) element.disabled = setupWizardBusy || (id === "setup-profile-select" && state.profileDiscovery !== "ready");
    }
    $2("setup-server-id").disabled = setupWizardBusy || $2("setup-official-account").value === "__manual__";
    if (setupWizardOpen && state.profileDiscovery === "failed") {
      $2("setup-profile-help").textContent = state.profileError || "A leitura dos perfis falhou. Você pode configurar depois e tentar novamente.";
      $2("setup-next").disabled = setupWizardStep === 1;
    } else {
      $2("setup-next").disabled = setupWizardBusy;
    }
    $2("setup-finish").disabled = setupWizardBusy || (setupWizardAccountChoice !== "__manual__" && !/^[1-9]\d{0,4}$/.test($2("setup-server-id").value));
  }
  function maybeOpenSetupWizard(state) {
    if (setupWizardShown || !state.setup || !state.setup.required || state.tabs.length || state.settingsOpen || state.profilePickerOpen) return;
    if (state.profileDiscovery === "idle" || state.profileDiscovery === "loading") return;
    setupWizardShown = true;
    setupWizardOpen = true;
    setupWizardStep = 0;
    setupWizardProfileSignature = "";
    setupWizardProfileChoice = state.profiles.find((profile) => profile.id === state.selectedProfileId && profile.region === "br")?.id || "__new__";
    const current = state.profiles.find((profile) => profile.id === setupWizardProfileChoice);
    setupWizardAccountChoice = current && current.recovery && current.recovery.enabled ? (current.recovery.officialAccount || "") : "__manual__";
    $2("setup-server-id").value = current && current.recovery && current.recovery.enabled ? String(current.recovery.serverId || "810") : "810";
    populateSetupProfiles(state);
    setSetupError("");
    syncSetupPage(state);
    void refreshSetupAccounts();
  }
  async function finishSetup() {
    if (!latest || setupWizardBusy) return;
    const account = $2("setup-official-account").value;
    const serverText = $2("setup-server-id").value.trim();
    if (account !== "__manual__" && !/^[1-9]\d{0,4}$/.test(serverText)) {
      setSetupError("Digite o número do servidor BR. Exemplo: se o jogo mostrar S810, digite 810.");
      return;
    }
    const profileChoice = $2("setup-profile-select").value || setupWizardProfileChoice;
    const isNew = profileChoice === "__new__";
    const profileName = $2("setup-profile-name").value.trim();
    if (isNew && !profileName) {
      setSetupError("Digite um nome para identificar seu perfil.");
      return;
    }
    setupWizardBusy = true;
    setSetupError("");
    syncSetupPage(latest);
    try {
      await api.command({ type: "region", value: "br" });
      let profileId = profileChoice;
      if (isNew) {
        const created = await api.command({ type: "profile-create", name: profileName, serverNote: "" });
        if (!created || !created.id) throw new Error("Não foi possível criar o perfil. Tente novamente.");
        profileId = created.id;
      }
      await api.command({ type: "profile-select", id: profileId });
      if (account !== "__manual__") {
        await api.command({
          type: "profile-recovery-update", id: profileId,
          recovery: { enabled: true, officialAccount: account, serverId: Number(serverText) }
        });
      }
      await api.command({ type: "setup-complete", mode: account === "__manual__" ? "manual" : "recovery" });
      setupWizardOpen = false;
      setupWizardBusy = false;
      setSetupError("");
      toast(account === "__manual__" ? "Configuração concluída. Você pode entrar pelo login normal." : "Configuração concluída. Seu perfil BR está pronto.");
      if (latest) render(latest);
    } catch (error) {
      setupWizardBusy = false;
      setSetupError(error && error.message ? error.message : "Não foi possível concluir a configuração. Tente novamente.");
      if (latest) syncSetupPage(latest);
    }
  }
  async function deferSetup() {
    if (setupWizardBusy) return;
    setupWizardBusy = true;
    if (latest) syncSetupPage(latest);
    try {
      await api.command({ type: "setup-complete", mode: "later" });
      setupWizardOpen = false;
      setupWizardBusy = false;
      toast("Tudo bem. Você poderá configurar a recuperação depois em Configurações → Login Profiles.");
      if (latest) render(latest);
    } catch (error) {
      setupWizardBusy = false;
      setSetupError(error && error.message ? error.message : "Não foi possível salvar esta opção.");
      if (latest) syncSetupPage(latest);
    }
  }
  function render(state) {
    latest = state;
    maybeOpenSetupWizard(state);
    syncSetupPage(state);
    document.documentElement.classList.toggle("on-lobby", !state.activeId && !state.settingsOpen);
    document.documentElement.classList.toggle("settings-open", state.settingsOpen);
    document.documentElement.dataset.region = state.preferences.region;
    applyAppearance(state.preferences);
    const signature = JSON.stringify([state.tabs, state.activeId]);
    if (signature !== displayedTabs) {
      displayedTabs = signature;
      const nav = $2("tabs");
      nav.setAttribute("role", "tablist");
      nav.replaceChildren();
      state.tabs.forEach((tab, index) => {
        const item = document.createElement("div");
        item.className = `tab ${tab.state}`;
        item.setAttribute("role", "tab");
        item.setAttribute("aria-selected", String(tab.id === state.activeId));
        item.tabIndex = tab.id === state.activeId || !state.activeId && index === 0 ? 0 : -1;
        item.dataset.id = tab.id;
        const regionLabel = REGIONS[tab.region ?? "br"].label;
        item.title = `${regionLabel} \xB7 ${tab.profileName ?? `\u6E38\u620F ${index + 1}`}${tab.name ? ` \xB7 \u6807\u7B7E\u5907\u6CE8\uFF1A${tab.name}` : ""} \xB7 \u53CC\u51FB\u4FEE\u6539\u5907\u6CE8`;
        const dot = document.createElement("span");
        dot.className = "tab-icon";
        const name = document.createElement("span");
        name.className = "tab-name";
        name.textContent = tab.name ? `${regionLabel} \xB7 ${tab.name}` : `${regionLabel} \xB7 ${tab.profileName ?? `\u6E38\u620F ${index + 1}`}`;
        const close = document.createElement("button");
        close.className = "tab-close";
        close.innerHTML = svg("close");
        close.title = "\u5173\u95ED\u6807\u7B7E";
        close.setAttribute("aria-label", `\u5173\u95ED${name.textContent}`);
        close.disabled = tab.closeDisabled === true;
        if (close.disabled) close.title = "\u8BF7\u5148\u53D6\u6D88\u6062\u590D\uFF0C\u518D\u5173\u95ED\u539F\u6E38\u620F";
        close.addEventListener("click", (event) => {
          event.stopPropagation();
          void command({ type: "close", id: tab.id });
        });
        if (tab.state === "loading") item.append(dot);
        item.append(name, close);
        item.addEventListener("click", () => void command({ type: "select", id: tab.id }));
        item.addEventListener("dblclick", () => void rename(tab.id, tab.name));
        item.addEventListener("contextmenu", (event) => {
          event.preventDefault();
          void rename(tab.id, tab.name);
        });
        item.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            void command({ type: "select", id: tab.id });
          }
          if (event.key === "F2") void rename(tab.id, tab.name);
          if (["ArrowRight", "ArrowLeft"].includes(event.key)) {
            event.preventDefault();
            const next = state.tabs[(index + (event.key === "ArrowRight" ? 1 : -1) + state.tabs.length) % state.tabs.length];
            void command({ type: "select", id: next.id });
          }
        });
        nav.append(item);
      });
      const activeElement = nav.querySelector("[aria-selected=true]");
      activeElement == null ? void 0 : activeElement.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
    const active = state.tabs.find((tab) => tab.id === state.activeId);
    const status = { idle: "", loading: "\u6B63\u5728\u52A0\u8F7D\u2026", ready: "", failed: "\u52A0\u8F7D\u5931\u8D25", crashed: "\u753B\u9762\u5DF2\u505C\u6B62" };
    if ((active == null ? void 0 : active.recoveryStage) === "login") status.loading = "\u6B63\u5728\u83B7\u53D6\u6E38\u620F\u5165\u53E3\u2026";
    if ((active == null ? void 0 : active.recoveryStage) === "loading") status.loading = "\u6B63\u5728\u91CD\u65B0\u8FDB\u5165\u2026";
    if ((active == null ? void 0 : active.recoveryStage) === "confirming") status.ready = "\u8BF7\u786E\u8BA4\u65B0\u6E38\u620F";
    $2("status-dot").className = `status-dot ${(active == null ? void 0 : active.state) ?? ""}`;
    $2("status-dot").hidden = !state.notice && (!active || active.state === "ready" || state.settingsOpen);
    $2("status-text").textContent = state.notice || (state.settingsOpen ? "" : active ? status[active.state] : "");
    $2("status-text").parentElement.hidden = !$2("status-text").textContent;
    const refresh = $2("refresh");
    refresh.disabled = !state.refresh.enabled;
    refresh.title = `${state.refresh.label} \u2318R`;
    refresh.setAttribute("aria-label", state.refresh.label);
    $2("mute").innerHTML = svg(state.preferences.muted ? "muted" : "volume");
    $2("mute").setAttribute("aria-pressed", String(state.preferences.muted));
    $2("mute").title = state.preferences.muted ? "\u53D6\u6D88\u603B\u9759\u97F3 \u21E7\u2318M" : "\u603B\u9759\u97F3 \u21E7\u2318M";
    $2("settings-mute").setAttribute("aria-checked", String(state.preferences.muted));
    $2("settings").setAttribute("aria-expanded", String(state.settingsOpen));
    const showSavePrompt = !!state.prompt && !state.settingsOpen;
    $2("save-prompt").hidden = !showSavePrompt;
    if (state.prompt) {
      $2("save-text").textContent = `${state.prompt.update ? "\u66F4\u65B0" : "\u4FDD\u5B58"} ${state.prompt.username} \u7684\u5BC6\u7801\u5230\u94A5\u5319\u4E32\uFF1F`;
      $2("save-password").textContent = state.prompt.update ? "\u66F4\u65B0" : "\u4FDD\u5B58";
    }
    const showRecoveryPrompt = !!state.recovery && !state.settingsOpen;
    $2("recovery-prompt").hidden = !showRecoveryPrompt;
    $2("recovery-prompt").style.top = `${CHROME_HEIGHT + (showSavePrompt ? SAVE_PROMPT_HEIGHT : 0)}px`;
    $2("lobby").hidden = !!active || state.settingsOpen;
    $2("home").hidden = !state.tabs.length;
    $2("home").setAttribute("aria-pressed", String(!active && !state.settingsOpen));
    $2("new-tab").hidden = !state.tabs.length;
    $2("refresh").hidden = !state.tabs.length;
    $2("mute").hidden = !state.tabs.length;
    renderProfileControls(state);
    $2("placeholder").hidden = !active || !["failed", "crashed"].includes(active.state) || state.settingsOpen;
    if (!active) {
      $2("placeholder-title").textContent = "";
      $2("placeholder-detail").textContent = "";
    } else {
      $2("placeholder-title").textContent = active.state === "crashed" ? "\u6E38\u620F\u753B\u9762\u5DF2\u505C\u6B62" : "\u6E38\u620F\u9875\u9762\u52A0\u8F7D\u5931\u8D25";
      $2("placeholder-detail").textContent = active.region === "br" ? "\u53EF\u4EE5\u91CD\u65B0\u8FDB\u5165\u6E38\u620F\u83B7\u53D6\u65B0\u7684\u767B\u5F55\u5165\u53E3\u3002" : "\u8BF7\u5237\u65B0\u9875\u9762\u91CD\u8BD5\u3002";
    }
    const retry = $2("placeholder-recover");
    retry.hidden = !active || !["failed", "crashed"].includes(active.state) || state.settingsOpen;
    retry.disabled = !state.refresh.enabled;
    retry.textContent = state.refresh.label;
    $2("open-game").hidden = !!active;
    $2("settings-panel").hidden = !state.settingsOpen;
    lobby.render(state);
    renderLobbyPreferences(state);
    $2("flash-select").value = state.preferences.flash;
    const flashChanged = state.preferences.flash !== state.flash.version.split(".")[0];
    $2("flash-detail").textContent = !state.flash.available ? "\u7EC4\u4EF6\u5C1A\u672A\u51C6\u5907" : flashChanged ? "\u4E0B\u6B21\u542F\u52A8\u751F\u6548" : "";
    $2("flash-detail").hidden = state.flash.available && !flashChanged;
    if (state.settingsOpen && !settingsWasOpen) {
      void loadCredentials();
      $2("close-settings").focus();
    }
    if (!state.settingsOpen && settingsWasOpen) {
      void flushLobbyBackground();
      credentialLoad++;
      scrubSecrets();
      $2("credentials").replaceChildren();
      if (!$2("dialog-backdrop").hidden) void closeDialog();
    }
    settingsWasOpen = state.settingsOpen;
  }
  async function loadCredentials() {
    const sequence = ++credentialLoad;
    scrubSecrets();
    $2("credentials").textContent = "\u8BFB\u53D6\u4E2D\u2026";
    $2("reload-credentials").hidden = true;
    try {
      const items = await api.credentials();
      if (sequence !== credentialLoad || !latest.settingsOpen) return;
      $2("vault-count").textContent = String(items.length);
      $2("credentials").replaceChildren();
      if (!items.length) {
        const empty = document.createElement("div");
        empty.className = "vault-empty";
        empty.textContent = "\u6682\u65E0\u8D26\u53F7";
        $2("credentials").append(empty);
      }
      for (const item of items) $2("credentials").append(credentialRow(item));
    } catch (error) {
      if (sequence === credentialLoad && latest.settingsOpen) {
        $2("reload-credentials").hidden = false;
        const failure = document.createElement("div");
        failure.className = "vault-empty error";
        failure.textContent = error.message;
        $2("credentials").replaceChildren(failure);
      }
    }
  }
  function confirmCredentialUpdate(siteId, siteLabel, username, password, current) {
    $2("dialog-title").textContent = "\u66F4\u65B0\u5DF2\u4FDD\u5B58\u5BC6\u7801\uFF1F";
    $2("dialog-description").textContent = `\u201C${username}\u201D\u5728${siteLabel}\u5DF2\u6709\u8BB0\u5F55\u3002\u786E\u8BA4\u540E\u4F1A\u7528\u5F53\u524D\u8F93\u5165\u66FF\u6362\u65E7\u5BC6\u7801\u3002`;
    $2("dialog-description").hidden = false;
    $2("credential-site-label").hidden = true;
    $2("credential-site").hidden = true;
    $2("credential-site").replaceChildren();
    $2("name-label").hidden = true;
    $2("edit-name").hidden = true;
    $2("edit-name").value = "";
    $2("password-label").hidden = true;
    $2("edit-password").hidden = true;
    $2("edit-password").value = "";
    $2("server-note-label").hidden = true;
    $2("edit-server-note").hidden = true;
    $2("edit-server-note").value = "";
    $2("dialog-save").hidden = false;
    $2("dialog-save").textContent = "\u786E\u8BA4\u66F4\u65B0";
    $2("dialog-cancel").textContent = "\u53D6\u6D88";
    $2("dialog-error").textContent = "";
    let expected = current;
    dialogAction = async () => {
      const result = await api.addCredential(siteId, username, password, expected);
      if (result.status === "confirm-update") {
        expected = { id: result.id, version: result.version };
        $2("dialog-description").textContent = "\u8FD9\u6761\u5BC6\u7801\u8BB0\u5F55\u5728\u786E\u8BA4\u671F\u95F4\u53D1\u751F\u4E86\u53D8\u5316\u3002\u8BF7\u518D\u6B21\u786E\u8BA4\u662F\u5426\u7528\u5F53\u524D\u8F93\u5165\u8986\u76D6\u3002";
        return false;
      }
      if (result.status === "stale") {
        $2("dialog-description").textContent = "\u539F\u8BB0\u5F55\u5DF2\u88AB\u5220\u9664\uFF0C\u8BF7\u53D6\u6D88\u540E\u91CD\u65B0\u65B0\u589E\u3002";
        $2("dialog-save").hidden = true;
        return false;
      }
      await loadCredentials();
      toast(result.status === "unchanged" ? "\u8BE5\u7F51\u7AD9\u5DF2\u4FDD\u5B58\u76F8\u540C\u5BC6\u7801" : "\u5BC6\u7801\u5DF2\u66F4\u65B0");
      return true;
    };
  }
  async function createCredential() {
    const sites = await api.credentialSites();
    if (!(latest == null ? void 0 : latest.settingsOpen)) return;
    if (!sites.length) throw new Error("\u5F53\u524D\u6CA1\u6709\u53EF\u65B0\u589E\u5BC6\u7801\u7684\u767B\u5F55\u7AD9\u70B9");
    const siteSelect = $2("credential-site");
    await openDialog({
      title: "\u65B0\u589E\u5DF2\u4FDD\u5B58\u5BC6\u7801",
      label: "\u7528\u6237\u540D",
      password: "",
      submit: "\u4FDD\u5B58",
      siteOptions: sites,
      siteId: sites[0].id,
      action: async (username, password) => {
        var _a;
        const siteId = siteSelect.value;
        const result = await api.addCredential(siteId, username, password);
        if (result.status === "confirm-update") {
          confirmCredentialUpdate(siteId, ((_a = sites.find((site) => site.id === siteId)) == null ? void 0 : _a.label) ?? "\u8BE5\u7F51\u7AD9", username.trim(), password, result);
          return false;
        }
        if (result.status === "stale") throw new Error("\u5BC6\u7801\u8BB0\u5F55\u5DF2\u53D8\u5316\uFF0C\u8BF7\u91CD\u65B0\u6253\u5F00\u65B0\u589E\u8868\u5355");
        await loadCredentials();
        toast(result.status === "unchanged" ? "\u8BE5\u7F51\u7AD9\u5DF2\u4FDD\u5B58\u76F8\u540C\u5BC6\u7801" : "\u5DF2\u4FDD\u5B58\u5230 macOS \u94A5\u5319\u4E32");
        return true;
      }
    });
  }
  function credentialRow(item) {
    var _a;
    const row = document.createElement("div");
    row.className = "credential";
    const avatar = document.createElement("span");
    avatar.className = "credential-avatar";
    avatar.textContent = ((_a = item.username[0]) == null ? void 0 : _a.toLocaleUpperCase()) || "\xB7";
    const info = document.createElement("div");
    info.className = "credential-info";
    const name = document.createElement("div");
    name.className = "credential-name";
    name.textContent = item.username;
    const origin = document.createElement("div");
    origin.className = "credential-origin";
    origin.textContent = new URL(item.origin).hostname;
    info.append(name, origin);
    const actions = document.createElement("div");
    actions.className = "credential-actions";
    const button = (label, action) => {
      const btn = document.createElement("button");
      btn.className = "quiet";
      btn.textContent = label;
      btn.addEventListener("click", () => {
        btn.disabled = true;
        void action().catch((error) => toast(error.message)).finally(() => {
          btn.disabled = false;
        });
      });
      actions.append(btn);
      return btn;
    };
    const reveal = button("\u67E5\u770B", async () => {
      const existing = info.querySelector(".credential-password");
      if (existing) {
        existing.remove();
        reveal.textContent = "\u67E5\u770B";
        return;
      }
      const value = await api.reveal(item.id);
      if (!latest.settingsOpen || !row.isConnected) return;
      const secret = document.createElement("code");
      secret.className = "credential-password";
      secret.textContent = value;
      info.append(secret);
      reveal.textContent = "\u9690\u85CF";
      const timer = setTimeout(() => {
        secret.remove();
        reveal.textContent = "\u67E5\u770B";
        secretTimers.delete(timer);
      }, 2e4);
      secretTimers.add(timer);
    });
    button("\u4FEE\u6539", async () => {
      const password = await api.reveal(item.id);
      if (!latest.settingsOpen) return;
      await openDialog({
        title: "\u4FEE\u6539\u5DF2\u4FDD\u5B58\u7684\u8D26\u53F7",
        label: "\u8D26\u53F7",
        value: item.username,
        password,
        action: async (username, secret) => {
          await api.edit(item.id, username, secret);
          await loadCredentials();
        }
      });
    });
    const remove = button("\u5220\u9664", () => openDialog({
      title: "\u5220\u9664\u8FD9\u4E2A\u5DF2\u4FDD\u5B58\u8D26\u53F7\uFF1F",
      label: item.username,
      hideInput: true,
      submit: "\u5220\u9664",
      action: async () => {
        await api.remove(item.id);
        await loadCredentials();
      }
    }));
    remove.classList.add("danger");
    row.append(avatar, info, actions);
    return row;
  }
  function fillBrRecoveryAccounts(accounts, selected) {
    const select = $2("br-recovery-account");
    select.replaceChildren();
    const disabled = document.createElement("option");
    disabled.value = "__disabled__";
    disabled.textContent = "不启用官方会话恢复";
    select.append(disabled);
    const automatic = document.createElement("option");
    automatic.value = "";
    automatic.textContent = "自动匹配（仅检测到一个官方账号时）";
    automatic.disabled = accounts.length !== 1;
    select.append(automatic);
    for (const item of accounts) {
      const option = document.createElement("option");
      option.value = item.account;
      option.textContent = item.account;
      select.append(option);
    }
    if (selected && selected !== "__disabled__" && selected !== "" &&
        !accounts.some((item) => item.account.toLowerCase() === selected.toLowerCase())) {
      const missing = document.createElement("option");
      missing.value = selected;
      missing.textContent = selected + "（当前未检测到，请重新选择）";
      select.append(missing);
    }
    select.value = selected === void 0 || selected === null ? "__disabled__" : selected;
    $2("br-recovery-server").disabled = select.value === "__disabled__";
  }
  async function openDialog(options) {
    const sequence = ++dialogSequence;
    lastFocus = document.activeElement;
    await api.command({ type: "overlay", shown: true });
    if (sequence !== dialogSequence) return;
    $2("dialog-title").textContent = options.title;
    $2("name-label").textContent = options.label;
    $2("name-label").hidden = !!options.hideInput;
    $2("dialog-description").textContent = options.description ?? "";
    $2("dialog-description").hidden = !options.description;
    const siteSelect = $2("credential-site");
    const siteOptions = options.siteOptions ?? [];
    $2("credential-site-label").hidden = !siteOptions.length;
    siteSelect.hidden = !siteOptions.length;
    siteSelect.replaceChildren();
    for (const site of siteOptions) {
      const option = document.createElement("option");
      option.value = site.id;
      option.textContent = site.label;
      siteSelect.append(option);
    }
    if (siteOptions.length) siteSelect.value = options.siteId ?? siteOptions[0].id;
    const input = $2("edit-name");
    input.value = options.value ?? "";
    input.hidden = !!options.hideInput;
    input.maxLength = options.password !== void 0 ? 320 : 40;
    const secret = $2("edit-password");
    secret.value = options.password ?? "";
    secret.hidden = options.password === void 0;
    const serverNote = $2("edit-server-note");
    serverNote.value = options.serverNote ?? "";
    serverNote.hidden = options.serverNote === void 0;
    serverNote.maxLength = 40;
    $2("server-note-label").textContent = options.serverNoteLabel ?? "\u5E38\u7528\u533A\u670D\u5907\u6CE8";
    $2("server-note-label").hidden = serverNote.hidden;
    const recoveryFields = $2("br-recovery-fields");
    recoveryFields.hidden = options.recoveryVisible !== true;
    if (!recoveryFields.hidden) {
      const accounts = Array.isArray(options.recoveryAccounts) ? options.recoveryAccounts : [];
      const recovery = options.recovery || {};
      const selectedAccount = recovery.enabled ? (recovery.officialAccount || "") : "__disabled__";
      fillBrRecoveryAccounts(accounts, selectedAccount);
      $2("br-recovery-server").value = recovery.serverId ? String(recovery.serverId) : "";
      $2("br-recovery-refresh").dataset.profileId = options.recoveryProfileId || "";
      const status = $2("br-recovery-account-status");
      if (options.recoveryLoadError) status.textContent = options.recoveryLoadError;
      else if (!accounts.length) status.textContent = "未发现官方客户端账号。请先登录官方客户端并完全退出，再点击刷新。";
      else if (accounts.length === 1) status.textContent = "已发现 1 个官方客户端账号；可明确选择，也可使用自动匹配。";
      else status.textContent = `已发现 ${accounts.length} 个官方客户端账号，请明确选择与此档案对应的账号。`;
    } else {
      fillBrRecoveryAccounts([], "__disabled__");
      $2("br-recovery-server").value = "";
      $2("br-recovery-account-status").textContent = "";
    }
    $2("password-label").hidden = secret.hidden;
    $2("dialog-save").hidden = false;
    $2("dialog-cancel").textContent = "\u53D6\u6D88";
    $2("dialog-save").textContent = options.submit ?? "\u4FDD\u5B58";
    $2("dialog-save").classList.toggle("danger", !!options.dangerSubmit);
    $2("dialog-error").textContent = "";
    $2("dialog-backdrop").hidden = false;
    dialogAction = options.action;
    for (const id of ["edit-name", "edit-password", "edit-server-note", "br-recovery-account", "br-recovery-server", "br-recovery-refresh", "credential-site", "dialog-save"]) $2(id).disabled = false;
    if (!recoveryFields.hidden) $2("br-recovery-server").disabled = $2("br-recovery-account").value === "__disabled__";
    if (input.hidden) $2("dialog-cancel").focus();
    else {
      input.focus();
      input.select();
    }
  }
  async function closeDialog() {
    const sequence = ++dialogSequence;
    const restoreFocus = lastFocus;
    lastFocus = null;
    $2("dialog-backdrop").hidden = true;
    $2("edit-name").value = "";
    $2("edit-password").value = "";
    $2("edit-server-note").value = "";
    $2("br-recovery-account").replaceChildren();
    $2("br-recovery-server").value = "";
    $2("br-recovery-account-status").textContent = "";
    $2("br-recovery-fields").hidden = true;
    $2("credential-site").replaceChildren();
    $2("credential-site-label").hidden = true;
    $2("credential-site").hidden = true;
    $2("dialog-description").textContent = "";
    $2("dialog-description").hidden = true;
    $2("name-label").hidden = false;
    $2("dialog-save").hidden = false;
    $2("dialog-cancel").textContent = "\u53D6\u6D88";
    $2("dialog-save").classList.remove("danger");
    dialogAction = null;
    for (const id of ["edit-name", "edit-password", "edit-server-note", "br-recovery-account", "br-recovery-server", "br-recovery-refresh", "credential-site", "dialog-save"]) $2(id).disabled = false;
    await command({ type: "overlay", shown: false });
    if (sequence === dialogSequence && (latest == null ? void 0 : latest.settingsOpen) && (restoreFocus == null ? void 0 : restoreFocus.isConnected) && !restoreFocus.closest("[hidden]")) restoreFocus.focus();
  }
  async function rename(id, name) {
    await openDialog({ title: "\u6807\u7B7E\u5907\u6CE8", label: "\u5907\u6CE8 \xB7 \u7559\u7A7A\u6062\u590D\u9ED8\u8BA4", value: name, action: (value) => api.command({ type: "rename", id, name: value }) });
  }
  $2("edit-form").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!dialogAction) return;
    const sequence = dialogSequence;
    const submit = $2("dialog-save");
    const action = dialogAction;
    for (const id of ["edit-name", "edit-password", "edit-server-note", "br-recovery-account", "br-recovery-server", "br-recovery-refresh", "credential-site", "dialog-save"]) $2(id).disabled = true;
    const recovery = $2("br-recovery-fields").hidden ? null : {
      enabled: $2("br-recovery-account").value !== "__disabled__",
      officialAccount: $2("br-recovery-account").value === "__disabled__" ? "" : $2("br-recovery-account").value,
      serverId: $2("br-recovery-server").value
    };
    void action($2("edit-name").value, $2("edit-password").value, $2("edit-server-note").value, recovery).then((close) => {
      if (sequence === dialogSequence && close !== false) return closeDialog();
    }).catch((error) => {
      if (sequence === dialogSequence) $2("dialog-error").textContent = error.message;
    }).finally(() => {
      if (sequence === dialogSequence) for (const id of ["edit-name", "edit-password", "edit-server-note", "br-recovery-account", "br-recovery-server", "br-recovery-refresh", "credential-site", "dialog-save"]) $2(id).disabled = false;
      if (!$2("br-recovery-fields").hidden) $2("br-recovery-server").disabled = $2("br-recovery-account").value === "__disabled__";
    });
  });
  document.addEventListener("keydown", (event) => {
    if (!$2("dialog-backdrop").hidden) {
      if (event.key === "Escape") {
        event.preventDefault();
        void closeDialog();
      }
      if (event.key === "Tab") {
        const focusable = Array.from($2("edit-form").querySelectorAll("button:not(:disabled):not([hidden]),input:not([hidden]),select:not([hidden])"));
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    } else if (!$2("profile-picker-backdrop").hidden) {
      if (event.key === "Escape") {
        event.preventDefault();
        void command({ type: "profiles-close-picker" });
      }
      if (event.key === "Tab") {
        const focusable = Array.from($2("profile-picker-backdrop").querySelectorAll("button:not(:disabled):not([hidden])"));
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    } else if (event.key === "Escape" && (latest == null ? void 0 : latest.settingsOpen)) void command({ type: "settings" });
  });
  var bind = (id, type) => $2(id).addEventListener("click", () => void command({ type }));
  bind("new-tab", "new");
  bind("home", "home");
  bind("refresh", "refresh");
  bind("placeholder-recover", "refresh");
  bind("mute", "mute");
  bind("settings-mute", "mute");
  $2("profile-create").addEventListener("click", () => editProfile());
  $2("lobby-create-profile").addEventListener("click", () => editProfile());
  $2("lobby-profile-retry").addEventListener("click", () => void command({ type: "profiles-retry" }));
  $2("profile-picker-create").addEventListener("click", () => editProfile());
  $2("profile-picker-cancel").addEventListener("click", () => void command({ type: "profiles-close-picker" }));
  $2("profile-picker-retry").addEventListener("click", () => void command({ type: "profiles-retry" }));
  $2("profile-retry").addEventListener("click", () => void command({ type: "profiles-retry" }));
  bind("settings", "settings");
  bind("close-settings", "settings");
  bind("save-password", "save-password");
  bind("dismiss-password", "dismiss-prompt");
  $2("dialog-cancel").addEventListener("click", () => void closeDialog());
  $2("br-recovery-account").addEventListener("change", () => {
    $2("br-recovery-server").disabled = $2("br-recovery-account").value === "__disabled__";
  });
  $2("br-recovery-refresh").addEventListener("click", async () => {
    const button = $2("br-recovery-refresh");
    const status = $2("br-recovery-account-status");
    const selected = $2("br-recovery-account").value;
    button.disabled = true;
    status.textContent = "正在扫描官方客户端账号…";
    try {
      const accounts = await api.recoveryAccounts(button.dataset.profileId || "");
      fillBrRecoveryAccounts(accounts, selected);
      status.textContent = accounts.length === 0
        ? "未发现官方客户端账号。请先登录官方客户端并完全退出。"
        : accounts.length === 1
          ? "已发现 1 个官方客户端账号。"
          : `已发现 ${accounts.length} 个官方客户端账号，请明确选择。`;
    } catch (error) {
      status.textContent = error && error.message ? error.message : "读取官方账号列表失败";
    } finally {
      button.disabled = false;
    }
  });
  $2("credential-create").addEventListener("click", () => void createCredential().catch((error) => toast(error.message)));
  $2("reload-credentials").addEventListener("click", () => void loadCredentials());
  $2("complete-recovery").addEventListener("click", () => {
    if (latest == null ? void 0 : latest.recovery) void command({ type: "complete-recovery", id: latest.recovery.candidateId });
  });
  $2("cancel-recovery").addEventListener("click", () => {
    if (latest == null ? void 0 : latest.recovery) void command({ type: "cancel-recovery", id: latest.recovery.candidateId });
  });
  $2("flash-select").addEventListener("change", (event) => void command({ type: "flash", version: event.target.value }));
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) scrubSecrets();
  });
  var systemTheme = matchMedia("(prefers-color-scheme: dark)");
  var bar = document.querySelector(".chrome");
  function paintTitle(color) {
    const palette = color ? titlePalette(color) : null;
    for (const key of ["bg", "fg", "secondary", "hover", "selected", "border"]) {
      if (palette) bar.style.setProperty("--bar-" + key, palette[key]);
      else bar.style.removeProperty("--bar-" + key);
    }
  }
  function applyAppearance(preferences) {
    document.documentElement.dataset.dark = String(preferences.theme === "dark" || preferences.theme === "system" && systemTheme.matches);
    $2("theme-select").value = preferences.theme;
    $2("title-mode").value = preferences.titleBarColor ? "custom" : "default";
    $2("title-color").hidden = !preferences.titleBarColor;
    if (preferences.titleBarColor) $2("title-color").value = preferences.titleBarColor;
    paintTitle(preferences.titleBarColor);
  }
  function renderLobbyPreferences(state) {
    const selected = pendingLobbyBackground !== void 0 ? pendingLobbyBackground : state.preferences.lobbyBackground;
    const mode = customLobbyColorMode ? "custom" : selected === null ? "theme" : LOBBY_PRESETS.some((preset) => preset.color === selected) ? selected : "custom";
    $2("lobby-bg-mode").value = mode;
    const custom = $2("lobby-bg-custom");
    custom.hidden = mode !== "custom";
    custom.value = mode === "custom" ? selected : lobby.backgroundFor(state);
    $2("lobby-motion").setAttribute("aria-checked", String(state.preferences.lobbyMotion));
  }
  systemTheme.addEventListener("change", () => {
    if (latest) {
      applyAppearance(latest.preferences);
      lobby.refreshTheme();
      renderLobbyPreferences(latest);
    }
  });
  $2("theme-select").addEventListener("change", (event) => void command({ type: "theme", value: event.target.value }));
  $2("title-mode").addEventListener("change", (event) => void command({ type: "title-color", value: event.target.value === "custom" ? $2("title-color").value : null }));
  var lobbyBackgroundMode = $2("lobby-bg-mode");
  var lobbyCustomBackground = $2("lobby-bg-custom");
  lobbyBackgroundMode.addEventListener("change", () => {
    if (lobbyBackgroundMode.value === "theme") {
      customLobbyColorMode = false;
      queueLobbyBackground(null, 0);
      return;
    }
    if (lobbyBackgroundMode.value === "custom") {
      customLobbyColorMode = true;
      const selected = pendingLobbyBackground !== void 0 ? pendingLobbyBackground : latest.preferences.lobbyBackground;
      const customColor = selected && !LOBBY_PRESETS.some((preset) => preset.color === selected) ? selected : selected ?? lobby.backgroundFor(latest);
      lobbyCustomBackground.value = customColor;
      lobbyCustomBackground.hidden = false;
      return;
    }
    if (LOBBY_PRESETS.some((preset) => preset.color === lobbyBackgroundMode.value)) {
      customLobbyColorMode = false;
      queueLobbyBackground(lobbyBackgroundMode.value, 0);
    }
  });
  lobbyCustomBackground.addEventListener("input", () => queueLobbyBackground(lobbyCustomBackground.value));
  lobbyCustomBackground.addEventListener("change", () => {
    customLobbyColorMode = false;
    queueLobbyBackground(lobbyCustomBackground.value, 0);
    void flushLobbyBackground();
  });
  $2("lobby-motion").addEventListener("click", () => {
    if (latest) void command({ type: "lobby-motion", value: !latest.preferences.lobbyMotion });
  });
  $2("title-color").addEventListener("input", (event) => paintTitle(event.target.value));
  $2("title-color").addEventListener("change", (event) => void command({ type: "title-color", value: event.target.value }));
  $2("setup-profile-select").addEventListener("change", () => {
    setupWizardProfileChoice = $2("setup-profile-select").value;
    $2("setup-new-profile-fields").hidden = setupWizardProfileChoice !== "__new__";
    const profile = latest && latest.profiles.find((item) => item.id === setupWizardProfileChoice);
    if (profile && profile.recovery && profile.recovery.enabled) {
      setupWizardAccountChoice = profile.recovery.officialAccount || "";
      $2("setup-server-id").value = String(profile.recovery.serverId || "810");
      if (setupWizardAccounts.length) populateSetupAccounts();
    } else {
      setupWizardAccountChoice = "__manual__";
      $2("setup-server-id").value = "810";
      if (latest) syncSetupPage(latest);
    }
  });
  $2("setup-official-account").addEventListener("change", () => {
    setupWizardAccountChoice = $2("setup-official-account").value;
    $2("setup-server-id").disabled = setupWizardAccountChoice === "__manual__";
    if (latest) syncSetupPage(latest);
  });
  $2("setup-server-id").addEventListener("input", () => { if (latest) syncSetupPage(latest); });
  $2("setup-refresh-accounts").addEventListener("click", () => void refreshSetupAccounts());
  $2("setup-next").addEventListener("click", () => {
    if (setupWizardStep === 1) {
      const choice = $2("setup-profile-select").value;
      if (choice === "__new__" && !$2("setup-profile-name").value.trim()) {
        setSetupError("Digite um nome para identificar seu perfil.");
        return;
      }
      if (latest && latest.profileDiscovery !== "ready") {
        setSetupError(latest.profileError || "Aguarde a verificação dos perfis ou configure depois.");
        return;
      }
      setupWizardProfileChoice = choice;
    }
    setSetupError("");
    setupWizardStep = Math.min(2, setupWizardStep + 1);
    if (latest) syncSetupPage(latest);
  });
  $2("setup-back").addEventListener("click", () => {
    setSetupError("");
    setupWizardStep = Math.max(0, setupWizardStep - 1);
    if (latest) syncSetupPage(latest);
  });
  $2("setup-finish").addEventListener("click", () => void finishSetup());
  $2("setup-later").addEventListener("click", () => void deferSetup());
  api.onState(render);
  void api.state().then(render).catch((error) => toast(error.message));
})();
//# sourceMappingURL=app.js.map
