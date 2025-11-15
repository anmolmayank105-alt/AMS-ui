@echo off
echo ========================================
echo   Starting AlumNetics Platform
echo ========================================
echo.
echo Starting Backend Server...
start "AlumNetics Backend" powershell -NoExit -Command "cd '%~dp0alumnetics-backend'; npm start"
timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
start "AlumNetics Frontend" powershell -NoExit -Command "cd '%~dp0alumnetics-frontend'; npx http-server -p 3000 -c-1"
timeout /t 5 /nobreak > nul

echo.
echo ========================================
echo   Servers Started!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Opening Landing Page in Chrome...
start chrome http://localhost:3000/index.html
echo.
echo ========================================
echo   AlumNetics is Ready!
echo ========================================
echo.
echo Press any key to exit this window...
echo (Keep the other windows running)
pause > nul
