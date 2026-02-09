#!/bin/bash
# ==========================================
# Task Manager - Build for macOS
# macOS - Double-click this file to build
# ==========================================

cd "$(dirname "$0")"

echo ""
echo "=========================================="
echo "  Task Manager - Build for macOS"
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

echo "Building for macOS (DMG + ZIP)..."
echo "This may take several minutes..."
echo ""

npm run build:mac

if [ $? -ne 0 ]; then
    echo ""
    echo "ERROR: Build failed. Check the output above for details."
    echo ""
    read -p "Press Enter to exit..."
    exit 1
fi

echo ""
echo "=========================================="
echo "  Build Complete!"
echo "=========================================="
echo ""
echo "Build files are in: ./Builds/"
echo ""

if [ -d "Builds" ]; then
    ls -lh Builds/
    echo ""
    # Open the Builds folder in Finder
    open Builds/
fi

read -p "Press Enter to exit..."
