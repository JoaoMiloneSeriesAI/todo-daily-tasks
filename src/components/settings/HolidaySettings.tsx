import { useState, useEffect } from 'react';
import { Plus, Trash2, RefreshCw } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
import { toast } from '../shared/Toast';
import { format } from 'date-fns';
import { Country } from '../../types/calendar';

export function HolidaySettings() {
  const { settings, updateSettings, addCustomHoliday, deleteCustomHoliday } = useSettingsStore();
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
      const result = await window.electronAPI.fetchCountries();
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
      await window.electronAPI.fetchHolidays({
        countryCode: settings.holidays.country,
        year,
        languageCode: settings.general.language,
      });
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

    addCustomHoliday({
      name: newHolidayName,
      date: newHolidayDate,
      recurring: newHolidayRecurring,
    });

    setNewHolidayName('');
    setNewHolidayDate('');
    setNewHolidayRecurring(false);
  };

  return (
    <div className="space-y-8">
      {/* API Holidays */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Holiday API Integration</h2>
        <p className="text-sm text-gray-600 mb-6">
          Automatically fetch public holidays for your country
        </p>

        <div className="space-y-4">
          {/* Country Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
            <select
              value={settings.holidays.country}
              onChange={(e) =>
                updateSettings({
                  holidays: { ...settings.holidays, country: e.target.value },
                })
              }
              disabled={isLoadingCountries}
              className="max-w-md w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:bg-white focus:border-primary-main focus:ring-2 focus:ring-primary-main focus:ring-opacity-20 transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              <option value="">Select a country</option>
              {countries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name} ({country.code})
                </option>
              ))}
            </select>
          </div>

          {/* Auto-fetch Toggle */}
          <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200">
            <input
              type="checkbox"
              id="autoFetch"
              checked={settings.holidays.autoFetch}
              onChange={(e) =>
                updateSettings({
                  holidays: { ...settings.holidays, autoFetch: e.target.checked },
                })
              }
              className="w-5 h-5 text-primary-main rounded focus:ring-2 focus:ring-primary-main"
            />
            <div>
              <label htmlFor="autoFetch" className="text-sm font-medium text-gray-700 cursor-pointer">
                Automatically fetch holidays
              </label>
              <p className="text-xs text-gray-500">
                Fetch holidays for the current year when the app starts
              </p>
            </div>
          </div>

          {/* Manual Fetch Button */}
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
      <div className="pt-8 border-t border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Custom Holidays</h2>
        <p className="text-sm text-gray-600 mb-6">
          Add your own holidays or special dates
        </p>

        {/* Add Custom Holiday Form */}
        <div className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Holiday Name
              </label>
              <Input
                value={newHolidayName}
                onChange={(e) => setNewHolidayName(e.target.value)}
                placeholder="e.g., Company Anniversary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <Input
                type="date"
                value={newHolidayDate}
                onChange={(e) => setNewHolidayDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="recurring"
              checked={newHolidayRecurring}
              onChange={(e) => setNewHolidayRecurring(e.target.checked)}
              className="w-5 h-5 text-primary-main rounded focus:ring-2 focus:ring-primary-main"
            />
            <label htmlFor="recurring" className="text-sm text-gray-700 cursor-pointer">
              Recurring annually (same month and day every year)
            </label>
          </div>

          <Button
            onClick={handleAddCustomHoliday}
            disabled={!newHolidayName || !newHolidayDate}
            leftIcon={<Plus size={16} />}
            className="w-full md:w-auto"
          >
            Add Custom Holiday
          </Button>
        </div>

        {/* Custom Holidays List */}
        <div className="space-y-2">
          {settings.holidays.customHolidays.length === 0 ? (
            <p className="text-center py-8 text-gray-500 text-sm">
              No custom holidays added yet
            </p>
          ) : (
            settings.holidays.customHolidays.map((holiday) => (
              <div
                key={holiday.id}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium text-gray-900">{holiday.name}</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(holiday.date), 'MMMM d, yyyy')}
                    {holiday.recurring && (
                      <span className="ml-2 text-xs text-primary-main">• Recurring</span>
                    )}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => deleteCustomHoliday(holiday.id)}
                  leftIcon={<Trash2 size={14} />}
                  className="text-red-600 hover:bg-red-50"
                >
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
