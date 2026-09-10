'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useApp } from '../../Hooks/useAppContext';
import { formatTemp } from '../../lib/weatherUtils';
import { Compass, Loader2 } from 'lucide-react';

// Dynamic import for Globe3D from 3d-globe.jsx with SSR disabled for Three.js WebGL canvas
const Globe3D = dynamic(() => import('../ui/3d-globe'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[560px] flex items-center justify-center bg-slate-900/60 rounded-3xl text-slate-400 text-sm">
      <Loader2 className="w-6 h-6 animate-spin mr-2 text-blue-500" />
      Loading 3D Realistic Globe...
    </div>
  ),
});

// Curated avatar pictures for Indian States and Global Cities
const CITY_AVATARS = {
  // Indian States & Hubs
  'Bengaluru': 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=100&h=100&fit=crop&crop=faces',
  'Mumbai': 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=100&h=100&fit=crop&crop=faces',
  'New Delhi': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=100&h=100&fit=crop&crop=faces',
  'Delhi': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=100&h=100&fit=crop&crop=faces',
  'Chennai': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=100&h=100&fit=crop&crop=faces',
  'Kolkata': 'https://images.unsplash.com/photo-1558431382-27e303142255?w=100&h=100&fit=crop&crop=faces',
  'Hyderabad': 'https://images.unsplash.com/photo-1604999333679-b86d54738315?w=100&h=100&fit=crop&crop=faces',
  'Jaipur': 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=100&h=100&fit=crop&crop=faces',
  'Kochi': 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=100&h=100&fit=crop&crop=faces',
  'Panaji': 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=100&h=100&fit=crop&crop=faces',
  'Goa': 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=100&h=100&fit=crop&crop=faces',
  'Shimla': 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=100&h=100&fit=crop&crop=faces',
  'Ahmedabad': 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=100&h=100&fit=crop&crop=faces',
  // International Hubs
  'New York': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=100&h=100&fit=crop&crop=faces',
  'London': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=100&h=100&fit=crop&crop=faces',
  'Tokyo': 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=100&h=100&fit=crop&crop=faces',
  'Paris': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=100&h=100&fit=crop&crop=faces',
  'Sydney': 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=100&h=100&fit=crop&crop=faces',
  'Dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=100&h=100&fit=crop&crop=faces',
};

export default function WeatherGlobe({ weatherStations = [], onSelectCity }) {
  const { temperatureUnit, theme } = useApp();
  const isDark = theme === 'dark';
  const [activeStation, setActiveStation] = useState(null);

  // Transform weather stations into Globe3D markers with avatar tips and place tooltips
  const markers = useMemo(() => {
    return weatherStations
      .filter(st => typeof st.lat === 'number' && typeof st.lng === 'number' && !isNaN(st.lat) && !isNaN(st.lng))
      .map(st => ({
        lat: st.lat,
        lng: st.lng,
        name: st.name,
        label: st.name,
        state: st.state || '',
        temp: formatTemp(st.temp, temperatureUnit),
        condition: st.condition,
        src: CITY_AVATARS[st.name] || `https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=100&h=100&fit=crop&crop=faces`,
        active: activeStation?.id === st.id,
        size: activeStation?.id === st.id ? 28 : 22,
        color: st.color,
      }));
  }, [weatherStations, temperatureUnit, activeStation]);

  const handleMarkerClick = (marker) => {
    const station = weatherStations.find(s => s.name === marker.name);
    if (station) {
      setActiveStation(station);
      if (onSelectCity) onSelectCity(station.name);
    }
  };

  const globeConfig = useMemo(() => ({
    radius: 2,
    showAtmosphere: true,
    atmosphereColor: isDark ? '#38bdf8' : '#60a5fa',
    atmosphereIntensity: isDark ? 0.7 : 0.5,
    atmosphereBlur: 2.5,
    bumpScale: 1.2,
    autoRotateSpeed: activeStation ? 0.05 : 0.4,
    enableZoom: true,
    enablePan: false,
    minDistance: 4.5,
    maxDistance: 9,
    ambientIntensity: isDark ? 0.75 : 0.85,
    pointLightIntensity: isDark ? 1.7 : 1.5,
    backgroundColor: null,
  }), [isDark, activeStation]);

  return (
    <div className="relative w-full rounded-3xl bg-radial from-slate-900/90 via-slate-950 to-black border border-slate-800/80 shadow-2xl p-4 sm:p-6 overflow-hidden flex flex-col items-center justify-center">
      {/* Background ambient nebula glow */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Full-Width 3D Canvas Container */}
      <div className="relative w-full flex flex-col items-center justify-center min-h-[560px]">
        {/* The 3D Globe Component */}
        <Globe3D
          markers={markers}
          config={globeConfig}
          onMarkerClick={handleMarkerClick}
          className="h-[560px] w-full"
        />

        {/* Bottom Navigation & Interaction Hint */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 bg-slate-900/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-slate-700/50 pointer-events-none flex items-center gap-2 shadow-lg whitespace-nowrap">
          <Compass className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span>Drag to rotate • Scroll to zoom • Hover & click city avatars for live weather</span>
        </div>
      </div>
    </div>
  );
}

