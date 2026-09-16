'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Settings as SettingsIcon,
  Bell,
  Globe,
  Trash2,
  ChevronRight,
  ChevronDown,
  X,
  CheckCircle2,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import Sidebar from '../../src/components/layout/Sidebar';
import TopNavbar from '../../src/components/layout/TopNavbar';
import { useApp } from '../../src/Hooks/useAppContext';
import { api } from '../../src/lib/api';
import ProtectedRoute from '../../src/components/auth/ProtectedRoute';

export default function SettingsPage() {
  const router = useRouter();
  const {
    logout,
    defaultLocation,
    setDefaultLocation,
    autoDetectLocation,
    setAutoDetectLocation,
    notificationSettings,
    setNotificationSettings,
    language,
    setLanguage,
    selectCity,
    t
  } = useApp();

  // Notification Toast State
  const [toastMessage, setToastMessage] = useState('');

  // Default Location Input & Search Autocomplete
  const [prevDefaultLocation, setPrevDefaultLocation] = useState(defaultLocation);
  const [locationInput, setLocationInput] = useState(defaultLocation || '');
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  // Sync locationInput when defaultLocation changes during render
  if (defaultLocation !== prevDefaultLocation) {
    setPrevDefaultLocation(defaultLocation);
    if (defaultLocation !== null && defaultLocation !== undefined) {
      setLocationInput(defaultLocation || '');
    }
  }

  // Modals state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 2500);
  };

  // Handle Location Search
  const handleLocationChange = async (e) => {
    const val = e.target.value;
    setLocationInput(val);
    if (!val || val.trim().length < 2) {
      setLocationSuggestions([]);
      setShowLocationDropdown(false);
      return;
    }

    setIsSearchingLocation(true);
    setShowLocationDropdown(true);
    try {
      const results = await api.searchLocations(val);
      setLocationSuggestions(results || []);
    } catch {
      setLocationSuggestions([]);
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const handleSelectLocation = (loc) => {
    const fullLoc = loc.region ? `${loc.name}, ${loc.region}` : `${loc.name}, ${loc.country}`;
    setLocationInput(fullLoc);
    setDefaultLocation(fullLoc);
    if (selectCity) selectCity(loc.name);
    setShowLocationDropdown(false);
    showToast(`Default location set to ${loc.name}`);
  };

  const handleClearLocation = () => {
    setLocationInput('');
    setDefaultLocation('');
    setShowLocationDropdown(false);
  };

  // Handle Auto Detect Toggle
  const handleToggleAutoDetect = () => {
    const nextVal = !autoDetectLocation;
    setAutoDetectLocation(nextVal);
    if (nextVal && typeof navigator !== 'undefined' && navigator.geolocation) {
      showToast('Detecting your GPS location...');
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const live = await api.getWeather('Current', latitude, longitude);
            if (live?.city) {
              const fullLoc = `${live.city}, ${live.region || live.country}`;
              setLocationInput(fullLoc);
              setDefaultLocation(fullLoc);
              if (selectCity) selectCity(live.city);
              showToast(`Auto-detected: ${live.city}`);
            }
          } catch {
            showToast('Unable to resolve GPS location');
          }
        },
        () => {
          showToast('Location access denied by browser');
        }
      );
    } else {
      showToast(nextVal ? 'Auto-detect location enabled' : 'Auto-detect location disabled');
    }
  };

  // Notification toggle helper
  const handleToggleNotification = (key) => {
    const next = { ...notificationSettings, [key]: !notificationSettings[key] };
    setNotificationSettings(next);
    showToast('Notification preference updated');
  };

  // Delete Account with real API & MongoDB integration
  const handleDeleteAccount = async () => {
    if (deleteConfirmText.toLowerCase() !== 'delete') {
      showToast('Please type DELETE to confirm');
      return;
    }
    setIsDeleting(true);
    try {
      await api.deleteAccount();
      await logout();
      setIsDeleteModalOpen(false);
      showToast('Account data cleared successfully');
      router.push('/login');
    } catch (err) {
      showToast(err.message || 'Failed to delete account');
      setIsDeleting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-transparent flex text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
        {/* App Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <TopNavbar />

          <main className="flex-1 p-2.5 sm:p-4 lg:p-5 max-w-7xl w-full mx-auto space-y-3 sm:space-y-4 pb-20 lg:pb-8">

            {/* Top Settings Header Card (Compact) */}
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-2.5 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 transition-colors">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 flex items-center justify-center text-white shadow-sm shadow-slate-900/20 shrink-0">
                  <SettingsIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white" />
                </div>
                <div>
                  <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                    {t('settings.title', 'Settings')}
                  </h1>
                </div>
              </div>
            </div>

            {/* Toast Notification */}
            {toastMessage && (
              <div className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-3.5 py-2.5 rounded-xl shadow-xl border border-slate-700/50 dark:border-slate-200 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
                <span className="text-xs font-semibold">{toastMessage}</span>
              </div>
            )}

            {/* Location Preferences */}
            <div className="bg-white dark:bg-slate-900/90 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-xs h-fit">
              {/* Header */}
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700/50">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{t('settings.locationPrefs', 'Location Preferences')}</h2>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                    {t('settings.locationPrefsDesc', 'Set your default location and manage saved places.')}
                  </p>
                </div>
              </div>

              {/* Default Location Input */}
              <div className="mt-5 space-y-1.5 relative">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t('settings.defaultLocation', 'Default Location')}
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-slate-400 pointer-events-none">
                    {isSearchingLocation ? (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    ) : (
                      <MapPin className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    )}
                  </div>
                  <input
                    type="text"
                    value={locationInput}
                    onChange={handleLocationChange}
                    onFocus={() => {
                      if (locationSuggestions.length > 0) setShowLocationDropdown(true);
                    }}
                    placeholder="Type a city name..."
                    className="w-full pl-9 pr-9 py-2 bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/80 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-hidden focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all"
                  />
                  {locationInput && (
                    <button
                      onClick={handleClearLocation}
                      className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                      title="Clear location"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Autocomplete Dropdown */}
                {showLocationDropdown && locationSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
                    {locationSuggestions.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectLocation(item)}
                        className="w-full text-left px-3.5 py-2 hover:bg-blue-50 dark:hover:bg-slate-700/50 flex items-center justify-between text-xs transition-colors cursor-pointer"
                      >
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{item.name}</span>
                        <span className="text-[11px] text-slate-400">{item.region || item.country}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Auto-detect Location Toggle */}
              <div className="mt-5 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                    {t('settings.autoDetectLocation', 'Auto-detect Location')}
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 block leading-tight">
                    {t('settings.autoDetectDesc', 'Allow the app to detect your location for real-time updates.')}
                  </span>
                </div>

                {/* Toggle Switch */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={autoDetectLocation}
                  onClick={handleToggleAutoDetect}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 cursor-pointer ${autoDetectLocation ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${autoDetectLocation ? 'translate-x-5' : 'translate-x-0'
                      }`}
                  />
                </button>
              </div>

              {/* Manage Saved Locations Link */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <Link
                  href="/favorites"
                  className="flex items-center justify-between group p-1.5 -mx-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors block">
                      {t('settings.manageSavedLocations', 'Manage Saved Locations')}
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 block">
                      {t('settings.manageSavedDesc', 'View, edit or remove your saved locations.')}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              </div>
            </div>

            {/* Settings Grid - Row 2: Notifications & Language */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 items-start">

              {/* Card 3: Notifications (Compact) */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900/90 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-xs h-fit">
                {/* Header */}
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700/50">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{t('settings.notifications', 'Notifications')}</h2>
                    <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                      {t('settings.notificationsDesc', 'Choose what updates you want to receive.')}
                    </p>
                  </div>
                </div>

                {/* Notification Toggle Rows in 2-column subgrid */}
                <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Severe Weather Alerts */}
                  <div className="flex items-center justify-between p-2.5 rounded-lg sm:rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <div className="min-w-0 pr-2">
                      <span className="text-[11px] sm:text-xs font-semibold text-slate-800 dark:text-slate-200 block truncate">
                        {t('settings.severeAlerts', 'Severe Weather Alerts')}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate">
                        {t('settings.criticalAlertsDesc', 'Critical hazard warnings')}
                      </span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={notificationSettings.severeWeatherAlerts}
                      onClick={() => handleToggleNotification('severeWeatherAlerts')}
                      className={`relative inline-flex h-4.5 w-8.5 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${notificationSettings.severeWeatherAlerts ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
                        }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${notificationSettings.severeWeatherAlerts ? 'translate-x-4' : 'translate-x-0'
                          }`}
                      />
                    </button>
                  </div>

                  {/* Daily Forecast */}
                  <div className="flex items-center justify-between p-2.5 rounded-lg sm:rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <div className="min-w-0 pr-2">
                      <span className="text-[11px] sm:text-xs font-semibold text-slate-800 dark:text-slate-200 block truncate">
                        {t('settings.dailyForecast', 'Daily Morning Forecast')}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate">
                        {t('settings.morningSummaryDesc', 'Morning weather summary')}
                      </span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={notificationSettings.dailyForecast}
                      onClick={() => handleToggleNotification('dailyForecast')}
                      className={`relative inline-flex h-4.5 w-8.5 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${notificationSettings.dailyForecast ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
                        }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${notificationSettings.dailyForecast ? 'translate-x-4' : 'translate-x-0'
                          }`}
                      />
                    </button>
                  </div>

                  {/* Rain Warning */}
                  <div className="flex items-center justify-between p-2.5 rounded-lg sm:rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <div className="min-w-0 pr-2">
                      <span className="text-[11px] sm:text-xs font-semibold text-slate-800 dark:text-slate-200 block truncate">
                        {t('settings.rainWarnings', 'Precipitation Warnings')}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate">
                        {t('settings.rainWarningsDesc', 'Upcoming rain alerts')}
                      </span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={notificationSettings.rainWarnings}
                      onClick={() => handleToggleNotification('rainWarnings')}
                      className={`relative inline-flex h-4.5 w-8.5 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${notificationSettings.rainWarnings ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
                        }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${notificationSettings.rainWarnings ? 'translate-x-4' : 'translate-x-0'
                          }`}
                      />
                    </button>
                  </div>

                  {/* Air Quality Index Alert */}
                  <div className="flex items-center justify-between p-2.5 rounded-lg sm:rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <div className="min-w-0 pr-2">
                      <span className="text-[11px] sm:text-xs font-semibold text-slate-800 dark:text-slate-200 block truncate">
                        {t('settings.aqiAlerts', 'Air Quality Alerts')}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate">
                        {t('settings.aqiAlertsDesc', 'Poor AQI notifications')}
                      </span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={notificationSettings.airQualityAlerts}
                      onClick={() => handleToggleNotification('airQualityAlerts')}
                      className={`relative inline-flex h-4.5 w-8.5 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${notificationSettings.airQualityAlerts ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
                        }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${notificationSettings.airQualityAlerts ? 'translate-x-4' : 'translate-x-0'
                          }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Sub-channel Preferences: Email & Push */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-[11px] sm:text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {t('settings.deliveryChannels', 'Delivery Channels')}
                  </span>

                  <div className="flex items-center gap-4">
                    {/* Push Notifications Toggle */}
                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={notificationSettings.pushNotifications}
                        onChange={() => handleToggleNotification('pushNotifications')}
                        className="rounded-sm border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 w-3 h-3"
                      />
                      <span className="font-medium text-slate-600 dark:text-slate-400">{t('settings.push', 'Push')}</span>
                    </label>

                    {/* Email Notifications Toggle */}
                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailNotifications}
                        onChange={() => handleToggleNotification('emailNotifications')}
                        className="rounded-sm border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 w-3 h-3"
                      />
                      <span className="font-medium text-slate-600 dark:text-slate-400">{t('settings.emailNotif', 'Email')}</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Card 4: Language (Compact) */}
              <div className="bg-white dark:bg-slate-900/90 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-xs h-fit">
                {/* Header */}
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700/50">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{t('settings.language', 'Language')}</h2>
                    <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                      {t('settings.languageDesc', 'Select your preferred language.')}
                    </p>
                  </div>
                </div>

                {/* Language Select Dropdown */}
                <div className="mt-3 relative">
                  <select
                    value={language}
                    onChange={(e) => {
                      setLanguage(e.target.value);
                      showToast(`Language set to ${e.target.value}`);
                    }}
                    className="w-full appearance-none pl-3 pr-7 py-1.5 bg-slate-50/90 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-blue-500 cursor-pointer"
                  >
                    <option value="English">English</option>
                    <option value="Hindi (हिन्दी)">Hindi (हिन्दी)</option>
                    <option value="Kannada (ಕನ್ನಡ)">Kannada (ಕನ್ನಡ)</option>
                    <option value="Tamil (தமிழ்)">Tamil (தமிழ்)</option>
                    <option value="Korean (한국어)">Korean (한국어)</option>
                    <option value="Spanish (Español)">Spanish (Español)</option>
                    <option value="French (Français)">French (Français)</option>
                    <option value="German (Deutsch)">German (Deutsch)</option>
                    <option value="Japanese (日本語)">Japanese (日本語)</option>
                  </select>
                  <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Card 5: Delete Account (Full-width banner) */}
            <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/50 shrink-0">
                  <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{t('settings.deleteAccount', 'Delete Account')}</h3>
                  <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500">
                    {t('settings.deleteAccountDesc', 'Permanently delete your account and all associated data.')}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setDeleteConfirmText('');
                  setIsDeleteModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/80 hover:bg-rose-100/80 dark:hover:bg-rose-900/40 hover:border-rose-300 transition-all cursor-pointer shrink-0 shadow-2xs"
              >
                {t('settings.deleteAccount', 'Delete Account')}
              </button>
            </div>

          </main>
        </div>

        {/* ========================================================= */}
        {/* MODAL: DELETE ACCOUNT CONFIRMATION */}
        {/* ========================================================= */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-rose-200 dark:border-rose-900/60 space-y-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('settings.deleteAccount', 'Delete Account')}?</h3>
                  <p className="text-xs text-slate-500">{t('settings.deleteWarning', 'This action is permanent and cannot be undone.')}</p>
                </div>
              </div>

              <div className="p-3 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl text-xs text-rose-700 dark:text-rose-300 space-y-1 border border-rose-100 dark:border-rose-900/30">
                <p className="font-semibold">{t('settings.whatWillBeRemoved', 'What will be removed:')}</p>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-rose-600 dark:text-rose-400">
                  <li>{t('settings.removedItem1', 'All saved and favorite location bookmarks')}</li>
                  <li>{t('settings.removedItem2', 'Custom alert and notification preferences')}</li>
                  <li>{t('settings.removedItem3', 'AI Chat consultation histories & cached data')}</li>
                </ul>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  {t('settings.typeDeleteConfirm', 'Type DELETE to confirm:')}
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white uppercase focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="button"
                  disabled={deleteConfirmText.toLowerCase() !== 'delete' || isDeleting}
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isDeleting ? t('common.deleting', 'Deleting...') : t('settings.confirmDeleteAccount', 'Permanently Delete')}</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </ProtectedRoute>
  );
}
