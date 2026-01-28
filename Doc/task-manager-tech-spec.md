# Task Management Application - Technical Specification

**Version:** 2.0  
**Date:** January 28, 2026  
**Platform:** macOS and Windows  
**Framework:** Electron.js  
**Development Environment:** Cross-platform

---

## 1. Executive Summary

This document outlines the technical specifications for a cross-platform desktop task management application designed to help users organize daily tasks using a calendar-based Kanban board interface. The application features time tracking, customizable workflows, holiday integration, data analytics, and local data storage with import/export capabilities.

The application is built using Electron.js, which provides a modern web-based development experience while delivering native desktop capabilities across macOS and Windows platforms.

---

## 2. Technology Stack

### 2.1 Core Framework
- **Electron.js** (v29.0 or higher)
- **Node.js** (v20.0 or higher)
- **Target Platforms:** macOS (x64, ARM64), Windows (x64, ARM64)
- **Development Platform:** Cross-platform (macOS, Windows, Linux)

### 2.2 Frontend Stack

#### UI Framework & Libraries
- **React** (v18.2 or higher) - UI framework
- **TypeScript** (v5.3 or higher) - Type-safe development
- **Tailwind CSS** (v3.4 or higher) - Utility-first styling
- **Framer Motion** (v11.0 or higher) - Advanced animations
- **React Beautiful DnD** or **dnd-kit** - Drag and drop functionality
- **Lucide React** - Icon library

#### State Management
- **Zustand** (v4.5 or higher) - Lightweight state management
- **React Query** (TanStack Query v5.0+) - Async state management

#### Data Visualization
- **Recharts** (v2.10 or higher) - Chart library
- **date-fns** (v3.0 or higher) - Date manipulation

### 2.3 Backend/Main Process

#### Core Libraries
- **electron-store** - Persistent data storage
- **axios** - HTTP client for API calls
- **electron-updater** - Auto-update functionality
- **electron-log** - Logging framework

#### Data Management
- **lowdb** or **better-sqlite3** - Local database (optional)
- **fs-extra** - Enhanced file system operations
- **uuid** - Unique ID generation

### 2.4 Development Tools
- **Vite** (v5.0 or higher) - Fast build tool
- **Electron Builder** - Packaging and distribution
- **ESLint** + **Prettier** - Code quality
- **Vitest** - Unit testing
- **Playwright** - E2E testing

---

## 3. Application Architecture

### 3.1 Architecture Pattern
**Multi-Process Architecture** following Electron's best practices:

```
TaskManager/
├── electron/
│   ├── main/
│   │   ├── index.ts              # Main process entry point
│   │   ├── window.ts             # Window management
│   │   ├── ipc-handlers.ts       # IPC communication handlers
│   │   └── services/
│   │       ├── dataService.ts
│   │       ├── holidayService.ts
│   │       ├── exportImportService.ts
│   │       └── fileSystemService.ts
│   └── preload/
│       └── index.ts              # Preload script (contextBridge)
├── src/
│   ├── components/
│   │   ├── calendar/
│   │   │   ├── Calendar.tsx
│   │   │   ├── CalendarDay.tsx
│   │   │   └── CalendarHeader.tsx
│   │   ├── board/
│   │   │   ├── Board.tsx
│   │   │   ├── Column.tsx
│   │   │   ├── Card.tsx
│   │   │   └── CardModal.tsx
│   │   ├── dashboard/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── StatsCard.tsx
│   │   │   └── Charts/
│   │   │       ├── TaskCompletionChart.tsx
│   │   │       ├── TimeSpentChart.tsx
│   │   │       └── TagDistributionChart.tsx
│   │   ├── settings/
│   │   │   ├── Settings.tsx
│   │   │   ├── WorkDaysSettings.tsx
│   │   │   ├── TemplateSettings.tsx
│   │   │   └── ThemeSettings.tsx
│   │   ├── onboarding/
│   │   │   └── Onboarding.tsx
│   │   └── shared/
│   │       ├── Button.tsx
│   │       ├── Modal.tsx
│   │       ├── Input.tsx
│   │       └── Select.tsx
│   ├── hooks/
│   │   ├── useCards.ts
│   │   ├── useColumns.ts
│   │   ├── useTimeTracking.ts
│   │   ├── useHolidays.ts
│   │   └── useSettings.ts
│   ├── stores/
│   │   ├── boardStore.ts
│   │   ├── calendarStore.ts
│   │   ├── settingsStore.ts
│   │   └── dashboardStore.ts
│   ├── types/
│   │   ├── card.ts
│   │   ├── column.ts
│   │   ├── settings.ts
│   │   └── holiday.ts
│   ├── utils/
│   │   ├── dateHelpers.ts
│   │   ├── timeTracking.ts
│   │   ├── validators.ts
│   │   └── formatters.ts
│   ├── services/
│   │   ├── ipcService.ts        # IPC abstraction layer
│   │   └── animationService.ts
│   ├── styles/
│   │   ├── globals.css
│   │   └── themes.css
│   ├── locales/
│   │   ├── en.json
│   │   ├── es.json
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── public/
│   └── icons/
│       ├── icon.png
│       ├── icon.icns            # macOS icon
│       └── icon.ico             # Windows icon
├── resources/                   # Build resources
│   ├── entitlements.mac.plist
│   └── installer-icon.png
├── package.json
├── electron-builder.config.js
├── vite.config.ts
├── tsconfig.json
└── README.md
```

### 3.2 Process Communication

#### Main Process → Renderer Process
- Window management
- File system operations
- Native dialogs
- System tray integration
- Auto-updates

#### Renderer Process → Main Process (via IPC)
- Data persistence requests
- Export/import operations
- Holiday API calls
- File system operations

#### Security Model
- **contextIsolation:** enabled
- **nodeIntegration:** disabled
- **contextBridge API** for safe IPC communication

