'use client';

import React, { useState } from 'react';
import { X, Plus, MapPin, Check } from 'lucide-react';
import { api } from '../../lib/api';
import { useApp } from '../../Hooks/useAppContext';
import { GooeyInput } from '../ui/gooey-input';

export default function AddLocationModal({ isOpen, onClose }) {
  const { toggleFavorite, isFavorite } = useApp();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (val) => {
    const term = typeof val === 'string' ? val : query;
    if (!term || !term.trim()) return;
    setSearching(true);
    try {
      const data = await api.searchLocations(term.trim());
      setResults(data || []);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleAdd = async (loc) => {
    await toggleFavorite(loc.name, loc.country, 24, 'Sunny');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Add New Location
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Search for cities to pin on your favorites dashboard
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input with Gooey Animation */}
        <div className="p-6">
          <div className="flex items-center justify-between gap-3">
            <GooeyInput
              value={query}
              onValueChange={setQuery}
              onSubmit={handleSearch}
              placeholder="Enter city or region name..."
              collapsedWidth={160}
              expandedWidth={300}
              expandedOffset={48}
              className="flex-1 justify-start"
            />
            <button
              type="button"
              onClick={() => handleSearch(query)}
              disabled={searching}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-semibold shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all cursor-pointer shrink-0"
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Results list */}
          <div className="mt-6 space-y-2 max-h-60 overflow-y-auto scrollbar-thin">
            {results.length > 0 ? (
              results.map((item, idx) => {
                const added = isFavorite(item.name);
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                          {item.name}
                        </div>
                        <div className="text-xs text-slate-400">
                          {item.region ? `${item.region}, ` : ''}{item.country}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAdd(item)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        added
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                      }`}
                    >
                      {added ? (
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
            ) : query && !searching ? (
              <div className="text-center py-8 text-sm text-slate-400">
                No matching locations found for &quot;{query}&quot;
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-slate-400">
                Type a city name (e.g. &quot;Paris&quot;, &quot;Dubai&quot;, &quot;Sydney&quot;) to search
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
