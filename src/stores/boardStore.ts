import { create } from 'zustand';
import { Card, CardMovement, MigrationOption } from '../types/card';
import { Column, COLUMN_IDS } from '../types/column';
import { format } from 'date-fns';
import { getNextWorkDay } from '../utils/dateHelpers';
import { useSettingsStore } from './settingsStore';
import { ipcService } from '../services/ipcService';
import i18n from '../locales/i18n';

function getDefaultColumns(): Column[] {
  return [
    { id: COLUMN_IDS.TODO, name: i18n.t('board.columnTodo'), position: 0, isStatic: true },
    { id: COLUMN_IDS.DOING, name: i18n.t('board.columnDoing'), position: 1, isStatic: true },
    { id: COLUMN_IDS.DONE, name: i18n.t('board.columnDone'), position: 2, isStatic: true },
  ];
}

interface BoardStore {
  columns: Column[];
  cards: Card[];
  selectedDate: Date;
  isLoading: boolean;

  // Column operations
  addColumn: (name: string, position?: number) => void;
  updateColumn: (id: string, updates: Partial<Column>) => void;
  deleteColumn: (id: string, migrationOption: MigrationOption, targetColumnId?: string) => void;
  reorderColumns: (sourceIndex: number, destinationIndex: number) => void;

  // Card operations
  addCard: (columnId: string, card: Omit<Card, 'id' | 'createdDate' | 'movementHistory'>) => void;
  updateCard: (cardId: string, updates: Partial<Card>) => void;
  moveCard: (cardId: string, toColumnId: string) => void;
  deleteCard: (cardId: string) => void;
  duplicateCard: (cardId: string) => void;
  moveCardToDate: (cardId: string, currentDate: Date) => Promise<void>;

  // Data persistence
  setSelectedDate: (date: Date) => void;
  loadBoardForDate: (date: Date) => Promise<void>;
  saveBoardData: () => Promise<void>;

  // Utility
  getCardsByColumn: (columnId: string) => Card[];
  getCard: (cardId: string) => Card | undefined;

  // Reset
  resetBoard: () => void;
}

