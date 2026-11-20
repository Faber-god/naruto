"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { spawn, execFileSync } = require("child_process");
const root = path.resolve(__dirname, "../resources/app");
const directory = fs.mkdtempSync(path.join(root, ".test-artifacts/memory-ui-"));
fs.writeFileSync(path.join(directory, "first-run-setup.json"), JSON.stringify({ version: 1, completed: true, mode: "later" }));
const executable = path.resolve(root, "../../Naruto-Windows.exe");
const emit = value => process.stdout.write(JSON.stringify(value) + "\n");
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const results = [];
let child, main, shell;

async function until(check, timeout = 20000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const value = await check();
    if (value) return value;
    await delay(100);
  }
  throw new Error("MEMORY_UI_TIMEOUT");
}
async function connect(port, select) {
  const target = await until(async () => {
    try { return select(await (await fetch("http://127.0.0.1:" + port + "/json/list")).json()); } catch { return null; }
  });
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.addEventListener("open", resolve, { once: true }); ws.addEventListener("error", reject, { once: true }); });
  let sequence = 0;
  const pending = new Map();
  ws.addEventListener("message", event => {
    const message = JSON.parse(event.data);
    const item = pending.get(message.id);
    if (!item) return;
    pending.delete(message.id);
    clearTimeout(item.timer);
    const response = message.result;
    if (message.error || response.exceptionDetails) item.reject(new Error(JSON.stringify(message)));
    else item.resolve(response.result.value);
  });
  return {
    ws,
    evaluate: expression => new Promise((resolve, reject) => {
      const id = ++sequence;
      const timer = setTimeout(() => { pending.delete(id); reject(new Error("MEMORY_CDP_TIMEOUT")); }, 15000);
      pending.set(id, { resolve, reject, timer });
      ws.send(JSON.stringify({ id, method: "Runtime.evaluate", params: { expression, returnByValue: true, awaitPromise: true } }));
    })
  };
}
async function state() { return shell.evaluate("window.naruto.state()"); }
async function command(value) { return shell.evaluate("window.naruto.command(" + JSON.stringify(value) + ")"); }
async function check(name, condition) { assert(condition, name); results.push(name); }

