'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin,
  Droplets,
  Wind,
  Gauge,
  Eye,
  ArrowRight,
  Clock,
  Calendar,
  Sun,
  Cloud,
  CloudSun,
  CloudRain,
  Moon,
  Thermometer,
  Info,
  Leaf,
  Map,
  Plus,
  Minus,
  ChevronDown,
  ShieldCheck,
  Bell,
  Navigation,
  RefreshCw
} from 'lucide-react';
import Sidebar from '../../src/components/layout/Sidebar';
import TopNavbar from '../../src/components/layout/TopNavbar';
import { useApp } from '../../src/Hooks/useAppContext';
import { api } from '../../src/lib/api';
import { formatTempNumber, formatDegree } from '../../src/lib/weatherUtils';

function WeatherSearchContent() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q');
  const {
    weather,
    currentCity,
    selectCity,
    temperatureUnit,
    setTemperatureUnit,
    syncDeviceLocation,
    isLiveLocation,
    isSyncingLocation,
    t
  } = useApp();

  const [selectedMapLayer, setSelectedMapLayer] = useState('Precipitation');
  const [mapZoomLevel, setMapZoomLevel] = useState(1);
  const [isLayerDropdownOpen, setIsLayerDropdownOpen] = useState(false);
  const [liveAlerts, setLiveAlerts] = useState([]);

  // If query parameter is provided and differs from current city, trigger search.
  // Otherwise, ensure live device location is synced initially.
  useEffect(() => {
    if (queryParam && queryParam.trim() && queryParam.toLowerCase() !== currentCity.toLowerCase()) {
      selectCity(queryParam.trim());
    } else if (!queryParam && !weather) {
      syncDeviceLocation(true);
    }
  }, [queryParam, currentCity, selectCity, weather, syncDeviceLocation]);

  // Load live alerts for the current location
  useEffect(() => {
    if (currentCity) {
      api.getAlerts(currentCity).then((alts) => {
        if (alts && alts.length > 0) setLiveAlerts(alts);
      });
    }
  }, [currentCity]);

  // -------------------------------------------------------------
  // REAL-TIME WEATHER METRICS FROM WEATHERAPI
  // -------------------------------------------------------------
  const city = weather?.city || currentCity || 'Bengaluru';
  const region = weather?.region || '';
  const country = weather?.country || 'India';
  const rawTemp = weather?.temp !== undefined ? Math.round(weather.temp) : 28;
  const condition = weather?.condition || 'Partly Cloudy';
  const rawFeelsLike = weather?.feelsLike !== undefined ? Math.round(weather.feelsLike) : rawTemp;
  const humidity = weather?.humidity !== undefined ? weather.humidity : 51;
  const windSpeed = weather?.windSpeed !== undefined ? weather.windSpeed : 17;
  const pressure = weather?.pressure !== undefined ? weather.pressure : 1012;
  const visibility = weather?.visibility !== undefined ? weather.visibility : 10;
  const cloudCover = weather?.cloudCover !== undefined ? weather.cloudCover : 48;

  const displayTemp = formatTempNumber(rawTemp, temperatureUnit);
  const displayFeelsLike = formatTempNumber(rawFeelsLike, temperatureUnit);
  const unitSymbol = temperatureUnit === 'fahrenheit' ? '°F' : '°C';
  const convertTemp = (celsius) => formatDegree(celsius, temperatureUnit);

  // Format the real local date/time of that location
  const formattedDateTime = weather?.localtime
    ? new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).format(new Date(weather.localtime.replace(' ', 'T')))
    : new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).format(new Date());

  // -------------------------------------------------------------
  // REAL HOURLY FORECAST FROM WEATHERAPI
  // -------------------------------------------------------------
  const hourlyItems = weather?.hourly && weather.hourly.length >= 6
    ? weather.hourly.slice(0, 6)
    : [
        { time: 'Now', temp: rawTemp, feelsLike: rawFeelsLike, condition, icon: 'partly-cloudy' }
      ];

  const renderHourlyIcon = (iconKey, condText = '', timeStr = '') => {
    const c = (condText || '').toLowerCase();
    const isNight = timeStr.includes('PM') && (timeStr.includes('8') || timeStr.includes('9') || timeStr.includes('10') || timeStr.includes('11'));

    if (iconKey === 'rain' || c.includes('rain') || c.includes('drizzle')) {
      return <CloudRain className="w-6 h-6 text-blue-500" />;
    }
    if (iconKey === 'sun' || c.includes('sunny') || (c.includes('clear') && !isNight)) {
      return <Sun className="w-6 h-6 text-amber-500" />;
    }
    if (isNight || iconKey === 'moon') {
      return <Moon className="w-6 h-6 text-slate-600 fill-slate-500" />;
    }
    if (c.includes('partly')) {
      return <CloudSun className="w-6 h-6 text-amber-500" />;
    }
    return <Cloud className="w-6 h-6 text-slate-400" />;
  };

  // -------------------------------------------------------------
  // REAL 5-DAY DAILY FORECAST FROM WEATHERAPI
  // -------------------------------------------------------------
  const dailyForecast = weather?.daily && weather.daily.length >= 5
    ? weather.daily.slice(0, 5)
    : (weather?.daily || []);

  // -------------------------------------------------------------
  // REAL SUN & MOON METRICS FROM WEATHERAPI
  // -------------------------------------------------------------
  const sunrise = weather?.sunMoon?.sunrise || '06:08 AM';
  const sunset = weather?.sunMoon?.sunset || '06:24 PM';
  const moonPhase = weather?.sunMoon?.moonPhase || 'New Moon';
  const moonIllumination = weather?.sunMoon?.moonIllumination || '0%';

  // -------------------------------------------------------------
  // REAL AIR QUALITY TELEMETRY FROM WEATHERAPI
  // -------------------------------------------------------------
  const aqiScore = weather?.airQuality?.aqi !== undefined ? weather.airQuality.aqi : 35;
  const aqiLabel = weather?.airQuality?.label || (aqiScore <= 50 ? 'Good' : aqiScore <= 100 ? 'Moderate' : 'Unhealthy');

  const aqiRadius = 48;
  const aqiStrokeWidth = 8;
  const aqiCircumference = 2 * Math.PI * aqiRadius;
  const aqiPercentage = Math.min(Math.max(aqiScore / 150, 0.08), 0.96);
  const aqiStrokeDashoffset = aqiCircumference - aqiPercentage * aqiCircumference;
  const aqiColor = aqiScore <= 50 ? '#10B981' : aqiScore <= 100 ? '#F59E0B' : '#EF4444';

  const mapLayerOptions = ['Precipitation', 'Temperature', 'Wind', 'Cloud Cover', 'Radar'];

  const hasGovAlert = liveAlerts.some(a => a.severity === 'danger' || a.severity === 'warning');
  const alertSummaryText = hasGovAlert
    ? liveAlerts[0]?.title + ': ' + liveAlerts[0]?.description
    : `No severe weather alerts for ${city} at this time.`;

  return (
    <main className="flex-1 p-3 sm:p-5 lg:p-6 max-w-[1400px] w-full mx-auto space-y-3 sm:space-y-4 pb-20 lg:pb-8">
      
      {/* Top Weather Header Card */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 transition-colors">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-linear-to-br from-blue-500 to-sky-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
            <Cloud className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {t('nav.weather', 'Weather')}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800/80 gap-2">
          {/* Live Device Location Sync Pill / Button */}
          {isLiveLocation ? (
            <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[11px] sm:text-xs font-semibold border border-emerald-200/80 dark:border-emerald-800 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Location Synced</span>
              <button
                onClick={() => syncDeviceLocation()}
                disabled={isSyncingLocation}
                title="Resync Live Device Location"
                className="ml-0.5 p-0.5 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded-full transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 text-emerald-700 dark:text-emerald-400 ${isSyncingLocation ? 'animate-spin' : ''}`} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => syncDeviceLocation()}
              disabled={isSyncingLocation}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 text-[11px] sm:text-xs font-semibold border border-blue-200/80 dark:border-blue-800 shadow-xs transition-colors cursor-pointer"
              title="Sync to device live location"
            >
              <Navigation className={`w-3 h-3 text-blue-600 dark:text-blue-400 ${isSyncingLocation ? 'animate-spin' : ''}`} />
              <span>{isSyncingLocation ? 'Syncing...' : 'Use My Live Location'}</span>
            </button>
          )}

          {/* Temperature Unit Switcher Pill */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
            <button
              onClick={() => setTemperatureUnit('celsius')}
              className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                temperatureUnit === 'celsius'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              °C
            </button>
            <button
              onClick={() => setTemperatureUnit('fahrenheit')}
              className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                temperatureUnit === 'fahrenheit'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              °F
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Weather Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-start">
        
        {/* ========================================================= */}
        {/* LEFT 8-COLUMN AREA */}
        {/* ========================================================= */}
        <div className="lg:col-span-8 space-y-3 sm:space-y-4">
          
          {/* Row 1: Current Weather Card + Hourly Forecast Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            
            {/* 1. Current Weather Card (Compact) */}
            <div className="bg-gradient-to-br from-blue-50/70 via-white to-blue-50/40 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between h-full relative overflow-hidden">
              <div>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 text-slate-800 font-semibold text-xs">
                    <MapPin className="w-3.5 h-3.5 text-slate-700" />
                    <span className="truncate">{city}{region ? `, ${region}` : country ? `, ${country}` : ''}</span>
                  </div>
                  {isLiveLocation && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 shadow-xs">
                      <Navigation className="w-2.5 h-2.5 text-emerald-600 fill-emerald-600" />
                      Live Device
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                  {formattedDateTime}
                </div>

                <div className="mt-2.5 sm:mt-3 flex items-center justify-between">
                  <div>
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
                      {displayTemp}{unitSymbol}
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-slate-800 mt-0.5">
                      {condition}
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-slate-500 font-normal mt-0.5">
                      {t('dash.feelsLike', 'Feels like')} {displayFeelsLike}{unitSymbol}
                    </div>
                  </div>

                  {/* Sun & Cloud Illustration */}
                  <div className="relative w-14 h-14 sm:w-18 sm:h-18 shrink-0 flex items-center justify-center">
                    <div className="absolute top-1 right-2 sm:right-3 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-amber-400 shadow-md shadow-amber-400/50 animate-pulse" style={{ animationDuration: '4s' }} />
                    <div className="absolute bottom-1 right-0.5 z-10">
                      <svg className="w-11 h-8 sm:w-14 sm:h-10 filter drop-shadow-sm" viewBox="0 0 80 50" fill="none">
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

              {/* Bottom 4 Metrics */}
              <div className="grid grid-cols-4 gap-1.5 pt-3 mt-3 border-t border-slate-200/60 text-center">
                <div className="flex flex-col items-center">
                  <Droplets className="w-3.5 h-3.5 text-blue-500 mb-0.5" />
                  <span className="text-[10px] text-slate-500 font-normal">{t('dash.humidity', 'Humidity')}</span>
                  <span className="text-[11px] font-bold text-slate-800 mt-0.5">{humidity}%</span>
                </div>
                <div className="flex flex-col items-center">
                  <Wind className="w-3.5 h-3.5 text-slate-500 mb-0.5" />
                  <span className="text-[10px] text-slate-500 font-normal">{t('dash.windSpeed', 'Wind')}</span>
                  <span className="text-[11px] font-bold text-slate-800 mt-0.5">{windSpeed} km/h</span>
                </div>
                <div className="flex flex-col items-center">
                  <Gauge className="w-3.5 h-3.5 text-slate-500 mb-0.5" />
                  <span className="text-[10px] text-slate-500 font-normal">{t('dash.pressure', 'Pressure')}</span>
                  <span className="text-[11px] font-bold text-slate-800 mt-0.5">{pressure} hPa</span>
                </div>
                <div className="flex flex-col items-center">
                  <Eye className="w-3.5 h-3.5 text-slate-500 mb-0.5" />
                  <span className="text-[10px] text-slate-500 font-normal">{t('dash.visibility', 'Visibility')}</span>
                  <span className="text-[11px] font-bold text-slate-800 mt-0.5">{visibility} km</span>
                </div>
              </div>
            </div>

            {/* 2. Hourly Forecast Card (Compact) */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between h-full">
              <div className="flex items-center justify-between pb-1.5">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-700" />
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">{t('dash.hourlyForecast', 'Hourly Forecast')}</h3>
                </div>
                <Link
                  href="/dashboard"
                  className="text-[10px] sm:text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                >
                  <span>{t('dash.hourlyForecast', 'View 24h')}</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="flex sm:grid sm:grid-cols-6 gap-1 pt-1.5 pb-0.5 text-center items-center overflow-x-auto sm:overflow-visible scrollbar-thin">
                {hourlyItems.map((item, idx) => {
                  const feelsVal = item.feelsLike !== undefined ? item.feelsLike : item.temp;
                  return (
                    <div
                      key={idx}
                      className={`min-w-[62px] sm:min-w-0 flex flex-col items-center justify-between p-1 sm:p-1.5 rounded-lg shrink-0 sm:shrink transition-all ${
                        idx === 0 ? 'bg-blue-50/70 border border-blue-100' : 'hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-[10px] font-bold text-slate-800">{item.time}</span>
                      <div className="py-1 flex items-center justify-center h-6 sm:h-7">
                        {renderHourlyIcon(item.icon, item.condition, item.time)}
                      </div>
                      <span className="text-[11px] font-bold text-slate-900">{convertTemp(item.temp)}</span>
                      <span className="text-[9px] text-slate-400 font-medium mt-0.5">
                        {convertTemp(feelsVal)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Row 2: Weather Map + Weather Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            
            {/* 3. Weather Map Card (Compact) */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-1.5">
                  <Map className="w-3.5 h-3.5 text-slate-700" />
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">Weather Map</h3>
                    <p className="text-[9px] sm:text-[10px] text-slate-400 font-normal">Live weather radar ({city})</p>
                  </div>
                </div>

                {/* Layer Selector Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsLayerDropdownOpen(!isLayerDropdownOpen)}
                    className="flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    <span>{selectedMapLayer}</span>
                    <ChevronDown className="w-3 h-3 text-slate-500" />
                  </button>

                  {isLayerDropdownOpen && (
                    <div className="absolute right-0 mt-1 w-32 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1">
                      {mapLayerOptions.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => {
                            setSelectedMapLayer(opt);
                            setIsLayerDropdownOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-1 text-xs font-medium hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer ${
                            selectedMapLayer === opt ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-700'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Map Canvas (Compact height) */}
              <div className="h-36 sm:h-44 rounded-lg sm:rounded-xl bg-slate-100/90 border border-slate-200/80 relative overflow-hidden flex items-center justify-center select-none my-0.5">
                <div
                  className="w-full h-full relative transition-transform duration-300 ease-out"
                  style={{ transform: `scale(${mapZoomLevel})` }}
                >
                  <svg viewBox="0 0 500 350" className="w-full h-full object-cover opacity-90" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="500" height="350" fill="#E2E8F0" fillOpacity="0.4" />
                    <text x="70" y="140" className="text-[11px] fill-slate-400 font-semibold uppercase tracking-wider">Pakistan</text>
                    <text x="230" y="190" className="text-[11px] fill-slate-400 font-semibold uppercase tracking-wider">India</text>
                    <text x="390" y="110" className="text-[11px] fill-slate-400 font-semibold uppercase tracking-wider">China</text>
                    <text x="70" y="240" className="text-[9px] fill-slate-400 font-medium">Arabian Sea</text>
                    <text x="390" y="270" className="text-[9px] fill-slate-400 font-medium">Bay of Bengal</text>

                    <path
                      d="M140 40 L210 30 L270 45 L320 80 L380 90 L420 130 L390 180 L350 210 L300 280 L270 320 L250 340 L240 310 L210 260 L180 210 L150 160 L120 130 L110 90 Z"
                      fill="#CBD5E1"
                      stroke="#94A3B8"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                  </svg>

                  {/* Weather Layer Visual */}
                  <div className="absolute top-1/3 left-1/3 w-36 h-36 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

                  <div className="absolute top-12 left-24 text-white drop-shadow-md">
                    <Cloud className="w-6 h-6 fill-white/80 text-white" />
                  </div>
                  <div className="absolute top-16 right-28 text-blue-500 drop-shadow-md">
                    <CloudRain className="w-6 h-6 fill-white/90 text-blue-400" />
                  </div>
                  <div className="absolute bottom-12 left-40 text-blue-500 drop-shadow-md">
                    <CloudRain className="w-6 h-6 fill-white/90 text-blue-400" />
                  </div>

                  {/* Location Pin */}
                  <div className="absolute top-[68%] left-[45%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg ring-3 ring-blue-500/30 animate-bounce">
                      <MapPin className="w-3 h-3 fill-white text-blue-600" />
                    </div>
                  </div>
                </div>

                {/* Zoom Controls */}
                <div className="absolute bottom-2 left-2 flex flex-col bg-white rounded-md shadow-xs border border-slate-200 overflow-hidden z-10">
                  <button
                    onClick={() => setMapZoomLevel((prev) => Math.min(prev + 0.15, 1.4))}
                    className="p-0.5 hover:bg-slate-50 text-slate-700 transition-colors border-b border-slate-100 cursor-pointer"
                    title="Zoom In"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setMapZoomLevel((prev) => Math.max(prev - 0.15, 0.8))}
                    className="p-0.5 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
                    title="Zoom Out"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                </div>

                <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1 text-[9px] text-slate-500 font-medium">
                  <span>Light</span>
                  <div className="w-12 h-1.5 rounded-full bg-gradient-to-r from-blue-200 via-blue-400 to-blue-700" />
                  <span>Heavy</span>
                </div>
              </div>
            </div>

            {/* 4. Weather Details Card (Compact 2x3 Grid) */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center gap-1.5 pb-2">
                <Info className="w-3.5 h-3.5 text-slate-700" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">Weather Details</h3>
              </div>

              <div className="grid grid-cols-2 gap-1.5 sm:gap-2 py-0.5">
                {/* Feels Like */}
                <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                  <Thermometer className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700 shrink-0" />
                  <div>
                    <span className="text-[9px] sm:text-[10px] text-slate-500 font-normal block leading-tight">Feels Like</span>
                    <span className="text-xs font-bold text-slate-900">{displayFeelsLike}{unitSymbol}</span>
                  </div>
                </div>

                {/* Humidity */}
                <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                  <Droplets className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 shrink-0" />
                  <div>
                    <span className="text-[9px] sm:text-[10px] text-slate-500 font-normal block leading-tight">Humidity</span>
                    <span className="text-xs font-bold text-slate-900">{humidity}%</span>
                  </div>
                </div>

                {/* Wind */}
                <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                  <Wind className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700 shrink-0" />
                  <div>
                    <span className="text-[9px] sm:text-[10px] text-slate-500 font-normal block leading-tight">Wind</span>
                    <span className="text-xs font-bold text-slate-900">{windSpeed} km/h</span>
                  </div>
                </div>

                {/* Pressure */}
                <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                  <Gauge className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700 shrink-0" />
                  <div>
                    <span className="text-[9px] sm:text-[10px] text-slate-500 font-normal block leading-tight">Pressure</span>
                    <span className="text-xs font-bold text-slate-900">{pressure} hPa</span>
                  </div>
                </div>

                {/* Visibility */}
                <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700 shrink-0" />
                  <div>
                    <span className="text-[9px] sm:text-[10px] text-slate-500 font-normal block leading-tight">Visibility</span>
                    <span className="text-xs font-bold text-slate-900">{visibility} km</span>
                  </div>
                </div>

                {/* Cloud Cover */}
                <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                  <Cloud className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700 shrink-0" />
                  <div>
                    <span className="text-[9px] sm:text-[10px] text-slate-500 font-normal block leading-tight">Cloud Cover</span>
                    <span className="text-xs font-bold text-slate-900">{cloudCover}%</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* ========================================================= */}
        {/* RIGHT 4-COLUMN AREA */}
        {/* ========================================================= */}
        <div className="lg:col-span-4 space-y-3 sm:space-y-4">
          
          {/* 5. 5-Day Forecast Card (Compact) */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-700" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">5-Day Forecast</h3>
              </div>
              <Link
                href="/dashboard"
                className="text-[10px] sm:text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>View More</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-1.5 sm:space-y-2 pt-2">
              {dailyForecast.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-0.5">
                  <span className="font-semibold text-slate-800 w-20 sm:w-22 text-[10px] sm:text-[11px] truncate">
                    {item.date || item.day}
                  </span>
                  <div className="flex items-center justify-center w-5 sm:w-6">
                    {item.icon === 'rain' ? (
                      <CloudRain className="w-3.5 h-3.5 text-blue-500" />
                    ) : item.icon === 'sun' ? (
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                    ) : (
                      <CloudSun className="w-3.5 h-3.5 text-amber-500" />
                    )}
                  </div>
                  <span className="font-bold text-slate-900 w-16 text-center text-[10px] sm:text-[11px]">
                    {convertTemp(item.tempMax)} / {convertTemp(item.tempMin)}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-slate-500 font-normal text-right w-18 sm:w-20 truncate">
                    {item.condition}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 6. Sun & Moon Card (Compact) */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-1.5 pb-2">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">Sun & Moon</h3>
            </div>

            {/* Sun Arc Path Visual */}
            <div className="relative py-1 px-3 flex flex-col items-center justify-center">
              <svg viewBox="0 0 200 80" className="w-full h-12 sm:h-14 overflow-visible">
                <path
                  d="M 20 70 Q 100 0 180 70"
                  fill="none"
                  stroke="#CBD5E1"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
                <circle cx="100" cy="35" r="7" fill="#F59E0B" className="animate-pulse" />
                <path d="M100 22 L100 25 M100 45 L100 48 M87 35 L90 35 M110 35 L113 35" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
              </svg>

              <div className="w-full flex items-center justify-between text-[10px] font-medium text-slate-600 mt-0.5">
                <div>
                  <span className="text-slate-400 block text-[9px]">Sunrise</span>
                  <span className="font-bold text-slate-900">{sunrise}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[9px]">Sunset</span>
                  <span className="font-bold text-slate-900">{sunset}</span>
                </div>
              </div>
            </div>

            {/* Moon Stats */}
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-800 text-slate-100 flex items-center justify-center">
                  <Moon className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-slate-300 text-slate-800" />
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-normal block leading-tight">Moon Phase</span>
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-900">{moonPhase}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[9px] text-slate-400 font-normal block leading-tight">Illumination</span>
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-900">{moonIllumination}</span>
              </div>
            </div>
          </div>

          {/* 7. Air Quality Index Card (Compact) */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5 text-emerald-500" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">Air Quality Index</h3>
              </div>
              <Info className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <div className="flex items-center gap-3 sm:gap-4 py-1">
              <div className="relative flex items-center justify-center shrink-0 w-20 h-20 sm:w-22 sm:h-22">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r={aqiRadius} stroke="#E2E8F0" strokeWidth={aqiStrokeWidth} fill="transparent" />
                  <circle
                    cx="60"
                    cy="60"
                    r={aqiRadius}
                    stroke={aqiColor}
                    strokeWidth={aqiStrokeWidth}
                    strokeDasharray={aqiCircumference}
                    strokeDashoffset={aqiStrokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-lg sm:text-xl font-bold text-slate-900 leading-none">{aqiScore}</span>
                  <span className="text-[9px] sm:text-[10px] font-semibold text-slate-500 mt-0.5">{aqiLabel}</span>
                </div>
              </div>

              <div className="space-y-0.5 text-[9px] sm:text-[10px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-slate-600 font-medium w-12 sm:w-14">0 – 50</span>
                  <span className="text-slate-800 font-semibold">Good</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span className="text-slate-600 font-medium w-12 sm:w-14">51 – 100</span>
                  <span className="text-slate-800 font-semibold">Moderate</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                  <span className="text-slate-600 font-medium w-12 sm:w-14">101 – 150</span>
                  <span className="text-slate-800 font-semibold">Unhealthy</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                  <span className="text-slate-600 font-medium w-12 sm:w-14">151 – 200</span>
                  <span className="text-slate-800 font-semibold">Poor</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Bottom Full-Width Alert Notice Banner (Compact) */}
      <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-blue-50/90 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
              {alertSummaryText}
            </h4>
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-normal">
              We&apos;ll notify you if there are any upcoming severe weather conditions.
            </p>
          </div>
        </div>

        <Link
          href="/alerts"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-blue-600 border border-blue-200 rounded-lg sm:rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Bell className="w-3 h-3" />
          <span>Set Alerts</span>
        </Link>
      </div>

    </main>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-transparent flex font-sans text-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar />
        <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading weather details...</div>}>
          <WeatherSearchContent />
        </Suspense>
      </div>
    </div>
  );
}
