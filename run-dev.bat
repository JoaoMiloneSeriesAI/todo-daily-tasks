@echo off
REM Windows script to run the app in development mode

cd /d "%~dp0"

echo ==========================================
echo Task Manager - Development Mode (Windows)
echo ==========================================
echo.
echo Starting development server...
echo.

call npm run dev:electron
