import { describe, it, expect } from 'vitest';
import { isWorkDay, getNextWorkDay, getWeekDays, dateToKey, isSameDate } from '../dateHelpers';
import { WorkDaysSettings } from '../../types/settings';

const standardWorkDays: WorkDaysSettings = {
  monday: true,
  tuesday: true,
  wednesday: true,
  thursday: true,
  friday: true,
  saturday: false,
  sunday: false,
};

// Helper: create dates with explicit time to avoid UTC midnight timezone shift
function localDate(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day, 12, 0, 0);
}

describe('isWorkDay', () => {
  it('should return true for weekdays with standard settings', () => {
    // 2026-01-05 is a Monday
    const monday = localDate(2026, 1, 5);
    expect(monday.getDay()).toBe(1); // sanity check
    expect(isWorkDay(monday, standardWorkDays)).toBe(true);

    // 2026-01-09 is a Friday
    const friday = localDate(2026, 1, 9);
    expect(friday.getDay()).toBe(5); // sanity check
    expect(isWorkDay(friday, standardWorkDays)).toBe(true);
  });

  it('should return false for weekends with standard settings', () => {
    // 2026-01-03 is a Saturday
    const saturday = localDate(2026, 1, 3);
    expect(saturday.getDay()).toBe(6); // sanity check
    expect(isWorkDay(saturday, standardWorkDays)).toBe(false);

    // 2026-01-04 is a Sunday
    const sunday = localDate(2026, 1, 4);
    expect(sunday.getDay()).toBe(0); // sanity check
    expect(isWorkDay(sunday, standardWorkDays)).toBe(false);
  });

  it('should respect custom work day settings', () => {
    const customDays: WorkDaysSettings = {
      ...standardWorkDays,
      saturday: true,
      friday: false,
    };
    const saturday = localDate(2026, 1, 3);
    expect(isWorkDay(saturday, customDays)).toBe(true);

    const friday = localDate(2026, 1, 9);
    expect(isWorkDay(friday, customDays)).toBe(false);
  });
});

describe('getNextWorkDay', () => {
  it('should return the next day if it is a work day', () => {
    // Monday -> Tuesday
    const monday = localDate(2026, 1, 5);
    const result = getNextWorkDay(monday, standardWorkDays);
    expect(result.getDay()).toBe(2); // Tuesday
  });

  it('should skip weekends', () => {
    // Friday -> Monday (skips Saturday and Sunday)
    const friday = localDate(2026, 1, 9);
    const result = getNextWorkDay(friday, standardWorkDays);
    expect(result.getDay()).toBe(1); // Monday
    expect(result.getDate()).toBe(12); // January 12
  });

  it('should skip Saturday and jump to Monday', () => {
    // Saturday -> should find Monday (Sunday is not a work day either)
    const saturday = localDate(2026, 1, 3);
    const result = getNextWorkDay(saturday, standardWorkDays);
    expect(result.getDay()).toBe(1); // Monday
  });
});

describe('getWeekDays', () => {
  it('should start with Sunday when firstDayOfWeek is 0', () => {
    const days = getWeekDays(0);
    expect(days[0]).toBe('Sun');
    expect(days[6]).toBe('Sat');
    expect(days).toHaveLength(7);
  });

  it('should start with Monday when firstDayOfWeek is 1', () => {
    const days = getWeekDays(1);
    expect(days[0]).toBe('Mon');
    expect(days[6]).toBe('Sun');
    expect(days).toHaveLength(7);
  });
});

describe('dateToKey', () => {
  it('should format date as YYYY-MM-DD', () => {
    const date = localDate(2026, 3, 15);
    expect(dateToKey(date)).toBe('2026-03-15');
  });

  it('should zero-pad single digit months and days', () => {
    const date = localDate(2026, 1, 5);
    expect(dateToKey(date)).toBe('2026-01-05');
  });
});

describe('isSameDate', () => {
  it('should return true for the same day', () => {
    expect(isSameDate(
      new Date('2026-01-15T09:00:00'),
      new Date('2026-01-15T23:00:00')
    )).toBe(true);
  });

  it('should return false for different days', () => {
    expect(isSameDate(
      localDate(2026, 1, 15),
      localDate(2026, 1, 16)
    )).toBe(false);
  });
});
