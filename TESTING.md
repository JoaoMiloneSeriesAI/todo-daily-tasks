# Task Manager - How to Run, Test, and Build

This guide explains how to run the app for testing, run automated tests, and build distributable packages. No programming experience is required.

---

## Prerequisites

You need **Node.js** installed on your computer.

- Download it from: https://nodejs.org
- Choose the **LTS** (Long Term Support) version
- Run the installer and follow the prompts

To verify it's installed, open a terminal (macOS: Terminal app, Windows: Command Prompt) and type:

```
node --version
```

You should see a version number like `v20.x.x` or higher.

---

## Running the App (Development Mode)

This lets you test the app without building a full installer.

### macOS
Double-click **`run-dev.command`** in Finder.

### Windows
Double-click **`run-dev.bat`** in File Explorer.

### What happens
- The first time you run it, dependencies will be installed automatically (this takes a few minutes)
- The app window will open
- Changes to the code are reflected immediately (hot reload)
- Close the terminal window to stop the app

---

## Running Tests

Automated tests verify that the core logic works correctly.

### macOS
Double-click **`run-tests.command`** in Finder.

### Windows
Double-click **`run-tests.bat`** in File Explorer.

### From the terminal
```
npm test
```

### What to expect
You'll see output like:

```
 Test Files  5 passed (5)
      Tests  75 passed (75)
```

If any tests fail, the output will show which test failed and why.

---

## Building the App

Building creates a distributable package (installer or portable app) that can be shared with others.

### Build for macOS (from a Mac)

Double-click **`build-mac.command`**

This creates:
- A `.dmg` file (disk image installer)
- A `.zip` file (compressed app)

### Build for Windows (from Windows)

Double-click **`build-windows.bat`**

This creates:
- An `.exe` installer (NSIS)
- A portable `.exe` (no installation required)

### Build for Both Platforms (from a Mac)

Double-click **`build-all.command`**

This creates macOS AND Windows builds from your Mac.

### Build for Both Platforms (from Windows)

Double-click **`build-all.bat`**

**Important:** From Windows, this can only build Windows packages. macOS builds require a Mac (the DMG format and .icns icons need macOS-specific tools).

---

## Where Are the Build Files?

All builds are placed in the **`Builds/`** folder at the root of the project.

After building, the folder will contain files like:

```
Builds/
  Task Manager-2.0.0-arm64.dmg      (macOS Apple Silicon installer)
  Task Manager-2.0.0-x64.dmg        (macOS Intel installer)
  Task Manager-2.0.0-arm64-mac.zip  (macOS Apple Silicon zip)
  Task Manager-2.0.0-x64-mac.zip    (macOS Intel zip)
  Task Manager Setup 2.0.0.exe      (Windows installer)
  Task Manager 2.0.0.exe            (Windows portable)
```

---

## Cross-Platform Building Summary

| Building FROM | Can build for macOS? | Can build for Windows? |
|---|---|---|
| **macOS** | Yes | Yes |
| **Windows** | No | Yes |

To build macOS packages, you need a Mac. This is a limitation of the DMG format and macOS code signing, not something we can work around.

---

## Terminal Commands Reference

If you prefer using the terminal instead of double-clicking scripts:

| Action | Command |
|---|---|
| Run the app | `npm run dev` |
| Run tests | `npm test` |
| Run tests in watch mode | `npm run test:watch` |
| Run tests with coverage | `npm run test:coverage` |
| Build for macOS | `npm run build:mac` |
| Build for Windows | `npm run build:win` |
| Build for both | `npm run build:all` |

---

## Troubleshooting

### "Node.js is not installed"
Download and install Node.js from https://nodejs.org. Restart your terminal after installing.

### "Failed to install dependencies"
- Check your internet connection
- Try deleting the `node_modules` folder and running the script again

### The app opens but shows a blank screen
- Make sure you're running `npm run dev`, not just opening the HTML file
- Check the terminal for error messages

### Build fails
- Make sure all tests pass first (`npm test`)
- Make sure you have enough disk space (builds can be 200+ MB)
- On macOS, if you see signing errors, you can ignore them for local testing (the app will still work, it just won't be signed for distribution)
