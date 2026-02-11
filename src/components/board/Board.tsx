import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import confetti from 'canvas-confetti';
import { useBoardStore } from '../../stores/boardStore';
import { useCalendarStore } from '../../stores/calendarStore';
import { Column } from './Column';
import { Card } from './Card';
import { CardModal } from './CardModal';
import { NerdStatsModal } from './NerdStatsModal';
import { Card as CardType } from '../../types/card';
import { format } from 'date-fns';
import { getDateLocale } from '../../utils/dateFnsLocale';
import { motion } from 'framer-motion';
import { Calendar, Plus, ArrowLeft, PartyPopper } from 'lucide-react';
import { Button, Input, Modal } from '../shared';
import { toast } from '../shared/Toast';
import { isMobilePlatform } from '../../hooks/usePlatform';

interface BoardProps {
  selectedDate: Date;
  onBack?: () => void;
}

export function Board({ selectedDate, onBack }: BoardProps) {
  const { t } = useTranslation();
  const { columns, cards, getCardsByColumn, moveCard, addCard, updateCard, deleteCard, duplicateCard, addColumn, updateColumn, deleteColumn } =
    useBoardStore();
  const { holidays } = useCalendarStore();

  // Check if the selected date is a holiday
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const holidaysOnDate = useMemo(
    () => holidays.filter((h) => h.date === dateStr),
    [holidays, dateStr]
  );

  const [activeCard, setActiveCard] = useState<CardType | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CardType | undefined>();
  const [selectedColumnId, setSelectedColumnId] = useState<string>('');
  const [statsCard, setStatsCard] = useState<CardType | undefined>();
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

  // Add Column state
  const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');

  // Delete Column state
  const [deleteColumnId, setDeleteColumnId] = useState<string | null>(null);
  const [migrationOption, setMigrationOption] = useState<'moveToTodo' | 'moveToColumn' | 'deleteAll'>('moveToTodo');
  const [migrationTargetId, setMigrationTargetId] = useState<string>('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 400,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const card = cards.find((c) => c.id === active.id);
    if (card) {
      setActiveCard(card);
      // Haptic feedback on mobile when drag starts
      if (isMobilePlatform()) {
        import('@capacitor/haptics').then(({ Haptics, ImpactStyle }) => {
          Haptics.impact({ style: ImpactStyle.Medium });
        }).catch(() => {});
      }
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
      toast.success(t('board.taskCompleted', { title: card?.title }));
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
      updateCard(editingCard.id, cardData);
    } else {
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

  const handleAddColumn = () => {
    if (!newColumnName.trim()) return;
    addColumn(newColumnName.trim());
    setNewColumnName('');
    setIsAddColumnModalOpen(false);
    toast.success(t('board.columnCreated', { name: newColumnName.trim() }));
  };

  const handleRenameColumn = (columnId: string, newName: string) => {
    if (!newName.trim()) return;
    updateColumn(columnId, { name: newName.trim() });
  };

  const handleDeleteColumnConfirm = () => {
    if (!deleteColumnId) return;
    deleteColumn(deleteColumnId, migrationOption, migrationTargetId || undefined);
    const columnName = columns.find((c) => c.id === deleteColumnId)?.name;
    toast.info(t('board.columnDeleted', { name: columnName }));
    setDeleteColumnId(null);
    setMigrationOption('moveToTodo');
    setMigrationTargetId('');
  };

  const columnToDelete = useMemo(() => deleteColumnId ? columns.find((c) => c.id === deleteColumnId) : null, [deleteColumnId, columns]);
  const cardsInDeleteColumn = useMemo(() => deleteColumnId ? cards.filter((c) => c.columnId === deleteColumnId).length : 0, [deleteColumnId, cards]);
  const otherColumns = useMemo(() => columns.filter((c) => c.id !== deleteColumnId), [deleteColumnId, columns]);
  const sortedColumns = useMemo(() => [...columns].sort((a, b) => a.position - b.position), [columns]);
  const doneCount = useMemo(() => cards.filter((c) => c.columnId === 'done').length, [cards]);

  const handleMoveCardToNextDay = async (cardId: string) => {
    const { moveCardToDate } = useBoardStore.getState();
    await moveCardToDate(cardId, selectedDate);
  };

  const handleMoveCardToPreviousDay = async (cardId: string) => {
    const { moveCardToPreviousDate } = useBoardStore.getState();
    await moveCardToPreviousDate(cardId, selectedDate);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Board Header */}
      <div className="bg-[var(--color-surface)] rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 hover:bg-[var(--color-surface-hover)] rounded-lg transition-colors -ml-2 mr-1"
                title={t('common.backToCalendar')}
              >
                <ArrowLeft size={20} className="text-[var(--color-text-secondary)]" />
              </button>
            )}
            <Calendar className="text-[var(--color-accent)]" size={28} />
            <div>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
                {format(selectedDate, 'EEEE, MMMM d, yyyy', { locale: getDateLocale() })}
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {cards.length} {t('board.tasksTotal')} &bull; {doneCount}{' '}
                  {t('board.completed')}
                </p>
                {holidaysOnDate.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
                    <PartyPopper size={12} />
                    {holidaysOnDate.map((h) => h.name).join(', ')}
                  </span>
                )}
              </div>
            </div>
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
            {sortedColumns.map((column) => (
                <Column
                  key={column.id}
                  column={column}
                  cards={getCardsByColumn(column.id)}
                  onAddCard={() => handleAddCard(column.id)}
                  onEditCard={handleEditCard}
                  onDeleteCard={deleteCard}
                  onDuplicateCard={duplicateCard}
                  onViewStats={handleViewStats}
                  onRenameColumn={(name) => handleRenameColumn(column.id, name)}
                  onDeleteColumn={() => setDeleteColumnId(column.id)}
                  onMoveCardToNextDay={handleMoveCardToNextDay}
                  onMoveCardToPreviousDay={handleMoveCardToPreviousDay}
                />
              ))}

            {/* Add Column Button */}
            <div className="flex-shrink-0 w-[85vw] sm:w-80">
              <button
                onClick={() => setIsAddColumnModalOpen(true)}
                className="w-full py-3 px-4 bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] text-sm font-medium rounded-lg border-2 border-dashed border-[var(--color-border)] transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                {t('board.addColumn')}
              </button>
            </div>
          </div>

          <DragOverlay>
            {activeCard ? (
              <motion.div
                initial={{ rotate: 0, scale: 1 }}
                animate={{ rotate: 3, scale: 1.03 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <Card
                  card={activeCard}
                  onEdit={() => {}}
                  onDelete={() => {}}
                  onDuplicate={() => {}}
                  onViewStats={() => {}}
                  onMoveToNextDay={() => {}}
                />
              </motion.div>
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
        onMoveToNextDay={editingCard ? () => handleMoveCardToNextDay(editingCard.id) : undefined}
        onMoveToPreviousDay={editingCard ? () => handleMoveCardToPreviousDay(editingCard.id) : undefined}
        onDuplicate={editingCard ? () => duplicateCard(editingCard.id) : undefined}
        onDelete={editingCard ? () => deleteCard(editingCard.id) : undefined}
      />

      {/* Nerd Stats Modal */}
      {statsCard && (
        <NerdStatsModal
          isOpen={isStatsModalOpen}
          onClose={() => setIsStatsModalOpen(false)}
          card={statsCard}
        />
      )}

      {/* Add Column Modal */}
      <Modal
        isOpen={isAddColumnModalOpen}
        onClose={() => { setIsAddColumnModalOpen(false); setNewColumnName(''); }}
        title={t('board.addColumn')}
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label={t('board.columnName')}
            required
            value={newColumnName}
            onChange={(e) => setNewColumnName(e.target.value)}
            placeholder={t('board.columnNamePlaceholder')}
            onKeyDown={(e) => e.key === 'Enter' && handleAddColumn()}
          />
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => { setIsAddColumnModalOpen(false); setNewColumnName(''); }}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" onClick={handleAddColumn}>
              {t('board.createColumn')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Column Confirmation Modal */}
      <Modal
        isOpen={!!deleteColumnId}
        onClose={() => setDeleteColumnId(null)}
        title={t('board.deleteColumnTitle')}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-[var(--color-text-primary)]">
            {t('board.deleteColumnConfirm')} <strong>{columnToDelete?.name}</strong>?
            {cardsInDeleteColumn > 0 && (
              <span className="text-[var(--color-text-secondary)]">
                {' '}{t('board.cardsAffected', { count: cardsInDeleteColumn })}
              </span>
            )}
          </p>

          {cardsInDeleteColumn > 0 && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-[var(--color-text-primary)]">
                {t('board.migrationQuestion')}
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="migration" checked={migrationOption === 'moveToTodo'} onChange={() => setMigrationOption('moveToTodo')} className="text-[var(--color-accent)]" />
                <span className="text-sm text-[var(--color-text-primary)]">{t('board.moveToTodo')}</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="migration" checked={migrationOption === 'moveToColumn'} onChange={() => setMigrationOption('moveToColumn')} className="text-[var(--color-accent)]" />
                <span className="text-sm text-[var(--color-text-primary)]">{t('board.moveToColumn')}</span>
              </label>

              {migrationOption === 'moveToColumn' && (
                <select
                  value={migrationTargetId}
                  onChange={(e) => setMigrationTargetId(e.target.value)}
                  className="w-full px-4 py-2 bg-[var(--color-input-bg)] border border-[var(--color-input-border)] rounded-lg text-[var(--color-text-primary)] text-sm"
                >
                  <option value="">{t('board.selectColumn')}</option>
                  {otherColumns.map((col) => (
                    <option key={col.id} value={col.id}>{col.name}</option>
                  ))}
                </select>
              )}

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="migration" checked={migrationOption === 'deleteAll'} onChange={() => setMigrationOption('deleteAll')} className="text-[var(--color-accent)]" />
                <span className="text-sm text-red-600">{t('board.deleteAllCards')}</span>
              </label>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-4 border-t border-[var(--color-border)]">
            <Button variant="secondary" onClick={() => setDeleteColumnId(null)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteColumnConfirm}
              disabled={migrationOption === 'moveToColumn' && !migrationTargetId}
            >
              {t('board.deleteColumnTitle')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
