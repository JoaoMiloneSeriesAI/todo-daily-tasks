import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use ipcRenderer
// without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Data operations
  loadData: (key: string) => ipcRenderer.invoke('load-data', key),
  saveData: (key: string, data: unknown) => ipcRenderer.invoke('save-data', key, data),

  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  updateSettings: (settings: unknown) => ipcRenderer.invoke('update-settings', settings),

  // Holidays
  fetchHolidays: (params: { countryCode: string; year: number; languageCode?: string }) =>
    ipcRenderer.invoke('fetch-holidays', params),
  fetchCountries: () => ipcRenderer.invoke('fetch-countries'),

  // Export/Import
  exportData: (data: unknown) => ipcRenderer.invoke('export-data', data),
  importData: () => ipcRenderer.invoke('import-data'),
});
