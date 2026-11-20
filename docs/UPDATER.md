# 自动更新发布与维护

本文档适用于 `Naruto-Windows-v1.9` 发布树。当前应用没有 TypeScript 源码和构建链，更新器直接修改 `resources/app/dist` 下的打包产物。

## 1. 更新源

- 仓库：`https://github.com/Faber-god/naruto`
- 清单地址：`https://github.com/Faber-god/naruto/releases/latest/download/update.json`
- 发布页：`https://github.com/Faber-god/naruto/releases/latest`

`releases/latest` 只指向最新的**非预发布、非草稿**版本。每个作为 latest 的发布必须同时上传：

1. `Naruto-Windows-v<version>-update.zip`
2. `update.json`

`update.json` 中的 `url`、`size`、`sha256` 必须与上传的 ZIP 完全一致，否则客户端会拒绝下载或安装。

## 2. 版本号规则

运行时唯一可信版本是 `resources/app/package.json` 的 `version`，`app.getVersion()` 读取它。

发布前必须同步：

- `resources/app/package.json` 的 `version`
- `build-info.json` 的 `version`、`builtAt`、`notes`
- `Install-Naruto-Windows.ps1` 的 `$Version` 和横幅版本
- `START-HERE-ZH-CN.txt` / `START-HERE-PT-BR.txt`（可选）
- Git tag / Release 标题
- `update.json` 的 `version`

`patches/patch-manifest.json` 的 `version` 是补丁清单 schema 版本，**不要**随应用版本修改。

即使只改了顶层 `patches` 汉化补丁，也必须递增应用版本，否则客户端不会认为有新版本。

## 3. 生成更新包

在仓库根目录运行：

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\make-update-package.ps1 `
  -Version 1.9.2 `
  -MinVersion 1.9.0 `
  -Notes "更新说明"
```

输出到 `dist\releases\`：

- `Naruto-Windows-v1.9.2-update.zip`
- `update.json`

默认同时打包 `resources/app` 和顶层 `patches`。只更新程序代码时加 `-SkipPatches`。

可选参数：

- `-NotesFile NOTES.md`：从文件读取更新说明
- `-Tag v1.9.2`：自定义 Release tag
- `-Repo Faber-god/naruto`：自定义仓库
- `-DryRun`：只校验版本，不生成文件

ZIP 内部结构：

```text
resources/app/...
patches/...            （可选）
build-info.json
```

## 4. 发布到 GitHub Releases

### 一键发布（推荐）

生成更新包和完整包之后，在仓库根目录运行：

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\publish-release.ps1 `
  -Version 1.9.2 `
  -Notes "更新说明"
```

脚本会自动完成：

1. 校验 `update.json` 与增量包的版本、大小、SHA-256
2. 检查 `gh` 登录状态，未登录时自动进入 `gh auth login`
3. 创建草稿 Release（已存在草稿则复用，已正式发布则终止）
4. 上传 `update.zip`、`update.json`、`full.zip` 三个附件并逐项校验
5. 发布为 latest 并输出 `releases/latest/download/update.json` 验证地址

加 `-DryRun` 只做文件与清单校验，不联网。

### 手动步骤

先建草稿，上传完资产再发布为 latest：

```bash
gh release create v1.9.2 --repo Faber-god/naruto --draft --title "v1.9.2" --notes-file NOTES.md
gh release upload v1.9.2 dist/releases/Naruto-Windows-v1.9.2-update.zip dist/releases/update.json --repo Faber-god/naruto
gh release edit v1.9.2 --repo Faber-god/naruto --draft=false --latest
```

发布后验证：

```bash
curl -L https://github.com/Faber-god/naruto/releases/latest/download/update.json
```

## 5. 客户端更新流程

1. 启动 20 秒后自动检查；距上次检查不足 24 小时则跳过。设置页可关闭自动检查。
2. 手动“检查更新”不受开关和 24 小时限制。
3. 发现新版本后显示版本号和更新说明，不自动下载。
4. 用户点击“下载并安装”，下载到 `%APPDATA%\Naruto-Windows\updates\<version>\`。
5. 下载完成后校验大小和 SHA-256；通过后按钮变为“重启并安装”。
6. 用户确认后，主进程启动 `update-helper.ps1` 并正常退出。
7. helper 等待应用退出，备份 `resources\app` 和 `patches`，替换文件，失败自动回滚，然后重启。

## 6. 首次引导

当前已安装的 1.9.0 不含更新器，无法自我更新。必须：

1. 将包含更新器的版本（例如 1.9.1）作为完整安装包发布。
2. 用户手动安装一次。
3. 后续 1.9.2 及以后才能通过自动更新升级。

## 7. 本地测试

使用本地 HTTP 更新源，不影响真实安装：

```bash
NARUTO_TEST_MODE=1
NARUTO_TEST_MANUAL_PREVIEW=1
NARUTO_DATA_DIR=F:\naruto\Naruto-Windows-v1.9\.test-artifacts\update-test
NARUTO_UPDATE_TEST=1
NARUTO_UPDATE_FEED=http://127.0.0.1:8787/update.json
```

启动应用后：

- 设置页手动检查应读取本地 `update.json`
- 下载进度应更新
- 取消下载应删除 `.part`
- 修改 `sha256` 后下载应报校验失败
- 在测试安装目录运行 helper，验证备份、替换、回滚

## 8. 日志与结果文件

- 更新日志：`%APPDATA%\Naruto-Windows\update.log`
- 上次安装结果：`%APPDATA%\Naruto-Windows\update-result.json`（读过后改名为 `.last.json`）
- 进行中的安装标记：`%APPDATA%\Naruto-Windows\update-pending.json`
- 安装备份：`%APPDATA%\Naruto-Windows\update-backup\<version>-<timestamp>`

如果 helper 被杀毒软件拦截，`update-pending.json` 会在下次启动时被检测到，设置页显示安装未完成，并提示查看日志或手动下载完整安装包。

## 9. 安全边界

- 更新包只包含 `resources/app` 和 `patches`，不替换 EXE/DLL。
- 传输使用 HTTPS，最终主机限制为 `github.com` 和 `*.githubusercontent.com`。
- ZIP 使用清单中的 SHA-256 校验，主进程和 helper 各校验一次。
- helper 拒绝绝对路径、盘符、`..`、重复条目、符号链接和超大条目。
- 没有代码签名；信任最终落在 GitHub 仓库发布权限上，请开启 2FA 并限制发布权限。
