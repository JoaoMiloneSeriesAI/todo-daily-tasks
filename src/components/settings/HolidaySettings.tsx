import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, RefreshCw } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import { useCalendarStore } from '../../stores/calendarStore';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
import { toast } from '../shared/Toast';
import { format } from 'date-fns';
import { getDateLocale } from '../../utils/dateFnsLocale';
import { Country } from '../../types/calendar';
import { ipcService } from '../../services/ipcService';

export function HolidaySettings() {
  const { t } = useTranslation();
  const { settings, updateSettings, addCustomHoliday, deleteCustomHoliday } = useSettingsStore();
  const { loadHolidays } = useCalendarStore();
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [isFetchingHolidays, setIsFetchingHolidays] = useState(false);
  const [newHolidayName, setNewHolidayName] = useState('');
  const [newHolidayDate, setNewHolidayDate] = useState('');
  const [newHolidayRecurring, setNewHolidayRecurring] = useState(false);

  useEffect(() => { fetchCountries(); }, []);

  const fetchCountries = async () => {
    setIsLoadingCountries(true);
    try { setCountries(await ipcService.fetchCountries()); }
    catch (error) { console.error('Failed to fetch countries:', error); }
    finally { setIsLoadingCountries(false); }
  };

  const handleFetchHolidays = async () => {
    if (!settings.holidays.country) return;
    setIsFetchingHolidays(true);
    try {
      await loadHolidays(new Date().getFullYear());
      toast.success(t('settingsHolidays.fetchSuccess'));
    } catch {
      toast.error(t('settingsHolidays.fetchError'));
    } finally { setIsFetchingHolidays(false); }
  };

  const handleAddCustomHoliday = () => {
    if (!newHolidayName || !newHolidayDate) return;
    addCustomHoliday({ name: newHolidayName, date: newHolidayDate, recurring: newHolidayRecurring });
    setNewHolidayName(''); setNewHolidayDate(''); setNewHolidayRecurring(false);
  };

  const selectClass = "max-w-md w-full px-4 py-2 bg-[var(--color-input-bg)] border border-[var(--color-input-border)] rounded-lg text-[var(--color-text-primary)] text-sm focus:bg-[var(--color-input-focus-bg)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-ring)] transition-all duration-200 cursor-pointer disabled:opacity-50";

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">{t('settingsHolidays.title')}</h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">{t('settingsHolidays.description')}</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">{t('settingsHolidays.country')}</label>
            <select value={settings.holidays.country} onChange={(e) => updateSettings({ holidays: { ...settings.holidays, country: e.target.value } })} disabled={isLoadingCountries} className={selectClass}>
              <option value="">{t('settingsHolidays.selectCountry')}</option>
              {countries.map((country) => (<option key={country.code} value={country.code}>{country.name} ({country.code})</option>))}
            </select>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg border border-[var(--color-border)]">
            <input type="checkbox" id="autoFetch" checked={settings.holidays.autoFetch} onChange={(e) => updateSettings({ holidays: { ...settings.holidays, autoFetch: e.target.checked } })} className="w-5 h-5 text-[var(--color-accent)] rounded focus:ring-2 focus:ring-[var(--color-accent)]" />
            <div>
              <label htmlFor="autoFetch" className="text-sm font-medium text-[var(--color-text-primary)] cursor-pointer">{t('settingsHolidays.autoFetch')}</label>
              <p className="text-xs text-[var(--color-text-tertiary)]">{t('settingsHolidays.autoFetchHint')}</p>
            </div>
          </div>
          <Button onClick={handleFetchHolidays} disabled={!settings.holidays.country || isFetchingHolidays} leftIcon={<RefreshCw size={16} className={isFetchingHolidays ? 'animate-spin' : ''} />}>
            {isFetchingHolidays ? t('settingsHolidays.fetching') : t('settingsHolidays.fetchNow')}
          </Button>
        </div>
      </div>

      <div className="pt-8 border-t border-[var(--color-border)]">
        <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">{t('settingsHolidays.customTitle')}</h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">{t('settingsHolidays.customDescription')}</p>
        <div className="space-y-4 mb-6 p-4 bg-[var(--color-bg-tertiary)] rounded-lg border border-[var(--color-border)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">{t('settingsHolidays.holidayName')}</label>
              <Input value={newHolidayName} onChange={(e) => setNewHolidayName(e.target.value)} placeholder={t('settingsHolidays.holidayNamePlaceholder')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">{t('settingsHolidays.date')}</label>
              <Input type="date" value={newHolidayDate} onChange={(e) => setNewHolidayDate(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="recurring" checked={newHolidayRecurring} onChange={(e) => setNewHolidayRecurring(e.target.checked)} className="w-5 h-5 text-[var(--color-accent)] rounded focus:ring-2 focus:ring-[var(--color-accent)]" />
            <label htmlFor="recurring" className="text-sm text-[var(--color-text-primary)] cursor-pointer">{t('settingsHolidays.recurring')}</label>
          </div>
          <Button onClick={handleAddCustomHoliday} disabled={!newHolidayName || !newHolidayDate} leftIcon={<Plus size={16} />} className="w-full md:w-auto">{t('settingsHolidays.addCustom')}</Button>
        </div>
        <div className="space-y-2">
          {settings.holidays.customHolidays.length === 0 ? (
            <p className="text-center py-8 text-[var(--color-text-tertiary)] text-sm">{t('settingsHolidays.noCustom')}</p>
          ) : (
            settings.holidays.customHolidays.map((holiday) => (
              <div key={holiday.id} className="flex items-center justify-between p-3 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]">
                <div>
                  <p className="font-medium text-[var(--color-text-primary)]">{holiday.name}</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {format(new Date(holiday.date), 'MMMM d, yyyy', { locale: getDateLocale() })}
                    {holiday.recurring && <span className="ml-2 text-xs text-[var(--color-accent)]">{t('settingsHolidays.recurringLabel')}</span>}
                  </p>
                </div>
                <Button variant="secondary" onClick={() => deleteCustomHoliday(holiday.id)} leftIcon={<Trash2 size={14} />} className="text-red-600">{t('common.delete')}</Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
