'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Plus,
  MoreVertical,
  Sun,
  CloudRain,
  CloudSun,
  Cloud,
  Home,
  Briefcase,
  Plane,
  Bookmark,
  Minus,
  Bell,
  RefreshCw,
  Lightbulb,
  Check,
  X,
  Search,
  ArrowRight,
  Thermometer,
  Droplets,
  Wind,
  Trash2,
  ChevronDown
} from 'lucide-react';
import Sidebar from '../../src/components/layout/Sidebar';
import TopNavbar from '../../src/components/layout/TopNavbar';
import { useApp } from '../../src/Hooks/useAppContext';
import { api } from '../../src/lib/api';

function generateLocationId(name) {
  const cleanName = (name || 'loc').toLowerCase().replace(/\s+/g, '-');
  return `${cleanName}_${Date.now()}`;
}

export default function FavoritesPage() {
  const router = useRouter();
  const { selectCity, temperatureUnit, t } = useApp();

  const [activeTab, setActiveTab] = useState('All');
  const [locations, setLocations] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [sortBy, setSortBy] = useState('Recently Added');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [mapZoomLevel, setMapZoomLevel] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState('Home');
  const [syncFeedback, setSyncFeedback] = useState(false);

  // Search Modal state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // 1. Load saved locations from localStorage and fetch live weather on client mount
  useEffect(() => {
    let ignore = false;

    const init = async () => {
      let initialList = [];
      try {
        const stored = typeof window !== 'undefined' ? localStorage.getItem('weatherwise_saved_locations') : null;
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            initialList = parsed;
            if (!ignore) setLocations(parsed);
          }
        }
      } catch {
        // Ignore
      } finally {
        if (!ignore) setIsLoaded(true);
      }

      if (initialList.length > 0) {
        try {
          const updated = await Promise.all(
            initialList.map(async (loc) => {
              try {
                const live = await api.getWeather(loc.city);
                if (live) {
                  return {
                    ...loc,
                    temp: live.temp,
                    feelsLike: live.feelsLike,
                    condition: live.condition,
                    humidity: live.humidity,
                    windSpeed: live.windSpeed,
                    icon: live.condition?.toLowerCase().includes('rain')
                      ? 'rain'
                      : live.condition?.toLowerCase().includes('sun')
                      ? 'sun'
                      : live.condition?.toLowerCase().includes('cloud')
                      ? 'cloudy'
                      : 'partly-cloudy'
                  };
                }
              } catch {
                // fallback
              }
              return loc;
            })
          );
          if (!ignore) {
            setLocations(updated);
          }
        } catch {
          // Ignore
        }
      }
    };

    init();

    return () => {
      ignore = true;
    };
  }, []);

  // 2. Persist locations to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('weatherwise_saved_locations', JSON.stringify(locations));
      } catch {
        // Ignore
      }
    }
  }, [locations, isLoaded]);

  const convertTemp = (celsius) => {
    if (temperatureUnit === 'F') {
      const fahrenheit = Math.round((celsius * 9) / 5 + 32);
      return `${fahrenheit}°F`;
    }
    return `${Math.round(celsius)}°C`;
  };

  const handleCardClick = (city) => {
    if (selectCity) selectCity(city);
    router.push(`/search?q=${encodeURIComponent(city)}`);
  };

  const handleRemoveLocation = (id, e) => {
    e?.stopPropagation();
    setLocations((prev) => prev.filter((loc) => loc.id !== id));
    setActiveMenuId(null);
  };

  const handleSearchChange = async (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (!val || val.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const results = await api.searchLocations(val);
      setSearchResults(results);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleAddNewLocation = useCallback(async (item) => {
    try {
      const live = await api.getWeather(item.name);
      
      const tagIcons = {
        Home: 'Home',
        Work: 'Briefcase',
        Travel: 'Plane',
        Other: 'Bookmark'
      };

      const tagColors = {
        Home: '#2563EB',
        Work: '#EF4444',
        Travel: '#10B981',
        Other: '#F59E0B'
      };

      // Calculate approximate position on Indian / Asian visual map or center
      let mapTop = '50%';
      let mapLeft = '50%';
      if (item.lat !== undefined && item.lon !== undefined) {
        // Map latitude (approx 8°N to 36°N) and longitude (approx 68°E to 96°E)
        const latClamped = Math.max(8, Math.min(36, item.lat));
        const lonClamped = Math.max(68, Math.min(96, item.lon));
        const topPct = 90 - ((latClamped - 8) / (36 - 8)) * 70;
        const leftPct = 15 + ((lonClamped - 68) / (96 - 68)) * 70;
        mapTop = `${Math.round(topPct)}%`;
        mapLeft = `${Math.round(leftPct)}%`;
      }

      const newLoc = {
        id: generateLocationId(item.name),
        city: item.name,
        state: item.region || '',
        country: item.country || 'Global',
        tag: selectedTag || 'Other',
        tagIconType: tagIcons[selectedTag] || 'Bookmark',
        condition: live?.condition || 'Partly Cloudy',
        temp: live?.temp || 26,
        feelsLike: live?.feelsLike || 27,
        humidity: live?.humidity || 60,
        windSpeed: live?.windSpeed || 12,
        alertStatus: live?.alerts && live.alerts.length > 0 ? live.alerts[0].title : 'No active alerts',
        alertType: live?.alerts && live.alerts.length > 0 ? 'warning' : 'safe',
        icon: live?.condition?.toLowerCase().includes('rain')
          ? 'rain'
          : live?.condition?.toLowerCase().includes('sun')
          ? 'sun'
          : 'partly-cloudy',
        imageUrl: `https://images.unsplash.com/photo-1547683905-f686c993aae5?w=600&q=80`,
        color: tagColors[selectedTag] || '#6366F1',
        mapCoords: { top: mapTop, left: mapLeft }
      };

      setLocations((prev) => [newLoc, ...prev]);
      setIsAddModalOpen(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch {
      setIsAddModalOpen(false);
    }
  }, [selectedTag]);

  const handleSyncDevices = () => {
    setSyncFeedback(true);
    setTimeout(() => setSyncFeedback(false), 2500);
  };

  // Tab counts
  const tabCounts = {
    All: locations.length,
    Home: locations.filter((l) => l.tag === 'Home').length,
    Work: locations.filter((l) => l.tag === 'Work').length,
    Travel: locations.filter((l) => l.tag === 'Travel').length,
    Other: locations.filter((l) => l.tag === 'Other').length
  };

  let filteredLocations = activeTab === 'All'
    ? locations
    : locations.filter((l) => l.tag.toLowerCase() === activeTab.toLowerCase());

  if (sortBy === 'Temperature: High to Low') {
    filteredLocations = [...filteredLocations].sort((a, b) => b.temp - a.temp);
  } else if (sortBy === 'Temperature: Low to High') {
    filteredLocations = [...filteredLocations].sort((a, b) => a.temp - b.temp);
  } else if (sortBy === 'Name: A-Z') {
    filteredLocations = [...filteredLocations].sort((a, b) => a.city.localeCompare(b.city));
  }

  const getTagIcon = (tag) => {
    if (tag === 'Home') return Home;
    if (tag === 'Work') return Briefcase;
    if (tag === 'Travel') return Plane;
    return Bookmark;
  };

  const renderConditionArt = (iconType) => {
    if (iconType === 'rain') {
      return (
        <div className="relative flex items-center justify-center">
          <CloudRain className="w-12 h-12 text-blue-500" />
        </div>
      );
    }
    if (iconType === 'sun') {
      return (
        <div className="relative flex items-center justify-center">
          <Sun className="w-12 h-12 text-amber-500 animate-pulse" />
        </div>
      );
    }
    if (iconType === 'cloudy') {
      return (
        <div className="relative flex items-center justify-center">
          <Cloud className="w-12 h-12 text-slate-400" />
        </div>
      );
    }
    return (
      <div className="relative flex items-center justify-center">
        <CloudSun className="w-12 h-12 text-amber-500" />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-transparent flex font-sans text-slate-900">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar />

        <main className="flex-1 p-6 sm:p-8 max-w-[1400px] w-full mx-auto space-y-6">
          
          {/* Top Saved Locations Header Card */}
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {t ? t('fav.title', 'Saved Locations') : 'Saved Locations'}
                </h1>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800/80">
              {/* Add Location Button */}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>{t ? t('fav.addLocation', 'Add Location') : 'Add Location'}</span>
              </button>
            </div>
          </div>

          {/* Filter Tabs & Sort Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {[
                { id: 'All', key: 'fav.all', label: 'All' },
                { id: 'Home', key: 'fav.home', label: 'Home' },
                { id: 'Work', key: 'fav.work', label: 'Work' },
                { id: 'Travel', key: 'fav.travel', label: 'Travel' },
                { id: 'Other', key: 'fav.other', label: 'Other' }
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                const translatedLabel = t(tab.key, tab.label);
                const count = tabCounts[tab.id] || 0;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    {translatedLabel} ({count})
                  </button>
                );
              })}
            </div>

            {/* Sort Dropdown */}
            <div className="relative flex items-center gap-2 text-xs text-slate-500 shrink-0 self-end sm:self-auto">
              <span>{t('alerts.sortBy', 'Sort by')}:</span>
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 hover:border-slate-300 transition-colors cursor-pointer shadow-xs"
              >
                <span>{sortBy}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isSortOpen && (
                <div className="absolute right-0 top-8 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1">
                  {['Recently Added', 'Temperature: High to Low', 'Temperature: Low to High', 'Name: A-Z'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setSortBy(opt);
                        setIsSortOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer ${
                        sortBy === opt ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-700'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* ========================================================= */}
            {/* LEFT 8-COLUMN: SAVED LOCATIONS CARDS LIST */}
            {/* ========================================================= */}
            <div className="lg:col-span-8 space-y-4">
              {filteredLocations.length > 0 ? (
                filteredLocations.map((loc) => {
                  const TagIcon = getTagIcon(loc.tag);

                  return (
                    <div
                      key={loc.id}
                      className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row gap-5 items-stretch sm:items-center justify-between relative group"
                    >
                      {/* Left: City Monument / Landmark Thumbnail */}
                      <div className="sm:w-44 h-32 rounded-xl overflow-hidden bg-slate-100 shrink-0 relative">
                        <Image
                          src={loc.imageUrl || 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=600&q=80'}
                          alt={loc.city || 'City Thumbnail'}
                          fill
                          sizes="(max-width: 640px) 100vw, 176px"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Center: City Details, Condition & Big Temp */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-bold text-slate-900 leading-tight">
                              {loc.city}{loc.state ? `, ${loc.state}` : ''}
                            </h3>
                            {/* Tag Pill */}
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-100">
                              <TagIcon className="w-3 h-3" />
                              <span>{loc.tag}</span>
                            </span>
                          </div>
                          <span className="text-xs text-slate-400 font-normal block mt-0.5">
                            {loc.country}
                          </span>
                        </div>

                        <div className="flex items-center gap-6">
                          <div>
                            <div className="text-xs font-semibold text-slate-700">
                              {loc.condition}
                            </div>
                            <div className="text-3xl font-bold text-slate-900 tracking-tight mt-0.5">
                              {convertTemp(loc.temp)}
                            </div>
                          </div>

                          <div className="pl-2">
                            {renderConditionArt(loc.icon)}
                          </div>
                        </div>
                      </div>

                      {/* Right: Weather Stats & Action Button */}
                      <div className="flex flex-col justify-between sm:items-end space-y-3 border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-5 min-w-[190px]">
                        {/* 3-dots Menu Button */}
                        <div className="self-end relative">
                          <button
                            onClick={() => setActiveMenuId(activeMenuId === loc.id ? null : loc.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {/* Dropdown menu */}
                          {activeMenuId === loc.id && (
                            <div className="absolute right-0 top-6 w-36 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1">
                              <button
                                onClick={() => handleCardClick(loc.city)}
                                className="w-full text-left px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                              >
                                View Details
                              </button>
                              <button
                                onClick={(e) => handleRemoveLocation(loc.id, e)}
                                className="w-full text-left px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-1.5 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Remove</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* 4 Stats Metrics */}
                        <div className="space-y-1 text-xs text-slate-600 w-full">
                          <div className="flex items-center gap-2">
                            <Thermometer className="w-3.5 h-3.5 text-slate-400" />
                            <span>Feels like {convertTemp(loc.feelsLike)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Droplets className="w-3.5 h-3.5 text-blue-500" />
                            <span>Humidity {loc.humidity}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Wind className="w-3.5 h-3.5 text-slate-400" />
                            <span>Wind {loc.windSpeed} km/h</span>
                          </div>
                          
                          {/* Status Alert */}
                          <div className="flex items-center gap-1.5 pt-0.5 text-[11px] font-semibold">
                            {loc.alertType === 'safe' ? (
                              <>
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="text-slate-600">{loc.alertStatus}</span>
                              </>
                            ) : loc.alertType === 'warning' ? (
                              <>
                                <span className="w-2 h-2 rounded-full bg-amber-400" />
                                <span className="text-amber-700">{loc.alertStatus}</span>
                              </>
                            ) : (
                              <>
                                <span className="w-2 h-2 rounded-full bg-rose-500" />
                                <span className="text-rose-700">{loc.alertStatus}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* View Details Button */}
                        <button
                          onClick={() => handleCardClick(loc.city)}
                          className="w-full py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <span>View Details</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>
                  );
                })
              ) : (
                /* Empty State Card when no locations are saved */
                <div className="bg-white rounded-3xl p-10 sm:p-14 border border-slate-200/80 shadow-xs text-center flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
                    <MapPin className="w-8 h-8" />
                  </div>
                  <div className="max-w-md space-y-1.5">
                    <h3 className="text-lg font-bold text-slate-900">
                      {activeTab === 'All' ? 'No Saved Locations Yet' : `No ${activeTab} Locations`}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
                      {activeTab === 'All'
                        ? 'Keep track of your favorite places and get quick weather updates by adding your home, work, or travel destinations.'
                        : `You have not assigned any saved locations to the ${activeTab} category yet.`}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Location</span>
                  </button>
                </div>
              )}
            </div>

            {/* ========================================================= */}
            {/* RIGHT 4-COLUMN: LOCATIONS ON MAP + QUICK ACTIONS + TIPS */}
            {/* ========================================================= */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* 1. Locations on Map Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-base font-bold text-slate-900">
                    Locations on Map
                  </h3>
                  <span className="text-xs text-slate-400 font-medium">
                    {locations.length} {locations.length === 1 ? 'place' : 'places'}
                  </span>
                </div>

                {/* Subcontinent Map Vector with Plotted Color Pins */}
                <div className="relative h-60 my-3 rounded-xl bg-slate-50 border border-slate-200/80 overflow-hidden flex items-center justify-center select-none">
                  <div
                    className="w-full h-full relative transition-transform duration-300 ease-out"
                    style={{ transform: `scale(${mapZoomLevel})` }}
                  >
                    <svg viewBox="0 0 500 350" className="w-full h-full object-cover opacity-85" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="500" height="350" fill="#F8FAFC" />
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

                    {/* Dynamic Plotted Pins for saved locations */}
                    {locations.map((loc) => {
                      const coords = loc.mapCoords || { top: '50%', left: '50%' };
                      return (
                        <div
                          key={loc.id}
                          style={{ top: coords.top, left: coords.left }}
                          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer z-10"
                          onClick={() => handleCardClick(loc.city)}
                        >
                          <div
                            style={{ backgroundColor: loc.color || '#2563EB' }}
                            className="w-6 h-6 rounded-full text-white flex items-center justify-center shadow-lg ring-4 ring-blue-500/20 group-hover:scale-110 transition-transform"
                          >
                            <MapPin className="w-3.5 h-3.5 fill-white" />
                          </div>
                          <span className="text-[10px] font-bold text-slate-800 bg-white/90 px-1.5 py-0.5 rounded shadow-xs mt-0.5 whitespace-nowrap">
                            {loc.city}
                          </span>
                        </div>
                      );
                    })}

                    {locations.length === 0 && (
                      <div className="absolute inset-0 bg-slate-900/5 backdrop-blur-xs flex items-center justify-center p-4 text-center">
                        <div className="bg-white/90 px-3 py-2 rounded-xl shadow-xs border border-slate-200 text-xs text-slate-600 font-medium">
                          No locations pinned yet
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Zoom Controls */}
                  <div className="absolute bottom-2.5 left-2.5 flex flex-col bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden z-10">
                    <button
                      onClick={() => setMapZoomLevel((prev) => Math.min(prev + 0.15, 1.4))}
                      className="p-1 hover:bg-slate-50 text-slate-700 transition-colors border-b border-slate-100 cursor-pointer"
                      title="Zoom In"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setMapZoomLevel((prev) => Math.max(prev - 0.15, 0.8))}
                      className="p-1 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
                      title="Zoom Out"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Dynamic Legend */}
                {locations.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-slate-600 font-medium">
                    {locations.slice(0, 4).map((loc) => (
                      <div key={loc.id} className="flex items-center gap-1.5">
                        <span
                          style={{ backgroundColor: loc.color || '#2563EB' }}
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                        />
                        <span className="truncate max-w-[80px]">{loc.city}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 text-center pt-2">
                    Saved locations will be color-pinned here
                  </div>
                )}
              </div>

              {/* 2. Quick Actions Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
                <h3 className="text-base font-bold text-slate-900 pb-3">
                  Quick Actions
                </h3>

                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200/60 text-slate-700 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-slate-600 group-hover:text-blue-600 transition-colors" />
                      <span className="text-xs font-semibold text-slate-800">Add New Location</span>
                    </div>
                    <Plus className="w-4 h-4 text-slate-400 group-hover:text-slate-800 transition-colors" />
                  </button>

                  <Link
                    href="/alerts"
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200/60 text-slate-700 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <Bell className="w-4 h-4 text-slate-600 group-hover:text-blue-600 transition-colors" />
                      <span className="text-xs font-semibold text-slate-800">Set Alerts for Locations</span>
                    </div>
                    <Plus className="w-4 h-4 text-slate-400 group-hover:text-slate-800 transition-colors" />
                  </Link>

                  <button
                    onClick={handleSyncDevices}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200/60 text-slate-700 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <RefreshCw className={`w-4 h-4 ${syncFeedback ? 'text-emerald-600 animate-spin' : 'text-slate-600 group-hover:text-blue-600'} transition-colors`} />
                      <span className="text-xs font-semibold text-slate-800">
                        {syncFeedback ? 'Locations Synced!' : 'Sync Across Devices'}
                      </span>
                    </div>
                    {syncFeedback ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Plus className="w-4 h-4 text-slate-400 group-hover:text-slate-800 transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              {/* 3. Tips Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Tips</h3>
                </div>

                <ul className="space-y-2 text-xs text-slate-500 leading-relaxed font-normal">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                    <span>Save multiple locations to track weather easily.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                    <span>Get notified about severe weather alerts.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                    <span>Organize locations with custom labels (Home, Work, etc.).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                    <span>Access your saved locations on any device.</span>
                  </li>
                </ul>
              </div>

            </div>

          </div>
        </main>

        {/* Footer */}
        <footer className="mt-auto bg-white border-t border-slate-200/80 px-8 py-5 text-xs text-slate-500">
          <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center text-white">
                <Bookmark className="w-3.5 h-3.5 fill-white stroke-none" />
              </div>
              <span className="font-bold text-slate-800">WeatherWise</span>
              <span className="text-slate-400 pl-2">© 2026 WeatherWise. All rights reserved.</span>
            </div>

            <div className="text-slate-500 font-medium">
              Built for a safer, greener tomorrow.
            </div>
          </div>
        </footer>
      </div>

      {/* Add Location Search Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Add New Location</h3>
                <p className="text-xs text-slate-400">Search for cities and select a category tag</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Category Tag Picker */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-2">Category Label:</label>
                <div className="flex items-center gap-2">
                  {[
                    { id: 'Home', icon: Home },
                    { id: 'Work', icon: Briefcase },
                    { id: 'Travel', icon: Plane },
                    { id: 'Other', icon: Bookmark }
                  ].map((t) => {
                    const Icon = t.icon;
                    const isSelected = selectedTag === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedTag(t.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{t.id}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* City Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Enter city or region name (e.g. Bengaluru, London, Tokyo)..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:border-blue-500 font-medium"
                />
              </div>

              {/* Search Results List */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {searching ? (
                  <div className="text-center py-6 text-xs text-slate-400 animate-pulse">
                    Searching global locations...
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((item, idx) => (
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
                        onClick={() => handleAddNewLocation(item)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add as {selectedTag}</span>
                      </button>
                    </div>
                  ))
                ) : searchQuery.length >= 2 ? (
                  <div className="text-center py-6 text-xs text-slate-400">
                    No matching locations found for &quot;{searchQuery}&quot;
                  </div>
                ) : (
                  <div className="text-center py-6 text-xs text-slate-400">
                    Type a city name (e.g. &quot;Hyderabad&quot;, &quot;London&quot;, &quot;Tokyo&quot;, &quot;Sydney&quot;)
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
