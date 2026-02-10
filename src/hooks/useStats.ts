import { useState, useEffect } from 'react';
import { DateRange, DashboardStats, BoardData } from '../types/board';
import { Card } from '../types/card';
import { format, eachDayOfInterval } from 'date-fns';
import { getDateLocale } from '../utils/dateFnsLocale';
import { TimeTracker } from '../utils/timeTracking';
import { COLUMN_IDS } from '../types/column';
import { ipcService } from '../services/ipcService';

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
    try {
      const startKey = format(dateRange.start, 'yyyy-MM-dd');
      const endKey = format(dateRange.end, 'yyyy-MM-dd');

      // Load all boards in date range via IPC
      const boards: Record<string, BoardData> = await ipcService.loadBoardsInRange(startKey, endKey);

      // Flatten all cards from all boards
      const allCards: Card[] = [];
      const cardsByDate: Record<string, Card[]> = {};

      for (const [dateKey, board] of Object.entries(boards)) {
        const boardCards = (board as any)?._cards || [];
        allCards.push(...boardCards);
        cardsByDate[dateKey] = boardCards;
      }

      const totalTasks = allCards.length;
      const completedTasks = allCards.filter((c) => c.columnId === COLUMN_IDS.DONE).length;
      const inProgressTasks = allCards.filter((c) => c.columnId === COLUMN_IDS.DOING).length;

      // Calculate average completion time from real movement history
      const completedCardsWithTime = allCards
        .filter((c) => c.columnId === COLUMN_IDS.DONE)
        .map((c) => TimeTracker.getTotalTimeToCompletion(c))
        .filter((t): t is number => t !== null && t > 0);

      const avgCompletionTime =
        completedCardsWithTime.length > 0
          ? completedCardsWithTime.reduce((sum, time) => sum + time, 0) /
            completedCardsWithTime.length
          : 0;

      // Generate completion data for chart (real counts per day)
      const days = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
      const completionData = days.map((day) => {
        const dayKey = format(day, 'yyyy-MM-dd');
        const dayCards = cardsByDate[dayKey] || [];
        const completed = dayCards.filter((c) => c.columnId === COLUMN_IDS.DONE).length;
        return {
          date: format(day, 'MMM d', { locale: getDateLocale() }),
          completed,
        };
      });

      // Time by column — aggregate time across all completed cards
      const columnTimeMap: Record<string, number> = {};
      const columnNames: Record<string, string> = {};

      for (const board of Object.values(boards)) {
        const boardTyped = board as any;
        const boardColumns = boardTyped?.columns || [];
        for (const col of boardColumns) {
          columnNames[col.id] = col.name;
        }
      }

      for (const card of allCards) {
        if (card.movementHistory && card.movementHistory.length > 0) {
          for (let i = 0; i < card.movementHistory.length; i++) {
            const movement = card.movementHistory[i];
            const columnId = movement.toColumnId;
            const entryTime = new Date(movement.timestamp).getTime();
            const exitTime = i < card.movementHistory.length - 1
              ? new Date(card.movementHistory[i + 1].timestamp).getTime()
              : Date.now();

            const timeSpent = exitTime - entryTime;
            columnTimeMap[columnId] = (columnTimeMap[columnId] || 0) + timeSpent;
          }
        }
      }

      const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim() || '#6366F1';
      const chartColors: Record<string, string> = {
        [COLUMN_IDS.TODO]: accentColor,
        [COLUMN_IDS.DOING]: '#EC4899',
        [COLUMN_IDS.DONE]: '#10B981',
      };

      const timeByColumn = Object.entries(columnTimeMap)
        .map(([columnId, time]) => ({
          columnName: columnNames[columnId] || columnId,
          time,
          color: chartColors[columnId] || accentColor,
        }))
        .sort((a, b) => b.time - a.time);

      // Tag distribution — count tags across all cards
      const tagCounts: Record<string, number> = {};
      allCards.forEach((card) => {
        if (card.tags) {
          card.tags.forEach((tag) => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        }
      });

      const tagDistribution = Object.entries(tagCounts)
        .map(([tag, count]) => ({
          tag,
          count,
          percentage: totalTasks > 0 ? (count / totalTasks) * 100 : 0,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

      // Daily completion data for heatmap
      const dailyCompletion = days.map((day) => {
        const dayKey = format(day, 'yyyy-MM-dd');
        const dayCards = cardsByDate[dayKey] || [];
        return {
          date: dayKey,
          count: dayCards.filter((c) => c.columnId === COLUMN_IDS.DONE).length,
        };
      });

      // Simple completion trend (compare first vs second half of period)
      const midpoint = Math.floor(days.length / 2);
      const firstHalf = completionData.slice(0, midpoint);
      const secondHalf = completionData.slice(midpoint);
      const firstHalfTotal = firstHalf.reduce((sum, d) => sum + d.completed, 0);
      const secondHalfTotal = secondHalf.reduce((sum, d) => sum + d.completed, 0);
      const completionTrend = firstHalfTotal > 0
        ? Math.round(((secondHalfTotal - firstHalfTotal) / firstHalfTotal) * 100)
        : secondHalfTotal > 0 ? 100 : 0;

      setStats({
        totalTasks,
        completedTasks,
        inProgressTasks,
        avgCompletionTime,
        completionTrend,
        completionData,
        timeByColumn,
        tagDistribution,
        dailyCompletion,
      });
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  return stats;
}
