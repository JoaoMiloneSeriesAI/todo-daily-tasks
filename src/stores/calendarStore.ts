import { create } from 'zustand';
import { CalendarDay, Holiday } from '../types/calendar';
import { startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isToday } from 'date-fns';

interface CalendarStore {
  currentMonth: Date;
  selectedDate: Date;
  days: CalendarDay[];
  holidays: Holiday[];
  isLoadingHolidays: boolean;

  // Navigation
  setCurrentMonth: (date: Date) => void;
  setSelectedDate: (date: Date) => void;
  goToNextMonth: () => void;
  goToPreviousMonth: () => void;
  goToToday: () => void;

  // Holidays
  loadHolidays: (year: number) => Promise<void>;
  addCustomHoliday: (holiday: Omit<Holiday, 'id' | 'source'>) => void;
  removeCustomHoliday: (id: string) => void;

  // Calendar generation
  generateCalendarDays: () => void;
}

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  currentMonth: new Date(),
  selectedDate: new Date(),
  days: [],
  holidays: [],
  isLoadingHolidays: false,

  // Navigation
  setCurrentMonth: (date) => {
    set({ currentMonth: date });
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

  // Holidays
  loadHolidays: async (year) => {
    set({ isLoadingHolidays: true });

    try {
      // Get settings to know which country
      const settings = await window.electronAPI.getSettings();

      if (settings && typeof settings === 'object') {
        const settingsData = settings as any;

        if (settingsData.holidays?.autoFetch) {
          const apiHolidays = await window.electronAPI.fetchHolidays({
            countryCode: settingsData.holidays.country,
            year,
          });

          // Combine API holidays with custom holidays
          const customHolidays: Holiday[] = (settingsData.holidays.customHolidays || []).map((h: any) => ({
            id: h.id,
            name: h.name,
            date: h.date,
            isRecurring: h.recurring || false,
            source: 'custom' as const,
          }));

          const allHolidays = [...apiHolidays, ...customHolidays];

          set({ holidays: allHolidays });
          get().generateCalendarDays();
        }
      }
    } catch (error) {
      console.error('Error loading holidays:', error);
    } finally {
      set({ isLoadingHolidays: false });
    }
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

  // Calendar generation
  generateCalendarDays: () => {
    const { currentMonth, holidays } = get();

    // Get first and last day of the month
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    // Get the start and end of the calendar grid (including prev/next month days)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    // Generate all days in the calendar grid
    const allDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    // Map to CalendarDay objects
    const calendarDays: CalendarDay[] = allDays.map((date) => {
      const dateStr = date.toISOString().split('T')[0];
      const holiday = holidays.find((h) => h.date === dateStr);

      return {
        date,
        isToday: isToday(date),
        isWorkDay: true, // Will be calculated from settings later
        isHoliday: !!holiday,
        holidayName: holiday?.name,
        taskCount: 0, // Will be calculated from board data
        completedCount: 0, // Will be calculated from board data
      };
    });

    set({ days: calendarDays });
  },
}));
