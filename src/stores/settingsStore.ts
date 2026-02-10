import { create } from 'zustand';
import { AppSettings, DEFAULT_SETTINGS, DEFAULT_TAGS, CustomHoliday, TagDefinition } from '../types/settings';
import { CardTemplate } from '../types/card';
import { ipcService } from '../services/ipcService';

interface SettingsStore {
  settings: AppSettings;
  templates: CardTemplate[];
  isLoading: boolean;

  // Settings operations
  loadSettings: () => Promise<void>;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;

  // Template operations
  addTemplate: (template: Omit<CardTemplate, 'id'>) => void;
  updateTemplate: (id: string, updates: Partial<CardTemplate>) => void;
  deleteTemplate: (id: string) => void;
  getTemplateById: (id: string) => CardTemplate | undefined;

  // Tag operations
  addTag: (tag: Omit<TagDefinition, 'id'>) => void;
  updateTag: (id: string, updates: Partial<TagDefinition>) => void;
  deleteTag: (id: string) => void;

  // Custom holiday operations
  addCustomHoliday: (holiday: Omit<CustomHoliday, 'id'>) => void;
  deleteCustomHoliday: (id: string) => void;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  templates: [
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
  ],
  isLoading: true, // Start as true — becomes false after first loadSettings() completes

  // Settings operations
  loadSettings: async () => {
    set({ isLoading: true });

    try {
      const loadedSettings = await ipcService.getSettings();

      if (loadedSettings && typeof loadedSettings === 'object') {
        const loaded = loadedSettings as AppSettings;
        // Ensure tags array exists (backfill for older data)
        if (!loaded.tags || loaded.tags.length === 0) {
          loaded.tags = DEFAULT_TAGS;
        }
        set({ settings: loaded });
      }

      // Also load persisted templates
      if (typeof window !== 'undefined' && window.electronAPI) {
        try {
          const loadedTemplates = await window.electronAPI.loadData('templates');
          if (Array.isArray(loadedTemplates) && loadedTemplates.length > 0) {
            set({ templates: loadedTemplates as CardTemplate[] });
          }
        } catch {
          // Use default templates
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      set({ settings: DEFAULT_SETTINGS });
    } finally {
      set({ isLoading: false });
    }
  },

  updateSettings: async (updates) => {
    const { settings } = get();

    // Deep merge settings
    const updatedSettings: AppSettings = {
      ...settings,
      ...updates,
      general: { ...settings.general, ...(updates.general || {}) },
      workDays: { ...settings.workDays, ...(updates.workDays || {}) },
      holidays: { ...settings.holidays, ...(updates.holidays || {}) },
      appearance: { ...settings.appearance, ...(updates.appearance || {}) },
    };

    set({ settings: updatedSettings });

    try {
      await ipcService.updateSettings(updatedSettings);
    } catch (error) {
      console.error('Error updating settings:', error);
      // Rollback on error
      set({ settings });
    }
  },

  resetSettings: async () => {
    set({ settings: DEFAULT_SETTINGS });

    try {
      await ipcService.updateSettings(DEFAULT_SETTINGS);
    } catch (error) {
      console.error('Error resetting settings:', error);
    }
  },

  // Template operations (with persistence)
  addTemplate: (template) => {
    const newTemplate: CardTemplate = {
      ...template,
      id: crypto.randomUUID(),
    };

    set((state) => ({
      templates: [...state.templates, newTemplate],
    }));
    // Persist
    if (typeof window !== 'undefined' && window.electronAPI) {
      window.electronAPI.saveData('templates', get().templates as any);
    }
  },

  updateTemplate: (id, updates) => {
    set((state) => ({
      templates: state.templates.map((template) =>
        template.id === id ? { ...template, ...updates } : template
      ),
    }));
    if (typeof window !== 'undefined' && window.electronAPI) {
      window.electronAPI.saveData('templates', get().templates as any);
    }
  },

  deleteTemplate: (id) => {
    set((state) => ({
      templates: state.templates.filter((template) => template.id !== id),
    }));
    if (typeof window !== 'undefined' && window.electronAPI) {
      window.electronAPI.saveData('templates', get().templates as any);
    }
  },

  getTemplateById: (id) => {
    return get().templates.find((template) => template.id === id);
  },

  // Tag operations
  addTag: (tag) => {
    const newTag: TagDefinition = { ...tag, id: crypto.randomUUID() };
    const currentTags = get().settings.tags || [];
    get().updateSettings({ tags: [...currentTags, newTag] });
  },

  updateTag: (id, updates) => {
    const currentTags = get().settings.tags || [];
    const updated = currentTags.map((tg) => tg.id === id ? { ...tg, ...updates } : tg);
    get().updateSettings({ tags: updated });
  },

  deleteTag: (id) => {
    const currentTags = get().settings.tags || [];
    get().updateSettings({ tags: currentTags.filter((tg) => tg.id !== id) });
  },

  // Custom holiday operations
  addCustomHoliday: (holiday) => {
    const newHoliday: CustomHoliday = {
      ...holiday,
      id: crypto.randomUUID(),
    };

    set((state) => ({
      settings: {
        ...state.settings,
        holidays: {
          ...state.settings.holidays,
          customHolidays: [...state.settings.holidays.customHolidays, newHoliday],
        },
      },
    }));

    // Persist to electron store
    get().updateSettings(get().settings);
  },

  deleteCustomHoliday: (id) => {
    set((state) => ({
      settings: {
        ...state.settings,
        holidays: {
          ...state.settings.holidays,
          customHolidays: state.settings.holidays.customHolidays.filter((h) => h.id !== id),
        },
      },
    }));

    // Persist to electron store
    get().updateSettings(get().settings);
  },
}));
