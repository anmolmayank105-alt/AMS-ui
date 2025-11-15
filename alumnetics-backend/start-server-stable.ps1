# Stable Server Startup Script with Auto-Restart
# This script will automatically restart the server if it crashes

$maxRestarts = 10
$restartCount = 0
$cooldownSeconds = 5

Write-Host "Starting AlumNetics Backend Server with Auto-Restart" -ForegroundColor Green
Write-Host "Location: alumnetics-backend" -ForegroundColor Cyan
Write-Host "Max restarts: $maxRestarts" -ForegroundColor Cyan
Write-Host "Cooldown: $cooldownSeconds seconds between restarts" -ForegroundColor Cyan
Write-Host ""

while ($restartCount -lt $maxRestarts) {
    $startTime = Get-Date
    
    if ($restartCount -gt 0) {
        Write-Host "Restart attempt $restartCount of $maxRestarts" -ForegroundColor Yellow
        Write-Host "Waiting $cooldownSeconds seconds before restart..." -ForegroundColor Yellow
        Start-Sleep -Seconds $cooldownSeconds
    }
    
    Write-Host "Starting server..." -ForegroundColor Green
    
    # Start the server
    $process = Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory $PSScriptRoot -PassThru -NoNewWindow
    
    # Wait for the process to exit
    $process.WaitForExit()
    
    $endTime = Get-Date
    $runtime = ($endTime - $startTime).TotalSeconds
    
    # Check exit code
    $exitCode = $process.ExitCode
    
    Write-Host ""
    Write-Host "Server stopped with exit code: $exitCode" -ForegroundColor Yellow
    Write-Host "Runtime: $([math]::Round($runtime, 2)) seconds" -ForegroundColor Cyan
    
    # If exit code is 0 (graceful shutdown), don't restart
    if ($exitCode -eq 0) {
        Write-Host "Server shut down gracefully. Not restarting." -ForegroundColor Green
        break
    }
    
    # If server ran for less than 10 seconds, it's likely a startup error
    if ($runtime -lt 10) {
        Write-Host "Server crashed within 10 seconds. Possible startup error." -ForegroundColor Red
        $restartCount++
    } else {
        # Reset restart counter if server ran for a while
        $restartCount = 0
    }
    
    if ($restartCount -ge $maxRestarts) {
        Write-Host ""
        Write-Host "Maximum restart attempts reached. Please check the logs." -ForegroundColor Red
        Write-Host "Common issues:" -ForegroundColor Yellow
        Write-Host "   - MongoDB connection string in .env file" -ForegroundColor White
        Write-Host "   - Port 5000 already in use" -ForegroundColor White
        Write-Host "   - Missing dependencies (run: npm install)" -ForegroundColor White
        break
    }
}

Write-Host ""
Write-Host "Server management stopped." -ForegroundColor Cyan
