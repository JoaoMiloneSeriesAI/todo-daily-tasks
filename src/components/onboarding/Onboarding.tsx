import { useState, useEffect } from 'react';
import { useSettingsStore } from '../../stores/settingsStore';
import { useTranslation } from 'react-i18next';
import { Country } from '../../types/calendar';
import { ipcService } from '../../services/ipcService';
import { CheckCircle, ChevronRight, Globe, Calendar, Palette } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

const ACCENT = '#6366F1';
const ACCENT_DARK = '#4F46E5';
const ACCENT_BG = 'rgba(99, 102, 241, 0.1)';

export function Onboarding({ onComplete }: OnboardingProps) {
  const { settings, updateSettings } = useSettingsStore();
  const { i18n } = useTranslation();
  const [step, setStep] = useState(0);
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState(settings.holidays.country || 'US');
  const [workDays, setWorkDays] = useState(settings.workDays);
  const [language, setLanguage] = useState(settings.general.language || 'en');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(settings.appearance.theme || 'light');

  useEffect(() => {
    ipcService.fetchCountries().then(setCountries);
  }, []);

  const handleComplete = async () => {
    await updateSettings({
      general: { ...settings.general, language },
      workDays,
      holidays: { ...settings.holidays, country: selectedCountry, autoFetch: true },
      appearance: { ...settings.appearance, theme },
      hasCompletedOnboarding: true,
    });
    i18n.changeLanguage(language);
    onComplete();
  };

  const toggleWorkDay = (day: keyof typeof workDays) => {
    setWorkDays({ ...workDays, [day]: !workDays[day] });
  };

  const dayLabels = [
    { key: 'monday' as const, label: 'Mon' },
    { key: 'tuesday' as const, label: 'Tue' },
    { key: 'wednesday' as const, label: 'Wed' },
    { key: 'thursday' as const, label: 'Thu' },
    { key: 'friday' as const, label: 'Fri' },
    { key: 'saturday' as const, label: 'Sat' },
    { key: 'sunday' as const, label: 'Sun' },
  ];

  const selectClass = "w-full px-4 py-3 bg-[var(--color-input-bg)] border border-[var(--color-input-border)] rounded-lg text-[var(--color-text-primary)] text-sm";

  const steps = [
    // Step 0: Welcome
    <div key="welcome" className="text-center">
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
        style={{ backgroundColor: ACCENT_BG }}
      >
        <CheckCircle size={40} style={{ color: ACCENT }} />
      </div>
      <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-3">
        Welcome to Task Manager
      </h1>
      <p className="text-[var(--color-text-secondary)] text-lg mb-8 max-w-md mx-auto">
        A calendar-based Kanban board to organize your daily tasks.
        Let's set up a few things to get you started.
      </p>
      <button
        onClick={() => setStep(1)}
        className="px-8 py-3 text-white rounded-lg font-semibold text-lg transition-colors inline-flex items-center gap-2"
        style={{ backgroundColor: ACCENT }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ACCENT_DARK)}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = ACCENT)}
      >
        Get Started <ChevronRight size={20} />
      </button>
    </div>,

    // Step 1: Country and Work Days
    <div key="workdays">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg" style={{ backgroundColor: ACCENT_BG }}>
          <Globe size={24} style={{ color: ACCENT }} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Country &amp; Work Days</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">We'll fetch public holidays for your country</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Your Country</label>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className={selectClass}
          >
            <option value="">Select a country</option>
            {countries.map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-3">Work Days</label>
          <div className="flex gap-2">
            {dayLabels.map((day) => (
              <button
                key={day.key}
                onClick={() => toggleWorkDay(day.key)}
                className="flex-1 py-3 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: workDays[day.key] ? ACCENT : 'var(--color-bg-tertiary)',
                  color: workDays[day.key] ? '#FFFFFF' : 'var(--color-text-secondary)',
                }}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={() => setStep(0)}
          className="px-6 py-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          Back
        </button>
        <button
          onClick={() => setStep(2)}
          className="px-8 py-3 text-white rounded-lg font-semibold transition-colors inline-flex items-center gap-2"
          style={{ backgroundColor: ACCENT }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ACCENT_DARK)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = ACCENT)}
        >
          Next <ChevronRight size={20} />
        </button>
      </div>
    </div>,

    // Step 2: Language and Theme
    <div key="appearance">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg" style={{ backgroundColor: ACCENT_BG }}>
          <Palette size={24} style={{ color: ACCENT }} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Language &amp; Theme</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">Choose your preferred language and appearance</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Language</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className={selectClass}>
            <option value="en">English</option>
            <option value="es">Espanol</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-3">Theme</label>
          <div className="grid grid-cols-3 gap-3">
            {(['light', 'dark', 'system'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className="py-3 px-4 rounded-lg text-sm font-medium transition-colors border-2"
                style={{
                  borderColor: theme === t ? ACCENT : 'var(--color-border)',
                  backgroundColor: theme === t ? ACCENT_BG : 'transparent',
                  color: theme === t ? ACCENT : 'var(--color-text-secondary)',
                }}
              >
                {t === 'light' ? 'Light' : t === 'dark' ? 'Dark' : 'Auto'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={() => setStep(1)}
          className="px-6 py-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleComplete}
          className="px-8 py-3 text-white rounded-lg font-semibold transition-colors inline-flex items-center gap-2"
          style={{ backgroundColor: ACCENT }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ACCENT_DARK)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = ACCENT)}
        >
          <Calendar size={20} /> Start Using Task Manager
        </button>
      </div>
    </div>,
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-[var(--color-surface)] rounded-2xl shadow-xl p-8">
        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[0, 1, 2].map((s) => (
            <div
              key={s}
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: s === step ? '2rem' : '0.5rem',
                backgroundColor: s <= step ? ACCENT : 'var(--color-border)',
                opacity: s < step ? 0.5 : 1,
              }}
            />
          ))}
        </div>

        {steps[step]}
      </div>
    </div>
  );
}
