import { useState, useEffect, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { ToastContainer } from './components/shared/Toast';
import { LoadingSpinner } from './components/shared';
import { useSettingsStore } from './stores/settingsStore';
import { useBoardStore } from './stores/boardStore';

import { Onboarding } from './components/onboarding/Onboarding';

const Calendar = lazy(() => import('./components/calendar/Calendar').then(m => ({ default: m.Calendar })));
const Board = lazy(() => import('./components/board/Board').then(m => ({ default: m.Board })));
const Dashboard = lazy(() => import('./components/dashboard/Dashboard').then(m => ({ default: m.Dashboard })));
const Settings = lazy(() => import('./components/settings/Settings').then(m => ({ default: m.Settings })));

type View = 'calendar' | 'board' | 'dashboard' | 'settings';

/// <summary>
/// Computes and applies accent color CSS variables from a hex color string.
/// Sets --color-accent and its derived variants on the document root.
/// </summary>
function applyAccentColor(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  // Darker variant for hover states (~85% brightness)
  const dr = Math.round(r * 0.85);
  const dg = Math.round(g * 0.85);
  const db = Math.round(b * 0.85);

  // Lighter variant (~115% brightness, clamped to 255)
  const lr = Math.min(Math.round(r * 1.15), 255);
  const lg = Math.min(Math.round(g * 1.15), 255);
  const lb = Math.min(Math.round(b * 1.15), 255);

  const el = document.documentElement;
  el.style.setProperty('--color-accent', hex);
  el.style.setProperty('--color-accent-hover', `rgb(${dr}, ${dg}, ${db})`);
  el.style.setProperty('--color-accent-light', `rgba(${r}, ${g}, ${b}, 0.1)`);
  el.style.setProperty('--color-accent-ring', `rgba(${r}, ${g}, ${b}, 0.3)`);
  el.style.setProperty('--color-accent-text', '#FFFFFF');
  el.style.setProperty('--color-accent-secondary', `rgb(${lr}, ${lg}, ${lb})`);
}

const viewTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.2, ease: 'easeInOut' as const },
};

function App() {
  const [currentView, setCurrentView] = useState<View>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { t, i18n } = useTranslation();
  const { loadSettings, settings, isLoading: isSettingsLoading } = useSettingsStore();
  const { loadBoardForDate } = useBoardStore();

  // Initialize app
  useEffect(() => {
    loadSettings();
    loadBoardForDate(new Date());
  }, []);

  // Sync language from settings
  useEffect(() => {
    const lang = settings.general.language;
    if (lang && lang !== i18n.language) {
      i18n.changeLanguage(lang);
    }
  }, [settings.general.language]);

  // Apply theme
  useEffect(() => {
    const applyTheme = (isDark: boolean) => {
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    const theme = settings.appearance.theme;

    if (theme === 'dark') {
      applyTheme(true);
    } else if (theme === 'light') {
      applyTheme(false);
    } else {
      // System preference
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mediaQuery.matches);

      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [settings.appearance.theme]);

  // Apply accent color from settings
  useEffect(() => {
    const accent = settings.appearance.accentColor;
    if (accent && /^#[0-9A-Fa-f]{6}$/.test(accent)) {
      applyAccentColor(accent);
    }
  }, [settings.appearance.accentColor]);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // Track when the initial settings load completes
  useEffect(() => {
    if (!isSettingsLoading && !settingsLoaded) {
      setSettingsLoaded(true);
    }
  }, [isSettingsLoading]);

  // Check if onboarding is needed — only after settings have loaded from disk
  useEffect(() => {
    if (settingsLoaded && !settings.hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  }, [settingsLoaded, settings.hasCompletedOnboarding]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  const handleNavigateToBoard = (date: Date) => {
    setSelectedDate(date);
    loadBoardForDate(date);
    setCurrentView('board');
  };

  if (showOnboarding) {
    return (
      <ErrorBoundary>
        <Onboarding onComplete={handleOnboardingComplete} />
      </ErrorBoundary>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'calendar':
        return <Calendar onDayClick={handleNavigateToBoard} />;
      case 'board':
        return <Board selectedDate={selectedDate} onBack={() => setCurrentView('calendar')} />;
      case 'dashboard':
        return <Dashboard />;
      case 'settings':
        return <Settings />;
    }
  };

  return (
    <ErrorBoundary>
      <ToastContainer />
      <div className="min-h-screen bg-[var(--color-bg-primary)]">
      {/* Navigation Bar — draggable on macOS */}
      <nav
        className="sticky top-0 z-30 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-3 pl-20"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <div className="flex items-center justify-center">
          <div
            className="flex items-center gap-3"
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          >
            <h1 className="text-lg font-bold whitespace-nowrap text-[var(--color-accent)]">
              {t('app.title')}
            </h1>

            <div className="w-px h-5 bg-[var(--color-border)]" />
          </div>

          <div
            className="flex items-center gap-1 ml-3"
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          >
            {(['calendar', 'board', 'dashboard', 'settings'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setCurrentView(view)}
                className="relative px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                style={{ color: currentView === view ? 'var(--color-accent-text)' : 'var(--color-text-secondary)' }}
              >
                {/* Animated active indicator pill */}
                {currentView === view && (
                  <motion.div
                    layoutId="navIndicator"
                    className="absolute inset-0 bg-[var(--color-accent)] rounded-lg"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10">{t(`app.${view}`)}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6 max-w-7xl mx-auto">
        <Suspense fallback={<div className="flex items-center justify-center h-64"><LoadingSpinner /></div>}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={viewTransition.initial}
              animate={viewTransition.animate}
              exit={viewTransition.exit}
              transition={viewTransition.transition}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </main>
    </div>
    </ErrorBoundary>
  );
}

export default App;
