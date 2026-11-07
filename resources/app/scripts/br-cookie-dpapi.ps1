param()
$ErrorActionPreference = 'Stop'
try {
  Add-Type -AssemblyName System.Security
  $request = [Console]::In.ReadToEnd() | ConvertFrom-Json
  if (-not $request -or $null -eq $request.blobs -or @($request.blobs).Count -gt 1500) { throw 'INVALID_REQUEST' }
  $results = New-Object System.Collections.ArrayList
  foreach ($encoded in @($request.blobs)) {
    try {
      $protected = [Convert]::FromBase64String([string]$encoded)
      if ($protected.Length -lt 8 -or $protected.Length -gt 65536) { throw 'INVALID_BLOB' }
      $plain = [System.Security.Cryptography.ProtectedData]::Unprotect(
        $protected, $null, [System.Security.Cryptography.DataProtectionScope]::CurrentUser)
      [void]$results.Add(@{ ok = $true; value = [Convert]::ToBase64String($plain) })
    } catch {
      [void]$results.Add(@{ ok = $false })
    }
  }
  [Console]::Out.WriteLine((ConvertTo-Json -InputObject @{ results = @($results.ToArray()) } -Depth 5 -Compress))
  exit 0
} catch {
  [Console]::Out.WriteLine('{"results":[]}')
  exit 2
}
