import Store from 'electron-store';
import log from 'electron-log';
import { DEFAULT_SETTINGS } from '../../../src/types/settings';

interface DataSchema {
  boards: Record<string, unknown>; // BoardData by date (YYYY-MM-DD)
  settings: unknown; // AppSettings
  templates: unknown[]; // CardTemplate[]
  tags: string[];
}

export class DataService {
  private store: Store<DataSchema>;

  constructor() {
    this.store = new Store<DataSchema>({
      name: 'task-manager-data',
      defaults: {
        boards: {},
        settings: DEFAULT_SETTINGS,
        templates: this.getDefaultTemplates(),
        tags: [],
      },
      // Optional: Add encryption key for sensitive data
      // encryptionKey: 'your-encryption-key',
    });
  }

  // Board data operations
  async getBoard(date: string): Promise<unknown | null> {
    try {
      const boards = this.store.get('boards');
      return boards[date] || null;
    } catch (error) {
      log.error('Error getting board:', error);
      return null;
    }
  }

  async saveBoard(date: string, board: unknown): Promise<void> {
    try {
      const boards = this.store.get('boards');
      boards[date] = board;
      this.store.set('boards', boards);
    } catch (error) {
      log.error('Error saving board:', error);
      throw error;
    }
  }

  // Settings operations
  async getSettings(): Promise<unknown> {
    try {
      return this.store.get('settings');
    } catch (error) {
      log.error('Error getting settings:', error);
      return DEFAULT_SETTINGS;
    }
  }

  async updateSettings(settings: unknown): Promise<void> {
    try {
      const current = this.store.get('settings');
      this.store.set('settings', { ...current, ...settings });
    } catch (error) {
      log.error('Error updating settings:', error);
      throw error;
    }
  }

  // Template operations
  async getTemplates(): Promise<unknown[]> {
    try {
      return this.store.get('templates');
    } catch (error) {
      log.error('Error getting templates:', error);
      return [];
    }
  }

  async saveTemplates(templates: unknown[]): Promise<void> {
    try {
      this.store.set('templates', templates);
    } catch (error) {
      log.error('Error saving templates:', error);
      throw error;
    }
  }

  // Bulk data loading for dashboard
  async getBoardsInRange(startDate: string, endDate: string): Promise<Record<string, unknown>> {
    try {
      const boards = this.store.get('boards');
      const result: Record<string, unknown> = {};

      for (const [dateKey, boardData] of Object.entries(boards)) {
        if (dateKey >= startDate && dateKey <= endDate) {
          result[dateKey] = boardData;
        }
      }

      return result;
    } catch (error) {
      log.error('Error getting boards in range:', error);
      return {};
    }
  }

  // Tags operations
  async getTags(): Promise<string[]> {
    try {
      return this.store.get('tags');
    } catch (error) {
      log.error('Error getting tags:', error);
      return [];
    }
  }

  async saveTags(tags: string[]): Promise<void> {
    try {
      this.store.set('tags', tags);
    } catch (error) {
      log.error('Error saving tags:', error);
      throw error;
    }
  }

  /// <summary>
  /// Clears the entire electron-store and re-initializes with defaults.
  /// Used by the "Clear All Data" feature.
  /// </summary>
  async clearStore(): Promise<void> {
    try {
      this.store.clear();
      log.info('All data cleared from store');
    } catch (error) {
      log.error('Error clearing store:', error);
      throw error;
    }
  }

  // Default templates
  private getDefaultTemplates(): unknown[] {
    return [
      {
        id: '1',
        name: 'Bug Fix',
        prefix: '🐛 ',
        color: '#EF4444',
        defaultTags: ['bug', 'urgent'],
      },
      {
        id: '2',
        name: 'Feature',
        prefix: '✨ ',
        color: '#10B981',
        defaultTags: ['feature'],
      },
      {
        id: '3',
        name: 'Documentation',
        prefix: '📝 ',
        color: '#3B82F6',
        defaultTags: ['docs'],
      },
    ];
  }
}