```typescript
// electron/preload/index.ts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // Data operations
  saveData: (key: string, data: any) => ipcRenderer.invoke('save-data', key, data),
  loadData: (key: string) => ipcRenderer.invoke('load-data', key),
  
  // File operations
  exportData: (data: any) => ipcRenderer.invoke('export-data', data),
  importData: () => ipcRenderer.invoke('import-data'),
  
  // Holiday API
  fetchHolidays: (params: any) => ipcRenderer.invoke('fetch-holidays', params),
  
  // System operations
  showSaveDialog: (options: any) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options: any) => ipcRenderer.invoke('show-open-dialog', options),
});
```

### 3.3 Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      Renderer Process                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  React Components (UI)                               │   │
│  │    ↕                                                  │   │
│  │  Zustand Stores (State Management)                   │   │
│  │    ↕                                                  │   │
│  │  Custom Hooks (Business Logic)                       │   │
│  │    ↕                                                  │   │
│  │  IPC Service (Communication Layer)                   │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────┘
                            │ IPC (contextBridge)
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                       Main Process                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  IPC Handlers                                        │   │
│  │    ↕                                                  │   │
│  │  Services (Data, Holiday, Export/Import)            │   │
│  │    ↕                                                  │   │
│  │  File System / electron-store / External APIs       │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Core Features Specification

### 4.1 Calendar View

#### 4.1.1 Functionality
- Display monthly calendar grid showing current month
- Highlight current day with distinct visual indicator
- Mark holidays with visual indicators (e.g., different background color)
- Mark work days vs. non-work days based on user settings
- Click on any day to navigate to that day's board view

#### 4.1.2 Technical Implementation
- **Component:** Custom React calendar component
- **State Management:** Zustand store for calendar state
- **Styling:** Tailwind CSS with CSS Grid
- **Animation:** Framer Motion for transitions

```typescript
// src/types/calendar.ts
export interface CalendarDay {
  date: Date;
  isToday: boolean;
  isWorkDay: boolean;
  isHoliday: boolean;
  holidayName?: string;
  taskCount: number;
  completedCount: number;
}

// src/stores/calendarStore.ts
interface CalendarStore {
  currentMonth: Date;
  selectedDate: Date;
  days: CalendarDay[];
  setCurrentMonth: (date: Date) => void;
  setSelectedDate: (date: Date) => void;
  navigateToDay: (date: Date) => void;
}
```

#### 4.1.3 UI Component Structure

```tsx
// src/components/calendar/Calendar.tsx
import { motion } from 'framer-motion';

export const Calendar: React.FC = () => {
  const { currentMonth, days, setSelectedDate } = useCalendarStore();
  
  return (
    <div className="p-6">
      <CalendarHeader month={currentMonth} />
      <div className="grid grid-cols-7 gap-2 mt-4">
        {days.map((day) => (
          <CalendarDay
            key={day.date.toISOString()}
            day={day}
            onClick={() => setSelectedDate(day.date)}
          />
        ))}
      </div>
    </div>
  );
};
```

### 4.2 Board View (Kanban)

#### 4.2.1 Default Columns (Static)
These columns cannot be deleted and serve as the foundation for time tracking:

1. **TODO** - Initial state for new tasks
2. **Doing** - Tasks currently being worked on
3. **Done** - Completed tasks

#### 4.2.2 Custom Columns
- Users can create unlimited custom columns
- Custom columns can be:
  - Created (via "Add Column" button)
  - Renamed
  - Reordered (drag to reposition)
  - Deleted (with data migration handling)
- Position: Custom columns can be inserted anywhere in the workflow

#### 4.2.3 Data Migration for Deleted Columns
When a custom column is deleted:
1. Display confirmation dialog showing number of cards affected
2. Provide options:
   - Move all cards to TODO column
   - Move all cards to a selected existing column
   - Delete all cards in the column (with additional confirmation)
3. Log the migration in the card's history for audit purposes

#### 4.2.4 Column Structure

```typescript
// src/types/column.ts
export interface Column {
  id: string;
  name: string;
  position: number;
  isStatic: boolean;
  cards: Card[];
  color?: string;
}

// src/stores/boardStore.ts
interface BoardStore {
  columns: Column[];
  selectedDate: Date;
  addColumn: (name: string, position?: number) => void;
  updateColumn: (id: string, updates: Partial<Column>) => void;
  deleteColumn: (id: string, migrationOption: MigrationOption) => void;
  reorderColumns: (sourceIndex: number, destinationIndex: number) => void;
}
```

#### 4.2.5 Drag and Drop Implementation

```tsx
// src/components/board/Board.tsx
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';

export const Board: React.FC = () => {
  const { columns, moveCard, reorderColumns } = useBoardStore();
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    // Handle card movement
    if (active.data.current?.type === 'card') {
      moveCard(active.id, over.id);
    }
    
    // Handle column reordering
    if (active.data.current?.type === 'column') {
      reorderColumns(active.id, over.id);
    }
  };
  
  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 p-6 overflow-x-auto">
        <SortableContext
          items={columns}
          strategy={horizontalListSortingStrategy}
        >
          {columns.map((column) => (
            <Column key={column.id} column={column} />
          ))}
        </SortableContext>
      </div>
    </DndContext>
  );
};
```

### 4.3 Card Management

#### 4.3.1 Card Data Model

```typescript
// src/types/card.ts
export interface Card {
  id: string;
  title: string;
  description: string;
  createdDate: Date;
  columnId: string;
  templateId?: string;
  tags: string[];
  checklist: ChecklistItem[];
  movementHistory: CardMovement[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  isCompleted: boolean;
  createdAt: Date;
}

export interface CardMovement {
  id: string;
  fromColumnId: string;
  toColumnId: string;
  timestamp: Date;
}

export interface CardTemplate {
  id: string;
  name: string;
  prefix: string;
  color: string;
  defaultTags: string[];
}
```

#### 4.3.2 Card Component

