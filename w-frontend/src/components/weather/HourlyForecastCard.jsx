'use client';

import React from 'react';
import { Sun, Cloud, CloudSun, CloudRain, CloudLightning, Snowflake } from 'lucide-react';
import { useApp } from '../../Hooks/useAppContext';
import { formatTemp } from '../../lib/weatherUtils';

export default function HourlyForecastCard({ items = [] }) {
  const { temperatureUnit } = useApp();

  const getIconComponent = (iconName) => {
    switch (iconName) {
      case 'rain': return <CloudRain className="w-5 h-5 text-blue-500" />;
      case 'partly-cloudy': return <CloudSun className="w-5 h-5 text-amber-500" />;
      case 'cloudy': return <Cloud className="w-5 h-5 text-slate-400" />;
      case 'storm': return <CloudLightning className="w-5 h-5 text-purple-500" />;
      case 'snow': return <Snowflake className="w-5 h-5 text-cyan-400" />;
      default: return <Sun className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl rounded-3xl p-6 border border-white/80 dark:border-slate-800 shadow-xl shadow-blue-950/5 transition-all">
      <h3 className="text-base font-black text-slate-950 dark:text-white mb-4">
        Hourly Forecast
      </h3>

      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {items.map((h, idx) => (
          <div
            key={idx}
            className={`flex flex-col items-center justify-between py-3.5 px-3 min-w-[72px] rounded-2xl transition-all ${
              idx === 0
                ? 'bg-blue-100/90 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-800 shadow-xs'
                : 'bg-white/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 shadow-2xs'
            }`}
          >
            <span className="text-xs font-bold text-slate-800 dark:text-slate-300">
              {h.time}
            </span>

            <div className="my-2.5">
              {getIconComponent(h.icon)}
            </div>

            <span className="text-sm font-black text-slate-950 dark:text-white">
              {formatTemp(h.temp, temperatureUnit)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
