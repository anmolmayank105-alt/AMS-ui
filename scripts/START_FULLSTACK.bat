@echo off
echo ========================================
echo   ALUMNETICS Full Stack Application
echo ========================================
echo.

echo [INFO] Starting Backend Server (Port 5000)...
start "Backend Server" cmd /k "cd /d e:\demo\demo\alumnetics-backend && npm run dev"

timeout /t 3 /nobreak > nul

echo [INFO] Starting Frontend Server (Port 5173)...
start "Frontend Server" cmd /k "cd /d e:\demo\demo\alumnetics-react && npm run dev"

timeout /t 3 /nobreak > nul

echo.
echo ========================================
echo   Servers Started Successfully!
echo ========================================
echo.
echo Backend API:  http://localhost:5000/api
echo Frontend App: http://localhost:5173
echo.
echo Press any key to exit (servers will keep running)...
pause > nul
