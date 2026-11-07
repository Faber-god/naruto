"use strict";

// src/preload/shell.ts
var import_electron = require("electron");
async function invoke(channel, input) {
  var _a;
  const response = await import_electron.ipcRenderer.invoke(channel, input);
  if (!(response == null ? void 0 : response.ok)) throw new Error((_a = response == null ? void 0 : response.message) != null ? _a : "\u64CD\u4F5C\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5");
  return response.value;
}
var api = {
  state: () => invoke("shell:state"),
  command: (command) => invoke("shell:command", command),
  recoveryAccounts: (profileId) => invoke("shell:br-recovery-accounts", profileId ? { profileId } : {}),
  onState: (callback) => {
    const listener = (_event, state) => callback(state);
    import_electron.ipcRenderer.on("shell:state", listener);
    return () => import_electron.ipcRenderer.removeListener("shell:state", listener);
  },
  credentials: () => invoke("shell:credentials"),
  credentialSites: () => invoke("shell:credential-sites"),
  addCredential: (siteId, username, password, expected) => invoke("shell:credential-add", { siteId, username, password, expected }),
  reveal: (id) => invoke("shell:reveal", id),
  edit: (id, username, password) => invoke("shell:edit", { id, username, password }),
  remove: (id) => invoke("shell:remove", id)
};
import_electron.contextBridge.exposeInMainWorld("naruto", api);
import_electron.ipcRenderer.on("shell:fullscreen", (_event, fullscreen) => document.documentElement.classList.toggle("fullscreen", fullscreen));
//# sourceMappingURL=shell.js.map
