import { useState, useEffect, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
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

function App() {
  const [currentView, setCurrentView] = useState<View>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { t, i18n } = useTranslation();
  const { loadSettings, settings } = useSettingsStore();
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

  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check if onboarding is needed
  useEffect(() => {
    if (!settings.hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  }, [settings.hasCompletedOnboarding]);

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

  return (
    <ErrorBoundary>
      <ToastContainer />
      <div className="min-h-screen bg-[var(--color-bg-primary)]">
      {/* Navigation Bar — draggable on macOS */}
      <nav
        className="sticky top-0 z-30 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-3 pl-20"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <div className="flex items-center">
          <h1 className="text-lg font-bold whitespace-nowrap mr-4" style={{ color: '#6366F1' }}>
            {t('app.title')}
          </h1>

          <div
            className="flex items-center gap-1 flex-1 justify-center flex-wrap"
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          >
            {(['calendar', 'board', 'dashboard', 'settings'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setCurrentView(view)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                style={
                  currentView === view
                    ? { backgroundColor: '#6366F1', color: '#FFFFFF' }
                    : { color: 'var(--color-text-secondary)' }
                }
                onMouseEnter={(e) => {
                  if (currentView !== view) e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
                }}
                onMouseLeave={(e) => {
                  if (currentView !== view) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {t(`app.${view}`)}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6 max-w-7xl mx-auto">
        <Suspense fallback={<div className="flex items-center justify-center h-64"><LoadingSpinner /></div>}>
          {currentView === 'calendar' && (
            <Calendar onDayClick={handleNavigateToBoard} />
          )}

          {currentView === 'board' && (
            <Board selectedDate={selectedDate} onBack={() => setCurrentView('calendar')} />
          )}

          {currentView === 'dashboard' && <Dashboard />}

          {currentView === 'settings' && <Settings />}
        </Suspense>
      </main>
    </div>
    </ErrorBoundary>
  );
}

export default App;
