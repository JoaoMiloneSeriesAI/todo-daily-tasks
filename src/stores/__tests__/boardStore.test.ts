import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useBoardStore } from '../boardStore';
import { COLUMN_IDS } from '../../types/column';

// Mock the ipcService module
vi.mock('../../services/ipcService', () => ({
  ipcService: {
    loadBoard: vi.fn().mockResolvedValue(null),
    saveBoard: vi.fn().mockResolvedValue(undefined),
    loadBoardsInRange: vi.fn().mockResolvedValue({}),
    getSettings: vi.fn().mockResolvedValue(null),
    updateSettings: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock window.electronAPI for any direct calls that might remain
vi.stubGlobal('window', {
  ...globalThis.window,
  electronAPI: {
    loadData: vi.fn().mockResolvedValue(null),
    saveData: vi.fn().mockResolvedValue(undefined),
    loadDataRange: vi.fn().mockResolvedValue({}),
    getSettings: vi.fn().mockResolvedValue(null),
    updateSettings: vi.fn().mockResolvedValue(undefined),
    fetchHolidays: vi.fn().mockResolvedValue([]),
    fetchCountries: vi.fn().mockResolvedValue([]),
    exportData: vi.fn().mockResolvedValue({ success: true }),
    importData: vi.fn().mockResolvedValue({ success: true }),
  },
});

describe('boardStore', () => {
  beforeEach(() => {
    // Reset the store to initial state before each test
    useBoardStore.setState({
      columns: [
        { id: COLUMN_IDS.TODO, name: 'TODO', position: 0, isStatic: true },
        { id: COLUMN_IDS.DOING, name: 'Doing', position: 1, isStatic: true },
        { id: COLUMN_IDS.DONE, name: 'Done', position: 2, isStatic: true },
      ],
      cards: [],
      selectedDate: new Date(),
      isLoading: false,
    });
  });

  describe('addCard', () => {
    it('should add a card to the specified column', () => {
      const store = useBoardStore.getState();

      store.addCard(COLUMN_IDS.TODO, {
        title: 'Test Task',
        description: 'A test task',
        columnId: COLUMN_IDS.TODO,
        tags: ['test'],
        checklist: [],
      });

      const cards = useBoardStore.getState().cards;
      expect(cards).toHaveLength(1);
      expect(cards[0].title).toBe('Test Task');
      expect(cards[0].columnId).toBe(COLUMN_IDS.TODO);
      expect(cards[0].tags).toEqual(['test']);
    });

    it('should create a card with initial movement history', () => {
      const store = useBoardStore.getState();

      store.addCard(COLUMN_IDS.TODO, {
        title: 'Test',
        description: '',
        columnId: COLUMN_IDS.TODO,
        tags: [],
        checklist: [],
      });

      const card = useBoardStore.getState().cards[0];
      expect(card.movementHistory).toHaveLength(1);
      expect(card.movementHistory[0].toColumnId).toBe(COLUMN_IDS.TODO);
      expect(card.movementHistory[0].fromColumnId).toBe('');
    });
  });

  describe('moveCard', () => {
    it('should move a card to a different column', () => {
      const store = useBoardStore.getState();

      store.addCard(COLUMN_IDS.TODO, {
        title: 'Move Me',
        description: '',
        columnId: COLUMN_IDS.TODO,
        tags: [],
        checklist: [],
      });

      const cardId = useBoardStore.getState().cards[0].id;
      store.moveCard(cardId, COLUMN_IDS.DOING);

      const movedCard = useBoardStore.getState().cards[0];
      expect(movedCard.columnId).toBe(COLUMN_IDS.DOING);
    });

    it('should record movement in history', () => {
      const store = useBoardStore.getState();

      store.addCard(COLUMN_IDS.TODO, {
        title: 'Track Me',
        description: '',
        columnId: COLUMN_IDS.TODO,
        tags: [],
        checklist: [],
      });

      const cardId = useBoardStore.getState().cards[0].id;
      store.moveCard(cardId, COLUMN_IDS.DOING);

      const card = useBoardStore.getState().cards[0];
      expect(card.movementHistory).toHaveLength(2);
      expect(card.movementHistory[1].fromColumnId).toBe(COLUMN_IDS.TODO);
      expect(card.movementHistory[1].toColumnId).toBe(COLUMN_IDS.DOING);
    });
  });

  describe('deleteCard', () => {
    it('should remove a card', () => {
      const store = useBoardStore.getState();

      store.addCard(COLUMN_IDS.TODO, {
        title: 'Delete Me',
        description: '',
        columnId: COLUMN_IDS.TODO,
        tags: [],
        checklist: [],
      });

      const cardId = useBoardStore.getState().cards[0].id;
      expect(useBoardStore.getState().cards).toHaveLength(1);

      store.deleteCard(cardId);
      expect(useBoardStore.getState().cards).toHaveLength(0);
    });
  });

  describe('duplicateCard', () => {
    it('should create a copy of the card', () => {
      const store = useBoardStore.getState();

      store.addCard(COLUMN_IDS.TODO, {
        title: 'Original',
        description: 'Original description',
        columnId: COLUMN_IDS.TODO,
        tags: ['tag1'],
        checklist: [],
      });

      const cardId = useBoardStore.getState().cards[0].id;
      store.duplicateCard(cardId);

      const cards = useBoardStore.getState().cards;
      expect(cards).toHaveLength(2);
      expect(cards[1].title).toBe('Original (Copy)');
      expect(cards[1].description).toBe('Original description');
      expect(cards[1].tags).toEqual(['tag1']);
      expect(cards[1].id).not.toBe(cards[0].id);
    });
  });

  describe('addColumn', () => {
    it('should add a custom column', () => {
      const store = useBoardStore.getState();

      store.addColumn('In Review');

      const columns = useBoardStore.getState().columns;
      expect(columns).toHaveLength(4);

      const newColumn = columns.find((c) => c.name === 'In Review');
      expect(newColumn).toBeDefined();
      expect(newColumn!.isStatic).toBe(false);
    });
  });

  describe('deleteColumn', () => {
    it('should delete a custom column and move cards to TODO', () => {
      const store = useBoardStore.getState();

      // Add a custom column
      store.addColumn('Review');
      const columns = useBoardStore.getState().columns;
      const reviewColumn = columns.find((c) => c.name === 'Review')!;

      // Add a card to the custom column
      store.addCard(reviewColumn.id, {
        title: 'Review Task',
        description: '',
        columnId: reviewColumn.id,
        tags: [],
        checklist: [],
      });

      // Delete with migration to TODO
      store.deleteColumn(reviewColumn.id, 'moveToTodo');

      const newColumns = useBoardStore.getState().columns;
      expect(newColumns).toHaveLength(3); // Back to 3 default columns
      expect(newColumns.find((c) => c.name === 'Review')).toBeUndefined();

      // Card should have been moved to TODO
      const cards = useBoardStore.getState().cards;
      expect(cards[0].columnId).toBe(COLUMN_IDS.TODO);
    });

    it('should not delete static columns', () => {
      const store = useBoardStore.getState();

      store.deleteColumn(COLUMN_IDS.TODO, 'deleteAll');

      // Should still have 3 columns
      expect(useBoardStore.getState().columns).toHaveLength(3);
    });

    it('should delete all cards when using deleteAll migration', () => {
      const store = useBoardStore.getState();

      store.addColumn('Temp');
      const tempColumn = useBoardStore.getState().columns.find((c) => c.name === 'Temp')!;

      store.addCard(tempColumn.id, {
        title: 'Will be deleted',
        description: '',
        columnId: tempColumn.id,
        tags: [],
        checklist: [],
      });

      store.deleteColumn(tempColumn.id, 'deleteAll');

      expect(useBoardStore.getState().cards).toHaveLength(0);
    });
  });

  describe('getCardsByColumn', () => {
    it('should return only cards for the specified column', () => {
      const store = useBoardStore.getState();

      store.addCard(COLUMN_IDS.TODO, {
        title: 'Todo Task', description: '', columnId: COLUMN_IDS.TODO, tags: [], checklist: [],
      });
      store.addCard(COLUMN_IDS.DOING, {
        title: 'Doing Task', description: '', columnId: COLUMN_IDS.DOING, tags: [], checklist: [],
      });
      store.addCard(COLUMN_IDS.TODO, {
        title: 'Another Todo', description: '', columnId: COLUMN_IDS.TODO, tags: [], checklist: [],
      });

      const todoCards = useBoardStore.getState().getCardsByColumn(COLUMN_IDS.TODO);
      expect(todoCards).toHaveLength(2);

      const doingCards = useBoardStore.getState().getCardsByColumn(COLUMN_IDS.DOING);
      expect(doingCards).toHaveLength(1);
    });
  });
});
