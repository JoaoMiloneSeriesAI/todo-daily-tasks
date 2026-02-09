import { useState, memo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Column as ColumnType } from '../../types/column';
import { Card as CardType } from '../../types/card';
import { Card } from './Card';
import { Plus, Trash2, Check, X } from 'lucide-react';
import { Badge } from '../shared';

interface ColumnProps {
  column: ColumnType;
  cards: CardType[];
  onAddCard: () => void;
  onEditCard: (card: CardType) => void;
  onDeleteCard: (cardId: string) => void;
  onDuplicateCard: (cardId: string) => void;
  onViewStats: (card: CardType) => void;
  onRenameColumn?: (name: string) => void;
  onDeleteColumn?: () => void;
  onMoveCardToNextDay?: (cardId: string) => void;
}

export const Column = memo(function Column({
  column,
  cards,
  onAddCard,
  onEditCard,
  onDeleteCard,
  onDuplicateCard,
  onViewStats,
  onRenameColumn,
  onDeleteColumn,
  onMoveCardToNextDay,
}: ColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(column.name);

  const handleDoubleClick = () => {
    if (column.isStatic || !onRenameColumn) return;
    setEditName(column.name);
    setIsEditing(true);
  };

  const handleSaveRename = () => {
    if (editName.trim() && onRenameColumn) {
      onRenameColumn(editName.trim());
    }
    setIsEditing(false);
  };

  const handleCancelRename = () => {
    setEditName(column.name);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col w-80 bg-[var(--color-bg-tertiary)] rounded-lg p-4 h-full">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isEditing ? (
            <div className="flex items-center gap-1 flex-1">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveRename();
                  if (e.key === 'Escape') handleCancelRename();
                }}
                autoFocus
                className="flex-1 px-2 py-1 text-sm font-semibold bg-[var(--color-input-bg)] border border-[var(--color-input-border)] rounded text-[var(--color-text-primary)]"
              />
              <button onClick={handleSaveRename} className="p-1 hover:bg-green-100 dark:hover:bg-green-900/30 rounded transition-colors">
                <Check size={14} className="text-green-600" />
              </button>
              <button onClick={handleCancelRename} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors">
                <X size={14} className="text-red-600" />
              </button>
            </div>
          ) : (
            <h3
              className={`font-semibold text-sm text-[var(--color-text-primary)] truncate ${!column.isStatic ? 'cursor-pointer' : ''}`}
              onDoubleClick={handleDoubleClick}
              title={!column.isStatic ? 'Double-click to rename' : undefined}
            >
              {column.name}
            </h3>
          )}
          <Badge variant="default" size="sm">
            {cards.length}
          </Badge>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onAddCard}
            className="p-1.5 hover:bg-[var(--color-surface-active)] rounded transition-colors"
            title="Add card"
          >
            <Plus size={16} className="text-[var(--color-text-secondary)]" />
          </button>

          {!column.isStatic && onDeleteColumn && (
            <button
              onClick={onDeleteColumn}
              className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
              title="Delete column"
            >
              <Trash2 size={16} className="text-[var(--color-text-secondary)] hover:text-red-600" />
            </button>
          )}
        </div>
      </div>

      {/* Cards Container */}
      <div
        ref={setNodeRef}
        className="flex-1 space-y-3 overflow-y-auto min-h-[200px]"
      >
        <SortableContext
          items={cards.map((card) => card.id)}
          strategy={verticalListSortingStrategy}
        >
          {cards.map((card) => (
            <Card
              key={card.id}
              card={card}
              onEdit={onEditCard}
              onDelete={onDeleteCard}
              onDuplicate={onDuplicateCard}
              onViewStats={onViewStats}
              onMoveToNextDay={onMoveCardToNextDay ? () => onMoveCardToNextDay(card.id) : undefined}
            />
          ))}
        </SortableContext>

        {cards.length === 0 && (
          <div className="flex items-center justify-center h-32 text-[var(--color-text-tertiary)] text-sm">
            No cards yet
          </div>
        )}
      </div>

      {/* Add Card Button */}
      <button
        onClick={onAddCard}
        className="mt-4 w-full py-2 px-4 bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] text-sm font-medium rounded-lg border border-[var(--color-border)] transition-colors"
      >
        + Add Card
      </button>
    </div>
  );
});
