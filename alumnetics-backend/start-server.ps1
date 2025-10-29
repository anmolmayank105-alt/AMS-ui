# ALUMNETICS Backend Server Startup Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ALUMNETICS Backend Server" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get the script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "Current Directory: $scriptPath" -ForegroundColor Yellow
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Check if server.js exists
if (-not (Test-Path "server.js")) {
    Write-Host "ERROR: server.js not found!" -ForegroundColor Red
    Write-Host "Please ensure you're in the correct directory." -ForegroundColor Red
    pause
    exit
}

# Start the server
Write-Host "Starting Node.js server..." -ForegroundColor Green
Write-Host ""
node server.js

# Keep window open if there's an error
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Server stopped with error code: $LASTEXITCODE" -ForegroundColor Red
    pause
}
