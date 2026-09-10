'use client';

import React from 'react';
import { MapPin, Droplets, Wind, Gauge, Eye } from 'lucide-react';
import { useApp } from '../../Hooks/useAppContext';

export default function CurrentWeatherCard({ data }) {
  const { temperatureUnit } = useApp();

  const city = data?.city || 'Bengaluru';
  const country = data?.country || 'India';
  const temp = data?.temp !== undefined ? Math.round(data.temp) : 28;
  const condition = data?.condition || 'Partly Cloudy';
  const feelsLike = data?.feelsLike !== undefined ? Math.round(data.feelsLike) : 30;
  const humidity = data?.humidity !== undefined ? data.humidity : 62;
  const windSpeed = data?.windSpeed !== undefined ? data.windSpeed : 12;
  const pressure = data?.pressure !== undefined ? data.pressure : 1012;
  const visibility = data?.visibility !== undefined ? data.visibility : 10;

  const displayTemp = temperatureUnit === 'fahrenheit' ? Math.round((temp * 9) / 5 + 32) : temp;
  const displayFeelsLike = temperatureUnit === 'fahrenheit' ? Math.round((feelsLike * 9) / 5 + 32) : feelsLike;
  const unitSymbol = temperatureUnit === 'fahrenheit' ? '°F' : '°C';

  return (
    <div className="bg-gradient-to-br from-blue-50/70 via-white to-blue-50/40 rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between h-full relative overflow-hidden">
      {/* Top Location and Status */}
      <div>
        <div className="flex items-center gap-1.5 text-slate-800 font-semibold text-sm">
          <MapPin className="w-4 h-4 text-slate-700" />
          <span>{city}, {country}</span>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <div className="text-5xl font-bold text-slate-900 tracking-tight">
              {displayTemp}{unitSymbol}
            </div>
            <div className="text-base font-semibold text-slate-800 mt-1">
              {condition}
            </div>
            <div className="text-xs text-slate-500 font-normal mt-0.5">
              Feels like {displayFeelsLike}{unitSymbol}
            </div>
          </div>

          {/* Sun & Cloud Illustration */}
          <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
            {/* Sun */}
            <div className="absolute top-2 right-4 w-12 h-12 rounded-full bg-amber-400 shadow-lg shadow-amber-400/50 animate-pulse" style={{ animationDuration: '4s' }} />
            
            {/* Cloud */}
            <div className="absolute bottom-2 right-1 z-10">
              <svg className="w-20 h-14 filter drop-shadow-md" viewBox="0 0 80 50" fill="none">
                <path
                  d="M20 45C10 45 2 37 2 27C2 18 9 10 18 10C21 4 28 0 36 0C46 0 54 6 56 15C63 15 70 21 70 29C70 38 62 45 52 45H20Z"
                  fill="#ffffff"
                  fillOpacity="0.95"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom 4 Metrics in a row */}
      <div className="grid grid-cols-4 gap-2 pt-5 mt-4 border-t border-slate-200/60 text-center">
        {/* Humidity */}
        <div className="flex flex-col items-center">
          <Droplets className="w-4 h-4 text-blue-500 mb-1" />
          <span className="text-[11px] text-slate-500 font-normal">Humidity</span>
          <span className="text-xs font-bold text-slate-800 mt-0.5">{humidity}%</span>
        </div>

        {/* Wind */}
        <div className="flex flex-col items-center">
          <Wind className="w-4 h-4 text-slate-500 mb-1" />
          <span className="text-[11px] text-slate-500 font-normal">Wind</span>
          <span className="text-xs font-bold text-slate-800 mt-0.5">{windSpeed} km/h</span>
        </div>

        {/* Pressure */}
        <div className="flex flex-col items-center">
          <Gauge className="w-4 h-4 text-slate-500 mb-1" />
          <span className="text-[11px] text-slate-500 font-normal">Pressure</span>
          <span className="text-xs font-bold text-slate-800 mt-0.5">{pressure} hPa</span>
        </div>

        {/* Visibility */}
        <div className="flex flex-col items-center">
          <Eye className="w-4 h-4 text-slate-500 mb-1" />
          <span className="text-[11px] text-slate-500 font-normal">Visibility</span>
          <span className="text-xs font-bold text-slate-800 mt-0.5">{visibility} km</span>
        </div>
      </div>
    </div>
  );
}
