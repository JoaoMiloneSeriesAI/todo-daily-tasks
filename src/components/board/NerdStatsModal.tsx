import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../shared';
import { Card } from '../../types/card';
import { useBoardStore } from '../../stores/boardStore';
import { useTimeTracking } from '../../hooks/useTimeTracking';
import { TimeTracker } from '../../utils/timeTracking';
import { format } from 'date-fns';
import { Clock, TrendingUp, Calendar, Activity } from 'lucide-react';

interface NerdStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: Card;
}

export function NerdStatsModal({ isOpen, onClose, card }: NerdStatsModalProps) {
  const { t } = useTranslation();
  const { columns } = useBoardStore();
  const timeData = useTimeTracking(card, columns);
  const movements = useMemo(() => TimeTracker.getMovementHistory(card), [card]);

  // Pre-compute column lookup map for O(1) access in the movement history render loop
  const columnMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const col of columns) {
      map.set(col.id, col.name);
    }
    return map;
  }, [columns]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('stats.nerdStats')} size="xl">
      <div className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Time */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
              <Clock size={20} />
              <span className="text-sm font-medium">{t('stats.totalTime')}</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {timeData.totalTimeFormatted}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              {t('stats.sinceCreation')}
            </p>
          </div>

          {/* Current Column */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 rounded-lg p-4">
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-2">
              <Activity size={20} />
              <span className="text-sm font-medium">{t('stats.currentColumn')}</span>
            </div>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {timeData.timeInCurrentColumnFormatted}
            </p>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              {t('stats.in', { name: columns.find((c) => c.id === card.columnId)?.name || 'Unknown' })}
            </p>
          </div>

          {/* Status */}
          <div className={`bg-gradient-to-br ${
            timeData.isCompleted
              ? 'from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20'
              : 'from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/20'
          } rounded-lg p-4`}>
            <div className={`flex items-center gap-2 ${
              timeData.isCompleted ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
            } mb-2`}>
              <TrendingUp size={20} />
              <span className="text-sm font-medium">{t('stats.status')}</span>
            </div>
            <p className={`text-2xl font-bold ${
              timeData.isCompleted ? 'text-green-900 dark:text-green-100' : 'text-orange-900 dark:text-orange-100'
            }`}>
              {timeData.isCompleted ? t('stats.completed') : t('stats.inProgress')}
            </p>
            <p className={`text-xs ${
              timeData.isCompleted ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
            } mt-1`}>
              {timeData.currentColumnPercentage}% of total time
            </p>
          </div>
        </div>

        {/* Time Breakdown */}
        <div>
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
            {t('stats.timeBreakdown')}
          </h3>
          <div className="space-y-3">
            {timeData.breakdown.map((item) => (
              <div key={item.columnId} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-[var(--color-text-primary)]">
                    {item.columnName}
                  </span>
                  <span className="text-[var(--color-text-secondary)]">
                    {TimeTracker.formatDuration(item.timeSpent)} ({item.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-secondary)] transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Movement History Timeline */}
        <div>
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
            {t('stats.movementHistory')}
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {movements.length === 0 ? (
              <p className="text-sm text-[var(--color-text-tertiary)] text-center py-4">
                {t('stats.noMovements')}
              </p>
            ) : (
              movements.map((movement, index) => {
                const fromColumnName = columnMap.get(movement.fromColumnId) || 'Unknown';
                const toColumnName = columnMap.get(movement.toColumnId) || 'Unknown';

                return (
                  <div key={movement.id} className="flex items-start gap-3">
                    {/* Timeline indicator */}
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${
                        index === movements.length - 1
                          ? 'bg-[var(--color-accent)]'
                          : 'bg-[var(--color-border)]'
                      }`} />
                      {index < movements.length - 1 && (
                        <div className="w-0.5 h-8 bg-[var(--color-border)]" />
                      )}
                    </div>

                    {/* Movement details */}
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2 text-sm">
                        {movement.fromColumnId ? (
                          <>
                            <span className="font-medium text-[var(--color-text-secondary)]">
                              {fromColumnName}
                            </span>
                            <span className="text-[var(--color-text-tertiary)]">&rarr;</span>
                            <span className="font-medium text-[var(--color-text-primary)]">
                              {toColumnName}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-[var(--color-text-secondary)]">{t('stats.createdIn')}</span>
                            <span className="font-medium text-[var(--color-text-primary)]">
                              {toColumnName}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-[var(--color-text-tertiary)] mt-1">
                        <Calendar size={12} />
                        <span>
                          {format(new Date(movement.timestamp), 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Card Metadata */}
        <div className="pt-4 border-t border-[var(--color-border)]">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-[var(--color-text-secondary)]">{t('stats.created')}</span>
              <span className="ml-2 font-medium text-[var(--color-text-primary)]">
                {format(new Date(card.createdDate), 'MMM d, yyyy h:mm a')}
              </span>
            </div>
            {timeData.isCompleted && (
              <div>
                <span className="text-[var(--color-text-secondary)]">{t('stats.completedAt')}</span>
                <span className="ml-2 font-medium text-[var(--color-text-primary)]">
                  {movements.find((m) => m.toColumnId === 'done')
                    ? format(
                        new Date(
                          movements.find((m) => m.toColumnId === 'done')!.timestamp
                        ),
                        'MMM d, yyyy h:mm a'
                      )
                    : 'N/A'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
