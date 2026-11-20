"use strict";

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const Module = require("module");
const { createHash } = require("crypto");

const temp = fs.mkdtempSync(path.join(os.tmpdir(), "naruto-patch-test-"));
const fakeElectron = {
  app: {
    commandLine: { appendSwitch() {} },
    getPath() {
      return temp;
    },
    on() {},
    whenReady() {
      return Promise.resolve();
    }
  },
  net: {},
  session: {
    fromPartition() {
      return {};
    }
  }
};

const originalLoad = Module._load;
Module._load = function load(request, parent, isMain) {
  if (request === "electron") return fakeElectron;
  return originalLoad.call(this, request, parent, isMain);
};

try {
  const service = require(path.resolve(__dirname, "..", "resources", "app", "dist", "main", "patch-service.js"));
  service.dir = temp;
  service.logFile = path.join(temp, "patch.log");
  service.log = message => fs.appendFileSync(service.logFile, message + "\n");

  const file = "good.bin";
  const absolute = path.join(temp, file);
  fs.writeFileSync(absolute, "valid");
  const entry = {
    path: "/test/good.bin",
    file,
    sha256: createHash("sha256").update("valid").digest("hex")
  };
  assert.strictEqual(service.readPatch(entry).toString(), "valid");

  fs.writeFileSync(absolute, "corrupt");
  assert.strictEqual(service.readPatch(entry), null);
  assert.match(fs.readFileSync(service.logFile, "utf8"), /hash-mismatch fallback=network/);
  assert.strictEqual(service.readPatch(entry), null);

  service.invalidPatches.clear();
  const missing = { path: "/test/missing.bin", file: "missing.bin", sha256: entry.sha256 };
  assert.strictEqual(service.readPatch(missing), null);
  assert.match(fs.readFileSync(service.logFile, "utf8"), /read-failed fallback=network/);

  service.invalidPatches.clear();
  service.patchVerified.clear();
  fs.writeFileSync(absolute, "valid");
  const verified = service.verifiedPatch(entry);
  assert.strictEqual(verified.size, 5);
  fs.writeFileSync(absolute, "valid");
  assert.strictEqual(service.verifiedPatch(entry).size, 5);
  fs.writeFileSync(absolute, "corrupt");
  assert.strictEqual(service.verifiedPatch(entry), null);
  assert.strictEqual(service.invalidPatches.get("/test/good.bin"), "hash-mismatch");
  const noHash = { path: "/test/nohash.bin", file: "nohash.bin" };
  fs.writeFileSync(path.join(temp, "nohash.bin"), "any");
  assert.strictEqual(service.verifiedPatch(noHash).size, 3);
  process.stdout.write("Patch fallback tests OK\n");
} finally {
  Module._load = originalLoad;
  fs.rmSync(temp, { recursive: true, force: true });
}
