#!/bin/bash
set -e

# ============================================================
# Build APK (Release) — Task Manager Mobile
# ============================================================
# Prerequisites (same as debug, plus):
#   - A signing keystore configured in android/app/build.gradle
#     or signing environment variables
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

echo "============================================"
echo "  Task Manager — Build Android APK (Release)"
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

# Step 3: Build release APK via Gradle
echo "[3/3] Building Android release APK..."
cd android
./gradlew assembleRelease

APK_PATH="app/build/outputs/apk/release/app-release.apk"
APK_PATH_UNSIGNED="app/build/outputs/apk/release/app-release-unsigned.apk"

if [ -f "$APK_PATH" ]; then
  APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
  FULL_PATH="$PROJECT_DIR/android/$APK_PATH"
  echo ""
  echo "============================================"
  echo "  Release APK built successfully!"
  echo "============================================"
  echo "  Location: $FULL_PATH"
  echo "  Size:     $APK_SIZE"
  echo "============================================"
elif [ -f "$APK_PATH_UNSIGNED" ]; then
  APK_SIZE=$(du -h "$APK_PATH_UNSIGNED" | cut -f1)
  FULL_PATH="$PROJECT_DIR/android/$APK_PATH_UNSIGNED"
  echo ""
  echo "============================================"
  echo "  Unsigned release APK built."
  echo "  (Configure signing for a signed release)"
  echo "============================================"
  echo "  Location: $FULL_PATH"
  echo "  Size:     $APK_SIZE"
  echo "============================================"
else
  echo ""
  echo "ERROR: Release APK not found at expected path."
  exit 1
fi
