'use client';

import React from 'react';
import { Bot, Sparkles } from 'lucide-react';
import Sidebar from '../../src/components/layout/Sidebar';
import TopNavbar from '../../src/components/layout/TopNavbar';
import WeatherChatbot from '../../src/components/chat/WeatherChatbot';
import { useApp } from '../../src/Hooks/useAppContext';

export default function ChatPage() {
  const { t } = useApp();

  return (
    <div className="min-h-screen bg-transparent flex transition-colors">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar />

        <main className="flex-1 p-6 sm:p-8 max-w-5xl w-full mx-auto space-y-6">
          {/* Top AI Assistant Header Card */}
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20 shrink-0">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {t('chat.assistantTitle', 'AI Weather Assistant')}
                </h1>
              </div>
            </div>
          </div>

          <WeatherChatbot />
        </main>
      </div>
    </div>
  );
}
