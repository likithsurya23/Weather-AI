'use client';

import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Plus, Minus, MapPin, X, Loader2, Globe, Layers, Search, Menu, ChevronDown, Maximize2, Minimize2 } from 'lucide-react';
import { useApp } from '../../Hooks/useAppContext';

// Dynamic import for Leaflet map component to prevent SSR hydration errors
const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-slate-900 text-slate-400 text-xs">
      <Loader2 className="w-4 h-4 animate-spin mr-2 text-blue-500" />
      Loading interactive radar map...
    </div>
  )
});

// Dynamic import for 3D Realistic Globe component
const WeatherGlobe = dynamic(() => import('./WeatherGlobe'), {
  ssr: false,
  loading: () => (
    <div className="w-full min-h-[300px] flex items-center justify-center bg-slate-900 text-slate-400 text-xs">
      <Loader2 className="w-4 h-4 animate-spin mr-2 text-blue-500" />
      Initializing 3D Realistic Globe...
    </div>
  )
});

export default function WeatherMapViewer() {
  const { temperatureUnit, selectCity, t } = useApp();
  const [viewMode, setViewMode] = useState('globe'); // 'globe' | 'map'
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  const [isElaborated, setIsElaborated] = useState(false);
  const activeLayer = 'temperature';

  const toggleElaborate = () => {
    setIsElaborated(prev => !prev);
    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize?.();
      }
      window.dispatchEvent(new Event('resize'));
    }, 350);
  };
  const [mapSearch, setMapSearch] = useState('');
  const [zoomLevel, setZoomLevel] = useState(2);
  const [mapCenter, setMapCenter] = useState([20, 0]);
  const [weatherStations, setWeatherStations] = useState([
    // Indian States & Major Capitals
    { id: 'bengaluru', name: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946, temp: 26, condition: 'Partly Cloudy', color: 'bg-amber-500' },
    { id: 'mumbai', name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777, temp: 29, condition: 'Humid', color: 'bg-emerald-500' },
    { id: 'delhi', name: 'New Delhi', state: 'Delhi', lat: 28.6139, lng: 77.2090, temp: 31, condition: 'Sunny', color: 'bg-amber-500' },
    { id: 'chennai', name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, temp: 30, condition: 'Partly Cloudy', color: 'bg-teal-500' },
    { id: 'kolkata', name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639, temp: 28, condition: 'Hazy', color: 'bg-sky-500' },
    { id: 'hyderabad', name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867, temp: 28, condition: 'Clear', color: 'bg-blue-500' },
    { id: 'jaipur', name: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873, temp: 33, condition: 'Sunny', color: 'bg-rose-500' },
    { id: 'kochi', name: 'Kochi', state: 'Kerala', lat: 9.9312, lng: 76.2673, temp: 27, condition: 'Tropical Rain', color: 'bg-indigo-500' },
    { id: 'goa', name: 'Goa', state: 'Goa', lat: 15.2993, lng: 74.1240, temp: 29, condition: 'Sunny', color: 'bg-amber-500' },
    { id: 'shimla', name: 'Shimla', state: 'Himachal Pradesh', lat: 31.1048, lng: 77.1734, temp: 16, condition: 'Breezy', color: 'bg-cyan-500' },
    { id: 'ahmedabad', name: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714, temp: 32, condition: 'Warm', color: 'bg-orange-500' },
    // International Key Hubs
    { id: 'nyc', name: 'New York', state: 'USA', lat: 40.7128, lng: -74.0060, temp: 24, condition: 'Clear', color: 'bg-emerald-500' },
    { id: 'london', name: 'London', state: 'UK', lat: 51.5074, lng: -0.1278, temp: 17, condition: 'Rain', color: 'bg-blue-500' },
    { id: 'paris', name: 'Paris', state: 'France', lat: 48.8566, lng: 2.3522, temp: 20, condition: 'Partly Cloudy', color: 'bg-sky-500' },
    { id: 'dubai', name: 'Dubai', state: 'UAE', lat: 25.2048, lng: 55.2708, temp: 39, condition: 'Sunny', color: 'bg-rose-500' },
    { id: 'tokyo', name: 'Tokyo', state: 'Japan', lat: 35.6762, lng: 139.6503, temp: 28, condition: 'Sunny', color: 'bg-orange-500' },
    { id: 'sydney', name: 'Sydney', state: 'Australia', lat: -33.8688, lng: 151.2093, temp: 21, condition: 'Cloudy', color: 'bg-teal-500' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [clickedLocation, setClickedLocation] = useState(null);
  const searchTimeout = useRef(null);
  const mapRef = useRef(null);

  // Fetch weather points for the active layer
  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/weather/map?layer=${activeLayer}`);
        const data = await response.json();
        const cityCoords = {
          'bengaluru': { lat: 12.9716, lng: 77.5946, state: 'Karnataka' },
          'mumbai': { lat: 19.0760, lng: 72.8777, state: 'Maharashtra' },
          'new delhi': { lat: 28.6139, lng: 77.2090, state: 'Delhi' },
          'delhi': { lat: 28.6139, lng: 77.2090, state: 'Delhi' },
          'chennai': { lat: 13.0827, lng: 80.2707, state: 'Tamil Nadu' },
          'kolkata': { lat: 22.5726, lng: 88.3639, state: 'West Bengal' },
          'hyderabad': { lat: 17.3850, lng: 78.4867, state: 'Telangana' },
          'jaipur': { lat: 26.9124, lng: 75.7873, state: 'Rajasthan' },
          'kochi': { lat: 9.9312, lng: 76.2673, state: 'Kerala' },
          'panaji': { lat: 15.4909, lng: 73.8278, state: 'Goa' },
          'goa': { lat: 15.2993, lng: 74.1240, state: 'Goa' },
          'shimla': { lat: 31.1048, lng: 77.1734, state: 'Himachal Pradesh' },
          'ahmedabad': { lat: 23.0225, lng: 72.5714, state: 'Gujarat' },
          'new york': { lat: 40.7128, lng: -74.0060, state: 'USA' },
          'london': { lat: 51.5074, lng: -0.1278, state: 'UK' },
          'paris': { lat: 48.8566, lng: 2.3522, state: 'France' },
          'dubai': { lat: 25.2048, lng: 55.2708, state: 'UAE' },
          'tokyo': { lat: 35.6762, lng: 139.6503, state: 'Japan' },
          'sydney': { lat: -33.8688, lng: 151.2093, state: 'Australia' }
        };
        if (data.points && data.points.length > 0) {
          setWeatherStations(data.points.map((p) => {
            const fallback = cityCoords[p.city?.toLowerCase()] || { lat: 20, lng: 0, state: '' };
            return {
              id: (p.city || 'city').toLowerCase(),
              name: p.city,
              state: p.state || fallback.state,
              lat: typeof p.lat === 'number' ? p.lat : fallback.lat,
              lng: typeof p.lng === 'number' ? p.lng : fallback.lng,
              temp: typeof p.temp === 'number' ? p.temp : 25,
              condition: p.condition || 'Partly Cloudy',
              color: p.temp >= 32 ? 'bg-rose-500' : p.temp >= 24 ? 'bg-amber-500' : 'bg-blue-500'
            };
          }));
        }
      } catch (err) {
        console.warn('Map weather telemetry fallback active:', err.message);
      }
    };
    fetchWeatherData();
  }, [activeLayer]);

  // Mapbox Geocoding forward geosearch
  const searchLocation = async (query) => {
    if (!query || query.length < 2) {
      setSearchSuggestions([]);
      return;
    }
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return;

    setIsLoading(true);
    try {
      const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&types=place,locality,country&limit=5`);
      const data = await res.json();
      if (data.features) {
        setSearchSuggestions(data.features);
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle selecting a location from suggestions
  const handleSelectLocation = (feature) => {
    const [lng, lat] = feature.center;
    setSelectedLocation({
      lat,
      lng,
      name: feature.text,
      state: feature.place_name
    });
    setMapCenter([lat, lng]);
    setZoomLevel(8);
    setMapSearch(feature.place_name);
    setShowSuggestions(false);
    selectCity(feature.text);
  };

  // Handle map click
  const handleMapClick = async (latlng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latlng.lat}&lon=${latlng.lng}&format=json`
      );
      const data = await response.json();

      const locationName = data.display_name?.split(',')[0] || 'Unknown Location';
      setClickedLocation({
        name: locationName,
        lat: latlng.lat,
        lng: latlng.lng
      });

      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        setClickedLocation(null);
      }, 5000);
    } catch (error) {
      console.error('Error getting location name:', error);
    }
  };

  // Handle search submission
  const handleSearchSubmit = (query) => {
    const term = typeof query === 'string' ? query : mapSearch;
    if (term && term.trim()) {
      selectCity(term.trim());
      setShowSuggestions(false);
    }
  };

  // Get heatmap overlay color based on active layer
  const getHeatmapColor = (station) => {
    switch (activeLayer) {
      case 'temperature':
        return station.temp >= 32 ? '#ef4444' : station.temp >= 24 ? '#f59e0b' : '#3b82f6';
      case 'rain':
        return '#3b82f6';
      case 'wind':
        return '#8b5cf6';
      case 'clouds':
        return '#64748b';
      case 'pressure':
        return '#ec4899';
      default:
        return '#3b82f6';
    }
  };

  const getGradientLegend = () => {
    switch (activeLayer) {
      case 'temperature':
        return 'from-blue-500 via-amber-400 to-rose-600';
      case 'rain':
        return 'from-sky-200 via-blue-500 to-indigo-800';
      case 'wind':
        return 'from-teal-300 via-cyan-500 to-indigo-600';
      case 'clouds':
        return 'from-slate-300 via-slate-500 to-slate-800';
      case 'pressure':
        return 'from-emerald-400 via-amber-400 to-purple-600';
      default:
        return 'from-blue-500 to-rose-500';
    }
  };

  return (
    <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl rounded-lg sm:rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden flex flex-col transition-all">
      {/* Top Controls Bar: Hamburger View Menu, Search */}
      <div className="p-2 px-2.5 sm:px-3.5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
        {/* Hamburger View Mode Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsViewMenuOpen(!isViewMenuOpen)}
            className="flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-md sm:rounded-lg text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors shadow-xs cursor-pointer"
            title="Switch map view"
          >
            <Menu className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
            <span className="text-blue-600 dark:text-blue-400 font-bold">
              {viewMode === 'globe' ? t('map.globeView', '3D Realistic Globe') : t('map.mapView', '2D Radar Map')}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isViewMenuOpen && (
            <div className="absolute left-0 top-7 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-30 py-1">
              <button
                onClick={() => {
                  setViewMode('globe');
                  setIsViewMenuOpen(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 text-xs font-medium flex items-center justify-between hover:bg-blue-50 dark:hover:bg-slate-700/80 transition-colors cursor-pointer ${
                  viewMode === 'globe'
                    ? 'bg-blue-50 dark:bg-slate-700/80 text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Globe className={`w-3.5 h-3.5 ${viewMode === 'globe' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  <span>{t('map.globeView', '3D Realistic Globe')}</span>
                </div>
              </button>
              <button
                onClick={() => {
                  setViewMode('map');
                  setIsViewMenuOpen(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 text-xs font-medium flex items-center justify-between hover:bg-blue-50 dark:hover:bg-slate-700/80 transition-colors cursor-pointer ${
                  viewMode === 'map'
                    ? 'bg-blue-50 dark:bg-slate-700/80 text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Layers className={`w-3.5 h-3.5 ${viewMode === 'map' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  <span>{t('map.mapView', '2D Radar Map')}</span>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* 2D Map Search (Visible when in 2D Map mode) */}
        {viewMode === 'map' && (
          <div className="relative flex items-center">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={mapSearch}
                  onChange={(e) => {
                    const val = e.target.value;
                    setMapSearch(val);
                    if (searchTimeout.current) {
                      clearTimeout(searchTimeout.current);
                    }
                    searchTimeout.current = setTimeout(() => {
                      searchLocation(val);
                    }, 300);
                    if (val.length >= 2) setShowSuggestions(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && mapSearch) {
                      handleSearchSubmit(mapSearch);
                      searchLocation(mapSearch);
                      setShowSuggestions(true);
                    }
                  }}
                  placeholder={t('map.searchPlaceholder', 'Search map location...')}
                  className="w-40 sm:w-52 px-2.5 py-1 pl-7 text-[11px] font-semibold rounded-md sm:rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
                />
                <Search className="w-3 h-3 text-slate-400 absolute left-2 pointer-events-none" />
              </div>
              {isLoading && (
                <Loader2 className="w-3.5 h-3.5 text-blue-500 ml-2 animate-spin" />
              )}

              {/* Search suggestions dropdown */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
                  {searchSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSelectLocation(suggestion)}
                      className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-start gap-2 transition-colors cursor-pointer"
                    >
                      <MapPin className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-slate-800 dark:text-slate-100">
                          {suggestion.place_name.split(',')[0]}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {suggestion.place_name}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
        )}

        {/* Elaborate / Compact Toggle Button */}
        <button
          onClick={toggleElaborate}
          className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-md sm:rounded-lg text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 transition-colors shadow-xs cursor-pointer ml-auto"
          title={isElaborated ? 'Compact View' : 'Elaborate View'}
        >
          {isElaborated ? (
            <>
              <Minimize2 className="w-3 h-3 text-blue-500" />
              <span>Compact</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-3 h-3 text-blue-500" />
              <span>Elaborate</span>
            </>
          )}
        </button>
      </div>

      {/* Main Map Viewer Area */}
      {viewMode === 'globe' ? (
        /* 3D Realistic Globe with Place Tooltips */
        <WeatherGlobe
          weatherStations={weatherStations}
          onSelectCity={selectCity}
          isElaborated={isElaborated}
          onToggleElaborate={toggleElaborate}
        />
      ) : (
        /* 2D Interactive Radar Map (Initially Small, Expandable) */
        <div className={`relative w-full max-w-full overflow-hidden transition-all duration-300 ease-in-out bg-slate-900 ${
          isElaborated ? 'h-[360px] sm:h-[480px] lg:h-[540px]' : 'h-[240px] sm:h-[290px] lg:h-[330px]'
        }`}>
          <LeafletMap
            mapRef={mapRef}
            mapCenter={mapCenter}
            zoomLevel={zoomLevel}
            weatherStations={weatherStations}
            getHeatmapColor={getHeatmapColor}
            selectCity={selectCity}
            temperatureUnit={temperatureUnit}
            clickedLocation={clickedLocation}
            handleMapClick={handleMapClick}
          />

          {/* Map Control Tools: Zoom Buttons (Minimized) */}
          <div className="absolute bottom-3 left-3 flex flex-col gap-1 z-[1000]">
            <button
              onClick={() => setZoomLevel((prev) => Math.min(prev + 1, 18))}
              className="p-1.5 rounded-md bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-700/80 shadow-xs backdrop-blur-md transition-all cursor-pointer"
              title="Zoom in"
            >
              <Plus className="w-3 h-3" />
            </button>
            <button
              onClick={() => setZoomLevel((prev) => Math.max(prev - 1, 2))}
              className="p-1.5 rounded-md bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-700/80 shadow-xs backdrop-blur-md transition-all cursor-pointer"
              title="Zoom out"
            >
              <Minus className="w-3 h-3" />
            </button>
            <button
              onClick={() => {
                setMapCenter([20, 0]);
                setZoomLevel(2);
                setSelectedLocation(null);
                setClickedLocation(null);
              }}
              className="p-1.5 rounded-md bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-700/80 shadow-xs backdrop-blur-md transition-all cursor-pointer"
              title="Reset view"
            >
              <Globe className="w-3 h-3" />
            </button>
          </div>

          {/* Click instruction overlay (Minimized) */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[1000] bg-slate-800/80 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-slate-700/50 pointer-events-none max-w-[85%] truncate">
            <span className="text-[10px] text-slate-300 flex items-center gap-1 truncate">
              <MapPin className="w-2.5 h-2.5 shrink-0" />
              <span className="truncate">Click map to inspect</span>
            </span>
          </div>

          {/* Selected location info (Minimized) */}
          {selectedLocation && (
            <div className="absolute top-8 left-1/2 -translate-x-1/2 z-[1000] bg-slate-800/90 backdrop-blur-md border border-blue-500/30 rounded-lg px-2.5 py-1 shadow-lg max-w-[85%] truncate">
              <div className="flex items-center gap-1 text-white text-[11px] truncate">
                <MapPin className="w-3 h-3 text-blue-400 shrink-0" />
                <span className="font-medium truncate">📍 {selectedLocation.name}</span>
                <button
                  onClick={() => setSelectedLocation(null)}
                  className="ml-1 hover:bg-slate-700 rounded-full p-0.5 cursor-pointer shrink-0"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          )}

          {/* Gradient Legend (Minimized) */}
          <div className="absolute bottom-3 right-3 z-[1000] bg-slate-900/90 border border-slate-700/80 rounded-lg p-1.5 shadow-lg backdrop-blur-md flex flex-col gap-0.5 w-32 sm:w-40">
            <div className="flex items-center justify-between text-[9px] font-semibold text-slate-300">
              <span>Low</span>
              <span className="capitalize font-bold text-white">{activeLayer}</span>
              <span>High</span>
            </div>
            <div className={`h-1.5 rounded-full bg-gradient-to-r ${getGradientLegend()} shadow-inner`} />
          </div>
        </div>
      )}
    </div>
  );
}