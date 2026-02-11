import { BoardData } from '../types/board';
import { AppSettings } from '../types/settings';
import { Holiday, Country } from '../types/calendar';
import { CardTemplate } from '../types/card';

/// <summary>
/// Platform abstraction interface for all I/O operations.
/// Implementations exist for Electron (electronService) and Capacitor (capacitorService).
/// The runtime factory in platformService.ts selects the correct one based on the environment.
/// </summary>
export interface IPlatformService {
  // Platform detection
  readonly platform: 'electron' | 'capacitor' | 'web';

  // Board persistence
  loadBoard(dateKey: string): Promise<BoardData | null>;
  saveBoard(dateKey: string, data: BoardData): Promise<void>;
  loadBoardsInRange(startDate: string, endDate: string): Promise<Record<string, BoardData>>;

  // Settings
  getSettings(): Promise<AppSettings | null>;
  updateSettings(settings: Partial<AppSettings>): Promise<void>;

  // Templates
  loadTemplates(): Promise<CardTemplate[]>;
  saveTemplates(templates: CardTemplate[]): Promise<void>;

  // Holidays
  fetchHolidays(params: { countryCode: string; year: number; languageCode?: string }): Promise<Holiday[]>;
  fetchCountries(): Promise<Country[]>;

  // Export / Import (desktop only — on mobile these return unsupported)
  exportData(data: unknown): Promise<{ success: boolean; path?: string }>;
  importData(): Promise<{ success: boolean; data?: unknown }>;

  // Utilities
  openExternal(url: string): Promise<void>;
  clearAllData(): Promise<void>;
}
