@echo off
REM ============================================================
REM Build APK (Debug) — Task Manager Mobile
REM ============================================================
REM Prerequisites:
REM   - Android Studio installed (for SDK and build tools)
REM   - Java 17+ (for Gradle)
REM   - ANDROID_HOME / ANDROID_SDK_ROOT environment variable set
REM   - Node.js 18+
REM ============================================================

echo ============================================
echo   Task Manager — Build Android APK (Debug)
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

REM Step 3: Build APK via Gradle
echo [3/3] Building Android APK...
cd android
call gradlew.bat assembleDebug
if %ERRORLEVEL% neq 0 (
    echo ERROR: Gradle build failed.
    cd ..
    exit /b %ERRORLEVEL%
)

echo.
echo ============================================
echo   APK built successfully!
echo ============================================
echo   Location: android\app\build\outputs\apk\debug\app-debug.apk
echo ============================================

cd ..
