import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { TagDistributionData } from '../../types/board';

interface TagDistributionChartProps {
  data: TagDistributionData[];
}

const COLORS = ['#6366F1', '#EC4899', '#14B8A6', '#F59E0B', '#8B5CF6'];

export function TagDistributionChart({ data }: TagDistributionChartProps) {
  if (data.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-gray-500">
        No tag data available
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="count"
            label={(entry: any) => `${entry.tag} (${entry.percentage.toFixed(0)}%)`}
            labelLine={{ stroke: '#9CA3AF', strokeWidth: 1 }}
          >
            {data.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            wrapperStyle={{ fontSize: '12px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