```tsx
// src/components/board/Card.tsx
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';

interface CardProps {
  card: Card;
  template?: CardTemplate;
}

export const Card: React.FC<CardProps> = ({ card, template }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  const completedItems = card.checklist.filter(item => item.isCompleted).length;
  const totalItems = card.checklist.length;
  
  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        bg-white rounded-lg p-4 shadow-sm hover:shadow-md
        transition-shadow cursor-grab active:cursor-grabbing
        ${isDragging ? 'opacity-50' : 'opacity-100'}
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start justify-between mb-2">
        <h3
          className="font-medium text-sm"
          style={{ color: template?.color }}
        >
          {template?.prefix}{card.title}
        </h3>
        <CardMenu card={card} />
      </div>
      
      {card.description && (
        <p className="text-xs text-gray-600 mb-2">
          {card.description}
        </p>
      )}
      
      {card.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {card.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-gray-100 rounded text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      
      {totalItems > 0 && (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <CheckSquare size={14} />
          <span>{completedItems}/{totalItems}</span>
        </div>
      )}
    </motion.div>
  );
};
```

#### 4.3.3 Card Actions & Features

**Template System:**
```typescript
// src/hooks/useCardTemplate.ts
export const useCardTemplate = () => {
  const { templates } = useSettingsStore();
  
  const applyTemplate = (card: Partial<Card>, templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return card;
    
    return {
      ...card,
      templateId,
      title: template.prefix + (card.title || ''),
      tags: [...(card.tags || []), ...template.defaultTags],
    };
  };
  
  return { applyTemplate };
};
```

**Completion Animation:**
```tsx
// src/components/board/CompletionAnimation.tsx
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export const CompletionAnimation: React.FC<{ show: boolean }> = ({ show }) => {
  useEffect(() => {
    if (show) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [show]);
  
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="fixed inset-0 pointer-events-none flex items-center justify-center"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 360],
            }}
            transition={{ duration: 0.5 }}
            className="text-6xl"
          >
            ✨
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
```

### 4.4 Time Tracking System

#### 4.4.1 Automatic Tracking

```typescript
// src/utils/timeTracking.ts
export class TimeTracker {
  /**
   * Calculate time spent in a specific column
   */
  static getTimeInColumn(card: Card, columnId: string): number {
    const movements = card.movementHistory
      .filter(m => m.fromColumnId === columnId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    let totalTime = 0;
    
    for (let i = 0; i < movements.length; i++) {
      const entryTime = movements[i].timestamp;
      const exitTime = i < movements.length - 1
        ? movements[i + 1].timestamp
        : new Date();
      
      totalTime += exitTime.getTime() - entryTime.getTime();
    }
    
    return totalTime;
  }
  
  /**
   * Calculate total time from creation to completion
   */
  static getTotalTimeToCompletion(card: Card): number | null {
    const completionMovement = card.movementHistory.find(
      m => m.toColumnId === 'done'
    );
    
    if (!completionMovement) return null;
    
    return completionMovement.timestamp.getTime() - card.createdDate.getTime();
  }
  
  /**
   * Get time breakdown by column
   */
  static getTimeBreakdown(card: Card, columns: Column[]): TimeBreakdown[] {
    return columns.map(column => ({
      columnName: column.name,
      timeSpent: this.getTimeInColumn(card, column.id),
      percentage: this.getPercentageInColumn(card, column.id),
    }));
  }
  
  private static getPercentageInColumn(card: Card, columnId: string): number {
    const totalTime = this.getTotalTimeToCompletion(card) || 0;
    const columnTime = this.getTimeInColumn(card, columnId);
    
    return totalTime > 0 ? (columnTime / totalTime) * 100 : 0;
  }
}

export interface TimeBreakdown {
  columnName: string;
  timeSpent: number;
  percentage: number;
}
```

#### 4.4.2 Time Tracking Hooks

```typescript
// src/hooks/useTimeTracking.ts
export const useTimeTracking = (cardId: string) => {
  const { cards, columns } = useBoardStore();
  const card = cards.find(c => c.id === cardId);
  
  if (!card) return null;
  
  const timeInCurrentColumn = useMemo(() => {
    return TimeTracker.getTimeInColumn(card, card.columnId);
  }, [card]);
  
  const totalTime = useMemo(() => {
    return TimeTracker.getTotalTimeToCompletion(card);
  }, [card]);
  
  const breakdown = useMemo(() => {
    return TimeTracker.getTimeBreakdown(card, columns);
  }, [card, columns]);
  
  return {
    timeInCurrentColumn,
    totalTime,
    breakdown,
  };
};
```

### 4.5 Dashboard & Analytics

#### 4.5.1 Dashboard Component Structure

```tsx
// src/components/dashboard/Dashboard.tsx
export const Dashboard: React.FC = () => {
  const { dateRange, setDateRange } = useDashboardStore();
  const stats = useStats(dateRange);
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Tasks"
          value={stats.totalTasks}
          icon={<ListTodo />}
        />
        <StatsCard
          title="Completed"
          value={stats.completedTasks}
          icon={<CheckCircle />}
          trend={stats.completionTrend}
        />
        <StatsCard
          title="In Progress"
          value={stats.inProgressTasks}
          icon={<Clock />}
        />
        <StatsCard
          title="Avg. Completion Time"
          value={formatDuration(stats.avgCompletionTime)}
          icon={<Timer />}
        />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tasks Completed Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <TaskCompletionChart data={stats.completionData} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Time Spent by Column</CardTitle>
          </CardHeader>
          <CardContent>
            <TimeSpentChart data={stats.timeByColumn} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Tag Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <TagDistributionChart data={stats.tagDistribution} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Productivity Heatmap</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductivityHeatmap data={stats.dailyCompletion} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
```

#### 4.5.2 Chart Implementations

```tsx
// src/components/dashboard/Charts/TaskCompletionChart.tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const TaskCompletionChart: React.FC<{ data: ChartData[] }> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="completed"
          stroke="#10b981"
          strokeWidth={2}
          dot={{ fill: '#10b981' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
```

### 4.6 Settings & Configuration

#### 4.6.1 Settings Component

