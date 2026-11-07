param()
$ErrorActionPreference = 'Stop'

function Write-Result($value) {
  [Console]::Out.WriteLine(($value | ConvertTo-Json -Compress -Depth 6))
}

function Get-FreePort {
  $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, 0)
  $listener.Start()
  try { return ([System.Net.IPEndPoint]$listener.LocalEndpoint).Port } finally { $listener.Stop() }
}

# Edge relaunches itself, so the PID from Start-Process is usually stale by the time
# we clean up and taskkill silently no-ops. Match the dedicated profile instead.
function Stop-PortalEdge($dir) {
  try {
    Get-CimInstance Win32_Process -Filter "Name='msedge.exe'" -ErrorAction SilentlyContinue |
      Where-Object { $_.CommandLine -and $_.CommandLine.IndexOf($dir, [System.StringComparison]::OrdinalIgnoreCase) -ge 0 } |
      ForEach-Object {
        try { & taskkill.exe /PID $_.ProcessId /T /F 2>$null | Out-Null } catch { }
      }
  } catch { }
}

function Receive-Text($socket) {
  $buffer = New-Object byte[] 131072
  $builder = New-Object System.Text.StringBuilder
  do {
    $segment = [System.ArraySegment[byte]]::new($buffer)
    $result = $socket.ReceiveAsync($segment, [System.Threading.CancellationToken]::None).Result
    if ($result.MessageType -eq [System.Net.WebSockets.WebSocketMessageType]::Close) { return $null }
    [void]$builder.Append([System.Text.Encoding]::UTF8.GetString($buffer, 0, $result.Count))
  } while (-not $result.EndOfMessage)
  return $builder.ToString()
}

$script:cdpId = 0
function Invoke-Cdp($socket, [string]$method, $params) {
  $script:cdpId++
  $id = $script:cdpId
  $message = @{ id = $id; method = $method; params = $params } | ConvertTo-Json -Compress -Depth 8
  $bytes = [System.Text.Encoding]::UTF8.GetBytes($message)
  $segment = [System.ArraySegment[byte]]::new($bytes)
  $socket.SendAsync($segment, [System.Net.WebSockets.WebSocketMessageType]::Text, $true, [System.Threading.CancellationToken]::None).Wait()
  while ($true) {
    $text = Receive-Text $socket
    if ($null -eq $text) { throw 'CDP_SOCKET_CLOSED' }
    $reply = $text | ConvertFrom-Json
    if ($reply.id -eq $id) {
      if ($reply.error) { throw ('CDP_' + $reply.error.message) }
      return $reply.result
    }
  }
}

$edge = @(
  (Join-Path $env:ProgramFiles 'Microsoft\Edge\Application\msedge.exe'),
  (Join-Path ${env:ProgramFiles(x86)} 'Microsoft\Edge\Application\msedge.exe')
) | Where-Object { $_ -and (Test-Path -LiteralPath $_) } | Select-Object -First 1
if (-not $edge) { Write-Result @{ ok = $false; reason = 'edge_unavailable' }; exit 2 }

$inputText = [Console]::In.ReadToEnd()
$request = $inputText | ConvertFrom-Json
if (-not $request.url -or -not $request.cookies) { Write-Result @{ ok = $false; reason = 'invalid_request' }; exit 2 }

