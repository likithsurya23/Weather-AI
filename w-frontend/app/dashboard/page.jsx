'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Droplets,
  Wind,
  Gauge,
  Eye,
  ArrowRight,
  Sun,
  Cloud,
  CloudSun,
  CloudRain,
  Info,
  Leaf,
  Map,
  Plus,
  AlertTriangle,
  Bell,
  Bookmark,
  Check,
  Bot,
  Send,
  X,
  Search,
  ExternalLink
} from 'lucide-react';
import Sidebar from '../../src/components/layout/Sidebar';
import TopNavbar from '../../src/components/layout/TopNavbar';
import { useApp } from '../../src/Hooks/useAppContext';
import { api } from '../../src/lib/api';
import { formatDegree, formatTemp, formatTempNumber } from '../../src/lib/weatherUtils';
import ProtectedRoute from '../../src/components/auth/ProtectedRoute';
import WeatherRadarSatelliteMap from '../../src/components/map/WeatherRadarSatelliteMap';
import { findMatchingCities } from '../../src/lib/citiesData';

export default function DashboardPage() {
  const router = useRouter();
  const { weather, user, currentCity, toggleFavorite, isFavorite, temperatureUnit, t } = useApp();

  const [alerts, setAlerts] = useState([]);
  const [news, setNews] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [hoveredTrendPoint, setHoveredTrendPoint] = useState(null);
  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');

  // Search Modal state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    let isMounted = true;
    api.getAlerts().then((res) => {
      if (isMounted && res) setAlerts(res);
    });

    api.getDisasterNews('all', '', 3).then((res) => {
      if (isMounted) {
        if (res && res.length > 0) {
          setNews(res);
        }
        setLoadingNews(false);
      }
    }).catch(() => {
      if (isMounted) setLoadingNews(false);
    });

    return () => {
      isMounted = false;
    };
  }, [currentCity]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dash.goodMorning', 'Good Morning');
    if (hour < 18) return t('dash.goodAfternoon', 'Good Afternoon');
    return t('dash.goodEvening', 'Good Evening');
  };

  const displayName = user?.name ? user.name.split(' ')[0] : 'User';

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date());

  // -------------------------------------------------------------
  // LIVE CURRENT WEATHER METRICS
  // -------------------------------------------------------------
  const city = weather?.city || currentCity || 'Mysore';
  const country = weather?.country || 'India';
  const rawTemp = weather?.temp !== undefined ? Math.round(weather.temp) : 24;
  const condition = weather?.condition || 'Clear';
  const rawFeelsLike = weather?.feelsLike !== undefined ? Math.round(weather.feelsLike) : rawTemp;
  const humidity = weather?.humidity !== undefined ? weather.humidity : 50;
  const windSpeed = weather?.windSpeed !== undefined ? weather.windSpeed : 10;
  const pressure = weather?.pressure !== undefined ? weather.pressure : 1013;
  const visibility = weather?.visibility !== undefined ? weather.visibility : 10;

  const displayTemp = formatTempNumber(rawTemp, temperatureUnit);
  const displayFeelsLike = formatTempNumber(rawFeelsLike, temperatureUnit);
  const unitSymbol = temperatureUnit === 'fahrenheit' ? '°F' : '°C';

  // -------------------------------------------------------------
  // LIVE 5-DAY FORECAST DATA
  // -------------------------------------------------------------
  const forecastList = weather?.daily && weather.daily.length > 0
    ? weather.daily.slice(0, 5)
    : [
      { day: 'Today', date: 'Now', tempMax: rawTemp, tempMin: Math.max(rawTemp - 6, 15), condition, icon: 'sun' }
    ];

  const renderForecastIcon = (iconType, cond = '') => {
    const c = (cond || '').toLowerCase();
    const type = iconType || (c.includes('rain') ? 'rain' : c.includes('sun') ? 'sun' : 'partly-cloudy');

    if (type === 'rain' || c.includes('rain')) {
      return <CloudRain className="w-6 h-6 text-blue-500" />;
    }
    if (type === 'sun' || c.includes('clear') || c.includes('sunny')) {
      return <Sun className="w-6 h-6 text-amber-500" />;
    }
    if (type === 'cloudy' || c.includes('overcast')) {
      return <Cloud className="w-6 h-6 text-slate-400" />;
    }
    return <CloudSun className="w-6 h-6 text-amber-500" />;
  };

  // -------------------------------------------------------------
  // LIVE TEMPERATURE TREND SVG CHART
  // -------------------------------------------------------------
  const trendData = weather?.hourly && weather.hourly.length >= 4
    ? weather.hourly.slice(0, 6)
    : [
      { time: 'Now', temp: rawTemp },
      { time: '+2h', temp: rawTemp + 1 },
      { time: '+4h', temp: rawTemp + 2 },
      { time: '+6h', temp: rawTemp },
      { time: '+8h', temp: Math.max(rawTemp - 2, 10) },
      { time: '+10h', temp: Math.max(rawTemp - 4, 8) }
    ];

  const tempsArray = trendData.map((d) => d.temp);
  const minTempInData = Math.min(...tempsArray);
  const maxTempInData = Math.max(...tempsArray);
  const yMin = Math.floor(Math.min(minTempInData - 4, 0) / 10) * 10;
  const yMax = Math.ceil(Math.max(maxTempInData + 6, 40) / 10) * 10;

  const chartHeight = 110;
  const topPadding = 15;
  const leftPadding = 35;
  const rightPadding = 15;
  const chartWidth = 360 - leftPadding - rightPadding;

  const getY = (tempVal) => {
    const clamped = Math.max(yMin, Math.min(yMax, tempVal));
    const ratio = (clamped - yMin) / (yMax - yMin || 1);
    return topPadding + chartHeight * (1 - ratio);
  };

  const getX = (index) => {
    const divisor = Math.max(trendData.length - 1, 1);
    return leftPadding + (index / divisor) * chartWidth;
  };

  const trendPoints = trendData.map((d, i) => ({
    x: getX(i),
    y: getY(d.temp),
    time: d.time,
    temp: d.temp
  }));

  let pathD = trendPoints.length > 0 ? `M ${trendPoints[0].x} ${trendPoints[0].y}` : '';
  for (let i = 0; i < trendPoints.length - 1; i++) {
    const p0 = trendPoints[i];
    const p1 = trendPoints[i + 1];
    const cpX = (p0.x + p1.x) / 2;
    pathD += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  const lastPoint = trendPoints[trendPoints.length - 1] || { x: 340 };
  const firstPoint = trendPoints[0] || { x: 35 };
  const areaD = pathD ? `${pathD} L ${lastPoint.x} ${topPadding + chartHeight} L ${firstPoint.x} ${topPadding + chartHeight} Z` : '';

  const step = (yMax - yMin) / 4 || 10;
  const yLabels = [yMax, yMax - step, yMax - step * 2, yMax - step * 3, yMin].map(Math.round);

  // -------------------------------------------------------------
  // LIVE AIR QUALITY DATA & GAUGE
  // -------------------------------------------------------------
  const aqiVal = weather?.airQuality?.aqi !== undefined ? weather.airQuality.aqi : 45;
  const aqiLabel = weather?.airQuality?.label || (aqiVal <= 50 ? 'Good' : aqiVal <= 100 ? 'Moderate' : 'Unhealthy');

  const pollutants = [
    { name: 'PM2.5', value: weather?.airQuality?.pm25 !== undefined ? weather.airQuality.pm25 : 12 },
    { name: 'PM10', value: weather?.airQuality?.pm10 !== undefined ? weather.airQuality.pm10 : 24 },
    { name: 'NO2', value: weather?.airQuality?.no2 !== undefined ? weather.airQuality.no2 : 18 },
    { name: 'SO2', value: weather?.airQuality?.so2 !== undefined ? weather.airQuality.so2 : 6 },
    { name: 'O3', value: weather?.airQuality?.o3 !== undefined ? weather.airQuality.o3 : 38 },
  ];

  const aqiRadius = 48;
  const aqiStrokeWidth = 8;
  const aqiCircumference = 2 * Math.PI * aqiRadius;
  const aqiPercentage = Math.min(Math.max(aqiVal / 150, 0.08), 0.96);
  const aqiStrokeDashoffset = aqiCircumference - aqiPercentage * aqiCircumference;
  const aqiColor = aqiVal <= 50 ? '#10B981' : aqiVal <= 100 ? '#F59E0B' : '#EF4444';


  // -------------------------------------------------------------
  // LIVE ALERTS DATA
  // -------------------------------------------------------------
  const alertItem = alerts && alerts.length > 0 ? alerts[0] : {
    title: 'Meteorological Advisory',
    description: `Current weather for ${city}: ${condition} at ${displayTemp}${unitSymbol}. No extreme weather advisories active.`,
    time: 'Live Update'
  };

  // -------------------------------------------------------------
  // ACTIONS
  // -------------------------------------------------------------
  const isCurrentFav = isFavorite(city);

  const handleSaveLocation = async () => {
    await toggleFavorite(city, country, rawTemp, condition);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleAiSubmit = (e) => {
    e?.preventDefault();
    if (aiQuestion.trim()) {
      router.push(`/chat?prompt=${encodeURIComponent(aiQuestion.trim())}`);
    } else {
      router.push('/chat');
    }
  };

  const handleLocationSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    const q = val.trim();
    if (!q) {
      setSearchResults([]);
    } else {
      const local = findMatchingCities(q, 6);
      setSearchResults(local);
    }
  };

  // Live autocomplete remote debounced lookup in Add Location modal
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) return;

    // Debounced remote lookup
    const timer = setTimeout(async () => {
      try {
        const remote = await api.searchLocations(q);
        if (remote && remote.length > 0) {
          setSearchResults((prev) => {
            const seen = new Set(prev.map((p) => `${p.name.toLowerCase()}-${(p.country || '').toLowerCase()}`));
            const merged = [...prev];
            for (const r of remote) {
              const key = `${r.name.toLowerCase()}-${(r.country || '').toLowerCase()}`;
              if (!seen.has(key)) {
                seen.add(key);
                merged.push(r);
              }
            }
            return merged.slice(0, 8);
          });
        }
      } catch {
        // Fallback to local
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchModalSubmit = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const data = await api.searchLocations(searchQuery.trim());
      setSearchResults(data || []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-transparent flex font-sans text-slate-900">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar />

        <main className="flex-1 p-2.5 sm:p-4 lg:p-5 max-w-[1400px] w-full mx-auto space-y-3 sm:space-y-4 pb-20 lg:pb-8">
          {/* Top Greeting Header Card (Small & Compact) */}
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-2.5 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 transition-colors">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 shrink-0">
                {new Date().getHours() < 18 ? (
                  <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-200" />
                ) : (
                  <CloudSun className="w-4 h-4 sm:w-5 sm:h-5 text-blue-100" />
                )}
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  {getGreeting()}, {displayName}!
                </h1>
                <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-normal mt-0.5">
                  Here&apos;s the latest live weather update for your location.
                </p>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-1.5 sm:pt-0 border-slate-100 dark:border-slate-800/80 text-[11px] sm:text-xs text-slate-500 font-medium">
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* Main 2-Column Weather Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-start">

            {/* ========================================================= */}
            {/* LEFT 8-COLUMN AREA */}
            {/* ========================================================= */}
            <div className="lg:col-span-8 space-y-3 sm:space-y-4">

              {/* Row 1: Current Weather + 5-Day Forecast */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">

                {/* 1. Current Weather Card (Compact) */}
                <div className="bg-gradient-to-br from-blue-50/70 via-white to-blue-50/40 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between h-full relative overflow-hidden">
                  <div>
                    <div className="flex items-center gap-1.5 text-slate-800 font-semibold text-xs sm:text-xs">
                      <MapPin className="w-3.5 h-3.5 text-slate-700" />
                      <span>{city}{country ? `, ${country}` : ''}</span>
                    </div>

                    <div className="mt-2.5 sm:mt-3 flex items-center justify-between">
                      <div>
                        <div className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                          {displayTemp}{unitSymbol}
                        </div>
                        <div className="text-xs sm:text-sm font-semibold text-slate-800 mt-0.5">
                          {condition}
                        </div>
                        <div className="text-[10px] sm:text-[11px] text-slate-500 font-normal mt-0.5">
                          {t('dash.feelsLike', 'Feels like')} {displayFeelsLike}{unitSymbol}
                        </div>
                      </div>

                      {/* Sun & Cloud Illustration (Compact) */}
                      <div className="relative w-14 h-14 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center">
                        <div className="absolute top-1 sm:top-1.5 right-1.5 sm:right-3 w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-amber-400 shadow-md shadow-amber-400/50 animate-pulse" style={{ animationDuration: '4s' }} />
                        <div className="absolute bottom-1 sm:bottom-1.5 right-0.5 z-10">
                          <svg className="w-12 h-8 sm:w-16 sm:h-11 filter drop-shadow-sm" viewBox="0 0 80 50" fill="none">
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

                  {/* 4 Bottom Metrics */}
                  <div className="grid grid-cols-4 gap-1 pt-2.5 sm:pt-3 mt-2.5 sm:mt-3 border-t border-slate-200/60 text-center">
                    <div className="flex flex-col items-center">
                      <Droplets className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-500 mb-0.5" />
                      <span className="text-[9px] sm:text-[10px] text-slate-500 font-normal">{t('dash.humidity', 'Humidity')}</span>
                      <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 mt-0.5">{humidity}%</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Wind className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500 mb-0.5" />
                      <span className="text-[9px] sm:text-[10px] text-slate-500 font-normal">{t('dash.windSpeed', 'Wind')}</span>
                      <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 mt-0.5">{windSpeed} km/h</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Gauge className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500 mb-0.5" />
                      <span className="text-[9px] sm:text-[10px] text-slate-500 font-normal">{t('dash.pressure', 'Pressure')}</span>
                      <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 mt-0.5">{pressure} hPa</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500 mb-0.5" />
                      <span className="text-[9px] sm:text-[10px] text-slate-500 font-normal">{t('dash.visibility', 'Visibility')}</span>
                      <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 mt-0.5">{visibility} km</span>
                    </div>
                  </div>
                </div>

                {/* 2. 5-Day Forecast Card (Compact) */}
                <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between h-full">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      {t('dash.sevenDayForecast', '5-Day Forecast')}
                    </h3>
                    <Link
                      href="/search"
                      className="text-[10px] sm:text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                    >
                      <span>{t('common.details', 'View Details')}</span>
                      <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-5 gap-1 pt-3 sm:pt-4 pb-0.5 text-center items-center">
                    {forecastList.map((item, index) => {
                      const dayName = item.day || 'Day';
                      const dateStr = item.date || `Day ${index + 1}`;
                      return (
                        <div key={index} className="flex flex-col items-center justify-between space-y-1 sm:space-y-1.5">
                          <div>
                            <div className="text-[10px] sm:text-[11px] font-bold text-slate-800 truncate w-10 sm:w-12 mx-auto">{dayName}</div>
                            <div className="text-[9px] sm:text-[10px] text-slate-400 font-normal truncate w-10 sm:w-12 mx-auto">{dateStr}</div>
                          </div>
                          <div className="py-0.5 flex items-center justify-center h-5 sm:h-7">
                            {renderForecastIcon(item.icon, item.condition)}
                          </div>
                          <div>
                            <div className="text-[10px] sm:text-[11px] font-bold text-slate-900">
                              {formatDegree(item.tempMax, temperatureUnit)}
                            </div>
                            <div className="text-[9px] sm:text-[10px] text-slate-400 font-medium mt-0.5">
                              {formatDegree(item.tempMin, temperatureUnit)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Row 2: Temperature Trend + Air Quality Index */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">

                {/* 3. Temperature Trend Card */}
                <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between h-full">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      {t('dash.tempTrend', 'Temperature Trend')}
                    </h3>
                    <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium">
                      {t('dash.hourlyForecast', '24-Hour Forecast')}
                    </span>
                  </div>

                  <div className="relative pt-4 w-full">
                    <svg viewBox="0 0 360 160" className="w-full h-auto overflow-visible">
                      <defs>
                        <linearGradient id="tempAreaGradMainLive" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.15" />
                          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {yLabels.map((val, idx) => {
                        const y = getY(val);
                        return (
                          <g key={idx}>
                            <text
                              x={leftPadding - 8}
                              y={y + 3}
                              textAnchor="end"
                              className="text-[10px] fill-slate-400 font-medium select-none"
                            >
                              {val}°
                            </text>
                            <line
                              x1={leftPadding}
                              y1={y}
                              x2={360 - rightPadding}
                              y2={y}
                              stroke="#E2E8F0"
                              strokeWidth="1"
                            />
                          </g>
                        );
                      })}

                      {areaD && <path d={areaD} fill="url(#tempAreaGradMainLive)" />}
                      {pathD && <path d={pathD} fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" />}

                      {trendPoints.map((pt, idx) => {
                        const isHovered = hoveredTrendPoint === idx;
                        return (
                          <g key={idx}>
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r={isHovered ? 5.5 : 4}
                              fill="#2563EB"
                              stroke="#FFFFFF"
                              strokeWidth="2"
                              className="transition-all cursor-pointer"
                              onMouseEnter={() => setHoveredTrendPoint(idx)}
                              onMouseLeave={() => setHoveredTrendPoint(null)}
                            />
                          </g>
                        );
                      })}

                      {trendPoints.map((pt, idx) => (
                        <text
                          key={idx}
                          x={pt.x}
                          y={topPadding + chartHeight + 18}
                          textAnchor="middle"
                          className="text-[10px] fill-slate-400 font-medium select-none"
                        >
                          {pt.time}
                        </text>
                      ))}
                    </svg>

                    {hoveredTrendPoint !== null && trendPoints[hoveredTrendPoint] && (
                      <div
                        className="absolute -top-3 bg-slate-900 text-white text-[11px] font-bold px-2 py-1 rounded-md shadow-md pointer-events-none transform -translate-x-1/2 -translate-y-full transition-all"
                        style={{
                          left: `${(trendPoints[hoveredTrendPoint].x / 360) * 100}%`
                        }}
                      >
                        {formatTemp(trendPoints[hoveredTrendPoint].temp, temperatureUnit)}
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Air Quality Index Card (Compact) */}
                <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between h-full">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      {t('dash.airQuality', 'Air Quality Index')}
                    </h3>
                    <button
                      title="AQI indicates ambient pollution levels and health safety."
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between py-2 sm:py-2.5 gap-3 sm:gap-4">
                    <div className="relative flex items-center justify-center shrink-0 w-24 h-24 sm:w-28 sm:h-28">
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
                        <Leaf className="w-3.5 h-3.5 text-emerald-500 mb-0.5 fill-emerald-500" />
                        <span className="text-lg sm:text-xl font-bold text-slate-900 leading-none">{aqiVal}</span>
                        <span className="text-[9px] sm:text-[10px] font-semibold text-slate-500 mt-0.5">{aqiLabel}</span>
                      </div>
                    </div>

                    <div className="w-full sm:flex-1 space-y-1 text-[11px] sm:text-xs">
                      {pollutants.map((p) => (
                        <div key={p.name} className="flex items-center justify-between font-medium">
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            <span>{p.name}</span>
                          </div>
                          <span className="font-bold text-slate-800">{p.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg sm:rounded-xl bg-emerald-50/70 border border-emerald-100 text-slate-700 text-[10px] sm:text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="font-medium text-slate-700">
                      {aqiVal <= 50 ? t('dash.airQualityGood', 'Air quality is satisfactory. Enjoy your day!') : `Air quality is ${aqiLabel.toLowerCase()} in ${city}.`}
                    </span>
                  </div>
                </div>

              </div>

              {/* Row 3: 5. Weather Radar & Satellite Map Card */}
              <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
                <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <Map className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                        Weather Radar & Satellite Map
                      </h3>
                      <p className="text-[10px] sm:text-[11px] text-slate-400 font-normal">
                        Live Doppler radar, precipitation sweeps & satellite imagery ({city})
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/map"
                    className="text-[10px] sm:text-[11px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>{t('dash.viewFullMap', 'View Full Map')}</span>
                    <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </Link>
                </div>

                <div className="pt-2.5 sm:pt-3">
                  <WeatherRadarSatelliteMap
                    city={city}
                    country={country}
                    lat={weather?.lat}
                    lon={weather?.lon}
                    temp={rawTemp}
                    condition={condition}
                    windSpeed={windSpeed}
                    windDir={weather?.windDir || 'NE'}
                    humidity={humidity}
                    rainProbability={weather?.rainProbability || 20}
                    temperatureUnit={temperatureUnit}
                    heightClass="h-56 sm:h-64 md:h-72"
                    showFullMapLink={true}
                  />
                </div>
              </div>

            </div>

            {/* ========================================================= */}
            {/* RIGHT 4-COLUMN AREA (Compact) */}
            {/* ========================================================= */}
            <div className="lg:col-span-4 space-y-3 sm:space-y-4">

              {/* 6. Live Alerts Card */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between pb-2 sm:pb-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4.5 h-4.5 rounded-md bg-red-100 text-red-600 flex items-center justify-center">
                      <AlertTriangle className="w-3 h-3 fill-red-600 text-white" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">{t('dash.activeAlerts', 'Alerts')}</h3>
                  </div>

                  <Link
                    href="/alerts"
                    className="text-[10px] sm:text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                  >
                    <span>{t('common.viewAll', 'View All')}</span>
                    <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </Link>
                </div>

                <div className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-red-50/80 border border-red-100 flex items-start gap-2.5 transition-all">
                  <div className="w-6 h-6 rounded-lg bg-red-100/90 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-red-600 text-white" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-900 leading-tight">
                      {alertItem.title}
                    </h4>
                    <p className="text-[10px] sm:text-[11px] text-slate-600 leading-snug">
                      {alertItem.description}
                    </p>
                    <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium block pt-0.5">
                      {alertItem.time || t('common.live', 'Live Alert')}
                    </span>
                  </div>
                </div>
              </div>

              {/* 7. Quick Actions Card */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-xs">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 pb-2">
                  {t('fav.addLocation', 'Quick Actions')}
                </h3>

                <div className="space-y-1 pt-0.5">
                  <button
                    onClick={() => setIsAddLocationOpen(true)}
                    className="w-full flex items-center justify-between p-2 sm:p-2.5 rounded-lg sm:rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200/60 text-slate-700 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 sm:gap-2.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-600 transition-colors" />
                      <span className="text-xs font-semibold text-slate-800">{t('fav.addLocation', 'Add Location')}</span>
                    </div>
                    <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-800 transition-colors" />
                  </button>

                  <Link
                    href="/alerts"
                    className="w-full flex items-center justify-between p-2 sm:p-2.5 rounded-lg sm:rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200/60 text-slate-700 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 sm:gap-2.5">
                      <Bell className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-600 transition-colors" />
                      <span className="text-xs font-semibold text-slate-800">{t('settings.notifications', 'Set Alerts')}</span>
                    </div>
                    <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-800 transition-colors" />
                  </Link>

                  <button
                    onClick={handleSaveLocation}
                    className="w-full flex items-center justify-between p-2 sm:p-2.5 rounded-lg sm:rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200/60 text-slate-700 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 sm:gap-2.5">
                      <Bookmark className={`w-3.5 h-3.5 ${isCurrentFav ? 'text-blue-600 fill-blue-600' : 'text-slate-600 group-hover:text-blue-600'} transition-colors`} />
                      <span className="text-xs font-semibold text-slate-800">
                        {savedSuccess ? t('dash.savedLocation', 'Location Saved!') : isCurrentFav ? t('dash.savedLocation', 'Saved in Favorites') : t('dash.saveLocation', 'Save This Location')}
                      </span>
                    </div>
                    {savedSuccess ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-800 transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              {/* 8. Live Disaster News Card (Connected to Real Live Global News API) */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between pb-2 sm:pb-3">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    {t('dash.disasterMonitoring', 'Disaster News')}
                  </h3>
                  <Link
                    href="/alerts"
                    className="text-[10px] sm:text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                  >
                    <span>{t('common.viewAll', 'View All')}</span>
                    <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </Link>
                </div>

                <div className="space-y-2 sm:space-y-2.5">
                  {loadingNews ? (
                    <div className="space-y-1.5 py-1.5 animate-pulse">
                      <div className="h-8 bg-slate-100 rounded-lg" />
                      <div className="h-8 bg-slate-100 rounded-lg" />
                      <div className="h-8 bg-slate-100 rounded-lg" />
                    </div>
                  ) : news.length > 0 ? (
                    news.map((item, index) => (
                      <a
                        key={item.id || index}
                        href={item.url || '/alerts'}
                        target={item.url ? '_blank' : '_self'}
                        rel="noreferrer"
                        className="flex items-start gap-2 sm:gap-2.5 group cursor-pointer"
                      >
                        {/* News Thumbnail Image */}
                        <div className="w-10 h-8 sm:w-12 sm:h-10 rounded-md sm:rounded-lg bg-slate-100 border border-slate-200/80 overflow-hidden shrink-0 flex items-center justify-center">
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={item.title || 'News thumbnail'}
                              width={48}
                              height={40}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-600 text-[9px] sm:text-[10px] font-bold">
                              {item.category?.slice(0, 3).toUpperCase() || 'NEWS'}
                            </div>
                          )}
                        </div>

                        {/* Headline and time */}
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <h4 className="text-[10px] sm:text-[11px] font-semibold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                            {item.title}
                          </h4>
                          <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] text-slate-400 font-normal">
                            <span>{item.time || t('common.live', 'Live')}</span>
                            {item.source && <span>• {item.source}</span>}
                          </div>
                        </div>

                        {item.url && (
                          <ExternalLink className="w-2.5 h-2.5 text-slate-300 group-hover:text-blue-600 shrink-0 mt-1 transition-colors" />
                        )}
                      </a>
                    ))
                  ) : (
                    <div className="text-center py-3 text-xs text-slate-400">
                      {t('alerts.noAlerts', 'No disaster news reported at this time.')}
                    </div>
                  )}
                </div>
              </div>

              {/* 9. AI Weather Assistant Card */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 pb-2">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      {t('dash.askAi', 'AI Weather Assistant')}
                    </h3>
                  </div>

                  <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed pt-0.5">
                    {t('chat.subtitle', 'Hi! I\'m your Weather AI Assistant. Ask me anything about the weather, natural disasters, or safety tips.')}
                  </p>

                  <div className="space-y-1.5 pt-2.5">
                    {[
                      `Will it rain in ${city} today?`,
                      'Any active storm or cyclone warnings nearby?'
                    ].map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => router.push(`/chat?prompt=${encodeURIComponent(prompt)}`)}
                        className="w-full text-left px-2.5 py-1.5 rounded-full border border-blue-200 bg-blue-50/50 hover:bg-blue-100/70 text-blue-700 text-[10px] sm:text-[11px] font-medium transition-all cursor-pointer truncate"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleAiSubmit} className="relative pt-3">
                  <input
                    type="text"
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    placeholder={t('dash.askAiPlaceholder', 'Type your question...')}
                    className="w-full pl-3 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-normal"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 bottom-1.5 p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer"
                    title={t('chat.send', 'Send Question')}
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

            </div>

          </div>
        </main>
      </div>

      {/* Add Location Search Modal */}
      {isAddLocationOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Add New Location</h3>
                <p className="text-xs text-slate-400">Search for cities to pin on your favorites</p>
              </div>
              <button
                onClick={() => setIsAddLocationOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={handleSearchModalSubmit} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleLocationSearchChange}
                    placeholder="Enter city or region name..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:border-blue-500 font-medium"
                  />
                </div>
                <button
                  type="submit"
                  disabled={searching}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50 transition-all cursor-pointer"
                >
                  {searching ? 'Searching...' : 'Search'}
                </button>
              </form>

              <div className="mt-5 space-y-2 max-h-60 overflow-y-auto">
                {searchResults.length > 0 ? (
                  searchResults.map((item, idx) => {
                    const isAdded = isFavorite(item.name);
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900">{item.name}</div>
                            <div className="text-xs text-slate-400">{item.region ? `${item.region}, ` : ''}{item.country}</div>
                          </div>
                        </div>

                        <button
                          onClick={() => toggleFavorite(item.name, item.country, 24, 'Sunny')}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${isAdded
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                            }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Added</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })
                ) : searchQuery && !searching ? (
                  <div className="text-center py-6 text-xs text-slate-400">
                    No matching locations found for &quot;{searchQuery}&quot;
                  </div>
                ) : (
                  <div className="text-center py-6 text-xs text-slate-400">
                    Type a city name (e.g. &quot;Paris&quot;, &quot;Tokyo&quot;, &quot;Sydney&quot;)
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </ProtectedRoute>
  );
}
