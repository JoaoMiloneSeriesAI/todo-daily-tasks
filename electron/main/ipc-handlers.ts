import { ipcMain } from 'electron';
import { DataService } from './services/dataService';
import { HolidayService } from './services/holidayService';
import { ExportImportService } from './services/exportImportService';

const dataService = new DataService();
const holidayService = new HolidayService();
const exportImportService = new ExportImportService();

export function setupIpcHandlers() {
  // Data operations
  ipcMain.handle('load-data', async (_, key: string) => {
    try {
      return await dataService.getBoard(key);
    } catch (error) {
      console.error('Error loading data:', error);
      return null;
    }
  });

  ipcMain.handle('save-data', async (_, key: string, data: unknown) => {
    try {
      await dataService.saveBoard(key, data);
    } catch (error) {
      console.error('Error saving data:', error);
      throw error;
    }
  });

  // Settings operations
  ipcMain.handle('get-settings', async () => {
    try {
      return await dataService.getSettings();
    } catch (error) {
      console.error('Error getting settings:', error);
      throw error;
    }
  });

  ipcMain.handle('update-settings', async (_, settings: unknown) => {
    try {
      await dataService.updateSettings(settings);
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  });

  // Holiday API operations
  ipcMain.handle('fetch-holidays', async (_, params: { countryCode: string; year: number; languageCode?: string }) => {
    try {
      return await holidayService.fetchHolidays(params);
    } catch (error) {
      console.error('Error fetching holidays:', error);
      throw error;
    }
  });

  ipcMain.handle('fetch-countries', async () => {
    try {
      return await holidayService.fetchCountries();
    } catch (error) {
      console.error('Error fetching countries:', error);
      throw error;
    }
  });

  // Export/Import operations
  ipcMain.handle('export-data', async (_, data: unknown) => {
    try {
      return await exportImportService.exportData(data);
    } catch (error) {
      console.error('Error exporting data:', error);
      return { success: false };
    }
  });

  ipcMain.handle('import-data', async () => {
    try {
      return await exportImportService.importData();
    } catch (error) {
      console.error('Error importing data:', error);
      return { success: false };
    }
  });
}
