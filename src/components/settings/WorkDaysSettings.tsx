import { useSettingsStore } from '../../stores/settingsStore';

const weekdays = [
  { key: 'sunday' as const, label: 'Sunday' },
  { key: 'monday' as const, label: 'Monday' },
  { key: 'tuesday' as const, label: 'Tuesday' },
  { key: 'wednesday' as const, label: 'Wednesday' },
  { key: 'thursday' as const, label: 'Thursday' },
  { key: 'friday' as const, label: 'Friday' },
  { key: 'saturday' as const, label: 'Saturday' },
];

export function WorkDaysSettings() {
  const { settings, updateSettings } = useSettingsStore();

  const toggleWorkDay = (day: keyof typeof settings.workDays) => {
    updateSettings({
      workDays: {
        ...settings.workDays,
        [day]: !settings.workDays[day],
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Work Days</h2>
        <p className="text-sm text-gray-600 mb-6">
          Select which days of the week are work days. These will be highlighted in the calendar.
        </p>
      </div>

      <div className="space-y-3">
        {weekdays.map((day) => {
          const isChecked = settings.workDays[day.key];
          return (
            <label
              key={day.key}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => toggleWorkDay(day.key)}
                className="w-5 h-5 text-primary-main rounded focus:ring-2 focus:ring-primary-main focus:ring-offset-2"
              />
              <span className="text-sm font-medium text-gray-700">{day.label}</span>
            </label>
          );
        })}
      </div>

      <div className="pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Work days are used to distinguish between regular work days and weekends/holidays in the
          calendar view.
        </p>
      </div>
    </div>
  );
}
