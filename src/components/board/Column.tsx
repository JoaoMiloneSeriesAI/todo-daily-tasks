import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Column as ColumnType } from '../../types/column';
import { Card as CardType } from '../../types/card';
import { Card } from './Card';
import { Plus, MoreVertical } from 'lucide-react';
import { Badge } from '../shared';

interface ColumnProps {
  column: ColumnType;
  cards: CardType[];
  onAddCard: () => void;
  onEditCard: (card: CardType) => void;
  onDeleteCard: (cardId: string) => void;
  onDuplicateCard: (cardId: string) => void;
  onViewStats: (card: CardType) => void;
  onEditColumn?: () => void;
  onDeleteColumn?: () => void;
}

export function Column({
  column,
  cards,
  onAddCard,
  onEditCard,
  onDeleteCard,
  onDuplicateCard,
  onViewStats,
  onEditColumn,
}: ColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  return (
    <div className="flex flex-col w-80 bg-background-tertiary rounded-lg p-4 h-full">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm text-gray-800">{column.name}</h3>
          <Badge variant="default" size="sm">
            {cards.length}
          </Badge>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onAddCard}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            title="Add card"
          >
            <Plus size={16} className="text-gray-600" />
          </button>

          {!column.isStatic && (
            <button
              onClick={onEditColumn}
              className="p-1.5 hover:bg-gray-200 rounded transition-colors"
              title="Column options"
            >
              <MoreVertical size={16} className="text-gray-600" />
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
            />
          ))}
        </SortableContext>

        {cards.length === 0 && (
          <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
            No cards yet
          </div>
        )}
      </div>

      {/* Add Card Button */}
      <button
        onClick={onAddCard}
        className="mt-4 w-full py-2 px-4 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg border border-gray-200 transition-colors"
      >
        + Add Card
      </button>
    </div>
  );
}
