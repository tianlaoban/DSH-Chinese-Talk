# 中文思考 · dsh-chinese-talk

> 作者：dullwine · MIT · v0.1.0

## 功能
注入一条固定 system-prompt 段落：
1. 始终用中文思考与回复，简洁略沾文言，说人话，专有名词不翻译；
2. 只答所问，不主动跑命令，仅必要时附提醒；
3. 极简模式（minimal）下不生效。

## 本地安装
把压缩包拖进deepseek-Harness，对他说`按压缩包里的《给DSH的安装指令.md》帮我装好这个插件， 装完把结果告诉我。`。


以下内容由ai生成。
---
## 安装

把本文件夹解压到任意位置，在该文件夹里执行：

```powershell
powershell -ExecutionPolicy Bypass -File .\install.ps1
```

装完**下一轮对话即生效**，不用重启 GUI（若界面像是没反应，窗口内按 `Ctrl+R`）。
详细步骤见 [安装.md](安装.md)。

## 它是什么

一条 **system prompt section**（全局注册）：没有工具、没有 UI、没有 client 半边、不联网。

| 项 | 值 |
|---|---|
| section 名 | `dsh-chinese-talk:language` |
| order | `10`（紧跟人设段 `deployment:persona-prefix` = 0，早于全部工具说明 ≥ 500） |
| 机制 | `ctx.systemPrompt.section({ name, order, text })`，由 `ctx.effect` 管生死 |
| 覆盖 | 主会话、子代理、工作流子代理（全局 scope 可见） |
| 依赖 | 只需 host 的 `systemPrompt` 服务（DSH 内置） |

**两条刻意不做的**：不用 `dsh-persona` 的保留 section 名（全局注册会撞名并抛错）；
不用 `complete: true`（assemble 会让它独占整个 prompt，且与已有 complete persona ——
例如 minimal preset —— 同时存在时会直接抛错）。

## 改风格

编辑 `index.js` 里的 `TEXT` 常量，改完下一轮生效。
请保持简短：这段每轮请求都要过一遍。

## 临时关掉（不卸载）

在 `%USERPROFILE%\.dsh\profiles\<你的 profile>\cordis.patch.yml` 里加：

```yaml
- id: dsh-chinese-talk
  disabled: true
```

## 卸载

```powershell
# dsh.cmd 的路径按你的安装位置调整（下面这个通常是默认位置）
$dsh = "$env:LOCALAPPDATA\Programs\DeepSeek Harness\resources\runtime\cli\bin\dsh.cmd"
& $dsh plugin --profile desktop remove dsh-chinese-talk
Remove-Item "$env:USERPROFILE\.dsh\plugins\dsh-chinese-talk" -Recurse -Force
```

## 已知边界

- **极简预设（minimal preset）下整条 section 都不生效**（含"只答所问"那一条）：它内嵌的 persona 带
  `complete: true`，`assemble()` 会把最终 prompt 收成那一条，本条被顶掉。任何带 complete persona 的
  preset / 子代理作用域同理。
- **会话标题与压缩摘要不在此列**：它们走各自独立的 prompt。
- 与 `AGENTS.md`、其他人设插件的指令同处一个 prompt；正文末两条已写明优先级与退让规则。

## 许可

MIT，见 [LICENSE](LICENSE)。
