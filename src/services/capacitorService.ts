import { BoardData } from '../types/board';
import { AppSettings, DEFAULT_SETTINGS } from '../types/settings';
import { Holiday, Country } from '../types/calendar';
import { CardTemplate } from '../types/card';
import { IPlatformService } from './IPlatformService';
import { Preferences } from '@capacitor/preferences';
import { CapacitorHttp } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

/// <summary>
/// Capacitor (mobile) implementation of IPlatformService.
/// Uses @capacitor/preferences for persistence, native HTTP for API calls,
/// and @capacitor/browser for external URLs.
/// Export/Import is not supported on mobile and returns safe defaults.
/// </summary>

const STORAGE_KEYS = {
  BOARDS: 'boards',
  SETTINGS: 'settings',
  TEMPLATES: 'templates',
  TAGS: 'tags',
} as const;

const HOLIDAYS_API_BASE = 'https://openholidaysapi.org';

// ---- Internal storage helpers ----

async function getStoredJson<T>(key: string): Promise<T | null> {
  try {
    const { value } = await Preferences.get({ key });
    if (value) {
      return JSON.parse(value) as T;
    }
    return null;
  } catch (error) {
    console.error(`[CapacitorService] Failed to read key "${key}":`, error);
    return null;
  }
}

async function setStoredJson(key: string, data: unknown): Promise<void> {
  try {
    await Preferences.set({ key, value: JSON.stringify(data) });
  } catch (error) {
    console.error(`[CapacitorService] Failed to write key "${key}":`, error);
    throw error;
  }
}

// ---- Holiday API helpers ----

interface HolidayAPIResponse {
  id: string;
  startDate: string;
  endDate: string;
  type: string;
  name: Array<{ language: string; text: string }>;
  nationwide: boolean;
}

interface CountryAPIResponse {
  isoCode: string;
  name: Array<{ language: string; text: string }>;
  officialLanguages: string[];
}

/// <summary>
/// Raw holiday fetch using Capacitor's native HTTP (bypasses CORS).
/// </summary>
async function fetchHolidaysRaw(
  countryCode: string,
  validFrom: string,
  validTo: string,
  languageIsoCode: string | undefined
): Promise<Holiday[]> {
  try {
    const params: Record<string, string> = {
      countryIsoCode: countryCode,
      validFrom,
      validTo,
    };
    if (languageIsoCode) {
      params.languageIsoCode = languageIsoCode;
    }

    const queryString = Object.entries(params)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');

    const response = await CapacitorHttp.get({
      url: `${HOLIDAYS_API_BASE}/PublicHolidays?${queryString}`,
      headers: { Accept: 'application/json' },
    });

    if (response.status === 404) return [];
    if (!Array.isArray(response.data)) return [];

    return (response.data as HolidayAPIResponse[]).map((holiday) => {
      const nameInLang = languageIsoCode
        ? holiday.name.find((n) => n.language === languageIsoCode)?.text
        : undefined;
      const name = nameInLang || holiday.name[0]?.text || 'Holiday';

      return {
        id: holiday.id,
        name,
        date: holiday.startDate,
        isRecurring: false,
        source: 'api' as const,
      };
    });
  } catch (error) {
    console.error('[CapacitorService] Holiday fetch error:', error);
    return [];
  }
}

// ---- Service implementation ----

class CapacitorServiceClass implements IPlatformService {
  readonly platform = 'capacitor' as const;

  // Board persistence

  async loadBoard(dateKey: string): Promise<BoardData | null> {
    try {
      const boards = await getStoredJson<Record<string, BoardData>>(STORAGE_KEYS.BOARDS);
      if (boards && boards[dateKey]) {
        return boards[dateKey];
      }
      return null;
    } catch (error) {
      console.error(`[CapacitorService] Failed to load board for ${dateKey}:`, error);
      return null;
    }
  }

  async saveBoard(dateKey: string, data: BoardData): Promise<void> {
    try {
      const boards = await getStoredJson<Record<string, BoardData>>(STORAGE_KEYS.BOARDS) || {};
      boards[dateKey] = data;
      await setStoredJson(STORAGE_KEYS.BOARDS, boards);
    } catch (error) {
      console.error(`[CapacitorService] Failed to save board for ${dateKey}:`, error);
      throw error;
    }
  }

  async loadBoardsInRange(startDate: string, endDate: string): Promise<Record<string, BoardData>> {
    try {
      const boards = await getStoredJson<Record<string, BoardData>>(STORAGE_KEYS.BOARDS);
      if (!boards) return {};

      const result: Record<string, BoardData> = {};
      for (const [key, value] of Object.entries(boards)) {
        if (key >= startDate && key <= endDate) {
          result[key] = value;
        }
      }
      return result;
    } catch (error) {
      console.error(`[CapacitorService] Failed to load boards in range ${startDate} - ${endDate}:`, error);
      return {};
    }
  }

