'use client';

import React from 'react';
import Link from 'next/link';
import {
  Cloud,
  CloudSun,
  Sun,
  AlertTriangle,
  MessageSquare,
  MapPin,
  ArrowRight,
  ShieldCheck,
  LayoutDashboard,
  ShieldAlert,
  Bot,
  Settings,
  Droplets,
  Wind,
  Gauge,
  Thermometer,
  Search,
  BarChart3,
  Bookmark
} from 'lucide-react';
import PublicNavbar from '../src/components/layout/PublicNavbar';
import { useApp } from '../src/Hooks/useAppContext';

export default function LandingPage() {
  const { t } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Public Navigation */}
      <PublicNavbar />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-8 sm:space-y-16 w-full">

        {/* ==================================================================== */}
        {/* SECTION 1: HERO SECTION */}
        {/* ==================================================================== */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-center pt-1 sm:pt-4">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-3 sm:space-y-5 text-left">
            <div className="space-y-1.5 sm:space-y-3">
              
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1]">
                {t('landing.heroTitle1', 'Stay Informed.')}<br />
                <span className="text-blue-600 dark:text-blue-500">{t('landing.heroTitle2', 'Stay Safer.')}</span>
              </h1>
              <p className="text-xs sm:text-sm lg:text-base text-slate-600 dark:text-slate-300 max-w-lg font-medium leading-relaxed">
                {t('landing.heroSubtitle', 'Get real-time weather updates, disaster news, and AI-powered insights — all in one place.')}
              </p>
            </div>

            {/* CTA Buttons (Minimized on Mobile, Comfortable on Desktop) */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-md sm:rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-xs hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
              >
                <span>{t('landing.getStarted', 'Get Started')}</span>
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Link>

              <a
                href="#features"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-md sm:rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold text-xs sm:text-sm border border-slate-200/80 dark:border-slate-700/80 shadow-2xs backdrop-blur-xs transition-all cursor-pointer"
              >
                <span>{t('landing.learnMore', 'Learn More')}</span>
              </a>
            </div>

            {/* 3 Quick Features Pill Row (Hidden on Mobile, Visible on Desktop sm:) */}
            <div className="hidden sm:grid sm:grid-cols-3 gap-3 pt-1">
              <div className="flex items-center gap-2.5 p-3 px-3 rounded-xl bg-white/75 dark:bg-slate-900/75 backdrop-blur-md border border-white/90 dark:border-slate-800 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <Cloud className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight truncate">
                  {t('landing.realtimeWeather', 'Real-time Weather')}
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 px-3 rounded-xl bg-white/75 dark:bg-slate-900/75 backdrop-blur-md border border-white/90 dark:border-slate-800 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight truncate">
                  {t('landing.disasterNewsAlerts', 'Disaster News & Alerts')}
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 px-3 rounded-xl bg-white/75 dark:bg-slate-900/75 backdrop-blur-md border border-white/90 dark:border-slate-800 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight truncate">
                  {t('landing.aiInsights', 'AI-Powered Insights')}
                </div>
              </div>
            </div>
          </div>

          {/* Hero Right Floating Tagline Card (Optimized for Mobile & Desktop) */}
          <div className="lg:col-span-5 flex items-center justify-start lg:justify-end w-full pt-1 sm:pt-0">
            <div className="w-full sm:max-w-sm rounded-xl sm:rounded-2xl p-2.5 sm:p-6 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xs sm:shadow-md space-y-1 sm:space-y-3 animate-in fade-in slide-in-from-bottom-3 duration-500">
              <div className="flex items-center gap-2 sm:block sm:space-y-2">
                <div className="w-1 sm:w-10 h-7 sm:h-1 bg-blue-600 rounded-full shrink-0" />
                <div className="space-y-0.5 sm:space-y-1.5 min-w-0">
                  <h3 className="text-xs sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                    {t('nav.tagline', 'A safer,\ngreener tomorrow.')}
                  </h3>
                  <p className="text-[9px] sm:text-xs lg:text-sm text-slate-600 dark:text-slate-400 font-medium leading-tight sm:leading-relaxed">
                    {t('landing.taglineDesc', 'Better information for a more resilient world.')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* SECTION 2: WHY WEATHERWISE? 4 FEATURE CARDS (Minimized 2x2 on Mobile, Full on Desktop) */}
        {/* ==================================================================== */}
        <section id="features" className="space-y-2.5 sm:space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-0.5 sm:space-y-2">
            <span className="text-[9px] sm:text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">
              {t('landing.whyHeader', 'WHY WEATHERWISE?')}
            </span>
            <h2 className="text-base sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('landing.whyTitle', 'Everything You Need, All in One Place')}
            </h2>
            <p className="text-[9px] sm:text-xs lg:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-xs sm:max-w-xl mx-auto">
              {t('landing.whySubtitle', 'From daily forecasts to disaster alerts and AI assistance, WeatherWise helps you stay prepared.')}
            </p>
          </div>

          {/* 4 Cards Grid (2x2 Compact on Mobile, 4-Col Spacious on Desktop) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-5">
            {/* Card 1: Accurate Weather Forecasts */}
            <div className="rounded-lg sm:rounded-2xl p-2 sm:p-5 lg:p-6 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all space-y-1 sm:space-y-3 flex flex-col justify-between">
              <div className="w-5.5 h-5.5 sm:w-11 sm:h-11 rounded-md sm:rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center shrink-0">
                <Sun className="w-3 h-3 sm:w-6 sm:h-6" />
              </div>
              <div className="space-y-0.5 sm:space-y-1.5">
                <h3 className="text-[11px] sm:text-base font-bold text-slate-900 dark:text-white leading-tight">
                  {t('landing.feature1Title', 'Accurate Weather Forecasts')}
                </h3>
                <p className="text-[9px] sm:text-xs text-slate-500 dark:text-slate-400 leading-tight sm:leading-relaxed line-clamp-2 sm:line-clamp-none">
                  {t('landing.feature1Desc', 'Get real-time and hourly weather updates for any location worldwide.')}
                </p>
              </div>
            </div>

            {/* Card 2: Disaster News & Alerts */}
            <div className="rounded-lg sm:rounded-2xl p-2 sm:p-5 lg:p-6 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all space-y-1 sm:space-y-3 flex flex-col justify-between">
              <div className="w-5.5 h-5.5 sm:w-11 sm:h-11 rounded-md sm:rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-3 h-3 sm:w-6 sm:h-6" />
              </div>
              <div className="space-y-0.5 sm:space-y-1.5">
                <h3 className="text-[11px] sm:text-base font-bold text-slate-900 dark:text-white leading-tight">
                  {t('landing.feature2Title', 'Disaster News & Alerts')}
                </h3>
                <p className="text-[9px] sm:text-xs text-slate-500 dark:text-slate-400 leading-tight sm:leading-relaxed line-clamp-2 sm:line-clamp-none">
                  {t('landing.feature2Desc', 'Stay informed about earthquakes, cyclones, floods, wildfires and more.')}
                </p>
              </div>
            </div>

            {/* Card 3: AI Weather Assistant */}
            <div className="rounded-lg sm:rounded-2xl p-2 sm:p-5 lg:p-6 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all space-y-1 sm:space-y-3 flex flex-col justify-between">
              <div className="w-5.5 h-5.5 sm:w-11 sm:h-11 rounded-md sm:rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <MessageSquare className="w-3 h-3 sm:w-6 sm:h-6" />
              </div>
              <div className="space-y-0.5 sm:space-y-1.5">
                <h3 className="text-[11px] sm:text-base font-bold text-slate-900 dark:text-white leading-tight">
                  {t('landing.feature3Title', 'AI Weather Assistant')}
                </h3>
                <p className="text-[9px] sm:text-xs text-slate-500 dark:text-slate-400 leading-tight sm:leading-relaxed line-clamp-2 sm:line-clamp-none">
                  {t('landing.feature3Desc', 'Ask questions, get personalized insights and safety recommendations.')}
                </p>
              </div>
            </div>

            {/* Card 4: Save Your Locations */}
            <div className="rounded-lg sm:rounded-2xl p-2 sm:p-5 lg:p-6 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all space-y-1 sm:space-y-3 flex flex-col justify-between">
              <div className="w-5.5 h-5.5 sm:w-11 sm:h-11 rounded-md sm:rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <MapPin className="w-3 h-3 sm:w-6 sm:h-6" />
              </div>
              <div className="space-y-0.5 sm:space-y-1.5">
                <h3 className="text-[11px] sm:text-base font-bold text-slate-900 dark:text-white leading-tight">
                  {t('landing.feature4Title', 'Save Your Locations')}
                </h3>
                <p className="text-[9px] sm:text-xs text-slate-500 dark:text-slate-400 leading-tight sm:leading-relaxed line-clamp-2 sm:line-clamp-none">
                  {t('landing.feature4Desc', 'Track multiple locations and get instant updates for places that matter.')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* SECTION 3: PRODUCT UI PREVIEW & COMPREHENSIVE METEOROLOGY (Minimized on Mobile, Full on Desktop) */}
        {/* ==================================================================== */}
        <section className="rounded-lg sm:rounded-2xl bg-blue-50/70 dark:bg-slate-900/60 backdrop-blur-md p-2.5 sm:p-6 lg:p-8 border border-blue-100/80 dark:border-slate-800 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6 lg:gap-8 items-center">
            
            {/* Left 7-Col: Dashboard Window Mockup (Ultra-Minimized on Mobile, Realistic on Desktop) */}
            <div className="lg:col-span-7">
              <div className="rounded-lg sm:rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs sm:shadow-md overflow-hidden">
                {/* Window Top Titlebar */}
                <div className="flex items-center justify-between px-2 sm:px-3 py-1 bg-slate-100/90 dark:bg-slate-800/90 border-b border-slate-200/80 dark:border-slate-700/80">
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-rose-400" />
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-400" />
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-[8px] sm:text-[10px] font-bold text-slate-500 dark:text-slate-400">WeatherWise Live App Preview</span>
                  <div className="w-5 sm:w-8" />
                </div>

                <div className="flex flex-col sm:flex-row sm:min-h-[360px] lg:min-h-[400px]">
                  
                  {/* Mini Sidebar: Horizontal compact bar on mobile, Vertical on desktop */}
                  <div className="sm:w-36 lg:w-44 bg-slate-50/90 dark:bg-slate-950/90 p-1 sm:p-3 border-b sm:border-b-0 sm:border-r border-slate-200/80 dark:border-slate-800 flex flex-row sm:flex-col justify-between items-center sm:items-stretch shrink-0 overflow-x-auto no-scrollbar">
                    <div className="flex sm:flex-col items-center sm:items-stretch gap-1 sm:gap-3 w-full">
                      {/* Logo */}
                      <div className="hidden sm:flex items-center gap-1 sm:gap-1.5 px-1 py-0.5">
                        <Cloud className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 fill-blue-600" />
                        <span className="text-[10px] sm:text-xs font-black text-slate-900 dark:text-white">WeatherWise</span>
                      </div>

                      {/* Mini Nav Items (horizontal scroll on mobile, vertical stack on desktop) */}
                      <div className="flex sm:flex-col items-center sm:items-stretch gap-0.5 sm:gap-1 text-[8px] sm:text-xs font-semibold w-full">
                        <div className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-0.5 sm:py-1.5 rounded bg-blue-600 text-white font-bold shadow-xs shrink-0">
                          <LayoutDashboard className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                          <span>{t('nav.dashboard', 'Dashboard')}</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-0.5 sm:py-1.5 rounded text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0">
                          <CloudSun className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                          <span>{t('nav.weather', 'Weather')}</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-0.5 sm:py-1.5 rounded text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0">
                          <ShieldAlert className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                          <span>{t('nav.alerts', 'Disaster')}</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-0.5 sm:py-1.5 rounded text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0">
                          <Bot className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                          <span>{t('nav.chat', 'AI')}</span>
                        </div>
                        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                          <Bookmark className="w-3.5 h-3.5" />
                          <span>{t('nav.favorites', 'Saved')}</span>
                        </div>
                        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                          <Settings className="w-3.5 h-3.5" />
                          <span>{t('nav.settings', 'Settings')}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main Content Area */}
                  <div className="flex-1 p-1.5 sm:p-3.5 space-y-1.5 sm:space-y-3 bg-white dark:bg-slate-900">
                    {/* Top Search Bar */}
                    <div className="relative">
                      <Search className="w-2 sm:w-3.5 h-2 sm:h-3.5 text-slate-400 absolute left-1.5 sm:left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        readOnly
                        placeholder="Search for a city or location..."
                        className="w-full pl-5 sm:pl-8 pr-2 py-0.5 sm:py-1.5 text-[8px] sm:text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded sm:rounded-lg text-slate-600 dark:text-slate-300 placeholder:text-slate-400 focus:outline-hidden"
                      />
                    </div>

                    {/* Current Weather Card */}
                    <div className="p-1.5 sm:p-3.5 rounded-md sm:rounded-xl bg-slate-50/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                      <div className="space-y-0.5 sm:space-y-1">
                        <div className="flex items-center gap-1 text-[9px] sm:text-xs font-bold text-slate-900 dark:text-white">
                          <MapPin className="w-2 sm:w-3.5 h-2 sm:h-3.5 text-blue-600" />
                          <span>Bengaluru, India</span>
                        </div>
                        <div className="text-[8px] sm:text-xs text-slate-500 font-medium">Partly Cloudy</div>
                        <div className="text-base sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white">28°C</div>
                      </div>

                      <div className="text-right space-y-0.5 sm:space-y-1 text-[8px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300">
                        <div className="flex items-center justify-end gap-1">
                          <Droplets className="w-2 h-2 sm:w-3 sm:h-3 text-blue-500" />
                          <span>Humidity 62%</span>
                        </div>
                        <div className="flex items-center justify-end gap-1">
                          <Wind className="w-2 h-2 sm:w-3 sm:h-3 text-blue-500" />
                          <span>Wind 12 km/h</span>
                        </div>
                        <div className="flex items-center justify-end gap-1">
                          <Gauge className="w-2 h-2 sm:w-3 sm:h-3 text-blue-500" />
                          <span>Pressure 1012 hPa</span>
                        </div>
                        <div className="flex items-center justify-end gap-1">
                          <Thermometer className="w-2 h-2 sm:w-3 sm:h-3 text-blue-500" />
                          <span>Feels 30°C</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 5-Col: Feature Highlights (Hidden on Mobile, Visible on Desktop lg:) */}
            <div className="hidden lg:block lg:col-span-5 space-y-3 sm:space-y-5 text-left">
              <div className="space-y-1 sm:space-y-2">
                <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">
                  {t('landing.companionHeader', 'YOUR WEATHER COMPANION')}
                </span>
                <h2 className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                  {t('landing.companionTitle', 'Comprehensive Meteorological Intelligence')}
                </h2>
                <p className="text-[10px] sm:text-xs lg:text-sm text-slate-600 dark:text-slate-400 font-medium">
                  {t('landing.companionSubtitle', 'Real-time data. Smarter insights. A safer tomorrow.')}
                </p>
              </div>

              {/* 3 Detailed Items */}
              <div className="space-y-2 sm:space-y-4 pt-0.5">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-6.5 h-6.5 sm:w-10 sm:h-10 rounded-md sm:rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <BarChart3 className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {t('landing.liveTrackingTitle', 'Live Weather Tracking')}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                      {t('landing.liveTrackingDesc', 'Accurate and up-to-date weather information.')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-6.5 h-6.5 sm:w-10 sm:h-10 rounded-md sm:rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <ShieldCheck className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {t('landing.disasterEarlyTitle', 'Disaster Early Warning')}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                      {t('landing.disasterEarlyDesc', 'Instant alerts for natural disasters.')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-6.5 h-6.5 sm:w-10 sm:h-10 rounded-md sm:rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Bot className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {t('landing.conversationalAiTitle', 'Conversational AI Meteorologist')}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                      {t('landing.conversationalAiDesc', 'Get answers, safety tips, and personalized insights.')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ==================================================================== */}
        {/* SECTION 4: BOTTOM CALL TO ACTION & QUOTE (Minimized on Mobile, Full on Desktop) */}
        {/* ==================================================================== */}
        <section className="py-2.5 sm:py-8 lg:py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-8 max-w-4xl mx-auto">
            {/* Left/Center CTA */}
            <div className="space-y-1 sm:space-y-2.5 text-center md:text-left">
              <span className="text-[9px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 block">
                Join a more informed and resilient world.
              </span>
              <h2 className="text-lg sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {t('landing.heroTitle1', 'Stay Informed.')} {t('landing.heroTitle2', 'Stay Safer.')}
              </h2>
              <div className="pt-0.5 sm:pt-1">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-md sm:rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-xs hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                >
                  <span>{t('landing.getStarted', 'Get Started')}</span>
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </Link>
              </div>
            </div>

            {/* Right Quote */}
            <div className="max-w-[240px] sm:max-w-xs space-y-0.5 sm:space-y-1.5 text-center md:text-right border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-1.5 md:pt-0 md:pl-6">
              <p className="text-[10px] sm:text-sm lg:text-base font-semibold italic text-slate-700 dark:text-slate-300">
                “Better information today for a safer tomorrow.”
              </p>
              <div className="w-4 sm:w-8 h-0.5 sm:h-1 bg-blue-600 rounded-full mx-auto md:ml-auto md:mr-0" />
            </div>
          </div>
        </section>

      </main>

      {/* ==================================================================== */}
      {/* FOOTER (Minimized & Compact) */}
      {/* ==================================================================== */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 pb-2.5 sm:pb-6 mt-1 sm:mt-4">
        <footer id="contact" className="w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-lg sm:rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs px-3 sm:px-6 py-1.5 sm:py-3 flex flex-row items-center justify-between gap-2">
          
          {/* Brand */}
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-md sm:rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <Cloud className="w-3 h-3 sm:w-4 sm:h-4 fill-white stroke-none" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[11px] sm:text-sm font-black text-slate-900 dark:text-white leading-tight">
                Weather<span className="text-blue-600">Wise</span>
              </span>
              <span className="hidden sm:inline text-[8px] sm:text-[9px] font-semibold text-slate-500 dark:text-slate-400 leading-none">
                Stay Informed. Stay Safer.
              </span>
            </div>
          </Link>

          {/* Copyright & Socials */}
          <div className="flex items-center gap-2 sm:gap-3 text-slate-500 dark:text-slate-400 text-xs">
            <div className="flex items-center gap-1 sm:gap-1.5 text-slate-600 dark:text-slate-300">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 transition-all">
                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 transition-all">
                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 transition-all">
                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                </svg>
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

