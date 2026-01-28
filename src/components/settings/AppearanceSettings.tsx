import { useSettingsStore } from '../../stores/settingsStore';

export function AppearanceSettings() {
  const { settings, updateSettings } = useSettingsStore();

  const themes = [
    { value: 'light' as const, label: 'Light' },
    { value: 'dark' as const, label: 'Dark' },
    { value: 'system' as const, label: 'Auto (System)' },
  ];

  const accentColors = [
    { value: '#6366F1', label: 'Indigo (Default)', color: '#6366F1' },
    { value: '#EC4899', label: 'Pink', color: '#EC4899' },
    { value: '#14B8A6', label: 'Teal', color: '#14B8A6' },
    { value: '#F59E0B', label: 'Amber', color: '#F59E0B' },
    { value: '#8B5CF6', label: 'Purple', color: '#8B5CF6' },
    { value: '#10B981', label: 'Green', color: '#10B981' },
    { value: '#EF4444', label: 'Red', color: '#EF4444' },
    { value: '#3B82F6', label: 'Blue', color: '#3B82F6' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Appearance</h2>
        <p className="text-sm text-gray-600 mb-6">
          Customize the look and feel of your task manager
        </p>
      </div>

      {/* Theme */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
        <select
          value={settings.appearance.theme}
          onChange={(e) =>
            updateSettings({
              appearance: {
                ...settings.appearance,
                theme: e.target.value as 'light' | 'dark' | 'system',
              },
            })
          }
          className="max-w-xs w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:bg-white focus:border-primary-main focus:ring-2 focus:ring-primary-main focus:ring-opacity-20 transition-all duration-200 cursor-pointer"
        >
          {themes.map((theme) => (
            <option key={theme.value} value={theme.value}>
              {theme.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Choose between light, dark, or automatic theme based on system preferences
        </p>
      </div>

      {/* Accent Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Accent Color</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {accentColors.map((color) => (
            <button
              key={color.value}
              onClick={() =>
                updateSettings({
                  appearance: { ...settings.appearance, accentColor: color.value },
                })
              }
              className={`p-3 rounded-lg border-2 transition-all ${
                settings.appearance.accentColor === color.value
                  ? 'border-gray-900 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div
                className="w-full h-12 rounded-md mb-2"
                style={{ backgroundColor: color.color }}
              />
              <p className="text-xs text-gray-700 font-medium text-center">{color.label}</p>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Select your preferred accent color for buttons, links, and highlights
        </p>
      </div>

      {/* Animations */}
      <div>
        <label className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={settings.appearance.enableAnimations}
            onChange={(e) =>
              updateSettings({
                appearance: { ...settings.appearance, enableAnimations: e.target.checked },
              })
            }
            className="w-5 h-5 text-primary-main rounded focus:ring-2 focus:ring-primary-main"
          />
          <div>
            <p className="text-sm font-medium text-gray-700">Enable Animations</p>
            <p className="text-xs text-gray-500">
              Enable smooth transitions and animations throughout the app
            </p>
          </div>
        </label>
      </div>

      {/* Preview */}
      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Preview</h3>
        <div className="p-6 rounded-lg border border-gray-200 bg-white">
          <div className="flex items-center gap-4 mb-4">
            <button
              className="px-4 py-2 rounded-lg text-white font-medium transition-colors"
              style={{ backgroundColor: settings.appearance.accentColor }}
            >
              Primary Button
            </button>
            <button className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors">
              Secondary Button
            </button>
          </div>
          <div className="space-y-2">
            <div
              className="h-2 rounded-full"
              style={{ backgroundColor: settings.appearance.accentColor, width: '60%' }}
            />
            <div
              className="h-2 rounded-full opacity-50"
              style={{ backgroundColor: settings.appearance.accentColor, width: '40%' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
