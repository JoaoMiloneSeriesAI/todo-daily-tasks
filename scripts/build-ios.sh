#!/bin/bash
set -e

# ============================================================
# Build for iOS — Task Manager Mobile
# ============================================================
# Prerequisites:
#   - macOS with Xcode installed
#   - CocoaPods (gem install cocoapods)
#   - Node.js 18+
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

echo "============================================"
echo "  Task Manager — Build for iOS"
echo "============================================"
echo ""

# Verify macOS
if [[ "$(uname)" != "Darwin" ]]; then
  echo "ERROR: iOS builds require macOS."
  exit 1
fi

# Verify Xcode
if ! command -v xcodebuild &> /dev/null; then
  echo "ERROR: Xcode is not installed."
  echo "       Install from: https://apps.apple.com/app/xcode/id497799835"
  exit 1
fi

# Step 1: Build web assets
echo "[1/3] Building web assets for mobile..."
npm run build:mobile
echo "      Web assets built successfully."
echo ""

# Step 2: Sync Capacitor
echo "[2/3] Syncing Capacitor with iOS project..."
npx cap sync ios
echo "      Capacitor sync complete."
echo ""

# Step 3: Open Xcode
echo "[3/3] Opening Xcode project..."
npx cap open ios

echo ""
echo "============================================"
echo "  iOS project synced and opened in Xcode"
echo "============================================"
echo ""
echo "  From Xcode:"
echo "    - Press Play to run on Simulator"
echo "    - Select a device to run on a real iPhone"
echo "    - Product > Archive for App Store builds"
echo "============================================"
