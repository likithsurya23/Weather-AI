'use client';

import { Compass } from 'lucide-react';
import Sidebar from '../../src/components/layout/Sidebar';
import TopNavbar from '../../src/components/layout/TopNavbar';
import WeatherMapViewer from '../../src/components/map/WeatherMapViewer';
import { useApp } from '../../src/Hooks/useAppContext';

export default function MapPage() {
  const { t } = useApp();

  return (
    <div className="min-h-screen bg-transparent flex transition-colors">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar />

        <main className="flex-1 p-2.5 sm:p-4 lg:p-5 max-w-[1400px] w-full mx-auto space-y-3 sm:space-y-4 pb-20 lg:pb-8">
          {/* Top Map Header Card (Compact) */}
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-lg sm:rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-2 sm:p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-colors">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md sm:rounded-lg bg-linear-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-xs shrink-0">
                <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              </div>
              <div>
                <h1 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                  {t('map.title', 'Weather Radar & Satellite Map')}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] sm:text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                <span>Live Satellite Radar</span>
              </div>
            </div>
          </div>

          <WeatherMapViewer />
        </main>
      </div>
    </div>
  );
}
