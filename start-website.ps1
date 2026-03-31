param([switch]$Public)

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$port = 4173
$bindHost = if ($Public) { '0.0.0.0' } else { '127.0.0.1' }
$url = "http://127.0.0.1:$port/index.html"

function Test-WebsitePort {
    param(
        [string]$HostName,
        [int]$PortNumber
    )

    try {
        $client = New-Object System.Net.Sockets.TcpClient
        $async = $client.BeginConnect($HostName, $PortNumber, $null, $null)
        $connected = $async.AsyncWaitHandle.WaitOne(800)
        if (-not $connected) {
            $client.Close()
            return $false
        }
        $null = $client.EndConnect($async)
        $client.Close()
        return $true
    } catch {
        return $false
    }
}

if (-not (Test-WebsitePort -HostName '127.0.0.1' -PortNumber $port)) {
    $serverCommand = "Set-Location -LiteralPath '$projectRoot'; npx http-server . -p $port -a $bindHost -c-1"
    Start-Process powershell -WindowStyle Hidden -ArgumentList '-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', $serverCommand | Out-Null

    for ($i = 0; $i -lt 10; $i++) {
        Start-Sleep -Seconds 1
        if (Test-WebsitePort -HostName '127.0.0.1' -PortNumber $port) {
            break
        }
    }
}

Start-Process $url
