#!/bin/bash
# macOS script to build the app for macOS

cd "$(dirname "$0")"

echo "=========================================="
echo "Task Manager - Build for macOS"
echo "=========================================="
echo ""
echo "Building TypeScript and React..."
npm run build

echo ""
echo "Packaging for macOS (DMG + ZIP)..."
npm run build:mac

echo ""
echo "=========================================="
echo "Build Complete!"
echo "=========================================="
echo "Build files are in: ./release"
echo ""
ls -lh release/