async function run() {
  emit({ phase: "launch", directory });
  child = spawn(executable, ["--remote-debugging-port=19322", "--inspect=19323", "--force-renderer-accessibility"], {
    env: { ...process.env, NARUTO_DATA_DIR: directory, NARUTO_TEST_MODE: "1", NARUTO_TEST_MANUAL_PREVIEW: "1" },
    stdio: ["ignore", "pipe", "pipe"]
  });
  const log = fs.createWriteStream(path.join(directory, "runtime.log"));
  child.stdout.pipe(log); child.stderr.pipe(log);
  child.on("error", error => emit({ phase: "spawn-error", error: error.message }));
  main = await connect(19323, targets => targets[0]);
  const identity = await main.evaluate('({pid:process.pid,data:process.env.NARUTO_DATA_DIR,version:process.versions.electron})');
  assert.strictEqual(identity.pid, child.pid);
  assert.strictEqual(path.resolve(identity.data), directory);
  assert.strictEqual(identity.version, "11.5.0");
  shell = await connect(19322, targets => targets.find(t => t.url.endsWith("/dist/renderer/index.html")));
  await until(() => shell.evaluate('typeof window.naruto === "object" && !!document.getElementById("memory-status")'));
  await check("no-release-control", await shell.evaluate('!document.getElementById("low-memory") && !document.getElementById("release-idle")'));
  await main.evaluate(`(()=>{const e=process.mainModule.require("electron");global.__memoryE=e;const block=s=>s.webRequest.onBeforeRequest({urls:["http://*/*","https://*/*","ws://*/*","wss://*/*"]},(d,cb)=>cb({cancel:!(d.url.startsWith("https://memory-fixture.invalid/")||d.url.startsWith("https://cdnnaruto-pt.oasgames.com/")||d.url.startsWith("http://127.0.0.1:9/"))}));block(e.session.defaultSession);e.app.on("session-created",block);return true;})()`);
  await until(async () => (await state()).profileDiscovery === "ready");
  const first = await command({ type: "profile-create", name: "内存测试 A", serverNote: "fixture" });
  const second = await command({ type: "profile-create", name: "内存测试 B", serverNote: "fixture" });
  await command({ type: "profile-open", id: first.id });
  await until(async () => (await state()).tabs.length === 1);
  await command({ type: "profile-open", id: second.id });
  await until(async () => { const s = await state(); return s.tabs.length === 2 && s.tabs.every(t => t.state === "ready"); });
  await until(() => { try { return fs.readFileSync(path.join(directory, "patch.log"), "utf8").includes("attached patches="); } catch { return false; } });
  await check("patch-stream-interceptor", await main.evaluate('typeof process.mainModule.require("electron").session.defaultSession.protocol.interceptStreamProtocol === "function"') && !fs.readFileSync(path.join(directory, "patch.log"), "utf8").includes("intercept-failed"));
  const manifest = JSON.parse(fs.readFileSync(path.resolve(root, "../../patches/patch-manifest.json"), "utf8"));
  const swfPatch = manifest.patches.find(p => /\.swf$/i.test(p.path));
  assert(swfPatch, "swf-patch-present");
  const patchUrl = "https://cdnnaruto-pt.oasgames.com" + swfPatch.path;
  const pageId = await main.evaluate('global.__memoryE.webContents.getAllWebContents().find(w=>w.getURL()==="about:blank").id');
  const embedHTML = '<body><embed id="kh-stream" type="application/x-shockwave-flash" src="' + patchUrl + '" width="200" height="100"></body>';
  await main.evaluate('global.__memoryE.webContents.fromId(' + pageId + ').executeJavaScript(' + JSON.stringify('document.documentElement.innerHTML = ' + JSON.stringify(embedHTML) + '; true') + ')');
  const probe = "(()=>{const e=document.getElementById('kh-stream');return e&&typeof e.PercentLoaded==='function'?e.PercentLoaded():-1})()";
  const streamLoaded = await until(async () => {
    const progress = await main.evaluate('global.__memoryE.webContents.fromId(' + pageId + ').executeJavaScript(' + JSON.stringify(probe) + ')');
    return progress >= 100 ? progress : 0;
  }, 20000).catch(() => 0);
  await check("patch-stream-loads-real-swf", streamLoaded >= 100 && fs.readFileSync(path.join(directory, "patch.log"), "utf8").includes("hit " + swfPatch.path));
  fs.writeFileSync(path.join(directory,"fixture.swf"), fs.readFileSync(path.join(root, "../../patches", swfPatch.file)));
  fs.writeFileSync(path.join(directory,"fixture.html"),'<!doctype html><html><body style="margin:0"><embed id="flash" type="application/x-shockwave-flash" src="fixture.swf" width="800" height="400"></body></html>');
  const loaded = await main.evaluate('Promise.all(global.__memoryE.webContents.getAllWebContents().filter(w=>w.getURL()==="about:blank").map(async w=>{w.session.protocol.uninterceptProtocol("https");const fs=process.mainModule.require("fs");w.session.protocol.interceptBufferProtocol("https",(r,cb)=>{const swf=r.url.endsWith("fixture.swf");const file=swf?"/fixture.swf":"/fixture.html";cb({mimeType:swf?"application/x-shockwave-flash":"text/html",data:fs.readFileSync(' + JSON.stringify(directory) + '+file)});});await w.loadURL("https://memory-fixture.invalid/");return w.id;}))');
  await check("fixture-loaded-in-two-pages", loaded.length === 2);
  await until(async () => (await main.evaluate('global.__memoryE.app.getAppMetrics().filter(p=>/Pepper\\s*Plugin|ppapi/i.test(p.type)).length')) >= 2);
  const osCommand = '$all=@(Get-CimInstance Win32_Process);$ids=@(' + child.pid + ');do{$new=@($all|Where-Object{$_.ParentProcessId -in $ids -and $_.ProcessId -notin $ids});$ids+=@($new.ProcessId)}while($new.Count -gt 0);ConvertTo-Json -InputObject @($ids) -Compress';
  const osBefore = JSON.parse(execFileSync("powershell.exe", ["-NoProfile", "-Command", osCommand], { encoding: "utf8", timeout: 20000 }));
  const metrics = await main.evaluate('global.__memoryE.app.getAppMetrics().map(p=>({pid:p.pid,type:p.type,memory:p.memory}))');
  const osAfter = JSON.parse(execFileSync("powershell.exe", ["-NoProfile", "-Command", osCommand], { encoding: "utf8", timeout: 20000 }));
  const stablePids = osBefore.filter(pid => Number.isSafeInteger(pid) && pid > 0 && osAfter.includes(pid));
  fs.writeFileSync(path.join(directory,"metrics.json"),JSON.stringify({metrics,osBefore,osAfter,stablePids},null,2));
  await check("native-metrics-include-two-ppapi", metrics.filter(p=>/Pepper\s*Plugin|ppapi/i.test(p.type)).length >= 2);
  await check("native-metrics-match-stable-os-pids", stablePids.every(pid => metrics.some(p => p.pid === pid)));
  await check("memory-readout-visible", await shell.evaluate('(()=>{const s=document.getElementById("memory-status");return s.textContent.startsWith("内存")&&s.getBoundingClientRect().width>0;})()'));
  await main.evaluate('(async()=>{const w=global.__memoryE.BrowserWindow.getAllWindows()[0];w.unmaximize();w.setFullScreen(false);await new Promise(r=>setTimeout(r,600));w.setContentSize(800,560);await new Promise(r=>setTimeout(r,400));return true;})()');
  await until(() => shell.evaluate("innerWidth <= 810"));
  await check("minimum-width-readout", await shell.evaluate('(()=>{const r=document.getElementById("memory-status").getBoundingClientRect();return document.documentElement.scrollWidth<=innerWidth&&r.x>=0&&r.right<=innerWidth;})()'));
  await shell.evaluate('window.naruto.command({type:"theme",value:"light"})');
  await main.evaluate('global.__memoryE.BrowserWindow.getAllWindows()[0].capturePage().then(i=>{process.mainModule.require("fs").writeFileSync(' + JSON.stringify(path.join(directory,"light.png")) + ',i.toPNG());return true;})');
  await shell.evaluate('window.naruto.command({type:"theme",value:"dark"})');
  await main.evaluate('global.__memoryE.BrowserWindow.getAllWindows()[0].capturePage().then(i=>{process.mainModule.require("fs").writeFileSync(' + JSON.stringify(path.join(directory,"dark.png")) + ',i.toPNG());return true;})');
  emit({phase:"passed",results,directory});
}

const deadline = setTimeout(()=>{if(child)child.kill();},180000);
run().catch(async error=>{
  let diagnostic;
  try { diagnostic = main && await main.evaluate('({metrics:process.mainModule.require("electron").app.getAppMetrics().map(p=>({pid:p.pid,type:p.type})),readout:await process.mainModule.require("electron").BrowserWindow.getAllWindows()[0].webContents.executeJavaScript("document.getElementById(\\"memory-status\\")?.textContent")})'); } catch {}
  emit({phase:"failed",error:error.stack,directory,diagnostic});process.exitCode=1;
}).finally(async()=>{
  clearTimeout(deadline);
  try { if(main) await main.evaluate('global.__memoryE ? global.__memoryE.app.exit(0) : process.mainModule.require("electron").app.exit(0)'); } catch {}
  if(shell) shell.ws.close();
  if(main) main.ws.close();
  if(child && child.exitCode===null) setTimeout(()=>{if(child.exitCode===null)child.kill();},3000).unref();
  fs.writeFileSync(path.join(directory,"results.json"),JSON.stringify({results,failed:!!process.exitCode},null,2));
});
