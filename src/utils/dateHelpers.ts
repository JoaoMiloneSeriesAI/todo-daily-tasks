import { format, isToday as isTodayFn, isSameDay, startOfWeek, addDays } from 'date-fns';
import { WorkDaysSettings } from '../types/settings';
import { getDateLocale } from './dateFnsLocale';

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  return isTodayFn(date);
}

/**
 * Check if a date is a work day based on settings
 */
export function isWorkDay(date: Date, workDaysSettings: WorkDaysSettings): boolean {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.

  const dayMap: Record<number, keyof WorkDaysSettings> = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday',
  };

  return workDaysSettings[dayMap[dayOfWeek]];
}

/**
 * Format a date for display
 */
export function formatDate(date: Date, formatStr: string = 'MMMM d, yyyy'): string {
  return format(date, formatStr, { locale: getDateLocale() });
}

/**
 * Get week days based on first day of week setting
 */
export function getWeekDays(firstDayOfWeek: 0 | 1): string[] {
  const locale = getDateLocale();
  const start = startOfWeek(new Date(), { weekStartsOn: firstDayOfWeek });
  return Array.from({ length: 7 }, (_, i) =>
    format(addDays(start, i), 'EEE', { locale })
  );
}

/**
 * Get next work day based on settings
 */
export function getNextWorkDay(currentDate: Date, workDaysSettings: WorkDaysSettings): Date {
  let nextDate = new Date(currentDate);
  nextDate.setDate(nextDate.getDate() + 1);

  // Keep incrementing until we find a work day (max 7 days)
  let attempts = 0;
  while (!isWorkDay(nextDate, workDaysSettings) && attempts < 7) {
    nextDate.setDate(nextDate.getDate() + 1);
    attempts++;
  }

  return nextDate;
}

/**
 * Convert date to YYYY-MM-DD format for storage
 */
export function dateToKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Parse YYYY-MM-DD string to Date
 */
export function keyToDate(key: string): Date {
  return new Date(key);
}

/**
 * Check if two dates are the same day
 */
export function isSameDate(date1: Date, date2: Date): boolean {
  return isSameDay(date1, date2);
}
