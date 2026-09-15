'use client';

import React from 'react';
import { Cloud, CloudSun } from 'lucide-react';
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
        {/* Application App Sidebar */}
        <Sidebar />

        {/* Main Page Area with Standard TopNavbar */}
        <div className="flex-1 flex flex-col min-w-0">
          <TopNavbar />

          <main className="flex-1 p-2.5 sm:p-4 lg:p-5 max-w-7xl w-full mx-auto space-y-3 sm:space-y-4 pb-20 lg:pb-8">

            {/* Assistant Subheader Banner matching wireframe */}
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
              <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 shrink-0">
                  <CloudSun className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-white drop-shadow-xs" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                    {t('chat.assistantTitle', 'WeatherWise Assistant')}
                  </h1>
                </div>
              </div>

              {/* Slogan matching wireframe */}
              <div className="hidden sm:flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold shrink-0 pr-2">
                <Cloud className="w-4 h-4 text-blue-500" />
                <span>{t('chat.slogan', 'Ask. Learn. Stay Safer.')}</span>
              </div>
            </div>

            {/* Wireframe Chatbot Component (Sidebar + Chat Area + Mobile Responsive) */}
            <WeatherChatbot />

          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
