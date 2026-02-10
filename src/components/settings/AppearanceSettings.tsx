import { useSettingsStore } from '../../stores/settingsStore';
import { useTranslation } from 'react-i18next';

export function AppearanceSettings() {
  const { settings, updateSettings } = useSettingsStore();
  const { t } = useTranslation();

  const themes = [
    { value: 'light' as const, labelKey: 'appearance.themeLight' },
    { value: 'dark' as const, labelKey: 'appearance.themeDark' },
    { value: 'system' as const, labelKey: 'appearance.themeAuto' },
  ];

  const accentColors = [
    { value: '#6366F1', labelKey: 'appearance.colorIndigo', color: '#6366F1' },
    { value: '#EC4899', labelKey: 'appearance.colorPink', color: '#EC4899' },
    { value: '#14B8A6', labelKey: 'appearance.colorTeal', color: '#14B8A6' },
    { value: '#F59E0B', labelKey: 'appearance.colorAmber', color: '#F59E0B' },
    { value: '#8B5CF6', labelKey: 'appearance.colorPurple', color: '#8B5CF6' },
    { value: '#10B981', labelKey: 'appearance.colorGreen', color: '#10B981' },
    { value: '#EF4444', labelKey: 'appearance.colorRed', color: '#EF4444' },
    { value: '#3B82F6', labelKey: 'appearance.colorBlue', color: '#3B82F6' },
  ];

  const selectClass = "max-w-xs w-full px-4 py-2 bg-[var(--color-input-bg)] border border-[var(--color-input-border)] rounded-lg text-[var(--color-text-primary)] text-sm focus:bg-[var(--color-input-focus-bg)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-ring)] transition-all duration-200 cursor-pointer";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">{t('appearance.title')}</h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">{t('appearance.description')}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">{t('appearance.theme')}</label>
        <select
          value={settings.appearance.theme}
          onChange={(e) => updateSettings({ appearance: { ...settings.appearance, theme: e.target.value as 'light' | 'dark' | 'system' } })}
          className={selectClass}
        >
          {themes.map((theme) => (
            <option key={theme.value} value={theme.value}>{t(theme.labelKey)}</option>
          ))}
        </select>
        <p className="text-xs text-[var(--color-text-tertiary)] mt-1">{t('appearance.themeHint')}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-3">{t('appearance.accentColor')}</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {accentColors.map((color) => (
            <button
              key={color.value}
              onClick={() => updateSettings({ appearance: { ...settings.appearance, accentColor: color.value } })}
              className={`p-3 rounded-lg border-2 transition-all ${
                settings.appearance.accentColor === color.value
                  ? 'border-[var(--color-text-primary)] shadow-md'
                  : 'border-[var(--color-border)] hover:border-[var(--color-text-tertiary)]'
              }`}
            >
              <div className="w-full h-12 rounded-md mb-2" style={{ backgroundColor: color.color }} />
              <p className="text-xs text-[var(--color-text-secondary)] font-medium text-center">{t(color.labelKey)}</p>
            </button>
          ))}
        </div>
        <p className="text-xs text-[var(--color-text-tertiary)] mt-3">{t('appearance.accentColorHint')}</p>
      </div>

      <div>
        <label className="flex items-center gap-3 p-4 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={settings.appearance.enableAnimations}
            onChange={(e) => updateSettings({ appearance: { ...settings.appearance, enableAnimations: e.target.checked } })}
            className="w-5 h-5 text-[var(--color-accent)] rounded focus:ring-2 focus:ring-[var(--color-accent)]"
          />
          <div>
            <p className="text-sm font-medium text-[var(--color-text-primary)]">{t('appearance.enableAnimations')}</p>
            <p className="text-xs text-[var(--color-text-tertiary)]">{t('appearance.enableAnimationsHint')}</p>
          </div>
        </label>
      </div>
    </div>
  );
}
