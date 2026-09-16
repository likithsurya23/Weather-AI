'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Globe,
  Activity,
  Wind,
  Waves,
  Flame,
  FlameKindling,
  ArrowRight,
  AlertTriangle,
  Mountain,
  Sun,
  Radio
} from 'lucide-react';
import { useApp } from '../../Hooks/useAppContext';
import { getDisasterCategory } from '../../lib/disasterClassifier';

// Representative global coordinates for hazards
const REGIONAL_SECTORS = [
  { keywords: ['california', 'pacific', 'usa', 'united states', 'hawaii', 'west coast'], x: 19, y: 35 },
  { keywords: ['florida', 'caribbean', 'atlantic', 'gulf', 'mexico', 'texas'], x: 26, y: 44 },
  { keywords: ['chile', 'peru', 'andes', 'south america', 'brazil', 'argentina'], x: 30, y: 72 },
  { keywords: ['iceland', 'uk', 'britain', 'ireland', 'scotland'], x: 47, y: 22 },
  { keywords: ['europe', 'mediterranean', 'italy', 'greece', 'spain', 'turkey'], x: 53, y: 36 },
  { keywords: ['africa', 'sahara', 'congo', 'kenya', 'south africa', 'morocco'], x: 52, y: 56 },
  { keywords: ['india', 'nepal', 'bay of bengal', 'assam', 'delhi', 'karnataka', 'himalaya'], x: 70, y: 43 },
  { keywords: ['china', 'sichuan', 'beijing', 'yangtze'], x: 78, y: 38 },
  { keywords: ['japan', 'tokyo', 'fukushima', 'honshu', 'hokkaido'], x: 86, y: 37 },
  { keywords: ['indonesia', 'philippines', 'java', 'sumatra', 'bali'], x: 80, y: 58 },
  { keywords: ['australia', 'queensland', 'sydney', 'pacific islands', 'new zealand'], x: 86, y: 76 }
];

const DEFAULT_PINS = [
  { id: 'def-1', cat: 'earthquake', title: 'Ring of Fire Seismic Activity', location: 'Pacific Rim / Honshu', x: 86, y: 37, sev: 'danger' },
  { id: 'def-2', cat: 'cyclone', title: 'Tropical Cyclone Formation Zone', location: 'Bay of Bengal', x: 72, y: 45, sev: 'warning' },
  { id: 'def-3', cat: 'wildfire', title: 'Severe Wildfire Perimeter', location: 'Western North America', x: 20, y: 33, sev: 'warning' },
  { id: 'def-4', cat: 'flood', title: 'River Basin Inundation Watch', location: 'Central Europe', x: 53, y: 33, sev: 'warning' },
  { id: 'def-5', cat: 'volcano', title: 'Volcanic Alert Level 2 (Ash Plume)', location: 'Indonesia Archipelago', x: 80, y: 58, sev: 'danger' },
  { id: 'def-6', cat: 'earthquake', title: 'Tectonic Fault Shift M 5.2', location: 'Chile Subduction Trench', x: 29, y: 72, sev: 'danger' },
  { id: 'def-7', cat: 'flood', title: 'Monsoon Flash Inundation', location: 'Assam / Brahmaputra', x: 73, y: 41, sev: 'danger' }
];

