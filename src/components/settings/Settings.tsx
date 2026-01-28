import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Calendar, Tag, Globe, Palette, Database } from 'lucide-react';
import { GeneralSettings } from './GeneralSettings';
import { WorkDaysSettings } from './WorkDaysSettings';
import { TemplateSettings } from './TemplateSettings';
import { HolidaySettings } from './HolidaySettings';
import { AppearanceSettings } from './AppearanceSettings';
import { DataManagementSettings } from './DataManagementSettings';

type SettingsTab = 'general' | 'workdays' | 'templates' | 'holidays' | 'appearance' | 'data';

const tabs = [
  { id: 'general' as const, label: 'General', icon: SettingsIcon },
  { id: 'workdays' as const, label: 'Work Days', icon: Calendar },
  { id: 'templates' as const, label: 'Templates', icon: Tag },
  { id: 'holidays' as const, label: 'Holidays', icon: Globe },
  { id: 'appearance' as const, label: 'Appearance', icon: Palette },
  { id: 'data' as const, label: 'Data Management', icon: Database },
];

export function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Configure your task manager preferences</p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <div className="w-64 bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-fit">
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
                        : 'text-gray-700 hover:bg-gray-100'
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
          <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
