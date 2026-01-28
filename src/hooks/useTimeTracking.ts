import { useMemo } from 'react';
import { Card } from '../types/card';
import { Column } from '../types/column';
import { TimeBreakdown } from '../types/board';
import { TimeTracker } from '../utils/timeTracking';

interface TimeTrackingData {
  timeInCurrentColumn: number;
  timeInCurrentColumnFormatted: string;
  totalTime: number | null;
  totalTimeFormatted: string;
  breakdown: TimeBreakdown[];
  currentColumnPercentage: number;
  isCompleted: boolean;
}

export function useTimeTracking(card: Card, columns: Column[]): TimeTrackingData {
  const data = useMemo(() => {
    const timeInCurrentColumn = TimeTracker.getTimeInColumn(card, card.columnId);
    const totalTime = TimeTracker.getTotalTimeToCompletion(card);
    const breakdown = TimeTracker.getTimeBreakdown(card, columns);
    const currentColumnPercentage = TimeTracker.getCurrentColumnPercentage(card);
    const isCompleted = card.columnId === 'done';

    return {
      timeInCurrentColumn,
      timeInCurrentColumnFormatted: TimeTracker.formatDuration(timeInCurrentColumn),
      totalTime,
      totalTimeFormatted: TimeTracker.formatDuration(totalTime || 0),
      breakdown,
      currentColumnPercentage,
      isCompleted,
    };
  }, [card, columns]);

  return data;
}
