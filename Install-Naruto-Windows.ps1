$ErrorActionPreference = 'Stop'
$Host.UI.RawUI.WindowTitle = 'NARUTO Faber 安装程序'
$Source = $PSScriptRoot
$Exe = Join-Path $Source 'Naruto-Windows.exe'
$Version = '1.9.2'
$DefaultInstall = Join-Path $env:LOCALAPPDATA 'Programs\Naruto-Windows'
$Log = Join-Path $env:TEMP 'Naruto-Windows-Install.log'

function Write-Step([string]$Message) { Write-Host $Message -ForegroundColor Cyan }
function Fail([string]$Message) { Write-Host $Message -ForegroundColor Red; throw $Message }

try {
  Write-Host ''
  Write-Host '========================================='
  Write-Host '          NARUTO Faber 安装程序' -ForegroundColor White
  Write-Host '                   v1.9.2' -ForegroundColor DarkGray
  Write-Host '========================================='
  if (-not (Test-Path -LiteralPath $Exe -PathType Leaf)) { Fail '未找到 Naruto-Windows.exe。请先完整解压 ZIP，再运行安装程序。' }
  if (-not [Environment]::Is64BitOperatingSystem) { Fail '此版本需要 64 位 Windows。' }
  $os = Get-CimInstance Win32_OperatingSystem
  if ([version]$os.Version -lt [version]'10.0') { Fail '此版本仅支持 Windows 10 或 Windows 11。' }
  $running = Get-Process -Name 'Naruto-Windows' -ErrorAction SilentlyContinue
  if ($running) { Fail '安装或更新前请先完全退出 Naruto-Windows。' }

  Write-Step "安装源目录：$Source"
  Write-Host "默认安装目录：$DefaultInstall"
  $answer = Read-Host '按回车使用默认目录，或输入其他目录'
  $InstallDir = if ([string]::IsNullOrWhiteSpace($answer)) { $DefaultInstall } else { [Environment]::ExpandEnvironmentVariables($answer.Trim('" ')) }
  if ([string]::IsNullOrWhiteSpace($InstallDir)) { Fail '安装目录无效。' }
  $InstallDir = [IO.Path]::GetFullPath($InstallDir)
  if ($InstallDir.StartsWith($Source, [StringComparison]::OrdinalIgnoreCase)) { Fail '安装目录必须位于解压目录之外。' }

  if (Test-Path -LiteralPath $InstallDir) {
    $confirm = Read-Host '检测到已有安装，是否更新现有文件？(Y/N)'
    if ($confirm -notin @('S','s','SIM','sim','Y','y','YES','yes','是')) { Write-Host '安装已取消。'; exit 0 }
  }
  New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
  Write-Step '正在复制程序与中文补丁...'
  $null = New-Item -ItemType Directory -Force -Path (Split-Path -Parent $Log)
  & robocopy.exe $Source $InstallDir /MIR /R:2 /W:1 /NFL /NDL /NJH /NJS /NP /XF 'Install-Naruto-Windows.bat' 'Install-Naruto-Windows.ps1' 'START-HERE-PT-BR.txt' 'START-HERE-ZH-CN.txt' 2>&1 | Out-File -FilePath $Log -Encoding utf8
  $copyCode = $LASTEXITCODE
  if ($copyCode -ge 8) { Fail "Falha ao copiar os arquivos (codigo $copyCode). Log: $Log" }

  $uninstallBat = Join-Path $InstallDir 'Uninstall-Naruto-Windows.bat'
  $uninstallPs = Join-Path $InstallDir 'Uninstall-Naruto-Windows.ps1'
  $wsh = New-Object -ComObject WScript.Shell
  $desktop = [Environment]::GetFolderPath('Desktop')
  $startMenu = Join-Path $env:APPDATA 'Microsoft\Windows\Start Menu\Programs\NARUTO Faber'
  New-Item -ItemType Directory -Force -Path $startMenu | Out-Null
  Remove-Item -LiteralPath (Join-Path $desktop 'Naruto-Windows.lnk') -Force -ErrorAction SilentlyContinue
  Remove-Item -LiteralPath (Join-Path $env:APPDATA 'Microsoft\Windows\Start Menu\Programs\Naruto-Windows') -Recurse -Force -ErrorAction SilentlyContinue
  $shortcutIcon = Join-Path $InstallDir 'resources\app\assets\app-icon.ico'
  if (-not (Test-Path $shortcutIcon)) { $shortcutIcon = (Join-Path $InstallDir 'Naruto-Windows.exe') + ',0' }
  foreach ($shortcutPath in @((Join-Path $desktop 'NARUTO Faber.lnk'), (Join-Path $startMenu 'NARUTO Faber.lnk'))) {
    $shortcut = $wsh.CreateShortcut($shortcutPath)
    $shortcut.TargetPath = Join-Path $InstallDir 'Naruto-Windows.exe'
    $shortcut.WorkingDirectory = $InstallDir
    $shortcut.IconLocation = $shortcutIcon
    $shortcut.Description = 'NARUTO Faber 巴西服中文客户端'
    $shortcut.Save()
  }
  $uninstallKey = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\Naruto-Windows'
  New-Item -Path $uninstallKey -Force | Out-Null
  New-ItemProperty -Path $uninstallKey -Name DisplayName -Value 'NARUTO Faber' -PropertyType String -Force | Out-Null
  New-ItemProperty -Path $uninstallKey -Name DisplayVersion -Value $Version -PropertyType String -Force | Out-Null
  New-ItemProperty -Path $uninstallKey -Name InstallLocation -Value $InstallDir -PropertyType String -Force | Out-Null
  $displayIcon = Join-Path $InstallDir 'resources\app\assets\app-icon.ico'
  if (-not (Test-Path $displayIcon)) { $displayIcon = Join-Path $InstallDir 'Naruto-Windows.exe' }
  New-ItemProperty -Path $uninstallKey -Name DisplayIcon -Value $displayIcon -PropertyType String -Force | Out-Null
  New-ItemProperty -Path $uninstallKey -Name UninstallString -Value ('"' + $uninstallBat + '"') -PropertyType String -Force | Out-Null
  New-ItemProperty -Path $uninstallKey -Name NoModify -Value 1 -PropertyType DWord -Force | Out-Null
  New-ItemProperty -Path $uninstallKey -Name NoRepair -Value 1 -PropertyType DWord -Force | Out-Null

  Write-Host ''
  Write-Host '安装完成。' -ForegroundColor Green
  Write-Host "安装位置：$InstallDir"
  Write-Host '已在桌面和开始菜单创建快捷方式。'
  Write-Host '账号档案和用户数据保存在 AppData，卸载程序不会自动删除。'
  $launch = Read-Host '现在启动 Naruto-Windows 吗？(Y/N)'
  if ($launch -in @('S','s','SIM','sim','Y','y','YES','yes')) { Start-Process -FilePath (Join-Path $InstallDir 'Naruto-Windows.exe') -WorkingDirectory $InstallDir }
  exit 0
} catch {
  Write-Host ''
  Write-Host ('错误：' + $_.Exception.Message) -ForegroundColor Red
  Write-Host "日志：$Log"
  exit 1
}
