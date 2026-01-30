// ═══════════════════════════════════════════════════════════════
// 🔔 NOTIFICATION MANAGEMENT - LIGHT THEME
// ═══════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Send, Clock, FileText, BarChart3 } from 'lucide-react';
import SendNotificationTab from './tab/SendNotification';
import NotificationHistoryTab from './tab/NotificationHistory';
import TemplatesTab from './tab/NotificationTemplates';
import AnalyticsTab from './tab/NotificationCenter';

const NotificationManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'send' | 'history' | 'templates' | 'analytics'>('send');

  const tabs = [
    { id: 'send' as const, label: 'Send Notification', icon: Send },
    { id: 'history' as const, label: 'History', icon: Clock },
    { id: 'templates' as const, label: 'Templates', icon: FileText },
    { id: 'analytics' as const, label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden mb-8"
        >
          {/* Animated Background */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
            }}
            className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          />

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                <Bell size={32} />
              </div>
              <div>
                <h1 className="text-4xl font-black mb-2">
                  Notification Management
                </h1>
                <p className="text-white/90 text-lg">
                  Send, manage, and track all your notifications
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-2 mb-6">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-[140px] px-6 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-3 ${activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <Icon size={20} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'send' && <SendNotificationTab />}
          {activeTab === 'history' && <NotificationHistoryTab />}
          {activeTab === 'templates' && <TemplatesTab />}
          {activeTab === 'analytics' && <AnalyticsTab />}
        </motion.div>
      </div>
    </div>
  );
};

export default NotificationManagement;
