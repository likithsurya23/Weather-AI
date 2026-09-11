'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Cloud, 
  Home,
  Compass,
  Newspaper, 
  Bot, 
  MapPin, 
  Settings,
  LogOut,
  LogIn,
  X,
  Menu,
  Info
} from 'lucide-react';

import { useApp } from '../../Hooks/useAppContext';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t, isAuthenticated, logout, mobileMenuOpen, setMobileMenuOpen } = useApp();

  const navItems = [
    { key: 'nav.dashboard', defaultName: 'Dashboard', href: '/dashboard', icon: Home },
    { key: 'nav.weather', defaultName: 'Weather', href: '/search', icon: Cloud },
    { key: 'nav.map', defaultName: 'Map', href: '/map', icon: Compass },
    { key: 'nav.alerts', defaultName: 'Disaster News', href: '/alerts', icon: Newspaper },
    { key: 'nav.chat', defaultName: 'AI Assistant', href: '/chat', icon: Bot },
    { key: 'nav.favorites', defaultName: 'Saved Locations', href: '/favorites', icon: MapPin },
    { key: 'nav.settings', defaultName: 'Settings', href: '/settings', icon: Settings },
    { key: 'nav.about', defaultName: 'About', href: '/about', icon: Info, mobileOnly: true }
  ];

  const handleLogout = async () => {
    if (setMobileMenuOpen) setMobileMenuOpen(false);
    await logout();
    router.push('/login');
  };

  const closeMobile = () => {
    if (setMobileMenuOpen) setMobileMenuOpen(false);
  };

  const renderNavLinks = (isMobile = false) => {
    const items = navItems.filter((item) => !item.mobileOnly || isMobile);
    return (
      <nav className="mt-2 space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href === '/dashboard' && pathname === '/');
          const label = t ? t(item.key, item.defaultName) : item.defaultName;
          return (
            <Link
              key={item.key}
              href={item.href}
              onClick={closeMobile}
              className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl font-medium text-xs transition-all ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </nav>
    );
  };

  return (
    <>
      {/* ------------------------------------------------------------- */}
      {/* 1. DESKTOP SIDEBAR (Visible on lg screens only)                 */}
      {/* ------------------------------------------------------------- */}
      <aside className="hidden lg:flex w-52 xl:w-56 h-[calc(100vh-2rem)] sticky top-4 my-4 ml-4 z-30 shrink-0 select-none bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl rounded-2xl border border-white/80 dark:border-slate-800/80 shadow-md shadow-slate-900/5 flex-col justify-between p-3 transition-all duration-300">
        <div>
          <Link href="/" className="px-2.5 py-2 flex items-center gap-2 group rounded-xl hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Cloud className="w-4 h-4 fill-white stroke-none" />
            </div>
            <div>
              <span className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white block leading-tight">
                WeatherWise
              </span>
            </div>
          </Link>

          {renderNavLinks(false)}
        </div>

        {/* Bottom Auth Section */}
        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              title="Logout"
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          ) : (
            <Link
              href="/login"
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </Link>
          )}
        </div>
      </aside>

      {/* ------------------------------------------------------------- */}
      {/* 2. MOBILE DRAWER OVERLAY (Visible on mobile when open)          */}
      {/* ------------------------------------------------------------- */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            onClick={closeMobile}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
          />

          {/* Drawer content (Minimized width & padding) */}
          <div className="fixed top-0 left-0 bottom-0 w-60 max-w-[75vw] bg-white dark:bg-slate-900 z-50 p-3 flex flex-col justify-between shadow-xl border-r border-slate-200 dark:border-slate-800 animate-in slide-in-from-left duration-200">
            <div>
              {/* Drawer Header with Close Button */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <Link href="/" onClick={closeMobile} className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center text-white shadow-xs">
                    <Cloud className="w-3.5 h-3.5 fill-white stroke-none" />
                  </div>
                  <span className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white">
                    WeatherWise
                  </span>
                </Link>

                <button
                  onClick={closeMobile}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {renderNavLinks(true)}
            </div>

            {/* Drawer Bottom Auth */}
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={closeMobile}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. MOBILE COMPACT BOTTOM NAVIGATION BAR (Visible on < lg)      */}
      {/* ------------------------------------------------------------- */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 py-1 px-2 flex items-center justify-around shadow-md">
        {[
          { key: 'home', label: 'Home', href: '/dashboard', icon: Home },
          { key: 'weather', label: 'Weather', href: '/search', icon: Cloud },
          { key: 'map', label: 'Radar', href: '/map', icon: Compass },
          { key: 'alerts', label: 'Alerts', href: '/alerts', icon: Newspaper },
          { key: 'chat', label: 'AI Chat', href: '/chat', icon: Bot },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href === '/dashboard' && pathname === '/');
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-0.5 px-2 rounded-lg transition-all ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'scale-105' : ''} transition-transform`} />
              <span className="text-[9px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}

        <button
          onClick={() => setMobileMenuOpen && setMobileMenuOpen(true)}
          className="flex flex-col items-center gap-0.5 py-0.5 px-2 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-all cursor-pointer"
        >
          <Menu className="w-3.5 h-3.5" />
          <span className="text-[9px] tracking-tight">More</span>
        </button>
      </nav>
    </>
  );
}
