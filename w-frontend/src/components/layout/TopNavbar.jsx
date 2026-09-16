'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Send, BellCheck, LogIn, Menu, MapPin, X, ArrowRight, Loader2 } from 'lucide-react';
import { useApp } from '../../Hooks/useAppContext';
import { api } from '../../lib/api';
import { findMatchingCities } from '../../lib/citiesData';
import Link from 'next/link';

export default function TopNavbar() {
  const router = useRouter();
  const { selectCity, user, isAuthenticated, t, setMobileMenuOpen } = useApp();
  const [searchInput, setSearchInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoadingApi, setIsLoadingApi] = useState(false);

  const searchContainerRef = useRef(null);
  const inputRef = useRef(null);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    const query = val.trim();
    if (query.length === 0) {
      setSuggestions([]);
      setIsDropdownOpen(false);
      setSelectedIndex(-1);
    } else {
      const localMatches = findMatchingCities(query, 8);
      setSuggestions(localMatches);
      setIsDropdownOpen(true);
      setSelectedIndex(-1);
    }
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    if (searchInput && searchInput.trim()) {
      const query = searchInput.trim();
      selectCity(query);
      setIsDropdownOpen(false);
      setSuggestions([]);
      setSelectedIndex(-1);
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setSearchInput('');
    }
  };

  const handleSelectSuggestion = (item) => {
    if (!item || !item.name) return;
    const chosenName = item.name;
    setSearchInput(chosenName);
    setIsDropdownOpen(false);
    setSuggestions([]);
    setSelectedIndex(-1);
    selectCity(chosenName);
    router.push(`/search?q=${encodeURIComponent(chosenName)}`);
  };

  // Debounced API search for worldwide places
  useEffect(() => {
    const query = searchInput.trim();
    if (query.length === 0) return;

    // Debounced API search for any worldwide places
    const timer = setTimeout(async () => {
      try {
        setIsLoadingApi(true);
        const remoteResults = await api.searchLocations(query);
        if (remoteResults && remoteResults.length > 0) {
          setSuggestions((prev) => {
            const seen = new Set(prev.map(p => `${p.name.toLowerCase()}-${(p.country || '').toLowerCase()}`));
            const merged = [...prev];
            for (const r of remoteResults) {
              const key = `${r.name.toLowerCase()}-${(r.country || '').toLowerCase()}`;
              if (!seen.has(key)) {
                seen.add(key);
                merged.push(r);
              }
            }
            return merged.slice(0, 10);
          });
        }
      } catch {
        // Fallback gracefully
      } finally {
        setIsLoadingApi(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation for suggestions
  const handleKeyDown = (e) => {
    if (!isDropdownOpen || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        e.preventDefault();
        handleSelectSuggestion(suggestions[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  };

  // Helper to highlight matching text in suggestion name
  const highlightMatch = (text, query) => {
    if (!query) return text;
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const idx = lowerText.indexOf(lowerQuery);
    if (idx === -1) return text;
    const before = text.substring(0, idx);
    const match = text.substring(idx, idx + query.length);
    const after = text.substring(idx + query.length);
    return (
      <span>
        {before}
        <span className="text-blue-600 dark:text-blue-400 font-extrabold underline">{match}</span>
        {after}
      </span>
    );
  };

  const displayName = user?.name ? user.name.split(' ')[0] : 'Guest';
  const displayAvatar = user?.avatar || (user?.name ? user.name.charAt(0).toUpperCase() : 'G');
  const placeholderText = t ? t('nav.searchPlaceholder', 'Search for a city...') : 'Search for a city...';

  return (
    <div className="w-full px-2.5 sm:px-4 lg:px-6 pt-1.5 sm:pt-2.5 z-30 sticky top-0">
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

        {/* Search Input with Autocomplete Dropdown */}
        <div ref={searchContainerRef} className="flex-1 max-w-xl relative">
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative flex items-center">
              <div className="absolute left-2.5 sm:left-3 text-slate-400 pointer-events-none flex items-center">
                <Search className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5" />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={searchInput}
                onChange={handleInputChange}
                onFocus={() => {
                  const query = searchInput.trim();
                  if (query.length > 0) {
                    if (suggestions.length === 0) {
                      setSuggestions(findMatchingCities(query, 8));
                    }
                    setIsDropdownOpen(true);
                  }
                }}
                onKeyDown={handleKeyDown}
                placeholder={placeholderText}
                className="w-full pl-7.5 sm:pl-9 pr-14 sm:pr-16 py-1 sm:py-1.5 bg-slate-50/90 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 rounded-lg sm:rounded-xl text-xs sm:text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all font-normal"
              />

              <div className="absolute right-1 sm:right-1 flex items-center gap-1">
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput('');
                      setSuggestions([]);
                      setIsDropdownOpen(false);
                      setSelectedIndex(-1);
                      inputRef.current?.focus();
                    }}
                    title={t('topNav.clearSearch', 'Clear search')}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}

                <button
                  type="submit"
                  title={t('topNav.search', 'Search')}
                  className="p-0.5 sm:p-1 rounded-md bg-slate-100 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                >
                  <Send className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
              </div>
            </div>
          </form>

          {/* Floating Autocomplete Suggestions Dropdown */}
          {isDropdownOpen && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl sm:rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xl z-50 overflow-hidden py-1 animate-in fade-in-50 duration-150">
              <div className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 mb-0.5">
                <span>{t('topNav.possiblePlaces', 'Possible Places')} ({suggestions.length})</span>
                {isLoadingApi && (
                  <span className="flex items-center gap-1 text-blue-500">
                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                    <span>{t('topNav.liveSearch', 'Live search...')}</span>
                  </span>
                )}
              </div>

              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100/60 dark:divide-slate-800/60">
                {suggestions.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={`${item.name}-${item.region || ''}-${idx}`}
                      type="button"
                      onClick={() => handleSelectSuggestion(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-800 dark:text-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}>
                          <MapPin className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-semibold truncate leading-tight">
                            {highlightMatch(item.name, searchInput)}
                          </div>
                          <div className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 truncate">
                            {item.region ? `${item.region}, ` : ''}{item.country || 'India'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 pl-2 text-[10px] font-medium text-slate-400 dark:text-slate-500 shrink-0">
                        <span className="hidden sm:inline">{t('topNav.select', 'Select')}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty State / No Match Notice */}
          {isDropdownOpen && searchInput.trim().length > 0 && suggestions.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xl z-50 p-3 text-center text-xs text-slate-400">
              {isLoadingApi ? (
                <div className="flex items-center justify-center gap-1.5 text-slate-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                  <span>{t('topNav.searchingWorldwide', 'Searching worldwide places...')}</span>
                </div>
              ) : (
                <span>{t('topNav.pressEnterToSearch', 'Press Enter to search weather for "{query}"', { query: searchInput })}</span>
              )}
            </div>
          )}
        </div>

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
              <span>{t('nav.signIn', 'Login')}</span>
            </Link>
          )}
        </div>
      </header>
    </div>
  );
}
