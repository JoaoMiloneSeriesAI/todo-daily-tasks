import { useState, useEffect } from 'react';
import { Plus, Trash2, RefreshCw } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import { useCalendarStore } from '../../stores/calendarStore';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
import { toast } from '../shared/Toast';
import { format } from 'date-fns';
import { Country } from '../../types/calendar';
import { ipcService } from '../../services/ipcService';

export function HolidaySettings() {
  const { settings, updateSettings, addCustomHoliday, deleteCustomHoliday } = useSettingsStore();
  const { loadHolidays } = useCalendarStore();
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [isFetchingHolidays, setIsFetchingHolidays] = useState(false);
  const [newHolidayName, setNewHolidayName] = useState('');
  const [newHolidayDate, setNewHolidayDate] = useState('');
  const [newHolidayRecurring, setNewHolidayRecurring] = useState(false);

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    setIsLoadingCountries(true);
    try {
      const result = await ipcService.fetchCountries();
      setCountries(result);
    } catch (error) {
      console.error('Failed to fetch countries:', error);
    } finally {
      setIsLoadingCountries(false);
    }
  };

  const handleFetchHolidays = async () => {
    if (!settings.holidays.country) return;
    setIsFetchingHolidays(true);
    try {
      const year = new Date().getFullYear();
      await loadHolidays(year);
      toast.success('Holidays fetched successfully!');
    } catch (error) {
      console.error('Failed to fetch holidays:', error);
      toast.error('Failed to fetch holidays. Please try again.');
    } finally {
      setIsFetchingHolidays(false);
    }
  };

  const handleAddCustomHoliday = () => {
    if (!newHolidayName || !newHolidayDate) return;
    addCustomHoliday({ name: newHolidayName, date: newHolidayDate, recurring: newHolidayRecurring });
    setNewHolidayName('');
    setNewHolidayDate('');
    setNewHolidayRecurring(false);
  };

  const selectClass = "max-w-md w-full px-4 py-2 bg-[var(--color-input-bg)] border border-[var(--color-input-border)] rounded-lg text-[var(--color-text-primary)] text-sm focus:bg-[var(--color-input-focus-bg)] focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1] focus:ring-opacity-20 transition-all duration-200 cursor-pointer disabled:opacity-50";

  return (
    <div className="space-y-8">
      {/* API Holidays */}
      <div>
        <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">Holiday API Integration</h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">
          Automatically fetch public holidays for your country
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Country</label>
            <select
              value={settings.holidays.country}
              onChange={(e) => updateSettings({ holidays: { ...settings.holidays, country: e.target.value } })}
              disabled={isLoadingCountries}
              className={selectClass}
            >
              <option value="">Select a country</option>
              {countries.map((country) => (
                <option key={country.code} value={country.code}>{country.name} ({country.code})</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg border border-[var(--color-border)]">
            <input
              type="checkbox"
              id="autoFetch"
              checked={settings.holidays.autoFetch}
              onChange={(e) => updateSettings({ holidays: { ...settings.holidays, autoFetch: e.target.checked } })}
              className="w-5 h-5 text-[#6366F1] rounded focus:ring-2 focus:ring-[#6366F1]"
            />
            <div>
              <label htmlFor="autoFetch" className="text-sm font-medium text-[var(--color-text-primary)] cursor-pointer">
                Automatically fetch holidays
              </label>
              <p className="text-xs text-[var(--color-text-tertiary)]">
                Fetch holidays for the current year when the app starts
              </p>
            </div>
          </div>

          <Button
            onClick={handleFetchHolidays}
            disabled={!settings.holidays.country || isFetchingHolidays}
            leftIcon={<RefreshCw size={16} className={isFetchingHolidays ? 'animate-spin' : ''} />}
          >
            {isFetchingHolidays ? 'Fetching...' : 'Fetch Holidays Now'}
          </Button>
        </div>
      </div>

      {/* Custom Holidays */}
      <div className="pt-8 border-t border-[var(--color-border)]">
        <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">Custom Holidays</h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">Add your own holidays or special dates</p>

        <div className="space-y-4 mb-6 p-4 bg-[var(--color-bg-tertiary)] rounded-lg border border-[var(--color-border)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Holiday Name</label>
              <Input value={newHolidayName} onChange={(e) => setNewHolidayName(e.target.value)} placeholder="e.g., Company Anniversary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Date</label>
              <Input type="date" value={newHolidayDate} onChange={(e) => setNewHolidayDate(e.target.value)} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="recurring"
              checked={newHolidayRecurring}
              onChange={(e) => setNewHolidayRecurring(e.target.checked)}
              className="w-5 h-5 text-[#6366F1] rounded focus:ring-2 focus:ring-[#6366F1]"
            />
            <label htmlFor="recurring" className="text-sm text-[var(--color-text-primary)] cursor-pointer">
              Recurring annually
            </label>
          </div>

          <Button onClick={handleAddCustomHoliday} disabled={!newHolidayName || !newHolidayDate} leftIcon={<Plus size={16} />} className="w-full md:w-auto">
            Add Custom Holiday
          </Button>
        </div>

        <div className="space-y-2">
          {settings.holidays.customHolidays.length === 0 ? (
            <p className="text-center py-8 text-[var(--color-text-tertiary)] text-sm">No custom holidays added yet</p>
          ) : (
            settings.holidays.customHolidays.map((holiday) => (
              <div key={holiday.id} className="flex items-center justify-between p-3 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]">
                <div>
                  <p className="font-medium text-[var(--color-text-primary)]">{holiday.name}</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {format(new Date(holiday.date), 'MMMM d, yyyy')}
                    {holiday.recurring && <span className="ml-2 text-xs text-[#6366F1]">Recurring</span>}
                  </p>
                </div>
                <Button variant="secondary" onClick={() => deleteCustomHoliday(holiday.id)} leftIcon={<Trash2 size={14} />} className="text-red-600">
                  Delete
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
