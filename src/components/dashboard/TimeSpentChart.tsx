import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TimeByColumnData } from '../../types/board';
import { TimeTracker } from '../../utils/timeTracking';

interface TimeSpentChartProps {
  data: TimeByColumnData[];
}

export function TimeSpentChart({ data }: TimeSpentChartProps) {
  const { t } = useTranslation();
  const accent = useMemo(() => {
    return getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim() || '#6366F1';
  }, []);

  const formattedData = data.map((item) => ({
    ...item,
    timeFormatted: TimeTracker.formatDuration(item.time),
    timeHours: item.time / (1000 * 60 * 60),
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formattedData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            dataKey="columnName"
            tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }}
            stroke="var(--color-text-tertiary)"
          />
          <YAxis
            tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }}
            stroke="var(--color-text-tertiary)"
            label={{ value: t('dashboard.hours'), angle: -90, position: 'insideLeft', fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              fontSize: '12px',
              color: 'var(--color-text-primary)',
            }}
            formatter={(value: number | undefined) =>
              value !== undefined ? TimeTracker.formatDuration(value * 1000 * 60 * 60) : ''
            }
          />
          <Bar
            dataKey="timeHours"
            fill={accent}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
