#!/bin/bash
# ==========================================
# Task Manager - Build for iOS
# macOS - Double-click this file to build
# ==========================================
# Note: iOS builds require macOS with Xcode installed.
# The final step opens Xcode where you can run on a
# simulator or build for a physical device.
# ==========================================

cd "$(dirname "$0")"

echo ""
echo "=========================================="
echo "  Task Manager - Build for iOS"
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

# Check if running on macOS
if [[ "$(uname)" != "Darwin" ]]; then
    echo "ERROR: iOS builds can only be created on macOS."
    echo ""
    read -p "Press Enter to exit..."
    exit 1
fi

# Check if Xcode is installed
if ! command -v xcodebuild &> /dev/null; then
    echo "ERROR: Xcode is not installed."
    echo ""
    echo "Please install Xcode from the Mac App Store:"
    echo "  https://apps.apple.com/app/xcode/id497799835"
    echo ""
    echo "After installing, open Xcode once and accept the license,"
    echo "then run this script again."
    echo ""
    read -p "Press Enter to exit..."
    exit 1
fi

XCODE_VERSION=$(xcodebuild -version | head -1)
echo "$XCODE_VERSION"
echo ""

# Check if CocoaPods is installed
if ! command -v pod &> /dev/null; then
    echo "CocoaPods not found. Installing..."
    echo "(This is needed to manage iOS dependencies)"
    echo ""
    sudo gem install cocoapods
    if [ $? -ne 0 ]; then
        echo ""
        echo "ERROR: Failed to install CocoaPods."
        echo "Try running: sudo gem install cocoapods"
        echo ""
        read -p "Press Enter to exit..."
        exit 1
    fi
    echo ""
fi

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

echo "Building for iOS..."
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
echo "[2/3] Syncing to iOS project..."
npx cap sync ios
if [ $? -ne 0 ]; then
    echo ""
    echo "ERROR: Capacitor sync failed."
    read -p "Press Enter to exit..."
    exit 1
fi
echo ""

# Step 3: Open in Xcode
echo "[3/3] Opening Xcode..."
echo ""
echo "=========================================="
echo "  Web assets synced to iOS project!"
echo "=========================================="
echo ""
echo "Xcode is opening now. From there you can:"
echo ""
echo "  - Click the Play button to run on the Simulator"
echo "  - Select your iPhone from the device list to"
echo "    run on a real device (requires Apple Developer"
echo "    account for physical devices)"
echo "  - Go to Product > Archive to create a release build"
echo ""

npx cap open ios

read -p "Press Enter to exit..."
