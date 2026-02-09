import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCalendarStore } from '../../stores/calendarStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { CalendarHeader } from './CalendarHeader';
import { CalendarDay } from './CalendarDay';
import { getWeekDays } from '../../utils/dateHelpers';
import { isSameDay } from 'date-fns';
import { LoadingSpinner } from '../shared';

interface CalendarProps {
  onDayClick: (date: Date) => void;
}

export function Calendar({ onDayClick }: CalendarProps) {
  const { t } = useTranslation();
  const {
    currentMonth,
    selectedDate,
    days,
    isLoadingHolidays,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    setSelectedDate,
    ensureHolidaysLoaded,
  } = useCalendarStore();

  const { settings } = useSettingsStore();

  // Initialize calendar — ensureHolidaysLoaded handles caching and calendar generation
  useEffect(() => {
    ensureHolidaysLoaded(currentMonth.getFullYear());
  }, [currentMonth]);

  // Get week day headers
  const weekDays = getWeekDays(settings.general.firstDayOfWeek);

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    onDayClick(date);
  };

  return (
    <div className="bg-[var(--color-surface)] rounded-xl shadow-sm p-6">
      <CalendarHeader
        currentMonth={currentMonth}
        onPreviousMonth={goToPreviousMonth}
        onNextMonth={goToNextMonth}
        onToday={goToToday}
      />

      {isLoadingHolidays && (
        <div className="mb-4">
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
            <LoadingSpinner size="sm" />
            <span>{t('calendar.loadingHolidays')}</span>
          </div>
        </div>
      )}

      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-semibold text-[var(--color-text-secondary)] py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => (
          <CalendarDay
            key={day.date.toISOString()}
            day={day}
            currentMonth={currentMonth}
            onClick={handleDayClick}
            isSelected={isSameDay(day.date, selectedDate)}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center gap-4 text-sm text-[var(--color-text-secondary)]">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-[#6366F1]" />
          <span>{t('common.selected')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded ring-2 ring-[#6366F1]" />
          <span>{t('common.today')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-50 dark:bg-red-900/20 border-2 border-[var(--color-border)]" />
          <span>{t('common.holiday')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[var(--color-bg-tertiary)] border-2 border-[var(--color-border)]" />
          <span>{t('common.nonWorkDay')}</span>
        </div>
      </div>
    </div>
  );
}
