@echo off
REM ==========================================
REM Task Manager - Build for Android
REM Windows - Double-click this file to build
REM ==========================================
REM Produces:
REM   - Debug APK   (for testing)
REM   - Release APK (for distribution)
REM   - Release AAB (for Google Play Store)
REM ==========================================

cd /d "%~dp0"

echo.
echo ==========================================
echo   Task Manager - Build for Android
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

for /f "tokens=*" %%i in ('node --version') do echo Node.js version: %%i
echo.

REM Check if ANDROID_HOME is set
if not defined ANDROID_HOME (
    if not defined ANDROID_SDK_ROOT (
        REM Try common default location
        if exist "%LOCALAPPDATA%\Android\Sdk" (
            set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
            echo Auto-detected ANDROID_HOME: %LOCALAPPDATA%\Android\Sdk
        ) else (
            echo WARNING: ANDROID_HOME is not set.
            echo.
            echo Please install Android Studio from:
            echo   https://developer.android.com/studio
            echo.
            echo Then set ANDROID_HOME in System Environment Variables
            echo   typically: C:\Users\YourName\AppData\Local\Android\Sdk
            echo.
            pause
            exit /b 1
        )
    )
)

REM Ensure Java 21+ is available (required by Capacitor 8)
REM Try Android Studio's bundled JDK first, then JAVA_HOME
if exist "%ProgramFiles%\Android\Android Studio\jbr\bin\java.exe" (
    set "JAVA_HOME=%ProgramFiles%\Android\Android Studio\jbr"
    echo Using Android Studio bundled JDK: %JAVA_HOME%
)

for /f "tokens=3" %%v in ('java -version 2^>^&1 ^| findstr /i "version"') do set JAVA_VER=%%v
echo Java: %JAVA_VER%
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

echo Building for Android...
echo This may take a few minutes the first time.
echo.

REM Step 1: Build web assets
echo [1/3] Building web assets...
call npm run build:mobile
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Web asset build failed.
    pause
    exit /b 1
)
echo.

REM Step 2: Sync Capacitor
echo [2/3] Syncing to Android project...
call npx cap sync android
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Capacitor sync failed.
    pause
    exit /b 1
)
echo.

REM Step 3: Build all outputs (debug APK + release APK + release AAB)
echo [3/3] Building Android packages (Debug APK + Release APK + Release AAB)...
cd android
call gradlew.bat assembleDebug assembleRelease bundleRelease
if %errorlevel% neq 0 (
    cd ..
    echo.
    echo ERROR: Android build failed. Check the output above for details.
    echo.
    echo Common fixes:
    echo   - Install Android Studio: https://developer.android.com/studio
    echo   - Make sure Java 21+ is installed
    echo.
    pause
    exit /b 1
)
cd ..

echo.
echo ==========================================
echo   Build Complete!
echo ==========================================
echo.
echo   Debug APK:    android\app\build\outputs\apk\debug\app-debug.apk
echo   Release APK:  android\app\build\outputs\apk\release\app-release-unsigned.apk
echo   Release AAB:  android\app\build\outputs\bundle\release\app-release.aab
echo.
echo ------------------------------------------
echo   What to use:
echo.
echo   Debug APK    - Install directly on a device for testing
echo   Release APK  - Distribute to others (unsigned)
echo   Release AAB  - Upload to Google Play Store
echo ------------------------------------------
echo.

REM Open the output folder
if exist "android\app\build\outputs" (
    explorer android\app\build\outputs
)

pause
