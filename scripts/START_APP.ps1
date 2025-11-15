# AlumNetics App Launcher
# Double-click this file to start the app

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AlumNetics Platform Launcher" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path

# Start Backend
Write-Host "Starting Backend Server..." -ForegroundColor Yellow
# Launch backend in a new PowerShell window with the correct working directory
Start-Process -FilePath "powershell" -WorkingDirectory "$scriptPath\alumnetics-backend" -ArgumentList "-NoExit", "-Command", "Write-Host 'Backend Server Starting...' -ForegroundColor Green; npm start"
Start-Sleep -Seconds 3

# Start Frontend
Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
# Launch frontend in a new PowerShell window with the correct working directory
Start-Process -FilePath "powershell" -WorkingDirectory "$scriptPath\alumnetics-frontend" -ArgumentList "-NoExit", "-Command", "Write-Host 'Frontend Server Starting...' -ForegroundColor Green; npx http-server -p 3000 -c-1"
Start-Sleep -Seconds 5

# Display info
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Servers Started Successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "URLs:" -ForegroundColor Cyan
Write-Host "  Backend:  http://localhost:5000" -ForegroundColor White
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  App:      http://localhost:3000/index.html" -ForegroundColor White
Write-Host ""
Write-Host "Test Credentials:" -ForegroundColor Cyan
Write-Host "  Email: anmolmayank6@gmail.com" -ForegroundColor White
Write-Host "  Pass:  p11348456" -ForegroundColor White
Write-Host ""
Write-Host "Opening Landing Page in Chrome..." -ForegroundColor Yellow
Start-Process chrome "http://localhost:3000/index.html"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  AlumNetics is Ready!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Tips:" -ForegroundColor Yellow
Write-Host "  - Keep the server windows open" -ForegroundColor White
Write-Host "  - Start from Landing Page" -ForegroundColor White
Write-Host "  - Login to access dashboard" -ForegroundColor White
Write-Host ""
Write-Host "Launcher finished. This window can be closed." -ForegroundColor Gray
