"use strict";

const UI_KEYS = ["reading", "unavailable", "summary", "detail", "partialDetail", "sizeMiB", "sizeGiB"];
const SLOTS = { summary: ["size"], detail: ["workingSet", "private", "count"], partialDetail: ["code"], sizeMiB: ["value"], sizeGiB: ["value"], sampleFailed: ["code"] };

function text(messages, group, key, values = {}) {
  const template = messages[group] && messages[group].memory && messages[group].memory[key];
  if (typeof template !== "string" || !template.trim()) throw new Error("MEMORY_MESSAGE_MISSING:" + group + ".memory." + key);
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_match, name) => {
    if (!Object.prototype.hasOwnProperty.call(values, name)) throw new Error("MEMORY_PLACEHOLDER_MISSING:" + name);
    return String(values[name]);
  });
}

function validateMessages(messages) {
  for (const [group, keys] of [["ui", UI_KEYS], ["logs", ["sampleFailed"]]]) {
    for (const key of keys) {
      const values = Object.fromEntries((SLOTS[key] || []).map(name => [name, name]));
      const result = text(messages, group, key, values);
      const template = messages[group].memory[key];
      for (const name of SLOTS[key] || []) {
        if (!template.includes("{" + name + "}")) throw new Error("MEMORY_TEMPLATE_INVALID:" + key + ":" + name);
      }
      if (!result.trim()) throw new Error("MEMORY_MESSAGE_EMPTY:" + key);
    }
  }
}

function aggregateMetrics(metrics, platform = process.platform) {
  if (!Array.isArray(metrics) || !metrics.length) throw new Error("MEMORY_METRICS_EMPTY");
  const seen = new Set();
  let workingSetKiB = 0;
  let privateKiB = platform === "win32" ? 0 : null;
  for (const item of metrics) {
    if (!item || !Number.isSafeInteger(item.pid) || item.pid <= 0) throw new Error("MEMORY_PID_INVALID");
    if (seen.has(item.pid)) continue;
    seen.add(item.pid);
    const memory = item.memory;
    if (!memory || !Number.isFinite(memory.workingSetSize) || memory.workingSetSize < 0) throw new Error("MEMORY_WORKING_SET_INVALID");
    workingSetKiB += memory.workingSetSize;
    if (platform === "win32") {
      if (!Number.isFinite(memory.privateBytes) || memory.privateBytes < 0) throw new Error("MEMORY_PRIVATE_BYTES_INVALID");
      privateKiB += memory.privateBytes;
    }
  }
  if (!Number.isFinite(workingSetKiB) || (privateKiB !== null && !Number.isFinite(privateKiB))) throw new Error("MEMORY_TOTAL_INVALID");
  return { status: "ok", workingSetKiB, privateKiB, processCount: seen.size, sampledAt: Date.now() };
}

class MemoryService {
  constructor(options) {
    this.options = options;
    validateMessages(options.messages());
    this.sample = { status: "pending", workingSetKiB: null, privateKiB: null, processCount: 0, sampledAt: 0 };
    this.timer = null;
    this.lastError = "";
  }

  snapshot() {
    return { ...this.sample };
  }

  publish() {
    this.options.publish(this.snapshot());
  }

  refresh() {
    try {
      this.sample = aggregateMetrics(this.options.app.getAppMetrics());
      this.lastError = "";
    } catch (error) {
      const code = error && /^MEMORY_[A-Z_]+$/.test(error.message) ? error.message : "MEMORY_SAMPLE_FAILED";
      this.sample = { status: "unavailable", code, workingSetKiB: null, privateKiB: null, processCount: 0, sampledAt: Date.now() };
      if (code !== this.lastError) this.options.log(text(this.options.messages(), "logs", "sampleFailed", { code }));
      this.lastError = code;
    }
    this.publish();
  }

  start() {
    this.stop();
    this.refresh();
    this.timer = setInterval(() => this.refresh(), 5000);
    this.timer.unref();
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }
}

module.exports = { MemoryService, aggregateMetrics, validateMessages, text };