```tsx
// src/components/settings/Settings.tsx
export const Settings: React.FC = () => {
  const { settings, updateSettings } = useSettingsStore();
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="workdays">Work Days</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="holidays">Holidays</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="data">Data Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <GeneralSettings />
        </TabsContent>
        
        <TabsContent value="workdays">
          <WorkDaysSettings />
        </TabsContent>
        
        <TabsContent value="templates">
          <TemplateSettings />
        </TabsContent>
        
        <TabsContent value="holidays">
          <HolidaySettings />
        </TabsContent>
        
        <TabsContent value="appearance">
          <AppearanceSettings />
        </TabsContent>
        
        <TabsContent value="data">
          <DataManagementSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};
```

---

## 5. Data Management

### 5.1 Storage Architecture

#### 5.1.1 Electron Store Configuration

```typescript
// electron/main/services/dataService.ts
import Store from 'electron-store';

interface DataSchema {
  boards: Record<string, BoardData>;
  settings: AppSettings;
  templates: CardTemplate[];
  tags: string[];
}

export class DataService {
  private store: Store<DataSchema>;
  
  constructor() {
    this.store = new Store<DataSchema>({
      name: 'task-manager-data',
      defaults: {
        boards: {},
        settings: this.getDefaultSettings(),
        templates: this.getDefaultTemplates(),
        tags: [],
      },
      encryptionKey: 'your-encryption-key', // Optional encryption
    });
  }
  
  // Board data operations
  async getBoard(date: string): Promise<BoardData | null> {
    const boards = this.store.get('boards');
    return boards[date] || null;
  }
  
  async saveBoard(date: string, board: BoardData): Promise<void> {
    const boards = this.store.get('boards');
    boards[date] = board;
    this.store.set('boards', boards);
  }
  
  // Settings operations
  async getSettings(): Promise<AppSettings> {
    return this.store.get('settings');
  }
  
  async updateSettings(settings: Partial<AppSettings>): Promise<void> {
    const current = this.store.get('settings');
    this.store.set('settings', { ...current, ...settings });
  }
  
  // Template operations
  async getTemplates(): Promise<CardTemplate[]> {
    return this.store.get('templates');
  }
  
  async saveTemplates(templates: CardTemplate[]): Promise<void> {
    this.store.set('templates', templates);
  }
}
```

### 5.2 Data Models

#### 5.2.1 Board Data Structure

```typescript
// src/types/board.ts
export interface BoardData {
  date: string; // YYYY-MM-DD format
  columns: Column[];
  metadata: {
    lastModified: Date;
    version: string;
  };
}
```

#### 5.2.2 Settings Structure

```typescript
// src/types/settings.ts
export interface AppSettings {
  general: {
    language: string;
    firstDayOfWeek: 0 | 1; // 0 = Sunday, 1 = Monday
    dateFormat: string;
    timeFormat: '12h' | '24h';
  };
  workDays: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  holidays: {
    country: string;
    subdivision?: string;
    autoFetch: boolean;
    customHolidays: CustomHoliday[];
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    accentColor: string;
    enableAnimations: boolean;
    enableSounds: boolean;
  };
  notifications: {
    enabled: boolean;
    taskReminders: boolean;
    dailySummary: boolean;
  };
}

export interface CustomHoliday {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  recurring: boolean;
}
```

### 5.3 Export & Import

#### 5.3.1 Export Service

```typescript
// electron/main/services/exportImportService.ts
import { dialog, app } from 'electron';
import fs from 'fs-extra';
import path from 'path';

export class ExportImportService {
  async exportData(data: any): Promise<{ success: boolean; path?: string }> {
    try {
      const { filePath } = await dialog.showSaveDialog({
        title: 'Export Task Manager Data',
        defaultPath: path.join(
          app.getPath('documents'),
          `taskmanager-backup-${new Date().toISOString().split('T')[0]}.json`
        ),
        filters: [
          { name: 'JSON Files', extensions: ['json'] },
          { name: 'All Files', extensions: ['*'] },
        ],
      });
      
      if (!filePath) {
        return { success: false };
      }
      
      const exportData = {
        version: '2.0',
        exportDate: new Date().toISOString(),
        data,
      };
      
      await fs.writeJson(filePath, exportData, { spaces: 2 });
      
      return { success: true, path: filePath };
    } catch (error) {
      console.error('Export error:', error);
      return { success: false };
    }
  }
  
  async importData(): Promise<{ success: boolean; data?: any }> {
    try {
      const { filePaths } = await dialog.showOpenDialog({
        title: 'Import Task Manager Data',
        filters: [
          { name: 'JSON Files', extensions: ['json'] },
          { name: 'All Files', extensions: ['*'] },
        ],
        properties: ['openFile'],
      });
      
      if (!filePaths || filePaths.length === 0) {
        return { success: false };
      }
      
      const fileContent = await fs.readJson(filePaths[0]);
      
      // Validate imported data structure
      if (!this.validateImportData(fileContent)) {
        throw new Error('Invalid data format');
      }
      
      return { success: true, data: fileContent.data };
    } catch (error) {
      console.error('Import error:', error);
      return { success: false };
    }
  }
  
  private validateImportData(data: any): boolean {
    return (
      data &&
      data.version &&
      data.data &&
      typeof data.data === 'object'
    );
  }
}
```

---

## 6. Holiday Integration

### 6.1 Holiday Service

```typescript
// electron/main/services/holidayService.ts
import axios from 'axios';

interface HolidayAPIResponse {
  id: string;
  startDate: string;
  endDate: string;
  type: string;
  name: Array<{ language: string; text: string }>;
  nationwide: boolean;
}

export class HolidayService {
  private baseURL = 'https://openholidaysapi.org';
  
  async fetchHolidays(params: {
    countryCode: string;
    year: number;
    languageCode?: string;
  }): Promise<Holiday[]> {
    try {
      const startDate = `${params.year}-01-01`;
      const endDate = `${params.year}-12-31`;
      
      const response = await axios.get<HolidayAPIResponse[]>(
        `${this.baseURL}/PublicHolidays`,
        {
          params: {
            countryIsoCode: params.countryCode,
            languageIsoCode: params.languageCode || 'EN',
            validFrom: startDate,
            validTo: endDate,
          },
          headers: {
            'Accept': 'application/json',
          },
        }
      );
      
      return response.data.map(holiday => ({
        id: holiday.id,
        name: holiday.name.find(n => n.language === (params.languageCode || 'EN'))?.text || holiday.name[0].text,
        date: holiday.startDate,
        isRecurring: false,
        source: 'api',
      }));
    } catch (error) {
      console.error('Error fetching holidays:', error);
      throw error;
    }
  }
  
  async fetchCountries(): Promise<Country[]> {
    try {
      const response = await axios.get(`${this.baseURL}/Countries`, {
        headers: { 'Accept': 'application/json' },
      });
      
      return response.data.map((country: any) => ({
        code: country.isoCode,
        name: country.name.find((n: any) => n.language === 'EN')?.text || country.name[0].text,
        languages: country.officialLanguages,
      }));
    } catch (error) {
      console.error('Error fetching countries:', error);
      throw error;
    }
  }
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  isRecurring: boolean;
  source: 'api' | 'custom';
}

export interface Country {
  code: string;
  name: string;
  languages: string[];
}
```

