@echo off
setlocal
chcp 65001 >nul
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0Install-Naruto-Windows.ps1"
if errorlevel 1 (
  echo.
  echo 安装未完成，请查看上方错误信息。
  pause
  exit /b 1
)
echo.
echo 安装完成。请使用桌面或开始菜单中的 Naruto-Windows 快捷方式启动。
pause
