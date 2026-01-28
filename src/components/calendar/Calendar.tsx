import { useEffect } from 'react';
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
  const {
    currentMonth,
    selectedDate,
    days,
    isLoadingHolidays,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    setSelectedDate,
    generateCalendarDays,
    loadHolidays,
  } = useCalendarStore();

  const { settings } = useSettingsStore();

  // Initialize calendar
  useEffect(() => {
    generateCalendarDays();
    loadHolidays(currentMonth.getFullYear());
  }, [currentMonth]);

  // Get week day headers
  const weekDays = getWeekDays(settings.general.firstDayOfWeek);

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    onDayClick(date);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <CalendarHeader
        currentMonth={currentMonth}
        onPreviousMonth={goToPreviousMonth}
        onNextMonth={goToNextMonth}
        onToday={goToToday}
      />

      {isLoadingHolidays && (
        <div className="mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <LoadingSpinner size="sm" />
            <span>Loading holidays...</span>
          </div>
        </div>
      )}

      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-semibold text-gray-600 py-2"
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
      <div className="mt-6 flex items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-primary-main" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded ring-2 ring-primary-main" />
          <span>Today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-50 border-2 border-gray-200" />
          <span>Holiday</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-50 border-2 border-gray-200" />
          <span>Non-work day</span>
        </div>
      </div>
    </div>
  );
}
