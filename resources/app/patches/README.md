# 游戏 SWF 补丁（MVP）

默认关闭。放置位置按优先级：

1. 环境变量 `NARUTO_PATCH_DIR` 指定的目录
2. 程序可执行文件同级的 `patches\`（便携版推荐）
3. `%APPDATA%\Naruto-Windows\patches\`
4. 应用目录 `resources\app\patches\`

目录结构示例：

```
patches\
  patch-manifest.json
  flash\hud\mainUI.swf
  flash\hud\HudPlugin.swf
```

`patch-manifest.json`：

```json
{
  "enabled": true,
  "version": 1,
  "region": "br",
  "textRegion": "zh",
  "hosts": ["narutowebgame.com", "oasgames.com"],
  "patches": [
    {
      "path": "/flash/hud/mainUI.swf",
      "file": "flash/hud/mainUI.swf",
      "sha256": "可选；填写后不匹配会拒绝加载",
      "mimeType": "application/x-shockwave-flash",
      "note": "中文主界面"
    }
  ]
}
```

规则：

- `path` 是 URL 路径后缀，大小写不敏感；例如 `/flash/hud/mainUI.swf` 会匹配带查询串或带 CDN 前缀的请求。
- `file` 必须位于补丁目录内，不能是绝对路径，不能包含 `..`。
- `hosts` 可选；填写后只拦截这些域名及其子域名。
- 补丁服务只挂载巴西服；国服始终使用 Electron 原生网络，不经过补丁代理。
- 未命中的请求会原样转发，不会改变游戏正常网络。
- 设置 `NARUTO_PATCHES=0` 可强制关闭，即使 manifest 是 `enabled: true`。

当前 MVP 只做资源替换；补丁清单、下载、签名、按账号隔离等后续再加。

## v1.7 bundle 接入说明

- `dist/main/index.js` 已加入按区域挂载的 `patchService.attach(session, region)` / `detach(session)`。
- 原始文件备份：`dist/main/index.js.v1.2.1.bak`。
- 新增模块：`dist/main/patch-service.js`。
- 运行日志：`%APPDATA%\Naruto OS\patch.log`。
- 升级 `Naruto-Windows-v1.6` 后需要重新接入；回滚时用备份覆盖 `index.js` 即可。