### 6.2 Holiday Integration in UI

```tsx
// src/hooks/useHolidays.ts
export const useHolidays = () => {
  const { settings, updateSettings } = useSettingsStore();
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const fetchHolidays = async (year: number) => {
    if (!settings.holidays.autoFetch) return;
    
    setIsLoading(true);
    try {
      const apiHolidays = await window.electronAPI.fetchHolidays({
        countryCode: settings.holidays.country,
        year,
      });
      
      const allHolidays = [
        ...apiHolidays,
        ...settings.holidays.customHolidays.map(h => ({
          ...h,
          source: 'custom' as const,
        })),
      ];
      
      setHolidays(allHolidays);
    } catch (error) {
      console.error('Failed to fetch holidays:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const addCustomHoliday = async (holiday: Omit<CustomHoliday, 'id'>) => {
    const newHoliday: CustomHoliday = {
      ...holiday,
      id: crypto.randomUUID(),
    };
    
    await updateSettings({
      holidays: {
        ...settings.holidays,
        customHolidays: [...settings.holidays.customHolidays, newHoliday],
      },
    });
    
    setHolidays(prev => [...prev, { ...newHoliday, source: 'custom' }]);
  };
  
  const isHoliday = (date: Date): Holiday | null => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return holidays.find(h => h.date === dateStr) || null;
  };
  
  return {
    holidays,
    isLoading,
    fetchHolidays,
    addCustomHoliday,
    isHoliday,
  };
};
```

---

## 7. Internationalization (i18n)

### 7.1 Setup

```typescript
// src/locales/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import es from './es.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
```

### 7.2 Language Files

```json
// src/locales/en.json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "confirm": "Confirm",
    "close": "Close"
  },
  "calendar": {
    "title": "Calendar",
    "today": "Today",
    "month": "Month",
    "year": "Year"
  },
  "board": {
    "title": "Board",
    "addColumn": "Add Column",
    "addCard": "Add Card",
    "deleteColumn": "Delete Column",
    "deleteColumnConfirm": "Are you sure you want to delete this column? {{count}} cards will be affected."
  },
  "card": {
    "title": "Title",
    "description": "Description",
    "tags": "Tags",
    "checklist": "Checklist",
    "createdAt": "Created at",
    "completedAt": "Completed at",
    "moveToNextDay": "Move to next work day",
    "duplicate": "Duplicate",
    "delete": "Delete",
    "nerdStats": "Nerd Stats"
  },
  "dashboard": {
    "title": "Dashboard",
    "totalTasks": "Total Tasks",
    "completedTasks": "Completed Tasks",
    "inProgress": "In Progress",
    "avgCompletionTime": "Avg. Completion Time",
    "tasksOverTime": "Tasks Completed Over Time",
    "timeByColumn": "Time Spent by Column",
    "tagDistribution": "Tag Distribution"
  },
  "settings": {
    "title": "Settings",
    "general": "General",
    "workDays": "Work Days",
    "templates": "Templates",
    "holidays": "Holidays",
    "appearance": "Appearance",
    "dataManagement": "Data Management"
  }
}
```

---

## 8. Electron Configuration

### 8.1 Main Process Setup

```typescript
// electron/main/index.ts
import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { DataService } from './services/dataService';
import { HolidayService } from './services/holidayService';
import { ExportImportService } from './services/exportImportService';

let mainWindow: BrowserWindow | null = null;
const dataService = new DataService();
const holidayService = new HolidayService();
const exportImportService = new ExportImportService();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'hiddenInset', // macOS style
    frame: true,
  });
  
  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
  }
  
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  setupIpcHandlers();
  createWindow();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

function setupIpcHandlers() {
  // Data operations
  ipcMain.handle('load-data', async (_, key: string) => {
    return await dataService.getBoard(key);
  });
  
  ipcMain.handle('save-data', async (_, key: string, data: any) => {
    return await dataService.saveBoard(key, data);
  });
  
  // Settings
  ipcMain.handle('get-settings', async () => {
    return await dataService.getSettings();
  });
  
  ipcMain.handle('update-settings', async (_, settings: any) => {
    return await dataService.updateSettings(settings);
  });
  
  // Holiday API
  ipcMain.handle('fetch-holidays', async (_, params: any) => {
    return await holidayService.fetchHolidays(params);
  });
  
  ipcMain.handle('fetch-countries', async () => {
    return await holidayService.fetchCountries();
  });
  
  // Export/Import
  ipcMain.handle('export-data', async (_, data: any) => {
    return await exportImportService.exportData(data);
  });
  
  ipcMain.handle('import-data', async () => {
    return await exportImportService.importData();
  });
}
```

### 8.2 Preload Script

