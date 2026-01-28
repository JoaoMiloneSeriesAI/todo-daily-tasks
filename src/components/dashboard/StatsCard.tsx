import { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: number;
  trendLabel?: string;
}

export function StatsCard({ title, value, icon, trend, trendLabel }: StatsCardProps) {
  const hasTrend = trend !== undefined;
  const isPositive = hasTrend && trend > 0;
  const isNegative = hasTrend && trend < 0;

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-primary-main bg-opacity-10 rounded-lg text-primary-main">
          {icon}
        </div>
        {hasTrend && (
          <div
            className={`flex items-center gap-1 text-sm font-semibold ${
              isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'
            }`}
          >
            {isPositive && <TrendingUp size={16} />}
            {isNegative && <TrendingDown size={16} />}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>

      <div>
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {trendLabel && <p className="text-xs text-gray-500 mt-1">{trendLabel}</p>}
      </div>
    </div>
  );
}
