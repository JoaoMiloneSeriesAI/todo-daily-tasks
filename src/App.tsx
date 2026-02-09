import { useState, useEffect, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { ToastContainer } from './components/shared/Toast';
import { LoadingSpinner } from './components/shared';
import { useSettingsStore } from './stores/settingsStore';
import { useBoardStore } from './stores/boardStore';

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

  const handleNavigateToBoard = (date: Date) => {
    setSelectedDate(date);
    loadBoardForDate(date);
    setCurrentView('board');
  };

  return (
    <ErrorBoundary>
      <ToastContainer />
      <div className="min-h-screen bg-[var(--color-bg-primary)]">
      {/* Navigation Bar */}
      <nav className="bg-[var(--color-surface)] border-b border-[var(--color-border)] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-primary-main">{t('app.title')}</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentView('calendar')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'calendar'
                  ? 'bg-primary-main text-white'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'
              }`}
            >
              {t('app.calendar')}
            </button>
            <button
              onClick={() => setCurrentView('board')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'board'
                  ? 'bg-primary-main text-white'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'
              }`}
            >
              {t('app.board')}
            </button>
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'dashboard'
                  ? 'bg-primary-main text-white'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'
              }`}
            >
              {t('app.dashboard')}
            </button>
            <button
              onClick={() => setCurrentView('settings')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'settings'
                  ? 'bg-primary-main text-white'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'
              }`}
            >
              {t('app.settings')}
            </button>
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
            <Board selectedDate={selectedDate} />
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
