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

export type MigrationOption = 'moveToTodo' | 'moveToColumn' | 'deleteAll';
