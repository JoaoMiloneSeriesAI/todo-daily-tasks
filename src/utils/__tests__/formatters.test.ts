import { describe, it, expect } from 'vitest';
import { formatDuration, formatDate, formatTime, formatDateTime } from '../formatters';
import { AppSettings } from '../../types/settings';

const makeSettings = (overrides: Partial<AppSettings> = {}): AppSettings => ({
  general: {
    language: 'en',
    firstDayOfWeek: 1,
    dateFormat: 'MM/dd/yyyy',
    timeFormat: '12h',
    ...overrides.general,
  },
  workDays: {
    monday: true, tuesday: true, wednesday: true, thursday: true, friday: true,
    saturday: false, sunday: false,
    ...overrides.workDays,
  },
  holidays: {
    country: 'US', autoFetch: true, customHolidays: [],
    ...overrides.holidays,
  },
  appearance: {
    theme: 'light', accentColor: '#6366F1', enableAnimations: true, enableSounds: true,
    ...overrides.appearance,
  },
});

describe('formatDuration', () => {
  it('should format seconds', () => {
    expect(formatDuration(5000)).toBe('5s');
  });

  it('should format minutes', () => {
    expect(formatDuration(90000)).toBe('1m');
  });

  it('should format hours with minutes', () => {
    expect(formatDuration(5400000)).toBe('1h 30m');
  });

  it('should return 0m for negative values', () => {
    expect(formatDuration(-500)).toBe('0m');
  });
});

describe('formatDate', () => {
  const testDate = new Date('2026-03-15T10:30:00');

  it('should use US format by default', () => {
    expect(formatDate(testDate)).toBe('03/15/2026');
  });

  it('should respect EU date format setting', () => {
    const settings = makeSettings({ general: { language: 'en', firstDayOfWeek: 1, dateFormat: 'dd/MM/yyyy', timeFormat: '12h' } });
    expect(formatDate(testDate, settings)).toBe('15/03/2026');
  });

  it('should respect ISO date format setting', () => {
    const settings = makeSettings({ general: { language: 'en', firstDayOfWeek: 1, dateFormat: 'yyyy-MM-dd', timeFormat: '12h' } });
    expect(formatDate(testDate, settings)).toBe('2026-03-15');
  });
});

describe('formatTime', () => {
  const testDate = new Date('2026-03-15T14:30:00');

  it('should use 12h format by default', () => {
    expect(formatTime(testDate)).toBe('2:30 PM');
  });

  it('should respect 24h format setting', () => {
    const settings = makeSettings({ general: { language: 'en', firstDayOfWeek: 1, dateFormat: 'MM/dd/yyyy', timeFormat: '24h' } });
    expect(formatTime(testDate, settings)).toBe('14:30');
  });
});

describe('formatDateTime', () => {
  it('should combine date and time', () => {
    const testDate = new Date('2026-03-15T14:30:00');
    const result = formatDateTime(testDate);
    expect(result).toContain('03/15/2026');
    expect(result).toContain('2:30 PM');
  });
});
