import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TimeByColumnData } from '../../types/board';
import { TimeTracker } from '../../utils/timeTracking';

interface TimeSpentChartProps {
  data: TimeByColumnData[];
}

export function TimeSpentChart({ data }: TimeSpentChartProps) {
  const formattedData = data.map((item) => ({
    ...item,
    timeFormatted: TimeTracker.formatDuration(item.time),
    timeHours: item.time / (1000 * 60 * 60),
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formattedData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="columnName"
            tick={{ fontSize: 12, fill: '#6B7280' }}
            stroke="#9CA3AF"
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#6B7280' }}
            stroke="#9CA3AF"
            label={{ value: 'Hours', angle: -90, position: 'insideLeft', fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            formatter={(value: number | undefined) =>
              value !== undefined ? TimeTracker.formatDuration(value * 1000 * 60 * 60) : ''
            }
          />
          <Bar
            dataKey="timeHours"
            fill="#6366F1"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
