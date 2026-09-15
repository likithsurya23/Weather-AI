'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const DynamicInteractiveRadarMap = dynamic(
  () => import('./InteractiveRadarMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-52 sm:h-64 md:h-72 rounded-xl sm:rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-slate-400 gap-2 relative overflow-hidden">
        {/* Animated Radar Pulse Rings Skeleton */}
        <div className="absolute w-44 h-44 rounded-full border border-cyan-500/20 animate-ping opacity-25" />
        <div className="absolute w-24 h-24 rounded-full border border-cyan-500/40 animate-pulse" />
        <div className="relative z-10 flex items-center gap-2 bg-slate-900/90 px-3.5 py-1.5 rounded-full border border-cyan-500/30 text-xs font-semibold text-cyan-400 shadow-md">
          <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
          <span>Calibrating Doppler Radar & Satellite Feeds...</span>
        </div>
      </div>
    )
  }
);

export default function WeatherRadarSatelliteMap(props) {
  return <DynamicInteractiveRadarMap {...props} />;
}
