param(
  [Parameter(Mandatory=$true)][string]$JobPath
)

$ErrorActionPreference = 'Stop'
$script:Job = $null
$script:Messages = $null
$script:LogPath = $null
$script:AppBackup = $null
$script:PatchesBackup = $null
$script:PatchesReplaced = $false
$script:RolledBack = $false

function Read-JsonFile([string]$Path) {
  $raw = [IO.File]::ReadAllText($Path, [Text.Encoding]::UTF8)
  return $raw | ConvertFrom-Json
}

function Format-Template([string]$Template, $Vars) {
  $text = [string]$Template
  if ($null -ne $Vars) {
    foreach ($key in $Vars.Keys) {
      $text = $text.Replace('{' + [string]$key + '}', [string]$Vars[$key])
    }
  }
  return $text
}

function Get-UiText([string]$Key, $Vars) {
  $value = $Key
  if ($null -ne $script:Messages -and $null -ne $script:Messages.ui -and $null -ne $script:Messages.ui.update) {
    $candidate = $script:Messages.ui.update.$Key
    if ($null -ne $candidate -and [string]$candidate -ne '') { $value = [string]$candidate }
  }
  return Format-Template $value $Vars
}

function Write-UpdateLog([string]$Key, $Vars) {
  if ([string]::IsNullOrWhiteSpace($script:LogPath)) { return }
  $template = $Key
  if ($null -ne $script:Messages -and $null -ne $script:Messages.logs -and $null -ne $script:Messages.logs.update) {
    $candidate = $script:Messages.logs.update.$Key
    if ($null -ne $candidate -and [string]$candidate -ne '') { $template = [string]$candidate }
  }
  $line = '[' + (Get-Date).ToUniversalTime().ToString('o') + '] ' + (Format-Template $template $Vars)
  try {
    $parent = [IO.Path]::GetDirectoryName($script:LogPath)
    if (-not [IO.Directory]::Exists($parent)) { [IO.Directory]::CreateDirectory($parent) | Out-Null }
    [IO.File]::AppendAllText($script:LogPath, $line + [Environment]::NewLine, [Text.Encoding]::UTF8)
  } catch {
  }
}

