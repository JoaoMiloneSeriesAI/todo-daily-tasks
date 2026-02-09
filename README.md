# Task Manager

A desktop app for organizing daily tasks using a calendar-based Kanban board. Each day gets its own board with columns (TODO, Doing, Done, and custom ones). Built for macOS and Windows.

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

### Build the App (create installers)

| What you want | macOS | Windows |
|---|---|---|
| Build for macOS | Double-click `build-mac.command` | Not possible from Windows |
| Build for Windows | Double-click `build-all.command` | Double-click `build-windows.bat` |
| Build for both | Double-click `build-all.command` | Double-click `build-all.bat` (Windows only) |

Build files appear in the **`Builds/`** folder.

> **Note:** macOS builds (DMG files) can only be created on a Mac. Windows builds can be created from either platform.

---

## What's in the Builds Folder

After building, you'll find:

- **macOS:** `.dmg` installer (Apple Silicon + Intel) and `.zip` archive
- **Windows:** `.exe` installer and portable `.exe` (no install needed)

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
- **Settings** -- Work days, templates, tags, holidays, appearance, data export/import
- **First-Time Setup** -- Guided wizard for country, work days, language, and theme
- **Local Storage** -- All data stays on your computer, no cloud needed

---

## Terminal Commands

If you prefer using the terminal instead of double-clicking scripts:

| Action | Command |
|---|---|
| Run the app | `npm run dev` |
| Run tests | `npm test` |
| Run tests in watch mode | `npm run test:watch` |
| Build for macOS | `npm run build:mac` |
| Build for Windows | `npm run build:win` |
| Build for both | `npm run build:all` |
| Test holiday API | `npm run test:holidays` |

---

## Project Structure

```
todo-daily-tasks/
  electron/           -- Desktop app shell (Electron main process)
    main/             -- Window management, IPC handlers, services
    preload/          -- Secure bridge between app and desktop
  src/                -- The app itself (React)
    components/       -- UI screens (calendar, board, dashboard, settings)
    stores/           -- App state (Zustand)
    types/            -- TypeScript definitions
    utils/            -- Helper functions (time tracking, validators, etc.)
    services/         -- IPC communication layer
    locales/          -- Translations (English, Spanish)
    styles/           -- CSS and theme files
  scripts/            -- Diagnostic tools (holiday API tester)
  Builds/             -- Built apps appear here after running a build
  public/icons/       -- App icons (PNG, ICNS, ICO)
```

---

## Troubleshooting

**"Node.js is not installed"** -- Download and install from [nodejs.org](https://nodejs.org). Restart your terminal after installing.

**App shows a blank screen** -- Make sure you're running `npm run dev`, not opening the HTML file directly.

**Build fails** -- Try deleting `node_modules` and running the script again. It will reinstall everything.

**Holidays not showing** -- Run `npm run test:holidays` to check if the API has data for your country and year. Some countries don't have future-year data yet.

---

## Tech Stack

- Electron 40 + React 19 + TypeScript 5
- Tailwind CSS 4 for styling
- Zustand for state management
- dnd-kit for drag and drop
- Recharts for dashboard charts
- date-fns for date handling
- Vite 7 for building
- Vitest for testing

---

## License

MIT
