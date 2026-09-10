'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Send, BellCheck, LogIn, Menu } from 'lucide-react';
import { useApp } from '../../Hooks/useAppContext';
import Link from 'next/link';

export default function TopNavbar() {
  const router = useRouter();
  const { selectCity, user, isAuthenticated, t, setMobileMenuOpen } = useApp();
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = (e) => {
    e?.preventDefault();
    if (searchInput && searchInput.trim()) {
      selectCity(searchInput.trim());
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
      setSearchInput('');
    }
  };

  const displayName = user?.name ? user.name.split(' ')[0] : 'Guest';
  const displayAvatar = user?.avatar || (user?.name ? user.name.charAt(0).toUpperCase() : 'G');
  const placeholderText = t ? t('nav.searchPlaceholder', 'Search for a city...') : 'Search for a city...';

  return (
    <div className="w-full px-2.5 sm:px-4 lg:px-6 pt-1.5 sm:pt-2.5 z-20 sticky top-0">
      <header className="w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs px-2.5 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between transition-colors">

        {/* Mobile Hamburger Toggle Button (Hidden on lg screens) */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen && setMobileMenuOpen(true)}
          className="lg:hidden p-1 -ml-0.5 mr-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
          title="Open Menu"
        >
          <Menu className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </button>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl">
          <div className="relative flex items-center">
            <div className="absolute left-2.5 sm:left-3 text-slate-400 pointer-events-none flex items-center">
              <Search className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5" />
            </div>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={placeholderText}
              className="w-full pl-7.5 sm:pl-9 pr-7.5 sm:pr-9 py-1 sm:py-1.5 bg-slate-50/90 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 rounded-lg sm:rounded-xl text-xs sm:text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all font-normal"
            />
            <button
              type="submit"
              title="Search"
              className="absolute right-1 sm:right-1 p-0.5 sm:p-1 rounded-md bg-slate-100 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
            >
              <Send className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            </button>
          </div>
        </form>

        {/* Right User Controls */}
        <div className="flex items-center gap-1 sm:gap-2 ml-2 sm:ml-3 shrink-0">
          {/* Notification Bell with badge */}
          <Link
            href="/alerts"
            className="relative p-1 sm:p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <BellCheck className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
          </Link>

          {/* User Profile or Login CTA */}
          {isAuthenticated ? (
            <div className="flex items-center gap-1">
              <Link
                href="/profile"
                className="flex items-center gap-1.5 p-0.5 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group"
              >
                <div className="w-6.5 h-6.5 sm:w-7.5 sm:h-7.5 rounded-full bg-blue-600 text-white font-semibold text-[10px] sm:text-xs flex items-center justify-center shadow-xs">
                  {displayAvatar}
                </div>
                <div className="hidden md:flex items-center gap-1 text-left">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">
                    {displayName}
                  </span>
                </div>
              </Link>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[10px] sm:text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <LogIn className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Login</span>
            </Link>
          )}
        </div>
      </header>
    </div>
  );
}