function Test-ChildPath([string]$Child, [string]$Parent) {
  $childPath = [IO.Path]::GetFullPath($Child)
  $parentPath = [IO.Path]::GetFullPath($Parent).TrimEnd('\') + '\'
  return $childPath.StartsWith($parentPath, [StringComparison]::OrdinalIgnoreCase)
}

function Write-ResultFile([bool]$Ok, [string]$Code, [string]$Detail, [bool]$RolledBack) {
  $value = @{
    ok = $Ok
    version = [string]$script:Job.version
    installedAt = (Get-Date).ToUniversalTime().ToString('o')
    code = $Code
    detail = $Detail
    rolledBack = $RolledBack
    backupPath = [string]$script:AppBackup
    patchesUpdated = $script:PatchesReplaced
  }
  $json = $value | ConvertTo-Json -Compress
  [IO.File]::WriteAllText([string]$script:Job.resultPath, $json, (New-Object Text.UTF8Encoding($false)))
}

function Invoke-Robocopy([string]$Source, [string]$Destination, [string[]]$Options) {
  & robocopy.exe $Source $Destination @Options | Out-Null
  return $LASTEXITCODE
}

function Restore-Backup {
  if ($script:RolledBack) { return }
  $didRestore = $false
  try {
    if (-not [string]::IsNullOrWhiteSpace($script:AppBackup) -and (Test-Path -LiteralPath $script:AppBackup)) {
      Write-UpdateLog 'helperRollback' @{ reason = 'restore-app' }
      $code = Invoke-Robocopy $script:AppBackup ([string]$script:Job.appDir) @('/MIR', '/R:1', '/W:1', '/NFL', '/NDL', '/NJH', '/NJS', '/NP')
      if ($code -lt 8) { $didRestore = $true } else { Write-UpdateLog 'helperRollback' @{ reason = 'app-restore-failed-' + $code } }
    }
    if ($script:PatchesReplaced -and -not [string]::IsNullOrWhiteSpace($script:PatchesBackup) -and (Test-Path -LiteralPath $script:PatchesBackup)) {
      Write-UpdateLog 'helperRollback' @{ reason = 'restore-patches' }
      $code = Invoke-Robocopy $script:PatchesBackup ([string]$script:Job.patchesDir) @('/MIR', '/R:1', '/W:1', '/NFL', '/NDL', '/NJH', '/NJS', '/NP')
      if ($code -lt 8) { $didRestore = $true } else { Write-UpdateLog 'helperRollback' @{ reason = 'patches-restore-failed-' + $code } }
    }
  } catch {
    Write-UpdateLog 'helperRollback' @{ reason = 'exception-' + $_.Exception.Message }
  }
  $script:RolledBack = $didRestore
}

function Stop-Install([string]$Code, [string]$Detail) {
  Write-UpdateLog 'helperFailed' @{ code = $Code; detail = $Detail }
  Restore-Backup
  Write-ResultFile $false $Code $Detail $script:RolledBack
  try {
    if (Test-Path -LiteralPath ([string]$script:Job.exePath)) {
      Start-Process -FilePath ([string]$script:Job.exePath) -WorkingDirectory ([string]$script:Job.installRoot) | Out-Null
    }
  } catch {
  }
  exit 1
}

try {
  $script:Job = Read-JsonFile $JobPath
  $script:LogPath = [string]$script:Job.logPath
  if (-not [string]::IsNullOrWhiteSpace([string]$script:Job.messagesPath)) {
    try { $script:Messages = Read-JsonFile ([string]$script:Job.messagesPath) } catch { $script:Messages = $null }
  }
  Write-UpdateLog 'helperStart' @{ version = $script:Job.version; root = $script:Job.installRoot }
  if ($script:Job.schema -ne 1) { Stop-Install 'install_failed' 'unsupported-job-schema' }
  $installRoot = [IO.Path]::GetFullPath([string]$script:Job.installRoot)
  $appDir = [IO.Path]::GetFullPath([string]$script:Job.appDir)
  $patchesDir = [IO.Path]::GetFullPath([string]$script:Job.patchesDir)
  $updatesRoot = [IO.Path]::GetFullPath([string]$script:Job.updatesRoot)
  $zipPath = [IO.Path]::GetFullPath([string]$script:Job.zipPath)
  if (-not (Test-ChildPath $appDir $installRoot)) { Stop-Install 'install_failed' 'app-outside-install-root' }
  if (-not (Test-ChildPath $patchesDir $installRoot)) { Stop-Install 'install_failed' 'patches-outside-install-root' }
  if (-not (Test-ChildPath $zipPath $updatesRoot)) { Stop-Install 'install_failed' 'zip-outside-updates-root' }
  if (-not (Test-Path -LiteralPath $zipPath)) { Stop-Install 'install_failed' 'zip-missing' }

  Write-UpdateLog 'helperWait' @{ pid = $script:Job.pid }
  $deadline = (Get-Date).AddSeconds(60)
  while ($null -ne (Get-Process -Id ([int]$script:Job.pid) -ErrorAction SilentlyContinue)) {
    if ((Get-Date) -gt $deadline) {
      Write-UpdateLog 'helperStillRunning' @{ pid = $script:Job.pid }
      Write-ResultFile $false 'install_failed' 'still-running' $false
      exit 10
    }
    Start-Sleep -Milliseconds 500
  }

  $free = 0
  try {
    $drive = (Get-Item -LiteralPath $installRoot).PSDrive
    $free = [int64]$drive.Free
  } catch {
  }
  $required = [int64]$script:Job.size * 3 + 104857600
  Write-UpdateLog 'helperDisk' @{ free = $free; required = $required }
  if ($free -gt 0 -and $free -lt $required) { Stop-Install 'disk_full' 'insufficient-free-space' }

  $actualHash = (Get-FileHash -LiteralPath $zipPath -Algorithm SHA256).Hash.ToLowerInvariant()
  Write-UpdateLog 'helperZipHash' @{ expected = $script:Job.sha256; actual = $actualHash }
  if ($actualHash -ne ([string]$script:Job.sha256).ToLowerInvariant()) { Stop-Install 'hash_mismatch' 'archive-hash-mismatch' }

  Add-Type -AssemblyName System.IO.Compression.FileSystem
  $extractRoot = Join-Path $updatesRoot ([string]$script:Job.version + '\extract-' + [Guid]::NewGuid().ToString('N'))
  [IO.Directory]::CreateDirectory($extractRoot) | Out-Null
  $zip = [IO.Compression.ZipFile]::OpenRead($zipPath)
  $seen = @{}
  $totalBytes = [int64]0
  $entryCount = 0
  try {
    foreach ($entry in $zip.Entries) {
      $entryCount += 1
      if ($entryCount -gt 20000) { throw 'zip-entry-limit' }
      $name = $entry.FullName -replace '\\', '/'
      if ([string]::IsNullOrWhiteSpace($name)) { throw 'zip-empty-entry' }
      if ($name.StartsWith('/')) { throw 'zip-absolute-entry' }
      if ($name -match '^[A-Za-z]:') { throw 'zip-drive-entry' }
      $segments = $name.Split('/')
      if ($segments -contains '..') { throw 'zip-traversal-entry' }
      $key = $name.ToLowerInvariant()
      if ($seen.ContainsKey($key)) { throw 'zip-duplicate-entry' }
      $seen[$key] = $true
      $isDirectory = $name.EndsWith('/')
      $destination = [IO.Path]::GetFullPath((Join-Path $extractRoot $name))
      if (-not (Test-ChildPath $destination $extractRoot)) { throw 'zip-outside-root' }
      if ($isDirectory) {
        [IO.Directory]::CreateDirectory($destination) | Out-Null
        continue
      }
      if ($entry.Length -gt 314572800) { throw 'zip-entry-too-large' }
      $totalBytes += [int64]$entry.Length
      if ($totalBytes -gt 524288000) { throw 'zip-total-too-large' }
      if ($entry.CompressedLength -gt 0 -and ([double]$entry.Length / [double]$entry.CompressedLength) -gt 1000) { throw 'zip-ratio-too-large' }
      if (($entry.ExternalAttributes -band 0x400) -ne 0) { throw 'zip-reparse-entry' }
      $parent = [IO.Path]::GetDirectoryName($destination)
      if (-not [IO.Directory]::Exists($parent)) { [IO.Directory]::CreateDirectory($parent) | Out-Null }
      if ([IO.File]::Exists($destination)) { throw 'zip-overwrite-entry' }
      [IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $destination, $false)
    }
  } catch {
    $zip.Dispose()
    Write-UpdateLog 'helperZipReject' @{ entry = ''; reason = $_.Exception.Message }
    Stop-Install 'install_failed' ('zip-rejected-' + $_.Exception.Message)
  }
  $zip.Dispose()
  Write-UpdateLog 'helperExtract' @{ entries = $entryCount; bytes = $totalBytes }

  $newApp = Join-Path $extractRoot 'resources\app'
  $newPackage = Join-Path $newApp 'package.json'
  if (-not (Test-Path -LiteralPath $newPackage)) { Stop-Install 'install_failed' 'payload-app-missing' }
  $package = Read-JsonFile $newPackage
  if ([string]$package.version -ne [string]$script:Job.version) {
    Stop-Install 'install_failed' ('payload-version-' + [string]$package.version)
  }

  $stamp = (Get-Date).ToUniversalTime().ToString('yyyyMMdd-HHmmss')
  $backupDir = Join-Path ([string]$script:Job.backupRoot) ([string]$script:Job.version + '-' + $stamp)
  $script:AppBackup = Join-Path $backupDir 'resources-app'
  [IO.Directory]::CreateDirectory($backupDir) | Out-Null
  Write-UpdateLog 'helperBackup' @{ path = $script:AppBackup }
  $code = Invoke-Robocopy $appDir $script:AppBackup @('/E', '/COPY:DAT', '/R:2', '/W:1', '/NFL', '/NDL', '/NJH', '/NJS', '/NP')
  if ($code -ge 8) {
    $script:AppBackup = $null
    Stop-Install 'install_failed' ('backup-failed-' + $code)
  }

  $newPatches = Join-Path $extractRoot 'patches'
  if ([bool]$script:Job.patchesIncluded -and (Test-Path -LiteralPath $newPatches)) {
    $script:PatchesBackup = Join-Path $backupDir 'patches'
    if (Test-Path -LiteralPath $patchesDir) {
      $code = Invoke-Robocopy $patchesDir $script:PatchesBackup @('/E', '/COPY:DAT', '/R:2', '/W:1', '/NFL', '/NDL', '/NJH', '/NJS', '/NP')
      if ($code -ge 8) {
        $script:PatchesBackup = $null
        Stop-Install 'install_failed' ('patches-backup-failed-' + $code)
      }
    }
  }

  Write-UpdateLog 'helperApplyApp' @{ target = $appDir }
  $code = Invoke-Robocopy $newApp $appDir @('/MIR', '/R:1', '/W:1', '/XF', '*.log', '*.tmp', '*.bak', '/XD', '.test-artifacts', '/NFL', '/NDL', '/NJH', '/NJS', '/NP')
  if ($code -ge 8) { Stop-Install 'install_failed' ('apply-app-failed-' + $code) }

  if ([bool]$script:Job.patchesIncluded -and (Test-Path -LiteralPath $newPatches)) {
    [IO.Directory]::CreateDirectory($patchesDir) | Out-Null
    $script:PatchesReplaced = $true
    Write-UpdateLog 'helperApplyPatches' @{ target = $patchesDir }
    $code = Invoke-Robocopy $newPatches $patchesDir @('/E', '/R:1', '/W:1', '/XF', '*.log', '*.tmp', '/NFL', '/NDL', '/NJH', '/NJS', '/NP')
    if ($code -ge 8) { Stop-Install 'install_failed' ('apply-patches-failed-' + $code) }
  }

  $buildInfo = Join-Path $extractRoot 'build-info.json'
  if (Test-Path -LiteralPath $buildInfo) {
    try { Copy-Item -LiteralPath $buildInfo -Destination (Join-Path $installRoot 'build-info.json') -Force } catch { }
  }
  $installed = Read-JsonFile (Join-Path $appDir 'package.json')
  if ([string]$installed.version -ne [string]$script:Job.version) {
    Stop-Install 'install_failed' ('installed-version-' + [string]$installed.version)
  }
  try {
    $uninstallKey = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\Naruto-Windows'
    if (Test-Path -LiteralPath $uninstallKey) {
      Set-ItemProperty -LiteralPath $uninstallKey -Name DisplayVersion -Value ([string]$script:Job.version)
    }
  } catch {
  }

  Write-UpdateLog 'helperSuccess' @{ version = $script:Job.version }
  Write-ResultFile $true '' '' $false
  try {
    Remove-Item -LiteralPath $zipPath -Force -ErrorAction SilentlyContinue
    Remove-Item -LiteralPath $extractRoot -Recurse -Force -ErrorAction SilentlyContinue
  } catch {
  }
  try {
    $backups = Get-ChildItem -LiteralPath ([string]$script:Job.backupRoot) -Directory -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending
    if ($backups) {
      $index = 0
      foreach ($item in $backups) {
        $index += 1
        if ($index -gt 2) { Remove-Item -LiteralPath $item.FullName -Recurse -Force -ErrorAction SilentlyContinue }
      }
    }
  } catch {
  }
  Write-UpdateLog 'helperRelaunch' @{ exe = $script:Job.exePath }
  Start-Process -FilePath ([string]$script:Job.exePath) -WorkingDirectory ([string]$script:Job.installRoot) | Out-Null
  exit 0
} catch {
  if ($script:Job -eq $null) { exit 1 }
  Stop-Install 'install_failed' $_.Exception.Message
}
