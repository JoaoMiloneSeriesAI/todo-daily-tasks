import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { Settings as SettingsIcon, Calendar, Tag, Globe, Palette, Database, Tags, ChevronRight, ArrowLeft } from 'lucide-react';
import { GeneralSettings } from './GeneralSettings';
import { WorkDaysSettings } from './WorkDaysSettings';
import { TemplateSettings } from './TemplateSettings';
import { HolidaySettings } from './HolidaySettings';
import { AppearanceSettings } from './AppearanceSettings';
import { DataManagementSettings } from './DataManagementSettings';
import { TagSettings } from './TagSettings';
import { useIsMobile } from '../../hooks/usePlatform';

type SettingsTab = 'general' | 'workdays' | 'templates' | 'tags' | 'holidays' | 'appearance' | 'data';

export function Settings() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<SettingsTab | null>(isMobile ? null : 'general');

  const tabs = [
    { id: 'general' as const, label: t('settings.general'), icon: SettingsIcon },
    { id: 'workdays' as const, label: t('settings.workDays'), icon: Calendar },
    { id: 'templates' as const, label: t('settings.templates'), icon: Tag },
    { id: 'tags' as const, label: t('settings.tags') || 'Tags', icon: Tags },
    { id: 'holidays' as const, label: t('settings.holidays'), icon: Globe },
    { id: 'appearance' as const, label: t('settings.appearance'), icon: Palette },
    { id: 'data' as const, label: t('settings.dataManagement'), icon: Database },
  ];

  const renderContent = (tab: SettingsTab) => {
    switch (tab) {
      case 'general': return <GeneralSettings />;
      case 'workdays': return <WorkDaysSettings />;
      case 'templates': return <TemplateSettings />;
      case 'tags': return <TagSettings />;
      case 'holidays': return <HolidaySettings />;
      case 'appearance': return <AppearanceSettings />;
      case 'data': return <DataManagementSettings />;
    }
  };

  // Mobile: stacked navigation (tab list -> full-screen panel with back button)
  if (isMobile) {
    return (
      <div>
        <AnimatePresence mode="wait">
          {activeTab === null ? (
            <motion.div
              key="tab-list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.15 }}
            >
              {/* Header */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-1">{t('settings.title')}</h1>
                <p className="text-sm text-[var(--color-text-secondary)]">{t('settings.subtitle')}</p>
              </div>

              {/* Tab list */}
              <div className="bg-[var(--color-surface)] rounded-xl shadow-sm border border-[var(--color-border)] overflow-hidden">
                {tabs.map((tab, index) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-4 text-left text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] transition-colors ${
                        index < tabs.length - 1 ? 'border-b border-[var(--color-border)]' : ''
                      }`}
                    >
                      <div className="p-2 rounded-lg bg-[var(--color-accent-light)]">
                        <Icon size={18} className="text-[var(--color-accent)]" />
                      </div>
                      <span className="flex-1">{tab.label}</span>
                      <ChevronRight size={16} className="text-[var(--color-text-tertiary)]" />
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={`panel-${activeTab}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.15 }}
            >
              {/* Back button + panel title */}
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => setActiveTab(null)}
                  className="p-2 hover:bg-[var(--color-surface-hover)] rounded-lg transition-colors -ml-2"
                >
                  <ArrowLeft size={20} className="text-[var(--color-text-secondary)]" />
                </button>
                <h1 className="text-xl font-bold text-[var(--color-text-primary)]">
                  {tabs.find((t) => t.id === activeTab)?.label}
                </h1>
              </div>

              {/* Settings content -- full width, no horizontal overflow */}
              <div className="bg-[var(--color-surface)] rounded-xl shadow-sm border border-[var(--color-border)] p-4 overflow-x-hidden">
                {renderContent(activeTab)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Desktop: side-by-side layout (existing)
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">{t('settings.title')}</h1>
          <p className="text-[var(--color-text-secondary)]">{t('settings.subtitle')}</p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <div className="w-64 bg-[var(--color-surface)] rounded-lg shadow-sm border border-[var(--color-border)] p-4 h-fit">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[var(--color-accent)] text-[var(--color-accent-text)]'
                        : 'text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]'
                    }`}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-[var(--color-surface)] rounded-lg shadow-sm border border-[var(--color-border)] p-6 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15, ease: 'easeInOut' }}
              >
                {activeTab && renderContent(activeTab)}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
