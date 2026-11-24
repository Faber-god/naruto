"use strict";

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

let root = path.resolve(__dirname, "../..");
let logFn = () => {};
let messages = null;
let rate = 1;
const injected = new Set();
let ppapiCache = { at: 0, pids: [] };

function loadMessages() {
  try {
    const file = path.join(root, "config/messages.json");
    const raw = fs.readFileSync(file, "utf8").replace(/^﻿/, "");
    messages = JSON.parse(raw);
  } catch {
    messages = null;
  }
}

function template(key, vars) {
  const catalog = messages && messages.logs && messages.logs.speed;
  let text = catalog && typeof catalog[key] === "string" ? catalog[key] : key;
  if (vars) {
    for (const name of Object.keys(vars)) {
      text = text.split("{" + name + "}").join(String(vars[name]));
    }
  }
  return text;
}

function emit(key, vars) {
  try {
    logFn(template(key, vars));
  } catch {
    /* logging must never break the game */
  }
}

function nativeFile(name) {
  return path.join(root, "native", name);
}

function isAvailable() {
  return fs.existsSync(nativeFile("speedctl.exe")) && fs.existsSync(nativeFile("speedhook.dll"));
}

function configure(options) {
  if (options && options.root) root = options.root;
  if (options && typeof options.log === "function") logFn = options.log;
  loadMessages();
  if (!isAvailable()) emit("componentMissing", { dir: path.join(root, "native") });
  else emit("init", { root });
}

function getRate() {
  return rate;
}

function normalizeRate(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 1;
  if (number <= 1) return 1;
  return Math.min(3, Math.round(number * 10) / 10);
}

function runSpeedctl(args) {
  return new Promise((resolve) => {
    if (!isAvailable()) {
      resolve({ ok: false, code: "component-missing", detail: "" });
      return;
    }
    let child;
    try {
      child = spawn(nativeFile("speedctl.exe"), args, {
        windowsHide: true,
        env: {
          ...process.env,
          PATH: process.env.PATH + ";" + path.dirname(nativeFile("speedctl.exe"))
        }
      });
    } catch (error) {
      resolve({ ok: false, code: "spawn", detail: String((error && error.message) || error) });
      return;
    }
    let out = "";
    let err = "";
    if (child.stdout) child.stdout.on("data", (data) => { out += data.toString(); });
    if (child.stderr) child.stderr.on("data", (data) => { err += data.toString(); });
    child.on("error", (error) => {
      resolve({ ok: false, code: "spawn", detail: String((error && error.message) || error) });
    });
    child.on("exit", (code) => {
      resolve({ ok: code === 0, code, detail: (err || out).trim().slice(0, 300) });
    });
  });
}

function queryPpapiProcesses() {
  if (process.platform !== "win32") return Promise.resolve([]);
  const now = Date.now();
  if (now - ppapiCache.at < 2000) return Promise.resolve(ppapiCache.pids);
  const exeName = path.basename(process.execPath);
  const script = `Get-CimInstance Win32_Process | Where-Object { $_.Name -eq '${exeName}' -and $_.CommandLine -like '*--type=ppapi*' } | ForEach-Object { $_.ProcessId }`;
  return new Promise((resolve) => {
    let child;
    try {
      child = spawn("powershell.exe", ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-Command", script], { windowsHide: true });
    } catch {
      resolve([]);
      return;
    }
    let out = "";
    if (child.stdout) child.stdout.on("data", (data) => { out += data.toString(); });
    child.on("error", () => resolve([]));
    child.on("exit", () => {
      const pids = [];
      for (const line of out.split(/\r?\n/)) {
        const pid = Number(line.trim());
        if (Number.isInteger(pid) && pid > 0) pids.push(pid);
      }
      ppapiCache = { at: Date.now(), pids };
      resolve(pids);
    });
  });
}

async function injectPid(pid) {
  if (rate <= 1 || !pid || injected.has(pid)) return false;
  injected.add(pid);
  emit("injectStart", { pid });
  const result = await runSpeedctl(["inject", String(pid), nativeFile("speedhook.dll")]);
  if (result.ok) {
    emit("injectOk", { pid });
    await runSpeedctl(["rate", String(rate)]);
    return true;
  }
  injected.delete(pid);
  emit("injectFail", { pid, code: result.code, detail: result.detail || "" });
  return false;
}

async function attach(contents) {
  if (rate <= 1 || !contents || contents.isDestroyed()) return false;
  const targets = new Set();
  try {
    const pid = contents.getOSProcessId();
    if (pid) targets.add(pid);
  } catch {
    /* renderer may be gone between checks */
  }
  for (const pid of await queryPpapiProcesses()) targets.add(pid);
  emit("targets", { pids: Array.from(targets).join(",") || "-" });
  let confirmed = targets.size > 0;
  for (const pid of targets) {
    if (!injected.has(pid) && !await injectPid(pid)) confirmed = false;
  }
  return confirmed;
}

function detach(contents) {
  try {
    if (contents && !contents.isDestroyed()) injected.delete(contents.getOSProcessId());
  } catch {
    /* ignore */
  }
}

async function setRate(value) {
  const requested = normalizeRate(value);
  emit("rate", { rate: requested });
  if (!isAvailable()) return { ok: false, ready: false, rate };
  if (requested === 1 && rate === 1 && injected.size === 0) return { ok: true, ready: true, rate };
  const result = await runSpeedctl(["rate", String(requested)]);
  if (result.ok) rate = requested;
  return { ok: result.ok, ready: true, rate, detail: result.detail || "" };
}

function shutdown() {
  injected.clear();
}

module.exports = {
  configure,
  isAvailable,
  getRate,
  normalizeRate,
  setRate,
  attach,
  detach,
  shutdown
};
