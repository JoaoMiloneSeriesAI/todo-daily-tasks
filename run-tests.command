#!/bin/bash
# ==========================================
# Task Manager - Run Tests
# macOS - Double-click this file to run tests
# ==========================================

cd "$(dirname "$0")"

echo ""
echo "=========================================="
echo "  Task Manager - Running Tests"
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

echo "Running unit tests..."
echo ""

npm test

echo ""
if [ $? -eq 0 ]; then
    echo "=========================================="
    echo "  All tests passed!"
    echo "=========================================="
else
    echo "=========================================="
    echo "  Some tests failed. See output above."
    echo "=========================================="
fi

echo ""
read -p "Press Enter to exit..."
