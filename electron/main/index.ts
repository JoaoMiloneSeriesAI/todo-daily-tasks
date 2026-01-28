import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { setupIpcHandlers } from './ipc-handlers';
import { createMainWindow } from './window';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;

// Handle creating/removing shortcuts on Windows when installing/uninstalling
try {
  if (require('electron-squirrel-startup')) {
    app.quit();
  }
} catch (e) {
  // electron-squirrel-startup is optional, only needed for Windows builds
  console.log('electron-squirrel-startup not available (optional)');
}

function initialize() {
  // Create main window
  mainWindow = createMainWindow();

  // Setup IPC handlers
  setupIpcHandlers();

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  initialize();

  app.on('activate', () => {
    // On macOS it's common to re-create a window when dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      initialize();
    }
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle app quit
app.on('before-quit', () => {
  if (mainWindow) {
    mainWindow.removeAllListeners('close');
    mainWindow.close();
  }
});
