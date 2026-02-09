import { describe, it, expect } from 'vitest';
import { TimeTracker } from '../timeTracking';
import { Card } from '../../types/card';
import { Column } from '../../types/column';

function makeCard(overrides: Partial<Card> = {}): Card {
  return {
    id: '1',
    title: 'Test Card',
    description: '',
    createdDate: new Date('2026-01-01T09:00:00'),
    columnId: 'todo',
    tags: [],
    checklist: [],
    movementHistory: [],
    ...overrides,
  };
}

describe('TimeTracker', () => {
  describe('formatDuration', () => {
    it('should format seconds correctly', () => {
      expect(TimeTracker.formatDuration(5000)).toBe('5s');
    });

    it('should format minutes correctly', () => {
      expect(TimeTracker.formatDuration(5 * 60 * 1000)).toBe('5m');
    });

    it('should format hours and minutes correctly', () => {
      expect(TimeTracker.formatDuration(2 * 60 * 60 * 1000 + 30 * 60 * 1000)).toBe('2h 30m');
    });

    it('should format days and hours correctly', () => {
      expect(TimeTracker.formatDuration(2 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000)).toBe('2d 5h');
    });

    it('should format exact hours without remaining minutes', () => {
      expect(TimeTracker.formatDuration(3 * 60 * 60 * 1000)).toBe('3h');
    });

    it('should format exact days without remaining hours', () => {
      expect(TimeTracker.formatDuration(2 * 24 * 60 * 60 * 1000)).toBe('2d');
    });

    it('should return 0m for negative values', () => {
      expect(TimeTracker.formatDuration(-1000)).toBe('0m');
    });

    it('should return 0s for zero', () => {
      expect(TimeTracker.formatDuration(0)).toBe('0s');
    });
  });

  describe('getTotalTimeToCompletion', () => {
    it('should calculate time from creation to completion', () => {
      const card = makeCard({
        createdDate: new Date('2026-01-01T09:00:00'),
        columnId: 'done',
        movementHistory: [
          { id: '1', fromColumnId: '', toColumnId: 'todo', timestamp: new Date('2026-01-01T09:00:00') },
          { id: '2', fromColumnId: 'todo', toColumnId: 'doing', timestamp: new Date('2026-01-01T10:00:00') },
          { id: '3', fromColumnId: 'doing', toColumnId: 'done', timestamp: new Date('2026-01-01T15:00:00') },
        ],
      });

      const result = TimeTracker.getTotalTimeToCompletion(card);
      // 6 hours from 9:00 to 15:00
      expect(result).toBe(6 * 60 * 60 * 1000);
    });

    it('should return time since creation for incomplete cards', () => {
      const createdDate = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
      const card = makeCard({
        createdDate,
        columnId: 'doing',
        movementHistory: [
          { id: '1', fromColumnId: '', toColumnId: 'todo', timestamp: createdDate },
        ],
      });

      const result = TimeTracker.getTotalTimeToCompletion(card);
      // Should be approximately 2 hours (within 1 second tolerance)
      expect(result).toBeGreaterThan(2 * 60 * 60 * 1000 - 1000);
      expect(result).toBeLessThan(2 * 60 * 60 * 1000 + 1000);
    });
  });

  describe('getTimeBreakdown', () => {
    it('should return breakdown for each column', () => {
      const columns: Column[] = [
        { id: 'todo', name: 'TODO', position: 0, isStatic: true },
        { id: 'doing', name: 'Doing', position: 1, isStatic: true },
        { id: 'done', name: 'Done', position: 2, isStatic: true },
      ];

      const card = makeCard({
        createdDate: new Date('2026-01-01T09:00:00'),
        columnId: 'done',
        movementHistory: [
          { id: '1', fromColumnId: '', toColumnId: 'todo', timestamp: new Date('2026-01-01T09:00:00') },
          { id: '2', fromColumnId: 'todo', toColumnId: 'doing', timestamp: new Date('2026-01-01T10:00:00') },
          { id: '3', fromColumnId: 'doing', toColumnId: 'done', timestamp: new Date('2026-01-01T12:00:00') },
        ],
      });

      const breakdown = TimeTracker.getTimeBreakdown(card, columns);

      expect(breakdown).toHaveLength(3);
      expect(breakdown[0].columnName).toBe('TODO');
      expect(breakdown[1].columnName).toBe('Doing');
      expect(breakdown[2].columnName).toBe('Done');
    });
  });

  describe('getMovementHistory', () => {
    it('should return movements in chronological order', () => {
      const card = makeCard({
        movementHistory: [
          { id: '2', fromColumnId: 'todo', toColumnId: 'doing', timestamp: new Date('2026-01-01T11:00:00') },
          { id: '1', fromColumnId: '', toColumnId: 'todo', timestamp: new Date('2026-01-01T09:00:00') },
          { id: '3', fromColumnId: 'doing', toColumnId: 'done', timestamp: new Date('2026-01-01T15:00:00') },
        ],
      });

      const history = TimeTracker.getMovementHistory(card);

      expect(history[0].id).toBe('1');
      expect(history[1].id).toBe('2');
      expect(history[2].id).toBe('3');
    });

    it('should return empty array for card with no movements', () => {
      const card = makeCard({ movementHistory: [] });
      expect(TimeTracker.getMovementHistory(card)).toEqual([]);
    });
  });

  describe('getTimeInColumn', () => {
    it('should return 0 for card with no movement history', () => {
      const card = makeCard({ movementHistory: [] });
      expect(TimeTracker.getTimeInColumn(card, 'todo')).toBe(0);
    });

    it('should calculate time for a completed transit through a column', () => {
      const card = makeCard({
        columnId: 'done',
        movementHistory: [
          { id: '1', fromColumnId: '', toColumnId: 'doing', timestamp: new Date('2026-01-01T10:00:00') },
          { id: '2', fromColumnId: 'doing', toColumnId: 'done', timestamp: new Date('2026-01-01T12:00:00') },
        ],
      });

      const timeInDoing = TimeTracker.getTimeInColumn(card, 'doing');
      expect(timeInDoing).toBe(2 * 60 * 60 * 1000); // 2 hours
    });
  });
});
