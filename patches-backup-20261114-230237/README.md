# 游戏中文化补丁（v1.8.1）

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
  "version": 6,
  "requireSha256": true,
  "region": "br",
  "textRegion": "zh",
  "hosts": ["narutowebgame.com", "oasgames.com"],
  "patches": [
    {
      "path": "/flash/hud/mainUI.swf",
      "file": "flash/hud/mainUI.swf",
      "sha256": "必须填写；小写或大写 SHA-256 均可",
      "mimeType": "application/x-shockwave-flash",
      "strategy": "whole-swf",
      "sourceVersion": "legacy-zh-1.7",
      "compatibility": "runtime-verified",
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
- v6 清单要求每个文件都有有效 `sha256`；文件缺失、哈希错误或读取失败时自动回退官方网络，不会返回代理错误页。
- 设置 `NARUTO_PATCHES=0` 可强制关闭，即使 manifest 是 `enabled: true`。

当前补丁包含已验证的 22 个中文 SWF、动态文本词典 `TranslatedKeyCFG.cfg` 和 AI 日志模板。
`naruto.include.swf`、`AIPlugin.swf`、`AIManageUI.swf` 禁止整包替换。

本地化工具：

```powershell
node scripts/localization-tool.js build-ai-log
node scripts/localization-tool.js refresh-manifest
node scripts/localization-tool.js audit
```

`refresh-manifest` 会更新文件哈希和来源元数据；`audit` 会验证 manifest、SHA-256、SWF 文件头及 zlib 配置。

## v1.7 bundle 接入说明

- `dist/main/index.js` 已加入按区域挂载的 `patchService.attach(session, region)` / `detach(session)`。
- 原始文件备份：`dist/main/index.js.v1.2.1.bak`。
- 新增模块：`dist/main/patch-service.js`。
- 运行日志：`%APPDATA%\Naruto-Windows\patch.log`。
- 升级 `Naruto-Windows-v1.6` 后需要重新接入；回滚时用备份覆盖 `index.js` 即可。
