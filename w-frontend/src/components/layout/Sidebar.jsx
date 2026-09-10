'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Cloud, 
  Home,
  Compass,
  Newspaper, 
  Bot, 
  MapPin, 
  Settings
} from 'lucide-react';

import { useApp } from '../../Hooks/useAppContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { t } = useApp();

  const navItems = [
    { key: 'nav.dashboard', defaultName: 'Dashboard', href: '/dashboard', icon: Home },
    { key: 'nav.weather', defaultName: 'Weather', href: '/search', icon: Cloud },
    { key: 'nav.map', defaultName: 'Map', href: '/map', icon: Compass },
    { key: 'nav.alerts', defaultName: 'Disaster News', href: '/alerts', icon: Newspaper },
    { key: 'nav.chat', defaultName: 'AI Assistant', href: '/chat', icon: Bot },
    { key: 'nav.favorites', defaultName: 'Saved Locations', href: '/favorites', icon: MapPin },
    { key: 'nav.settings', defaultName: 'Settings', href: '/settings', icon: Settings }
  ];

  return (
    <aside className="w-64 h-[calc(100vh-2rem)] sticky top-4 my-4 ml-4 z-30 shrink-0 select-none bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl rounded-3xl border border-white/80 dark:border-slate-800/80 shadow-xl shadow-slate-900/5 flex flex-col justify-between p-3.5 transition-all duration-300">
      {/* Brand Header */}
      <div>
        <Link href="/" className="px-3 py-3 flex items-center gap-3 group rounded-2xl hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
            <Cloud className="w-5 h-5 fill-white stroke-none" />
          </div>
          <div>
            <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white block leading-tight">
              WeatherWise
            </span>
          </div>
        </Link>

        {/* Navigation links */}
        <nav className="mt-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href === '/dashboard' && pathname === '/');
            const label = t ? t(item.key, item.defaultName) : item.defaultName;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/25'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                <span className="truncate">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
