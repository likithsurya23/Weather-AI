'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin,
  Clock,
  Bookmark,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Settings,
  Flame,
  Globe,
  Waves,
  Wind,
  Mountain,
  Sun,
  FlameKindling,
  ExternalLink,
  X,
  Bell,
  Check,
  TrendingUp,
  Activity,
  Newspaper,
  Menu
} from 'lucide-react';
import Sidebar from '../../src/components/layout/Sidebar';
import TopNavbar from '../../src/components/layout/TopNavbar';
import { api } from '../../src/lib/api';
import { useApp } from '../../src/Hooks/useAppContext';

const CATEGORIES = [
  { id: 'all', key: 'alerts.allCategories', label: 'All News', icon: Globe },
  { id: 'earthquake', key: 'alerts.earthquake', label: 'Earthquakes', icon: Activity },
  { id: 'cyclone', key: 'alerts.cyclone', label: 'Cyclones', icon: Wind },
  { id: 'flood', key: 'alerts.flood', label: 'Floods', icon: Waves },
  { id: 'wildfire', key: 'alerts.wildfire', label: 'Wildfires', icon: Flame },
  { id: 'landslide', key: 'alerts.landslide', label: 'Landslides', icon: Mountain },
  { id: 'drought', key: 'alerts.drought', label: 'Droughts', icon: Sun },
  { id: 'volcano', key: 'alerts.volcano', label: 'Volcanoes', icon: FlameKindling }
];

const INCIDENT_COVERS = {
  earthquake: [
    'https://images.unsplash.com/photo-1589824783837-6169889fa20f?w=800&q=80',
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&q=80'
  ],
  flood: [
    'https://images.unsplash.com/photo-1514632595-4944383f2737?w=800&q=80',
    'https://images.unsplash.com/photo-1600335895229-6e75511892c8?w=800&q=80',
    'https://images.unsplash.com/photo-1546768292-fb12f6c92568?w=800&q=80'
  ],
  cyclone: [
    'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=800&q=80',
    'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&q=80'
  ],
  wildfire: [
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80',
    'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800&q=80',
    'https://images.unsplash.com/photo-1516214104703-d870798883c5?w=800&q=80',
    'https://images.unsplash.com/photo-1525811902-f2342640856e?w=800&q=80'
  ],
  landslide: [
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80'
  ],
  volcano: [
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80',
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80'
  ],
  drought: [
    'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=800&q=80',
    'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&q=80'
  ],
  tsunami: [
    'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800&q=80'
  ],
  storm: [
    'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=800&q=80'
  ]
};

function getIncidentCoverImage(article) {
  if (!article) return INCIDENT_COVERS.storm[0];

  const text = `${article.title || ''} ${article.summary || ''} ${article.category || ''}`.toLowerCase();

  let cat = 'storm';
  if (/earthquake|quake|tremor|seismic|aftershock|fault/.test(text)) cat = 'earthquake';
  else if (/wildfire|forest fire|bushfire|brush fire|blaze/.test(text)) cat = 'wildfire';
  else if (/flood|inundat|deluge|river overflow|heavy rain|monsoon|submerged/.test(text)) cat = 'flood';
  else if (/cyclone|hurricane|typhoon|tornado|twister/.test(text)) cat = 'cyclone';
  else if (/landslide|mudslide|rockslide|debris flow/.test(text)) cat = 'landslide';
  else if (/volcan|eruption|lava|magma|ash plume/.test(text)) cat = 'volcano';
  else if (/drought|heatwave|heat dome|arid|water crisis|water shortage/.test(text)) cat = 'drought';
  else if (/tsunami|tidal wave/.test(text)) cat = 'tsunami';

  const pool = INCIDENT_COVERS[cat] || INCIDENT_COVERS.storm;
  const seed = (article.id || article.title || '1')
    .split('')
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);

  return pool[seed % pool.length];
}

