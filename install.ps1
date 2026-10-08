<#
  install.ps1 - 把本目录这个插件真正装进 DSH 自己那儿（不联网、不下载、不要管理员）。

  它做两件事：
    1) 把本目录的文件**复制**到  %USERPROFILE%\.dsh\plugins\dsh-chinese-talk\
    2) 用官方 CLI 以 link 方式挂进 profile，link 指向上面那个目录

  所以装完之后，**解压出来的这份可以随手删**，插件不受影响。

  用法：
    powershell -ExecutionPolicy Bypass -File .\install.ps1
    powershell -ExecutionPolicy Bypass -File .\install.ps1 -Profile web    # 换 profile
    powershell -ExecutionPolicy Bypass -File .\install.ps1 -DryRun         # 只检查，什么都不动
    powershell -ExecutionPolicy Bypass -File .\install.ps1 -Force          # 目标已存在时覆盖（旧目录先备份）
#>
param(
  [string]$Profile = 'desktop',
  [switch]$DryRun,
  [switch]$Force
)

$ErrorActionPreference = 'Stop'

$here   = (Resolve-Path -LiteralPath $PSScriptRoot).Path
$name   = 'dsh-chinese-talk'
$target = Join-Path $env:USERPROFILE (Join-Path '.dsh\plugins' $name)

if (-not (Test-Path -LiteralPath (Join-Path $here 'package.json'))) {
  throw "未找到 package.json —— 请把本脚本和插件文件放在同一目录（当前：$here）"
}

Write-Host '正在查找 dsh.cmd ...'
$candidates = @(
  (Join-Path $env:LOCALAPPDATA 'Programs\DeepSeek Harness\resources\runtime\cli\bin\dsh.cmd'),
  (Join-Path $env:ProgramFiles 'DeepSeek Harness\resources\runtime\cli\bin\dsh.cmd'),
  (Join-Path ${env:ProgramFiles(x86)} 'DeepSeek Harness\resources\runtime\cli\bin\dsh.cmd')
) | Where-Object { $_ -and (Test-Path -LiteralPath $_) }

$dsh = $candidates | Select-Object -First 1
if (-not $dsh) {
  $cmd = Get-Command dsh -ErrorAction SilentlyContinue
  if ($cmd) { $dsh = $cmd.Source }
}
if (-not $dsh) {
  throw '找不到 dsh.cmd —— 请确认 DSH 已安装，或把 dsh 加入 PATH 后重试。'
}

$sameFolder = ($here.TrimEnd('\') -ieq $target.TrimEnd('\'))
$spec = 'link:' + ($target -replace '\\', '/')

Write-Host ('dsh        : ' + $dsh)
Write-Host ('profile    : ' + $Profile)
Write-Host ('插件落点   : ' + $target)
Write-Host ('注册为     : ' + $spec)
if ($sameFolder) { Write-Host '（当前目录就是插件落点，跳过复制这一步）' }
Write-Host ''

if ($DryRun) {
  Write-Host '-DryRun：以上内容就是将要执行的动作，本次什么都不做。'
  exit 0
}

if (-not $sameFolder) {
  if (Test-Path -LiteralPath $target) {
    if (-not $Force) {
      throw ("目标已存在：$target`n确认覆盖就加 -Force（旧目录会先备份成 *.bak-<时间戳>）。")
    }
    $bak = $target + '.bak-' + (Get-Date -Format 'yyyyMMddHHmmss')
    Move-Item -LiteralPath $target -Destination $bak
    Write-Host ('旧目录已备份到：' + $bak)
  }
  New-Item -ItemType Directory -Force -Path $target | Out-Null
  Get-ChildItem -LiteralPath $here -File |
    Where-Object { $_.Name -notlike '*.bak-*' -and $_.Name -ne 'last-run.log' } |
    Copy-Item -Destination $target -Force
  Write-Host ('插件文件已复制到：' + $target)
}

& $dsh plugin --profile $Profile add $spec
$code = $LASTEXITCODE
if ($code -ne 0) { throw ('安装失败，dsh 退出码 ' + $code) }

Write-Host ''
Write-Host 'done - 下一轮对话即生效（无需重启 GUI）。'
Write-Host ('解压出来的那份现在可以删了；插件在这里：' + $target)
Write-Host ('卸载：dsh plugin --profile ' + $Profile + ' remove ' + $name)
