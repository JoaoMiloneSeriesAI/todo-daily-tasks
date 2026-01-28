import { CheckCircle, Clock, ListTodo, TrendingUp } from 'lucide-react';
import { useDashboardStore } from '../../stores/dashboardStore';
import { useStats } from '../../hooks/useStats';
import { StatsCard } from './StatsCard';
import { TaskCompletionChart } from './TaskCompletionChart';
import { TimeSpentChart } from './TimeSpentChart';
import { TagDistributionChart } from './TagDistributionChart';
import { TimeTracker } from '../../utils/timeTracking';
import { motion } from 'framer-motion';

const presetRanges = [
  { label: 'Last 7 Days', value: 'week' as const },
  { label: 'Last 30 Days', value: '30days' as const },
  { label: 'This Month', value: 'month' as const },
  { label: 'Last Month', value: 'lastMonth' as const },
];

export function Dashboard() {
  const { dateRange, preset, setPreset } = useDashboardStore();
  const stats = useStats(dateRange);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Overview of your tasks and productivity</p>
        </div>

        {/* Date Range Selector */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {presetRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => setPreset(range.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                preset === range.value
                  ? 'bg-primary-main text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Tasks"
            value={stats.totalTasks}
            icon={<ListTodo size={24} />}
          />
          <StatsCard
            title="Completed"
            value={stats.completedTasks}
            icon={<CheckCircle size={24} />}
            trend={stats.completionTrend}
            trendLabel="vs previous period"
          />
          <StatsCard
            title="In Progress"
            value={stats.inProgressTasks}
            icon={<TrendingUp size={24} />}
          />
          <StatsCard
            title="Avg Completion Time"
            value={TimeTracker.formatDuration(stats.avgCompletionTime)}
            icon={<Clock size={24} />}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Task Completion Over Time */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Task Completion Over Time
            </h2>
            <TaskCompletionChart data={stats.completionData} />
          </div>

          {/* Time Spent by Column */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Time Spent by Column
            </h2>
            <TimeSpentChart data={stats.timeByColumn} />
          </div>

          {/* Tag Distribution */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Tag Distribution
            </h2>
            <TagDistributionChart data={stats.tagDistribution} />
          </div>

          {/* Productivity Heatmap Placeholder */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Daily Productivity
            </h2>
            <div className="w-full h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="mb-2">Productivity Heatmap</p>
                <p className="text-sm text-gray-400">Coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
