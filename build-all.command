#!/bin/bash
# Build for both macOS and Windows

cd "$(dirname "$0")"

echo "=========================================="
echo "Task Manager - Build for All Platforms"
echo "=========================================="
echo ""
echo "Building TypeScript and React..."
npm run build

echo ""
echo "Packaging for macOS and Windows..."
npm run build:all

echo ""
echo "=========================================="
echo "Build Complete!"
echo "=========================================="
echo "Build files are in: ./release"
echo ""
ls -lh release/
