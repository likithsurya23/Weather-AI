'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  useMap
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  Satellite,
  Radio,
  Thermometer,
  Wind,
  Plus,
  Minus,
  Crosshair,
  Play,
  Pause,
  Maximize2,
  Droplets
} from 'lucide-react';
import Link from 'next/link';
import { formatDegree } from '../../lib/weatherUtils';

// Controller to handle center changes and map resizes smoothly
function MapController({ center, zoom, onMapReady }) {
  const map = useMap();

  useEffect(() => {
    if (onMapReady) {
      onMapReady(map);
    }
  }, [map, onMapReady]);

  useEffect(() => {
    if (center && typeof center[0] === 'number' && !isNaN(center[0])) {
      map.flyTo(center, zoom, { duration: 1.0 });
    }
  }, [center, zoom, map]);

  return null;
}

export default function InteractiveRadarMap({
  city = 'Mysore',
  country = 'India',
  lat = 12.2958,
  lon = 76.6394,
  temp = 26,
  condition = 'Partly Cloudy',
  windSpeed = 12,
  windDir = 'NE',
  humidity = 55,
  rainProbability = 20,
  temperatureUnit = 'celsius',
  heightClass = 'h-52 sm:h-64 md:h-72',
  showFullMapLink = true
}) {
  const [activeLayer, setActiveLayer] = useState('radar'); // 'satellite' | 'radar' | 'temperature' | 'wind'
  const [zoomLevel, setZoomLevel] = useState(10);
  const [isPlayingRadar, setIsPlayingRadar] = useState(true);
  const [radarFrame, setRadarFrame] = useState(2); // 0 = -30m, 1 = -15m, 2 = Live
  const [rainViewerTimestamps, setRainViewerTimestamps] = useState([]);
  const mapInstanceRef = useRef(null);

  const safeLat = typeof lat === 'number' && !isNaN(lat) ? lat : 12.2958;
  const safeLon = typeof lon === 'number' && !isNaN(lon) ? lon : 76.6394;
  const mapCenter = [safeLat, safeLon];

  // Fetch RainViewer radar timestamps for authentic live radar tiles
  useEffect(() => {
    let isCancelled = false;
    async function loadRadarFrames() {
      try {
        const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
        if (res.ok) {
          const data = await res.json();
          const past = data.radar?.past || [];
          if (!isCancelled && past.length > 0) {
            // Pick last 3 timestamps for -30m, -15m, live
            const recent = past.slice(-3).map(p => p.time);
            setRainViewerTimestamps(recent);
          }
        }
      } catch {
        // Fallback gracefully without throwing
      }
    }
    loadRadarFrames();
    return () => { isCancelled = true; };
  }, []);

  // Radar Animation Loop
  useEffect(() => {
    if (!isPlayingRadar) return;
    const interval = setInterval(() => {
      setRadarFrame((prev) => (prev + 1) % 3);
    }, 1800);
    return () => clearInterval(interval);
  }, [isPlayingRadar]);

  const recenterMap = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(mapCenter, 10, { duration: 0.8 });
      setZoomLevel(10);
    }
  };

  const handleZoom = (delta) => {
    const nextZoom = Math.min(Math.max(zoomLevel + delta, 4), 16);
    setZoomLevel(nextZoom);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom(nextZoom);
    }
  };

  // Custom pulsed city pin icon
  const cityPinIcon = L.divIcon({
    className: 'custom-radar-pin',
    html: `
      <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
        <span class="absolute w-8 h-8 rounded-full bg-blue-500/30 animate-ping"></span>
        <span class="absolute w-5 h-5 rounded-full bg-cyan-400/40 animate-pulse"></span>
        <div class="relative w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-sky-400 border-2 border-white shadow-lg flex items-center justify-center text-white">
          <div class="w-2.5 h-2.5 rounded-full bg-white"></div>
        </div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });

  const radarTimestamp = rainViewerTimestamps[radarFrame];

  return (
    <div className={`relative w-full ${heightClass} rounded-xl sm:rounded-2xl overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-xs group select-none bg-slate-950`}>
      
      {/* 1. Leaflet Interactive Base Map */}
      <MapContainer
        center={mapCenter}
        zoom={zoomLevel}
        style={{ height: '100%', width: '100%', backgroundColor: '#090d16' }}
        zoomControl={false}
        attributionControl={false}
      >
        <MapController
          center={mapCenter}
          zoom={zoomLevel}
          onMapReady={(map) => { mapInstanceRef.current = map; }}
        />

        {/* Tile Layer: SATELLITE */}
        {activeLayer === 'satellite' && (
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            maxZoom={18}
          />
        )}

        {/* Tile Layer: RADAR (Dark base map with radar overlay) */}
        {activeLayer === 'radar' && (
          <>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              subdomains="abcd"
              maxZoom={19}
            />
            {radarTimestamp && (
              <TileLayer
                key={radarTimestamp}
                url={`https://tilecache.rainviewer.com/v2/radar/${radarTimestamp}/256/{z}/{x}/{y}/2/1_1.png`}
                opacity={0.75}
                maxZoom={12}
              />
            )}
          </>
        )}

        {/* Tile Layer: TEMPERATURE (Voyager/Thermal base) */}
        {activeLayer === 'temperature' && (
          <>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              subdomains="abcd"
              maxZoom={19}
            />
            {/* Ambient thermal radar concentric circles */}
            <Circle
              center={mapCenter}
              radius={35000}
              pathOptions={{
                color: temp >= 30 ? '#ef4444' : temp >= 22 ? '#f59e0b' : '#3b82f6',
                fillColor: temp >= 30 ? '#ef4444' : temp >= 22 ? '#f59e0b' : '#3b82f6',
                fillOpacity: 0.18,
                weight: 1.5,
                dashArray: '4, 8'
              }}
            />
          </>
        )}

        {/* Tile Layer: WIND & STREAMS (Dark telemetry base) */}
        {activeLayer === 'wind' && (
          <>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              subdomains="abcd"
              maxZoom={19}
            />
            <Circle
              center={mapCenter}
              radius={45000}
              pathOptions={{
                color: '#06b6d4',
                fillColor: '#06b6d4',
                fillOpacity: 0.14,
                weight: 1,
                dashArray: '3, 6'
              }}
            />
          </>
        )}

        {/* Center Target Pin */}
        <Marker position={mapCenter} icon={cityPinIcon} />
      </MapContainer>

      {/* 2. Radar Sweep Beam Overlay (when in Radar / Wind mode) */}
      {(activeLayer === 'radar' || activeLayer === 'wind') && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
          {/* Concentric Radar Grid Rings */}
          <div className="w-52 h-52 sm:w-64 sm:h-64 rounded-full border border-cyan-500/20 absolute"></div>
          <div className="w-80 h-80 sm:w-96 sm:h-96 rounded-full border border-cyan-500/10 absolute"></div>
          
          {/* Animated 360-degree Radar Sweep Cone */}
          {isPlayingRadar && (
            <div
              className="w-80 h-80 sm:w-96 sm:h-96 rounded-full absolute pointer-events-none animate-spin"
              style={{
                background: 'conic-gradient(from 0deg, rgba(6, 182, 212, 0.28) 0deg, rgba(6, 182, 212, 0) 65deg, transparent 65deg)',
                animationDuration: '4.5s'
              }}
            />
          )}
        </div>
      )}

      {/* 3. Top-Left HUD: Live Telemetry Badge */}
      <div className="absolute top-2.5 left-2.5 z-20 pointer-events-auto">
        <div className="bg-slate-900/85 dark:bg-slate-950/90 backdrop-blur-md rounded-xl p-2 sm:p-2.5 border border-white/10 text-white shadow-lg max-w-[200px] sm:max-w-xs transition-all">
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-cyan-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>
              {activeLayer === 'satellite'
                ? 'High-Res Satellite'
                : activeLayer === 'temperature'
                ? 'Thermal Radar'
                : activeLayer === 'wind'
                ? 'Wind Streams'
                : 'Doppler Radar'}
            </span>
          </div>

          <div className="flex items-baseline justify-between gap-2 mt-1">
            <div className="truncate">
              <h4 className="font-bold text-xs sm:text-sm text-white truncate leading-tight">
                {city}
              </h4>
              <p className="text-[10px] text-slate-300 font-medium truncate">
                {country} &bull; {condition}
              </p>
            </div>
            <span className="text-sm sm:text-base font-extrabold text-white shrink-0">
              {formatDegree(temp, temperatureUnit)}
            </span>
          </div>

          <div className="flex items-center gap-2.5 mt-1.5 pt-1.5 border-t border-white/10 text-[10px] text-slate-300">
            <span className="flex items-center gap-1">
              <Wind className="w-3 h-3 text-cyan-300" />
              {windSpeed} km/h {windDir}
            </span>
            <span className="flex items-center gap-1">
              <Droplets className="w-3 h-3 text-blue-300" />
              {humidity}% ({rainProbability}% rain)
            </span>
          </div>
        </div>
      </div>

      {/* 4. Top-Right Mode Switcher Pills */}
      <div className="absolute top-2.5 right-2.5 z-20 pointer-events-auto flex items-center gap-1 bg-slate-900/85 backdrop-blur-md p-1 rounded-xl border border-white/10 shadow-lg">
        <button
          type="button"
          onClick={() => setActiveLayer('radar')}
          title="Doppler Precipitation Radar"
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
            activeLayer === 'radar'
              ? 'bg-cyan-500 text-slate-950 shadow-xs'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Radio className="w-3 h-3" />
          <span className="hidden sm:inline">Radar</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveLayer('satellite')}
          title="High-Resolution Satellite Imagery"
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
            activeLayer === 'satellite'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Satellite className="w-3 h-3" />
          <span className="hidden sm:inline">Satellite</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveLayer('temperature')}
          title="Temperature Heatmap"
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
            activeLayer === 'temperature'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Thermometer className="w-3 h-3" />
          <span className="hidden sm:inline">Temp</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveLayer('wind')}
          title="Wind Streamlines"
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
            activeLayer === 'wind'
              ? 'bg-emerald-500 text-slate-950 shadow-xs'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Wind className="w-3 h-3" />
          <span className="hidden sm:inline">Wind</span>
        </button>
      </div>

      {/* 5. Bottom-Left Timeline Player (for Radar loop) */}
      <div className="absolute bottom-2.5 left-2.5 z-20 pointer-events-auto flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md px-2 py-1.5 rounded-xl border border-white/10 shadow-lg text-white">
        <button
          type="button"
          onClick={() => setIsPlayingRadar(!isPlayingRadar)}
          title={isPlayingRadar ? 'Pause Radar Sweep' : 'Play Radar Sweep'}
          className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-cyan-400 transition-colors cursor-pointer"
        >
          {isPlayingRadar ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
        </button>

        <div className="flex items-center gap-1 text-[10px] font-bold">
          {['-30m', '-15m', 'LIVE'].map((label, idx) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                setRadarFrame(idx);
                setIsPlayingRadar(false);
              }}
              className={`px-1.5 py-0.5 rounded-md transition-colors cursor-pointer ${
                radarFrame === idx
                  ? 'bg-cyan-500 text-slate-950 font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 6. Bottom-Right Controls: Legend & Zoom / Recenter / Fullscreen */}
      <div className="absolute bottom-2.5 right-2.5 z-20 pointer-events-auto flex items-center gap-2">
        {/* Radar dBZ Legend */}
        <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 text-[9px] text-slate-300 font-medium">
          <span>Light</span>
          <div className="w-14 h-1.5 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 via-yellow-400 to-red-500" />
          <span>Severe</span>
        </div>

        {/* Map Control Buttons */}
        <div className="flex items-center bg-slate-900/85 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden shadow-lg">
          <button
            type="button"
            onClick={recenterMap}
            title={`Center on ${city}`}
            className="p-1.5 hover:bg-white/15 text-slate-200 transition-colors border-r border-white/10 cursor-pointer"
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleZoom(1)}
            title="Zoom In"
            className="p-1.5 hover:bg-white/15 text-slate-200 transition-colors border-r border-white/10 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleZoom(-1)}
            title="Zoom Out"
            className="p-1.5 hover:bg-white/15 text-slate-200 transition-colors cursor-pointer"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Full Map Link Button */}
        {showFullMapLink && (
          <Link
            href="/map"
            title="Open Fullscreen Interactive Map"
            className="p-1.5 bg-slate-900/85 hover:bg-blue-600 backdrop-blur-md rounded-xl border border-white/10 text-white shadow-lg transition-all cursor-pointer flex items-center justify-center"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

    </div>
  );
}
