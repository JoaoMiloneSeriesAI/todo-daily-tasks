import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartData } from '../../types/board';

interface TaskCompletionChartProps {
  data: ChartData[];
}

export function TaskCompletionChart({ data }: TaskCompletionChartProps) {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: '#6B7280' }}
            stroke="#9CA3AF"
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#6B7280' }}
            stroke="#9CA3AF"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Line
            type="monotone"
            dataKey="completed"
            stroke="#6366F1"
            strokeWidth={2}
            dot={{ fill: '#6366F1', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
