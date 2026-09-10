'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

export default function WeatherSummaryCard({ summary, rainProbability = 70 }) {
  const bars = [20, 35, 50, 70, 65, 40, 25];
  const hours = ['9 AM', '11 AM', '1 PM', '3 PM', '5 PM', '7 PM', '9 PM'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Summary narrative card */}
      <div className="md:col-span-2 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl rounded-3xl p-6 border border-white/80 dark:border-slate-800 shadow-xl shadow-blue-950/5 flex flex-col justify-between">
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-black text-sm mb-2">
          <Sparkles className="w-4 h-4" />
          <span>Weather Summary</span>
        </div>
        <p className="text-base text-slate-950 dark:text-slate-200 font-bold leading-relaxed">
          {summary || 'Light rain is expected throughout the day. Temperatures will remain pleasant with calm winds.'}
        </p>
        <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-700 dark:text-slate-400 font-bold">
          <span>Updated just now via WeatherWise radar</span>
        </div>
      </div>

      {/* Rain Probability Chart card */}
      <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl rounded-3xl p-6 border border-white/80 dark:border-slate-800 shadow-xl shadow-blue-950/5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-sm font-black text-slate-950 dark:text-slate-200">Rain Probability</span>
          <span className="text-xl font-black text-blue-600 dark:text-blue-400">{rainProbability}%</span>
        </div>

        {/* Mini bar chart */}
        <div className="flex items-end justify-between h-24 gap-2 pt-4">
          {bars.map((pct, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <div
                className={`w-full rounded-t-lg transition-all ${
                  pct >= 60
                    ? 'bg-blue-600 dark:bg-blue-500'
                    : 'bg-blue-200 dark:bg-blue-900/60'
                }`}
                style={{ height: `${pct}%` }}
              />
              <span className="text-[9px] text-slate-800 dark:text-slate-300 font-bold">{hours[idx]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
