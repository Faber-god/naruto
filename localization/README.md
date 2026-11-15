# 本地化工作区

## 目录

- `sources/br/`：从 BR CDN 固定下来的原始二进制资源，用于重复构建。
- `zh-CN/ai-log-template.json`：AI 日志和枚举的中文文本源表。
- `patch-metadata.json`：每个补丁的资源类型、来源版本、兼容级别和说明。

## 文本表规则

每个条目必须包含：

- `key`
- `sourceText`
- `zhCN`
- `context`
- `placeholders`
- `status`

构建器会检查占位符集合是否一致。HTML 标签、颜色值和资源键不能翻译或删除。

## 更新流程

1. 更新 BR 原始资源并保留版本信息。
2. 修改 `zh-CN` 文本表。
3. 运行 `node scripts/localization-tool.js build-ai-log`。
4. 运行 `node scripts/localization-tool.js refresh-manifest`。
5. 运行 `node scripts/localization-tool.js audit`。
6. 在干净安装目录回归登录、活动、托管和主要玩法。
