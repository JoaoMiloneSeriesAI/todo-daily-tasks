import { create } from 'zustand';
import { DateRange } from '../types/board';
import { startOfMonth, endOfMonth, subDays, startOfDay, endOfDay } from 'date-fns';

type PresetType = 'week' | 'month' | 'lastMonth' | '30days';

interface DashboardStore {
  dateRange: DateRange;
  preset: PresetType;
  setDateRange: (range: DateRange) => void;
  setPreset: (preset: PresetType) => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  dateRange: {
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
  },
  preset: 'month',

  setDateRange: (range) => {
    set({ dateRange: range, preset: 'month' });
  },

  setPreset: (preset) => {
    const now = new Date();
    let start: Date;
    let end: Date = endOfDay(now);

    switch (preset) {
      case 'week':
        start = startOfDay(subDays(now, 7));
        break;
      case 'month':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case 'lastMonth':
        const lastMonth = new Date(now);
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        start = startOfMonth(lastMonth);
        end = endOfMonth(lastMonth);
        break;
      case '30days':
        start = startOfDay(subDays(now, 30));
        break;
      default:
        start = startOfMonth(now);
    }

    set({ dateRange: { start, end }, preset });
  },
}));