```typescript
// electron/preload/index.ts
import { contextBridge, ipcRenderer } from 'electron';

export interface ElectronAPI {
  // Data operations
  loadData: (key: string) => Promise<any>;
  saveData: (key: string, data: any) => Promise<void>;
  
  // Settings
  getSettings: () => Promise<any>;
  updateSettings: (settings: any) => Promise<void>;
  
  // Holidays
  fetchHolidays: (params: any) => Promise<any>;
  fetchCountries: () => Promise<any>;
  
  // Export/Import
  exportData: (data: any) => Promise<{ success: boolean; path?: string }>;
  importData: () => Promise<{ success: boolean; data?: any }>;
}

const electronAPI: ElectronAPI = {
  loadData: (key: string) => ipcRenderer.invoke('load-data', key),
  saveData: (key: string, data: any) => ipcRenderer.invoke('save-data', key, data),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  updateSettings: (settings: any) => ipcRenderer.invoke('update-settings', settings),
  fetchHolidays: (params: any) => ipcRenderer.invoke('fetch-holidays', params),
  fetchCountries: () => ipcRenderer.invoke('fetch-countries'),
  exportData: (data: any) => ipcRenderer.invoke('export-data', data),
  importData: () => ipcRenderer.invoke('import-data'),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// Type declaration for window object
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
```

---

## 9. Build & Packaging

### 9.1 Electron Builder Configuration

```javascript
// electron-builder.config.js
module.exports = {
  appId: 'com.taskmanager.app',
  productName: 'Task Manager',
  directories: {
    output: 'release',
    buildResources: 'resources',
  },
  files: [
    'dist/**/*',
    'electron/main/**/*',
    'electron/preload/**/*',
    'package.json',
  ],
  mac: {
    target: [
      {
        target: 'dmg',
        arch: ['x64', 'arm64'],
      },
      {
        target: 'zip',
        arch: ['x64', 'arm64'],
      },
    ],
    category: 'public.app-category.productivity',
    icon: 'public/icons/icon.icns',
    hardenedRuntime: true,
    gatekeeperAssess: false,
    entitlements: 'resources/entitlements.mac.plist',
    entitlementsInherit: 'resources/entitlements.mac.plist',
  },
  dmg: {
    contents: [
      {
        x: 130,
        y: 220,
      },
      {
        x: 410,
        y: 220,
        type: 'link',
        path: '/Applications',
      },
    ],
    window: {
      width: 540,
      height: 380,
    },
  },
  win: {
    target: [
      {
        target: 'nsis',
        arch: ['x64', 'arm64'],
      },
      {
        target: 'portable',
        arch: ['x64'],
      },
    ],
    icon: 'public/icons/icon.ico',
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
  },
  linux: {
    target: ['AppImage', 'deb'],
    category: 'Office',
    icon: 'public/icons/icon.png',
  },
};
```

### 9.2 Package.json Scripts

```json
{
  "name": "task-manager",
  "version": "2.0.0",
  "description": "A cross-platform task management application",
  "main": "electron/main/index.js",
  "scripts": {
    "dev": "vite",
    "dev:electron": "concurrently \"npm run dev\" \"wait-on http://localhost:5173 && electron .\"",
    "build": "tsc && vite build",
    "build:electron": "npm run build && electron-builder",
    "build:mac": "npm run build && electron-builder --mac",
    "build:win": "npm run build && electron-builder --win",
    "build:linux": "npm run build && electron-builder --linux",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview",
    "test": "vitest",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "axios": "^1.6.5",
    "canvas-confetti": "^1.9.2",
    "date-fns": "^3.3.0",
    "electron-log": "^5.0.3",
    "electron-store": "^8.1.0",
    "electron-updater": "^6.1.7",
    "framer-motion": "^11.0.3",
    "fs-extra": "^11.2.0",
    "i18next": "^23.7.16",
    "lucide-react": "^0.312.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-i18next": "^14.0.1",
    "recharts": "^2.10.4",
    "uuid": "^9.0.1",
    "zustand": "^4.5.0"
  },
  "devDependencies": {
    "@types/canvas-confetti": "^1.6.4",
    "@types/node": "^20.11.5",
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "@types/uuid": "^9.0.7",
    "@typescript-eslint/eslint-plugin": "^6.19.0",
    "@typescript-eslint/parser": "^6.19.0",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.17",
    "concurrently": "^8.2.2",
    "electron": "^29.0.0",
    "electron-builder": "^24.9.1",
    "eslint": "^8.56.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "playwright": "^1.41.1",
    "postcss": "^8.4.33",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.11",
    "vite-plugin-electron": "^0.28.2",
    "vitest": "^1.2.1",
    "wait-on": "^7.2.0"
  }
}
```

### 9.3 Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
  },
});
```

---

## 10. Testing Strategy

### 10.1 Unit Testing

```typescript
// src/__tests__/timeTracking.test.ts
import { describe, it, expect } from 'vitest';
import { TimeTracker } from '../utils/timeTracking';

describe('TimeTracker', () => {
  it('should calculate time in column correctly', () => {
    const card: Card = {
      id: '1',
      title: 'Test Card',
      description: '',
      createdDate: new Date('2026-01-01T09:00:00'),
      columnId: 'doing',
      tags: [],
      checklist: [],
      movementHistory: [
        {
          id: '1',
          fromColumnId: 'todo',
          toColumnId: 'doing',
          timestamp: new Date('2026-01-01T10:00:00'),
        },
        {
          id: '2',
          fromColumnId: 'doing',
          toColumnId: 'done',
          timestamp: new Date('2026-01-01T12:00:00'),
        },
      ],
    };
    
    const timeInDoing = TimeTracker.getTimeInColumn(card, 'doing');
    
    // Should be 2 hours (7200000 milliseconds)
    expect(timeInDoing).toBe(2 * 60 * 60 * 1000);
  });
  
  it('should calculate total time to completion', () => {
    const card: Card = {
      id: '1',
      title: 'Test Card',
      description: '',
      createdDate: new Date('2026-01-01T09:00:00'),
      columnId: 'done',
      tags: [],
      checklist: [],
      movementHistory: [
        {
          id: '1',
          fromColumnId: 'todo',
          toColumnId: 'doing',
          timestamp: new Date('2026-01-01T10:00:00'),
        },
        {
          id: '2',
          fromColumnId: 'doing',
          toColumnId: 'done',
          timestamp: new Date('2026-01-01T15:00:00'),
        },
      ],
    };
    
    const totalTime = TimeTracker.getTotalTimeToCompletion(card);
    
    // Should be 6 hours from creation to completion
    expect(totalTime).toBe(6 * 60 * 60 * 1000);
  });
});
```

### 10.2 E2E Testing

```typescript
// e2e/calendar.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Calendar Navigation', () => {
  test('should navigate to board view when clicking on a day', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Wait for calendar to load
    await page.waitForSelector('[data-testid="calendar-grid"]');
    
    // Click on a specific day
    await page.click('[data-testid="calendar-day-15"]');
    
    // Should navigate to board view
    await expect(page).toHaveURL(/.*board/);
    
    // Should show the correct date in board header
    await expect(page.locator('[data-testid="board-date"]')).toContainText('January 15');
  });
  
  test('should highlight current day', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    const today = new Date().getDate();
    const todayCell = page.locator(`[data-testid="calendar-day-${today}"]`);
    
    await expect(todayCell).toHaveClass(/bg-blue-500/);
  });
});
```

---

## 11. Security Considerations

### 11.1 Context Isolation

The application uses Electron's context isolation to prevent the renderer process from directly accessing Node.js APIs:

- `contextIsolation: true`
- `nodeIntegration: false`
- All IPC communication goes through the preload script's `contextBridge`

### 11.2 Input Validation

```typescript
// src/utils/validators.ts
export class InputValidator {
  static sanitizeUrl(url: string): string {
    if (!url || typeof url !== 'string') return '';
    
    // Only allow http and https protocols
    const trimmed = url.trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return '';
    }
    