export const useBoardStore = create<BoardStore>((set, get) => ({
  columns: getDefaultColumns(),
  cards: [],
  selectedDate: new Date(),
  isLoading: false,

  // Column operations
  addColumn: (name, position) => {
    const { columns } = get();
    const newColumn: Column = {
      id: crypto.randomUUID(),
      name,
      position: position ?? columns.length,
      isStatic: false,
    };

    // Insert at position and reorder
    const updatedColumns = [...columns];
    updatedColumns.splice(newColumn.position, 0, newColumn);
    updatedColumns.forEach((col, idx) => {
      col.position = idx;
    });

    set({ columns: updatedColumns });
    get().saveBoardData();
  },

  updateColumn: (id, updates) => {
    set((state) => ({
      columns: state.columns.map((col) =>
        col.id === id ? { ...col, ...updates } : col
      ),
    }));
    get().saveBoardData();
  },

  deleteColumn: (id, migrationOption, targetColumnId) => {
    const { columns, cards } = get();
    const columnToDelete = columns.find((col) => col.id === id);

    if (!columnToDelete || columnToDelete.isStatic) {
      console.error('Cannot delete static column');
      return;
    }

    // Handle card migration
    let updatedCards = [...cards];

    if (migrationOption === 'deleteAll') {
      // Remove all cards in this column
      updatedCards = updatedCards.filter((card) => card.columnId !== id);
    } else if (migrationOption === 'moveToTodo') {
      // Move all cards to TODO
      updatedCards = updatedCards.map((card) =>
        card.columnId === id
          ? { ...card, columnId: COLUMN_IDS.TODO }
          : card
      );
    } else if (migrationOption === 'moveToColumn' && targetColumnId) {
      // Move all cards to target column
      updatedCards = updatedCards.map((card) =>
        card.columnId === id
          ? { ...card, columnId: targetColumnId }
          : card
      );
    }

    // Remove column and reorder
    const updatedColumns = columns
      .filter((col) => col.id !== id)
      .map((col, idx) => ({ ...col, position: idx }));

    set({ columns: updatedColumns, cards: updatedCards });
    get().saveBoardData();
  },

  reorderColumns: (sourceIndex, destinationIndex) => {
    const { columns } = get();
    const result = Array.from(columns);
    const [removed] = result.splice(sourceIndex, 1);
    result.splice(destinationIndex, 0, removed);

    // Update positions
    result.forEach((col, idx) => {
      col.position = idx;
    });

    set({ columns: result });
    get().saveBoardData();
  },

  // Card operations
  addCard: (columnId, cardData) => {
    const newCard: Card = {
      id: crypto.randomUUID(),
      ...cardData,
      createdDate: new Date(),
      columnId,
      movementHistory: [
        {
          id: crypto.randomUUID(),
          fromColumnId: '',
          toColumnId: columnId,
          timestamp: new Date(),
        },
      ],
    };

    set((state) => ({
      cards: [...state.cards, newCard],
    }));
    get().saveBoardData();
  },

  updateCard: (cardId, updates) => {
    set((state) => ({
      cards: state.cards.map((card) =>
        card.id === cardId ? { ...card, ...updates } : card
      ),
    }));
    get().saveBoardData();
  },

  moveCard: (cardId, toColumnId) => {
    const { cards } = get();
    const card = cards.find((c) => c.id === cardId);

    if (!card) return;

    const movement: CardMovement = {
      id: crypto.randomUUID(),
      fromColumnId: card.columnId,
      toColumnId,
      timestamp: new Date(),
    };

    set((state) => ({
      cards: state.cards.map((c) =>
        c.id === cardId
          ? {
              ...c,
              columnId: toColumnId,
              movementHistory: [...c.movementHistory, movement],
            }
          : c
      ),
    }));
    get().saveBoardData();
  },

  deleteCard: (cardId) => {
    set((state) => ({
      cards: state.cards.filter((card) => card.id !== cardId),
    }));
    get().saveBoardData();
  },

  duplicateCard: (cardId) => {
    const { cards } = get();
    const card = cards.find((c) => c.id === cardId);

    if (!card) return;

    const duplicatedCard: Card = {
      ...card,
      id: crypto.randomUUID(),
      title: `${card.title} ${i18n.t('board.copySuffix')}`,
      createdDate: new Date(),
      movementHistory: [
        {
          id: crypto.randomUUID(),
          fromColumnId: '',
          toColumnId: card.columnId,
          timestamp: new Date(),
        },
      ],
    };

    set((state) => ({
      cards: [...state.cards, duplicatedCard],
    }));
    get().saveBoardData();
  },

  moveCardToDate: async (cardId, currentDate) => {
    const { cards } = get();
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;

    const settingsState = useSettingsStore.getState();
    const targetDate = getNextWorkDay(currentDate, settingsState.settings.workDays);
    const targetDateKey = format(targetDate, 'yyyy-MM-dd');

    try {
      // Load target date's board
      const targetBoard = await ipcService.loadBoard(targetDateKey);
      const targetCards: Card[] = (targetBoard as any)?._cards || [];
      const targetColumns: Column[] = (targetBoard as any)?.columns || getDefaultColumns();

      // Add card to target board's TODO column
      const movedCard: Card = {
        ...card,
        columnId: COLUMN_IDS.TODO,
        movementHistory: [
          ...card.movementHistory,
          {
            id: crypto.randomUUID(),
            fromColumnId: card.columnId,
            toColumnId: COLUMN_IDS.TODO,
            timestamp: new Date(),
          },
        ],
      };

      // Save to target date
      await ipcService.saveBoard(targetDateKey, {
        date: targetDateKey,
        columns: targetColumns,
        metadata: { lastModified: new Date(), version: '2.0' },
        _cards: [...targetCards, movedCard],
      });

      // Remove from current board
      set((state) => ({
        cards: state.cards.filter((c) => c.id !== cardId),
      }));
      get().saveBoardData();
    } catch (error) {
      console.error('Error moving card to next day:', error);
    }
  },

  // Data persistence
  setSelectedDate: (date) => {
    set({ selectedDate: date });
    get().loadBoardForDate(date);
  },

  loadBoardForDate: async (date) => {
    set({ isLoading: true });
    const dateKey = format(date, 'yyyy-MM-dd');

    try {
      const boardData = await ipcService.loadBoard(dateKey);

      if (boardData && typeof boardData === 'object') {
        const data = boardData as { columns?: Column[]; _cards?: Card[] };
        set({
          columns: data.columns || get().columns,
          cards: data._cards || [],
          selectedDate: date,
        });
      } else {
        // No data for this date, reset to default columns and empty cards
        set({
          columns: getDefaultColumns(),
          cards: [],
          selectedDate: date,
        });
      }
    } catch (error) {
      console.error('Error loading board data:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  saveBoardData: async () => {
    const { selectedDate, columns, cards } = get();
    const dateKey = format(selectedDate, 'yyyy-MM-dd');

    try {
      await ipcService.saveBoard(dateKey, {
        date: dateKey,
        columns,
        metadata: {
          lastModified: new Date(),
          version: '2.0',
        },
        _cards: cards,
      });
    } catch (error) {
      console.error('Error saving board data:', error);
    }
  },

  // Utility
  getCardsByColumn: (columnId) => {
    return get().cards.filter((card) => card.columnId === columnId);
  },

  getCard: (cardId) => {
    return get().cards.find((card) => card.id === cardId);
  },

  resetBoard: () => {
    set({
      columns: getDefaultColumns(),
      cards: [],
      selectedDate: new Date(),
      isLoading: false,
    });
  },
}));
