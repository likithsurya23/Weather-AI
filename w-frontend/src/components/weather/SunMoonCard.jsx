'use client';

import React from 'react';
import { Sunrise, Sunset, Moon, Clock } from 'lucide-react';

export default function SunMoonCard({ data }) {
  const sunrise = data?.sunrise || '06:02 AM';
  const sunset = data?.sunset || '06:21 PM';
  const daylight = data?.daylight || '12h 19m';
  const moonPhase = data?.moonPhase || 'Waxing Crescent';

  return (
    <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl rounded-3xl p-6 border border-white/80 dark:border-slate-800 shadow-xl shadow-blue-950/5 transition-all flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-black text-slate-950 dark:text-white">
          Sunrise & Sunset
        </h3>
        <span className="p-1.5 rounded-xl bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-slate-300">
          <Clock className="w-4 h-4" />
        </span>
      </div>

      {/* Visual Sunrise & Sunset Timeline */}
      <div className="grid grid-cols-2 gap-4 my-2">
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 shadow-2xs">
          <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400">
            <Sunrise className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-800 dark:text-slate-300 font-bold">Sunrise</div>
            <div className="text-base font-black text-slate-950 dark:text-white">{sunrise}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 shadow-2xs">
          <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400">
            <Sunset className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-800 dark:text-slate-300 font-bold">Sunset</div>
            <div className="text-base font-black text-slate-950 dark:text-white">{sunset}</div>
          </div>
        </div>
      </div>

      {/* Astro Details Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200/80 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-300 font-bold">
          <span>Daylight:</span>
          <span className="font-black text-slate-950 dark:text-white">{daylight}</span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-300 font-bold">
          <Moon className="w-3.5 h-3.5 text-slate-700 dark:text-slate-400" />
          <span>{moonPhase}</span>
        </div>
      </div>
    </div>
  );
}
