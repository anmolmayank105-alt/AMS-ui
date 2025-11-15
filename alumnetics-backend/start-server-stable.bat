@echo off
echo ========================================
echo   AlumNetics Backend - Stable Mode
echo ========================================
echo.

cd /d "%~dp0"

echo Starting server with auto-restart capability...
echo Press Ctrl+C to stop the server
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0start-server-stable.ps1"

pause
