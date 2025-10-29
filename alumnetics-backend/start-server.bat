@echo off
echo Starting ALUMNETICS Backend Server...
echo =====================================
cd /d "%~dp0"
echo Current directory: %CD%
echo.
echo Starting Node.js server...
node server.js
pause
