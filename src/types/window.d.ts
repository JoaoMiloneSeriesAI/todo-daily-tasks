import { BoardData } from './board';
import { AppSettings } from './settings';
import { Holiday, Country } from './calendar';

export interface ElectronAPI {
  // Data operations
  loadData: (key: string) => Promise<BoardData | null>;
  saveData: (key: string, data: BoardData) => Promise<void>;
  loadDataRange: (startDate: string, endDate: string) => Promise<Record<string, BoardData>>;

  // Settings
  getSettings: () => Promise<AppSettings>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;

  // Holidays
  fetchHolidays: (params: { countryCode: string; year: number; languageCode?: string }) => Promise<Holiday[]>;
  fetchCountries: () => Promise<Country[]>;

  // Export/Import
  exportData: (data: unknown) => Promise<{ success: boolean; path?: string }>;
  importData: () => Promise<{ success: boolean; data?: unknown }>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
