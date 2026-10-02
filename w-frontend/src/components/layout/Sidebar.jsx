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
  ChevronsLeft,
  X,
  Menu
} from 'lucide-react';

import { useApp } from '../../Hooks/useAppContext';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    t,
    isAuthenticated,
    logout,
    mobileMenuOpen,
    setMobileMenuOpen,
    sidebarCollapsed,
    toggleSidebarCollapsed
  } = useApp();

  const navItems = [
    { key: 'nav.dashboard', defaultName: 'Dashboard', href: '/dashboard', icon: Home, matchPaths: ['/dashboard', '/'] },
    { key: 'nav.weather', defaultName: 'Weather', href: '/search', icon: Cloud, matchPaths: ['/search'] },
    { key: 'nav.map', defaultName: 'Maps', href: '/map', icon: Compass, matchPaths: ['/map'] },
    { key: 'nav.alerts', defaultName: 'Disaster News', href: '/alerts', icon: Newspaper, matchPaths: ['/alerts'] },
    { key: 'nav.chat', defaultName: 'AI Assistant', href: '/chat', icon: Bot, matchPaths: ['/chat'] },
    { key: 'nav.favorites', defaultName: 'Saved Locations', href: '/favorites', icon: MapPin, matchPaths: ['/favorites'] },
    { key: 'nav.settings', defaultName: 'Settings', href: '/settings', icon: Settings, matchPaths: ['/settings'] }
  ];

  const handleLogout = async () => {
    if (setMobileMenuOpen) setMobileMenuOpen(false);
    if (logout) await logout();
    router.push('/login');
  };

  const closeMobile = () => {
    if (setMobileMenuOpen) setMobileMenuOpen(false);
  };

  const isItemActive = (item) => {
    if (item.matchPaths) {
      return item.matchPaths.some((p) => (p === '/' ? pathname === '/' : pathname === p || pathname?.startsWith(p + '/')));
    }
    return pathname === item.href;
  };

  return (
    <>
      {/* ------------------------------------------------------------- */}
      {/* 1. DESKTOP SIDEBAR (Visible on lg screens only)                 */}
      {/* Supports both Expanded (w-64) and Collapsed (w-20) states       */}
      {/* ------------------------------------------------------------- */}
      <aside
        className={`hidden lg:flex ${sidebarCollapsed ? 'w-20 p-3' : 'w-64 p-4'
          } h-[calc(100vh-2rem)] sticky top-4 my-4 ml-4 z-30 shrink-0 select-none bg-white rounded-2xl border border-slate-200/80 shadow-sm shadow-slate-200/50 flex-col justify-between transition-all duration-300 ease-in-out`}
      >
        <div>
          {/* Header */}
          {sidebarCollapsed ? (
            /* Collapsed Header: Centered blue cloud logo */
            <div className="flex justify-center items-center pt-1 pb-2">
              <button
                type="button"
                onClick={toggleSidebarCollapsed}
                title="Expand sidebar"
                aria-label="Expand sidebar"
                className="w-11 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 transition-all hover:scale-105 cursor-pointer relative group"
              >
                <Cloud className="w-5 h-5 fill-white stroke-none" />
                <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  Expand sidebar
                </span>
              </button>
            </div>
          ) : (
            /* Expanded Header: Logo + App Name + Collapse Button */
            <div className="flex items-center justify-between px-1 pt-1 pb-2">
              <Link href="" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
                  <Cloud className="w-5 h-5 fill-white stroke-none" />
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900 leading-none">
                  Weather<span className="text-blue-600">Wise</span>
                </span>
              </Link>

              <button
                type="button"
                onClick={toggleSidebarCollapsed}
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
                className="w-8 h-8 rounded-lg bg-slate-100/70 hover:bg-slate-200/70 border border-slate-200/60 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Navigation Items */}
          <nav className={`mt-6 ${sidebarCollapsed ? 'space-y-2' : 'space-y-1.5'}`}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isItemActive(item);
              const label = t ? t(item.key, item.defaultName) : item.defaultName;

              if (sidebarCollapsed) {
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    aria-label={label}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center mx-auto transition-all relative group cursor-pointer ${isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/70'
                      }`}
                  >
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-600 transition-colors'}`} />
                    <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                      {label}
                    </span>
                  </Link>
                );
              }

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer ${isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-500/20'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/70'
                    }`}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-600'}`} />
                  <span className="truncate">{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Divider + Logout / Login */}
        <div className="pt-3 border-t border-slate-200/70">
          {sidebarCollapsed ? (
            isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                title={t ? t('nav.logout', 'Logout') : 'Logout'}
                aria-label={t ? t('nav.logout', 'Logout') : 'Logout'}
                className="w-11 h-11 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50/80 flex items-center justify-center mx-auto transition-all relative group cursor-pointer"
              >
                <LogOut className="w-5 h-5 shrink-0" />
                <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  {t ? t('nav.logout', 'Logout') : 'Logout'}
                </span>
              </button>
            ) : (
              <Link
                href="/login"
                title={t ? t('nav.signIn', 'Login') : 'Login'}
                aria-label={t ? t('nav.signIn', 'Login') : 'Login'}
                className="w-11 h-11 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50/80 flex items-center justify-center mx-auto transition-all relative group cursor-pointer"
              >
                <LogIn className="w-5 h-5 shrink-0" />
                <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  {t ? t('nav.signIn', 'Login') : 'Login'}
                </span>
              </Link>
            )
          ) : (
            isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50/80 transition-colors cursor-pointer"
              >
                <LogOut className="w-5 h-5 shrink-0" />
                <span className="truncate">{t ? t('nav.logout', 'Logout') : 'Logout'}</span>
              </button>
            ) : (
              <Link
                href="/login"
                className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50/80 transition-colors cursor-pointer"
              >
                <LogIn className="w-5 h-5 shrink-0" />
                <span className="truncate">{t ? t('nav.signIn', 'Login') : 'Login'}</span>
              </Link>
            )
          )}
        </div>
      </aside>

      {/* ------------------------------------------------------------- */}
      {/* 2. MOBILE DRAWER OVERLAY (Visible on mobile when open)          */}
      {/* Compact drawer with smooth slide-in & slide-out transitions    */}
      {/* ------------------------------------------------------------- */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${
          mobileMenuOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'
        }`}
      >
        {/* Backdrop Overlay */}
        <div
          onClick={closeMobile}
          className={`fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300 ease-in-out ${
            mobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Drawer content sliding in from left (compact w-56 sm:w-60 max-w-[70vw]) */}
        <div
          className={`fixed top-0 left-0 bottom-0 w-56 sm:w-60 max-w-[70vw] bg-white z-50 p-3.5 sm:p-4 flex flex-col justify-between shadow-2xl border-r border-slate-200/80 transition-transform duration-300 ease-out transform ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div>
            {/* Drawer Header with Close Button */}
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <Link href="/" onClick={closeMobile} className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
                  <Cloud className="w-4 h-4 fill-white stroke-none" />
                </div>
                <span className="text-base font-bold tracking-tight text-slate-900 leading-none">
                  Weather<span className="text-blue-600">Wise</span>
                </span>
              </Link>

              <button
                type="button"
                onClick={closeMobile}
                aria-label="Close menu"
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Drawer Navigation Items */}
            <nav className="mt-3.5 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = isItemActive(item);
                const label = t ? t(item.key, item.defaultName) : item.defaultName;

                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={closeMobile}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium text-xs sm:text-sm transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/70'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span className="truncate">{label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Mobile Drawer Bottom Section: Logout / Login */}
          <div className="pt-2.5 border-t border-slate-200/70">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50/80 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span className="truncate">{t ? t('nav.logout', 'Logout') : 'Logout'}</span>
              </button>
            ) : (
              <Link
                href="/login"
                onClick={closeMobile}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50/80 transition-colors cursor-pointer"
              >
                <LogIn className="w-4 h-4 shrink-0" />
                <span className="truncate">{t ? t('nav.signIn', 'Login') : 'Login'}</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. MOBILE COMPACT BOTTOM NAVIGATION BAR (Visible on < lg)      */}
      {/* Responsive mobile companion using light-blue/white styling     */}
      {/* ------------------------------------------------------------- */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 py-1.5 px-3 flex items-center justify-around shadow-lg">
        {[
          { key: 'dashboard', label: t ? t('nav.dashboard', 'Home') : 'Home', href: '/dashboard', icon: Home, matchPaths: ['/dashboard', '/'] },
          { key: 'weather', label: t ? t('nav.weather', 'Weather') : 'Weather', href: '/search', icon: Cloud, matchPaths: ['/search'] },
          { key: 'map', label: t ? t('nav.map', 'Maps') : 'Maps', href: '/map', icon: Compass, matchPaths: ['/map'] },
          { key: 'alerts', label: t ? t('nav.alerts', 'Alerts') : 'Alerts', href: '/alerts', icon: Newspaper, matchPaths: ['/alerts'] },
          { key: 'chat', label: t ? t('nav.chat', 'AI Chat') : 'AI Chat', href: '/chat', icon: Bot, matchPaths: ['/chat'] }
        ].map((item) => {
          const Icon = item.icon;
          const isActive = isItemActive(item);
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-0.5 px-2 rounded-lg transition-all ${isActive
                ? 'text-blue-600 font-bold'
                : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'scale-110 text-blue-600' : 'text-slate-400'} transition-transform`} />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}

        <button
          type="button"
          onClick={() => setMobileMenuOpen && setMobileMenuOpen(true)}
          className="flex flex-col items-center gap-0.5 py-0.5 px-2 rounded-lg text-slate-500 hover:text-slate-700 transition-all cursor-pointer"
        >
          <Menu className="w-4 h-4 text-slate-400" />
          <span className="text-[10px] tracking-tight">{t ? t('nav.more', 'More') : 'More'}</span>
        </button>
      </nav>
    </>
  );
}
