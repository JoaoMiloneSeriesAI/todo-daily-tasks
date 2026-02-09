import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartData } from '../../types/board';

interface TaskCompletionChartProps {
  data: ChartData[];
}

function useAccentColor(): string {
  return useMemo(() => {
    return getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim() || '#6366F1';
  }, []);
}

export function TaskCompletionChart({ data }: TaskCompletionChartProps) {
  const accent = useAccentColor();

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }}
            stroke="var(--color-text-tertiary)"
          />
          <YAxis
            tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }}
            stroke="var(--color-text-tertiary)"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              fontSize: '12px',
              color: 'var(--color-text-primary)',
            }}
          />
          <Line
            type="monotone"
            dataKey="completed"
            stroke={accent}
            strokeWidth={2}
            dot={{ fill: accent, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
