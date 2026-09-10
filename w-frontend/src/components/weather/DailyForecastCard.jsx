'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, CloudRain, Sun, CloudSun, Cloud } from 'lucide-react';
import { useApp } from '../../Hooks/useAppContext';

export default function DailyForecastCard({ items = [] }) {
  const { temperatureUnit } = useApp();

  // Fallback 5-day forecast matching the wireframe if items are empty
  const defaultForecast = [
    { day: 'Tue', date: 'Sep 9', icon: 'rain', tempMax: 28, tempMin: 22 },
    { day: 'Wed', date: 'Sep 10', icon: 'partly-cloudy', tempMax: 27, tempMin: 21 },
    { day: 'Thu', date: 'Sep 11', icon: 'sun', tempMax: 29, tempMin: 22 },
    { day: 'Fri', date: 'Sep 12', icon: 'rain', tempMax: 27, tempMin: 21 },
    { day: 'Sat', date: 'Sep 13', icon: 'partly-cloudy', tempMax: 28, tempMin: 21 },
  ];

  const forecastList = items && items.length >= 5 ? items.slice(0, 5) : defaultForecast;

  const renderWeatherIcon = (iconType, condition = '') => {
    const c = (condition || '').toLowerCase();
    const type = iconType || (c.includes('rain') ? 'rain' : c.includes('sun') ? 'sun' : 'partly-cloudy');

    if (type === 'rain' || c.includes('rain')) {
      return (
        <div className="relative">
          <CloudRain className="w-6 h-6 text-blue-500" />
        </div>
      );
    }
    if (type === 'sun' || c.includes('clear') || c.includes('sunny')) {
      return <Sun className="w-6 h-6 text-amber-500" />;
    }
    if (type === 'cloudy' || c.includes('overcast')) {
      return <Cloud className="w-6 h-6 text-slate-400" />;
    }
    return (
      <div className="relative">
        <CloudSun className="w-6 h-6 text-amber-500" />
      </div>
    );
  };

  const convertTemp = (celsiusVal) => {
    if (temperatureUnit === 'fahrenheit') {
      return `${Math.round((celsiusVal * 9) / 5 + 32)}°`;
    }
    return `${celsiusVal}°`;
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-900">
          5-Day Forecast
        </h3>
        <Link
          href="/search"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 5 Vertical Days Columns */}
      <div className="grid grid-cols-5 gap-1 pt-6 pb-2 text-center items-center">
        {forecastList.map((item, index) => {
          const dayName = item.day === 'Today' ? 'Tue' : item.day;
          const dateStr = item.date || `Sep ${9 + index}`;

          return (
            <div key={index} className="flex flex-col items-center justify-between space-y-2.5">
              {/* Day & Date */}
              <div>
                <div className="text-xs font-bold text-slate-800">{dayName}</div>
                <div className="text-[11px] text-slate-400 font-normal">{dateStr}</div>
              </div>

              {/* Weather Icon */}
              <div className="py-1 flex items-center justify-center h-8">
                {renderWeatherIcon(item.icon, item.condition)}
              </div>

              {/* High and Low Temps */}
              <div>
                <div className="text-xs font-bold text-slate-900">
                  {convertTemp(item.tempMax)}
                </div>
                <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                  {convertTemp(item.tempMin)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
