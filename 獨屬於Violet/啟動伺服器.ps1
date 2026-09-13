$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootFull = [System.IO.Path]::GetFullPath($root)
if (-not $rootFull.EndsWith([System.IO.Path]::DirectorySeparatorChar)) {
  $rootFull = $rootFull + [System.IO.Path]::DirectorySeparatorChar
}

function Test-FreePort {
  param([int]$Port)
  try {
    $listener = New-Object System.Net.Sockets.TcpListener ([System.Net.IPAddress]::Loopback, $Port)
    $listener.Start()
    $listener.Stop()
    return $true
  } catch {
    return $false
  }
}

$port = 8787
while (-not (Test-FreePort -Port $port)) {
  $port = $port + 1
  if ($port -ge 8800) {
    Write-Host "No free port. Close other programs and try again."
    exit 1
  }
}

$mime = @{
  ".html" = "text/html; charset=utf-8"
  ".js"   = "application/javascript; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".svg"  = "image/svg+xml"
  ".png"  = "image/png"
  ".jpg"  = "image/jpeg"
  ".ico"  = "image/x-icon"
  ".woff" = "font/woff"
  ".woff2"= "font/woff2"
  ".txt"  = "text/plain; charset=utf-8"
}

$prefix = "http://127.0.0.1:$port/"
$http = New-Object System.Net.HttpListener
$http.Prefixes.Add($prefix)
try {
  $http.Start()
} catch {
  Write-Host $_.Exception.Message
  exit 1
}

Start-Process $prefix | Out-Null
Write-Host "Game URL: $prefix"
Write-Host "Keep this window open. Close it to stop the game."
Write-Host ""

$ErrorActionPreference = "Continue"
try {
  while ($http.IsListening) {
    $ctx = $http.GetContext()
    try {
      $path = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath)
      $rel = $path.TrimStart("/").Replace("/", [IO.Path]::DirectorySeparatorChar)
      if ([string]::IsNullOrWhiteSpace($rel)) { $rel = "index.html" }

      $full = [System.IO.Path]::GetFullPath((Join-Path $root $rel))
      if (-not $full.StartsWith($rootFull, [System.StringComparison]::OrdinalIgnoreCase)) {
        $ctx.Response.StatusCode = 403
        $ctx.Response.Close()
        continue
      }

      if (Test-Path -LiteralPath $full -PathType Container) {
        $full = Join-Path $full "index.html"
      }

      $ext = [System.IO.Path]::GetExtension($full)
      if (-not (Test-Path -LiteralPath $full -PathType Leaf)) {
        if ($ext) {
          $ctx.Response.StatusCode = 404
          $ctx.Response.Close()
          continue
        }
        $full = Join-Path $root "index.html"
        $ext = ".html"
      }

      [byte[]]$bytes = [System.IO.File]::ReadAllBytes($full)
      $count = $bytes.Length
      $ctx.Response.StatusCode = 200
      $type = $mime[$ext.ToLowerInvariant()]
      if (-not $type) { $type = "application/octet-stream" }
      $ctx.Response.ContentType = $type
      $ctx.Response.ContentLength64 = $count
      $ctx.Response.OutputStream.Write($bytes, 0, $count)
      $ctx.Response.Close()
    } catch {
      try { $ctx.Response.StatusCode = 500; $ctx.Response.Close() } catch {}
    }
  }
} finally {
  if ($http.IsListening) { $http.Stop() }
  $http.Close()
}
