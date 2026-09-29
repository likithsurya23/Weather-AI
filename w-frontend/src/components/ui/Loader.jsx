'use client';

import React, { useState, useEffect } from 'react';
import AppCloudBackground from '../layout/AppCloudBackground';

const ICONS = ['☀️', '⛅', '🌧️', '❄️'];

const Loader = () => {
  const [iconIndex, setIconIndex] = useState(0);

  useEffect(() => {
    // Each icon displays for 2.0s -> 4 icons * 2.0s = 8.0s total cycle
    const interval = setInterval(() => {
      setIconIndex((prev) => (prev + 1) % ICONS.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="loader-screen-container font-sans select-none"
      role="status"
      aria-live="polite"
      aria-label="Loading WeatherWise"
    >
      {/* Animated cloud background used throughout the application */}
      <AppCloudBackground />

      {/* Proportional Scaling Wrapper */}
      <div className="loader-scale-wrapper">
        {/* Widget */}
        <div className="loader-card">
          {/* Icon viewport */}
          <div className="loader-icon-box">
            {/* Glossy highlight overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/50 pointer-events-none z-[2]" />

            {/* Cycling icon with seamless key-based transition */}
            <div className="absolute inset-0 flex items-center justify-center z-[2]">
              <span
                key={iconIndex}
                className="loader-icon-emoji select-none animate-[popSwap_2s_cubic-bezier(0.16,1,0.3,1)_both]"
              >
                {ICONS[iconIndex]}
              </span>
            </div>
          </div>

          {/* Info column */}
          <div className="loader-info-col">
            {/* Title row */}
            <div className="flex items-center justify-between gap-2.5 font-semibold text-slate-800 tracking-[0.2px]">
              <span className="font-bold tracking-tight text-slate-900 loader-title-text">
                Weather <span className="text-blue-600">Wise</span>
              </span>
              <span className="flex items-center gap-[3px] font-semibold text-blue-600 tracking-[1px] uppercase shrink-0 loader-badge-text">
                Loading
                <span className="inline-flex gap-[2px] ml-1">
                  <span className="w-[3px] h-[3px] rounded-full bg-blue-600 animate-[blink_1.4s_ease-in-out_infinite]" />
                  <span className="w-[3px] h-[3px] rounded-full bg-blue-600 animate-[blink_1.4s_ease-in-out_infinite] [animation-delay:0.2s]" />
                  <span className="w-[3px] h-[3px] rounded-full bg-blue-600 animate-[blink_1.4s_ease-in-out_infinite] [animation-delay:0.4s]" />
                </span>
              </span>
            </div>

            {/* Progress track */}
            <div className="relative w-full h-1 bg-slate-200/80 rounded-full overflow-hidden">
              <div className="absolute top-0 h-full w-1/2 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500 animate-[slide_1.8s_ease-in-out_infinite] shadow-[0_0_10px_rgba(59,130,246,0.7)]" />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Loader;
