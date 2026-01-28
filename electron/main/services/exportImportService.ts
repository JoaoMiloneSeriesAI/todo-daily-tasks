import { dialog, app } from 'electron';
import fs from 'fs-extra';
import path from 'path';

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

      console.log('Data exported successfully to:', filePath);
      return { success: true, path: filePath };
    } catch (error) {
      console.error('Export error:', error);
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

      console.log('Data imported successfully from:', filePaths[0]);
      return { success: true, data: fileContent.data };
    } catch (error) {
      console.error('Import error:', error);
      return { success: false };
    }
  }

  private validateImportData(data: unknown): data is ExportData {
    if (!data || typeof data !== 'object') {
      return false;
    }

    const exportData = data as Partial<ExportData>;

    return !!(
      exportData.version &&
      exportData.exportDate &&
      exportData.data &&
      typeof exportData.data === 'object'
    );
  }
}
