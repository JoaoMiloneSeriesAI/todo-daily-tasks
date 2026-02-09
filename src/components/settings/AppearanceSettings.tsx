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

  const selectClass = "max-w-xs w-full px-4 py-2 bg-[var(--color-input-bg)] border border-[var(--color-input-border)] rounded-lg text-[var(--color-text-primary)] text-sm focus:bg-[var(--color-input-focus-bg)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-ring)] transition-all duration-200 cursor-pointer";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">Appearance</h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">
          Customize the look and feel of your task manager
        </p>
      </div>

      {/* Theme */}
      <div>
        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Theme</label>
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
          className={selectClass}
        >
          {themes.map((theme) => (
            <option key={theme.value} value={theme.value}>
              {theme.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
          Choose between light, dark, or automatic theme based on system preferences
        </p>
      </div>

      {/* Accent Color */}
      <div>
        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-3">Accent Color</label>
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
                  ? 'border-[var(--color-text-primary)] shadow-md'
                  : 'border-[var(--color-border)] hover:border-[var(--color-text-tertiary)]'
              }`}
            >
              <div
                className="w-full h-12 rounded-md mb-2"
                style={{ backgroundColor: color.color }}
              />
              <p className="text-xs text-[var(--color-text-secondary)] font-medium text-center">{color.label}</p>
            </button>
          ))}
        </div>
        <p className="text-xs text-[var(--color-text-tertiary)] mt-3">
          Select your preferred accent color for buttons, links, and highlights
        </p>
      </div>

      {/* Animations */}
      <div>
        <label className="flex items-center gap-3 p-4 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={settings.appearance.enableAnimations}
            onChange={(e) =>
              updateSettings({
                appearance: { ...settings.appearance, enableAnimations: e.target.checked },
              })
            }
            className="w-5 h-5 text-[var(--color-accent)] rounded focus:ring-2 focus:ring-[var(--color-accent)]"
          />
          <div>
            <p className="text-sm font-medium text-[var(--color-text-primary)]">Enable Animations</p>
            <p className="text-xs text-[var(--color-text-tertiary)]">
              Enable smooth transitions and animations throughout the app
            </p>
          </div>
        </label>
      </div>
    </div>
  );
}
