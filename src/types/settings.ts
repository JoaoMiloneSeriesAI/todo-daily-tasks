export interface AppSettings {
  general: GeneralSettings;
  workDays: WorkDaysSettings;
  holidays: HolidaySettings;
  appearance: AppearanceSettings;
}

export interface GeneralSettings {
  language: string;
  firstDayOfWeek: 0 | 1; // 0 = Sunday, 1 = Monday
  dateFormat: string;
  timeFormat: '12h' | '24h';
}

export interface WorkDaysSettings {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

export interface HolidaySettings {
  country: string;
  subdivision?: string;
  autoFetch: boolean;
  customHolidays: CustomHoliday[];
}

export interface CustomHoliday {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  recurring: boolean;
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  accentColor: string;
  enableAnimations: boolean;
  enableSounds: boolean;
}

// Default settings
export const DEFAULT_SETTINGS: AppSettings = {
  general: {
    language: 'en',
    firstDayOfWeek: 1, // Monday
    dateFormat: 'MM/dd/yyyy',
    timeFormat: '12h',
  },
  workDays: {
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false,
  },
  holidays: {
    country: 'US',
    autoFetch: true,
    customHolidays: [],
  },
  appearance: {
    theme: 'light',
    accentColor: '#6366F1',
    enableAnimations: true,
    enableSounds: true,
  },
};
