import { useTranslation } from 'react-i18next';
import { CheckCircle, Clock, ListTodo, TrendingUp } from 'lucide-react';
import { useDashboardStore } from '../../stores/dashboardStore';
import { useStats } from '../../hooks/useStats';
import { StatsCard } from './StatsCard';
import { TaskCompletionChart } from './TaskCompletionChart';
import { TimeSpentChart } from './TimeSpentChart';
import { TagDistributionChart } from './TagDistributionChart';
import { ProductivityHeatmap } from './ProductivityHeatmap';
import { TimeTracker } from '../../utils/timeTracking';
import { motion } from 'framer-motion';

export function Dashboard() {
  const { t } = useTranslation();
  const { dateRange, preset, setPreset } = useDashboardStore();
  const stats = useStats(dateRange);

  const presetRanges = [
    { label: t('dashboard.lastSevenDays'), value: 'week' as const },
    { label: t('dashboard.lastThirtyDays'), value: '30days' as const },
    { label: t('dashboard.thisMonth'), value: 'month' as const },
    { label: t('dashboard.lastMonth'), value: 'lastMonth' as const },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">{t('dashboard.title')}</h1>
          <p className="text-[var(--color-text-secondary)]">{t('dashboard.subtitle')}</p>
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
                  : 'bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title={t('dashboard.totalTasks')}
            value={stats.totalTasks}
            icon={<ListTodo size={24} />}
          />
          <StatsCard
            title={t('dashboard.completedTasks')}
            value={stats.completedTasks}
            icon={<CheckCircle size={24} />}
            trend={stats.completionTrend}
            trendLabel={t('dashboard.vsPrevious')}
          />
          <StatsCard
            title={t('dashboard.inProgress')}
            value={stats.inProgressTasks}
            icon={<TrendingUp size={24} />}
          />
          <StatsCard
            title={t('dashboard.avgCompletionTime')}
            value={TimeTracker.formatDuration(stats.avgCompletionTime)}
            icon={<Clock size={24} />}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Task Completion Over Time */}
          <div className="bg-[var(--color-surface)] rounded-lg p-6 shadow-sm border border-[var(--color-border)]">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
              {t('dashboard.taskCompletionOverTime')}
            </h2>
            <TaskCompletionChart data={stats.completionData} />
          </div>

          {/* Time Spent by Column */}
          <div className="bg-[var(--color-surface)] rounded-lg p-6 shadow-sm border border-[var(--color-border)]">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
              {t('dashboard.timeSpentByColumn')}
            </h2>
            <TimeSpentChart data={stats.timeByColumn} />
          </div>

          {/* Tag Distribution */}
          <div className="bg-[var(--color-surface)] rounded-lg p-6 shadow-sm border border-[var(--color-border)]">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
              {t('dashboard.tagDistribution')}
            </h2>
            <TagDistributionChart data={stats.tagDistribution} />
          </div>

          {/* Productivity Heatmap */}
          <div className="bg-[var(--color-surface)] rounded-lg p-6 shadow-sm border border-[var(--color-border)]">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
              {t('dashboard.dailyProductivity')}
            </h2>
            <ProductivityHeatmap data={stats.dailyCompletion} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
