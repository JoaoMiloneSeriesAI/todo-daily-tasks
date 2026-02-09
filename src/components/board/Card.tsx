import { useState, memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { Card as CardType } from '../../types/card';
import { useSettingsStore } from '../../stores/settingsStore';
import { MoreVertical, CheckSquare, BarChart2, Edit, Trash2, Copy, ArrowRightCircle } from 'lucide-react';
import { Badge } from '../shared';

interface CardProps {
  card: CardType;
  onEdit: (card: CardType) => void;
  onDelete: (cardId: string) => void;
  onDuplicate: (cardId: string) => void;
  onViewStats: (card: CardType) => void;
  onMoveToNextDay?: () => void;
}

export const Card = memo(function Card({ card, onEdit, onDelete, onDuplicate, onViewStats, onMoveToNextDay }: CardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const { getTemplateById } = useSettingsStore();
  const template = card.templateId ? getTemplateById(card.templateId) : undefined;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const completedItems = card.checklist.filter((item) => item.isCompleted).length;
  const totalItems = card.checklist.length;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        bg-[var(--color-surface)] rounded-lg p-4 shadow-sm hover:shadow-md
        border border-[var(--color-border)]
        transition-shadow cursor-grab active:cursor-grabbing
        ${isDragging ? 'opacity-50' : 'opacity-100'}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <h3
          className="font-semibold text-sm flex-1"
          style={{ color: template?.color || 'var(--color-text-primary)' }}
        >
          {template?.prefix}
          {card.title}
        </h3>

        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 hover:bg-[var(--color-surface-hover)] rounded transition-colors"
          >
            <MoreVertical size={16} className="text-[var(--color-text-secondary)]" />
          </button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {showMenu && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                  }}
                />

                {/* Menu */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.1 }}
                  className="absolute right-0 top-8 w-48 bg-[var(--color-surface)] rounded-lg shadow-lg border border-[var(--color-border)] py-1 z-20"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewStats(card);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] flex items-center gap-2"
                  >
                    <BarChart2 size={16} />
                    View Stats
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(card);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] flex items-center gap-2"
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicate(card.id);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] flex items-center gap-2"
                  >
                    <Copy size={16} />
                    Duplicate
                  </button>
                  {onMoveToNextDay && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveToNextDay();
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] flex items-center gap-2"
                    >
                      <ArrowRightCircle size={16} />
                      Move to Next Day
                    </button>
                  )}
                  <div className="border-t border-[var(--color-border)] my-1" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Are you sure you want to delete this card?')) {
                        onDelete(card.id);
                      }
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    Delete
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

      {/* Tags */}
      {card.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {card.tags.map((tag) => (
            <Badge key={tag} variant="default" size="sm">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Checklist Progress */}
      {totalItems > 0 && (
        <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
          <CheckSquare size={14} />
          <span className="font-medium">
            {completedItems}/{totalItems}
          </span>
          <div className="flex-1 h-1.5 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{
                width: `${totalItems > 0 ? (completedItems / totalItems) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
});
