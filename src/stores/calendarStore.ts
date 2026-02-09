import { create } from 'zustand';
import { CalendarDay, Holiday } from '../types/calendar';
import { Card } from '../types/card';
import { BoardData } from '../types/board';
import { startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isToday, format } from 'date-fns';
import { ipcService } from '../services/ipcService';
import { isWorkDay as checkIsWorkDay } from '../utils/dateHelpers';
import { useSettingsStore } from './settingsStore';

interface CalendarStore {
  currentMonth: Date;
  selectedDate: Date;
  days: CalendarDay[];
  holidays: Holiday[];
  isLoadingHolidays: boolean;

  // Cache: tracks which years have been fetched or are currently being fetched
  _cachedYears: Set<number>;
  _fetchingYears: Set<number>;

  // Navigation
  setCurrentMonth: (date: Date) => void;
  setSelectedDate: (date: Date) => void;
  goToNextMonth: () => void;
  goToPreviousMonth: () => void;
  goToToday: () => void;

  // Holidays
  loadHolidays: (year: number) => Promise<void>;
  ensureHolidaysLoaded: (year: number) => Promise<void>;
  clearHolidayCache: () => void;
  addCustomHoliday: (holiday: Omit<Holiday, 'id' | 'source'>) => void;
  removeCustomHoliday: (id: string) => void;

