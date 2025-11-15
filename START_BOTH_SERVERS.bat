@echo off
echo ========================================
echo   Starting AlumNetics Full Stack App
echo ========================================
echo.

REM Kill any existing Node processes on ports 5000 and 5173
echo Cleaning up old processes...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
    taskkill /F /PID %%a 2>nul
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do (
    taskkill /F /PID %%a 2>nul
)
timeout /t 2 /nobreak >nul

echo.
echo Starting Backend Server (Port 5000)...
start "AlumNetics Backend - DO NOT CLOSE" cmd /k "cd /d %~dp0alumnetics-backend && echo Starting Backend Server... && node server.js"
timeout /t 5 /nobreak >nul

echo.
echo Starting Frontend Server (Port 5173)...
start "AlumNetics Frontend - DO NOT CLOSE" cmd /k "cd /d %~dp0alumnetics-react && echo Starting Frontend Server... && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo   Both Servers Started!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Press any key to open the app in your browser...
pause >nul

start http://localhost:5173

echo.
echo Servers are running in separate windows.
echo Close those windows to stop the servers.
echo.
pause
