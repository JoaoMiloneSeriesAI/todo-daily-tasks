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
  const { columns } = useBoardStore();
  const timeData = useTimeTracking(card, columns);
  const movements = TimeTracker.getMovementHistory(card);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📊 Nerd Stats" size="xl">
      <div className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Time */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <Clock size={20} />
              <span className="text-sm font-medium">Total Time</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">
              {timeData.totalTimeFormatted}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Since creation
            </p>
          </div>

          {/* Current Column */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
            <div className="flex items-center gap-2 text-purple-600 mb-2">
              <Activity size={20} />
              <span className="text-sm font-medium">Current Column</span>
            </div>
            <p className="text-2xl font-bold text-purple-900">
              {timeData.timeInCurrentColumnFormatted}
            </p>
            <p className="text-xs text-purple-600 mt-1">
              In {columns.find((c) => c.id === card.columnId)?.name || 'Unknown'}
            </p>
          </div>

          {/* Status */}
          <div className={`bg-gradient-to-br ${
            timeData.isCompleted
              ? 'from-green-50 to-green-100'
              : 'from-orange-50 to-orange-100'
          } rounded-lg p-4`}>
            <div className={`flex items-center gap-2 ${
              timeData.isCompleted ? 'text-green-600' : 'text-orange-600'
            } mb-2`}>
              <TrendingUp size={20} />
              <span className="text-sm font-medium">Status</span>
            </div>
            <p className={`text-2xl font-bold ${
              timeData.isCompleted ? 'text-green-900' : 'text-orange-900'
            }`}>
              {timeData.isCompleted ? 'Completed' : 'In Progress'}
            </p>
            <p className={`text-xs ${
              timeData.isCompleted ? 'text-green-600' : 'text-orange-600'
            } mt-1`}>
              {timeData.currentColumnPercentage}% of total time
            </p>
          </div>
        </div>

        {/* Time Breakdown */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Time Breakdown by Column
          </h3>
          <div className="space-y-3">
            {timeData.breakdown.map((item) => (
              <div key={item.columnId} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">
                    {item.columnName}
                  </span>
                  <span className="text-gray-600">
                    {TimeTracker.formatDuration(item.timeSpent)} ({item.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-main to-primary-light transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Movement History Timeline */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Movement History
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {movements.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No movements yet
              </p>
            ) : (
              movements.map((movement, index) => {
                const fromColumn = columns.find((c) => c.id === movement.fromColumnId);
                const toColumn = columns.find((c) => c.id === movement.toColumnId);

                return (
                  <div key={movement.id} className="flex items-start gap-3">
                    {/* Timeline indicator */}
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${
                        index === movements.length - 1
                          ? 'bg-primary-main'
                          : 'bg-gray-300'
                      }`} />
                      {index < movements.length - 1 && (
                        <div className="w-0.5 h-8 bg-gray-300" />
                      )}
                    </div>

                    {/* Movement details */}
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2 text-sm">
                        {movement.fromColumnId ? (
                          <>
                            <span className="font-medium text-gray-600">
                              {fromColumn?.name || 'Unknown'}
                            </span>
                            <span className="text-gray-400">→</span>
                            <span className="font-medium text-gray-900">
                              {toColumn?.name || 'Unknown'}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-gray-500">Created in</span>
                            <span className="font-medium text-gray-900">
                              {toColumn?.name || 'Unknown'}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <Calendar size={12} />
                        <span>
                          {format(new Date(movement.timestamp), 'MMM d, yyyy • h:mm a')}
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
        <div className="pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Created:</span>
              <span className="ml-2 font-medium text-gray-900">
                {format(new Date(card.createdDate), 'MMM d, yyyy • h:mm a')}
              </span>
            </div>
            {timeData.isCompleted && (
              <div>
                <span className="text-gray-600">Completed:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {movements.find((m) => m.toColumnId === 'done')
                    ? format(
                        new Date(
                          movements.find((m) => m.toColumnId === 'done')!.timestamp
                        ),
                        'MMM d, yyyy • h:mm a'
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
