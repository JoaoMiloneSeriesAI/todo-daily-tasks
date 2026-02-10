import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
import { Modal } from '../shared/Modal';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { CardTemplate } from '../../types/card';

export function TemplateSettings() {
  const { t } = useTranslation();
  const { templates, addTemplate, updateTemplate, deleteTemplate } = useSettingsStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CardTemplate | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templatePrefix, setTemplatePrefix] = useState('');
  const [templateColor, setTemplateColor] = useState('#6366F1');
  const [templateTags, setTemplateTags] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const colors = [
    '#6366F1', '#EC4899', '#14B8A6', '#F59E0B',
    '#8B5CF6', '#10B981', '#EF4444', '#3B82F6',
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

  const handleCloseModal = () => { setIsModalOpen(false); setEditingTemplate(null); };

  const handleSave = () => {
    const tags = templateTags.split(',').map((tg) => tg.trim()).filter((tg) => tg.length > 0);
    if (editingTemplate) {
      updateTemplate(editingTemplate.id, { name: templateName, prefix: templatePrefix, color: templateColor, defaultTags: tags });
    } else {
      addTemplate({ name: templateName, prefix: templatePrefix, color: templateColor, defaultTags: tags });
    }
    handleCloseModal();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-1">{t('settingsTemplates.title')}</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">{t('settingsTemplates.description')}</p>
        </div>
        <Button onClick={() => handleOpenModal()} leftIcon={<Plus size={16} />}>{t('settingsTemplates.addTemplate')}</Button>
      </div>

      <div className="space-y-3">
        {templates.length === 0 ? (
          <div className="text-center py-12 bg-[var(--color-bg-tertiary)] rounded-lg border border-[var(--color-border)]">
            <p className="text-[var(--color-text-secondary)] mb-2">{t('settingsTemplates.noTemplates')}</p>
            <p className="text-sm text-[var(--color-text-tertiary)]">{t('settingsTemplates.noTemplatesHint')}</p>
          </div>
        ) : (
          templates.map((template) => (
            <div key={template.id} className="flex items-center justify-between p-4 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-sm" style={{ backgroundColor: template.color }}>
                  {template.prefix}
                </div>
                <div>
                  <h3 className="font-medium text-[var(--color-text-primary)]">{template.name}</h3>
                  {template.defaultTags.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {template.defaultTags.map((tag) => (
                        <span key={tag} className="text-xs px-2 py-1 bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] rounded">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => handleOpenModal(template)} leftIcon={<Edit2 size={14} />}>{t('common.edit')}</Button>
                <Button variant="secondary" onClick={() => setDeleteId(template.id)} leftIcon={<Trash2 size={14} />} className="text-red-600">{t('common.delete')}</Button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingTemplate ? t('settingsTemplates.editTemplate') : t('settingsTemplates.addTemplate')}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">{t('settingsTemplates.templateName')}</label>
            <Input value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder={t('settingsTemplates.templateNamePlaceholder')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">{t('settingsTemplates.prefix')}</label>
            <Input value={templatePrefix} onChange={(e) => setTemplatePrefix(e.target.value.toUpperCase())} placeholder={t('settingsTemplates.prefixPlaceholder')} maxLength={6} />
            <p className="text-xs text-[var(--color-text-tertiary)] mt-1">{t('settingsTemplates.prefixHint')}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">{t('settingsTemplates.color')}</label>
            <div className="grid grid-cols-4 gap-2">
              {colors.map((color) => (
                <button key={color} onClick={() => setTemplateColor(color)}
                  className={`h-12 rounded-lg transition-all ${templateColor === color ? 'ring-2 ring-offset-2 ring-[var(--color-accent)]' : 'hover:opacity-80'}`}
                  style={{ backgroundColor: color }}>
                  {templateColor === color && <Check size={20} className="text-white mx-auto" />}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">{t('settingsTemplates.defaultTags')}</label>
            <Input value={templateTags} onChange={(e) => setTemplateTags(e.target.value)} placeholder={t('settingsTemplates.defaultTagsPlaceholder')} />
            <p className="text-xs text-[var(--color-text-tertiary)] mt-1">{t('settingsTemplates.defaultTagsHint')}</p>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={handleCloseModal} leftIcon={<X size={16} />}>{t('common.cancel')}</Button>
            <Button onClick={handleSave} disabled={!templateName || !templatePrefix} leftIcon={<Check size={16} />}>
              {editingTemplate ? t('settingsTemplates.saveChanges') : t('settingsTemplates.createTemplate')}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) deleteTemplate(deleteId); setDeleteId(null); }}
        title={t('common.delete')}
        message={t('settingsTemplates.deleteConfirm')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        variant="danger"
      />
    </div>
  );
}
