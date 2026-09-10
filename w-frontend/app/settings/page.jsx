'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  MapPin,
  Settings as SettingsIcon,
  Bell,
  Globe,
  Info,
  Trash2,
  ChevronRight,
  ChevronDown,
  X,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Mail,
  ShieldCheck,
  FileText,
  HelpCircle
} from 'lucide-react';
import Sidebar from '../../src/components/layout/Sidebar';
import TopNavbar from '../../src/components/layout/TopNavbar';
import { useApp } from '../../src/Hooks/useAppContext';
import { api } from '../../src/lib/api';

export default function SettingsPage() {
  const router = useRouter();
  const {
    user,
    updateUserProfile,
    defaultLocation,
    setDefaultLocation,
    autoDetectLocation,
    setAutoDetectLocation,
    temperatureUnit,
    setTemperatureUnit,
    windSpeedUnit,
    setWindSpeedUnit,
    pressureUnit,
    setPressureUnit,
    dateFormat,
    setDateFormat,
    timeFormat,
    setTimeFormat,
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
  const [locationInput, setLocationInput] = useState(defaultLocation);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  // Sync locationInput when defaultLocation changes during render
  if (defaultLocation !== prevDefaultLocation) {
    setPrevDefaultLocation(defaultLocation);
    setLocationInput(defaultLocation);
  }

  // Modals state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name,
    email: user?.email
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const [activeInfoModal, setActiveInfoModal] = useState(null); // 'privacy', 'terms', 'help'

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

  // Profile Save
  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      showToast('Name and email are required');
      return;
    }
    updateUserProfile({
      name: profileForm.name.trim(),
      email: profileForm.email.trim()
    });
    setIsEditProfileOpen(false);
    showToast('Profile information saved successfully');
  };

  // Delete Account
  const handleDeleteAccount = async () => {
    if (deleteConfirmText.toLowerCase() !== 'delete') {
      showToast('Please type DELETE to confirm');
      return;
    }
    setIsDeleting(true);
    setTimeout(() => {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      try {
        localStorage.clear();
      } catch {
        // Ignore
      }
      showToast('Account data cleared successfully');
      router.push('/');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-transparent flex text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* App Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar />

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Top Settings Header Card */}
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 flex items-center justify-center text-white shadow-md shadow-slate-900/20 shrink-0">
                <SettingsIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {t('settings.title', 'Settings')}
                </h1>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <Link href="/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {t('common.home', 'Home')}
                </Link>
                <span>/</span>
                <span className="text-slate-800 dark:text-slate-200 font-semibold">{t('settings.title', 'Settings')}</span>
              </div>
            </div>
          </div>

          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-3 rounded-2xl shadow-xl border border-slate-700/50 dark:border-slate-200 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
              <span className="text-xs font-semibold">{toastMessage}</span>
            </div>
          )}

          {/* Settings Grid - Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {/* Card 1: Account */}
            <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs h-fit">
              {/* Header */}
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700/50">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t('settings.account', 'Account')}</h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    {t('settings.accountDesc', 'Manage your account information.')}
                  </p>
                </div>
              </div>

              {/* Profile Badge with Edit Button */}
              <div className="mt-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-slate-800 text-white font-bold text-base flex items-center justify-center shrink-0 shadow-xs">
                    {user?.avatar || (user?.name ? user.name.charAt(0).toUpperCase() : 'L')}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {user?.name}
                    </h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setProfileForm({
                      name: user?.name || '',
                      email: user?.email || ''
                    });
                    setIsEditProfileOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-50/90 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all shrink-0 cursor-pointer shadow-2xs"
                >
                  {t('settings.editProfile', 'Edit Profile')}
                </button>
              </div>

              {/* Account Details Key-Value List */}
              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-600 dark:text-slate-400">{t('settings.name', 'Name')}</span>
                  <span className="font-medium text-slate-900 dark:text-white">{user?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-600 dark:text-slate-400">{t('settings.email', 'Email')}</span>
                  <span className="font-medium text-slate-900 dark:text-white">{user?.email}</span>
                </div>
              </div>
            </div>

            {/* Card 2: Location Preferences */}
            <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs h-fit">
              {/* Header */}
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700/50">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t('settings.locationPrefs', 'Location Preferences')}</h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
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
                        className="w-full text-left px-3.5 py-2 hover:bg-blue-50 dark:hover:bg-slate-700/50 flex items-center justify-between text-xs transition-colors"
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
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 cursor-pointer ${
                    autoDetectLocation ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                      autoDetectLocation ? 'translate-x-5' : 'translate-x-0'
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

            {/* Card 3: Units & Format */}
            <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs h-fit">
              {/* Header */}
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700/50">
                  <SettingsIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t('settings.unitsFormat', 'Units & Format')}</h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    {t('settings.unitsFormatDesc', 'Choose your preferred units and display format.')}
                  </p>
                </div>
              </div>

              {/* Unit Selectors */}
              <div className="mt-4 space-y-2.5 text-xs">
                {/* Temperature Unit */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{t('settings.tempUnit', 'Temperature Unit')}</span>
                  <div className="relative">
                    <select
                      value={temperatureUnit === 'fahrenheit' ? 'Fahrenheit (°F)' : 'Celsius (°C)'}
                      onChange={(e) => {
                        const val = e.target.value.includes('Fahrenheit') ? 'fahrenheit' : 'celsius';
                        setTemperatureUnit(val);
                        showToast(`Temperature unit set to ${e.target.value}`);
                      }}
                      className="appearance-none pl-3 pr-8 py-1.5 bg-slate-50/90 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-blue-500 cursor-pointer"
                    >
                      <option value="Celsius (°C)">Celsius (°C)</option>
                      <option value="Fahrenheit (°F)">Fahrenheit (°F)</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Wind Speed Unit */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{t('settings.windUnit', 'Wind Speed Unit')}</span>
                  <div className="relative">
                    <select
                      value={windSpeedUnit}
                      onChange={(e) => {
                        setWindSpeedUnit(e.target.value);
                        showToast(`Wind speed unit set to ${e.target.value}`);
                      }}
                      className="appearance-none pl-3 pr-8 py-1.5 bg-slate-50/90 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-blue-500 cursor-pointer"
                    >
                      <option value="km/h">km/h</option>
                      <option value="mph">mph</option>
                      <option value="m/s">m/s</option>
                      <option value="knots">knots</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Pressure Unit */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{t('settings.pressureUnit', 'Pressure Unit')}</span>
                  <div className="relative">
                    <select
                      value={pressureUnit}
                      onChange={(e) => {
                        setPressureUnit(e.target.value);
                        showToast(`Pressure unit set to ${e.target.value}`);
                      }}
                      className="appearance-none pl-3 pr-8 py-1.5 bg-slate-50/90 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-blue-500 cursor-pointer"
                    >
                      <option value="hPa">hPa</option>
                      <option value="mbar">mbar</option>
                      <option value="inHg">inHg</option>
                      <option value="mmHg">mmHg</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Date Format */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{t('settings.dateFormat', 'Date Format')}</span>
                  <div className="relative">
                    <select
                      value={dateFormat}
                      onChange={(e) => {
                        setDateFormat(e.target.value);
                        showToast(`Date format set to ${e.target.value}`);
                      }}
                      className="appearance-none pl-3 pr-8 py-1.5 bg-slate-50/90 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-blue-500 cursor-pointer"
                    >
                      <option value="DD MMM YYYY">DD MMM YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Time Format */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{t('settings.timeFormat', 'Time Format')}</span>
                  <div className="relative">
                    <select
                      value={timeFormat}
                      onChange={(e) => {
                        setTimeFormat(e.target.value);
                        showToast(`Time format set to ${e.target.value}`);
                      }}
                      className="appearance-none pl-3 pr-8 py-1.5 bg-slate-50/90 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-blue-500 cursor-pointer"
                    >
                      <option value="12-hour (AM/PM)">12-hour (AM/PM)</option>
                      <option value="24-hour">24-hour</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Grid - Row 2 (Notifications & stacked Language + About) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {/* Card 4: Notifications (Spans 2 cols on lg for perfect symmetry) */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900/90 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs h-fit">
              {/* Header */}
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700/50">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t('settings.notifications', 'Notifications')}</h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    {t('settings.notificationsDesc', 'Choose what updates you want to receive.')}
                  </p>
                </div>
              </div>

              {/* Notification Toggle Rows in 2-column subgrid */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Severe Weather Alerts */}
                <div className="p-3 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white block truncate">
                      {t('settings.severeAlerts', 'Severe Weather Alerts')}
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 block leading-tight">
                      {t('settings.severeAlertsDesc', 'Get notified about extreme weather conditions.')}
                    </span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notificationSettings.severeAlerts}
                    onClick={() => handleToggleNotification('severeAlerts')}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 cursor-pointer ${
                      notificationSettings.severeAlerts ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                        notificationSettings.severeAlerts ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Disaster News Updates */}
                <div className="p-3 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white block truncate">
                      {t('settings.disasterNews', 'Disaster News Updates')}
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 block leading-tight">
                      {t('settings.disasterNewsDesc', 'Receive latest news on natural disasters.')}
                    </span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notificationSettings.disasterNews}
                    onClick={() => handleToggleNotification('disasterNews')}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 cursor-pointer ${
                      notificationSettings.disasterNews ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                        notificationSettings.disasterNews ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Daily Weather Summary */}
                <div className="p-3 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white block truncate">
                      {t('settings.dailySummary', 'Daily Weather Summary')}
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 block leading-tight">
                      {t('settings.dailySummaryDesc', 'Get a daily summary for your saved locations.')}
                    </span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notificationSettings.dailySummary}
                    onClick={() => handleToggleNotification('dailySummary')}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 cursor-pointer ${
                      notificationSettings.dailySummary ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                        notificationSettings.dailySummary ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* App Updates */}
                <div className="p-3 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white block truncate">
                      {t('settings.appUpdates', 'App Updates')}
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 block leading-tight">
                      {t('settings.appUpdatesDesc', 'Receive important updates about new features.')}
                    </span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notificationSettings.appUpdates}
                    onClick={() => handleToggleNotification('appUpdates')}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 cursor-pointer ${
                      notificationSettings.appUpdates ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                        notificationSettings.appUpdates ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Column 3: Language & About stacked */}
            <div className="space-y-6">
              {/* Card 5: Language */}
              <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs h-fit">
                {/* Header */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700/50">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t('settings.language', 'Language')}</h2>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                      {t('settings.languageDesc', 'Select your preferred language.')}
                    </p>
                  </div>
                </div>

                {/* Language Select Dropdown */}
                <div className="mt-4 relative">
                  <select
                    value={language}
                    onChange={(e) => {
                      setLanguage(e.target.value);
                      showToast(`Language set to ${e.target.value}`);
                    }}
                    className="w-full appearance-none pl-3.5 pr-8 py-2 bg-slate-50/90 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-blue-500 cursor-pointer"
                  >
                    <option value="English">English</option>
                    <option value="Hindi (हिन्दी)">Hindi (हिन्दी)</option>
                    <option value="Kannada (ಕನ್ನಡ)">Kannada (ಕನ್ನಡ)</option>
                    <option value="Spanish (Español)">Spanish (Español)</option>
                    <option value="French (Français)">French (Français)</option>
                    <option value="German (Deutsch)">German (Deutsch)</option>
                    <option value="Japanese (日本語)">Japanese (日本語)</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Card 6: About */}
              <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs h-fit">
                {/* Header */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700/50">
                    <Info className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t('settings.about', 'About')}</h2>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                      {t('settings.aboutDesc', 'App information and support.')}
                    </p>
                  </div>
                </div>

                {/* About List */}
                <div className="mt-4 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between py-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{t('settings.appVersion', 'App Version')}</span>
                    <span className="font-medium text-slate-500 dark:text-slate-400">v1.0.0</span>
                  </div>

                  <button
                    onClick={() => setActiveInfoModal('privacy')}
                    className="w-full flex items-center justify-between py-1 hover:text-blue-600 dark:hover:text-blue-400 text-slate-700 dark:text-slate-300 group cursor-pointer transition-colors"
                  >
                    <span className="font-semibold">{t('settings.privacyPolicy', 'Privacy Policy')}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </button>

                  <button
                    onClick={() => setActiveInfoModal('terms')}
                    className="w-full flex items-center justify-between py-1 hover:text-blue-600 dark:hover:text-blue-400 text-slate-700 dark:text-slate-300 group cursor-pointer transition-colors"
                  >
                    <span className="font-semibold">{t('settings.termsOfService', 'Terms of Service')}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </button>

                  <button
                    onClick={() => setActiveInfoModal('help')}
                    className="w-full flex items-center justify-between py-1 hover:text-blue-600 dark:hover:text-blue-400 text-slate-700 dark:text-slate-300 group cursor-pointer transition-colors"
                  >
                    <span className="font-semibold">{t('settings.helpSupport', 'Help & Support')}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Card 7: Delete Account (Full-width banner) */}
          <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/50 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('settings.deleteAccount', 'Delete Account')}</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {t('settings.deleteAccountDesc', 'Permanently delete your account and all associated data.')}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setDeleteConfirmText('');
                setIsDeleteModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/80 hover:bg-rose-100/80 dark:hover:bg-rose-900/40 hover:border-rose-300 transition-all cursor-pointer shrink-0 shadow-2xs"
            >
              {t('settings.deleteAccount', 'Delete Account')}
            </button>
          </div>
        </main>
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: EDIT PROFILE MODAL */}
      {/* ========================================================= */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('settings.editProfile', 'Edit Profile')}</h3>
                  <p className="text-xs text-slate-400">Update your account credentials</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditProfileOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">{t('settings.name', 'Full Name')}</label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">{t('settings.email', 'Email Address')}</label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm cursor-pointer"
                >
                  {t('common.save', 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: DELETE ACCOUNT CONFIRMATION */}
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
                <p className="text-xs text-slate-500">This action is permanent and cannot be undone.</p>
              </div>
            </div>

            <div className="p-3 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl text-xs text-rose-700 dark:text-rose-300 space-y-1 border border-rose-100 dark:border-rose-900/30">
              <p className="font-semibold">What will be removed:</p>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-rose-600 dark:text-rose-400">
                <li>All saved and favorite location bookmarks</li>
                <li>Custom alert and notification preferences</li>
                <li>AI Chat consultation histories & cached data</li>
              </ul>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Type <span className="font-bold text-rose-600">DELETE</span> to confirm:
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
                <span>{isDeleting ? 'Deleting...' : t('settings.deleteAccount', 'Permanently Delete')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: PRIVACY / TERMS / HELP INFO MODALS */}
      {/* ========================================================= */}
      {activeInfoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600">
                  {activeInfoModal === 'privacy' && <ShieldCheck className="w-5 h-5" />}
                  {activeInfoModal === 'terms' && <FileText className="w-5 h-5" />}
                  {activeInfoModal === 'help' && <HelpCircle className="w-5 h-5" />}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white capitalize">
                  {activeInfoModal === 'privacy' && t('settings.privacyPolicy', 'Privacy Policy')}
                  {activeInfoModal === 'terms' && t('settings.termsOfService', 'Terms of Service')}
                  {activeInfoModal === 'help' && t('settings.helpSupport', 'Help & Support')}
                </h3>
              </div>
              <button
                onClick={() => setActiveInfoModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-3 max-h-64 overflow-y-auto pr-1">
              {activeInfoModal === 'privacy' && (
                <>
                  <p>
                    WeatherWise respects your personal privacy. We only use geolocation data locally to deliver real-time atmospheric telemetry and severe weather safety advisories.
                  </p>
                  <p>
                    Your saved locations and configuration settings are stored on your device and never sold or shared with third-party advertising networks.
                  </p>
                </>
              )}
              {activeInfoModal === 'terms' && (
                <>
                  <p>
                    By using WeatherWise, you acknowledge that weather telemetry and natural disaster alerts are sourced from international meteorology providers (WeatherAPI, USGS, GDELT).
                  </p>
                  <p>
                    In life-threatening emergency situations, always consult local civil defense and disaster response authorities.
                  </p>
                </>
              )}
              {activeInfoModal === 'help' && (
                <>
                  <p>
                    Have questions or need assistance with your WeatherWise dashboard?
                  </p>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1.5 font-medium text-slate-800 dark:text-slate-200">
                    <p>📧 Email: support@weatherwise.ai</p>
                    <p>🌐 Documentation: docs.weatherwise.ai</p>
                    <p>⚡ Response Time: Within 24 hours</p>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setActiveInfoModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm cursor-pointer"
              >
                {t('common.close', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
