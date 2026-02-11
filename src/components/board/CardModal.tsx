import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { Modal, Input, Select, Button, ConfirmDialog } from '../shared';
import { Card, ChecklistItem } from '../../types/card';
import { useSettingsStore } from '../../stores/settingsStore';
import { X, Plus, Trash2, ArrowRightCircle, ArrowLeftCircle, Copy, CheckSquare, Check, Palette, Bold, Italic, Underline, Strikethrough, List, Code, Braces } from 'lucide-react';
import { wrapSelection, insertBullet, insertCodeBlock, modKey, renderFormattedDescription, getActiveFormats, handleMarkerDeletion } from '../../utils/richText';
import { RichTextEditor } from './RichTextEditor';
import { Tooltip } from '../shared/Tooltip';

/// <summary>
/// Converts a hex color to an rgba string with a given alpha.
/// </summary>
function hexToRgba(hex: string | null | undefined, alpha: number): string | undefined {
  if (!hex || !/^#[0-9A-Fa-f]{6}$/.test(hex)) return undefined;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const COLOR_PALETTE = [
  '#6366F1', '#EC4899', '#14B8A6', '#F59E0B',
  '#8B5CF6', '#10B981', '#EF4444', '#3B82F6',
];

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cardData: Partial<Card>) => void;
  card?: Card;
  columnId: string;
  onMoveToNextDay?: () => void;
  onMoveToPreviousDay?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
}

