"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  // Data operations
  loadData: (key) => electron.ipcRenderer.invoke("load-data", key),
  saveData: (key, data) => electron.ipcRenderer.invoke("save-data", key, data),
  // Settings
  getSettings: () => electron.ipcRenderer.invoke("get-settings"),
  updateSettings: (settings) => electron.ipcRenderer.invoke("update-settings", settings),
  // Holidays
  fetchHolidays: (params) => electron.ipcRenderer.invoke("fetch-holidays", params),
  fetchCountries: () => electron.ipcRenderer.invoke("fetch-countries"),
  // Export/Import
  exportData: (data) => electron.ipcRenderer.invoke("export-data", data),
  importData: () => electron.ipcRenderer.invoke("import-data")
});
