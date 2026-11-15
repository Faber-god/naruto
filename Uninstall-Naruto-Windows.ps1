﻿$ErrorActionPreference = 'Stop'
$InstallDir = $PSScriptRoot
$AppData = Join-Path $env:APPDATA 'Naruto-Windows'
Write-Host '卸载 NARUTO Faber' -ForegroundColor Cyan
$running = Get-Process -Name 'Naruto-Windows' -ErrorAction SilentlyContinue
if ($running) { Write-Host '请先完全退出 Naruto-Windows，再重新运行卸载程序。' -ForegroundColor Red; exit 1 }
$answer = Read-Host '是否卸载程序？账号档案和个人数据会保留。(Y/N)'
if ($answer -notin @('S','s','SIM','sim','Y','y','YES','yes','是')) { exit 0 }
$desktop = [Environment]::GetFolderPath('Desktop')
Remove-Item -LiteralPath (Join-Path $desktop 'NARUTO Faber.lnk') -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath (Join-Path $desktop 'Naruto-Windows.lnk') -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath (Join-Path $env:APPDATA 'Microsoft\Windows\Start Menu\Programs\NARUTO Faber') -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath (Join-Path $env:APPDATA 'Microsoft\Windows\Start Menu\Programs\Naruto-Windows') -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\Naruto-Windows' -Recurse -Force -ErrorAction SilentlyContinue
Write-Host '程序文件将被删除；账号档案和用户数据会保留在 AppData。' -ForegroundColor Green
$quoted = '"' + $InstallDir + '"'
Start-Process -FilePath $env:ComSpec -ArgumentList ('/c timeout /t 2 /nobreak >nul & rmdir /s /q ' + $quoted) -WindowStyle Hidden
