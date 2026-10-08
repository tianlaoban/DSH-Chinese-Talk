# 给 DSH 的安装指令（dsh-chinese-talk）

> 本文件是给 **DSH agent** 看的：用户把本插件包（zip）发给你，请你替他装好。
> 面向人的说明在 `安装.md`；这份把步骤写死到可执行，并点名一个必须避开的坑。

## 你要做的事

1. **解包**：解压用户发来的 `dsh-chinese-talk-share.zip`（Windows：`Expand-Archive`），
   里面是顶层目录 `dsh-chinese-talk\`。解压到哪儿都行（临时目录即可）。

2. **复制进 DSH 自己的插件目录**（关键：不要只是指向解压目录）：
   ```
   %USERPROFILE%\.dsh\plugins\dsh-chinese-talk\
   ```
   - 目标已存在时：先重命名成 `dsh-chinese-talk.bak-<时间戳>` 再复制，别直接抹掉。
   - 复制的是目录里的**文件**（插件是扁平的，没有子目录）。

3. **确定 profile 名**：列 `%USERPROFILE%\.dsh\profiles\` 下的目录名 ——
   桌面版一般叫 `desktop`，web 版可能是 `web`。用真实存在的那个。

4. **注册进 profile**（官方 CLI，`link:` 指向**第 2 步那个目录**）：
   ```powershell
   $dsh = "$env:LOCALAPPDATA\Programs\DeepSeek Harness\resources\runtime\cli\bin\dsh.cmd"
   & $dsh plugin --profile desktop add "link:$env:USERPROFILE\.dsh\plugins\dsh-chinese-talk"
   ```
   `dsh.cmd` 不在那儿就去 DSH 安装目录下找 `resources\runtime\cli\bin\dsh.cmd`；
   也可以直接跑包里的 `install.ps1` —— 它已经按这个顺序做（支持 `-Profile` / `-DryRun` / `-Force`）。

5. **验证**（任一即可，建议都做）：
   - `& $dsh plugin --profile desktop list` 里能看到 `dsh-chinese-talk`；
   - 对 `%USERPROFILE%\.dsh\plugins\dsh-chinese-talk\index.js` 跑 `node --check` 通过；
   - 让用户开**新的一轮**对话，看回复是否变成中文腔（简洁、略沾文言、说人话）。

6. **收尾与回报**：告诉用户"解压出来的那份可以删了"；回报装到哪个 profile、
   插件目录路径、验证结果。失败就把命令原文与退出码贴出来。

## 必须注意

- **不要从 npm registry 装**：registry 上的同名包与本插件无关（同名不同项目有过先例）。
  只能用本地 `link:`，而且必须指向 `%USERPROFILE%\.dsh\plugins\dsh-chinese-talk`，
  **不要指向用户的解压目录** —— 否则用户一删解压目录，插件就断链了。
- **不需要 git、不需要联网下载依赖、不需要管理员权限**。命令要提权就说明方式错了。
- **不要改 DSH 的安装目录**（`app.asar` 之类）。本插件只做两件事：放一个插件目录、
  往 profile 里加一条记录。
- 装好**下一轮对话即生效**，无需重启 GUI；界面像是没反应就让用户按 `Ctrl+R`。
- 别替用户改插件风格文本，除非他明确要求（那在 `index.js` 的 `TEXT` 常量里）。

## 这插件是什么（一句话）

一条**全局** system prompt section（`dsh-chinese-talk:language`，order `10`）：
让所有会话的思考与交付用中文，专有名词保留英文原形。
只依赖 host 的 `systemPrompt` 服务 —— 无 client 半边、无二进制、无网络请求。
已知边界：**极简预设（minimal）下不生效**（那个 preset 的 persona 带 `complete: true`，
会把整个 prompt 换成它自己那一条）；会话标题与压缩摘要也不归它管。
