'use client';

import React from 'react';
import Link from 'next/link';
import { Cloud } from 'lucide-react';
import { useApp } from '../../Hooks/useAppContext';

export default function PublicNavbar() {
  const { t } = useApp();

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 pt-2 sm:pt-3.5 z-20">
      <header className="w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs px-3.5 sm:px-6 py-2 sm:py-3.5 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group">
          <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform shrink-0">
            <Cloud className="w-4 h-4 sm:w-5 sm:h-5 fill-white stroke-none" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm sm:text-lg font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Weather<span className="text-blue-600">Wise</span>
            </span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
          <Link 
            href="/" 
            className="text-blue-600 dark:text-blue-400 font-bold border-b-2 border-blue-600 dark:border-blue-400 pb-0.5"
          >
            {t('nav.home', 'Home')}
          </Link>
          <a 
            href="#features" 
            className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-semibold"
          >
            {t('nav.features', 'Features')}
          </a>
          <Link 
            href="/about" 
            className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-semibold"
          >
            {t('nav.about', 'About')}
          </Link>
        </nav>

        {/* Auth Actions (Minimized Buttons on Mobile, Standard on Desktop) */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="px-2.5 py-1 sm:px-4 sm:py-2 rounded-md sm:rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 text-[11px] sm:text-xs font-semibold shadow-2xs transition-all cursor-pointer"
          >
            {t('nav.signIn', 'Sign In')}
          </Link>
          
          <Link
            href="/login"
            className="px-2.5 sm:px-4 py-1 sm:py-2 rounded-md sm:rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] sm:text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            {t('nav.getStarted', 'Get Started')}
          </Link>
        </div>
      </header>
    </div>
  );
}
