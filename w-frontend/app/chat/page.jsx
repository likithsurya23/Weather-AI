'use client';

import React from 'react';
import { Bot } from 'lucide-react';
import Sidebar from '../../src/components/layout/Sidebar';
import TopNavbar from '../../src/components/layout/TopNavbar';
import WeatherChatbot from '../../src/components/chat/WeatherChatbot';
import { useApp } from '../../src/Hooks/useAppContext';
import ProtectedRoute from '../../src/components/auth/ProtectedRoute';

export default function ChatPage() {
  const { t } = useApp();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-transparent flex transition-colors">
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <TopNavbar />

          <main className="flex-1 p-2.5 sm:p-4 lg:p-5 max-w-5xl w-full mx-auto space-y-3 sm:space-y-4 pb-20 lg:pb-8">
            {/* Top AI Assistant Header Card (Compact) */}
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-2.5 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 transition-colors">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-sm shadow-purple-500/20 shrink-0">
                  <Bot className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white" />
                </div>
                <div>
                  <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                    {t('chat.assistantTitle', 'AI Weather Assistant')}
                  </h1>
                </div>
              </div>
            </div>

            <WeatherChatbot />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
