@echo off
REM Windows script to build the app for Windows

cd /d "%~dp0"

echo ==========================================
echo Task Manager - Build for Windows
echo ==========================================
echo.
echo Building TypeScript and React...
call npm run build

echo.
echo Packaging for Windows (NSIS + Portable)...
call npm run build:win

echo.
echo ==========================================
echo Build Complete!
echo ==========================================
echo Build files are in: .\release
echo.
dir release\
