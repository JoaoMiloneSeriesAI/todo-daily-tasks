import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { useCalendarStore } from '../../stores/calendarStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { CalendarHeader } from './CalendarHeader';
import { CalendarDay } from './CalendarDay';
import { getWeekDays } from '../../utils/dateHelpers';
import { isSameDay } from 'date-fns';

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

  // Track navigation direction for slide animation
  const prevMonthRef = useRef(currentMonth);
  const direction = currentMonth > prevMonthRef.current ? 1 : -1;
  useEffect(() => {
    prevMonthRef.current = currentMonth;
  }, [currentMonth]);

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

      {/* Loading skeleton or holiday banner */}
      {isLoadingHolidays && days.length === 0 ? (
        <div className="mb-4">
          {/* Skeleton grid */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-sm font-semibold text-[var(--color-text-secondary)] py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="min-h-[90px] rounded-lg animate-shimmer" />
            ))}
          </div>
        </div>
      ) : (
        <>
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

          {/* Calendar grid with month transition */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMonth.toISOString()}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -40 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="grid grid-cols-7 gap-2"
            >
              {days.map((day) => (
                <CalendarDay
                  key={day.date.toISOString()}
                  day={day}
                  currentMonth={currentMonth}
                  onClick={handleDayClick}
                  isSelected={isSameDay(day.date, selectedDate)}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </>
      )}

      {/* Legend — responsive wrap */}
      <div className="mt-6 flex items-center gap-4 flex-wrap text-sm text-[var(--color-text-secondary)]">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-[var(--color-accent)]" />
          <span>{t('common.selected')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded ring-2 ring-[var(--color-accent)]" />
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
