#!/bin/bash
# macOS script to run the app in development mode

cd "$(dirname "$0")"

echo "=========================================="
echo "Task Manager - Development Mode (macOS)"
echo "=========================================="
echo ""
echo "Starting development server..."
echo ""

npm run dev:electron