export function CardModal({ isOpen, onClose, onSave, card, columnId, onMoveToNextDay, onMoveToPreviousDay, onDuplicate, onDelete }: CardModalProps) {
  const { t } = useTranslation();
  const { templates, getTemplateById, settings } = useSettingsStore();
  const globalTags = settings.tags || [];
  const isMobileView = typeof window !== 'undefined' && window.innerWidth < 768;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [checklistInput, setChecklistInput] = useState('');
  const [showAddChecklist, setShowAddChecklist] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [cardColor, setCardColor] = useState<string>('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  // Preview color for view mode: tracks live preview while picker is open
  const [previewColor, setPreviewColor] = useState<string | null>(null);
  // Description read/edit toggle for view mode (links are clickable in read mode)
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  // Tracks cursor position for toolbar active state highlighting
  const [cursorPos, setCursorPos] = useState(0);
  const activeFormats = description ? getActiveFormats(description, cursorPos) : new Set<string>();

  // Update cursor position on selection/key/click events
  const updateCursorPos = useCallback(() => {
    if (descriptionRef.current) {
      setCursorPos(descriptionRef.current.selectionStart);
    }
  }, []);

  type FormatType = 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code' | 'codeblock' | 'bullet';

  // Formatting toolbar action: wraps selection and updates description
  const applyFormat = useCallback((type: FormatType) => {
    const ta = descriptionRef.current;
    if (!ta) return;
    let result: { newText: string; cursorPos: number };
    switch (type) {
      case 'bold':
        result = wrapSelection(ta, description, '*', '*');
        break;
      case 'italic':
        result = wrapSelection(ta, description, '_', '_');
        break;
      case 'underline':
        result = wrapSelection(ta, description, '~', '~');
        break;
      case 'strikethrough':
        result = wrapSelection(ta, description, '~~', '~~');
        break;
      case 'code':
        result = wrapSelection(ta, description, '`', '`');
        break;
      case 'codeblock':
        result = insertCodeBlock(ta, description);
        break;
      case 'bullet':
        result = insertBullet(ta, description);
        break;
    }
    setDescription(result.newText);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(result.cursorPos, result.cursorPos);
      setCursorPos(result.cursorPos);
    });
  }, [description]);

  // Keyboard shortcut handler for the description textarea
  const handleDescriptionKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Marker protection: intercept Backspace/Delete near formatting markers
    if (e.key === 'Backspace' || e.key === 'Delete') {
      const ta = descriptionRef.current;
      if (ta && ta.selectionStart === ta.selectionEnd) {
        const result = handleMarkerDeletion(description, ta.selectionStart, e.key === 'Backspace');
        if (result) {
          e.preventDefault();
          setDescription(result.newText);
          requestAnimationFrame(() => {
            ta.focus();
            ta.setSelectionRange(result.cursorPos, result.cursorPos);
            setCursorPos(result.cursorPos);
          });
          return;
        }
      }
    }

    // Formatting shortcuts
    const mod = e.metaKey || e.ctrlKey;
    if (!mod) return;
    if (e.key === 'b') { e.preventDefault(); applyFormat('bold'); }
    else if (e.key === 'i') { e.preventDefault(); applyFormat('italic'); }
    else if (e.key === 'u') { e.preventDefault(); applyFormat('underline'); }
    else if (e.key === 'e') { e.preventDefault(); applyFormat('code'); }
    else if (e.key === 's') { e.preventDefault(); applyFormat('strikethrough'); }
  }, [applyFormat, description]);

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description);
      setTemplateId(card.templateId || '');
      setTags(card.tags);
      setChecklist(card.checklist);
      setCardColor(card.color || '');
    } else {
      setTitle('');
      setDescription('');
      setTemplateId('');
      setTags([]);
      setChecklist([]);
      setCardColor('');
    }
    setShowAddChecklist(false);
    setShowColorPicker(false);
    setPreviewColor(null);
    setIsEditingDescription(false);
  }, [card, isOpen]);

  // Template auto-fill for new cards
  useEffect(() => {
    if (!card && templateId) {
      const tmpl = getTemplateById(templateId);
      if (tmpl) {
        if (!title) setTitle(tmpl.prefix);
        setTags((prev) => [...new Set([...prev, ...tmpl.defaultTags])]);
        setCardColor(tmpl.color);
      }
    }
  }, [templateId]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      description: description.trim(),
      templateId: templateId || undefined,
      tags,
      checklist,
      columnId,
      color: cardColor || undefined,
    });
    onClose();
  };

  const handleInlineSave = () => {
    if (card && title.trim()) {
      onSave({ ...card, title: title.trim(), description: description.trim(), tags, checklist, color: cardColor || undefined });
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 1200);
    }
  };

  const toggleTag = (tagName: string) => {
    setTags((prev) => prev.includes(tagName) ? prev.filter((tg) => tg !== tagName) : [...prev, tagName]);
  };

  const handleToggleChecklistItem = (id: string) => {
    const updated = checklist.map((item) => item.id === id ? { ...item, isCompleted: !item.isCompleted } : item);
    setChecklist(updated);
    if (card) {
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

  // View mode color picker: confirm commits, cancel reverts
  const handleColorConfirm = () => {
    if (previewColor !== null) {
      setCardColor(previewColor);
      if (card) {
        onSave({ ...card, color: previewColor || undefined });
        setShowSaved(true);
        setTimeout(() => setShowSaved(false), 1200);
      }
    }
    setPreviewColor(null);
    setShowColorPicker(false);
  };

  const handleColorCancel = () => {
    setPreviewColor(null);
    setShowColorPicker(false);
  };

  const template = templateId ? getTemplateById(templateId) : undefined;
  const completedItems = checklist.filter((item) => item.isCompleted).length;
  // In view mode when picker is open, show the preview color; otherwise show committed color
  const effectiveColor = (showColorPicker && previewColor !== null) ? (previewColor || template?.color) : (cardColor || template?.color);

  // Color picker swatches — selectedColor controls which swatch is highlighted
  const renderColorSwatches = (selectedColor: string, onSelect: (color: string) => void) => (
    <div className="flex flex-wrap gap-2 items-center">
      <button
        onClick={() => onSelect('')}
        className={`w-7 h-7 rounded-lg border-2 transition-all flex items-center justify-center ${!selectedColor ? 'border-[var(--color-text-primary)] scale-110' : 'border-[var(--color-border)] hover:scale-105'}`}
        title={t('card.noColor')}
      >
        <X size={12} className="text-[var(--color-text-tertiary)]" />
      </button>
      {COLOR_PALETTE.map((color) => (
        <button
          key={color}
          onClick={() => onSelect(color)}
          className={`w-7 h-7 rounded-lg transition-all ${selectedColor === color ? 'ring-2 ring-offset-2 ring-[var(--color-accent)] scale-110' : 'hover:scale-105'}`}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );

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
              onClick={() => { toggleTag(td.name); if (card) handleInlineSave(); }}
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

  // VIEW MODE — inline-editable display (for existing cards)
  if (card) {
    const pickerColor = previewColor !== null ? previewColor : cardColor;

    return (
      <Modal
        isOpen={isOpen}
        onClose={() => { handleInlineSave(); onClose(); }}
        title={title || t('card.editCard')}
        size="lg"
        fullScreen={isMobileView}
        headerColor={effectiveColor}
        headerContent={
          <div className="flex items-center gap-2">
            {/* Color dot — click to toggle color picker */}
            <button
              onClick={() => {
                if (showColorPicker) {
                  handleColorCancel();
                } else {
                  setPreviewColor(cardColor);
                  setShowColorPicker(true);
                }
              }}
              className="w-6 h-6 rounded-full border-2 border-[var(--color-border)] flex-shrink-0 hover:scale-110 transition-all"
              style={{ backgroundColor: effectiveColor || 'var(--color-bg-tertiary)' }}
              title={t('card.color')}
            >
              {!effectiveColor && <Palette size={12} className="text-[var(--color-text-tertiary)] mx-auto" />}
            </button>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleInlineSave}
              className="w-full text-xl font-bold bg-transparent border-0 outline-none focus:bg-[var(--color-input-bg)] focus:ring-2 focus:ring-[var(--color-accent-ring)] rounded-lg px-2 py-1 -mx-2 transition-all card-title-input"
              style={{ color: effectiveColor || 'var(--color-text-primary)' }}
            />
            <AnimatePresence>
              {showSaved && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1 text-xs text-green-600 whitespace-nowrap flex-shrink-0">
                  <Check size={12} /> {t('common.saved')}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        }
      >
        <div className="space-y-4 min-h-[400px]">
          {/* Inline color picker with Confirm/Cancel */}
          {showColorPicker && (
            <div className="p-3 bg-[var(--color-bg-tertiary)] rounded-lg space-y-3">
              <label className="block text-xs font-medium text-[var(--color-text-secondary)]">{t('card.color')}</label>
              {renderColorSwatches(pickerColor, (color) => setPreviewColor(color))}
              <div className="flex gap-2 pt-1">
                <Button variant="primary" size="sm" onClick={handleColorConfirm}>
                  <Check size={14} className="mr-1" /> {t('card.colorConfirm')}
                </Button>
                <Button variant="secondary" size="sm" onClick={handleColorCancel}>
                  {t('card.colorCancel')}
                </Button>
              </div>
            </div>
          )}

          {/* Description — read mode shows formatted text with links, click to edit */}
          {isEditingDescription ? (
            <div>
              {/* Formatting toolbar — onMouseDown preventDefault keeps textarea focused */}
              <div className="flex items-center gap-0.5 mb-1 px-1">
                {([
                  { format: 'bold' as FormatType, icon: Bold, tip: `Bold (${modKey()}+B)`, key: 'bold' },
                  { format: 'italic' as FormatType, icon: Italic, tip: `Italic (${modKey()}+I)`, key: 'italic' },
                  { format: 'underline' as FormatType, icon: Underline, tip: `Underline (${modKey()}+U)`, key: 'underline' },
                  { format: 'strikethrough' as FormatType, icon: Strikethrough, tip: `Strikethrough (${modKey()}+S)`, key: 'strikethrough' },
                ] as const).map(({ format, icon: Icon, tip, key }) => (
                  <Tooltip key={key} text={tip}>
                    <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyFormat(format)}
                      className={`p-1.5 rounded transition-colors ${
                        activeFormats.has(key)
                          ? 'bg-[var(--color-accent-light)] text-[var(--color-accent)]'
                          : 'hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                      }`}>
                      <Icon size={14} />
                    </button>
                  </Tooltip>
                ))}
                <div className="w-px h-4 bg-[var(--color-border)] mx-0.5" />
                <Tooltip text={`Code (${modKey()}+E)`}>
                  <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyFormat('code')}
                    className={`p-1.5 rounded transition-colors ${
                      activeFormats.has('code')
                        ? 'bg-[var(--color-accent-light)] text-[var(--color-accent)]'
                        : 'hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                    }`}>
                    <Code size={14} />
                  </button>
                </Tooltip>
                <Tooltip text="Code Block">
                  <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyFormat('codeblock')}
                    className="p-1.5 rounded hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
                    <Braces size={14} />
                  </button>
                </Tooltip>
                <div className="w-px h-4 bg-[var(--color-border)] mx-0.5" />
                <Tooltip text="Bullet List">
                  <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyFormat('bullet')}
                    className="p-1.5 rounded hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
                    <List size={14} />
                  </button>
                </Tooltip>
              </div>
              <RichTextEditor
                value={description}
                onChange={(val) => { setDescription(val); }}
                onBlur={() => { handleInlineSave(); setIsEditingDescription(false); }}
                placeholder={t('card.descriptionPlaceholder')}
                textareaRef={descriptionRef}
                onKeyDown={handleDescriptionKeyDown}
                onCursorChange={updateCursorPos}
                autoFocus
                rows={6}
              />
            </div>
          ) : (
            <div
              onClick={() => setIsEditingDescription(true)}
              className="w-full text-sm leading-relaxed rounded-lg px-2 py-1 -mx-2 cursor-text hover:bg-[var(--color-input-bg)] transition-all"
            >
              {description ? (
                <div className="text-[var(--color-text-secondary)]">{renderFormattedDescription(description)}</div>
              ) : (
                <span className="text-[var(--color-text-tertiary)]">{t('card.descriptionPlaceholder')}</span>
              )}
            </div>
          )}

          {/* Tags — toggle picker */}
          {renderTagPicker()}

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
                    <input type="checkbox" checked={item.isCompleted} onChange={() => handleToggleChecklistItem(item.id)} className="w-4 h-4 text-[var(--color-accent)] rounded" />
                    <span className={`flex-1 text-sm ${item.isCompleted ? 'line-through text-[var(--color-text-tertiary)]' : 'text-[var(--color-text-primary)]'}`}>{item.text}</span>
                    <button onClick={() => { handleRemoveChecklistItem(item.id); handleInlineSave(); }} className="p-1 opacity-0 group-hover:opacity-100 hover:text-red-500 rounded transition-all"><Trash2 size={12} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add checklist item inline */}
          {showAddChecklist ? (
            <div className="flex gap-2">
              <input type="text" value={checklistInput} onChange={(e) => setChecklistInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddChecklistItem(); if (e.key === 'Escape') setShowAddChecklist(false); }}
                placeholder={t('card.addChecklistItem')} autoFocus
                className="flex-1 px-3 py-1.5 bg-[var(--color-input-bg)] border border-[var(--color-input-border)] rounded-lg text-[var(--color-text-primary)] text-sm" />
              <Button variant="secondary" size="sm" onClick={handleAddChecklistItem}><Plus size={14} /></Button>
              <Button variant="secondary" size="sm" onClick={() => setShowAddChecklist(false)}><X size={14} /></Button>
            </div>
          ) : (
            <button onClick={() => setShowAddChecklist(true)} className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors flex items-center gap-1">
              <Plus size={12} /> {t('card.addChecklistItem')}
            </button>
          )}

          {/* Actions -- 2-column grid layout */}
          <div className="grid grid-cols-2 gap-2 pt-4 border-t border-[var(--color-border)]">
            {onMoveToPreviousDay && (
              <Button variant="secondary" size="sm" onClick={() => { handleInlineSave(); onMoveToPreviousDay(); onClose(); }} className="w-full justify-center">
                <ArrowLeftCircle size={14} className="mr-1.5" /> {t('common.previous')}
              </Button>
            )}
            {onMoveToNextDay && (
              <Button variant="secondary" size="sm" onClick={() => { handleInlineSave(); onMoveToNextDay(); onClose(); }} className="w-full justify-center">
                <ArrowRightCircle size={14} className="mr-1.5" /> {t('common.next')}
              </Button>
            )}
            {onDuplicate && (
              <Button variant="secondary" size="sm" onClick={() => { onDuplicate(); onClose(); }} className="w-full justify-center">
                <Copy size={14} className="mr-1.5" /> {t('card.duplicate')}
              </Button>
            )}
            {onDelete && (
              <Button variant="danger" size="sm" onClick={() => setShowDeleteConfirm(true)} className="w-full justify-center">
                <Trash2 size={14} className="mr-1.5" /> {t('card.delete')}
              </Button>
            )}
          </div>

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

  // CREATE MODE — full form (only for new cards)
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('card.newCard')} size="lg" fullScreen={isMobileView} headerColor={effectiveColor}>
      <div className="space-y-4 min-h-[400px]">
        {/* Live card preview */}
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-tertiary)] mb-2">{t('card.preview')}</label>
          <div className="bg-[var(--color-surface)] rounded-lg shadow-sm border border-[var(--color-border)] overflow-hidden max-w-[250px]">
            {effectiveColor && <div className="h-2 w-full" style={{ backgroundColor: effectiveColor }} />}
            <div className="p-3">
              <p className="font-semibold text-sm text-[var(--color-text-primary)] truncate">
                {title || t('card.titlePlaceholder')}
              </p>
              {description && (
                <p className="text-xs text-[var(--color-text-secondary)] mt-1 truncate">{description}</p>
              )}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {tags.slice(0, 3).map((tag) => {
                    const td = globalTags.find((g) => g.name === tag);
                    return (
                      <span key={tag} className="px-1.5 py-0.5 text-[9px] font-semibold rounded-full"
                        style={td ? { backgroundColor: hexToRgba(td.color, 0.12), color: td.color } : undefined}>
                        {tag}
                      </span>
                    );
                  })}
                  {tags.length > 3 && <span className="text-[9px] text-[var(--color-text-tertiary)]">+{tags.length - 3}</span>}
                </div>
              )}
            </div>
          </div>
        </div>

        <Select
          label={t('card.template')}
          value={templateId}
          onChange={(e) => setTemplateId(e.target.value)}
          options={[
            { value: '', label: t('card.noTemplate') },
            ...templates.map((tmpl) => ({ value: tmpl.id, label: `${tmpl.prefix} ${tmpl.name}` })),
          ]}
        />

        <Input label={t('card.title')} required value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('card.titlePlaceholder')} />

        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">{t('card.description')}</label>
          {/* Formatting toolbar — onMouseDown preventDefault keeps textarea focused */}
          <div className="flex items-center gap-0.5 mb-1">
            {([
              { format: 'bold' as FormatType, icon: Bold, tip: `Bold (${modKey()}+B)`, key: 'bold' },
              { format: 'italic' as FormatType, icon: Italic, tip: `Italic (${modKey()}+I)`, key: 'italic' },
              { format: 'underline' as FormatType, icon: Underline, tip: `Underline (${modKey()}+U)`, key: 'underline' },
              { format: 'strikethrough' as FormatType, icon: Strikethrough, tip: `Strikethrough (${modKey()}+S)`, key: 'strikethrough' },
            ] as const).map(({ format, icon: Icon, tip, key }) => (
              <Tooltip key={key} text={tip}>
                <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyFormat(format)}
                  className={`p-1.5 rounded transition-colors ${
                    activeFormats.has(key)
                      ? 'bg-[var(--color-accent-light)] text-[var(--color-accent)]'
                      : 'hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                  }`}>
                  <Icon size={14} />
                </button>
              </Tooltip>
            ))}
            <div className="w-px h-4 bg-[var(--color-border)] mx-0.5" />
            <Tooltip text={`Code (${modKey()}+E)`}>
              <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyFormat('code')}
                className={`p-1.5 rounded transition-colors ${
                  activeFormats.has('code')
                    ? 'bg-[var(--color-accent-light)] text-[var(--color-accent)]'
                    : 'hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                }`}>
                <Code size={14} />
              </button>
            </Tooltip>
            <Tooltip text="Code Block">
              <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyFormat('codeblock')}
                className="p-1.5 rounded hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
                <Braces size={14} />
              </button>
            </Tooltip>
            <div className="w-px h-4 bg-[var(--color-border)] mx-0.5" />
            <Tooltip text="Bullet List">
              <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyFormat('bullet')}
                className="p-1.5 rounded hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
                <List size={14} />
              </button>
            </Tooltip>
          </div>
          <RichTextEditor
            value={description}
            onChange={(val) => { setDescription(val); }}
            placeholder={t('card.descriptionPlaceholder')}
            textareaRef={descriptionRef}
            onKeyDown={handleDescriptionKeyDown}
            onCursorChange={updateCursorPos}
            rows={6}
          />
        </div>

        {/* Card color picker */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">{t('card.color')}</label>
          {renderColorSwatches(cardColor, (color) => setCardColor(color))}
        </div>

        {/* Tag picker */}
        {renderTagPicker()}

        {/* Checklist */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">{t('card.checklist')}</label>
          <div className="flex gap-2 mb-2">
            <input type="text" value={checklistInput} onChange={(e) => setChecklistInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddChecklistItem()}
              placeholder={t('card.addChecklistItem')}
              className="flex-1 px-4 py-2 bg-[var(--color-input-bg)] border border-[var(--color-input-border)] rounded-lg text-[var(--color-text-primary)] text-sm" />
            <Button variant="secondary" size="sm" onClick={handleAddChecklistItem}><Plus size={16} /></Button>
          </div>
          <div className="space-y-2">
            {checklist.map((item) => (
              <div key={item.id} className="flex items-center gap-2 p-2 bg-[var(--color-bg-tertiary)] rounded-lg">
                <input type="checkbox" checked={item.isCompleted} onChange={() => handleToggleChecklistItem(item.id)} className="w-4 h-4 text-[var(--color-accent)] rounded" />
                <span className={`flex-1 text-sm ${item.isCompleted ? 'line-through text-[var(--color-text-tertiary)]' : 'text-[var(--color-text-primary)]'}`}>{item.text}</span>
                <button onClick={() => handleRemoveChecklistItem(item.id)} className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 rounded transition-colors"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end pt-4 border-t border-[var(--color-border)]">
          <Button variant="secondary" onClick={onClose}>{t('common.cancel')}</Button>
          <Button variant="primary" onClick={handleSave}>{t('card.createCard')}</Button>
        </div>
      </div>
    </Modal>
  );
}
