# Task Manager - Cross-Platform Desktop App

A beautiful, feature-rich task management application built with Electron, React, and TypeScript.

## 🚀 Quick Start

### Development Mode

**macOS:**
```bash
# Double-click to run
./run-dev.command

# Or use npm
npm run dev:electron
```

**Windows:**
```bash
# Double-click to run
run-dev.bat

# Or use npm
npm run dev:electron
```

### Building for Production

**Build for macOS:**
```bash
# Double-click to run
./build-mac.command

# Or use npm
npm run build:mac
```

**Build for Windows:**
```bash
# Double-click to run
build-windows.bat

# Or use npm
npm run build:win
```

**Build for Both Platforms:**
```bash
# macOS only
./build-all.command

# Or use npm
npm run build:all
```

## ✨ Features

### ✅ Implemented
- **Calendar View** - Monthly calendar with holiday integration and work day indicators
- **Kanban Board** - Drag-and-drop task management with custom columns
- **Card Management** - Create, edit, and organize tasks with templates
- **Checklist Support** - Add subtasks to any card
- **Tag System** - Categorize tasks with custom tags
- **Data Persistence** - Local storage using electron-store
- **Holiday Integration** - Fetch holidays from OpenHolidaysAPI
- **Export/Import** - Backup and restore your data

### 🚧 Coming Soon
- Time Tracking System with "Nerd Stats"
- Analytics Dashboard with charts
- Settings Page (work days, templates, holidays)
- Animations and polish
- Multi-language support (English, Spanish)

## 🛠️ Tech Stack

- **Framework:** Electron.js v29+
- **UI:** React v18+ with TypeScript v5+
- **Styling:** Tailwind CSS v4 with MatDash Design System
- **State Management:** Zustand
- **Drag & Drop:** dnd-kit
- **Animations:** Framer Motion
- **Charts:** Recharts
- **Date Handling:** date-fns
- **Build Tool:** Vite v5+
- **Packaging:** Electron Builder

## 📁 Project Structure

```
todo-daily-tasks/
├── electron/              # Electron main process
│   ├── main/             # Main process code
│   │   ├── index.ts      # Entry point
│   │   ├── window.ts     # Window management
│   │   └── services/     # Data, holiday, export services
│   └── preload/          # Preload scripts (IPC bridge)
├── src/                  # React application
│   ├── components/       # React components
│   │   ├── calendar/     # Calendar view
│   │   ├── board/        # Kanban board
│   │   └── shared/       # Reusable components
│   ├── stores/           # Zustand state management
│   ├── types/            # TypeScript definitions
│   ├── utils/            # Helper functions
│   └── styles/           # Global styles
├── public/               # Static assets
└── release/              # Built applications (after build)
```

## 🎨 Design System

- **Primary Color:** Indigo (#6366F1)
- **Secondary Colors:** Pink, Cyan, Teal, Green, Yellow
- **Font:** Inter
- **Design:** MatDash - Modern dashboard aesthetic

## 📦 Build Output

After building, find your apps in the `release/` folder:

**macOS:**
- `.dmg` - Installer disk image
- `.zip` - Portable archive
- Universal build (Intel + Apple Silicon)

**Windows:**
- `.exe` - NSIS installer
- Portable `.exe` - No installation required

## 🔧 Development Scripts

```bash
npm run dev              # Start Vite dev server
npm run dev:electron     # Start Electron with hot reload
npm run build            # Build for production
npm run build:mac        # Package for macOS
npm run build:win        # Package for Windows
npm run build:all        # Package for both platforms
npm run lint             # Run ESLint
```

## 🐛 Troubleshooting

### npm cache issues
```bash
sudo chown -R $(id -u):$(id -g) "/Users/$(whoami)/.npm"
npm cache clean --force
```

### Port already in use
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Build fails
```bash
# Clean and rebuild
rm -rf node_modules dist dist-electron release
npm install
npm run build
```

## 📝 License

MIT

## 👥 Author

Built with ❤️ using Claude Code
