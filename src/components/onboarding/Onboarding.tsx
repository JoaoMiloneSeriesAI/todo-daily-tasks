import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSettingsStore } from '../../stores/settingsStore';
import { useTranslation } from 'react-i18next';
import { Country } from '../../types/calendar';
import { ipcService } from '../../services/ipcService';
import { CheckCircle, ChevronRight, Globe, Calendar, Palette } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const { settings, updateSettings } = useSettingsStore();
  const { t, i18n } = useTranslation();
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
    { key: 'monday' as const, labelKey: 'settingsWorkDays.monday' },
    { key: 'tuesday' as const, labelKey: 'settingsWorkDays.tuesday' },
    { key: 'wednesday' as const, labelKey: 'settingsWorkDays.wednesday' },
    { key: 'thursday' as const, labelKey: 'settingsWorkDays.thursday' },
    { key: 'friday' as const, labelKey: 'settingsWorkDays.friday' },
    { key: 'saturday' as const, labelKey: 'settingsWorkDays.saturday' },
    { key: 'sunday' as const, labelKey: 'settingsWorkDays.sunday' },
  ];

  const selectClass = "w-full px-4 py-3 bg-[var(--color-input-bg)] border border-[var(--color-input-border)] rounded-lg text-[var(--color-text-primary)] text-sm";

  const steps = [
    // Step 0: Welcome
    <div key="welcome" className="text-center">
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-[var(--color-accent-light)]">
        <CheckCircle size={40} className="text-[var(--color-accent)]" />
      </div>
      <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-3">{t('onboarding.welcome')}</h1>
      <p className="text-[var(--color-text-secondary)] text-lg mb-8 max-w-md mx-auto">{t('onboarding.welcomeDesc')}</p>
      <button onClick={() => setStep(1)} className="px-8 py-3 text-[var(--color-accent-text)] bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] rounded-lg font-semibold text-lg transition-colors inline-flex items-center gap-2">
        {t('onboarding.getStarted')} <ChevronRight size={20} />
      </button>
    </div>,

    // Step 1: Country and Work Days
    <div key="workdays">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-[var(--color-accent-light)]">
          <Globe size={24} className="text-[var(--color-accent)]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">{t('onboarding.countryWorkDays')}</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">{t('onboarding.countryWorkDaysDesc')}</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">{t('onboarding.yourCountry')}</label>
          <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)} className={selectClass}>
            <option value="">{t('onboarding.selectCountry')}</option>
            {countries.map((c) => (<option key={c.code} value={c.code}>{c.name}</option>))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-3">{t('onboarding.workDays')}</label>
          <div className="grid grid-cols-7 gap-1.5">
            {dayLabels.map((day) => (
              <button
                key={day.key}
                onClick={() => toggleWorkDay(day.key)}
                className={`py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  workDays[day.key]
                    ? 'bg-[var(--color-accent)] text-[var(--color-accent-text)]'
                    : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]'
                }`}
              >
                {t(day.labelKey).slice(0, 3)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button onClick={() => setStep(0)} className="px-6 py-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">{t('onboarding.back')}</button>
        <button onClick={() => setStep(2)} className="px-8 py-3 text-[var(--color-accent-text)] bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] rounded-lg font-semibold transition-colors inline-flex items-center gap-2">
          {t('onboarding.next')} <ChevronRight size={20} />
        </button>
      </div>
    </div>,

    // Step 2: Language and Theme
    <div key="appearance">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-[var(--color-accent-light)]">
          <Palette size={24} className="text-[var(--color-accent)]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">{t('onboarding.languageTheme')}</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">{t('onboarding.languageThemeDesc')}</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">{t('onboarding.language')}</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className={selectClass}>
            <option value="en">English</option>
            <option value="es">Espanol</option>
            <option value="pt-BR">Portugues (Brasil)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-3">{t('onboarding.themeLabel')}</label>
          <div className="grid grid-cols-3 gap-3">
            {([
              { value: 'light' as const, labelKey: 'onboarding.light' },
              { value: 'dark' as const, labelKey: 'onboarding.dark' },
              { value: 'system' as const, labelKey: 'onboarding.auto' },
            ]).map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={`py-3 px-4 rounded-lg text-sm font-medium transition-colors border-2 ${
                  theme === opt.value
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent-light)] text-[var(--color-accent)]'
                    : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-tertiary)]'
                }`}
              >
                {t(opt.labelKey)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button onClick={() => setStep(1)} className="px-6 py-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">{t('onboarding.back')}</button>
        <button onClick={handleComplete} className="px-8 py-3 text-[var(--color-accent-text)] bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] rounded-lg font-semibold transition-colors inline-flex items-center gap-2">
          <Calendar size={20} /> {t('onboarding.startUsing')}
        </button>
      </div>
    </div>,
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg bg-[var(--color-surface)] rounded-2xl shadow-xl p-5 sm:p-8">
        <div className="flex items-center justify-center gap-2 mb-8">
          {[0, 1, 2].map((s) => (
            <div key={s} className="h-2 rounded-full transition-all duration-300" style={{
              width: s === step ? '2rem' : '0.5rem',
              backgroundColor: s <= step ? 'var(--color-accent)' : 'var(--color-border)',
              opacity: s < step ? 0.5 : 1,
            }} />
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2, ease: 'easeInOut' }}>
            {steps[step]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
