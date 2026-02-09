@echo off
REM ==========================================
REM Task Manager - Build for All Platforms
REM Windows - Double-click this file to build
REM ==========================================

cd /d "%~dp0"

echo.
echo ==========================================
echo   Task Manager - Build for All Platforms
echo ==========================================
echo.
echo NOTE: Building from Windows can only produce
echo       Windows builds. To build macOS apps,
echo       you need to run build-all.command on a Mac.
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed.
    echo Please install Node.js from: https://nodejs.org
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do echo Node.js version: %%i
echo.

REM Check if dependencies are installed
if not exist "node_modules" (
    echo Installing dependencies first...
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies.
        pause
        exit /b 1
    )
    echo.
)

echo Building for Windows (Installer + Portable)...
echo This may take several minutes...
echo.

call npm run build:win

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Build failed. Check the output above for details.
    echo.
    pause
    exit /b 1
)

echo.
echo ==========================================
echo   Build Complete!
echo ==========================================
echo.
echo Build files are in: .\Builds\
echo.

if exist "Builds" (
    dir Builds\
    echo.
    explorer Builds
)

pause