    try {
      new URL(trimmed); // Validate URL format
      return trimmed;
    } catch {
      return '';
    }
  }
  
  static sanitizePrefix(prefix: string): string {
    if (!prefix || typeof prefix !== 'string') return '';
    
    let sanitized = prefix.trim();
    
    // Limit length
    if (sanitized.length > 20) {
      sanitized = sanitized.substring(0, 20);
    }
    
    // Remove potentially problematic characters
    sanitized = sanitized.replace(/[<>\"']/g, '');
    
    return sanitized;
  }
  
  static sanitizeText(text: string, maxLength: number = 1000): string {
    if (!text || typeof text !== 'string') return '';
    
    let sanitized = text.trim();
    
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }
    
    return sanitized;
  }
}
```

### 11.3 CSP (Content Security Policy)

```html
<!-- dist/index.html -->
<meta
  http-equiv="Content-Security-Policy"
  content="
    default-src 'self';
    script-src 'self' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    connect-src 'self' https://openholidaysapi.org;
    font-src 'self' data:;
  "
/>
```

---

## 12. Performance Optimization

### 12.1 Code Splitting

```typescript
// src/App.tsx
import { lazy, Suspense } from 'react';

const Calendar = lazy(() => import('./components/calendar/Calendar'));
const Board = lazy(() => import('./components/board/Board'));
const Dashboard = lazy(() => import('./components/dashboard/Dashboard'));
const Settings = lazy(() => import('./components/settings/Settings'));

export const App = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Router>
        <Route path="/calendar" component={Calendar} />
        <Route path="/board" component={Board} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/settings" component={Settings} />
      </Router>
    </Suspense>
  );
};
```

### 12.2 Memoization

```typescript
// src/hooks/useCards.ts
import { useMemo } from 'react';

export const useCardsByColumn = (columnId: string) => {
  const { cards } = useBoardStore();
  
  const filteredCards = useMemo(() => {
    return cards.filter(card => card.columnId === columnId);
  }, [cards, columnId]);
  
  return filteredCards;
};
```

### 12.3 Virtual Scrolling for Large Lists

```tsx
// src/components/board/VirtualColumn.tsx
import { useVirtualizer } from '@tanstack/react-virtual';

