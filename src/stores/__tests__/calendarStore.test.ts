import { describe, it, expect, vi, beforeEach } from 'vitest';
import { format } from 'date-fns';

// Mock ipcService
vi.mock('../../services/ipcService', () => ({
  ipcService: {
    getSettings: vi.fn(),
    fetchHolidays: vi.fn(),
    loadBoardsInRange: vi.fn().mockResolvedValue({}),
    loadBoard: vi.fn().mockResolvedValue(null),
    saveBoard: vi.fn().mockResolvedValue(undefined),
    updateSettings: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock settingsStore
vi.mock('../settingsStore', () => ({
  useSettingsStore: {
    getState: () => ({
      settings: {
        workDays: {
          monday: true, tuesday: true, wednesday: true,
          thursday: true, friday: true, saturday: false, sunday: false,
        },
      },
    }),
  },
}));

// Mock window.electronAPI
vi.stubGlobal('window', {
  ...globalThis.window,
  electronAPI: {
    loadData: vi.fn().mockResolvedValue(null),
    saveData: vi.fn().mockResolvedValue(undefined),
    loadDataRange: vi.fn().mockResolvedValue({}),
    getSettings: vi.fn().mockResolvedValue(null),
    updateSettings: vi.fn().mockResolvedValue(undefined),
    fetchHolidays: vi.fn().mockResolvedValue([]),
    fetchCountries: vi.fn().mockResolvedValue([]),
    exportData: vi.fn().mockResolvedValue({ success: true }),
    importData: vi.fn().mockResolvedValue({ success: true }),
  },
});

import { useCalendarStore } from '../calendarStore';
import { ipcService } from '../../services/ipcService';

describe('calendarStore', () => {
  beforeEach(() => {
    useCalendarStore.setState({
      currentMonth: new Date(2026, 1, 1), // February 2026
      selectedDate: new Date(),
      days: [],
      holidays: [],
      isLoadingHolidays: false,
    });
    vi.clearAllMocks();
  });

  describe('loadHolidays', () => {
    it('should load custom holidays even when autoFetch is false', async () => {
      const mockSettings = {
        holidays: {
          country: 'US',
          autoFetch: false,
          customHolidays: [
            { id: '1', name: 'Company Day', date: '2026-02-15', recurring: false },
          ],
        },
        workDays: { monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: false, sunday: false },
      };

      (ipcService.getSettings as any).mockResolvedValue(mockSettings);

      await useCalendarStore.getState().loadHolidays(2026);

      const { holidays } = useCalendarStore.getState();
      expect(holidays).toHaveLength(1);
      expect(holidays[0].name).toBe('Company Day');
      expect(holidays[0].source).toBe('custom');
    });

    it('should fetch API holidays when autoFetch is true and country is set', async () => {
      const mockSettings = {
        holidays: {
          country: 'US',
          autoFetch: true,
          customHolidays: [],
        },
        workDays: { monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: false, sunday: false },
      };

      const mockApiHolidays = [
        { id: 'api1', name: 'New Year', date: '2026-01-01', isRecurring: false, source: 'api' },
        { id: 'api2', name: 'Independence Day', date: '2026-07-04', isRecurring: false, source: 'api' },
      ];

      (ipcService.getSettings as any).mockResolvedValue(mockSettings);
      (ipcService.fetchHolidays as any).mockResolvedValue(mockApiHolidays);

      await useCalendarStore.getState().loadHolidays(2026);

      const { holidays } = useCalendarStore.getState();
      expect(holidays).toHaveLength(2);
      expect(ipcService.fetchHolidays).toHaveBeenCalledWith({ countryCode: 'US', year: 2026 });
    });

    it('should merge API and custom holidays', async () => {
      const mockSettings = {
        holidays: {
          country: 'US',
          autoFetch: true,
          customHolidays: [
            { id: 'c1', name: 'Birthday', date: '2026-03-15', recurring: true },
          ],
        },
        workDays: { monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: false, sunday: false },
      };

      const mockApiHolidays = [
        { id: 'api1', name: 'Holiday', date: '2026-01-01', isRecurring: false, source: 'api' },
      ];

      (ipcService.getSettings as any).mockResolvedValue(mockSettings);
      (ipcService.fetchHolidays as any).mockResolvedValue(mockApiHolidays);

      await useCalendarStore.getState().loadHolidays(2026);

      const { holidays } = useCalendarStore.getState();
      expect(holidays).toHaveLength(2);
    });

    it('should handle null settings gracefully', async () => {
      (ipcService.getSettings as any).mockResolvedValue(null);

      await useCalendarStore.getState().loadHolidays(2026);

      const { holidays } = useCalendarStore.getState();
      expect(holidays).toHaveLength(0); // Stays empty, no crash
    });

    it('should handle API fetch errors gracefully', async () => {
      const mockSettings = {
        holidays: { country: 'US', autoFetch: true, customHolidays: [] },
        workDays: { monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: false, sunday: false },
      };

      (ipcService.getSettings as any).mockResolvedValue(mockSettings);
      (ipcService.fetchHolidays as any).mockRejectedValue(new Error('Network error'));

      await useCalendarStore.getState().loadHolidays(2026);

      // Should not crash, holidays stay empty
      const { holidays } = useCalendarStore.getState();
      expect(holidays).toHaveLength(0);
    });
  });

  describe('generateCalendarDays', () => {
    it('should mark holidays on matching dates', async () => {
      // Set holidays in state first
      useCalendarStore.setState({
        holidays: [
          { id: '1', name: 'Test Holiday', date: '2026-02-09', isRecurring: false, source: 'custom' },
        ],
      });

      await useCalendarStore.getState().generateCalendarDays();

      const { days } = useCalendarStore.getState();
      const feb9 = days.find((d) => format(d.date, 'yyyy-MM-dd') === '2026-02-09');

      expect(feb9).toBeDefined();
      expect(feb9!.isHoliday).toBe(true);
      expect(feb9!.holidayNames).toContain('Test Holiday');
    });

    it('should use local date format for matching (not UTC)', async () => {
      // This test verifies that format(date, 'yyyy-MM-dd') is used
      // instead of date.toISOString().split('T')[0] which can shift dates in non-UTC timezones
      useCalendarStore.setState({
        holidays: [
          { id: '1', name: 'Feb 15', date: '2026-02-15', isRecurring: false, source: 'custom' },
        ],
      });

      await useCalendarStore.getState().generateCalendarDays();

      const { days } = useCalendarStore.getState();
      const feb15 = days.find((d) => format(d.date, 'yyyy-MM-dd') === '2026-02-15');

      expect(feb15).toBeDefined();
      expect(feb15!.isHoliday).toBe(true);
    });
  });
});
