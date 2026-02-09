import { useState } from 'react';
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
import { Modal } from '../shared/Modal';
import { CardTemplate } from '../../types/card';

export function TemplateSettings() {
  const { templates, addTemplate, updateTemplate, deleteTemplate } = useSettingsStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CardTemplate | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templatePrefix, setTemplatePrefix] = useState('');
  const [templateColor, setTemplateColor] = useState('#6366F1');
  const [templateTags, setTemplateTags] = useState('');

  const colors = [
    { value: '#6366F1', label: 'Indigo' },
    { value: '#EC4899', label: 'Pink' },
    { value: '#14B8A6', label: 'Teal' },
    { value: '#F59E0B', label: 'Amber' },
    { value: '#8B5CF6', label: 'Purple' },
    { value: '#10B981', label: 'Green' },
    { value: '#EF4444', label: 'Red' },
    { value: '#3B82F6', label: 'Blue' },
  ];

  const handleOpenModal = (template?: CardTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setTemplateName(template.name);
      setTemplatePrefix(template.prefix);
      setTemplateColor(template.color);
      setTemplateTags(template.defaultTags.join(', '));
    } else {
      setEditingTemplate(null);
      setTemplateName('');
      setTemplatePrefix('');
      setTemplateColor('#6366F1');
      setTemplateTags('');
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTemplate(null);
  };

  const handleSave = () => {
    const tags = templateTags.split(',').map((t) => t.trim()).filter((t) => t.length > 0);
    if (editingTemplate) {
      updateTemplate(editingTemplate.id, { name: templateName, prefix: templatePrefix, color: templateColor, defaultTags: tags });
    } else {
      addTemplate({ name: templateName, prefix: templatePrefix, color: templateColor, defaultTags: tags });
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      deleteTemplate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-1">Templates</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Create reusable templates for common task types
          </p>
        </div>
        <Button onClick={() => handleOpenModal()} leftIcon={<Plus size={16} />}>
          Add Template
        </Button>
      </div>

      <div className="space-y-3">
        {templates.length === 0 ? (
          <div className="text-center py-12 bg-[var(--color-bg-tertiary)] rounded-lg border border-[var(--color-border)]">
            <p className="text-[var(--color-text-secondary)] mb-2">No templates yet</p>
            <p className="text-sm text-[var(--color-text-tertiary)]">Create your first template to get started</p>
          </div>
        ) : (
          templates.map((template) => (
            <div
              key={template.id}
              className="flex items-center justify-between p-4 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] transition-colors"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-sm"
                  style={{ backgroundColor: template.color }}
                >
                  {template.prefix}
                </div>
                <div>
                  <h3 className="font-medium text-[var(--color-text-primary)]">{template.name}</h3>
                  {template.defaultTags.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {template.defaultTags.map((tag) => (
                        <span key={tag} className="text-xs px-2 py-1 bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => handleOpenModal(template)} leftIcon={<Edit2 size={14} />}>Edit</Button>
                <Button variant="secondary" onClick={() => handleDelete(template.id)} leftIcon={<Trash2 size={14} />} className="text-red-600">Delete</Button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingTemplate ? 'Edit Template' : 'Add Template'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Template Name</label>
            <Input value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="e.g., Bug Fix, Feature, Meeting" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Prefix</label>
            <Input value={templatePrefix} onChange={(e) => setTemplatePrefix(e.target.value.toUpperCase())} placeholder="e.g., BUG, FEAT" maxLength={6} />
            <p className="text-xs text-[var(--color-text-tertiary)] mt-1">Short prefix to identify tasks of this type (max 6 characters)</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Color</label>
            <div className="grid grid-cols-4 gap-2">
              {colors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setTemplateColor(color.value)}
                  className={`h-12 rounded-lg transition-all ${templateColor === color.value ? 'ring-2 ring-offset-2 ring-[#6366F1]' : 'hover:opacity-80'}`}
                  style={{ backgroundColor: color.value }}
                >
                  {templateColor === color.value && <Check size={20} className="text-white mx-auto" />}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Default Tags</label>
            <Input value={templateTags} onChange={(e) => setTemplateTags(e.target.value)} placeholder="e.g., urgent, backend (comma separated)" />
            <p className="text-xs text-[var(--color-text-tertiary)] mt-1">Tags that will be automatically added to new cards</p>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={handleCloseModal} leftIcon={<X size={16} />}>Cancel</Button>
            <Button onClick={handleSave} disabled={!templateName || !templatePrefix} leftIcon={<Check size={16} />}>
              {editingTemplate ? 'Save Changes' : 'Create Template'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