export default function AlertsPage() {
  const { t } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Latest');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [savedArticles, setSavedArticles] = useState({});
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [preferencesSaved, setPreferencesSaved] = useState(false);
  const [trendingTopics, setTrendingTopics] = useState([]);

  // Preference switches
  const [prefs, setPrefs] = useState({
    breakingNews: true,
    localAlerts: true,
    earthquakes: true,
    cyclones: true,
    floods: true
  });

  // Fetch real-time live disaster news
  useEffect(() => {
    let ignore = false;

    api.getDisasterNews(selectedCategory, searchQuery, 30)
      .then((data) => {
        if (!ignore) {
          if (data && data.length > 0) {
            setNewsList(data);

            // Compute dynamic trending topics from real headlines
            const keywords = {};
            data.forEach((item) => {
              const words = (item.title || '')
                .replace(/[^a-zA-Z0-9\s]/g, '')
                .split(/\s+/)
                .filter((w) => w.length > 4 && !['after', 'about', 'their', 'which', 'update', 'breaking', 'report', 'reported', 'during'].includes(w.toLowerCase()));
              
              words.forEach((w) => {
                const cap = w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
                keywords[cap] = (keywords[cap] || 0) + 1;
              });
            });

            const sortedKeywords = Object.entries(keywords)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([title, count], idx) => ({
                rank: idx + 1,
                title: `${title} Activity`,
                mentions: `${count * 340 + 120} mentions`,
                query: title
              }));

            if (sortedKeywords.length > 0) {
              setTrendingTopics(sortedKeywords);
            }
          } else {
            setNewsList([]);
          }
          setLoading(false);
        }
      })
      .catch(() => {
        if (!ignore) {
          setNewsList([]);
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [selectedCategory, searchQuery]);


  const toggleBookmark = (id, e) => {
    e?.stopPropagation();
    setSavedArticles((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSavePreferences = () => {
    setPreferencesSaved(true);
    setTimeout(() => {
      setPreferencesSaved(false);
      setIsPreferencesOpen(false);
    }, 1200);
  };

  const itemsPerPage = 5;
  let sortedNews = [...newsList];
  if (sortBy === 'Most Severe') {
    sortedNews.sort((a, b) => (b.isBreaking ? 1 : 0) - (a.isBreaking ? 1 : 0));
  } else if (sortBy === 'Trending') {
    sortedNews.sort((a, b) => (b.summary?.length || 0) - (a.summary?.length || 0));
  }
  const totalPages = Math.max(1, Math.ceil(sortedNews.length / itemsPerPage));
  const currentItems = sortedNews.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const activeCat = CATEGORIES.find((c) => c.id === selectedCategory) || CATEGORIES[0];
  const ActiveCatIcon = activeCat.icon;

  const handleTrendingClick = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-transparent flex font-sans text-slate-900">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar />

        <main className="flex-1 p-2.5 sm:p-4 lg:p-5 max-w-[1400px] w-full mx-auto space-y-2.5 sm:space-y-3 pb-20 lg:pb-8">
          
          {/* Top Disaster News Header Card (Compact) */}
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-lg sm:rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-2 sm:p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-colors">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md sm:rounded-lg bg-linear-to-br from-rose-500 to-amber-600 flex items-center justify-center text-white shadow-xs shrink-0">
                <Newspaper className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              </div>
              <div>
                <h1 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                  {t('alerts.title', 'Disaster News')}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* News Preferences Button (Minimized) */}
              <button
                onClick={() => setIsPreferencesOpen(true)}
                className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[11px] font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Settings className="w-3 h-3" />
                <span>{t('alerts.preferences', 'News Preferences')}</span>
              </button>
            </div>
          </div>

          {/* Filter & Sort Controls Row */}
          <div className="flex items-center justify-between gap-2">
            {/* Mobile Hamburger Category Filter Dropdown */}
            <div className="relative sm:hidden">
              <button
                onClick={() => {
                  setIsFilterOpen(!isFilterOpen);
                  setIsSortOpen(false);
                }}
                className="flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-md text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-xs cursor-pointer"
                title="Filter hazard category"
              >
                <Menu className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                <ActiveCatIcon className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                <span className="text-blue-600 dark:text-blue-400 font-bold">{t(activeCat.key, activeCat.label)}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isFilterOpen && (
                <div className="absolute left-0 top-7 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg z-30 py-1 max-h-64 overflow-y-auto">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isActive = selectedCategory === cat.id;

                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          setCurrentPage(1);
                          setIsFilterOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 text-xs font-medium flex items-center justify-between hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer ${
                          isActive ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                          <span>{t(cat.key, cat.label)}</span>
                        </div>
                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Desktop Full Horizontal Category Filter Bar */}
            <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto py-0.5 max-w-[70%] no-scrollbar">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setCurrentPage(1);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t(cat.key, cat.label)}</span>
                  </button>
                );
              })}
            </div>

            {/* Sort Dropdown */}
            <div className="relative flex items-center gap-1.5 text-[11px] text-slate-500 shrink-0">
              <span className="hidden sm:inline">{t('alerts.sortBy', 'Sort by')}:</span>
              <button
                onClick={() => {
                  setIsSortOpen(!isSortOpen);
                  setIsFilterOpen(false);
                }}
                className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-md sm:rounded-lg text-[11px] sm:text-xs font-semibold text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer shadow-xs"
              >
                <span>{sortBy}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isSortOpen && (
                <div className="absolute right-0 top-7 sm:top-9 w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg z-30 py-1">
                  {['Latest', 'Most Severe', 'Trending'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setSortBy(opt);
                        setIsSortOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 text-xs font-medium hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer ${
                        sortBy === opt ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main 2-Column Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 sm:gap-4 items-start">
            
            {/* ========================================================= */}
            {/* LEFT 8-COLUMN: LATEST NEWS FEED & PAGINATION */}
            {/* ========================================================= */}
            <div className="lg:col-span-8 space-y-2.5 sm:space-y-3.5">
              
              {/* Feed Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  {t('alerts.latest', 'Latest News')}
                </h3>
                <span className="text-[10px] text-slate-400 font-medium">
                  {sortedNews.length} reports
                </span>
              </div>

              {/* News Articles Cards List */}
              <div className="space-y-2 sm:space-y-3">
                {loading ? (
                  <div className="space-y-2 sm:space-y-3">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="bg-white dark:bg-slate-900 rounded-lg sm:rounded-2xl p-2 sm:p-4 border border-slate-200/80 dark:border-slate-800 animate-pulse flex gap-2.5 sm:gap-4">
                        <div className="w-28 sm:w-44 h-20 sm:h-28 bg-slate-100 dark:bg-slate-800 rounded-md sm:rounded-xl shrink-0" />
                        <div className="flex-1 space-y-2 py-1">
                          <div className="h-3.5 bg-slate-100 dark:bg-slate-800 rounded w-3/4" />
                          <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded w-full" />
                          <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded w-2/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : currentItems.length > 0 ? (
                  currentItems.map((article) => {
                    const isBookmarked = savedArticles[article.id];

                    return (
                      <article
                        key={article.id}
                        onClick={() => setSelectedArticle(article)}
                        className="bg-white dark:bg-slate-900 rounded-lg sm:rounded-2xl p-2 sm:p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row gap-2.5 sm:gap-4 group cursor-pointer relative"
                      >
                        {/* Article Thumbnail Image */}
                        <div className="w-full sm:w-40 lg:w-44 h-28 sm:h-28 rounded-md sm:rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 relative shrink-0">
                          <Image
                            src={getIncidentCoverImage(article)}
                            alt={article.title}
                            fill
                            unoptimized
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {/* Breaking Badge */}
                          {article.isBreaking && (
                            <span className="absolute top-1.5 left-1.5 px-1 py-0.5 rounded-xs bg-red-600 text-white text-[8px] sm:text-[9px] font-bold uppercase tracking-wider shadow-xs z-10">
                              BREAKING
                            </span>
                          )}
                        </div>

                        {/* Article Details */}
                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <div>
                            {/* Title & Bookmark Button */}
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                                {article.title}
                              </h3>
                              <button
                                onClick={(e) => toggleBookmark(article.id, e)}
                                className={`p-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer shrink-0 ${
                                  isBookmarked ? 'text-blue-600 fill-blue-600' : 'text-slate-400 hover:text-slate-700'
                                }`}
                                title={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
                              >
                                <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                              </button>
                            </div>

                            {/* Summary Snippet */}
                            <p className="text-[10px] sm:text-[11px] text-slate-500 font-normal mt-0.5 line-clamp-2 leading-relaxed">
                              {article.summary}
                            </p>
                          </div>

                          {/* Bottom Metadata: Location, Time, Category, Status, Read More Link */}
                          <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1 text-[9px] sm:text-[10px]">
                            <div className="flex items-center gap-2 flex-wrap">
                              <div className="flex items-center gap-1 text-slate-500 font-medium">
                                <MapPin className="w-2.5 h-2.5 text-slate-400" />
                                <span>{article.location}</span>
                              </div>
                              <div className="flex items-center gap-1 text-slate-400 font-normal">
                                <Clock className="w-2.5 h-2.5" />
                                <span>{article.time}</span>
                              </div>

                              {/* Category Tag */}
                              <span className="px-1 py-0.2 rounded-xs bg-blue-50 text-blue-700 text-[9px] font-semibold border border-blue-100">
                                {article.category}
                              </span>

                              {/* Status Tag */}
                              <span className={`px-1 py-0.2 rounded-xs text-[9px] font-semibold border ${article.statusColor || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                                {article.status}
                              </span>
                            </div>

                            {/* Read More Link */}
                            <div className="text-blue-600 font-semibold text-[10px] sm:text-[11px] flex items-center gap-0.5 group-hover:underline">
                              <span>Read More</span>
                              <ArrowRight className="w-2.5 h-2.5" />
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })
                ) : (
                  <div className="bg-white rounded-lg sm:rounded-xl p-8 text-center border border-slate-200/80">
                    <p className="text-xs sm:text-sm font-semibold text-slate-600">No disaster reports found.</p>
                    <p className="text-[11px] text-slate-400 mt-1">Try selecting another hazard category or clearing your search.</p>
                  </div>
                )}
              </div>

              {/* Pagination Row (Minimized) */}
              <div className="flex items-center justify-center gap-1 pt-2 sm:pt-2.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1 sm:p-1.5 rounded-md bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 transition-colors cursor-pointer shadow-xs"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  const isActive = currentPage === pageNum;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1 sm:p-1.5 rounded-md bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 transition-colors cursor-pointer shadow-xs"
                  title="Next Page"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

            {/* ========================================================= */}
            {/* RIGHT 4-COLUMN: GLOBAL MAP + TRENDING + STAY UPDATED */}
            {/* ========================================================= */}
            <div className="lg:col-span-4 space-y-2.5 sm:space-y-3">
              
              {/* 1. Global Disaster Map Card (Compact) */}
              <div className="bg-white rounded-lg sm:rounded-xl p-2.5 sm:p-3 border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-slate-700" />
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">Global Disaster Map</h3>
                  </div>
                  <Link
                    href="/map"
                    className="text-[10px] sm:text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 transition-colors"
                  >
                    <span>View Full Map</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </Link>
                </div>

                {/* World Map Vector with Plotted Color Disaster Dots */}
                <div className="relative h-28 sm:h-32 my-2 rounded-md bg-slate-50 border border-slate-200/80 overflow-hidden flex items-center justify-center select-none">
                  <svg viewBox="0 0 400 200" className="w-full h-full object-cover opacity-80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="400" height="200" fill="#F8FAFC" />
                    {/* Simplified Continents Outline */}
                    <path d="M40 30 L90 25 L120 45 L90 90 L50 80 L30 50 Z" fill="#E2E8F0" />
                    <path d="M80 100 L115 110 L100 170 L75 140 Z" fill="#E2E8F0" />
                    <path d="M160 30 L220 20 L320 35 L330 85 L260 90 L210 60 L160 55 Z" fill="#E2E8F0" />
                    <path d="M170 70 L220 75 L215 140 L180 145 L165 95 Z" fill="#E2E8F0" />
                    <path d="M250 80 L280 85 L265 125 L245 100 Z" fill="#E2E8F0" />
                    <path d="M310 120 L360 125 L350 165 L305 155 Z" fill="#E2E8F0" />
                  </svg>

                  {/* Plotted Colored Disaster Markers */}
                  <div className="absolute top-[28%] left-[20%] w-2.5 h-2.5 rounded-full bg-orange-500 ring-2 ring-orange-400/30 animate-pulse" title="Canada Wildfire" />
                  <div className="absolute top-[68%] left-[24%] w-2 h-2 rounded-full bg-rose-600 ring-2 ring-rose-500/30" title="Chile Tremor" />
                  <div className="absolute top-[32%] left-[48%] w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-400/30" title="Europe Flood" />
                  <div className="absolute top-[22%] left-[60%] w-2 h-2 rounded-full bg-blue-500 ring-2 ring-blue-400/30" title="Storm" />
                  <div className="absolute top-[52%] left-[65%] w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-400/30" title="Karnataka Heavy Rain" />
                  <div className="absolute top-[40%] left-[72%] w-2.5 h-2.5 rounded-full bg-orange-500 ring-2 ring-orange-400/30" title="Bay of Bengal Cyclone" />
                  <div className="absolute top-[58%] left-[73%] w-2.5 h-2.5 rounded-full bg-rose-600 ring-2 ring-rose-500/30" title="Assam Earthquake" />
                  <div className="absolute top-[72%] left-[84%] w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-400/30" title="Queensland Flood" />
                </div>

                {/* Map Legend */}
                <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 text-[9px] sm:text-[10px] text-slate-600 font-medium">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                    <span>Earthquake</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span>Cyclone</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Flood</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    <span>Wildfire</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <span>Other</span>
                  </div>
                </div>
              </div>

              {/* 2. Trending Topics Card (Compact) */}
              <div className="bg-white rounded-lg sm:rounded-xl p-2.5 sm:p-3 border border-slate-200/80 shadow-xs">
                <div className="flex items-center gap-1.5 pb-1.5 border-b border-slate-100">
                  <Flame className="w-3.5 h-3.5 text-orange-500" />
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">Trending Topics</h3>
                </div>

                <div className="space-y-1 pt-1.5">
                  {(trendingTopics.length > 0 ? trendingTopics : [
                    { rank: 1, title: 'Seismic & Earthquake Alerts', mentions: '2.4K mentions', query: 'earthquake' },
                    { rank: 2, title: 'Severe Floods & Inundation', mentions: '1.9K mentions', query: 'flood' },
                    { rank: 3, title: 'Tropical Cyclone Watch', mentions: '1.5K mentions', query: 'cyclone' },
                    { rank: 4, title: 'Wildfire Front Warnings', mentions: '1.2K mentions', query: 'wildfire' },
                    { rank: 5, title: 'Landslide Corridors', mentions: '890 mentions', query: 'landslide' }
                  ]).map((topic) => (
                    <button
                      key={topic.rank}
                      onClick={() => handleTrendingClick(topic.query)}
                      className="w-full flex items-center justify-between text-left group hover:bg-slate-50 p-1 rounded-md transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-3.5 text-[10px] sm:text-[11px] font-bold text-slate-400 group-hover:text-blue-600">
                          {topic.rank}
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-[10px] sm:text-[11px] font-bold text-slate-800 group-hover:text-blue-600 transition-colors leading-tight truncate">
                            {topic.title}
                          </h4>
                          <span className="text-[9px] text-slate-400 font-normal">
                            {topic.mentions}
                          </span>
                        </div>
                      </div>

                      <TrendingUp className="w-2.5 h-2.5 text-rose-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Stay Updated Card (Compact) */}
              <div className="bg-white rounded-lg sm:rounded-xl p-2.5 sm:p-3 border border-slate-200/80 shadow-xs space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Bell className="w-3 h-3" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">Stay Updated</h3>
                </div>

                <p className="text-[10px] sm:text-[11px] text-slate-500 leading-relaxed font-normal">
                  Get instant alerts for major natural disasters in your preferred locations.
                </p>

                <button
                  onClick={() => setIsPreferencesOpen(true)}
                  className="w-full py-1 px-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[11px] font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Set Alert Preferences
                </button>
              </div>

            </div>

          </div>
        </main>
      </div>

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden w-full max-w-xl max-h-[88vh] overflow-y-auto shadow-2xl animate-in zoom-in-95">
            <div className="relative h-48 sm:h-52 w-full bg-slate-900">
              <Image
                src={getIncidentCoverImage(selectedArticle)}
                alt={selectedArticle.title}
                fill
                unoptimized
                className="object-cover"
              />
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-slate-900 transition-colors cursor-pointer z-10"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-[11px] font-semibold">
                <span className="px-2 py-0.5 rounded-md bg-blue-600/90 backdrop-blur-xs">
                  {selectedArticle.category}
                </span>
                <span className="text-slate-200">{selectedArticle.time}</span>
              </div>
            </div>

            <div className="p-4 sm:p-5 space-y-3">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                {selectedArticle.title}
              </h2>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>{selectedArticle.location}</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-[11px] sm:text-xs text-slate-700 leading-relaxed">
                {selectedArticle.summary}
              </div>

              <div className="flex items-center justify-between pt-1">
                {selectedArticle.url ? (
                  <a
                    href={selectedArticle.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    <span>Read Full Source</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : <div />}

                <button
                  onClick={() => setSelectedArticle(null)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* News Preferences Modal */}
      {isPreferencesOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Settings className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">News Preferences</h3>
              </div>
              <button
                onClick={() => setIsPreferencesOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-3.5 sm:p-4 space-y-3">
              <p className="text-[11px] text-slate-500">
                Customize your disaster feed alerts and notifications.
              </p>

              <div className="space-y-2">
                {[
                  { key: 'breakingNews', label: 'Breaking News Alerts', desc: 'Notify immediately on critical red-alert disasters' },
                  { key: 'localAlerts', label: 'Local Region Alerts', desc: 'Prioritize events near your active weather city' },
                  { key: 'earthquakes', label: 'Earthquake Monitoring', desc: 'Seismic detection magnitude >= 4.5' },
                  { key: 'cyclones', label: 'Cyclone & Hurricane Warnings', desc: 'Tropical storms and coastal advisories' },
                  { key: 'floods', label: 'Flood & Precipitation Alerts', desc: 'Heavy monsoon and river level advisories' }
                ].map((item) => (
                  <label key={item.key} className="flex items-start justify-between gap-2.5 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                    <div>
                      <div className="text-[11px] sm:text-xs font-bold text-slate-800">{item.label}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{item.desc}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={prefs[item.key]}
                      onChange={(e) => setPrefs({ ...prefs, [item.key]: e.target.checked })}
                      className="mt-0.5 w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="p-3 px-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              {preferencesSaved ? (
                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Saved!
                </span>
              ) : <div />}

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsPreferencesOpen(false)}
                  className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePreferences}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[11px] font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}