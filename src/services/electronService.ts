import { BoardData } from '../types/board';
import { AppSettings } from '../types/settings';
import { Holiday, Country } from '../types/calendar';
import { CardTemplate } from '../types/card';
import { IPlatformService } from './IPlatformService';

/// <summary>
/// Electron implementation of IPlatformService.
/// Wraps window.electronAPI calls (exposed via preload contextBridge) with
/// TypeScript types, error handling, and graceful fallback for browser dev mode.
/// </summary>
class ElectronServiceClass implements IPlatformService {
  readonly platform = 'electron' as const;

  private get api() {
    return window.electronAPI;
  }

  private get isAvailable(): boolean {
    return typeof window !== 'undefined' && !!window.electronAPI;
  }

  // Board persistence

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

  // Settings

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

  // Templates

  async loadTemplates(): Promise<CardTemplate[]> {
    if (!this.isAvailable) {
      console.warn('IPC not available - running in browser mode');
      return [];
    }

    try {
      const templates = await this.api.loadData('templates');
      return Array.isArray(templates) ? templates as CardTemplate[] : [];
    } catch (error) {
      console.error('Failed to load templates:', error);
      return [];
    }
  }

  async saveTemplates(templates: CardTemplate[]): Promise<void> {
    if (!this.isAvailable) {
      console.warn('IPC not available - running in browser mode');
      return;
    }

    try {
      await this.api.saveData('templates', templates as any);
    } catch (error) {
      console.error('Failed to save templates:', error);
    }
  }

  // Holidays

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

  // Export/Import

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

  // Utilities

  async openExternal(url: string): Promise<void> {
    if (!this.isAvailable) {
      console.warn('IPC not available - running in browser mode');
      return;
    }

    try {
      await this.api.openExternal(url);
    } catch (error) {
      console.error('Failed to open external URL:', error);
    }
  }

  async clearAllData(): Promise<void> {
    if (!this.isAvailable) {
      console.warn('IPC not available - running in browser mode');
      return;
    }

    try {
      await this.api.clearAllData();
    } catch (error) {
      console.error('Failed to clear all data:', error);
      throw error;
    }
  }
}

export const electronService = new ElectronServiceClass();
