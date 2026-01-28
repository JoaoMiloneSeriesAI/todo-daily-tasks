import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '../shared';

interface CalendarHeaderProps {
  currentMonth: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

export function CalendarHeader({
  currentMonth,
  onPreviousMonth,
  onNextMonth,
  onToday,
}: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <CalendarIcon className="text-primary-main" size={28} />
        <h2 className="text-2xl font-bold text-gray-900">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={onToday}
        >
          Today
        </Button>

        <div className="flex items-center gap-1">
          <button
            onClick={onPreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>

          <button
            onClick={onNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Next month"
          >
            <ChevronRight size={20} className="text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
