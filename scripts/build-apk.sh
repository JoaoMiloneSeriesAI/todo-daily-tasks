#!/bin/bash
set -e

# ============================================================
# Build APK (Debug) — Task Manager Mobile
# ============================================================
# Prerequisites:
#   - Android Studio installed (for SDK and build tools)
#   - Java 17+ (for Gradle)
#   - ANDROID_HOME / ANDROID_SDK_ROOT environment variable set
#   - Node.js 18+
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

echo "============================================"
echo "  Task Manager — Build Android APK (Debug)"
echo "============================================"
echo ""

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

echo "Using JAVA_HOME=$JAVA_HOME"
echo ""

# Step 1: Build web assets
echo "[1/3] Building web assets for mobile..."
npm run build:mobile
echo "      Web assets built successfully."
echo ""

# Step 2: Sync Capacitor
echo "[2/3] Syncing Capacitor with Android project..."
npx cap sync android
echo "      Capacitor sync complete."
echo ""

# Step 3: Build APK via Gradle
echo "[3/3] Building Android APK..."
cd android
./gradlew assembleDebug

APK_PATH="app/build/outputs/apk/debug/app-debug.apk"

if [ -f "$APK_PATH" ]; then
  APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
  FULL_PATH="$PROJECT_DIR/android/$APK_PATH"
  echo ""
  echo "============================================"
  echo "  APK built successfully!"
  echo "============================================"
  echo "  Location: $FULL_PATH"
  echo "  Size:     $APK_SIZE"
  echo "============================================"
else
  echo ""
  echo "ERROR: APK file not found at expected path."
  echo "       Expected: android/$APK_PATH"
  exit 1
fi
