'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Cloud,
  CloudSun,
  Sun,
  AlertTriangle,
  MessageSquare,
  MapPin,
  ArrowRight,
  Globe,
  Users,
  ShieldCheck,
  Leaf,
  Send,
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
  const router = useRouter();
  const { t } = useApp();
  const [mockQuestion, setMockQuestion] = useState('');

  const handleAskAiSubmit = (e) => {
    e.preventDefault();
    if (mockQuestion.trim()) {
      router.push(`/chat?prompt=${encodeURIComponent(mockQuestion.trim())}`);
    } else {
      router.push('/chat');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Public Navigation */}
      <PublicNavbar />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-6 sm:px-8 py-6 sm:py-10 space-y-20 sm:space-y-28 w-full">

        {/* ==================================================================== */}
        {/* SECTION 1: HERO SECTION */}
        {/* ==================================================================== */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center pt-2 sm:pt-6">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="space-y-3">
              <span className="text-xs font-extrabold uppercase tracking-widest text-slate-600 dark:text-slate-400 block">
                {t('landing.overline', 'Real-time weather. Real impact.')}
              </span>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.08]">
                {t('landing.heroTitle1', 'Stay Informed.')}<br />
                <span className="text-blue-600 dark:text-blue-500">{t('landing.heroTitle2', 'Stay Safer.')}</span>
              </h1>
              <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 max-w-xl font-medium leading-relaxed">
                {t('landing.heroSubtitle', 'Get real-time weather updates, disaster news, and AI-powered insights — all in one place.')}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-4 flex-wrap pt-1">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 sm:px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>{t('landing.getStarted', 'Get Started')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="#features"
                className="inline-flex items-center gap-2 px-6 sm:px-7 py-3.5 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-sm sm:text-base border border-slate-200/80 dark:border-slate-700/80 shadow-2xs backdrop-blur-xs transition-all cursor-pointer"
              >
                <span>{t('landing.learnMore', 'Learn More')}</span>
              </a>
            </div>

            {/* 3 Quick Features Pill Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
              <div className="flex items-center gap-3 p-3 px-3.5 rounded-2xl bg-white/75 dark:bg-slate-900/75 backdrop-blur-md border border-white/90 dark:border-slate-800 shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <Cloud className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                  {t('landing.realtimeWeather', 'Real-time Weather Updates')}
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 px-3.5 rounded-2xl bg-white/75 dark:bg-slate-900/75 backdrop-blur-md border border-white/90 dark:border-slate-800 shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                  {t('landing.disasterNewsAlerts', 'Natural Disaster News & Alerts')}
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 px-3.5 rounded-2xl bg-white/75 dark:bg-slate-900/75 backdrop-blur-md border border-white/90 dark:border-slate-800 shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                  {t('landing.aiInsights', 'AI-Powered Insights')}
                </div>
              </div>
            </div>
          </div>

          {/* Hero Right Floating Tagline Card */}
          <div className="lg:col-span-5 flex items-center justify-center lg:justify-end">
            <div className="w-full max-w-sm rounded-3xl p-7 sm:p-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/90 dark:border-slate-800 shadow-xl space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                  {t('nav.tagline', 'A safer,\ngreener tomorrow.')}
                </h3>
                <div className="w-12 h-1 bg-blue-600 rounded-full" />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                {t('landing.taglineDesc', 'Better information for a more resilient world.')}
              </p>
            </div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* SECTION 2: WHY WEATHERWISE? 4 FEATURE CARDS */}
        {/* ==================================================================== */}
        <section id="features" className="space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2.5">
            <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">
              {t('landing.whyHeader', 'WHY WEATHERWISE?')}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('landing.whyTitle', 'Everything You Need, All in One Place')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              {t('landing.whySubtitle', 'From daily forecasts to disaster alerts and AI assistance, WeatherWise helps you stay prepared and make informed decisions.')}
            </p>
          </div>

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Accurate Weather Forecasts */}
            <div className="rounded-2xl p-6 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center">
                  <Sun className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t('landing.feature1Title', 'Accurate Weather Forecasts')}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t('landing.feature1Desc', 'Get real-time and hourly weather updates for any location worldwide.')}
                </p>
              </div>
            </div>

            {/* Card 2: Disaster News & Alerts */}
            <div className="rounded-2xl p-6 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t('landing.feature2Title', 'Disaster News & Alerts')}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t('landing.feature2Desc', 'Stay informed about earthquakes, cyclones, floods, wildfires and more.')}
                </p>
              </div>
            </div>

            {/* Card 3: AI Weather Assistant */}
            <div className="rounded-2xl p-6 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t('landing.feature3Title', 'AI Weather Assistant')}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t('landing.feature3Desc', 'Ask questions, get personalized insights and safety recommendations.')}
                </p>
              </div>
            </div>

            {/* Card 4: Save Your Locations */}
            <div className="rounded-2xl p-6 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t('landing.feature4Title', 'Save Your Locations')}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t('landing.feature4Desc', 'Track multiple locations and get instant updates for the places that matter.')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* SECTION 3: PRODUCT UI PREVIEW & COMPREHENSIVE METEOROLOGY */}
        {/* ==================================================================== */}
        <section className="rounded-3xl bg-blue-50/70 dark:bg-slate-900/60 backdrop-blur-md p-6 sm:p-10 border border-blue-100/80 dark:border-slate-800 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* Left 7-Col: Dashboard Window Mockup */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden">
                <div className="flex flex-col sm:flex-row min-h-[380px]">
                  
                  {/* Mini Sidebar */}
                  <div className="sm:w-44 bg-slate-50/90 dark:bg-slate-950/90 p-3.5 border-b sm:border-b-0 sm:border-r border-slate-200/80 dark:border-slate-800 flex flex-col justify-between shrink-0">
                    <div className="space-y-3">
                      {/* Logo */}
                      <div className="flex items-center gap-2 px-1.5 py-1">
                        <Cloud className="w-4 h-4 text-blue-600 fill-blue-600" />
                        <span className="text-xs font-black text-slate-900 dark:text-white">WeatherWise</span>
                      </div>

                      {/* Mini Nav Items */}
                      <div className="space-y-1 text-[11px] font-semibold">
                        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-blue-600 text-white font-bold shadow-xs">
                          <LayoutDashboard className="w-3.5 h-3.5" />
                          <span>{t('nav.dashboard', 'Dashboard')}</span>
                        </div>
                        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                          <CloudSun className="w-3.5 h-3.5" />
                          <span>{t('nav.weather', 'Weather')}</span>
                        </div>
                        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>{t('nav.alerts', 'Disaster News')}</span>
                        </div>
                        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                          <Bot className="w-3.5 h-3.5" />
                          <span>{t('nav.chat', 'AI Assistant')}</span>
                        </div>
                        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                          <Bookmark className="w-3.5 h-3.5" />
                          <span>{t('nav.favorites', 'Saved Locations')}</span>
                        </div>
                        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                          <Settings className="w-3.5 h-3.5" />
                          <span>{t('nav.settings', 'Settings')}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main Content Area */}
                  <div className="flex-1 p-4 sm:p-5 space-y-3.5 bg-white dark:bg-slate-900">
                    {/* Top Search Bar */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        readOnly
                        placeholder="Search for a city or location..."
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 placeholder:text-slate-400 focus:outline-hidden"
                      />
                    </div>

                    {/* Current Weather Card */}
                    <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                          <MapPin className="w-3.5 h-3.5 text-blue-600" />
                          <span>Bengaluru, India</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">Partly Cloudy</div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white pt-1">28°C</div>
                      </div>

                      <div className="text-right space-y-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                        <div className="flex items-center justify-end gap-1.5">
                          <Droplets className="w-3 h-3 text-blue-500" />
                          <span>Humidity 62%</span>
                        </div>
                        <div className="flex items-center justify-end gap-1.5">
                          <Wind className="w-3 h-3 text-blue-500" />
                          <span>Wind 12 km/h</span>
                        </div>
                        <div className="flex items-center justify-end gap-1.5">
                          <Gauge className="w-3 h-3 text-blue-500" />
                          <span>Pressure 1012 hPa</span>
                        </div>
                        <div className="flex items-center justify-end gap-1.5">
                          <Thermometer className="w-3 h-3 text-blue-500" />
                          <span>Feels like 30°C</span>
                        </div>
                      </div>
                    </div>

                    {/* Split Bottom Subcards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Disaster Alerts Card */}
                      <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 space-y-2 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                            <span>Disaster Alerts</span>
                          </div>
                          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-xs font-bold">
                            <span>2</span> Active Alerts
                          </div>
                        </div>
                        <Link href="/alerts" className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 self-end">
                          <span>View Details</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </Link>
                      </div>

                      {/* Ask Weather AI Card */}
                      <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 space-y-2 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                            <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                            <span>Ask Weather AI</span>
                          </div>
                          <form onSubmit={handleAskAiSubmit} className="relative mt-2">
                            <input
                              type="text"
                              value={mockQuestion}
                              onChange={(e) => setMockQuestion(e.target.value)}
                              placeholder="Type your question..."
                              className="w-full pl-2.5 pr-7 py-1 text-[11px] rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden"
                            />
                            <button
                              type="submit"
                              className="absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 cursor-pointer"
                            >
                              <Send className="w-2.5 h-2.5" />
                            </button>
                          </form>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                          Get instant answers about weather, disasters, and safety tips.
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>

            {/* Right 5-Col: Feature Highlights */}
            <div className="lg:col-span-5 space-y-6 text-left">
              <div className="space-y-2.5">
                <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">
                  {t('landing.companionHeader', 'YOUR WEATHER COMPANION')}
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                  {t('landing.companionTitle', 'Comprehensive Meteorological Intelligence')}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                  {t('landing.companionSubtitle', 'Real-time data. Smarter insights. A safer tomorrow.')}
                </p>
              </div>

              {/* 3 Detailed Items */}
              <div className="space-y-4 pt-1">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {t('landing.liveTrackingTitle', 'Live Weather Tracking')}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      {t('landing.liveTrackingDesc', 'Accurate and up-to-date weather information.')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {t('landing.disasterEarlyTitle', 'Disaster Early Warning')}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      {t('landing.disasterEarlyDesc', 'Instant alerts for natural disasters.')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {t('landing.conversationalAiTitle', 'Conversational AI Meteorologist')}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      {t('landing.conversationalAiDesc', 'Get answers, safety tips, and personalized insights.')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ==================================================================== */}
        {/* SECTION 4: STATS BAR */}
        {/* ==================================================================== */}
        <section className="rounded-2xl p-6 sm:p-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1.5 flex flex-col items-center">
              <Globe className="w-6 h-6 text-blue-600 mb-1" />
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">200+</div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Locations Worldwide</div>
            </div>

            <div className="space-y-1.5 flex flex-col items-center">
              <Users className="w-6 h-6 text-blue-600 mb-1" />
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">1M+</div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Users Stay Informed</div>
            </div>

            <div className="space-y-1.5 flex flex-col items-center">
              <ShieldCheck className="w-6 h-6 text-emerald-500 mb-1" />
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">99.9%</div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Reliable Data Sources</div>
            </div>

            <div className="space-y-1.5 flex flex-col items-center">
              <Leaf className="w-6 h-6 text-emerald-500 mb-1" />
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">A Safer</div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Greener Tomorrow</div>
            </div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* SECTION 5: BOTTOM CALL TO ACTION & QUOTE */}
        {/* ==================================================================== */}
        <section className="py-8 sm:py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 max-w-5xl mx-auto">
            {/* Left/Center CTA */}
            <div className="space-y-3 text-center md:text-left">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
                Join a more informed and resilient world.
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {t('landing.heroTitle1', 'Stay Informed.')} {t('landing.heroTitle2', 'Stay Safer.')}
              </h2>
              <div className="pt-2">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <span>{t('landing.getStarted', 'Get Started')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Quote */}
            <div className="max-w-xs space-y-2 text-center md:text-right border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-4 md:pt-0 md:pl-6">
              <p className="text-sm font-semibold italic text-slate-700 dark:text-slate-300">
                “Better information today for a safer tomorrow.”
              </p>
              <div className="w-8 h-0.5 bg-blue-600 rounded-full mx-auto md:ml-auto md:mr-0" />
            </div>
          </div>
        </section>

      </main>

      {/* ==================================================================== */}
      {/* FOOTER */}
      {/* ==================================================================== */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 pb-6 sm:pb-8 mt-10">
        <footer id="contact" className="w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs px-5 sm:px-7 py-3.5 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <Cloud className="w-4 h-4 fill-white stroke-none" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                Weather<span className="text-blue-600">Wise</span>
              </span>
              <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 leading-none">
                Stay Informed. Stay Safer.
              </span>
            </div>
          </Link>

          {/* Copyright & Socials */}
          <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-xs">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 transition-all">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 transition-all">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 transition-all">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
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