  // Calendar generation
  generateCalendarDays: () => Promise<void>;
}

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  currentMonth: new Date(),
  selectedDate: new Date(),
  days: [],
  holidays: [],
  isLoadingHolidays: false,
  _cachedYears: new Set(),
  _fetchingYears: new Set(),

  // Navigation
  setCurrentMonth: (date) => {
    set({ currentMonth: date });
    // Only fetch if this year isn't cached yet
    get().ensureHolidaysLoaded(date.getFullYear());
    get().generateCalendarDays();
  },

  setSelectedDate: (date) => {
    set({ selectedDate: date });
  },

  goToNextMonth: () => {
    const { currentMonth } = get();
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    get().setCurrentMonth(nextMonth);
  },

  goToPreviousMonth: () => {
    const { currentMonth } = get();
    const previousMonth = new Date(currentMonth);
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    get().setCurrentMonth(previousMonth);
  },

  goToToday: () => {
    const today = new Date();
    get().setCurrentMonth(today);
    get().setSelectedDate(today);
  },

  /// <summary>
  /// Ensures holidays are loaded for the given year and its neighbors.
  /// Uses a cache to avoid redundant API calls when navigating between months.
  /// On first call, preloads a 3-year window (year-1, year, year+1).
  /// On subsequent calls, only fetches if the year isn't cached.
  /// </summary>
  ensureHolidaysLoaded: async (year) => {
    const { _cachedYears, _fetchingYears } = get();

    // If this year is already cached, just regenerate calendar days (for board data)
    if (_cachedYears.has(year)) {
      get().generateCalendarDays();
      return;
    }

    // If this year is already being fetched by another call, just regenerate and return
    if (_fetchingYears.has(year)) {
      get().generateCalendarDays();
      return;
    }

    // Determine which years to fetch: current ± 1 that aren't cached or in-flight
    const yearsToFetch: number[] = [];
    for (const y of [year - 1, year, year + 1]) {
      if (!_cachedYears.has(y) && !_fetchingYears.has(y)) {
        yearsToFetch.push(y);
      }
    }

    if (yearsToFetch.length === 0) {
      get().generateCalendarDays();
      return;
    }

    // Mark years as in-flight to prevent concurrent duplicate fetches
    const newFetching = new Set(get()._fetchingYears);
    for (const y of yearsToFetch) newFetching.add(y);
    set({ _fetchingYears: newFetching });

    console.log(`[Holidays] Fetching years: ${yearsToFetch.join(', ')}`);
    set({ isLoadingHolidays: true });

    try {
      const settings = await ipcService.getSettings();

      if (settings && typeof settings === 'object') {
        const settingsData = settings as any;

        // Always load custom holidays
        const customHolidays: Holiday[] = (settingsData.holidays?.customHolidays || []).map((h: any) => ({
          id: h.id,
          name: h.name,
          date: h.date,
          isRecurring: h.recurring || false,
          source: 'custom' as const,
        }));

        // Fetch API holidays for all uncached years in parallel
        let allApiHolidays: Holiday[] = [];
        if (settingsData.holidays?.autoFetch && settingsData.holidays?.country) {
          const fetchPromises = yearsToFetch.map((y) =>
            ipcService.fetchHolidays({
              countryCode: settingsData.holidays.country,
              year: y,
            }).catch((err) => {
              console.error(`[Holidays] Error fetching year ${y}:`, err);
              return [] as Holiday[];
            })
          );

          const results = await Promise.all(fetchPromises);
          for (const holidays of results) {
            allApiHolidays = [...allApiHolidays, ...holidays];
          }
          console.log(`[Holidays] Fetched ${allApiHolidays.length} API holidays across ${yearsToFetch.length} years`);
        }

        // Merge with existing holidays (from previously cached years)
        const { holidays: existingHolidays } = get();
        // Remove old custom holidays (they'll be re-added from fresh settings)
        const existingApiOnly = existingHolidays.filter((h) => h.source === 'api');
        const mergedHolidays = [...existingApiOnly, ...allApiHolidays, ...customHolidays];

        // Deduplicate by id+date (same holiday across different years has different dates)
        const seen = new Set<string>();
        const deduplicated = mergedHolidays.filter((h) => {
          const key = `${h.id}::${h.date}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        // Update cache
        const newCachedYears = new Set(get()._cachedYears);
        for (const y of yearsToFetch) {
          newCachedYears.add(y);
        }

        set({ holidays: deduplicated, _cachedYears: newCachedYears });
        console.log(`[Holidays] Total cached: ${deduplicated.length} holidays. Cached years: ${[...newCachedYears].sort().join(', ')}`);
        get().generateCalendarDays();
      }
    } catch (error) {
      console.error('[Holidays] Error loading holidays:', error);
    } finally {
      // Clear in-flight markers
      const clearedFetching = new Set(get()._fetchingYears);
      for (const y of yearsToFetch) clearedFetching.delete(y);
      set({ isLoadingHolidays: false, _fetchingYears: clearedFetching });
    }
  },

  /// <summary>
  /// Forces a fresh reload of holidays for a specific year.
  /// Called from the initial calendar load and from the "Fetch Holidays Now" button.
  /// </summary>
  loadHolidays: async (year) => {
    // Clear cache for this year so ensureHolidaysLoaded will refetch
    const newCachedYears = new Set(get()._cachedYears);
    newCachedYears.delete(year);
    set({ _cachedYears: newCachedYears });
    await get().ensureHolidaysLoaded(year);
  },

  /// <summary>
  /// Clears the entire holiday cache. Called when the user changes country in settings.
  /// </summary>
  clearHolidayCache: () => {
    set({ holidays: [], _cachedYears: new Set() });
  },

  addCustomHoliday: (holiday) => {
    const newHoliday: Holiday = {
      ...holiday,
      id: crypto.randomUUID(),
      source: 'custom',
    };

    set((state) => ({
      holidays: [...state.holidays, newHoliday],
    }));
    get().generateCalendarDays();
  },

  removeCustomHoliday: (id) => {
    set((state) => ({
      holidays: state.holidays.filter((h) => h.id !== id),
    }));
    get().generateCalendarDays();
  },

  // Calendar generation — loads real task data
  generateCalendarDays: async () => {
    const { currentMonth, holidays } = get();
    const settingsState = useSettingsStore.getState();
    const workDaysSettings = settingsState.settings.workDays;

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const allDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    const startKey = format(calendarStart, 'yyyy-MM-dd');
    const endKey = format(calendarEnd, 'yyyy-MM-dd');

    let boardsInRange: Record<string, BoardData> = {};
    try {
      boardsInRange = await ipcService.loadBoardsInRange(startKey, endKey);
    } catch (error) {
      console.error('Error loading boards for calendar:', error);
    }

    const calendarDays: CalendarDay[] = allDays.map((date) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const matchingHolidays = holidays.filter((h) => h.date === dateStr);
      const dayIsWorkDay = checkIsWorkDay(date, workDaysSettings);

      const boardData = boardsInRange[dateStr] as any;
      const cards: Card[] = boardData?._cards || [];
      const taskCount = cards.length;
      const completedCount = cards.filter((c) => c.columnId === 'done').length;
      const cardTitles = cards.map((c) => c.title).slice(0, 6);

      return {
        date,
        isToday: isToday(date),
        isWorkDay: dayIsWorkDay,
        isHoliday: matchingHolidays.length > 0,
        holidayName: matchingHolidays.length > 0 ? matchingHolidays[0].name : undefined,
        holidayNames: matchingHolidays.map((h) => h.name),
        taskCount,
        completedCount,
        cardTitles,
      };
    });

    set({ days: calendarDays });
  },
}));
