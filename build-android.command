#!/bin/bash
# ==========================================
# Task Manager - Build for Android
# macOS - Double-click this file to build
# ==========================================
# Produces:
#   - Debug APK   (for testing)
#   - Release APK (for distribution)
#   - Release AAB (for Google Play Store)
# ==========================================

cd "$(dirname "$0")"

echo ""
echo "=========================================="
echo "  Task Manager - Build for Android"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed."
    echo "Please install Node.js from: https://nodejs.org"
    echo ""
    read -p "Press Enter to exit..."
    exit 1
fi

echo "Node.js version: $(node --version)"
echo ""

# Check if ANDROID_HOME is set
if [ -z "$ANDROID_HOME" ] && [ -z "$ANDROID_SDK_ROOT" ]; then
    # Try common default locations
    if [ -d "$HOME/Library/Android/sdk" ]; then
        export ANDROID_HOME="$HOME/Library/Android/sdk"
        echo "Auto-detected ANDROID_HOME: $ANDROID_HOME"
    elif [ -d "$HOME/Android/Sdk" ]; then
        export ANDROID_HOME="$HOME/Android/Sdk"
        echo "Auto-detected ANDROID_HOME: $ANDROID_HOME"
    else
        echo "WARNING: ANDROID_HOME is not set."
        echo ""
        echo "Please install Android Studio from:"
        echo "  https://developer.android.com/studio"
        echo ""
        echo "Then add this to your ~/.zshrc:"
        echo "  export ANDROID_HOME=~/Library/Android/sdk"
        echo ""
        read -p "Press Enter to exit..."
        exit 1
    fi
fi

# Ensure Java 21+ is available (required by Capacitor 8)
JAVA21_BREW="/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home"
JAVA21_BREW_INTEL="/usr/local/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home"
JAVA21_SYSTEM=$(/usr/libexec/java_home -v 21 2>/dev/null || true)

if [ -d "$JAVA21_BREW" ]; then
    export JAVA_HOME="$JAVA21_BREW"
elif [ -d "$JAVA21_BREW_INTEL" ]; then
    export JAVA_HOME="$JAVA21_BREW_INTEL"
elif [ -n "$JAVA21_SYSTEM" ] && [ -d "$JAVA21_SYSTEM" ]; then
    export JAVA_HOME="$JAVA21_SYSTEM"
fi

# Verify Java version is 21+
JAVA_VER=$("${JAVA_HOME:-/usr}/bin/java" -version 2>&1 | head -1 | grep -oE '"[0-9]+' | tr -d '"')
if [ -z "$JAVA_VER" ] || [ "$JAVA_VER" -lt 21 ] 2>/dev/null; then
    echo "ERROR: Java 21 or newer is required, but found Java $JAVA_VER."
    echo ""
    echo "Install Java 21 with:"
    echo "  brew install openjdk@21"
    echo ""
    read -p "Press Enter to exit..."
    exit 1
fi

echo "Java version: $JAVA_VER (JAVA_HOME=$JAVA_HOME)"
echo ""

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies first..."
    npm install
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to install dependencies."
        read -p "Press Enter to exit..."
        exit 1
    fi
    echo ""
fi

echo "Building for Android..."
echo "This may take a few minutes the first time."
echo ""

# Step 1: Build web assets
echo "[1/3] Building web assets..."
npm run build:mobile
if [ $? -ne 0 ]; then
    echo ""
    echo "ERROR: Web asset build failed."
    read -p "Press Enter to exit..."
    exit 1
fi
echo ""

# Step 2: Sync Capacitor
echo "[2/3] Syncing to Android project..."
npx cap sync android
if [ $? -ne 0 ]; then
    echo ""
    echo "ERROR: Capacitor sync failed."
    read -p "Press Enter to exit..."
    exit 1
fi
echo ""

# Step 3: Build all outputs (debug APK + release APK + release AAB)
echo "[3/3] Building Android packages (Debug APK + Release APK + Release AAB)..."
cd android
./gradlew assembleDebug assembleRelease bundleRelease
BUILD_RESULT=$?
cd ..

if [ $BUILD_RESULT -ne 0 ]; then
    echo ""
    echo "ERROR: Android build failed. Check the output above for details."
    echo ""
    echo "Common fixes:"
    echo "  - Install Android Studio: https://developer.android.com/studio"
    echo "  - Make sure Java 21+ is installed (brew install openjdk@21)"
    echo ""
    read -p "Press Enter to exit..."
    exit 1
fi

# Locate outputs
DEBUG_APK="android/app/build/outputs/apk/debug/app-debug.apk"
RELEASE_APK="android/app/build/outputs/apk/release/app-release-unsigned.apk"
RELEASE_AAB="android/app/build/outputs/bundle/release/app-release.aab"

echo ""
echo "=========================================="
echo "  Build Complete!"
echo "=========================================="
echo ""

# Show what was built
if [ -f "$DEBUG_APK" ]; then
    echo "  Debug APK:    $DEBUG_APK ($(du -h "$DEBUG_APK" | cut -f1))"
fi
if [ -f "$RELEASE_APK" ]; then
    echo "  Release APK:  $RELEASE_APK ($(du -h "$RELEASE_APK" | cut -f1))"
fi
if [ -f "$RELEASE_AAB" ]; then
    echo "  Release AAB:  $RELEASE_AAB ($(du -h "$RELEASE_AAB" | cut -f1))"
fi

echo ""
echo "------------------------------------------"
echo "  What to use:"
echo ""
echo "  Debug APK    -> Install directly on a device for testing"
echo "  Release APK  -> Distribute to others (unsigned)"
echo "  Release AAB  -> Upload to Google Play Store"
echo "------------------------------------------"
echo ""

# Open the output folders
if [ -d "android/app/build/outputs" ]; then
    open "android/app/build/outputs/"
fi

read -p "Press Enter to exit..."
