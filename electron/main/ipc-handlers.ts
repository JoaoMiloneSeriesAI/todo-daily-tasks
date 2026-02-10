import { ipcMain } from 'electron';
import log from 'electron-log';
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
      log.error('Error loading data:', error);
      return null;
    }
  });

  ipcMain.handle('save-data', async (_, key: string, data: unknown) => {
    try {
      await dataService.saveBoard(key, data);
    } catch (error) {
      log.error('Error saving data:', error);
      throw error;
    }
  });

  ipcMain.handle('load-data-range', async (_, startDate: string, endDate: string) => {
    try {
      return await dataService.getBoardsInRange(startDate, endDate);
    } catch (error) {
      log.error('Error loading data range:', error);
      return {};
    }
  });

  // Settings operations
  ipcMain.handle('get-settings', async () => {
    try {
      return await dataService.getSettings();
    } catch (error) {
      log.error('Error getting settings:', error);
      throw error;
    }
  });

  ipcMain.handle('update-settings', async (_, settings: unknown) => {
    try {
      await dataService.updateSettings(settings);
    } catch (error) {
      log.error('Error updating settings:', error);
      throw error;
    }
  });

  // Holiday API operations
  ipcMain.handle('fetch-holidays', async (_, params: { countryCode: string; year: number; languageCode?: string }) => {
    try {
      return await holidayService.fetchHolidays(params);
    } catch (error) {
      log.error('Error fetching holidays:', error);
      throw error;
    }
  });

  ipcMain.handle('fetch-countries', async () => {
    try {
      return await holidayService.fetchCountries();
    } catch (error) {
      log.error('Error fetching countries:', error);
      throw error;
    }
  });

  // Clear all data
  ipcMain.handle('clear-all-data', async () => {
    try {
      await dataService.clearStore();
    } catch (error) {
      log.error('Error clearing all data:', error);
      throw error;
    }
  });

  // Export/Import operations
  ipcMain.handle('export-data', async (_, data: unknown) => {
    try {
      return await exportImportService.exportData(data);
    } catch (error) {
      log.error('Error exporting data:', error);
      return { success: false };
    }
  });

  ipcMain.handle('import-data', async () => {
    try {
      return await exportImportService.importData();
    } catch (error) {
      log.error('Error importing data:', error);
      return { success: false };
    }
  });
}