$port = Get-FreePort
$profile = if ($env:NARUTO_EDGE_PROFILE) { $env:NARUTO_EDGE_PROFILE } else { Join-Path $env:APPDATA 'Naruto-Windows\edge-portal-profile' }
# A previous helper run may have left an Edge instance on this profile; a second
# instance would hand off to it and never open the requested debug port.
$stale = Get-CimInstance Win32_Process -Filter "Name='msedge.exe'" | Where-Object { $_.CommandLine -and $_.CommandLine.Contains($profile) }
foreach ($item in $stale) { try { Stop-Process -Id $item.ProcessId -Force -ErrorAction SilentlyContinue } catch { } }
Start-Sleep -Milliseconds 500
$socket = $null
$process = $null
try {
  New-Item -ItemType Directory -Force -Path $profile | Out-Null
  # This Edge instance is dedicated to the Naruto BR portal only.
  # --no-proxy-server overrides Windows/WinINET proxy settings for this Edge
  # process; it does NOT bypass a system-level TUN/VPN route.
  $arguments = @(    '--no-proxy-server',
    "--remote-debugging-port=$port",
    "--user-data-dir=$profile",
    '--no-first-run',
    '--no-default-browser-check',
    '--remote-allow-origins=*',
    '--window-size=1200,800',
    # keep the window off-screen: this Edge is only a CDP transport, the user
    # must never see it. headless is avoided so the page keeps a real browser
    # fingerprint (Cloudflare blocks obvious headless clients).
    '--window-position=-32000,-32000',
    'about:blank'
  )
  Stop-PortalEdge $profile
  $process = Start-Process -FilePath $edge -ArgumentList $arguments -PassThru
  $target = $null
  for ($i = 0; $i -lt 60 -and -not $target; $i++) {
    Start-Sleep -Milliseconds 500
    try {
      $targets = Invoke-RestMethod -Uri ("http://127.0.0.1:$port/json/list") -TimeoutSec 2
      $target = $targets | Where-Object { $_.type -eq 'page' } | Select-Object -First 1
    } catch { }
  }
  if (-not $target) { Write-Result @{ ok = $false; reason = 'edge_start_failed' }; exit 3 }

  $socket = [System.Net.WebSockets.ClientWebSocket]::new()
  $socket.ConnectAsync([Uri]$target.webSocketDebuggerUrl, [System.Threading.CancellationToken]::None).Wait()
  Invoke-Cdp $socket 'Network.enable' @{} | Out-Null
  Invoke-Cdp $socket 'Page.enable' @{} | Out-Null
  Invoke-Cdp $socket 'Runtime.enable' @{} | Out-Null

  $set = 0
  foreach ($cookie in @($request.cookies)) {
    $hostName = ([string]$cookie.host).TrimStart('.')
    if (-not $hostName) { continue }
    # Cloudflare cookies are bound to the browser that obtained them. Let this
    # Edge profile establish its own cf_clearance / __cf_bm instead of importing
    # the official CEF copies.
    if ($cookie.name -eq 'cf_clearance' -or $cookie.name -eq '__cf_bm') { continue }
    $params = @{
      name = [string]$cookie.name
      value = [string]$cookie.value
      path = if ($cookie.path) { [string]$cookie.path } else { '/' }
      secure = [bool]$cookie.secure
      httpOnly = [bool]$cookie.httpOnly
      url = ('https://' + $hostName + $(if ($cookie.path) { [string]$cookie.path } else { '/' }))
    }
    if (-not [bool]$cookie.hostOnly) { $params.domain = '.' + $hostName }
    if ($cookie.sameSite) { $params.sameSite = [string]$cookie.sameSite }
    if ($cookie.name -eq 'oas_user' -and $hostName -eq 'narutowebgame.com' -and [bool]$cookie.hostOnly) {
      $params.domain = '.narutowebgame.com'
      $params.url = 'https://narutowebgame.com/'
    }
    try { Invoke-Cdp $socket 'Network.setCookie' $params | Out-Null; $set++ } catch { }
  }

  # Load the portal home first so this Edge profile obtains its own Cloudflare
  # clearance before the server-list request.
  Invoke-Cdp $socket 'Page.navigate' @{ url = 'https://naruto.narutowebgame.com/pt/' } | Out-Null
  Start-Sleep -Seconds 5
  Invoke-Cdp $socket 'Page.navigate' @{ url = [string]$request.url } | Out-Null
  $html = ''
  $reason = 'br_signed_entry_not_found'
  $lastTitle = ''
  $lastText = ''
  for ($i = 0; $i -lt 60; $i++) {
    Start-Sleep -Milliseconds 1000
    $expression = 'JSON.stringify({ready:document.readyState,title:document.title,text:document.body?document.body.innerText.slice(0,400):"",html:document.documentElement.outerHTML,hasPassword:!!document.querySelector("input[name=oaspd]")})'
    $evaluated = Invoke-Cdp $socket 'Runtime.evaluate' @{ expression = $expression; returnByValue = $true }
    $value = $evaluated.result.value | ConvertFrom-Json
    $lastTitle = [string]$value.title
    $lastText = [string]$value.text
    if ($value.title -match 'Attention Required|Just a moment|you have been blocked' -or
        $value.text -match 'Sorry, you have been blocked|You are unable to access') {
      # Cloudflare explicitly denied this request; do not automatically reload.
      $reason = 'portal_blocked'
      break
    }
    if ($value.hasPassword -and $value.ready -eq 'complete' -and $value.html -notmatch 'main\.html') { $reason = 'session_expired'; break }
    if ($value.html -match 'main\.html' -and $value.html -match 'sign=') {
      $html = $value.html
      $reason = ''
      break
    }
  }
  if ($html) {
    Write-Result @{ ok = $true; status = 200; cookies = $set; html = $html }
    exit 0
  }
  Write-Result @{ ok = $false; reason = $reason; cookies = $set; title = $lastTitle; text = $lastText }
  exit 4
} catch {
  Write-Result @{ ok = $false; reason = 'portal_helper_failed'; detail = $_.Exception.Message }
  exit 5
} finally {
  if ($socket) { try { $socket.Dispose() } catch { } }
  if ($process) { try { & taskkill.exe /PID $process.Id /T /F | Out-Null } catch { } }
  Stop-PortalEdge $profile
}
