import { useState, useRef, memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AnimatePresence, motion } from 'framer-motion';
import { Card as CardType } from '../../types/card';
import { useSettingsStore } from '../../stores/settingsStore';
import { MoreVertical, CheckSquare, BarChart2, Edit, Trash2, Copy, ArrowRightCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CardProps {
  card: CardType;
  onEdit: (card: CardType) => void;
  onDelete: (cardId: string) => void;
  onDuplicate: (cardId: string) => void;
  onViewStats: (card: CardType) => void;
  onMoveToNextDay?: () => void;
}

export const Card = memo(function Card({ card, onEdit, onDelete, onDuplicate, onViewStats, onMoveToNextDay }: CardProps) {
  const { t } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const ignoreNextClick = useRef(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const { getTemplateById, settings } = useSettingsStore();
  const template = card.templateId ? getTemplateById(card.templateId) : undefined;
  const tagDefs = (settings as any).tags || [];

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const completedItems = card.checklist.filter((item) => item.isCompleted).length;
  const totalItems = card.checklist.length;

  const getTagColor = (tagName: string): string | null => {
    const def = tagDefs.find((td: any) => td.name === tagName);
    return def?.color || null;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => {
        if (ignoreNextClick.current) {
          ignoreNextClick.current = false;
          return;
        }
        if (!isDragging && !showMenu) {
          onEdit(card);
        }
      }}
      className={`
        bg-[var(--color-surface)] rounded-lg shadow-sm overflow-hidden
        border border-[var(--color-border)]
        transition-shadow duration-150
        cursor-pointer
        hover:shadow-md
        ${isDragging ? 'opacity-50 shadow-lg rotate-2' : 'opacity-100'}
      `}
    >
      {/* Template color bar — Trello style */}
      {template && (
        <div
          className="h-2 w-full"
          style={{ backgroundColor: template.color }}
        />
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <h3
            className="font-semibold text-sm flex-1 text-[var(--color-text-primary)]"
          >
            {template?.prefix}
            {card.title}
          </h3>

          <div className="relative">
            <button
              ref={menuBtnRef}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                ignoreNextClick.current = true;
                // Compute fixed position from button's viewport rect
                if (menuBtnRef.current) {
                  const rect = menuBtnRef.current.getBoundingClientRect();
                  setMenuPos({
                    top: rect.bottom + 4,
                    left: Math.min(rect.right - 192, window.innerWidth - 200),
                  });
                }
                setShowMenu(!showMenu);
              }}
              className="p-1 hover:bg-[var(--color-surface-hover)] rounded transition-colors"
            >
              <MoreVertical size={16} className="text-[var(--color-text-secondary)]" />
            </button>

            <AnimatePresence>
              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={(e) => { e.stopPropagation(); ignoreNextClick.current = true; setShowMenu(false); }}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.1 }}
                    className="fixed w-48 bg-[var(--color-surface)] rounded-lg shadow-xl border border-[var(--color-border)] py-1 z-50"
                    style={{ top: menuPos.top, left: menuPos.left }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button onClick={(e) => { e.stopPropagation(); onViewStats(card); setShowMenu(false); }}
                      className="w-full px-4 py-2 text-left text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] flex items-center gap-2">
                      <BarChart2 size={16} /> {t('card.viewStats')}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onEdit(card); setShowMenu(false); }}
                      className="w-full px-4 py-2 text-left text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] flex items-center gap-2">
                      <Edit size={16} /> {t('card.edit')}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onDuplicate(card.id); setShowMenu(false); }}
                      className="w-full px-4 py-2 text-left text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] flex items-center gap-2">
                      <Copy size={16} /> {t('card.duplicate')}
                    </button>
                    {onMoveToNextDay && (
                      <button onClick={(e) => { e.stopPropagation(); onMoveToNextDay(); setShowMenu(false); }}
                        className="w-full px-4 py-2 text-left text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] flex items-center gap-2">
                        <ArrowRightCircle size={16} /> {t('card.moveToNextDay')}
                      </button>
                    )}
                    <div className="border-t border-[var(--color-border)] my-1" />
                    <button onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(t('card.deleteConfirm'))) onDelete(card.id);
                      setShowMenu(false);
                    }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                      <Trash2 size={16} /> {t('card.delete')}
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Description */}
        {card.description && (
          <p className="text-xs text-[var(--color-text-secondary)] mb-3 line-clamp-2">
            {card.description}
          </p>
        )}

        {/* Tags — with colors from global tag definitions */}
        {card.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {card.tags.map((tag) => {
              const color = getTagColor(tag);
              return (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-xs font-semibold rounded-full"
                  style={color ? { backgroundColor: color + '20', color: color } : undefined}
                >
                  {tag}
                </span>
              );
            })}
          </div>
        )}

        {/* Checklist Progress */}
        {totalItems > 0 && (
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
            <CheckSquare size={14} />
            <span className="font-medium">{completedItems}/{totalItems}</span>
            <div className="flex-1 h-1.5 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${totalItems > 0 ? (completedItems / totalItems) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