export default function GlobalDisasterRadarMap({ newsList = [], onSelectArticle }) {
  const { t } = useApp();
  const [activeFilter, setActiveFilter] = useState('all');
  const [hoveredPin, setHoveredPin] = useState(null);

  // Map live news articles to map pins
  const pins = useMemo(() => {
    if (!newsList || newsList.length === 0) return DEFAULT_PINS;

    const mapped = [];
    const usedCoords = new Set();

    newsList.slice(0, 16).forEach((article, idx) => {
      const text = `${article.location || ''} ${article.title || ''}`.toLowerCase();
      let matchedCoord = null;

      for (const sector of REGIONAL_SECTORS) {
        if (sector.keywords.some((kw) => text.includes(kw))) {
          matchedCoord = sector;
          break;
        }
      }

      if (!matchedCoord) {
        const fallbackX = 20 + ((idx * 23) % 65);
        const fallbackY = 25 + ((idx * 17) % 50);
        matchedCoord = { x: fallbackX, y: fallbackY };
      }

      let px = matchedCoord.x;
      let py = matchedCoord.y;
      const coordKey = `${Math.round(px)}_${Math.round(py)}`;
      if (usedCoords.has(coordKey)) {
        px += ((idx % 3) - 1) * 3.5;
        py += (((idx + 1) % 3) - 1) * 3;
      }
      usedCoords.add(`${Math.round(px)}_${Math.round(py)}`);

      const cat = getDisasterCategory(article);

      mapped.push({
        id: article.id || `live_${idx}`,
        article,
        title: article.title,
        location: article.location || 'Global Dispatch',
        cat,
        sev: article.severity || 'warning',
        time: article.time || 'Live',
        x: Math.max(8, Math.min(92, px)),
        y: Math.max(12, Math.min(85, py))
      });
    });

    return mapped.length > 0 ? mapped : DEFAULT_PINS;
  }, [newsList]);

  // Filter pins
  const filteredPins = useMemo(() => {
    if (activeFilter === 'all') return pins;
    if (activeFilter === 'earthquake') return pins.filter((p) => p.cat === 'earthquake');
    if (activeFilter === 'cyclone') return pins.filter((p) => p.cat === 'cyclone' || p.cat === 'storm');
    if (activeFilter === 'flood') return pins.filter((p) => p.cat === 'flood');
    if (activeFilter === 'wildfire') return pins.filter((p) => p.cat === 'wildfire');
    if (activeFilter === 'drought') return pins.filter((p) => p.cat === 'drought');
    return pins;
  }, [pins, activeFilter]);

  const getPinColor = (sev, cat) => {
    if (sev === 'danger') return { bg: 'bg-rose-500', ring: 'ring-rose-400/40', ping: 'bg-rose-400' };
    if (cat === 'flood') return { bg: 'bg-emerald-500', ring: 'ring-emerald-400/40', ping: 'bg-emerald-400' };
    if (cat === 'cyclone') return { bg: 'bg-blue-500', ring: 'ring-blue-400/40', ping: 'bg-blue-400' };
    if (cat === 'wildfire') return { bg: 'bg-orange-500', ring: 'ring-orange-400/40', ping: 'bg-orange-400' };
    if (cat === 'drought') return { bg: 'bg-amber-600', ring: 'ring-amber-500/40', ping: 'bg-amber-500' };
    if (cat === 'earthquake') return { bg: 'bg-purple-500', ring: 'ring-purple-400/40', ping: 'bg-purple-400' };
    return { bg: 'bg-amber-500', ring: 'ring-amber-400/40', ping: 'bg-amber-400' };
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'earthquake': return Activity;
      case 'flood': return Waves;
      case 'cyclone': return Wind;
      case 'wildfire': return Flame;
      case 'volcano': return FlameKindling;
      case 'landslide': return Mountain;
      case 'drought': return Sun;
      default: return AlertTriangle;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg sm:rounded-xl p-2.5 sm:p-3 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
      
      {/* Top Header Card */}
      <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
            {t('alerts.globalDisasterMap', 'Global Disaster Map')}
          </h3>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[9px] font-bold border border-emerald-200 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{t('common.live', 'LIVE')}</span>
          </span>
        </div>

        <Link
          href="/map"
          className="text-[10px] sm:text-[11px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-0.5 transition-colors"
        >
          <span>{t('alerts.viewFullMap', 'View Full Map')}</span>
          <ArrowRight className="w-2.5 h-2.5" />
        </Link>
      </div>

      {/* Layer Filter Pills */}
      <div className="flex items-center justify-between gap-1 pt-2 pb-1.5 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1">
          {[
            { id: 'all', label: t('alerts.filterAll', 'All') },
            { id: 'earthquake', label: t('alerts.filterQuakes', 'Quakes') },
            { id: 'cyclone', label: t('alerts.filterStorms', 'Storms') },
            { id: 'flood', label: t('alerts.filterFloods', 'Floods') },
            { id: 'wildfire', label: t('alerts.filterFires', 'Fires') },
            { id: 'drought', label: t('alerts.filterDrought', 'Drought') }
          ].map((btn) => {
            const active = activeFilter === btn.id;
            return (
              <button
                key={btn.id}
                onClick={() => setActiveFilter(btn.id)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-700'
                }`}
              >
                {btn.label}
              </button>
            );
          })}
        </div>

        <span className="text-[9px] font-mono text-slate-400 shrink-0">
          {t('alerts.activeCount', '{count} active', { count: filteredPins.length })}
        </span>
      </div>

      {/* Map Radar Canvas */}
      <div className="relative h-32 sm:h-36 my-1.5 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 overflow-hidden flex items-center justify-center select-none transition-colors">
        
        {/* Coordinate Graticule Grid Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30 dark:opacity-20" xmlns="http://www.w3.org/2000/svg">
          <line x1="0" y1="25%" x2="100%" y2="25%" stroke="#94A3B8" strokeWidth="0.75" strokeDasharray="3 3" />
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#64748B" strokeWidth="1" strokeDasharray="4 2" />
          <line x1="0" y1="75%" x2="100%" y2="75%" stroke="#94A3B8" strokeWidth="0.75" strokeDasharray="3 3" />
          <line x1="25%" y1="0" x2="25%" y2="100%" stroke="#94A3B8" strokeWidth="0.75" strokeDasharray="3 3" />
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#64748B" strokeWidth="1" strokeDasharray="4 2" />
          <line x1="75%" y1="0" x2="75%" y2="100%" stroke="#94A3B8" strokeWidth="0.75" strokeDasharray="3 3" />
        </svg>

        {/* High-Fidelity World Map Silhouette Vector */}
        <svg
          viewBox="0 0 1000 500"
          className="absolute inset-0 w-full h-full object-fill opacity-70 dark:opacity-40 transition-opacity duration-300 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* North America */}
          <path
            d="M80,80 Q140,50 220,60 Q280,70 300,120 Q280,160 250,180 Q220,220 180,250 Q160,280 150,300 Q140,280 120,240 Q90,200 70,160 Q60,110 80,80 Z"
            className="fill-slate-200 stroke-slate-300 dark:fill-slate-800 dark:stroke-slate-700"
            strokeWidth="1.5"
          />
          {/* Greenland */}
          <path
            d="M340,40 Q400,30 420,60 Q390,110 350,100 Q330,80 340,40 Z"
            className="fill-slate-200 stroke-slate-300 dark:fill-slate-800 dark:stroke-slate-700"
            strokeWidth="1"
          />
          {/* South America */}
          <path
            d="M240,280 Q290,270 320,310 Q340,360 320,410 Q290,460 260,490 Q240,470 230,420 Q220,360 220,320 Q230,290 240,280 Z"
            className="fill-slate-200 stroke-slate-300 dark:fill-slate-800 dark:stroke-slate-700"
            strokeWidth="1.5"
          />
          {/* Europe */}
          <path
            d="M480,100 Q560,90 580,130 Q560,180 520,190 Q480,190 460,160 Q450,130 480,100 Z"
            className="fill-slate-200 stroke-slate-300 dark:fill-slate-800 dark:stroke-slate-700"
            strokeWidth="1.5"
          />
          {/* Africa */}
          <path
            d="M460,200 Q560,190 580,240 Q600,310 560,380 Q520,440 480,430 Q450,390 440,320 Q420,250 460,200 Z"
            className="fill-slate-200 stroke-slate-300 dark:fill-slate-800 dark:stroke-slate-700"
            strokeWidth="1.5"
          />
          {/* Asia */}
          <path
            d="M580,100 Q720,70 850,90 Q920,130 910,210 Q860,260 800,280 Q740,320 680,310 Q640,280 620,220 Q590,160 580,100 Z"
            className="fill-slate-200 stroke-slate-300 dark:fill-slate-800 dark:stroke-slate-700"
            strokeWidth="1.5"
          />
          {/* Japan */}
          <path
            d="M870,180 Q890,170 885,210 Q870,230 860,210 Z"
            className="fill-slate-300 stroke-slate-400 dark:fill-slate-700 dark:stroke-slate-600"
            strokeWidth="1"
          />
          {/* Southeast Asia / Indonesia */}
          <path
            d="M740,330 Q820,340 850,370 Q810,400 760,390 Q720,360 740,330 Z"
            className="fill-slate-200 stroke-slate-300 dark:fill-slate-800 dark:stroke-slate-700"
            strokeWidth="1.5"
          />
          {/* Australia */}
          <path
            d="M780,380 Q860,360 890,400 Q880,460 840,480 Q780,470 760,430 Q760,390 780,380 Z"
            className="fill-slate-200 stroke-slate-300 dark:fill-slate-800 dark:stroke-slate-700"
            strokeWidth="1.5"
          />
        </svg>

        {/* Top-Right HUD Badge */}
        <div className="absolute top-1.5 right-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-[8px] font-mono text-slate-600 dark:text-cyan-400 backdrop-blur-xs pointer-events-none">
          <Radio className="w-2 h-2 text-blue-500 dark:text-cyan-400 animate-pulse" />
          <span>RADAR SCAN</span>
        </div>

        {/* Dynamic Hazard Pins */}
        {filteredPins.map((pin) => {
          const color = getPinColor(pin.sev, pin.cat);

          return (
            <div
              key={pin.id}
              style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
              onMouseEnter={() => setHoveredPin(pin)}
              onMouseLeave={() => setHoveredPin(null)}
              onClick={() => pin.article && onSelectArticle && onSelectArticle(pin.article)}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 group p-1"
            >
              {/* Outer Pulsing Beacon Wave */}
              <span className={`absolute inset-0 rounded-full ${color.ping} opacity-75 animate-ping`} />
              
              {/* Core Beacon Dot */}
              <div
                className={`relative w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${color.bg} ring-2 ${color.ring} shadow-xs transition-transform duration-200 group-hover:scale-125`}
              />
            </div>
          );
        })}

        {/* Interactive Hover HUD Tooltip */}
        {hoveredPin && (
          <div
            style={{
              left: `${Math.min(75, Math.max(25, hoveredPin.x))}%`,
              top: `${hoveredPin.y > 55 ? hoveredPin.y - 22 : hoveredPin.y + 10}%`
            }}
            className="absolute -translate-x-1/2 z-30 pointer-events-none bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700 rounded-lg p-2 shadow-xl backdrop-blur-md max-w-[200px] sm:max-w-[220px] animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between gap-1.5 pb-1 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1">
                {React.createElement(getCategoryIcon(hoveredPin.cat), {
                  className: 'w-2.5 h-2.5 text-blue-600 dark:text-blue-400'
                })}
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {hoveredPin.cat}
                </span>
              </div>
              <span className="text-[8px] font-mono px-1 rounded bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                {hoveredPin.sev === 'danger' ? 'High Risk' : 'Advisory'}
              </span>
            </div>

            <p className="text-[10px] font-semibold text-slate-800 dark:text-white mt-1 line-clamp-2 leading-tight">
              {hoveredPin.title}
            </p>

            <div className="mt-1 flex items-center justify-between text-[8px] font-mono text-slate-500 dark:text-slate-400">
              <span className="truncate max-w-[110px]">{hoveredPin.location}</span>
              <span className="text-blue-600 dark:text-cyan-400 font-bold shrink-0">VIEW</span>
            </div>
          </div>
        )}
      </div>

      {/* Map Legend */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1.5 text-[9px] sm:text-[10px] text-slate-600 dark:text-slate-400 font-medium">
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
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
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
          <span>Drought</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span>Other</span>
        </div>
      </div>

    </div>
  );
}
