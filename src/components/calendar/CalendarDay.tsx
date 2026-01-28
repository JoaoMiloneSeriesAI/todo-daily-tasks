import { motion } from 'framer-motion';
import { CalendarDay as CalendarDayType } from '../../types/calendar';
import { format, isSameMonth } from 'date-fns';
import { Badge } from '../shared';

interface CalendarDayProps {
  day: CalendarDayType;
  currentMonth: Date;
  onClick: (date: Date) => void;
  isSelected: boolean;
}

export function CalendarDay({ day, currentMonth, onClick, isSelected }: CalendarDayProps) {
  const isCurrentMonth = isSameMonth(day.date, currentMonth);
  const dayNumber = format(day.date, 'd');

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick(day.date)}
      className={`
        relative min-h-[100px] p-3 rounded-lg cursor-pointer
        border-2 transition-all duration-200
        ${isSelected ? 'border-primary-main bg-primary-main bg-opacity-10' : 'border-gray-200 hover:border-primary-light'}
        ${!isCurrentMonth ? 'opacity-40' : ''}
        ${day.isToday ? 'ring-2 ring-primary-main' : ''}
        ${day.isHoliday ? 'bg-red-50' : 'bg-white'}
        ${!day.isWorkDay ? 'bg-gray-50' : ''}
      `}
    >
      {/* Day number */}
      <div className="flex items-center justify-between mb-2">
        <span
          className={`
            text-sm font-semibold
            ${day.isToday ? 'text-primary-main' : 'text-gray-700'}
          `}
        >
          {dayNumber}
        </span>

        {/* Indicators */}
        <div className="flex items-center gap-1">
          {day.isToday && (
            <div className="w-2 h-2 bg-primary-main rounded-full" />
          )}
        </div>
      </div>

      {/* Holiday name */}
      {day.isHoliday && day.holidayName && (
        <div className="mb-2">
          <Badge variant="error" size="sm">
            {day.holidayName}
          </Badge>
        </div>
      )}

      {/* Task count */}
      {day.taskCount > 0 && (
        <div className="mt-auto">
          <div className="text-xs text-gray-600">
            <span className="font-medium">{day.completedCount}</span>
            <span className="text-gray-400"> / </span>
            <span className="font-medium">{day.taskCount}</span>
            <span className="text-gray-400"> tasks</span>
          </div>

          {/* Progress bar */}
          <div className="mt-1 w-full h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{
                width: `${day.taskCount > 0 ? (day.completedCount / day.taskCount) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}
