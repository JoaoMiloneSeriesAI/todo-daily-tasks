import { useSettingsStore } from '../../stores/settingsStore';
import { useTranslation } from 'react-i18next';

export function GeneralSettings() {
  const { settings, updateSettings } = useSettingsStore();
  const { i18n } = useTranslation();

  const selectClass = "max-w-xs w-full px-4 py-2 bg-[var(--color-input-bg)] border border-[var(--color-input-border)] rounded-lg text-[var(--color-text-primary)] text-sm focus:bg-[var(--color-input-focus-bg)] focus:border-primary-main focus:ring-2 focus:ring-primary-main focus:ring-opacity-20 transition-all duration-200 cursor-pointer";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">General Settings</h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">
          Configure basic application preferences
        </p>
      </div>

      {/* Language */}
      <div>
        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
          Language
        </label>
        <select
          value={settings.general.language}
          onChange={(e) => {
            const newLang = e.target.value;
            updateSettings({
              general: { ...settings.general, language: newLang },
            });
            i18n.changeLanguage(newLang);
          }}
          className={selectClass}
        >
          <option value="en">English</option>
          <option value="es">Espanol</option>
        </select>
        <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
          Select your preferred language for the application
        </p>
      </div>

      {/* Date Format */}
      <div>
        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
          Date Format
        </label>
        <select
          value={settings.general.dateFormat}
          onChange={(e) =>
            updateSettings({
              general: { ...settings.general, dateFormat: e.target.value },
            })
          }
          className={selectClass}
        >
          <option value="MM/dd/yyyy">MM/DD/YYYY (US)</option>
          <option value="dd/MM/yyyy">DD/MM/YYYY (EU)</option>
          <option value="yyyy-MM-dd">YYYY-MM-DD (ISO)</option>
        </select>
        <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
          Choose how dates are displayed throughout the app
        </p>
      </div>

      {/* Time Format */}
      <div>
        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
          Time Format
        </label>
        <select
          value={settings.general.timeFormat}
          onChange={(e) =>
            updateSettings({
              general: { ...settings.general, timeFormat: e.target.value as '12h' | '24h' },
            })
          }
          className={selectClass}
        >
          <option value="12h">12-hour (AM/PM)</option>
          <option value="24h">24-hour</option>
        </select>
        <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
          Select your preferred time display format
        </p>
      </div>
    </div>
  );
}
