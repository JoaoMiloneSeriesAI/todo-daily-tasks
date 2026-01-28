import { Card } from './card';

export interface Column {
  id: string;
  name: string;
  position: number;
  isStatic: boolean;
  color?: string;
}

export interface ColumnWithCards extends Column {
  cards: Card[];
}

// Static column IDs
export const COLUMN_IDS = {
  TODO: 'todo',
  DOING: 'doing',
  DONE: 'done',
} as const;

export type StaticColumnId = typeof COLUMN_IDS[keyof typeof COLUMN_IDS];
