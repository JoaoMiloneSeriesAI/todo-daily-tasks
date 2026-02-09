@echo off
REM ==========================================
REM Task Manager - Run in Development Mode
REM Windows - Double-click this file to start
REM ==========================================

cd /d "%~dp0"

echo.
echo ==========================================
echo   Task Manager - Development Mode
echo ==========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed.
    echo.
    echo Please install Node.js from: https://nodejs.org
    echo Download the LTS version and run the installer.
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do echo Node.js version: %%i
echo.

REM Check if dependencies are installed
if not exist "node_modules" (
    echo First time setup: Installing dependencies...
    echo This may take a few minutes...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo ERROR: Failed to install dependencies.
        echo Check your internet connection and try again.
        echo.
        pause
        exit /b 1
    )
    echo.
)

echo Starting the app in development mode...
echo (Close this window to stop the app)
echo.

call npm run dev

if %errorlevel% neq 0 (
    echo.
    echo ERROR: The app failed to start.
    echo Try deleting the node_modules folder and running this script again.
    echo.
    pause
    exit /b 1
)
