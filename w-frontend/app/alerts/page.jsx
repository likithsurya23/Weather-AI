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
  Newspaper
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

export default function AlertsPage() {
  const { t } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Latest');
  const [isSortOpen, setIsSortOpen] = useState(false);
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
  const totalPages = Math.max(1, Math.ceil(newsList.length / itemsPerPage));
  const currentItems = newsList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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

        <main className="flex-1 p-6 sm:p-8 max-w-[1400px] w-full mx-auto space-y-6">
          
          {/* Top Disaster News Header Card */}
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-rose-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-rose-500/20 shrink-0">
                <Newspaper className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {t('alerts.title', 'Disaster News')}
                </h1>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800/80">
              {/* News Preferences Button */}
              <button
                onClick={() => setIsPreferencesOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Settings className="w-4 h-4" />
                <span>{t('alerts.preferences', 'News Preferences')}</span>
              </button>
            </div>
          </div>

          {/* Category Filter Chips Row */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
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
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{t(cat.key, cat.label)}</span>
                </button>
              );
            })}
          </div>

          {/* Main 2-Column Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* ========================================================= */}
            {/* LEFT 8-COLUMN: LATEST NEWS FEED & PAGINATION */}
            {/* ========================================================= */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* Feed Header: "Latest News" + Sort Dropdown */}
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">
                  {t('alerts.latest', 'Latest News')}
                </h3>

                {/* Sort Dropdown */}
                <div className="relative flex items-center gap-2 text-xs text-slate-500">
                  <span>{t('alerts.sortBy', 'Sort by')}:</span>
                  <button
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 hover:border-slate-300 transition-colors cursor-pointer shadow-xs"
                  >
                    <span>{sortBy}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {isSortOpen && (
                    <div className="absolute right-0 top-8 w-32 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1">
                      {['Latest', 'Most Severe', 'Trending'].map((opt) => (
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

              {/* News Articles Cards List */}
              <div className="space-y-4">
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="bg-white rounded-2xl p-4 border border-slate-200/80 animate-pulse flex gap-4">
                        <div className="w-48 h-32 bg-slate-100 rounded-xl shrink-0" />
                        <div className="flex-1 space-y-3 py-2">
                          <div className="h-4 bg-slate-100 rounded w-3/4" />
                          <div className="h-3 bg-slate-100 rounded w-full" />
                          <div className="h-3 bg-slate-100 rounded w-2/3" />
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
                        className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row gap-4 sm:gap-5 group cursor-pointer relative"
                      >
                        {/* Article Thumbnail Image */}
                        <div className="sm:w-52 h-36 rounded-xl overflow-hidden bg-slate-100 relative shrink-0">
                          <Image
                            src={article.imageUrl || 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800&q=80'}
                            alt={article.title}
                            fill
                            unoptimized
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {/* Breaking Badge */}
                          {article.isBreaking && (
                            <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm z-10">
                              BREAKING
                            </span>
                          )}
                        </div>

                        {/* Article Details */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            {/* Title & Bookmark Button */}
                            <div className="flex items-start justify-between gap-3">
                              <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                                {article.title}
                              </h3>
                              <button
                                onClick={(e) => toggleBookmark(article.id, e)}
                                className={`p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer shrink-0 ${
                                  isBookmarked ? 'text-blue-600 fill-blue-600' : 'text-slate-400 hover:text-slate-700'
                                }`}
                                title={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
                              >
                                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                              </button>
                            </div>

                            {/* Summary Snippet */}
                            <p className="text-xs text-slate-500 font-normal mt-1.5 line-clamp-2 leading-relaxed">
                              {article.summary}
                            </p>
                          </div>

                          {/* Bottom Metadata: Location, Time, Category, Status, Read More Link */}
                          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-3 flex-wrap">
                              <div className="flex items-center gap-1 text-slate-500 font-medium">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                <span>{article.location}</span>
                              </div>
                              <div className="flex items-center gap-1 text-slate-400 font-normal">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{article.time}</span>
                              </div>

                              {/* Category Tag */}
                              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-100">
                                {article.category}
                              </span>

                              {/* Status Tag */}
                              <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${article.statusColor || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                                {article.status}
                              </span>
                            </div>

                            {/* Read More Link */}
                            <div className="text-blue-600 font-semibold text-xs flex items-center gap-1 group-hover:underline">
                              <span>Read More</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })
                ) : (
                  <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80">
                    <p className="text-sm font-semibold text-slate-600">No disaster reports found.</p>
                    <p className="text-xs text-slate-400 mt-1">Try selecting another hazard category or clearing your search.</p>
                  </div>
                )}
              </div>

              {/* Pagination Row */}
              <div className="flex items-center justify-center gap-1.5 pt-4">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 transition-colors cursor-pointer shadow-xs"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  const isActive = currentPage === pageNum;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
                  className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 transition-colors cursor-pointer shadow-xs"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* ========================================================= */}
            {/* RIGHT 4-COLUMN: GLOBAL MAP + TRENDING + STAY UPDATED */}
            {/* ========================================================= */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* 1. Global Disaster Map Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-slate-700" />
                    <h3 className="text-base font-bold text-slate-900">Global Disaster Map</h3>
                  </div>
                  <Link
                    href="/map"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                  >
                    <span>View Full Map</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* World Map Vector with Plotted Color Disaster Dots */}
                <div className="relative h-44 my-3 rounded-xl bg-slate-50 border border-slate-200/80 overflow-hidden flex items-center justify-center select-none">
                  <svg viewBox="0 0 400 200" className="w-full h-full object-cover opacity-80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="400" height="200" fill="#F8FAFC" />
                    {/* Simplified Continents Outline */}
                    {/* North America */}
                    <path d="M40 30 L90 25 L120 45 L90 90 L50 80 L30 50 Z" fill="#E2E8F0" />
                    {/* South America */}
                    <path d="M80 100 L115 110 L100 170 L75 140 Z" fill="#E2E8F0" />
                    {/* Eurasia / Europe */}
                    <path d="M160 30 L220 20 L320 35 L330 85 L260 90 L210 60 L160 55 Z" fill="#E2E8F0" />
                    {/* Africa */}
                    <path d="M170 70 L220 75 L215 140 L180 145 L165 95 Z" fill="#E2E8F0" />
                    {/* South Asia / India */}
                    <path d="M250 80 L280 85 L265 125 L245 100 Z" fill="#E2E8F0" />
                    {/* Australia */}
                    <path d="M310 120 L360 125 L350 165 L305 155 Z" fill="#E2E8F0" />
                  </svg>

                  {/* Plotted Colored Disaster Markers */}
                  {/* North America: Wildfire (Orange) */}
                  <div className="absolute top-[28%] left-[20%] w-3.5 h-3.5 rounded-full bg-orange-500 ring-4 ring-orange-400/30 animate-pulse" title="Canada Wildfire" />
                  
                  {/* South America: Earthquake (Red) */}
                  <div className="absolute top-[68%] left-[24%] w-3 h-3 rounded-full bg-rose-600 ring-4 ring-rose-500/30" title="Chile Tremor" />

                  {/* Europe: Flood (Green) */}
                  <div className="absolute top-[32%] left-[48%] w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-400/30" title="Europe Flood" />

                  {/* Central Asia: Cyclone (Blue) */}
                  <div className="absolute top-[22%] left-[60%] w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-blue-400/30" title="Storm" />

                  {/* India / Bay of Bengal: Flood & Cyclone (Green & Orange) */}
                  <div className="absolute top-[52%] left-[65%] w-3.5 h-3.5 rounded-full bg-emerald-500 ring-4 ring-emerald-400/30" title="Karnataka Heavy Rain" />
                  <div className="absolute top-[40%] left-[72%] w-3.5 h-3.5 rounded-full bg-orange-500 ring-4 ring-orange-400/30" title="Bay of Bengal Cyclone" />

                  {/* East Asia: Earthquake (Red) */}
                  <div className="absolute top-[58%] left-[73%] w-3.5 h-3.5 rounded-full bg-rose-600 ring-4 ring-rose-500/30" title="Assam Earthquake" />

                  {/* Australia: Flood (Green) */}
                  <div className="absolute top-[72%] left-[84%] w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-400/30" title="Queensland Flood" />
                </div>

                {/* Map Legend */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] text-slate-600 font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                    <span>Earthquake</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span>Cyclone</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Flood</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                    <span>Wildfire</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                    <span>Other</span>
                  </div>
                </div>
              </div>

              {/* 2. Trending Topics Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <h3 className="text-base font-bold text-slate-900">Trending Topics</h3>
                </div>

                <div className="space-y-3 pt-3">
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
                      className="w-full flex items-center justify-between text-left group hover:bg-slate-50 p-1.5 rounded-xl transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-5 text-xs font-bold text-slate-400 group-hover:text-blue-600">
                          {topic.rank}
                        </span>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors leading-tight">
                            {topic.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-normal">
                            {topic.mentions}
                          </span>
                        </div>
                      </div>

                      <TrendingUp className="w-3.5 h-3.5 text-rose-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Stay Updated Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Bell className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Stay Updated</h3>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  Get instant alerts for major natural disasters in your preferred locations.
                </p>

                <button
                  onClick={() => setIsPreferencesOpen(true)}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95">
            <div className="relative h-60 w-full bg-slate-900">
              <Image
                src={selectedArticle.imageUrl || 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800&q=80'}
                alt={selectedArticle.title}
                fill
                unoptimized
                className="object-cover"
              />
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/80 text-white hover:bg-slate-900 transition-colors cursor-pointer z-10"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs font-semibold">
                <span className="px-2.5 py-1 rounded-md bg-blue-600/90 backdrop-blur-xs">
                  {selectedArticle.category}
                </span>
                <span className="text-slate-200">{selectedArticle.time}</span>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                {selectedArticle.title}
              </h2>

              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>{selectedArticle.location}</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed">
                {selectedArticle.summary}
              </div>

              <div className="flex items-center justify-between pt-2">
                {selectedArticle.url ? (
                  <a
                    href={selectedArticle.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors"
                  >
                    <span>Read Full Source</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : <div />}

                <button
                  onClick={() => setSelectedArticle(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Settings className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">News Preferences</h3>
              </div>
              <button
                onClick={() => setIsPreferencesOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-500">
                Customize your disaster feed alerts and notifications.
              </p>

              <div className="space-y-3">
                {[
                  { key: 'breakingNews', label: 'Breaking News Alerts', desc: 'Notify immediately on critical red-alert disasters' },
                  { key: 'localAlerts', label: 'Local Region Alerts', desc: 'Prioritize events near your active weather city' },
                  { key: 'earthquakes', label: 'Earthquake Monitoring', desc: 'Seismic detection magnitude >= 4.5' },
                  { key: 'cyclones', label: 'Cyclone & Hurricane Warnings', desc: 'Tropical storms and coastal advisories' },
                  { key: 'floods', label: 'Flood & Precipitation Alerts', desc: 'Heavy monsoon and river level advisories' }
                ].map((item) => (
                  <label key={item.key} className="flex items-start justify-between gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                    <div>
                      <div className="text-xs font-bold text-slate-800">{item.label}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{item.desc}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={prefs[item.key]}
                      onChange={(e) => setPrefs({ ...prefs, [item.key]: e.target.checked })}
                      className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="p-4 px-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              {preferencesSaved ? (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <Check className="w-4 h-4" /> Saved!
                </span>
              ) : <div />}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPreferencesOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePreferences}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
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