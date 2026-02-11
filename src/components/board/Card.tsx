import { useState, useRef, memo, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
// framer-motion removed from menu — portal uses plain div for reliable clicks
import { Card as CardType } from '../../types/card';
import { useSettingsStore } from '../../stores/settingsStore';
import { MoreVertical, CheckSquare, BarChart2, Edit, Trash2, Copy, ArrowRightCircle, ArrowLeftCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { renderFormattedDescription } from '../../utils/richText';

interface CardProps {
  card: CardType;
  onEdit: (card: CardType) => void;
  onDelete: (cardId: string) => void;
  onDuplicate: (cardId: string) => void;
  onViewStats: (card: CardType) => void;
  onMoveToNextDay?: () => void;
  onMoveToPreviousDay?: () => void;
}

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

export const Card = memo(function Card({ card, onEdit, onDelete, onDuplicate, onViewStats, onMoveToNextDay, onMoveToPreviousDay }: CardProps) {
  const { t } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const menuBtnRef = useRef<HTMLButtonElement>(null);

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
    touchAction: 'none' as const, // Prevents browser from hijacking touch for scroll — required for dnd-kit on mobile
  };

  const completedItems = card.checklist.filter((item) => item.isCompleted).length;
  const totalItems = card.checklist.length;

  // Memoized tag color lookup map for O(1) access
  const tagColorMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const td of tagDefs) {
      if (td.name && td.color) map.set(td.name, td.color);
    }
    return map;
  }, [tagDefs]);

  // Track pointer for reliable click detection that works alongside dnd-kit.
  // dnd-kit's PointerSensor blocks native `click` events after a drag via a
  // document-level capture listener. By detecting taps via pointerdown/pointerup
  // we bypass that entirely.
  const pointerStart = useRef<{ x: number; y: number; time: number } | null>(null);

  const handleCardPointerDown = (e: React.PointerEvent) => {
    pointerStart.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    // Forward to dnd-kit's handler so drag still works
    if (listeners?.onPointerDown) {
      (listeners as Record<string, (e: React.PointerEvent) => void>).onPointerDown(e);
    }
  };

  const handleCardPointerUp = (e: React.PointerEvent) => {
    if (!pointerStart.current || isDragging) {
      pointerStart.current = null;
      return;
    }
    const dx = e.clientX - pointerStart.current.x;
    const dy = e.clientY - pointerStart.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const elapsed = Date.now() - pointerStart.current.time;
    pointerStart.current = null;

    // Short tap with minimal movement → treat as click
    if (distance < 5 && elapsed < 500 && !showMenu) {
      onEdit(card);
    }
  };

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (menuBtnRef.current) {
      const rect = menuBtnRef.current.getBoundingClientRect();
      const menuHeight = 320; // approximate max height of the menu
      const spaceBelow = window.innerHeight - rect.bottom;
      const top = spaceBelow < menuHeight
        ? Math.max(8, rect.top - menuHeight - 4) // flip above, clamp to top edge
        : rect.bottom + 4;
      setMenuPos({
        top,
        left: Math.min(rect.right - 192, window.innerWidth - 200),
      });
    }
    setShowMenu((prev) => !prev);
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        // Override pointer handlers for tap-vs-drag detection (desktop);
        // onTouchStart from the spread above remains for TouchSensor (mobile)
        onPointerDown={handleCardPointerDown}
        onPointerUp={handleCardPointerUp}
        className={`
          bg-[var(--color-surface)] rounded-lg shadow-sm overflow-hidden
          border border-[var(--color-border)]
          transition-shadow duration-150
          cursor-pointer
          hover:shadow-md
          ${isDragging ? 'opacity-50 shadow-lg rotate-2' : 'opacity-100'}
        `}
      >
        {/* Color bar — card color overrides template color */}
        {(card.color || template?.color) && (
          <div
            className="h-2 w-full"
            style={{ backgroundColor: card.color || template?.color }}
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
                onPointerDown={(e) => {
                  e.stopPropagation(); // Prevent dnd-kit PointerSensor drag activation
                  pointerStart.current = null; // Prevent card tap detection
                }}
                onTouchStart={(e) => {
                  e.stopPropagation(); // Prevent dnd-kit TouchSensor drag activation on mobile
                }}
                onClick={handleMenuToggle}
                className="p-1 hover:bg-[var(--color-surface-hover)] rounded transition-colors"
              >
                <MoreVertical size={16} className="text-[var(--color-text-secondary)]" />
              </button>
            </div>
          </div>

          {/* Description — rendered with formatting and clickable links */}
          {card.description && (
            <div className="text-xs text-[var(--color-text-secondary)] mb-3 line-clamp-2">
              {renderFormattedDescription(card.description)}
            </div>
          )}

          {/* Tags — with colors from global tag definitions */}
          {card.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {card.tags.map((tag) => {
                const color = tagColorMap.get(tag);
                return (
                  <span
                    key={tag}
                    className="px-2 py-0.5 text-xs font-semibold rounded-full"
                    style={color ? { backgroundColor: hexToRgba(color, 0.12), color: color } : undefined}
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
              <div className="flex-1 h-1.5 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden" role="progressbar" aria-valuenow={completedItems} aria-valuemin={0} aria-valuemax={totalItems} aria-label={t('common.checklistProgress')}>
                <div
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{ width: `${totalItems > 0 ? (completedItems / totalItems) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Menu rendered via portal to escape card's transform stacking context */}
      {showMenu && createPortal(
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div
            className="fixed w-48 bg-[var(--color-surface)] rounded-lg shadow-xl border border-[var(--color-border)] py-1 z-50"
            style={{ top: menuPos.top, left: menuPos.left }}
          >
            <button onClick={() => { onViewStats(card); setShowMenu(false); }}
              className="w-full px-4 py-2 text-left text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] flex items-center gap-2">
              <BarChart2 size={16} /> {t('card.viewStats')}
            </button>
            <button onClick={() => { onEdit(card); setShowMenu(false); }}
              className="w-full px-4 py-2 text-left text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] flex items-center gap-2">
              <Edit size={16} /> {t('card.edit')}
            </button>
            <button onClick={() => { onDuplicate(card.id); setShowMenu(false); }}
              className="w-full px-4 py-2 text-left text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] flex items-center gap-2">
              <Copy size={16} /> {t('card.duplicate')}
            </button>
            {onMoveToNextDay && (
              <button onClick={() => { onMoveToNextDay(); setShowMenu(false); }}
                className="w-full px-4 py-2 text-left text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] flex items-center gap-2">
                <ArrowRightCircle size={16} /> {t('card.moveToNextDay')}
              </button>
            )}
            {onMoveToPreviousDay && (
              <button onClick={() => { onMoveToPreviousDay(); setShowMenu(false); }}
                className="w-full px-4 py-2 text-left text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] flex items-center gap-2">
                <ArrowLeftCircle size={16} /> {t('card.moveToPreviousDay')}
              </button>
            )}
            <div className="border-t border-[var(--color-border)] my-1" />
            <button onClick={() => {
              setShowMenu(false);
              setShowDeleteConfirm(true);
            }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
              <Trash2 size={16} /> {t('card.delete')}
            </button>
          </div>
        </>,
        document.body
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => onDelete(card.id)}
        title={t('card.delete')}
        message={t('card.deleteConfirm')}
        confirmLabel={t('card.delete')}
        cancelLabel={t('common.cancel')}
        variant="danger"
      />
    </>
  );
});
