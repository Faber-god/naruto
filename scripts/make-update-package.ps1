param(
  [Parameter(Mandatory=$true)][string]$Version,
  [string]$SourceRoot = '',
  [string]$OutDir = '',
  [string]$MinVersion = '0.0.0',
  [string]$Notes = '',
  [string]$NotesFile = '',
  [string]$Tag = '',
  [string]$Repo = 'Faber-god/naruto',
  [switch]$SkipPatches,
  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

if ([string]::IsNullOrWhiteSpace($SourceRoot)) {
  $SourceRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
}
$SourceRoot = [IO.Path]::GetFullPath($SourceRoot)
if ([string]::IsNullOrWhiteSpace($OutDir)) {
  $OutDir = Join-Path $SourceRoot 'dist\releases'
}
$OutDir = [IO.Path]::GetFullPath($OutDir)
$AppSource = Join-Path $SourceRoot 'resources\app'
$PackagePath = Join-Path $AppSource 'package.json'
$BuildInfoPath = Join-Path $SourceRoot 'build-info.json'
$MessagesPath = Join-Path $AppSource 'config\messages.json'
$script:Messages = $null

function Format-Template([string]$Template, $Vars) {
  $text = [string]$Template
  if ($null -ne $Vars) {
    foreach ($key in $Vars.Keys) {
      $text = $text.Replace('{' + [string]$key + '}', [string]$Vars[$key])
    }
  }
  return $text
}

function T([string]$Key, $Vars) {
  $template = $Key
  if ($null -ne $script:Messages -and $null -ne $script:Messages.logs -and $null -ne $script:Messages.logs.update) {
    $candidate = $script:Messages.logs.update.$Key
    if ($null -ne $candidate -and [string]$candidate -ne '') { $template = [string]$candidate }
  }
  return Format-Template $template $Vars
}

try {
  $script:Messages = ([IO.File]::ReadAllText($MessagesPath, [Text.Encoding]::UTF8) | ConvertFrom-Json)
} catch {
  $script:Messages = $null
}

if ($Version -notmatch '^\d{1,6}\.\d{1,6}\.\d{1,6}$') {
  throw (T 'buildFailed' @{ code = 'invalid-version' })
}
if (-not (Test-Path -LiteralPath $PackagePath)) {
  throw (T 'buildFailed' @{ code = 'package-missing' })
}
$package = [IO.File]::ReadAllText($PackagePath, [Text.Encoding]::UTF8).TrimStart([char]0xFEFF) | ConvertFrom-Json
$buildInfo = $null
if (Test-Path -LiteralPath $BuildInfoPath) {
  $buildInfo = [IO.File]::ReadAllText($BuildInfoPath, [Text.Encoding]::UTF8).TrimStart([char]0xFEFF) | ConvertFrom-Json
}
$buildVersion = if ($null -ne $buildInfo) { [string]$buildInfo.version } else { '' }
if ([string]$package.version -ne $Version -or ($null -ne $buildInfo -and $buildVersion -ne $Version)) {
  throw (T 'buildVersionMismatch' @{ package = [string]$package.version; buildInfo = $buildVersion; expected = $Version })
}
if ([string]::IsNullOrWhiteSpace($Tag)) { $Tag = 'v' + $Version }
if ([string]::IsNullOrWhiteSpace($Notes) -and -not [string]::IsNullOrWhiteSpace($NotesFile)) {
  $Notes = [IO.File]::ReadAllText($NotesFile, [Text.Encoding]::UTF8)
}
if ([string]::IsNullOrWhiteSpace($Notes)) { $Notes = 'Naruto-Windows v' + $Version }

Write-Host (T 'buildStart' @{ version = $Version })
Write-Host (T 'buildPackages' @{ patches = (-not $SkipPatches).ToString().ToLowerInvariant() })
if ($DryRun) {
  Write-Host (T 'buildDryRun' @{ version = $Version })
  exit 0
}

$stage = Join-Path $env:TEMP ('Naruto-Update-' + [Guid]::NewGuid().ToString('N'))
$stageApp = Join-Path $stage 'resources\app'
$stagePatches = Join-Path $stage 'patches'
try {
  [IO.Directory]::CreateDirectory($stageApp) | Out-Null
  & robocopy.exe $AppSource $stageApp @('/E', '/R:2', '/W:1', '/XF', '*.bak', '*.map', '*.log', '*.tmp', '/XD', '.test-artifacts', 'node_modules', '/NFL', '/NDL', '/NJH', '/NJS', '/NP') | Out-Null
  $code = $LASTEXITCODE
  if ($code -ge 8) { throw (T 'buildFailed' @{ code = 'copy-app-' + $code }) }

  if (-not $SkipPatches) {
    $patchesSource = Join-Path $SourceRoot 'patches'
    if (Test-Path -LiteralPath $patchesSource) {
      [IO.Directory]::CreateDirectory($stagePatches) | Out-Null
      & robocopy.exe $patchesSource $stagePatches @('/E', '/R:2', '/W:1', '/XF', '*.log', '*.tmp', '/NFL', '/NDL', '/NJH', '/NJS', '/NP') | Out-Null
      $code = $LASTEXITCODE
      if ($code -ge 8) { throw (T 'buildFailed' @{ code = 'copy-patches-' + $code }) }
    }
  }

  if (Test-Path -LiteralPath $BuildInfoPath) {
    Copy-Item -LiteralPath $BuildInfoPath -Destination (Join-Path $stage 'build-info.json') -Force
  }

  if (-not (Test-Path -LiteralPath (Join-Path $stageApp 'package.json'))) {
    throw (T 'buildFailed' @{ code = 'staged-package-missing' })
  }

  [IO.Directory]::CreateDirectory($OutDir) | Out-Null
  $assetName = 'Naruto-Windows-v' + $Version + '-update.zip'
  $zipPath = Join-Path $OutDir $assetName
  if (Test-Path -LiteralPath $zipPath) { Remove-Item -LiteralPath $zipPath -Force }
  Add-Type -AssemblyName System.IO.Compression.FileSystem
  [IO.Compression.ZipFile]::CreateFromDirectory($stage, $zipPath, [IO.Compression.CompressionLevel]::Optimal, $false)

  $size = (Get-Item -LiteralPath $zipPath).Length
  $sha256 = (Get-FileHash -LiteralPath $zipPath -Algorithm SHA256).Hash.ToLowerInvariant()
  Write-Host (T 'buildZip' @{ path = $zipPath; size = $size })

  $manifest = [ordered]@{
    schema = 1
    version = $Version
    minVersion = $MinVersion
    assetName = $assetName
    url = ('https://github.com/' + $Repo + '/releases/download/' + $Tag + '/' + $assetName)
    size = $size
    sha256 = $sha256
    notes = ([string]$Notes).Trim()
    publishedAt = (Get-Date).ToUniversalTime().ToString('o')
    patchesIncluded = (-not $SkipPatches)
  }
  $manifestPath = Join-Path $OutDir 'update.json'
  $json = $manifest | ConvertTo-Json -Depth 5
  [IO.File]::WriteAllText($manifestPath, $json, (New-Object Text.UTF8Encoding($false)))
  Write-Host (T 'buildManifest' @{ path = $manifestPath; sha256 = $sha256 })
  Write-Host (T 'buildDone' @{ version = $Version })
} finally {
  try { Remove-Item -LiteralPath $stage -Recurse -Force -ErrorAction SilentlyContinue } catch { }
}