  // Settings

  async getSettings(): Promise<AppSettings | null> {
    try {
      const settings = await getStoredJson<AppSettings>(STORAGE_KEYS.SETTINGS);
      return settings || DEFAULT_SETTINGS;
    } catch (error) {
      console.error('[CapacitorService] Failed to load settings:', error);
      return DEFAULT_SETTINGS;
    }
  }

  async updateSettings(settings: Partial<AppSettings>): Promise<void> {
    try {
      const current = await getStoredJson<AppSettings>(STORAGE_KEYS.SETTINGS) || DEFAULT_SETTINGS;
      const merged = { ...current, ...settings };
      await setStoredJson(STORAGE_KEYS.SETTINGS, merged);
    } catch (error) {
      console.error('[CapacitorService] Failed to update settings:', error);
      throw error;
    }
  }

  // Templates

  async loadTemplates(): Promise<CardTemplate[]> {
    try {
      const templates = await getStoredJson<CardTemplate[]>(STORAGE_KEYS.TEMPLATES);
      return Array.isArray(templates) ? templates : [];
    } catch (error) {
      console.error('[CapacitorService] Failed to load templates:', error);
      return [];
    }
  }

  async saveTemplates(templates: CardTemplate[]): Promise<void> {
    try {
      await setStoredJson(STORAGE_KEYS.TEMPLATES, templates);
    } catch (error) {
      console.error('[CapacitorService] Failed to save templates:', error);
    }
  }

  // Holidays — port of HolidayService fallback logic

  async fetchHolidays(params: {
    countryCode: string;
    year: number;
    languageCode?: string;
  }): Promise<Holiday[]> {
    const startDate = `${params.year}-01-01`;
    const endDate = `${params.year}-12-31`;
    const languageCode = params.languageCode || 'EN';

    // First attempt: with language code
    let holidays = await fetchHolidaysRaw(
      params.countryCode, startDate, endDate, languageCode
    );

    // Fallback: if 0 results, retry WITHOUT languageIsoCode
    if (holidays.length === 0) {
      holidays = await fetchHolidaysRaw(
        params.countryCode, startDate, endDate, undefined
      );
    }

    // Second fallback: if still 0 and year is current year, try previous year
    if (holidays.length === 0) {
      const currentYear = new Date().getFullYear();
      if (params.year === currentYear) {
        const prevStart = `${params.year - 1}-01-01`;
        const prevEnd = `${params.year - 1}-12-31`;
        holidays = await fetchHolidaysRaw(
          params.countryCode, prevStart, prevEnd, undefined
        );
        if (holidays.length > 0) {
          holidays = holidays.map((h) => ({
            ...h,
            id: `${h.id}-shifted-${params.year}`,
            date: h.date.replace(`${params.year - 1}`, `${params.year}`),
          }));
        }
      }
    }

    return holidays;
  }

  async fetchCountries(): Promise<Country[]> {
    try {
      const response = await CapacitorHttp.get({
        url: `${HOLIDAYS_API_BASE}/Countries`,
        headers: { Accept: 'application/json' },
      });

      if (!Array.isArray(response.data)) return [];

      return (response.data as CountryAPIResponse[]).map((country) => ({
        code: country.isoCode,
        name: country.name.find((n) => n.language === 'EN')?.text || country.name[0]?.text || country.isoCode,
        languages: country.officialLanguages || [],
      }));
    } catch (error) {
      console.error('[CapacitorService] Failed to fetch countries:', error);
      return [];
    }
  }

  // Export / Import — NOT supported on mobile

  async exportData(_data: unknown): Promise<{ success: boolean; path?: string }> {
    console.warn('[CapacitorService] Export is not supported on mobile');
    return { success: false };
  }

  async importData(): Promise<{ success: boolean; data?: unknown }> {
    console.warn('[CapacitorService] Import is not supported on mobile');
    return { success: false };
  }

  // Utilities

  async openExternal(url: string): Promise<void> {
    try {
      if (url.startsWith('http://') || url.startsWith('https://')) {
        await Browser.open({ url });
      }
    } catch (error) {
      console.error('[CapacitorService] Failed to open external URL:', error);
    }
  }

  async clearAllData(): Promise<void> {
    try {
      await Preferences.clear();
    } catch (error) {
      console.error('[CapacitorService] Failed to clear all data:', error);
      throw error;
    }
  }
}

export const capacitorService = new CapacitorServiceClass();
