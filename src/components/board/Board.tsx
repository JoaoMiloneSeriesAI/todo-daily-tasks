import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import confetti from 'canvas-confetti';
import { useBoardStore } from '../../stores/boardStore';
import { Column } from './Column';
import { Card } from './Card';
import { CardModal } from './CardModal';
import { NerdStatsModal } from './NerdStatsModal';
import { Card as CardType } from '../../types/card';
import { format } from 'date-fns';
import { Calendar, Plus } from 'lucide-react';
import { Button } from '../shared';
import { toast } from '../shared/Toast';

interface BoardProps {
  selectedDate: Date;
}

export function Board({ selectedDate }: BoardProps) {
  const { columns, cards, getCardsByColumn, moveCard, addCard, updateCard, deleteCard, duplicateCard } =
    useBoardStore();

  const [activeCard, setActiveCard] = useState<CardType | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CardType | undefined>();
  const [selectedColumnId, setSelectedColumnId] = useState<string>('');
  const [statsCard, setStatsCard] = useState<CardType | undefined>();
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const card = cards.find((c) => c.id === active.id);
    if (card) {
      setActiveCard(card);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveCard(null);
      return;
    }

    const cardId = active.id as string;
    const overId = over.id as string;
    const card = cards.find((c) => c.id === cardId);

    // Check if dropped over a column
    const targetColumn = columns.find((col) => col.id === overId);
    let targetColumnId: string | null = null;

    if (targetColumn) {
      targetColumnId = targetColumn.id;
      moveCard(cardId, targetColumn.id);
    } else {
      // Dropped over another card, find its column
      const targetCard = cards.find((c) => c.id === overId);
      if (targetCard) {
        targetColumnId = targetCard.columnId;
        moveCard(cardId, targetCard.columnId);
      }
    }

    // Trigger confetti if moved to Done column
    if (targetColumnId === 'done' && card?.columnId !== 'done') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366F1', '#EC4899', '#14B8A6', '#F59E0B'],
      });
      toast.success(`Task "${card?.title}" completed! 🎉`);
    }

    setActiveCard(null);
  };

  const handleAddCard = (columnId: string) => {
    setSelectedColumnId(columnId);
    setEditingCard(undefined);
    setIsCardModalOpen(true);
  };

  const handleEditCard = (card: CardType) => {
    setSelectedColumnId(card.columnId);
    setEditingCard(card);
    setIsCardModalOpen(true);
  };

  const handleViewStats = (card: CardType) => {
    setStatsCard(card);
    setIsStatsModalOpen(true);
  };

  const handleSaveCard = (cardData: Partial<CardType>) => {
    if (editingCard) {
      // Update existing card
      updateCard(editingCard.id, cardData);
    } else {
      // Create new card
      if (!cardData.title) return;

      addCard(selectedColumnId, {
        title: cardData.title,
        description: cardData.description || '',
        columnId: selectedColumnId,
        templateId: cardData.templateId,
        tags: cardData.tags || [],
        checklist: cardData.checklist || [],
      });
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Board Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="text-primary-main" size={28} />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </h2>
              <p className="text-sm text-gray-600">
                {cards.length} tasks total • {cards.filter((c) => c.columnId === 'done').length}{' '}
                completed
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm">
              <Plus size={16} className="mr-1" />
              Add Column
            </Button>
          </div>
        </div>
      </div>

      {/* Board Columns */}
      <div className="flex-1 overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 h-full pb-4">
            {columns
              .sort((a, b) => a.position - b.position)
              .map((column) => (
                <Column
                  key={column.id}
                  column={column}
                  cards={getCardsByColumn(column.id)}
                  onAddCard={() => handleAddCard(column.id)}
                  onEditCard={handleEditCard}
                  onDeleteCard={deleteCard}
                  onDuplicateCard={duplicateCard}
                  onViewStats={handleViewStats}
                />
              ))}
          </div>

          <DragOverlay>
            {activeCard ? (
              <div className="rotate-3">
                <Card
                  card={activeCard}
                  onEdit={() => {}}
                  onDelete={() => {}}
                  onDuplicate={() => {}}
                  onViewStats={() => {}}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Card Modal */}
      <CardModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        onSave={handleSaveCard}
        card={editingCard}
        columnId={selectedColumnId}
      />

      {/* Nerd Stats Modal */}
      {statsCard && (
        <NerdStatsModal
          isOpen={isStatsModalOpen}
          onClose={() => setIsStatsModalOpen(false)}
          card={statsCard}
        />
      )}
    </div>
  );
}
