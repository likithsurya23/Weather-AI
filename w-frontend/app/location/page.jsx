'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '../../src/components/layout/Sidebar';
import TopNavbar from '../../src/components/layout/TopNavbar';
import CurrentWeatherCard from '../../src/components/weather/CurrentWeatherCard';
import WeatherSummaryCard from '../../src/components/weather/WeatherSummaryCard';
import AdditionalDetailsCard from '../../src/components/weather/AdditionalDetailsCard';
import HourlyForecastCard from '../../src/components/weather/HourlyForecastCard';
import DailyForecastCard from '../../src/components/weather/DailyForecastCard';
import AirQualityCard from '../../src/components/weather/AirQualityCard';
import SunMoonCard from '../../src/components/weather/SunMoonCard';
import { ArrowLeft } from 'lucide-react';
import { api } from '../../src/lib/api';

function LocationDetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cityParam = searchParams.get('city') || 'London';

  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'hourly', label: 'Hourly' },
    { id: '7-day', label: '7-Day' },
    { id: 'air-quality', label: 'Air Quality' },
    { id: 'sun-moon', label: 'Sun & Moon' }
  ];

  useEffect(() => {
    let isCancelled = false;
    api.getWeather(cityParam).then(data => {
      if (!isCancelled) {
        setWeather(data);
        setLoading(false);
      }
    }).catch(() => {
      if (!isCancelled) setLoading(false);
    });

    return () => {
      isCancelled = true;
    };
  }, [cityParam]);

  return (
    <main className="flex-1 p-8 max-w-6xl w-full mx-auto space-y-6">
      {/* Back Button Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      {/* Primary Location Weather Hero Card */}
      {loading && !weather ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 animate-pulse h-64 flex items-center justify-center">
          <div className="text-slate-400 font-medium">Loading weather data...</div>
        </div>
      ) : (
        <CurrentWeatherCard data={weather} showFavorite={true} />
      )}

      {/* Tab Navigation matching Wireframe Screen 6 */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto scrollbar-none">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content Display */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <WeatherSummaryCard
            summary={weather?.summary}
            rainProbability={weather?.rainProbability || 70}
          />
          <AdditionalDetailsCard data={weather} />
          <HourlyForecastCard items={weather?.hourly || []} />
        </div>
      )}

      {activeTab === 'hourly' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <HourlyForecastCard items={weather?.hourly || []} />
          <WeatherSummaryCard
            summary={weather?.summary}
            rainProbability={weather?.rainProbability || 70}
          />
        </div>
      )}

      {activeTab === '7-day' && (
        <div className="animate-in fade-in duration-150 max-w-2xl">
          <DailyForecastCard items={weather?.daily || []} />
        </div>
      )}

      {activeTab === 'air-quality' && (
        <div className="animate-in fade-in duration-150 max-w-2xl">
          <AirQualityCard data={weather?.airQuality} />
        </div>
      )}

      {activeTab === 'sun-moon' && (
        <div className="animate-in fade-in duration-150 max-w-2xl">
          <SunMoonCard data={weather?.sunMoon} />
        </div>
      )}
    </main>
  );
}

export default function LocationDetailsPage() {
  return (
    <div className="min-h-screen bg-transparent flex transition-colors">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar />
        <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading location details...</div>}>
          <LocationDetailsContent />
        </Suspense>
      </div>
    </div>
  );
}