export const VirtualColumn: React.FC<{ cards: Card[] }> = ({ cards }) => {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const rowVirtualizer = useVirtualizer({
    count: cards.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120,
    overscan: 5,
  });
  
  return (
    <div ref={parentRef} className="h-full overflow-auto">
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <Card card={cards[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## 13. Future Enhancements (Not in v2.0)

### 13.1 Potential Features
- Cloud sync (optional, using Electron's net module)
- Team collaboration features
- Mobile companion app (React Native with shared business logic)
- Calendar integration (Google Calendar, Outlook via OAuth)
- Pomodoro timer integration
- Recurring tasks
- Task dependencies
- Subtasks
- File attachments (using Electron's file system APIs)
- Voice notes (using Web Audio API)
- AI-powered task suggestions (local LLM or API integration)
- Customizable keyboard shortcuts (using Electron's globalShortcut)
- Plugin/extension system (dynamic module loading)

### 13.2 Technical Improvements
- Migrate to better-sqlite3 for improved query performance
- Implement offline-first architecture with sync queue
- Add automated backup system with configurable schedules
- Implement undo/redo functionality using command pattern
- Add comprehensive accessibility features (ARIA labels, keyboard navigation)
- Implement WebGL-based visualizations for large datasets
- Add real-time collaboration using WebSockets

---

## 14. Development Timeline Estimate

### Phase 1: Project Setup & Core Infrastructure (2-3 weeks)
- Electron + Vite + React + TypeScript setup
- Project architecture and folder structure
- Data models and TypeScript types
- IPC communication setup (main ↔ renderer)
- Electron Store integration
- Basic window management

### Phase 2: Calendar & Board View (3-4 weeks)
- Calendar UI implementation with date-fns
- Board view with columns
- Basic card management (CRUD operations)
- Drag and drop with dnd-kit
- State management with Zustand
- Navigation between views

### Phase 3: Advanced Card Features (3-4 weeks)
- Time tracking system
- Template and tag management
- Checklist functionality
- Card movement history
- Holiday API integration
- Work day configuration

### Phase 4: Dashboard & Analytics (2-3 weeks)
- Dashboard UI layout
- Chart implementations with Recharts
- Statistics calculations
- Time range filtering
- Data aggregation and visualization

### Phase 5: Animations & Polish (2 weeks)
- Framer Motion animations
- Drag and drop refinements
- Particle effects (confetti)
- Smooth transitions
- Loading states and skeletons
- UI refinements and responsive design

### Phase 6: Settings & Data Management (2 weeks)
- Settings UI with tabs
- Export/import functionality
- Data validation
- Error handling and user feedback
- Preferences persistence

### Phase 7: Internationalization (1-2 weeks)
- i18next setup
- Resource files (English, Spanish)
- Translation integration in all components
- Language switcher
- Date/time localization

### Phase 8: Build & Packaging (1-2 weeks)
- Electron Builder configuration
- macOS DMG creation and signing
- Windows installer (NSIS)
- Code signing for both platforms
- Auto-update setup
- Icon generation for all platforms

### Phase 9: Testing & Bug Fixes (2-3 weeks)
- Unit testing with Vitest
- E2E testing with Playwright
- Cross-platform testing (macOS, Windows)
- Performance optimization
- Bug fixes and refinements

### Phase 10: Documentation (1 week)
- User documentation
- Developer documentation
- API documentation
- README and contributing guidelines

**Total Estimated Time: 18-24 weeks**

---

## 15. Advantages of Electron.js Over .NET MAUI

### 15.1 Development Experience
- **Web Technologies**: Use familiar HTML, CSS, JavaScript/TypeScript
- **Rich Ecosystem**: Access to npm packages and React ecosystem
- **Hot Reload**: Fast development with Vite's HMR
- **Cross-Platform Dev**: Develop on any OS (macOS, Windows, Linux)
- **DevTools**: Built-in Chrome DevTools for debugging
- **UI Flexibility**: Easier to create custom, pixel-perfect UIs

### 15.2 UI/UX Benefits
- **CSS Power**: Full CSS capabilities (Tailwind, CSS-in-JS, etc.)
- **Animation Libraries**: Framer Motion, GSAP, and other web animation tools
- **Component Libraries**: Access to shadcn/ui, Radix UI, Headless UI
- **Responsive Design**: Native support for responsive layouts
- **Web Standards**: Use modern web APIs and standards

### 15.3 Deployment & Distribution
- **Auto-Updates**: Built-in auto-update functionality
- **Smaller Learning Curve**: Web developers can immediately contribute
- **Better Documentation**: Extensive Electron and React documentation
- **Community**: Large, active community for support
- **Testing Tools**: Playwright, Vitest, and other modern testing tools

### 15.4 Considerations
- **Bundle Size**: Electron apps are larger due to Chromium
- **Memory Usage**: Higher memory footprint than native apps
- **Native Feel**: May require extra effort to match native OS look/feel
- **Performance**: JavaScript execution vs. compiled native code

However, for a task management application with rich UI requirements, animations, and data visualization, Electron.js provides superior development experience and easier UI customization.

---

## 16. Glossary

| Term | Definition |
|------|------------|
| **Board** | The Kanban-style view showing columns and cards for a specific day |
| **Card** | Individual task item that can be moved between columns |
| **Column** | Vertical section on the board representing a task state |
| **Static Column** | TODO, Doing, or Done columns that cannot be deleted |
| **Custom Column** | User-created column that can be modified or deleted |
| **Template** | Predefined card configuration with prefix and styling |
| **Tag** | Label that can be assigned to cards for organization |
| **Work Day** | Day designated as a working day in user's schedule |
| **Holiday** | Non-working day fetched from API or manually added |
| **Movement History** | Record of when a card was moved between columns |
| **Nerd Stats** | Detailed time tracking analytics for a card |
| **Dashboard** | Analytics view showing task statistics and trends |
| **IPC** | Inter-Process Communication between Electron's main and renderer processes |
| **Context Bridge** | Electron's API for safe communication between processes |
| **Preload Script** | Script that runs before the web page is loaded, setting up secure IPC |

---

## 17. References & Resources

### 17.1 Core Technologies
- [Electron.js Documentation](https://www.electronjs.org/docs/latest)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev/)

### 17.2 Libraries & Tools
- [Electron Builder](https://www.electron.build/)
- [electron-store](https://github.com/sindresorhus/electron-store)
- [dnd-kit](https://docs.dndkit.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [Recharts](https://recharts.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [i18next](https://www.i18next.com/)

### 17.3 APIs & Services
- [OpenHolidaysAPI Documentation](https://www.openholidaysapi.org/en/)

### 17.4 Design Resources
- [Material Design Guidelines](https://material.io/design)
- [macOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/macos)
- [Windows Design Guidelines](https://docs.microsoft.com/windows/apps/design/)

### 17.5 Testing
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)

---

## Appendix A: File System Structure

### Application Data Locations

**macOS:**
```
~/Library/Application Support/Task Manager/
├── config.json              # electron-store data
├── logs/
│   └── main.log            # electron-log files
└── backups/
    └── [auto-generated backups]
```

**Windows:**
```
%APPDATA%/Task Manager/
├── config.json              # electron-store data
├── logs/
│   └── main.log            # electron-log files
└── backups/
    └── [auto-generated backups]
```

---

## Appendix B: API Endpoints Reference

### OpenHolidaysAPI Endpoints

1. **Get All Countries**
   ```
   GET https://openholidaysapi.org/Countries
   Headers: Accept: application/json
   
   Response:
   [
     {
       "isoCode": "US",
       "name": [
         { "language": "EN", "text": "United States" }
       ],
       "officialLanguages": ["EN"]
     }
   ]
   ```

2. **Get Public Holidays**
   ```
   GET https://openholidaysapi.org/PublicHolidays
   Parameters:
     - countryIsoCode: string (required)
     - languageIsoCode: string (optional)
     - validFrom: date (required, YYYY-MM-DD)
     - validTo: date (required, YYYY-MM-DD)
   
   Response:
   [
     {
       "id": "uuid",
       "startDate": "2026-01-01",
       "endDate": "2026-01-01",
       "type": "Public",
       "name": [
         { "language": "EN", "text": "New Year's Day" }
       ],
       "nationwide": true,
       "subdivisions": []
     }
   ]
   ```

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0 | 2026-01-28 | Development Team | Updated to Electron.js architecture |

---

**End of Technical Specification Document**