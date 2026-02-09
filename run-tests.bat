@echo off
REM ==========================================
REM Task Manager - Run Tests
REM Windows - Double-click this file to run tests
REM ==========================================

cd /d "%~dp0"

echo.
echo ==========================================
echo   Task Manager - Running Tests
echo ==========================================
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

echo Running unit tests...
echo.

call npm test

echo.
if %errorlevel% equ 0 (
    echo ==========================================
    echo   All tests passed!
    echo ==========================================
) else (
    echo ==========================================
    echo   Some tests failed. See output above.
    echo ==========================================
)

echo.
pause
