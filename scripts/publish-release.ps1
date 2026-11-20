param(
  [Parameter(Mandatory=$true)][string]$Version,
  [string]$Tag = '',
  [string]$Repo = 'Faber-god/naruto',
  [string]$Branch = 'main',
  [string]$Notes = '',
  [string]$UpdateZip = '',
  [string]$FullZip = '',
  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

$SourceRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$ReleaseDir = Join-Path $SourceRoot 'dist\releases'
$MessagesPath = Join-Path $SourceRoot 'resources\app\config\messages.json'
$script:Messages = $null

if ([string]::IsNullOrWhiteSpace($Tag)) { $Tag = 'v' + $Version }
if ([string]::IsNullOrWhiteSpace($UpdateZip)) { $UpdateZip = Join-Path $ReleaseDir ('Naruto-Windows-v' + $Version + '-update.zip') }
$UpdateJson = Join-Path $ReleaseDir 'update.json'
if ([string]::IsNullOrWhiteSpace($FullZip)) { $FullZip = Join-Path (Split-Path $SourceRoot -Parent) ('Naruto-Windows-v' + $Version + '-full.zip') }
if ([string]::IsNullOrWhiteSpace($Notes)) { $Notes = 'Naruto-Windows v' + $Version }

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

function Fail([string]$Code) {
  Write-Host (T 'releaseFailed' @{ code = $Code }) -ForegroundColor Red
  exit 1
}

try {
  $script:Messages = [IO.File]::ReadAllText($MessagesPath, [Text.Encoding]::UTF8) | ConvertFrom-Json
} catch {
  $script:Messages = $null
}

if ($Version -notmatch '^\d{1,6}\.\d{1,6}\.\d{1,6}$') { Fail 'invalid-version' }

Write-Host (T 'releaseStart' @{ version = $Version; tag = $Tag })

foreach ($file in @($UpdateZip, $UpdateJson, $FullZip)) {
  if (-not (Test-Path -LiteralPath $file -PathType Leaf)) {
    Fail ('file-missing:' + [IO.Path]::GetFileName($file))
  }
}

try {
  $manifestRaw = [IO.File]::ReadAllText($UpdateJson, [Text.Encoding]::UTF8)
  $manifest = $manifestRaw | ConvertFrom-Json
} catch {
  Fail ('manifest-invalid:' + $_.Exception.Message)
}

if ([string]$manifest.version -ne $Version) {
  Fail ('version-mismatch:' + [string]$manifest.version)
}
if ([IO.Path]::GetFileName($UpdateZip) -ne [string]$manifest.assetName) {
  Fail 'manifest-invalid:asset-name'
}

$actualHash = (Get-FileHash -LiteralPath $UpdateZip -Algorithm SHA256).Hash.ToLowerInvariant()
if ($actualHash -ne ([string]$manifest.sha256).ToLowerInvariant()) {
  Fail ('hash-mismatch:' + $actualHash)
}

if ($DryRun) {
  Write-Host (T 'releaseDryRun' @{ version = $Version; tag = $Tag })
  exit 0
}

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) { Fail 'gh-missing' }

& gh auth status 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
  Write-Host (T 'releaseLoginMissing')
  & gh auth login
  & gh auth status 2>$null | Out-Null
  if ($LASTEXITCODE -ne 0) { Fail 'login-missing' }
}

$releaseJson = & gh release view $Tag --repo $Repo --json isDraft 2>$null
if ($LASTEXITCODE -eq 0) {
  $existing = $releaseJson | ConvertFrom-Json
  if ($existing.isDraft -ne $true) { Fail ('exists-published:' + $Tag) }
  Write-Host (T 'releaseReuseDraft' @{ tag = $Tag })
} else {
  & gh release create $Tag --repo $Repo --draft --target $Branch --title $Tag --notes $Notes
  if ($LASTEXITCODE -ne 0) { Fail ('create:' + $Tag) }
  Write-Host (T 'releaseCreate' @{ tag = $Tag })
}

foreach ($file in @($UpdateZip, $UpdateJson, $FullZip)) {
  Write-Host (T 'releaseUpload' @{ file = [IO.Path]::GetFileName($file) })
}
& gh release upload $Tag --repo $Repo --clobber $UpdateZip $UpdateJson $FullZip
if ($LASTEXITCODE -ne 0) { Fail 'upload' }

$assetNames = & gh release view $Tag --repo $Repo --json assets --jq '.assets[].name'
if ($LASTEXITCODE -ne 0) { Fail 'asset-list' }
foreach ($expected in @([IO.Path]::GetFileName($UpdateZip), 'update.json', [IO.Path]::GetFileName($FullZip))) {
  if (@($assetNames) -notcontains $expected) {
    Fail ('asset-missing:' + $expected)
  }
}

& gh release edit $Tag --repo $Repo --draft=false --latest
if ($LASTEXITCODE -ne 0) { Fail 'publish' }
Write-Host (T 'releasePublish' @{ tag = $Tag })
Write-Host (T 'releaseDone' @{ tag = $Tag })
Write-Host (T 'releaseVerifyUrl' @{ url = ('https://github.com/' + $Repo + '/releases/latest/download/update.json') })
exit 0
