import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarDay as CalendarDayType } from '../../types/calendar';
import { format, isSameMonth } from 'date-fns';
import { getDateLocale } from '../../utils/dateFnsLocale';

interface CalendarDayProps {
  day: CalendarDayType;
  currentMonth: Date;
  onClick: (date: Date) => void;
  isSelected: boolean;
}

export const CalendarDay = memo(function CalendarDay({ day, currentMonth, onClick, isSelected }: CalendarDayProps) {
  const { t } = useTranslation();
  const isCurrentMonth = isSameMonth(day.date, currentMonth);
  const dayNumber = format(day.date, 'd');
  const fullDate = format(day.date, 'EEEE, MMMM d, yyyy', { locale: getDateLocale() });

  // Build accessible label
  const parts = [fullDate];
  if (day.isToday) parts.push(t('common.today'));
  if (day.isHoliday && day.holidayNames?.length) parts.push(`${t('common.holiday')}: ${day.holidayNames.join(', ')}`);
  if (day.taskCount > 0) parts.push(`${day.taskCount} ${t('common.tasks')}, ${day.completedCount} ${t('common.tasksCompleted')}`);
  const ariaLabel = parts.join('. ');

  const bgClass = (() => {
    if (isSelected) return 'bg-[var(--color-accent-light)]';
    if (day.isToday) return 'bg-[var(--color-accent-light)]';
    if (day.isHoliday) return 'bg-red-50 dark:bg-red-900/20';
    if (!day.isWorkDay) return 'bg-[var(--color-bg-tertiary)]';
    return 'bg-[var(--color-surface)]';
  })();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(day.date);
    }
  };

  return (
    <div
      role="gridcell"
      tabIndex={0}
      aria-selected={isSelected}
      aria-current={day.isToday ? 'date' : undefined}
      aria-label={ariaLabel}
      onClick={() => onClick(day.date)}
      onKeyDown={handleKeyDown}
      className={`
        relative h-full p-2 rounded-lg cursor-pointer
        border transition-all duration-150 flex flex-col
        hover:-translate-y-0.5 hover:shadow-md active:scale-[0.97]
        focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none
        ${isSelected ? 'border-[var(--color-accent)] border-2' : 'border-[var(--color-border)] hover:border-[var(--color-accent-secondary)]'}
        ${!isCurrentMonth ? 'opacity-40' : ''}
        ${day.isToday ? 'ring-2 ring-[var(--color-accent)] ring-offset-1' : ''}
        ${bgClass}
      `}
    >
      {/* Day number */}
      <div className="flex items-center justify-between mb-0.5">
        <span
          className={`
            text-xs leading-none
            ${day.isToday
              ? 'font-bold text-[var(--color-accent-text)] bg-[var(--color-accent)] w-6 h-6 rounded-full flex items-center justify-center'
              : 'font-semibold text-[var(--color-text-primary)]'
            }
          `}
        >
          {dayNumber}
        </span>
      </div>

      {/* Content area — fills remaining space, truncates overflow */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {/* Holiday names — compact, max 2 visible */}
        {day.isHoliday && day.holidayNames && day.holidayNames.length > 0 && (
          <div className="mb-0.5">
            {day.holidayNames.slice(0, 2).map((name, i) => (
              <div
                key={i}
                className="text-[10px] leading-tight font-medium text-red-600 dark:text-red-400 truncate"
              >
                {name}
              </div>
            ))}
            {day.holidayNames.length > 2 && (
              <div className="text-[10px] text-red-400">+{day.holidayNames.length - 2}</div>
            )}
          </div>
        )}

        {/* Card title previews */}
        {day.cardTitles && day.cardTitles.length > 0 && (
          <div className="space-y-px">
            {day.cardTitles.slice(0, 2).map((title, i) => (
              <div key={i} className="text-[10px] leading-tight text-[var(--color-text-secondary)] truncate">
                {title}
              </div>
            ))}
            {day.cardTitles.length > 2 && (
              <div className="text-[10px] text-[var(--color-text-tertiary)]">
                +{day.cardTitles.length - 2} {t('common.more').toLowerCase()}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Task progress bar — pinned to bottom */}
      {day.taskCount > 0 && (
        <div className="mt-auto pt-0.5">
          <div className="flex items-center gap-1">
            <div className="flex-1 h-1 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-300"
                style={{
                  width: `${(day.completedCount / day.taskCount) * 100}%`,
                }}
              />
            </div>
            <span className="text-[10px] text-[var(--color-text-tertiary)] tabular-nums">
              {day.completedCount}/{day.taskCount}
            </span>
          </div>
        </div>
      )}
    </div>
  );
});
