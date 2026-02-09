import { BoardData } from '../types/board';
import { AppSettings } from '../types/settings';
import { Holiday, Country } from '../types/calendar';

/// <summary>
/// Centralized IPC service that wraps window.electronAPI calls with proper
/// TypeScript types, error handling, and graceful fallback for browser dev mode.
/// All stores should import from this service instead of calling window.electronAPI directly.
/// </summary>
class IpcServiceClass {
  private get api() {
    return window.electronAPI;
  }

  private get isAvailable(): boolean {
    return typeof window !== 'undefined' && !!window.electronAPI;
  }

  // Data operations

  async loadBoard(dateKey: string): Promise<BoardData | null> {
    if (!this.isAvailable) {
      console.warn('IPC not available - running in browser mode');
      return null;
    }

    try {
      return await this.api.loadData(dateKey);
    } catch (error) {
      console.error(`Failed to load board for ${dateKey}:`, error);
      return null;
    }
  }

  async saveBoard(dateKey: string, data: BoardData): Promise<void> {
    if (!this.isAvailable) {
      console.warn('IPC not available - running in browser mode');
      return;
    }

    try {
      await this.api.saveData(dateKey, data);
    } catch (error) {
      console.error(`Failed to save board for ${dateKey}:`, error);
      throw error;
    }
  }

  async loadBoardsInRange(startDate: string, endDate: string): Promise<Record<string, BoardData>> {
    if (!this.isAvailable) {
      console.warn('IPC not available - running in browser mode');
      return {};
    }

    try {
      return await this.api.loadDataRange(startDate, endDate);
    } catch (error) {
      console.error(`Failed to load boards in range ${startDate} - ${endDate}:`, error);
      return {};
    }
  }

  // Settings operations

  async getSettings(): Promise<AppSettings | null> {
    if (!this.isAvailable) {
      console.warn('IPC not available - running in browser mode');
      return null;
    }

    try {
      return await this.api.getSettings();
    } catch (error) {
      console.error('Failed to load settings:', error);
      return null;
    }
  }

  async updateSettings(settings: Partial<AppSettings>): Promise<void> {
    if (!this.isAvailable) {
      console.warn('IPC not available - running in browser mode');
      return;
    }

    try {
      await this.api.updateSettings(settings);
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  }

  // Holiday operations

  async fetchHolidays(params: {
    countryCode: string;
    year: number;
    languageCode?: string;
  }): Promise<Holiday[]> {
    if (!this.isAvailable) {
      console.warn('IPC not available - running in browser mode');
      return [];
    }

    try {
      return await this.api.fetchHolidays(params);
    } catch (error) {
      console.error('Failed to fetch holidays:', error);
      return [];
    }
  }

  async fetchCountries(): Promise<Country[]> {
    if (!this.isAvailable) {
      console.warn('IPC not available - running in browser mode');
      return [];
    }

    try {
      return await this.api.fetchCountries();
    } catch (error) {
      console.error('Failed to fetch countries:', error);
      return [];
    }
  }

  // Export/Import operations

  async exportData(data: unknown): Promise<{ success: boolean; path?: string }> {
    if (!this.isAvailable) {
      console.warn('IPC not available - running in browser mode');
      return { success: false };
    }

    try {
      return await this.api.exportData(data);
    } catch (error) {
      console.error('Failed to export data:', error);
      return { success: false };
    }
  }

  async importData(): Promise<{ success: boolean; data?: unknown }> {
    if (!this.isAvailable) {
      console.warn('IPC not available - running in browser mode');
      return { success: false };
    }

    try {
      return await this.api.importData();
    } catch (error) {
      console.error('Failed to import data:', error);
      return { success: false };
    }
  }
}

export const ipcService = new IpcServiceClass();
