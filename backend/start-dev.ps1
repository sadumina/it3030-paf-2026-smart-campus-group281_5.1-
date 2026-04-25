param(
    [switch]$Atlas
)

$ErrorActionPreference = "Stop"

function Test-TcpPort {
    param(
        [string]$HostName,
        [int]$Port
    )

    try {
        $client = New-Object System.Net.Sockets.TcpClient
        $async = $client.BeginConnect($HostName, $Port, $null, $null)
        $connected = $async.AsyncWaitHandle.WaitOne(1500, $false)

        if (-not $connected) {
            $client.Close()
            return $false
        }

        $client.EndConnect($async)
        $client.Close()
        return $true
    } catch {
        return $false
    }
}

if ($Atlas) {
    Write-Host "Starting backend with Atlas profile..."
    $env:SPRING_PROFILES_ACTIVE = "atlas"
    & .\mvnw.cmd spring-boot:run
    exit $LASTEXITCODE
}

if (-not (Test-TcpPort -HostName "localhost" -Port 27017)) {
    Write-Host ""
    Write-Host "MongoDB is not running on localhost:27017." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Choose one of these options:"
    Write-Host "1. Start a local MongoDB server, then run this script again."
    Write-Host "2. Use Atlas instead: .\start-dev.ps1 -Atlas"
    Write-Host "3. Set a custom connection string in MONGODB_URI and run .\mvnw.cmd spring-boot:run"
    Write-Host ""
    exit 1
}

Write-Host "Local MongoDB detected on localhost:27017. Starting backend..."
& .\mvnw.cmd spring-boot:run
exit $LASTEXITCODE
