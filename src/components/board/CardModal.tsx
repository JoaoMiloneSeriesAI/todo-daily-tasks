import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { Modal, Input, Select, Button, ConfirmDialog } from '../shared';
import { Card, ChecklistItem } from '../../types/card';
import { useSettingsStore } from '../../stores/settingsStore';
import { X, Plus, Trash2, ArrowRightCircle, Edit, Copy, CheckSquare, Check } from 'lucide-react';

/// <summary>
/// Converts a hex color to an rgba string with a given alpha.
/// Handles 6-char hex safely; returns undefined for invalid input.
/// </summary>
function hexToRgba(hex: string | null | undefined, alpha: number): string | undefined {
  if (!hex || !/^#[0-9A-Fa-f]{6}$/.test(hex)) return undefined;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cardData: Partial<Card>) => void;
  card?: Card;
  columnId: string;
  onMoveToNextDay?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
}

export function CardModal({ isOpen, onClose, onSave, card, columnId, onMoveToNextDay, onDuplicate, onDelete }: CardModalProps) {
  const { t } = useTranslation();
  const { templates, getTemplateById, settings } = useSettingsStore();
  const globalTags = settings.tags || [];
  const [mode, setMode] = useState<'view' | 'edit'>('edit');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [checklistInput, setChecklistInput] = useState('');
  const [showAddChecklist, setShowAddChecklist] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description);
      setTemplateId(card.templateId || '');
      setTags(card.tags);
      setChecklist(card.checklist);
      setMode('view');
    } else {
      setTitle('');
      setDescription('');
      setTemplateId('');
      setTags([]);
      setChecklist([]);
      setMode('edit');
    }
    setShowAddChecklist(false);
  }, [card, isOpen]);

  // Template auto-fill for new cards
  useEffect(() => {
    if (!card && templateId) {
      const tmpl = getTemplateById(templateId);
      if (tmpl) {
        if (!title) setTitle(tmpl.prefix);
        setTags((prev) => [...new Set([...prev, ...tmpl.defaultTags])]);
      }
    }
  }, [templateId]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ title: title.trim(), description: description.trim(), templateId: templateId || undefined, tags, checklist, columnId });
    onClose();
  };

  const handleInlineSave = () => {
    if (card && title.trim()) {
      onSave({ ...card, title: title.trim(), description: description.trim(), tags, checklist });
      // Show brief saved indicator
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 1200);
    }
  };

  const toggleTag = (tagName: string) => {
    setTags((prev) => prev.includes(tagName) ? prev.filter((t) => t !== tagName) : [...prev, tagName]);
  };

  const handleToggleChecklistItem = (id: string) => {
    const updated = checklist.map((item) => item.id === id ? { ...item, isCompleted: !item.isCompleted } : item);
    setChecklist(updated);
    if (mode === 'view' && card) {
      onSave({ ...card, checklist: updated });
    }
  };

  const handleRemoveChecklistItem = (id: string) => {
    setChecklist(checklist.filter((item) => item.id !== id));
  };

  const handleAddChecklistItem = () => {
    if (checklistInput.trim()) {
      setChecklist([...checklist, { id: crypto.randomUUID(), text: checklistInput.trim(), isCompleted: false, createdAt: new Date() }]);
      setChecklistInput('');
    }
  };

  const template = templateId ? getTemplateById(templateId) : undefined;
  const completedItems = checklist.filter((item) => item.isCompleted).length;

  // Tag picker — shows all global tags as toggleable colored badges
  const renderTagPicker = () => (
    <div>
      <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">{t('card.tags')}</label>
      <div className="flex flex-wrap gap-2">
        {globalTags.map((td) => {
          const isSelected = tags.includes(td.name);
          return (
            <button
              key={td.id}
              onClick={() => toggleTag(td.name)}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all border-2 ${
                isSelected ? 'border-current' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
              style={{ backgroundColor: hexToRgba(td.color, 0.12) || td.color + '20', color: td.color }}
            >
              {td.name}
            </button>
          );
        })}
      </div>
    </div>
  );

  // VIEW MODE — inline-editable display
  if (mode === 'view' && card) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={() => { handleInlineSave(); onClose(); }}
        title={title || t('card.editCard')}
        size="lg"
        headerColor={template?.color}
        headerContent={
          <div className="flex items-center gap-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleInlineSave}
              className="w-full text-xl font-bold bg-transparent border-0 outline-none focus:bg-[var(--color-input-bg)] focus:ring-2 focus:ring-[var(--color-accent-ring)] rounded-lg px-2 py-1 -mx-2 transition-all card-title-input"
              style={{ color: template?.color || 'var(--color-text-primary)' }}
            />
            <AnimatePresence>
              {showSaved && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1 text-xs text-green-600 whitespace-nowrap flex-shrink-0"
                >
                  <Check size={12} /> {t('common.saved')}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Description — inline editable */}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={handleInlineSave}
            placeholder={t('card.descriptionPlaceholder')}
            className="w-full text-sm text-[var(--color-text-secondary)] leading-relaxed bg-transparent border-0 outline-none focus:bg-[var(--color-input-bg)] focus:ring-2 focus:ring-[var(--color-accent-ring)] rounded-lg px-2 py-1 -mx-2 transition-all resize-none card-description"
            rows={description ? Math.min(description.split('\n').length + 1, 8) : 2}
          />

          {/* Tags — toggle picker */}
          {renderTagPicker()}

          {/* Template badge */}
          {template && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--color-text-tertiary)]">{t('card.template')}:</span>
              <span className="text-xs font-medium px-2 py-1 rounded" style={{ backgroundColor: hexToRgba(template.color, 0.12) || template.color + '20', color: template.color }}>
                {template.prefix} {template.name}
              </span>
            </div>
          )}

          {/* Checklist — interactive with inline add */}
          {(checklist.length > 0 || showAddChecklist) && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckSquare size={16} className="text-[var(--color-text-secondary)]" />
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">
                    {t('card.checklist')} ({completedItems}/{checklist.length})
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                {checklist.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] group">
                    <input
                      type="checkbox"
                      checked={item.isCompleted}
                      onChange={() => handleToggleChecklistItem(item.id)}
                      className="w-4 h-4 text-[var(--color-accent)] rounded"
                    />
                    <span className={`flex-1 text-sm ${item.isCompleted ? 'line-through text-[var(--color-text-tertiary)]' : 'text-[var(--color-text-primary)]'}`}>
                      {item.text}
                    </span>
                    <button
                      onClick={() => { handleRemoveChecklistItem(item.id); handleInlineSave(); }}
                      className="p-1 opacity-0 group-hover:opacity-100 hover:text-red-500 rounded transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add checklist item inline */}
          {showAddChecklist ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={checklistInput}
                onChange={(e) => setChecklistInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { handleAddChecklistItem(); } if (e.key === 'Escape') setShowAddChecklist(false); }}
                placeholder={t('card.addChecklistItem')}
                autoFocus
                className="flex-1 px-3 py-1.5 bg-[var(--color-input-bg)] border border-[var(--color-input-border)] rounded-lg text-[var(--color-text-primary)] text-sm"
              />
              <Button variant="secondary" size="sm" onClick={handleAddChecklistItem}><Plus size={14} /></Button>
              <Button variant="secondary" size="sm" onClick={() => setShowAddChecklist(false)}><X size={14} /></Button>
            </div>
          ) : (
            <button
              onClick={() => setShowAddChecklist(true)}
              className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors flex items-center gap-1"
            >
              <Plus size={12} /> {t('card.addChecklistItem')}
            </button>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={() => setMode('edit')}>
                <Edit size={14} className="mr-1" /> {t('card.edit')}
              </Button>
              {onMoveToNextDay && (
                <Button variant="secondary" size="sm" onClick={() => { handleInlineSave(); onMoveToNextDay(); onClose(); }}>
                  <ArrowRightCircle size={14} className="mr-1" /> {t('card.moveToNextDay')}
                </Button>
              )}
              {onDuplicate && (
                <Button variant="secondary" size="sm" onClick={() => { onDuplicate(); onClose(); }}>
                  <Copy size={14} className="mr-1" /> {t('card.duplicate')}
                </Button>
              )}
            </div>
            {onDelete && (
              <Button variant="danger" size="sm" onClick={() => setShowDeleteConfirm(true)}>
                <Trash2 size={14} className="mr-1" /> {t('card.delete')}
              </Button>
            )}
          </div>

          {/* Delete Confirmation Dialog */}
          <ConfirmDialog
            isOpen={showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(false)}
            onConfirm={() => { onDelete!(); onClose(); }}
            title={t('card.delete')}
            message={t('card.deleteConfirm')}
            confirmLabel={t('card.delete')}
            cancelLabel={t('common.cancel')}
            variant="danger"
          />
        </div>
      </Modal>
    );
  }

  // EDIT MODE — full form
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={card ? t('card.editCard') : t('card.newCard')} size="lg">
      <div className="space-y-4">
        {!card && (
          <Select
            label={t('card.template')}
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            options={[
              { value: '', label: t('card.noTemplate') },
              ...templates.map((tmpl) => ({ value: tmpl.id, label: `${tmpl.prefix} ${tmpl.name}` })),
            ]}
          />
        )}

        <Input label={t('card.title')} required value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('card.titlePlaceholder')} />

        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">{t('card.description')}</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('card.descriptionPlaceholder')}
            className="w-full px-4 py-2 bg-[var(--color-input-bg)] border border-[var(--color-input-border)] rounded-lg text-[var(--color-text-primary)] text-sm focus:bg-[var(--color-input-focus-bg)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-ring)] transition-all duration-200"
            rows={3}
          />
        </div>

        {/* Tag picker */}
        {renderTagPicker()}

        {/* Checklist */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">{t('card.checklist')}</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={checklistInput}
              onChange={(e) => setChecklistInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddChecklistItem()}
              placeholder={t('card.addChecklistItem')}
              className="flex-1 px-4 py-2 bg-[var(--color-input-bg)] border border-[var(--color-input-border)] rounded-lg text-[var(--color-text-primary)] text-sm"
            />
            <Button variant="secondary" size="sm" onClick={handleAddChecklistItem}><Plus size={16} /></Button>
          </div>
          <div className="space-y-2">
            {checklist.map((item) => (
              <div key={item.id} className="flex items-center gap-2 p-2 bg-[var(--color-bg-tertiary)] rounded-lg">
                <input type="checkbox" checked={item.isCompleted} onChange={() => handleToggleChecklistItem(item.id)} className="w-4 h-4 text-[var(--color-accent)] rounded" />
                <span className={`flex-1 text-sm ${item.isCompleted ? 'line-through text-[var(--color-text-tertiary)]' : 'text-[var(--color-text-primary)]'}`}>{item.text}</span>
                <button onClick={() => handleRemoveChecklistItem(item.id)} className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 rounded transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-between pt-4 border-t border-[var(--color-border)]">
          <div>
            {card && <Button variant="secondary" size="sm" onClick={() => setMode('view')}>{t('common.close')}</Button>}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>{t('common.cancel')}</Button>
            <Button variant="primary" onClick={handleSave}>{card ? t('card.saveChanges') : t('card.createCard')}</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
