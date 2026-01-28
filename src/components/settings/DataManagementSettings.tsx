import { useState } from 'react';
import { Download, Upload, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '../shared/Button';
import { Modal } from '../shared/Modal';
import { toast } from '../shared/Toast';

export function DataManagementSettings() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const allData = {
        boards: await window.electronAPI.loadData('boards'),
        settings: await window.electronAPI.loadData('settings'),
        templates: await window.electronAPI.loadData('templates'),
      };
      await window.electronAPI.exportData(allData);
      toast.success('Data exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    setIsImporting(true);
    try {
      const importedData = await window.electronAPI.importData();
      if (importedData) {
        toast.success('Data imported successfully! Please restart the app for changes to take effect.');
      }
    } catch (error) {
      console.error('Import failed:', error);
      toast.error('Failed to import data. Please check the file and try again.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleClearData = async () => {
    try {
      // Clear all data by saving empty objects
      await window.electronAPI.saveData('boards', {} as any);
      await window.electronAPI.saveData('settings', {} as any);
      await window.electronAPI.saveData('templates', [] as any);
      toast.success('All data has been cleared! Please restart the app.');
      setShowClearModal(false);
    } catch (error) {
      console.error('Clear data failed:', error);
      toast.error('Failed to clear data. Please try again.');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Management</h2>
        <p className="text-sm text-gray-600 mb-6">
          Export, import, or clear your task data
        </p>
      </div>

      {/* Export Data */}
      <div className="p-6 rounded-lg border border-gray-200 bg-white">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
            <Download size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Export Data</h3>
            <p className="text-sm text-gray-600 mb-4">
              Export all your boards, tasks, and settings to a JSON file. Use this to create
              backups or transfer data to another device.
            </p>
            <Button onClick={handleExport} disabled={isExporting} leftIcon={<Download size={16} />}>
              {isExporting ? 'Exporting...' : 'Export Data'}
            </Button>
          </div>
        </div>
      </div>

      {/* Import Data */}
      <div className="p-6 rounded-lg border border-gray-200 bg-white">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-green-50 text-green-600">
            <Upload size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Import Data</h3>
            <p className="text-sm text-gray-600 mb-4">
              Import data from a previously exported JSON file. This will merge with your existing
              data. Make sure to backup your current data first.
            </p>
            <Button
              onClick={handleImport}
              disabled={isImporting}
              leftIcon={<Upload size={16} />}
              variant="secondary"
            >
              {isImporting ? 'Importing...' : 'Import Data'}
            </Button>
          </div>
        </div>
      </div>

      {/* Clear All Data */}
      <div className="p-6 rounded-lg border-2 border-red-200 bg-red-50">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-red-100 text-red-600">
            <Trash2 size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Clear All Data</h3>
            <p className="text-sm text-gray-600 mb-4">
              Permanently delete all boards, tasks, and settings. This action cannot be undone.
              Make sure to export your data first if you want to keep a backup.
            </p>
            <Button
              onClick={() => setShowClearModal(true)}
              variant="secondary"
              leftIcon={<Trash2 size={16} />}
              className="text-red-600 hover:bg-red-100 border-red-300"
            >
              Clear All Data
            </Button>
          </div>
        </div>
      </div>

      {/* Confirm Clear Data Modal */}
      <Modal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        title="Clear All Data"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
            <AlertTriangle className="text-red-600 flex-shrink-0" size={24} />
            <div>
              <p className="text-sm font-medium text-red-900 mb-1">
                This action cannot be undone
              </p>
              <p className="text-sm text-red-700">
                All your boards, tasks, settings, and templates will be permanently deleted. Make
                sure you have exported your data if you want to keep a backup.
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            Are you absolutely sure you want to clear all data?
          </p>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => setShowClearModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleClearData} className="bg-red-600 hover:bg-red-700 text-white">
              Yes, Clear All Data
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
