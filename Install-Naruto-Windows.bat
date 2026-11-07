@echo off
setlocal
chcp 65001 >nul
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0Install-Naruto-Windows.ps1"
if errorlevel 1 (
  echo.
  echo A instalacao nao foi concluida. Leia a mensagem acima.
  pause
  exit /b 1
)
echo.
echo Instalacao concluida. Abra Naruto-Windows pelo atalho criado.
pause
