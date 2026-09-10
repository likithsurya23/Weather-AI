'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../lib/api';
import { getTranslation } from '../lib/translations';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const isLoadedRef = useRef(false);
  const [currentCity, setCurrentCity] = useState('Bengaluru');
  const [currentLocationDetails, setCurrentLocationDetails] = useState({
    city: 'Bengaluru',
    country: 'India',
    region: 'Karnataka'
  });
  
  // Settings & Preferences state (SSR-safe initial defaults)
  const [user, setUser] = useState({
    name: 'Likith D',
    email: 'likith@example.com',
    phone: '+91 98765 43210',
    avatar: 'L'
  });
  
  const [defaultLocation, setDefaultLocation] = useState('Bengaluru, Karnataka');
  const [autoDetectLocation, setAutoDetectLocation] = useState(true);

  // Units & Formats
  const [temperatureUnit, setTemperatureUnit] = useState('celsius'); // 'celsius' or 'fahrenheit'
  const [windSpeedUnit, setWindSpeedUnit] = useState('km/h');
  const [pressureUnit, setPressureUnit] = useState('hPa');
  const [dateFormat, setDateFormat] = useState('DD MMM YYYY');
  const [timeFormat, setTimeFormat] = useState('12-hour (AM/PM)');

  // Notifications
  const [notificationSettings, setNotificationSettings] = useState({
    severeAlerts: true,
    disasterNews: true,
    dailySummary: false,
    appUpdates: true
  });

  // Appearance & Theme
  const [theme, setTheme] = useState('light'); // 'light', 'dark', 'system'
  const [accentColor, setAccentColor] = useState('#2563EB'); // default blue

  // Language
  const [language, setLanguage] = useState('English');

  // Translation helper
  const t = useCallback((key, fallback) => {
    return getTranslation(language, key, fallback);
  }, [language]);

  // Weather & favorites state
  const [favorites, setFavorites] = useState([]);
  const [weather, setWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [alerts, setAlerts] = useState([]);

  // Load preferences from localStorage after initial hydration completes
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const savedSettings = localStorage.getItem('weatherwise_settings');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          if (parsed.temperatureUnit) setTemperatureUnit(parsed.temperatureUnit);
          if (parsed.windSpeedUnit) setWindSpeedUnit(parsed.windSpeedUnit);
          if (parsed.pressureUnit) setPressureUnit(parsed.pressureUnit);
          if (parsed.dateFormat) setDateFormat(parsed.dateFormat);
          if (parsed.timeFormat) setTimeFormat(parsed.timeFormat);
          if (parsed.notificationSettings) setNotificationSettings(parsed.notificationSettings);
          if (parsed.theme) setTheme(parsed.theme);
          if (parsed.accentColor) setAccentColor(parsed.accentColor);
          if (parsed.language) setLanguage(parsed.language);
          if (parsed.defaultLocation) setDefaultLocation(parsed.defaultLocation);
          if (parsed.autoDetectLocation !== undefined) setAutoDetectLocation(parsed.autoDetectLocation);
        }

        const savedUser = localStorage.getItem('weatherwise_user_profile');
        if (savedUser) {
          const parsedU = JSON.parse(savedUser);
          if (parsedU.name) setUser(prev => ({ ...prev, ...parsedU }));
        }
      } catch {
        // Ignore
      } finally {
        isLoadedRef.current = true;
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Apply Theme & Accent Color to DOM
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    root.style.setProperty('--primary', accentColor);
  }, [theme, accentColor]);

  // Persist settings changes (only after initial load has finished)
  useEffect(() => {
    if (!isLoadedRef.current) return;
    try {
      const settings = {
        temperatureUnit,
        windSpeedUnit,
        pressureUnit,
        dateFormat,
        timeFormat,
        notificationSettings,
        theme,
        accentColor,
        language,
        defaultLocation,
        autoDetectLocation
      };
      localStorage.setItem('weatherwise_settings', JSON.stringify(settings));
    } catch {
      // Ignore
    }
  }, [
    temperatureUnit,
    windSpeedUnit,
    pressureUnit,
    dateFormat,
    timeFormat,
    notificationSettings,
    theme,
    accentColor,
    language,
    defaultLocation,
    autoDetectLocation
  ]);

  // Load initial favorites and alerts
  useEffect(() => {
    api.getFavorites().then(favs => setFavorites(favs || []));
    api.getAlerts().then(alts => setAlerts(alts || []));
    api.getUserProfile().then(p => {
      if (p) {
        setUser(prev => ({
          ...prev,
          name: p.name || prev.name,
          email: p.email || prev.email,
          avatar: p.avatar || (p.name ? p.name.charAt(0).toUpperCase() : 'L')
        }));
      }
    });
  }, []);

  // Fetch weather data whenever currentCity changes
  useEffect(() => {
    let isCancelled = false;
    api.getWeather(currentCity).then(data => {
      if (!isCancelled && data) {
        setWeather(data);
        setCurrentLocationDetails({
          city: data.city,
          country: data.country,
          region: data.region || ''
        });
        setLoadingWeather(false);
      }
    }).catch(() => {
      if (!isCancelled) setLoadingWeather(false);
    });

    return () => {
      isCancelled = true;
    };
  }, [currentCity]);

  // Toggle unit between Celsius and Fahrenheit
  const toggleTemperatureUnit = () => {
    setTemperatureUnit(prev => prev === 'celsius' ? 'fahrenheit' : 'celsius');
  };

  const updateUserProfile = useCallback((updated) => {
    setUser(prev => {
      const next = { ...prev, ...updated, avatar: (updated.name || prev.name).charAt(0).toUpperCase() };
      try {
        localStorage.setItem('weatherwise_user_profile', JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
  }, []);

  // Toggle favorite location
  const toggleFavorite = async (cityName, countryName = '', temp = 25, condition = 'Partly Cloudy') => {
    const exists = favorites.some(f => f.city.toLowerCase() === cityName.toLowerCase());
    if (exists) {
      setFavorites(prev => prev.filter(f => f.city.toLowerCase() !== cityName.toLowerCase()));
      await api.toggleFavorite(cityName);
    } else {
      const newFav = {
        id: 'fav_' + Date.now(),
        city: cityName,
        country: countryName || 'Global',
        temp,
        condition,
        isFavorite: true
      };
      setFavorites(prev => [...prev, newFav]);
      await api.toggleFavorite(cityName, countryName, temp, condition);
    }
  };

  const isFavorite = (cityName) => {
    if (!cityName) return false;
    return favorites.some(f => f.city.toLowerCase() === cityName.toLowerCase());
  };

  const selectCity = (cityName) => {
    setCurrentCity(cityName);
    setLoadingWeather(true);
  };

  return (
    <AppContext.Provider
      value={{
        currentCity,
        selectCity,
        currentLocationDetails,
        weather,
        loadingWeather,
        temperatureUnit,
        setTemperatureUnit,
        toggleTemperatureUnit,
        windSpeedUnit,
        setWindSpeedUnit,
        pressureUnit,
        setPressureUnit,
        dateFormat,
        setDateFormat,
        timeFormat,
        setTimeFormat,
        theme,
        setTheme,
        accentColor,
        setAccentColor,
        language,
        setLanguage,
        t,
        user,
        setUser,
        updateUserProfile,
        defaultLocation,
        setDefaultLocation,
        autoDetectLocation,
        setAutoDetectLocation,
        favorites,
        toggleFavorite,
        isFavorite,
        alerts,
        setAlerts,
        notificationSettings,
        setNotificationSettings
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
