import { useState, useEffect } from 'react';
import { Modal, Input, Select, Button } from '../shared';
import { Card, ChecklistItem } from '../../types/card';
import { useSettingsStore } from '../../stores/settingsStore';
import { X, Plus, Trash2 } from 'lucide-react';

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cardData: Partial<Card>) => void;
  card?: Card;
  columnId: string;
}

export function CardModal({ isOpen, onClose, onSave, card, columnId }: CardModalProps) {
  const { templates } = useSettingsStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [checklistInput, setChecklistInput] = useState('');

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description);
      setTemplateId(card.templateId || '');
      setTags(card.tags);
      setChecklist(card.checklist);
    } else {
      // Reset for new card
      setTitle('');
      setDescription('');
      setTemplateId('');
      setTags([]);
      setChecklist([]);
    }
  }, [card, isOpen]);

  const handleSave = () => {
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    const cardData: Partial<Card> = {
      title: title.trim(),
      description: description.trim(),
      templateId: templateId || undefined,
      tags,
      checklist,
      columnId,
    };

    onSave(cardData);
    onClose();
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleAddChecklistItem = () => {
    if (checklistInput.trim()) {
      const newItem: ChecklistItem = {
        id: crypto.randomUUID(),
        text: checklistInput.trim(),
        isCompleted: false,
        createdAt: new Date(),
      };
      setChecklist([...checklist, newItem]);
      setChecklistInput('');
    }
  };

  const handleToggleChecklistItem = (id: string) => {
    setChecklist(
      checklist.map((item) =>
        item.id === id ? { ...item, isCompleted: !item.isCompleted } : item
      )
    );
  };

  const handleRemoveChecklistItem = (id: string) => {
    setChecklist(checklist.filter((item) => item.id !== id));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={card ? 'Edit Card' : 'New Card'} size="lg">
      <div className="space-y-4">
        {/* Title */}
        <Input
          label="Title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter card title..."
        />

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description..."
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:bg-white focus:border-primary-main focus:ring-2 focus:ring-primary-main focus:ring-opacity-20 transition-all duration-200"
            rows={3}
          />
        </div>

        {/* Template */}
        <Select
          label="Template (Optional)"
          value={templateId}
          onChange={(e) => setTemplateId(e.target.value)}
          options={[
            { value: '', label: 'No template' },
            ...templates.map((t) => ({ value: t.id, label: t.name })),
          ]}
        />

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              placeholder="Add tag..."
              className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
            />
            <Button variant="secondary" size="sm" onClick={handleAddTag}>
              <Plus size={16} />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
              >
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-red-500"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Checklist */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Checklist</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={checklistInput}
              onChange={(e) => setChecklistInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddChecklistItem()}
              placeholder="Add checklist item..."
              className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
            />
            <Button variant="secondary" size="sm" onClick={handleAddChecklistItem}>
              <Plus size={16} />
            </Button>
          </div>
          <div className="space-y-2">
            {checklist.map((item) => (
              <div key={item.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  checked={item.isCompleted}
                  onChange={() => handleToggleChecklistItem(item.id)}
                  className="w-4 h-4 text-primary-main rounded"
                />
                <span
                  className={`flex-1 text-sm ${
                    item.isCompleted ? 'line-through text-gray-500' : 'text-gray-700'
                  }`}
                >
                  {item.text}
                </span>
                <button
                  onClick={() => handleRemoveChecklistItem(item.id)}
                  className="p-1 hover:bg-red-50 hover:text-red-500 rounded transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            {card ? 'Save Changes' : 'Create Card'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
