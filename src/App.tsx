import { useState, useEffect } from 'react';
import { Calendar } from './components/calendar/Calendar';
import { Board } from './components/board/Board';
import { Dashboard } from './components/dashboard/Dashboard';
import { Settings } from './components/settings/Settings';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { ToastContainer } from './components/shared/Toast';
import { useSettingsStore } from './stores/settingsStore';
import { useBoardStore } from './stores/boardStore';

type View = 'calendar' | 'board' | 'dashboard' | 'settings';

function App() {
  const [currentView, setCurrentView] = useState<View>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { loadSettings } = useSettingsStore();
  const { loadBoardForDate } = useBoardStore();

  // Initialize app
  useEffect(() => {
    loadSettings();
    loadBoardForDate(new Date());
  }, []);

  const handleNavigateToBoard = (date: Date) => {
    setSelectedDate(date);
    loadBoardForDate(date);
    setCurrentView('board');
  };

  return (
    <ErrorBoundary>
      <ToastContainer />
      <div className="min-h-screen bg-background-primary">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-primary-main">Task Manager</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentView('calendar')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'calendar'
                  ? 'bg-primary-main text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setCurrentView('board')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'board'
                  ? 'bg-primary-main text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Board
            </button>
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'dashboard'
                  ? 'bg-primary-main text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentView('settings')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'settings'
                  ? 'bg-primary-main text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Settings
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6 max-w-7xl mx-auto">
        {currentView === 'calendar' && (
          <Calendar onDayClick={handleNavigateToBoard} />
        )}

        {currentView === 'board' && (
          <Board selectedDate={selectedDate} />
        )}

        {currentView === 'dashboard' && <Dashboard />}

        {currentView === 'settings' && <Settings />}
      </main>
    </div>
    </ErrorBoundary>
  );
}

export default App;
