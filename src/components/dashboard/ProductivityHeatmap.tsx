import { useMemo, useState } from 'react';
import { DailyCompletionData } from '../../types/board';
import { format, parseISO, startOfWeek, addDays } from 'date-fns';

interface ProductivityHeatmapProps {
  data: DailyCompletionData[];
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/// <summary>
/// Determines the heatmap color intensity based on task completion count.
/// Uses the MatDash indigo palette for consistency with the design system.
/// </summary>
function getColorForCount(count: number): string {
  if (count === 0) return 'var(--color-bg-tertiary)';
  if (count <= 1) return '#C7D2FE'; // indigo-200
  if (count <= 2) return '#A5B4FC'; // indigo-300
  if (count <= 4) return '#818CF8'; // indigo-400
  return '#6366F1'; // indigo-500 (primary)
}

export function ProductivityHeatmap({ data }: ProductivityHeatmapProps) {
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  const grid = useMemo(() => {
    if (data.length === 0) return [];

    // Build a lookup from date string to count
    const dataMap = new Map<string, number>();
    for (const item of data) {
      dataMap.set(item.date, item.count);
    }

    // Group data into weeks (columns) and days (rows)
    const sortedDates = [...data].sort((a, b) => a.date.localeCompare(b.date));
    if (sortedDates.length === 0) return [];

    const firstDate = parseISO(sortedDates[0].date);
    const lastDate = parseISO(sortedDates[sortedDates.length - 1].date);
    const weekStart = startOfWeek(firstDate, { weekStartsOn: 0 });

    const weeks: { date: Date; count: number; dateStr: string }[][] = [];
    let currentDate = weekStart;

    while (currentDate <= lastDate) {
      const week: { date: Date; count: number; dateStr: string }[] = [];
      for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        const count = dataMap.get(dateStr) || 0;
        const isInRange = currentDate >= firstDate && currentDate <= lastDate;
        week.push({
          date: currentDate,
          count: isInRange ? count : -1, // -1 means out of range
          dateStr,
        });
        currentDate = addDays(currentDate, 1);
      }
      weeks.push(week);
    }

    return weeks;
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-[var(--color-text-tertiary)]">
        <p className="text-sm">No data available for this period</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-1 pr-2 pt-0">
          {DAYS_OF_WEEK.map((day, i) => (
            <div
              key={day}
              className="h-4 flex items-center text-[10px] text-[var(--color-text-tertiary)]"
              style={{ display: i % 2 === 1 ? 'flex' : 'none' }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        <div className="flex gap-1 overflow-x-auto flex-1">
          {grid.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day) => (
                <div
                  key={day.dateStr}
                  className="w-4 h-4 rounded-sm cursor-pointer transition-all duration-150 hover:ring-2 hover:ring-primary-main hover:ring-opacity-50"
                  style={{
                    backgroundColor: day.count < 0 ? 'transparent' : getColorForCount(day.count),
                  }}
                  onMouseEnter={(e) => {
                    if (day.count >= 0) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltip({
                        text: `${day.count} task${day.count !== 1 ? 's' : ''} completed on ${format(day.date, 'MMM d, yyyy')}`,
                        x: rect.left + rect.width / 2,
                        y: rect.top - 8,
                      });
                    }
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-4 text-xs text-[var(--color-text-tertiary)]">
        <span>Less</span>
        {[0, 1, 2, 4, 5].map((count) => (
          <div
            key={count}
            className="w-4 h-4 rounded-sm"
            style={{ backgroundColor: getColorForCount(count) }}
          />
        ))}
        <span>More</span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 px-3 py-2 bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] text-xs rounded-lg shadow-lg pointer-events-none whitespace-nowrap"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
