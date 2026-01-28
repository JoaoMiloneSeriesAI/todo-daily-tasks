import { Column } from './column';

export interface BoardData {
  date: string; // YYYY-MM-DD format
  columns: Column[];
  metadata: BoardMetadata;
}

export interface BoardMetadata {
  lastModified: Date;
  version: string;
}

// Time tracking types
export interface TimeBreakdown {
  columnName: string;
  columnId: string;
  timeSpent: number; // milliseconds
  percentage: number;
}

// Dashboard statistics types
export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  avgCompletionTime: number;
  completionTrend: number;
  completionData: ChartData[];
  timeByColumn: TimeByColumnData[];
  tagDistribution: TagDistributionData[];
  dailyCompletion: DailyCompletionData[];
}

export interface ChartData {
  date: string;
  completed: number;
}

export interface TimeByColumnData {
  columnName: string;
  time: number;
  color: string;
}

export interface TagDistributionData {
  tag: string;
  count: number;
  percentage: number;
}

export interface DailyCompletionData {
  date: string;
  count: number;
}

export interface DateRange {
  start: Date;
  end: Date;
}
