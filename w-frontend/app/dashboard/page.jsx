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
  Minus,
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

export default function DashboardPage() {
  const router = useRouter();
  const { weather, user, currentCity, toggleFavorite, isFavorite, temperatureUnit, t } = useApp();

  const [alerts, setAlerts] = useState([]);
  const [news, setNews] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [hoveredTrendPoint, setHoveredTrendPoint] = useState(null);
  const [selectedMapLayer, setSelectedMapLayer] = useState('temperature');
  const [mapZoomLevel, setMapZoomLevel] = useState(1);
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
  const city = weather?.city || currentCity || 'Bengaluru';
  const country = weather?.country || 'India';
  const rawTemp = weather?.temp !== undefined ? Math.round(weather.temp) : 24;
  const condition = weather?.condition || 'Clear';
  const rawFeelsLike = weather?.feelsLike !== undefined ? Math.round(weather.feelsLike) : rawTemp;
  const humidity = weather?.humidity !== undefined ? weather.humidity : 50;
  const windSpeed = weather?.windSpeed !== undefined ? weather.windSpeed : 10;
  const pressure = weather?.pressure !== undefined ? weather.pressure : 1013;
  const visibility = weather?.visibility !== undefined ? weather.visibility : 10;

  const displayTemp = temperatureUnit === 'fahrenheit' ? Math.round((rawTemp * 9) / 5 + 32) : rawTemp;
  const displayFeelsLike = temperatureUnit === 'fahrenheit' ? Math.round((rawFeelsLike * 9) / 5 + 32) : rawFeelsLike;
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

  const convertForecastTemp = (celsiusVal) => {
    if (celsiusVal === undefined) return '--';
    if (temperatureUnit === 'fahrenheit') {
      return `${Math.round((celsiusVal * 9) / 5 + 32)}°`;
    }
    return `${Math.round(celsiusVal)}°`;
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
  // WEATHER MAP LAYERS
  // -------------------------------------------------------------
  const mapLayers = [
    { id: 'temperature', label: 'Temperature' },
    { id: 'rainfall', label: 'Rainfall' },
    { id: 'wind', label: 'Wind' },
    { id: 'cloud_cover', label: 'Cloud Cover' },
    { id: 'air_quality', label: 'Air Quality' },
  ];

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
    <div className="min-h-screen bg-transparent flex font-sans text-slate-900">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar />

        <main className="flex-1 p-6 sm:p-8 max-w-[1400px] w-full mx-auto space-y-6">
          {/* Top Greeting Header Card */}
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
                {new Date().getHours() < 18 ? (
                  <Sun className="w-6 h-6 text-amber-200" />
                ) : (
                  <CloudSun className="w-6 h-6 text-blue-100" />
                )}
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {getGreeting()}, {displayName}!
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal mt-0.5">
                  Here&apos;s the latest live weather update for your location.
                </p>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800/80">
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* Main 2-Column Weather Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* ========================================================= */}
            {/* LEFT 8-COLUMN AREA */}
            {/* ========================================================= */}
            <div className="lg:col-span-8 space-y-6">

              {/* Row 1: Current Weather + 5-Day Forecast */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* 1. Current Weather Card */}
                <div className="bg-gradient-to-br from-blue-50/70 via-white to-blue-50/40 rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between h-full relative overflow-hidden">
                  <div>
                    <div className="flex items-center gap-1.5 text-slate-800 font-semibold text-sm">
                      <MapPin className="w-4 h-4 text-slate-700" />
                      <span>{city}{country ? `, ${country}` : ''}</span>
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
                          {t('dash.feelsLike', 'Feels like')} {displayFeelsLike}{unitSymbol}
                        </div>
                      </div>

                      {/* Sun & Cloud Illustration */}
                      <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                        <div className="absolute top-2 right-4 w-12 h-12 rounded-full bg-amber-400 shadow-lg shadow-amber-400/50 animate-pulse" style={{ animationDuration: '4s' }} />
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

                  {/* 4 Bottom Metrics */}
                  <div className="grid grid-cols-4 gap-2 pt-5 mt-4 border-t border-slate-200/60 text-center">
                    <div className="flex flex-col items-center">
                      <Droplets className="w-4 h-4 text-blue-500 mb-1" />
                      <span className="text-[11px] text-slate-500 font-normal">{t('dash.humidity', 'Humidity')}</span>
                      <span className="text-xs font-bold text-slate-800 mt-0.5">{humidity}%</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Wind className="w-4 h-4 text-slate-500 mb-1" />
                      <span className="text-[11px] text-slate-500 font-normal">{t('dash.windSpeed', 'Wind')}</span>
                      <span className="text-xs font-bold text-slate-800 mt-0.5">{windSpeed} km/h</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Gauge className="w-4 h-4 text-slate-500 mb-1" />
                      <span className="text-[11px] text-slate-500 font-normal">{t('dash.pressure', 'Pressure')}</span>
                      <span className="text-xs font-bold text-slate-800 mt-0.5">{pressure} hPa</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Eye className="w-4 h-4 text-slate-500 mb-1" />
                      <span className="text-[11px] text-slate-500 font-normal">{t('dash.visibility', 'Visibility')}</span>
                      <span className="text-xs font-bold text-slate-800 mt-0.5">{visibility} km</span>
                    </div>
                  </div>
                </div>

                {/* 2. 5-Day Forecast Card */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between h-full">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900">
                      {t('dash.sevenDayForecast', '5-Day Forecast')}
                    </h3>
                    <Link
                      href="/search"
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                    >
                      <span>{t('common.details', 'View Details')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-5 gap-1 pt-6 pb-2 text-center items-center">
                    {forecastList.map((item, index) => {
                      const dayName = item.day || 'Day';
                      const dateStr = item.date || `Day ${index + 1}`;
                      return (
                        <div key={index} className="flex flex-col items-center justify-between space-y-2.5">
                          <div>
                            <div className="text-xs font-bold text-slate-800 truncate w-14 mx-auto">{dayName}</div>
                            <div className="text-[11px] text-slate-400 font-normal truncate w-14 mx-auto">{dateStr}</div>
                          </div>
                          <div className="py-1 flex items-center justify-center h-8">
                            {renderForecastIcon(item.icon, item.condition)}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900">
                              {convertForecastTemp(item.tempMax)}
                            </div>
                            <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                              {convertForecastTemp(item.tempMin)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Row 2: Temperature Trend + Air Quality Index */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* 3. Temperature Trend Card */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between h-full">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900">
                      {t('dash.tempTrend', 'Temperature Trend')}
                    </h3>
                    <span className="text-xs text-slate-400 font-medium">
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
                        {temperatureUnit === 'fahrenheit'
                          ? `${Math.round((trendPoints[hoveredTrendPoint].temp * 9) / 5 + 32)}°F`
                          : `${trendPoints[hoveredTrendPoint].temp}°C`}
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Air Quality Index Card */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between h-full">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900">
                      {t('dash.airQuality', 'Air Quality Index')}
                    </h3>
                    <button
                      title="AQI indicates ambient pollution levels and health safety."
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-4 gap-6">
                    <div className="relative flex items-center justify-center shrink-0 w-32 h-32">
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
                        <Leaf className="w-4 h-4 text-emerald-500 mb-0.5 fill-emerald-500" />
                        <span className="text-2xl font-bold text-slate-900 leading-none">{aqiVal}</span>
                        <span className="text-[11px] font-semibold text-slate-500 mt-0.5">{aqiLabel}</span>
                      </div>
                    </div>

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

                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50/70 border border-emerald-100 text-slate-700 text-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-[11px] font-medium text-slate-700">
                      {aqiVal <= 50 ? t('dash.airQualityGood', 'Air quality is satisfactory. Enjoy your day!') : `Air quality is ${aqiLabel.toLowerCase()} in ${city}.`}
                    </span>
                  </div>
                </div>

              </div>

              {/* Row 3: 5. Weather Map Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Map className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-tight">
                        {t('map.title', 'Weather Map')}
                      </h3>
                      <p className="text-xs text-slate-400 font-normal">
                        {t('dash.realtimeTelemetry', 'Live weather conditions across regions')} ({city})
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/map"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                  >
                    <span>{t('dash.viewFullMap', 'View Full Map')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-4 items-center">
                  <div className="md:col-span-8 h-64 sm:h-72 rounded-xl bg-slate-100/80 border border-slate-200/80 relative overflow-hidden flex items-center justify-center select-none">
                    <div
                      className="w-full h-full relative transition-transform duration-300 ease-out"
                      style={{ transform: `scale(${mapZoomLevel})` }}
                    >
                      <svg viewBox="0 0 500 350" className="w-full h-full object-cover opacity-90" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="500" height="350" fill="#E2E8F0" fillOpacity="0.4" />
                        <path
                          d="M140 40 L210 30 L270 45 L320 80 L380 90 L420 130 L390 180 L350 210 L300 280 L270 320 L250 340 L240 310 L210 260 L180 210 L150 160 L120 130 L110 90 Z"
                          fill="#CBD5E1"
                          stroke="#94A3B8"
                          strokeWidth="1.5"
                          strokeLinejoin="round"
                        />
                        <path d="M285 300 C295 300 300 315 295 325 C290 330 280 325 280 315 Z" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="1.5" />
                        <path d="M120 220 Q160 230 180 260" stroke="#94A3B8" strokeWidth="0.8" strokeDasharray="3 3" />
                        <path d="M330 200 Q360 230 380 250" stroke="#94A3B8" strokeWidth="0.8" strokeDasharray="3 3" />
                      </svg>

                      {selectedMapLayer === 'temperature' && (
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="absolute top-1/4 left-1/3 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl animate-pulse" />
                          <div className="absolute bottom-1/3 right-1/4 w-36 h-36 bg-red-400/15 rounded-full blur-2xl" />
                        </div>
                      )}
                      {selectedMapLayer === 'rainfall' && (
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="absolute top-1/3 left-1/3 w-36 h-36 bg-blue-500/25 rounded-full blur-2xl" />
                          <div className="absolute bottom-1/4 left-1/2 w-28 h-28 bg-blue-600/30 rounded-full blur-2xl" />
                        </div>
                      )}
                      {selectedMapLayer === 'wind' && (
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="absolute top-1/2 left-1/4 w-48 h-24 bg-cyan-400/20 rounded-full blur-xl" />
                        </div>
                      )}
                      {selectedMapLayer === 'air_quality' && (
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="absolute top-1/3 left-1/3 w-36 h-36 bg-emerald-400/20 rounded-full blur-2xl" />
                        </div>
                      )}

                      <div className="absolute top-16 left-28 text-white/90 drop-shadow-md">
                        <Cloud className="w-8 h-8 fill-white/80 text-white" />
                      </div>
                      <div className="absolute top-24 right-20 text-white/90 drop-shadow-md">
                        <Cloud className="w-9 h-9 fill-white/80 text-white" />
                      </div>
                      <div className="absolute top-28 left-48 text-blue-500 drop-shadow-md">
                        <CloudRain className="w-8 h-8 fill-white/90 text-blue-400" />
                      </div>
                      <div className="absolute bottom-12 right-32 text-white/90 drop-shadow-md">
                        <Cloud className="w-7 h-7 fill-white/70 text-white" />
                      </div>

                      <div className="absolute top-[68%] left-[45%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                        <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg ring-4 ring-blue-500/30 animate-bounce" style={{ animationDuration: '2.5s' }}>
                          <MapPin className="w-4 h-4 fill-white text-blue-600" />
                        </div>
                      </div>
                    </div>

                    <div className="absolute bottom-3 left-3 flex flex-col bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden z-10">
                      <button
                        onClick={() => setMapZoomLevel((prev) => Math.min(prev + 0.15, 1.4))}
                        className="p-1.5 hover:bg-slate-50 text-slate-700 transition-colors border-b border-slate-100 cursor-pointer"
                        title={t('map.zoomIn', 'Zoom In')}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setMapZoomLevel((prev) => Math.max(prev - 0.15, 0.8))}
                        className="p-1.5 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
                        title={t('map.zoomOut', 'Zoom Out')}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="md:col-span-4 space-y-2.5 pl-2">
                    {mapLayers.map((layer) => {
                      const isSelected = selectedMapLayer === layer.id;
                      return (
                        <button
                          key={layer.id}
                          onClick={() => setSelectedMapLayer(layer.id)}
                          className="w-full flex items-center gap-3 text-left py-1 text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors cursor-pointer group"
                        >
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-400 group-hover:border-blue-500 bg-transparent'
                              }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <span className={isSelected ? 'font-semibold text-slate-900' : 'text-slate-600'}>
                            {layer.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>

            {/* ========================================================= */}
            {/* RIGHT 4-COLUMN AREA */}
            {/* ========================================================= */}
            <div className="lg:col-span-4 space-y-6">

              {/* 6. Live Alerts Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-red-100 text-red-600 flex items-center justify-center">
                      <AlertTriangle className="w-3.5 h-3.5 fill-red-600 text-white" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{t('dash.activeAlerts', 'Alerts')}</h3>
                  </div>

                  <Link
                    href="/alerts"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                  >
                    <span>{t('common.viewAll', 'View All')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="p-4 rounded-xl bg-red-50/80 border border-red-100 flex items-start gap-3.5 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-red-100/90 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4 fill-red-600 text-white" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900 leading-tight">
                      {alertItem.title}
                    </h4>
                    <p className="text-xs text-slate-600 leading-snug">
                      {alertItem.description}
                    </p>
                    <span className="text-[11px] text-slate-400 font-medium block pt-1">
                      {alertItem.time || t('common.live', 'Live Alert')}
                    </span>
                  </div>
                </div>
              </div>

              {/* 7. Quick Actions Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
                <h3 className="text-base font-bold text-slate-900 pb-3">
                  {t('fav.addLocation', 'Quick Actions')}
                </h3>

                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => setIsAddLocationOpen(true)}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200/60 text-slate-700 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-slate-600 group-hover:text-blue-600 transition-colors" />
                      <span className="text-xs font-semibold text-slate-800">{t('fav.addLocation', 'Add Location')}</span>
                    </div>
                    <Plus className="w-4 h-4 text-slate-400 group-hover:text-slate-800 transition-colors" />
                  </button>

                  <Link
                    href="/alerts"
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200/60 text-slate-700 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <Bell className="w-4 h-4 text-slate-600 group-hover:text-blue-600 transition-colors" />
                      <span className="text-xs font-semibold text-slate-800">{t('settings.notifications', 'Set Alerts')}</span>
                    </div>
                    <Plus className="w-4 h-4 text-slate-400 group-hover:text-slate-800 transition-colors" />
                  </Link>

                  <button
                    onClick={handleSaveLocation}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200/60 text-slate-700 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <Bookmark className={`w-4 h-4 ${isCurrentFav ? 'text-blue-600 fill-blue-600' : 'text-slate-600 group-hover:text-blue-600'} transition-colors`} />
                      <span className="text-xs font-semibold text-slate-800">
                        {savedSuccess ? t('dash.savedLocation', 'Location Saved!') : isCurrentFav ? t('dash.savedLocation', 'Saved in Favorites') : t('dash.saveLocation', 'Save This Location')}
                      </span>
                    </div>
                    {savedSuccess ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Plus className="w-4 h-4 text-slate-400 group-hover:text-slate-800 transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              {/* 8. Live Disaster News Card (Connected to Real Live Global News API) */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between pb-4">
                  <h3 className="text-base font-bold text-slate-900">
                    {t('dash.disasterMonitoring', 'Disaster News')}
                  </h3>
                  <Link
                    href="/alerts"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                  >
                    <span>{t('common.viewAll', 'View All')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="space-y-3.5">
                  {loadingNews ? (
                    <div className="space-y-3 py-2 animate-pulse">
                      <div className="h-12 bg-slate-100 rounded-xl" />
                      <div className="h-12 bg-slate-100 rounded-xl" />
                      <div className="h-12 bg-slate-100 rounded-xl" />
                    </div>
                  ) : news.length > 0 ? (
                    news.map((item, index) => (
                      <a
                        key={item.id || index}
                        href={item.url || '/alerts'}
                        target={item.url ? '_blank' : '_self'}
                        rel="noreferrer"
                        className="flex items-start gap-3 group cursor-pointer"
                      >
                        {/* News Thumbnail Image */}
                        <div className="w-14 h-12 rounded-lg bg-slate-100 border border-slate-200/80 overflow-hidden shrink-0 flex items-center justify-center">
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={item.title || 'News thumbnail'}
                              width={56}
                              height={48}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-600 text-xs font-bold">
                              {item.category?.slice(0, 3).toUpperCase() || 'NEWS'}
                            </div>
                          )}
                        </div>

                        {/* Headline and time */}
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                            {item.title}
                          </h4>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-normal">
                            <span>{item.time || t('common.live', 'Live')}</span>
                            {item.source && <span>• {item.source}</span>}
                          </div>
                        </div>

                        {item.url && (
                          <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-blue-600 shrink-0 mt-1 transition-colors" />
                        )}
                      </a>
                    ))
                  ) : (
                    <div className="text-center py-4 text-xs text-slate-400">
                      {t('alerts.noAlerts', 'No disaster news reported at this time.')}
                    </div>
                  )}
                </div>
              </div>

              {/* 9. AI Weather Assistant Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2.5 pb-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Bot className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">
                      {t('dash.askAi', 'AI Weather Assistant')}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    {t('chat.subtitle', 'Hi! I\'m your Weather AI Assistant. Ask me anything about the weather, natural disasters, or safety tips.')}
                  </p>

                  <div className="space-y-2 pt-4">
                    {[
                      `Will it rain in ${city} today?`,
                      'Any active storm or cyclone warnings nearby?',
                      'How can I stay safe during heavy rainfall?'
                    ].map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => router.push(`/chat?prompt=${encodeURIComponent(prompt)}`)}
                        className="w-full text-left px-3.5 py-2 rounded-full border border-blue-200 bg-blue-50/50 hover:bg-blue-100/70 text-blue-700 text-xs font-medium transition-all cursor-pointer truncate"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleAiSubmit} className="relative pt-4">
                  <input
                    type="text"
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    placeholder={t('dash.askAiPlaceholder', 'Type your question...')}
                    className="w-full pl-3.5 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-normal"
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
                    onChange={(e) => setSearchQuery(e.target.value)}
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
  );
}
