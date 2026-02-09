import { dialog, app } from 'electron';
import fs from 'fs-extra';
import path from 'path';
import log from 'electron-log';

interface ExportData {
  version: string;
  exportDate: string;
  data: unknown;
}

export class ExportImportService {
  async exportData(data: unknown): Promise<{ success: boolean; path?: string }> {
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
        properties: ['createDirectory', 'showOverwriteConfirmation'],
      });

      if (!filePath) {
        // User cancelled
        return { success: false };
      }

      const exportData: ExportData = {
        version: '2.0',
        exportDate: new Date().toISOString(),
        data,
      };

      await fs.writeJson(filePath, exportData, { spaces: 2 });

      log.info('Data exported successfully to:', filePath);
      return { success: true, path: filePath };
    } catch (error) {
      log.error('Export error:', error);
      return { success: false };
    }
  }

  async importData(): Promise<{ success: boolean; data?: unknown }> {
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
        // User cancelled
        return { success: false };
      }

      const fileContent = await fs.readJson(filePaths[0]);

      // Validate imported data structure
      if (!this.validateImportData(fileContent)) {
        throw new Error('Invalid data format - not a valid Task Manager backup file');
      }

      log.info('Data imported successfully from:', filePaths[0]);
      return { success: true, data: fileContent.data };
    } catch (error) {
      log.error('Import error:', error);
      return { success: false };
    }
  }

  private validateImportData(data: unknown): data is ExportData {
    if (!data || typeof data !== 'object') {
      return false;
    }

    const exportData = data as Partial<ExportData>;

    // Basic structure checks
    if (!exportData.version || !exportData.exportDate || !exportData.data || typeof exportData.data !== 'object') {
      return false;
    }

    // Validate version format
    if (typeof exportData.version !== 'string') {
      return false;
    }

    // Validate export date is a valid ISO date
    if (typeof exportData.exportDate !== 'string' || isNaN(Date.parse(exportData.exportDate))) {
      return false;
    }

    // If data contains boards, validate they are keyed by date strings
    const appData = exportData.data as Record<string, unknown>;
    if (appData.boards && typeof appData.boards === 'object') {
      const boards = appData.boards as Record<string, unknown>;
      for (const [key, board] of Object.entries(boards)) {
        // Date key should match YYYY-MM-DD format
        if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) {
          log.warn('Invalid board date key during import validation:', key);
          return false;
        }

        // Board should be an object with expected shape
        if (!board || typeof board !== 'object') {
          log.warn('Invalid board data during import validation for key:', key);
          return false;
        }
      }
    }

    return true;
  }
}
