# Task Manager

A cross-platform app for organizing daily tasks using a calendar-based Kanban board. Each day gets its own board with columns (TODO, Doing, Done, and custom ones). Built for macOS, Windows, Android, and iOS.

---

## Getting Started

You need **Node.js** installed. Download it from [nodejs.org](https://nodejs.org) (choose the LTS version).

### Run the App (for testing)

| Platform | What to do |
|---|---|
| **macOS** | Double-click `run-dev.command` |
| **Windows** | Double-click `run-dev.bat` |

The first time, it will install dependencies automatically. After that, the app window opens.

### Run the Tests

| Platform | What to do |
|---|---|
| **macOS** | Double-click `run-tests.command` |
| **Windows** | Double-click `run-tests.bat` |

Or from a terminal: `npm test`

### Build the App

#### Desktop (macOS / Windows)

| What you want | macOS | Windows |
|---|---|---|
| Build for macOS | Double-click `build-mac.command` | Not possible from Windows |
| Build for Windows | Double-click `build-all.command` | Double-click `build-windows.bat` |
| Build for both | Double-click `build-all.command` | Double-click `build-all.bat` (Windows only) |

Desktop build files appear in the **`Builds/`** folder.

> **Note:** macOS builds (DMG files) can only be created on a Mac. Windows builds can be created from either platform.

#### Android (APK)

**Prerequisites:** [Android Studio](https://developer.android.com/studio) installed (it includes the SDK and Java).

| Platform | What to do |
|---|---|
| **macOS** | Double-click `build-android.command` |
| **Windows** | Double-click `build-android.bat` |

That's it. The script handles everything automatically:
1. Builds the web assets
2. Syncs them into the Android project
3. Builds the APK and opens the output folder

The APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

To build a release APK: `npm run build:apk:release`

> **Tip:** To open the Android project in Android Studio for debugging or running on an emulator: `npm run cap:open:android`

#### iOS

**Prerequisites:** macOS with [Xcode](https://apps.apple.com/app/xcode/id497799835) installed (free from the App Store).

| Platform | What to do |
|---|---|
| **macOS** | Double-click `build-ios.command` |

The script builds the web assets, syncs them to the iOS project, and opens Xcode automatically. From Xcode you can:
- Click **Play** to run on the iPhone Simulator
- Select your iPhone from the device list to run on a real device
- Go to **Product > Archive** to create a release build

> **Note:** iOS builds can only be created on a Mac. Running on a physical iPhone requires a free Apple Developer account. Publishing to the App Store requires a paid Apple Developer account ($99/year).

---

## What's in the Builds Folder

After building, you'll find:

- **macOS:** `.dmg` installer (Apple Silicon + Intel) and `.zip` archive
- **Windows:** `.exe` installer and portable `.exe` (no install needed)
- **Android:** `.apk` file at `android/app/build/outputs/apk/debug/`
- **iOS:** Built via Xcode (Simulator or device)

---

## Features

- **Calendar View** -- Monthly calendar showing tasks, holidays, and work/non-work days
- **Kanban Board** -- Drag-and-drop cards between TODO, Doing, Done, and custom columns
- **Card Management** -- Templates, colored tags, checklists, descriptions
- **Click to View/Edit** -- Click a card to see details, edit inline, or switch to full edit mode
- **Move to Next Day** -- Send incomplete tasks to the next work day
- **Holiday Integration** -- Automatic public holidays from OpenHolidaysAPI (40+ countries)
- **Dark Mode** -- Light, dark, or system-based theme
- **Multi-Language** -- English and Spanish
- **Time Tracking** -- See how long tasks spend in each column ("Nerd Stats")
- **Dashboard** -- Charts showing task completion, time breakdown, and tag distribution
- **Settings** -- Work days, templates, tags, holidays, appearance, data export/import (desktop)
- **First-Time Setup** -- Guided wizard for country, work days, language, and theme
- **Local Storage** -- All data stays on your device, no cloud needed
- **Mobile (Android + iOS)** -- Full mobile experience with touch drag-and-drop, portrait/landscape, bottom tab navigation

---

## Terminal Commands

If you prefer using the terminal instead of double-clicking scripts:

### Desktop

| Action | Command |
|---|---|
| Run the app | `npm run dev` |
| Run tests | `npm test` |
| Run tests in watch mode | `npm run test:watch` |
| Build for macOS | `npm run build:mac` |
| Build for Windows | `npm run build:win` |
| Build for both | `npm run build:all` |
| Test holiday API | `npm run test:holidays` |

### Mobile

| Action | Command |
|---|---|
| Build web assets for mobile | `npm run build:mobile` |
| Build debug APK (Android) | `npm run build:apk` |
| Build release APK (Android) | `npm run build:apk:release` |
| Build for iOS (opens Xcode) | `npm run build:ios` |
| Sync web assets to both platforms | `npm run cap:sync` |
| Open Android project in Android Studio | `npm run cap:open:android` |
| Open iOS project in Xcode | `npm run cap:open:ios` |
| Run mobile dev server | `npm run dev:mobile` |

---

## Project Structure

```
todo-daily-tasks/
  electron/           -- Desktop app shell (Electron main process)
    main/             -- Window management, IPC handlers, services
    preload/          -- Secure bridge between app and desktop
  src/                -- The app itself (React, shared between desktop and mobile)
    components/       -- UI screens (calendar, board, dashboard, settings)
    stores/           -- App state (Zustand)
    types/            -- TypeScript definitions
    utils/            -- Helper functions (time tracking, validators, etc.)
    services/         -- Platform abstraction layer (Electron + Capacitor)
    hooks/            -- React hooks (platform detection, orientation, etc.)
    locales/          -- Translations (English, Spanish)
    styles/           -- CSS and theme files
  android/            -- Android project (auto-generated by Capacitor)
  ios/                -- iOS project (auto-generated by Capacitor)
  scripts/            -- Build scripts (APK, iOS, diagnostics)
  Builds/             -- Desktop builds appear here after running a build
  public/icons/       -- App icons (PNG, ICNS, ICO)
```

---

## Troubleshooting

**"Node.js is not installed"** -- Download and install from [nodejs.org](https://nodejs.org). Restart your terminal after installing.

**App shows a blank screen** -- Make sure you're running `npm run dev`, not opening the HTML file directly.

**Build fails** -- Try deleting `node_modules` and running the script again. It will reinstall everything.

**Holidays not showing** -- Run `npm run test:holidays` to check if the API has data for your country and year. Some countries don't have future-year data yet.

**Android build fails with "SDK not found"** -- Make sure `ANDROID_HOME` is set. On macOS, add `export ANDROID_HOME=~/Library/Android/sdk` to your `~/.zshrc`. On Windows, set it in System Environment Variables (typically `C:\Users\<you>\AppData\Local\Android\Sdk`).

**Android build fails with "Java not found"** -- Install Java 17+ via Android Studio settings (Preferences > Build > Gradle > JDK) or separately from [adoptium.net](https://adoptium.net).

**iOS build fails with "Xcode not found"** -- Install Xcode from the Mac App Store, open it once to accept the license, then try again.

**iOS "No signing certificate"** -- In Xcode, go to the project settings (click "App" in the sidebar) > Signing & Capabilities > check "Automatically manage signing" and select your Apple ID team.

---

## Tech Stack

- **Desktop:** Electron 40 + React 19 + TypeScript 5
- **Mobile:** Capacitor 7 (Android + iOS ready)
- Tailwind CSS 4 for styling
- Zustand for state management
- dnd-kit for drag and drop (touch + pointer)
- Recharts for dashboard charts
- date-fns for date handling
- Vite 7 for building
- Vitest for testing

---

## License

MIT
