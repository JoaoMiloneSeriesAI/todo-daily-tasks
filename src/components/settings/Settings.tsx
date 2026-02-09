import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Calendar, Tag, Globe, Palette, Database } from 'lucide-react';
import { GeneralSettings } from './GeneralSettings';
import { WorkDaysSettings } from './WorkDaysSettings';
import { TemplateSettings } from './TemplateSettings';
import { HolidaySettings } from './HolidaySettings';
import { AppearanceSettings } from './AppearanceSettings';
import { DataManagementSettings } from './DataManagementSettings';

type SettingsTab = 'general' | 'workdays' | 'templates' | 'holidays' | 'appearance' | 'data';

export function Settings() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  const tabs = [
    { id: 'general' as const, label: t('settings.general'), icon: SettingsIcon },
    { id: 'workdays' as const, label: t('settings.workDays'), icon: Calendar },
    { id: 'templates' as const, label: t('settings.templates'), icon: Tag },
    { id: 'holidays' as const, label: t('settings.holidays'), icon: Globe },
    { id: 'appearance' as const, label: t('settings.appearance'), icon: Palette },
    { id: 'data' as const, label: t('settings.dataManagement'), icon: Database },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] p-6">
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
                        ? 'bg-primary-main text-white'
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
          <div className="flex-1 bg-[var(--color-surface)] rounded-lg shadow-sm border border-[var(--color-border)] p-6">
            {activeTab === 'general' && <GeneralSettings />}
            {activeTab === 'workdays' && <WorkDaysSettings />}
            {activeTab === 'templates' && <TemplateSettings />}
            {activeTab === 'holidays' && <HolidaySettings />}
            {activeTab === 'appearance' && <AppearanceSettings />}
            {activeTab === 'data' && <DataManagementSettings />}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
