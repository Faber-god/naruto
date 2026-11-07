$ErrorActionPreference = 'Stop'
$Host.UI.RawUI.WindowTitle = 'Instalador Naruto-Windows'
$Source = $PSScriptRoot
$Exe = Join-Path $Source 'Naruto-Windows.exe'
$Version = '1.2.1'
$DefaultInstall = Join-Path $env:LOCALAPPDATA 'Programs\Naruto-Windows'
$Log = Join-Path $env:TEMP 'Naruto-Windows-Install.log'

function Write-Step([string]$Message) { Write-Host $Message -ForegroundColor Cyan }
function Fail([string]$Message) { Write-Host $Message -ForegroundColor Red; throw $Message }

try {
  Write-Host ''
  Write-Host '========================================='
  Write-Host '       Naruto-Windows - Instalacao' -ForegroundColor White
  Write-Host '========================================='
  if (-not (Test-Path -LiteralPath $Exe -PathType Leaf)) { Fail 'Nao encontrei Naruto-Windows.exe. Extraia o ZIP completo e execute este instalador dentro da pasta extraida.' }
  if (-not [Environment]::Is64BitOperatingSystem) { Fail 'Esta versao requer Windows de 64 bits.' }
  $os = Get-CimInstance Win32_OperatingSystem
  if ([version]$os.Version -lt [version]'10.0') { Fail 'Esta versao foi preparada para Windows 10 ou Windows 11.' }
  $running = Get-Process -Name 'Naruto-Windows' -ErrorAction SilentlyContinue
  if ($running) { Fail 'Feche Naruto-Windows antes de instalar ou atualizar.' }

  Write-Step "Pasta de origem: $Source"
  Write-Host "Pasta de instalacao padrao: $DefaultInstall"
  $answer = Read-Host 'Pressione ENTER para usar o local padrao ou digite outra pasta'
  $InstallDir = if ([string]::IsNullOrWhiteSpace($answer)) { $DefaultInstall } else { [Environment]::ExpandEnvironmentVariables($answer.Trim('" ')) }
  if ([string]::IsNullOrWhiteSpace($InstallDir)) { Fail 'Pasta de instalacao invalida.' }
  $InstallDir = [IO.Path]::GetFullPath($InstallDir)
  if ($InstallDir.StartsWith($Source, [StringComparison]::OrdinalIgnoreCase)) { Fail 'Escolha uma pasta de instalacao fora da pasta de arquivos extraidos.' }

  if (Test-Path -LiteralPath $InstallDir) {
    $confirm = Read-Host 'Ja existe uma instalacao. Deseja atualizar os arquivos? (S/N)'
    if ($confirm -notin @('S','s','SIM','sim','Y','y','YES','yes')) { Write-Host 'Instalacao cancelada.'; exit 0 }
  }
  New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
  Write-Step 'Copiando arquivos do programa...'
  $null = New-Item -ItemType Directory -Force -Path (Split-Path -Parent $Log)
  & robocopy.exe $Source $InstallDir /MIR /R:2 /W:1 /NFL /NDL /NJH /NJS /NP /XF 'Install-Naruto-Windows.bat' 'Install-Naruto-Windows.ps1' 'START-HERE-PT-BR.txt' 'START-HERE-ZH-CN.txt' 2>&1 | Out-File -FilePath $Log -Encoding utf8
  $copyCode = $LASTEXITCODE
  if ($copyCode -ge 8) { Fail "Falha ao copiar os arquivos (codigo $copyCode). Log: $Log" }

  $uninstallBat = Join-Path $InstallDir 'Uninstall-Naruto-Windows.bat'
  $uninstallPs = Join-Path $InstallDir 'Uninstall-Naruto-Windows.ps1'
  $wsh = New-Object -ComObject WScript.Shell
  $desktop = [Environment]::GetFolderPath('Desktop')
  $startMenu = Join-Path $env:APPDATA 'Microsoft\Windows\Start Menu\Programs\Naruto-Windows'
  New-Item -ItemType Directory -Force -Path $startMenu | Out-Null
  foreach ($shortcutPath in @((Join-Path $desktop 'Naruto-Windows.lnk'), (Join-Path $startMenu 'Naruto-Windows.lnk'))) {
    $shortcut = $wsh.CreateShortcut($shortcutPath)
    $shortcut.TargetPath = Join-Path $InstallDir 'Naruto-Windows.exe'
    $shortcut.WorkingDirectory = $InstallDir
    $shortcut.IconLocation = (Join-Path $InstallDir 'Naruto-Windows.exe') + ',0'
    $shortcut.Description = 'Naruto-Windows - servidor BR'
    $shortcut.Save()
  }
  $uninstallKey = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\Naruto-Windows'
  New-Item -Path $uninstallKey -Force | Out-Null
  New-ItemProperty -Path $uninstallKey -Name DisplayName -Value 'Naruto-Windows' -PropertyType String -Force | Out-Null
  New-ItemProperty -Path $uninstallKey -Name DisplayVersion -Value $Version -PropertyType String -Force | Out-Null
  New-ItemProperty -Path $uninstallKey -Name InstallLocation -Value $InstallDir -PropertyType String -Force | Out-Null
  New-ItemProperty -Path $uninstallKey -Name DisplayIcon -Value (Join-Path $InstallDir 'Naruto-Windows.exe') -PropertyType String -Force | Out-Null
  New-ItemProperty -Path $uninstallKey -Name UninstallString -Value ('"' + $uninstallBat + '"') -PropertyType String -Force | Out-Null
  New-ItemProperty -Path $uninstallKey -Name NoModify -Value 1 -PropertyType DWord -Force | Out-Null
  New-ItemProperty -Path $uninstallKey -Name NoRepair -Value 1 -PropertyType DWord -Force | Out-Null

  Write-Host ''
  Write-Host 'Instalacao concluida!' -ForegroundColor Green
  Write-Host "Local: $InstallDir"
  Write-Host 'Um atalho foi criado na Area de Trabalho e no Menu Iniciar.'
  Write-Host 'Seus dados e perfis ficam na pasta AppData e nao serao apagados ao desinstalar.'
  $launch = Read-Host 'Deseja abrir Naruto-Windows agora? (S/N)'
  if ($launch -in @('S','s','SIM','sim','Y','y','YES','yes')) { Start-Process -FilePath (Join-Path $InstallDir 'Naruto-Windows.exe') -WorkingDirectory $InstallDir }
  exit 0
} catch {
  Write-Host ''
  Write-Host ('ERRO: ' + $_.Exception.Message) -ForegroundColor Red
  Write-Host "Log: $Log"
  exit 1
}
