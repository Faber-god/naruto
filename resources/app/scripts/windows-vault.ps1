param([Parameter(Mandatory=$true)][string]$Root, [Parameter(Mandatory=$true)][string]$Service)
$ErrorActionPreference = 'Stop'
try {
  [Console]::InputEncoding = New-Object System.Text.UTF8Encoding($false)
  [Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)
  Add-Type -AssemblyName System.Security
  $sha = [Security.Cryptography.SHA256]::Create()
  $serviceHash = [BitConverter]::ToString($sha.ComputeHash([Text.Encoding]::UTF8.GetBytes($Service))).Replace('-', '').ToLowerInvariant()
  $request = [Console]::In.ReadToEnd() | ConvertFrom-Json
  if ($Service -notmatch '^(cn\.youye\.naruto-os\.(credentials|sessions)|cn\.youye\.naruto-os\.test\.[a-zA-Z0-9.-]+)$') { throw 'invalid' }
  $dir = Join-Path (Join-Path $Root 'vault') $serviceHash
  $file = Join-Path $dir 'vault.dat'
  if ($request.action -eq 'read' -or $request.action -eq 'list-partitions') {
    $value = '[]'
    if (Test-Path -LiteralPath $file) {
      $cipher = [IO.File]::ReadAllBytes($file)
      $plain = [Security.Cryptography.ProtectedData]::Unprotect($cipher, $null, [Security.Cryptography.DataProtectionScope]::CurrentUser)
      $value = [Text.Encoding]::UTF8.GetString($plain)
    }
    if ($request.action -eq 'list-partitions') {
      if ($value -eq '[]') { $value = '[]' }
      else {
        $parsed = ConvertFrom-Json -InputObject $value
      }
      if ($value -ne '[]') {
        if ($parsed.version -ne 1 -or $null -eq $parsed.partitions) { throw 'invalid' }
        $keys = @($parsed.partitions.PSObject.Properties.Name | Sort-Object)
        if ($keys | Where-Object { $_ -notmatch '^persist:naruto-(br|cn)-[1-9][0-9]*$' }) { throw 'invalid' }
        $value = ConvertTo-Json -InputObject $keys -Compress
      }
    }
    @{ ok = $true; value = $value } | ConvertTo-Json -Compress
  } elseif ($request.action -eq 'write' -and $null -ne $request.value) {
    $plain = [Text.Encoding]::UTF8.GetBytes([string]$request.value)
    $cipher = [Security.Cryptography.ProtectedData]::Protect($plain, $null, [Security.Cryptography.DataProtectionScope]::CurrentUser)
    [IO.Directory]::CreateDirectory($dir) | Out-Null
    $tmp = Join-Path $dir ([IO.Path]::GetRandomFileName())
    try {
      [IO.File]::WriteAllBytes($tmp, $cipher)
      if ([IO.File]::Exists($file)) {
        $backup = "$tmp.bak"
        try { [IO.File]::Replace($tmp, $file, $backup); Remove-Item -LiteralPath $backup -Force -ErrorAction SilentlyContinue }
        finally { Remove-Item -LiteralPath $backup -Force -ErrorAction SilentlyContinue }
      }
      else { [IO.File]::Move($tmp, $file) }
    }
    finally { Remove-Item -LiteralPath $tmp -Force -ErrorAction SilentlyContinue }
    @{ ok = $true; value = '' } | ConvertTo-Json -Compress
  } else { throw 'invalid' }
} catch { @{ ok = $false } | ConvertTo-Json -Compress }
