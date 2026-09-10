'use client';

import React from 'react';
import { Info, Leaf } from 'lucide-react';

export default function AirQualityCard({ data }) {
  const aqi = data?.aqi !== undefined ? data.aqi : 72;
  const label = data?.label || 'Good';

  const pollutants = [
    { name: 'PM2.5', value: data?.pm25 !== undefined ? Math.round(data.pm25) : 32 },
    { name: 'PM10', value: data?.pm10 !== undefined ? Math.round(data.pm10) : 54 },
    { name: 'NO2', value: data?.no2 !== undefined ? Math.round(data.no2) : 18 },
    { name: 'SO2', value: data?.so2 !== undefined ? Math.round(data.so2) : 6 },
    { name: 'O3', value: data?.o3 !== undefined ? Math.round(data.o3) : 42 },
  ];

  // Circle Gauge math
  const radius = 48;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(Math.max((aqi / 150), 0.1), 0.95);
  const strokeDashoffset = circumference - percentage * circumference;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-900">
          Air Quality Index
        </h3>
        <button
          title="AQI indicates ambient pollution levels and health safety."
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* Center Gauge + Pollutant breakdown */}
      <div className="flex items-center justify-between py-4 gap-6">
        {/* Left Circular Ring Gauge */}
        <div className="relative flex items-center justify-center shrink-0 w-32 h-32">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
            {/* Background Track */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke="#E2E8F0"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Value Progress Ring */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke="#10B981"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Center Text & Leaf */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <Leaf className="w-4 h-4 text-emerald-500 mb-0.5 fill-emerald-500" />
            <span className="text-2xl font-bold text-slate-900 leading-none">
              {aqi}
            </span>
            <span className="text-[11px] font-semibold text-slate-500 mt-0.5">
              {label}
            </span>
          </div>
        </div>

        {/* Right Pollutant Values */}
        <div className="flex-1 space-y-1.5 text-xs">
          {pollutants.map((p) => (
            <div key={p.name} className="flex items-center justify-between font-medium">
              <div className="flex items-center gap-2 text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                <span>{p.name}</span>
              </div>
              <span className="font-bold text-slate-800">{p.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Status Message */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50/70 border border-emerald-100 text-slate-700 text-xs">
        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
        <span className="text-[11px] font-medium text-slate-700">
          Air quality is satisfactory. Enjoy your day!
        </span>
      </div>
    </div>
  );
}
