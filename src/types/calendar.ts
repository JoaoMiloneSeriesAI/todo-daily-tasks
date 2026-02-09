export interface CalendarDay {
  date: Date;
  isToday: boolean;
  isWorkDay: boolean;
  isHoliday: boolean;
  holidayName?: string;
  holidayNames?: string[];
  taskCount: number;
  completedCount: number;
  cardTitles?: string[];
}

export interface Holiday {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  isRecurring: boolean;
  source: 'api' | 'custom';
}

export interface Country {
  code: string;
  name: string;
  languages: string[];
}

// OpenHolidaysAPI response types
export interface HolidayAPIResponse {
  id: string;
  startDate: string;
  endDate: string;
  type: string;
  name: Array<{ language: string; text: string }>;
  nationwide: boolean;
}

export interface CountryAPIResponse {
  isoCode: string;
  name: Array<{ language: string; text: string }>;
  officialLanguages: string[];
}
