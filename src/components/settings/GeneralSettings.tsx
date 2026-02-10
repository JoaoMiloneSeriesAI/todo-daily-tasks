import { useSettingsStore } from '../../stores/settingsStore';
import { useTranslation } from 'react-i18next';

export function GeneralSettings() {
  const { settings, updateSettings } = useSettingsStore();
  const { t, i18n } = useTranslation();

  const selectClass = "max-w-xs w-full px-4 py-2 bg-[var(--color-input-bg)] border border-[var(--color-input-border)] rounded-lg text-[var(--color-text-primary)] text-sm focus:bg-[var(--color-input-focus-bg)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-ring)] transition-all duration-200 cursor-pointer";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">{t('settingsGeneral.title')}</h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">{t('settingsGeneral.description')}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">{t('settingsGeneral.language')}</label>
        <select
          value={settings.general.language}
          onChange={(e) => {
            const newLang = e.target.value;
            updateSettings({ general: { ...settings.general, language: newLang } });
            i18n.changeLanguage(newLang);
          }}
          className={selectClass}
        >
          <option value="en">English</option>
          <option value="es">Espanol</option>
          <option value="pt-BR">Portugues (Brasil)</option>
        </select>
        <p className="text-xs text-[var(--color-text-tertiary)] mt-1">{t('settingsGeneral.languageHint')}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">{t('settingsGeneral.dateFormat')}</label>
        <select
          value={settings.general.dateFormat}
          onChange={(e) => updateSettings({ general: { ...settings.general, dateFormat: e.target.value } })}
          className={selectClass}
        >
          <option value="MM/dd/yyyy">{t('settingsGeneral.dateFormatUS')}</option>
          <option value="dd/MM/yyyy">{t('settingsGeneral.dateFormatEU')}</option>
          <option value="yyyy-MM-dd">{t('settingsGeneral.dateFormatISO')}</option>
        </select>
        <p className="text-xs text-[var(--color-text-tertiary)] mt-1">{t('settingsGeneral.dateFormatHint')}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">{t('settingsGeneral.timeFormat')}</label>
        <select
          value={settings.general.timeFormat}
          onChange={(e) => updateSettings({ general: { ...settings.general, timeFormat: e.target.value as '12h' | '24h' } })}
          className={selectClass}
        >
          <option value="12h">{t('settingsGeneral.timeFormat12')}</option>
          <option value="24h">{t('settingsGeneral.timeFormat24')}</option>
        </select>
        <p className="text-xs text-[var(--color-text-tertiary)] mt-1">{t('settingsGeneral.timeFormatHint')}</p>
      </div>
    </div>
  );
}
