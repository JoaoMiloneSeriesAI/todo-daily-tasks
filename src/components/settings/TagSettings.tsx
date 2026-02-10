import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Check, X } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';

const TAG_COLORS = [
  '#EF4444', '#F59E0B', '#10B981', '#3B82F6',
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
];

export function TagSettings() {
  const { t } = useTranslation();
  const { settings, addTag, updateTag, deleteTag } = useSettingsStore();
  const tags = settings.tags || [];
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#3B82F6');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  const handleAdd = () => {
    if (!newName.trim()) return;
    addTag({ name: newName.trim().toLowerCase(), color: newColor });
    setNewName('');
  };

  const startEdit = (id: string, name: string, color: string) => { setEditingId(id); setEditName(name); setEditColor(color); };

  const saveEdit = () => {
    if (editingId && editName.trim()) updateTag(editingId, { name: editName.trim().toLowerCase(), color: editColor });
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">{t('settingsTags.title')}</h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">{t('settingsTags.description')}</p>
      </div>

      <div className="flex gap-3 items-end p-4 bg-[var(--color-bg-tertiary)] rounded-lg border border-[var(--color-border)]">
        <div className="flex-1">
          <Input label={t('settingsTags.tagName')} value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={t('settingsTags.tagNamePlaceholder')} onKeyDown={(e) => e.key === 'Enter' && handleAdd()} />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">{t('settingsTags.color')}</label>
          <div className="flex gap-1">
            {TAG_COLORS.map((c) => (
              <button key={c} onClick={() => setNewColor(c)} className={`w-8 h-8 rounded-lg transition-all ${newColor === c ? 'ring-2 ring-offset-1 ring-[var(--color-accent)] scale-110' : 'hover:scale-105'}`} style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>
        <Button onClick={handleAdd} disabled={!newName.trim()} leftIcon={<Plus size={16} />}>{t('settingsTags.add')}</Button>
      </div>

      <div className="space-y-2">
        {tags.length === 0 ? (
          <p className="text-center py-8 text-[var(--color-text-tertiary)] text-sm">{t('settingsTags.noTags')}</p>
        ) : (
          tags.map((tag) => (
            <div key={tag.id} className="flex items-center justify-between p-3 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] transition-colors">
              {editingId === tag.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                    className="px-2 py-1 text-sm bg-[var(--color-input-bg)] border border-[var(--color-input-border)] rounded text-[var(--color-text-primary)] flex-1"
                    autoFocus onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditingId(null); }} />
                  <div className="flex gap-1">
                    {TAG_COLORS.map((c) => (
                      <button key={c} onClick={() => setEditColor(c)} className={`w-6 h-6 rounded ${editColor === c ? 'ring-2 ring-[var(--color-accent)]' : ''}`} style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <button onClick={saveEdit} className="p-1 hover:bg-green-100 dark:hover:bg-green-900/30 rounded"><Check size={16} className="text-green-600" /></button>
                  <button onClick={() => setEditingId(null)} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"><X size={16} className="text-red-600" /></button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: tag.color }} />
                    <span className="text-sm font-medium px-3 py-1 rounded-full" style={{ backgroundColor: tag.color + '20', color: tag.color }}>{tag.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(tag.id, tag.name, tag.color)} className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] px-2 py-1 rounded hover:bg-[var(--color-surface-active)] transition-colors">{t('common.edit')}</button>
                    <button onClick={() => deleteTag(tag.id)} className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
