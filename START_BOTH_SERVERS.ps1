# AlumNetics - Start Both Servers
# This script starts both backend and frontend servers

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting AlumNetics Full Stack App" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Kill any existing processes on ports 5000 and 5173
Write-Host "Cleaning up old processes..." -ForegroundColor Yellow

# Kill backend (port 5000)
$backendProc = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($backendProc) {
    Stop-Process -Id $backendProc.OwningProcess -Force -ErrorAction SilentlyContinue
    Write-Host "  ✓ Stopped old backend process" -ForegroundColor Green
}

# Kill frontend (port 5173)
$frontendProc = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($frontendProc) {
    Stop-Process -Id $frontendProc.OwningProcess -Force -ErrorAction SilentlyContinue
    Write-Host "  ✓ Stopped old frontend process" -ForegroundColor Green
}

Start-Sleep -Seconds 2

# Start Backend Server
Write-Host ""
Write-Host "Starting Backend Server (Port 5000)..." -ForegroundColor Yellow
$backendPath = Join-Path $scriptDir "alumnetics-backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host '🚀 Backend Server' -ForegroundColor Green; node server.js"

Start-Sleep -Seconds 3

# Start Frontend Server
Write-Host ""
Write-Host "Starting Frontend Server (Port 5173)..." -ForegroundColor Yellow
$frontendPath = Join-Path $scriptDir "alumnetics-react"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host '⚡ Frontend Server' -ForegroundColor Blue; npm run dev"

Start-Sleep -Seconds 3

# Display status
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Both Servers Started!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend:  " -NoNewline
Write-Host "http://localhost:5000" -ForegroundColor Green
Write-Host "Frontend: " -NoNewline
Write-Host "http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "Features Available:" -ForegroundColor Yellow
Write-Host "  ✓ Student Dashboard" -ForegroundColor White
Write-Host "  ✓ Alumni Dashboard" -ForegroundColor White
Write-Host "  ✓ Admin Dashboard" -ForegroundColor White
Write-Host "  ✓ Real-time Messaging (Socket.io)" -ForegroundColor White
Write-Host "  ✓ Events Management" -ForegroundColor White
Write-Host "  ✓ User Profiles" -ForegroundColor White
Write-Host ""
Write-Host "Opening browser..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

# Open browser
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "✓ App is running!" -ForegroundColor Green
Write-Host ""
Write-Host "Servers are running in separate PowerShell windows." -ForegroundColor Cyan
Write-Host "Close those windows to stop the servers." -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
