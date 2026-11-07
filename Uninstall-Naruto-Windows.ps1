﻿$ErrorActionPreference = 'Stop'
$InstallDir = $PSScriptRoot
$AppData = Join-Path $env:APPDATA 'Naruto OS'
Write-Host 'Desinstalar Naruto-Windows' -ForegroundColor Cyan
$running = Get-Process -Name 'Naruto-Windows' -ErrorAction SilentlyContinue
if ($running) { Write-Host 'Feche Naruto-Windows e execute a desinstalacao novamente.' -ForegroundColor Red; exit 1 }
$answer = Read-Host 'Remover o programa? Seus perfis e dados pessoais serao preservados. (S/N)'
if ($answer -notin @('S','s','SIM','sim','Y','y','YES','yes')) { exit 0 }
$desktop = [Environment]::GetFolderPath('Desktop')
$startMenu = Join-Path $env:APPDATA 'Microsoft\Windows\Start Menu\Programs\Naruto-Windows'
Remove-Item -LiteralPath (Join-Path $desktop 'Naruto-Windows.lnk') -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath $startMenu -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\Naruto-Windows' -Recurse -Force -ErrorAction SilentlyContinue
Write-Host 'O programa sera removido. Os dados de usuario serao mantidos em AppData.' -ForegroundColor Green
$quoted = '"' + $InstallDir + '"'
Start-Process -FilePath $env:ComSpec -ArgumentList ('/c timeout /t 2 /nobreak >nul & rmdir /s /q ' + $quoted) -WindowStyle Hidden
