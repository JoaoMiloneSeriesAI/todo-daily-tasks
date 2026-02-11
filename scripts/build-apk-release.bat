@echo off
REM ============================================================
REM Build APK (Release) — Task Manager Mobile
REM ============================================================

echo ============================================
echo   Task Manager — Build Android APK (Release)
echo ============================================
echo.

REM Step 1: Build web assets
echo [1/3] Building web assets for mobile...
call npm run build:mobile
if %ERRORLEVEL% neq 0 (
    echo ERROR: Web asset build failed.
    exit /b %ERRORLEVEL%
)
echo       Web assets built successfully.
echo.

REM Step 2: Sync Capacitor
echo [2/3] Syncing Capacitor with Android project...
call npx cap sync android
if %ERRORLEVEL% neq 0 (
    echo ERROR: Capacitor sync failed.
    exit /b %ERRORLEVEL%
)
echo       Capacitor sync complete.
echo.

REM Step 3: Build release APK via Gradle
echo [3/3] Building Android release APK...
cd android
call gradlew.bat assembleRelease
if %ERRORLEVEL% neq 0 (
    echo ERROR: Gradle build failed.
    cd ..
    exit /b %ERRORLEVEL%
)

echo.
echo ============================================
echo   Release APK built successfully!
echo ============================================
echo   Location: android\app\build\outputs\apk\release\app-release.apk
echo ============================================

cd ..
