import { useState, useEffect } from 'react';
import { DateRange, DashboardStats } from '../types/board';
import { Card } from '../types/card';
import { format, eachDayOfInterval } from 'date-fns';
import { TimeTracker } from '../utils/timeTracking';

export function useStats(dateRange: DateRange): DashboardStats {
  const [stats, setStats] = useState<DashboardStats>({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    avgCompletionTime: 0,
    completionTrend: 0,
    completionData: [],
    timeByColumn: [],
    tagDistribution: [],
    dailyCompletion: [],
  });

  useEffect(() => {
    calculateStats();
  }, [dateRange]);

  const calculateStats = async () => {
    // For now, return mock data since we need to aggregate across multiple dates
    // In a real implementation, we'd load all boards in the date range

    const mockCards: Card[] = []; // Would load from electron-store for all dates in range

    const totalTasks = mockCards.length;
    const completedTasks = mockCards.filter((c) => c.columnId === 'done').length;
    const inProgressTasks = mockCards.filter((c) => c.columnId === 'doing').length;

    // Calculate average completion time
    const completedCardsWithTime = mockCards
      .filter((c) => c.columnId === 'done')
      .map((c) => TimeTracker.getTotalTimeToCompletion(c))
      .filter((t): t is number => t !== null);

    const avgCompletionTime =
      completedCardsWithTime.length > 0
        ? completedCardsWithTime.reduce((sum, time) => sum + time, 0) /
          completedCardsWithTime.length
        : 0;

    // Generate completion data for chart
    const days = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
    const completionData = days.map((day) => ({
      date: format(day, 'MMM d'),
      completed: Math.floor(Math.random() * 10), // Mock data
    }));

    // Time by column
    const timeByColumn = [
      { columnName: 'TODO', time: 2 * 60 * 60 * 1000, color: '#6366F1' },
      { columnName: 'Doing', time: 4 * 60 * 60 * 1000, color: '#EC4899' },
      { columnName: 'Done', time: 1 * 60 * 60 * 1000, color: '#10B981' },
    ];

    // Tag distribution
    const tagCounts: Record<string, number> = {};
    mockCards.forEach((card) => {
      card.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const tagDistribution = Object.entries(tagCounts)
      .map(([tag, count]) => ({
        tag,
        count,
        percentage: (count / totalTasks) * 100,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Daily completion heatmap
    const dailyCompletion = days.map((day) => ({
      date: format(day, 'yyyy-MM-dd'),
      count: Math.floor(Math.random() * 8),
    }));

    setStats({
      totalTasks,
      completedTasks,
      inProgressTasks,
      avgCompletionTime,
      completionTrend: completedTasks > 0 ? 15 : 0,
      completionData,
      timeByColumn,
      tagDistribution,
      dailyCompletion,
    });
  };

  return stats;
}
