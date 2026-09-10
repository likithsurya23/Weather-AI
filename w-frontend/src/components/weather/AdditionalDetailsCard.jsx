'use client';

import React from 'react';
import { Eye, Sun, Droplet, Cloud, Gauge } from 'lucide-react';
import { useApp } from '../../Hooks/useAppContext';
import { formatTemp } from '../../lib/weatherUtils';

export default function AdditionalDetailsCard({ data }) {
  const { temperatureUnit } = useApp();

  const details = [
    {
      label: 'Visibility',
      value: `${data?.visibility || 10} km`,
      sub: 'Clear horizon',
      icon: Eye,
      color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/40'
    },
    {
      label: 'UV Index',
      value: `${data?.uvIndex || 2} (${data?.uvLabel || 'Low'})`,
      sub: 'No protection needed',
      icon: Sun,
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
    },
    {
      label: 'Dew Point',
      value: formatTemp(data?.dewPoint || 14, temperatureUnit),
      sub: 'Relative humidity',
      icon: Droplet,
      color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40'
    },
    {
      label: 'Cloud Cover',
      value: `${data?.cloudCover || 90}%`,
      sub: 'Partly overcast',
      icon: Cloud,
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40'
    },
    {
      label: 'Pressure',
      value: `${data?.pressure || 1012} hPa`,
      sub: 'Atmospheric pressure',
      icon: Gauge,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
    }
  ];

  return (
    <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl rounded-3xl p-6 border border-white/80 dark:border-slate-800 shadow-xl shadow-blue-950/5 transition-all">
      <h3 className="text-base font-black text-slate-950 dark:text-white mb-4">
        Additional Details
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {details.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex flex-col justify-between shadow-2xs"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-300">
                  {item.label}
                </span>
                <span className={`p-2 rounded-xl ${item.color}`}>
                  <Icon className="w-4 h-4" />
                </span>
              </div>

              <div>
                <div className="text-lg font-black text-slate-950 dark:text-white">
                  {item.value}
                </div>
                <div className="text-[11px] text-slate-700 dark:text-slate-400 font-bold mt-0.5">
                  {item.sub}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
