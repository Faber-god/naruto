"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { MemoryService, aggregateMetrics, validateMessages, text } = require("../resources/app/dist/main/memory-service");
const messages = JSON.parse(fs.readFileSync(path.join(__dirname, "../resources/app/config/messages.json"), "utf8"));
const metric = (pid, workingSetSize = 1024, privateBytes = 2048) => ({ pid, memory: { workingSetSize, privateBytes } });

function fixture() {
  const logs = [];
  const updates = [];
  const options = {
    app: { getAppMetrics: () => [metric(1), metric(2)] },
    messages: () => messages,
    publish: value => updates.push(value),
    log: value => logs.push(value)
  };
  const service = new MemoryService(options);
  return { service, options, logs, updates };
}

function run() {
  validateMessages(messages);
  const aggregate = aggregateMetrics([metric(1), metric(2), metric(1)], "win32");
  assert.strictEqual(aggregate.workingSetKiB, 2048);
  assert.strictEqual(aggregate.privateKiB, 4096);
  assert.strictEqual(aggregate.processCount, 2);
  assert.strictEqual(aggregateMetrics([metric(1)], "darwin").privateKiB, null);
  for (const invalid of [[], null, [metric(0)], [{ pid: 1 }], [metric(1, -1)], [metric(1, NaN)], [metric(1, 1, -2)], [metric(1, 1, Infinity)], [{ pid: 1, memory: { workingSetSize: 1 } }]]) {
    assert.throws(() => aggregateMetrics(invalid, "win32"), /MEMORY_/);
  }
  const changed = JSON.parse(JSON.stringify(messages));
  changed.ui.memory.summary = "配置内存测试 {size}";
  assert.strictEqual(text(changed, "ui", "summary", { size: "1 MiB" }), "配置内存测试 1 MiB");
  delete changed.ui.memory.summary;
  assert.throws(() => validateMessages(changed), /MEMORY_MESSAGE_MISSING/);
  assert.throws(() => text(messages, "ui", "summary"), /MEMORY_PLACEHOLDER_MISSING/);
  const noSlot = JSON.parse(JSON.stringify(messages));
  noSlot.ui.memory.summary = "无参数";
  assert.throws(() => validateMessages(noSlot), /MEMORY_TEMPLATE_INVALID/);

  {
    const f = fixture();
    f.service.refresh();
    assert.strictEqual(f.service.snapshot().status, "ok");
    assert.strictEqual(f.updates.length, 1);
    f.options.app.getAppMetrics = () => { throw new Error("fixture failure"); };
    f.service.refresh();
    f.service.refresh();
    assert.strictEqual(f.service.snapshot().status, "unavailable");
    assert.strictEqual(f.service.snapshot().workingSetKiB, null);
    assert.strictEqual(f.logs.length, 1);
    f.options.app.getAppMetrics = () => [metric(1)];
    f.service.refresh();
    assert.strictEqual(f.service.snapshot().status, "ok");
    f.service.start();
    assert(f.service.timer);
    f.service.stop();
    assert.strictEqual(f.service.timer, null);
  }
  assert.strictEqual(typeof MemoryService.prototype.release, "undefined");
  assert.strictEqual(typeof MemoryService.prototype.showMenu, "undefined");
  process.stdout.write("Memory service tests OK\n");
}

run();
