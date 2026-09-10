'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Send, BellCheck } from 'lucide-react';
import { useApp } from '../../Hooks/useAppContext';
import Link from 'next/link';

export default function TopNavbar() {
  const router = useRouter();
  const { selectCity, user, t } = useApp();
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = (e) => {
    e?.preventDefault();
    if (searchInput && searchInput.trim()) {
      selectCity(searchInput.trim());
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
      setSearchInput('');
    }
  };

  const displayName = user?.name ? user.name.split(' ')[0] : 'Likith';
  const displayAvatar = user?.avatar || displayName.charAt(0).toUpperCase() || 'L';
  const placeholderText = t ? t('nav.searchPlaceholder', 'Search for a city or location...') : 'Search for a city or location...';

  return (
    <div className="w-full px-4 sm:px-8 pt-4 sm:pt-6 z-20 sticky top-0">
      <header className="w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs px-5 sm:px-7 py-2.5 sm:py-3 flex items-center justify-between transition-colors">
        {/* Search Input */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl">
          <div className="relative flex items-center">
            <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={placeholderText}
              className="w-full pl-10 pr-12 py-2 bg-slate-50/90 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all font-normal"
            />
            <button
              type="submit"
              title="Search"
              className="absolute right-1.5 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* Right User Controls */}
        <div className="flex items-center gap-4 sm:gap-5 ml-4 sm:ml-6">
          {/* Notification Bell with red badge */}
          <Link 
            href="/alerts" 
            className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <BellCheck className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
          </Link>

          {/* User Profile Pill */}
          <Link
            href="/profile"
            className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-semibold text-xs flex items-center justify-center shadow-xs">
              {displayAvatar}
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-left">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">
                {displayName}
              </span>
            </div>
          </Link>
        </div>
      </header>
    </div>
  );
}
