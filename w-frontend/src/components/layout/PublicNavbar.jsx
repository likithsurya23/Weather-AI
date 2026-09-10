'use client';

import React from 'react';
import Link from 'next/link';
import { Cloud } from 'lucide-react';
import { useApp } from '../../Hooks/useAppContext';

export default function PublicNavbar() {
  const { t } = useApp();

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 pt-4 sm:pt-6 z-20">
      <header className="w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs px-5 sm:px-7 py-3 sm:py-3.5 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform shrink-0">
            <Cloud className="w-5 h-5 sm:w-6 sm:h-6 fill-white stroke-none" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Weather<span className="text-blue-600">Wise</span>
            </span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-700 dark:text-slate-200">
          <Link 
            href="/" 
            className="text-blue-600 dark:text-blue-400 font-bold border-b-2 border-blue-600 dark:border-blue-400 pb-1"
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

        {/* Auth Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Link
            href="/login"
            className="px-3.5 sm:px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 text-xs sm:text-sm font-bold shadow-2xs transition-all cursor-pointer"
          >
            {t('nav.signIn', 'Sign In')}
          </Link>
          
          <Link
            href="/login"
            className="px-4 sm:px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/25 hover:shadow-blue-500/40 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            {t('nav.getStarted', 'Get Started')}
          </Link>
        </div>
      </header>
    </div>
  );
}
