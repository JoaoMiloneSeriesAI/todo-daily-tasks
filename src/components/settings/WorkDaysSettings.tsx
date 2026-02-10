import { useSettingsStore } from '../../stores/settingsStore';
import { useTranslation } from 'react-i18next';

const weekdays = [
  { key: 'sunday' as const, labelKey: 'settingsWorkDays.sunday' },
  { key: 'monday' as const, labelKey: 'settingsWorkDays.monday' },
  { key: 'tuesday' as const, labelKey: 'settingsWorkDays.tuesday' },
  { key: 'wednesday' as const, labelKey: 'settingsWorkDays.wednesday' },
  { key: 'thursday' as const, labelKey: 'settingsWorkDays.thursday' },
  { key: 'friday' as const, labelKey: 'settingsWorkDays.friday' },
  { key: 'saturday' as const, labelKey: 'settingsWorkDays.saturday' },
];

export function WorkDaysSettings() {
  const { settings, updateSettings } = useSettingsStore();
  const { t } = useTranslation();

  const toggleWorkDay = (day: keyof typeof settings.workDays) => {
    updateSettings({ workDays: { ...settings.workDays, [day]: !settings.workDays[day] } });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">{t('settingsWorkDays.title')}</h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">{t('settingsWorkDays.description')}</p>
      </div>

      <div className="space-y-3">
        {weekdays.map((day) => (
          <label
            key={day.key}
            className="flex items-center gap-3 p-3 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] cursor-pointer transition-colors"
          >
            <input
              type="checkbox"
              checked={settings.workDays[day.key]}
              onChange={() => toggleWorkDay(day.key)}
              className="w-5 h-5 text-[var(--color-accent)] rounded focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2"
            />
            <span className="text-sm font-medium text-[var(--color-text-primary)]">{t(day.labelKey)}</span>
          </label>
        ))}
      </div>

      <div className="pt-4 border-t border-[var(--color-border)]">
        <p className="text-xs text-[var(--color-text-tertiary)]">{t('settingsWorkDays.hint')}</p>
      </div>
    </div>
  );
}
