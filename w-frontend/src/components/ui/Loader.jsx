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
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden font-sans">
      {/* Animated cloud background used throughout the application */}
      <AppCloudBackground />

      {/* Widget */}
      <div
        className="relative z-10 flex items-center gap-[18px] px-6 py-4 bg-white/95 backdrop-blur-md rounded-[20px]"
        style={{
          boxShadow:
            '0 8px 32px -4px rgba(15, 23, 42, 0.15), 0 0 0 1px rgba(15, 23, 42, 0.05)',
        }}
      >
        {/* Icon viewport */}
        <div className="relative w-[52px] h-[52px] rounded-[14px] bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center overflow-hidden flex-shrink-0">
          {/* Glossy highlight overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/50 pointer-events-none z-[2]" />

          {/* Cycling icon with seamless key-based transition */}
          <div className="absolute inset-0 flex items-center justify-center z-[2]">
            <span
              key={iconIndex}
              className="text-[1.75rem] select-none animate-[popSwap_2s_cubic-bezier(0.16,1,0.3,1)_both]"
            >
              {ICONS[iconIndex]}
            </span>
          </div>
        </div>

        {/* Info column */}
        <div className="flex flex-col gap-2.5 min-w-[185px]">
          {/* Title row */}
          <div className="flex items-center justify-between gap-3 text-[0.85rem] font-semibold text-slate-800 tracking-[0.2px]">
            <span className="font-bold tracking-tight text-slate-900">
              Weather <span className="text-blue-600">Wise</span>
            </span>
            <span className="flex items-center gap-[3px] text-[0.7rem] font-semibold text-blue-600 tracking-[1px] uppercase shrink-0">
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

      {/* Keyframes */}
      <style>{`
        @keyframes popSwap {
          0% {
            opacity: 0;
            transform: translateY(16px) scale(0.65);
          }
          12%, 88% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-16px) scale(0.65);
          }
        }
        @keyframes blink {
          0%, 100% { opacity: 0.25; }
          50%      { opacity: 1; }
        }
        @keyframes slide {
          0%   { left: -50%; }
          100% { left: 100%; }
        }
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Loader;
