#!/bin/bash
# ==========================================
# Task Manager - Run in Development Mode
# macOS - Double-click this file to start
# ==========================================

cd "$(dirname "$0")"

echo ""
echo "=========================================="
echo "  Task Manager - Development Mode"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed."
    echo ""
    echo "Please install Node.js from: https://nodejs.org"
    echo "Download the LTS version and run the installer."
    echo ""
    read -p "Press Enter to exit..."
    exit 1
fi

echo "Node.js version: $(node --version)"
echo ""

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "First time setup: Installing dependencies..."
    echo "This may take a few minutes..."
    echo ""
    npm install
    if [ $? -ne 0 ]; then
        echo ""
        echo "ERROR: Failed to install dependencies."
        echo "Check your internet connection and try again."
        echo ""
        read -p "Press Enter to exit..."
        exit 1
    fi
    echo ""
fi

echo "Starting the app in development mode..."
echo "(Close this terminal window to stop the app)"
echo ""

npm run dev

if [ $? -ne 0 ]; then
    echo ""
    echo "ERROR: The app failed to start."
    echo "Try deleting the node_modules folder and running this script again."
    echo ""
    read -p "Press Enter to exit..."
    exit 1
fi
