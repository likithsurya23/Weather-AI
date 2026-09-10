'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api, getAuthToken, setAuthToken } from '../lib/api';
import { getTranslation } from '../lib/translations';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const isLoadedRef = useRef(false);

  // Authentication State
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Location & Weather state
  const [currentCity, setCurrentCity] = useState('');
  const [currentLocationDetails, setCurrentLocationDetails] = useState({
    city: 'Detecting Location...',
    country: '',
    region: ''
  });

  const [defaultLocation, setDefaultLocation] = useState('Bengaluru, Karnataka');
  const [autoDetectLocation, setAutoDetectLocation] = useState(true);
  const [isLiveLocation, setIsLiveLocation] = useState(true);
  const [isSyncingLocation, setIsSyncingLocation] = useState(false);
  const [deviceLocationName, setDeviceLocationName] = useState('');

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

  // Weather, favorites & alerts state
  const [favorites, setFavorites] = useState([]);
  const [weather, setWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Translation helper
  const t = useCallback(
    (key, fallback) => {
      return getTranslation(language, key, fallback);
    },
    [language]
  );

  // Initial Auth & Preferences Hydration
  useEffect(() => {
    let isMounted = true;

    async function initAuthAndPreferences() {
      try {
        const token = getAuthToken();
        if (token) {
          const profile = await api.getUserProfile();
          if (isMounted && profile) {
            setUser({
              id: profile._id || profile.id,
              name: profile.name,
              email: profile.email,
              avatar: profile.avatar || (profile.name ? profile.name.charAt(0).toUpperCase() : 'U'),
              preferences: profile.preferences || {}
            });

            // Rehydrate user preferences from MongoDB if available
            const prefs = profile.preferences;
            if (prefs) {
              if (prefs.temperatureUnit) setTemperatureUnit(prefs.temperatureUnit);
              if (prefs.windSpeedUnit) setWindSpeedUnit(prefs.windSpeedUnit);
              if (prefs.pressureUnit) setPressureUnit(prefs.pressureUnit);
              if (prefs.dateFormat) setDateFormat(prefs.dateFormat);
              if (prefs.timeFormat) setTimeFormat(prefs.timeFormat);
              if (prefs.theme) setTheme(prefs.theme);
              if (prefs.accentColor) setAccentColor(prefs.accentColor);
              if (prefs.language) setLanguage(prefs.language);
              if (prefs.defaultLocation) setDefaultLocation(prefs.defaultLocation);
              if (prefs.autoDetectLocation !== undefined) setAutoDetectLocation(prefs.autoDetectLocation);
            }

            // Load user-specific favorites from MongoDB
            const userFavs = await api.getFavorites();
            if (isMounted && userFavs) {
              setFavorites(userFavs);
            }
          } else if (isMounted) {
            setUser(null);
          }
        } else if (isMounted) {
          // Check local storage fallback settings for guest
          const savedSettings = localStorage.getItem('weatherwise_settings');
          if (savedSettings) {
            const parsed = JSON.parse(savedSettings);
            if (parsed.temperatureUnit) setTemperatureUnit(parsed.temperatureUnit);
            if (parsed.theme) setTheme(parsed.theme);
            if (parsed.language) setLanguage(parsed.language);
          }
          setUser(null);
        }
      } catch (err) {
        console.warn('[useAppContext] Auth init error:', err);
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) {
          setAuthLoading(false);
          isLoadedRef.current = true;
        }
      }
    }

    initAuthAndPreferences();
    api.getAlerts().then((alts) => {
      if (isMounted) setAlerts(alts || []);
    });

    return () => {
      isMounted = false;
    };
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

  // Persist settings changes locally and to backend if logged in
  useEffect(() => {
    if (!isLoadedRef.current) return;
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

    try {
      localStorage.setItem('weatherwise_settings', JSON.stringify(settings));
    } catch {
      // Ignore storage errors
    }

    // If authenticated, sync preferences to MongoDB backend
    if (user) {
      api.updatePreferences(settings).catch(() => {});
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
    autoDetectLocation,
    user
  ]);

  // Live Device Location Sync Function
  const syncDeviceLocation = useCallback(async (isInitial = false) => {
    await Promise.resolve();
    setIsSyncingLocation(true);
    setLoadingWeather(true);

    const applyWeather = (data) => {
      if (data) {
        setWeather(data);
        setCurrentCity(data.city);
        setCurrentLocationDetails({
          city: data.city,
          country: data.country,
          region: data.region || ''
        });
        const locName = `${data.city}${data.region ? `, ${data.region}` : ''}`;
        setDeviceLocationName(locName);
        if (isInitial || autoDetectLocation) {
          setDefaultLocation(locName);
        }
        setIsLiveLocation(true);
      }
      setIsSyncingLocation(false);
      setLoadingWeather(false);
    };

    const fallbackToIp = async () => {
      try {
        const data = await api.getWeather('auto:ip');
        if (data) {
          applyWeather(data);
          return true;
        }
      } catch (e) {
        console.warn('IP location detection error:', e);
      }
      return false;
    };

    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const { latitude, longitude } = pos.coords;
            const data = await api.getWeather(null, latitude, longitude);
            if (data) {
              applyWeather(data);
            } else {
              await fallbackToIp();
            }
          } catch {
            await fallbackToIp();
          }
        },
        async () => {
          // GPS denied or unavailable -> use IP location seamlessly!
          const ok = await fallbackToIp();
          if (!ok && isInitial) {
            const fallback = await api.getWeather('Bengaluru');
            applyWeather(fallback);
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 6000,
          maximumAge: 60000
        }
      );
    } else {
      await fallbackToIp();
    }
  }, [autoDetectLocation]);

  // Initial mount: automatically sync device live location
  useEffect(() => {
    let isCancelled = false;
    (async () => {
      if (!isCancelled) {
        await syncDeviceLocation(true);
      }
    })();
    return () => {
      isCancelled = true;
    };
  }, [syncDeviceLocation]);

  // Fetch weather data whenever user explicitly searches or changes currentCity
  useEffect(() => {
    if (!currentCity || isLiveLocation) return;
    let isCancelled = false;
    api
      .getWeather(currentCity)
      .then((data) => {
        if (!isCancelled && data) {
          setWeather(data);
          setCurrentLocationDetails({
            city: data.city,
            country: data.country,
            region: data.region || ''
          });
          setLoadingWeather(false);
        }
      })
      .catch(() => {
        if (!isCancelled) setLoadingWeather(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [currentCity, isLiveLocation]);

  // Auth Operations
  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res && res.user) {
      setUser({
        id: res.user._id || res.user.id,
        name: res.user.name,
        email: res.user.email,
        avatar: res.user.avatar || res.user.name.charAt(0).toUpperCase(),
        preferences: res.user.preferences || {}
      });

      // Reload favorites for newly logged-in user
      const userFavs = await api.getFavorites();
      setFavorites(userFavs || []);
      return res.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (name, email, password, confirmPassword) => {
    const res = await api.register({ name, email, password, confirmPassword });
    if (res && res.user) {
      setUser({
        id: res.user._id || res.user.id,
        name: res.user.name,
        email: res.user.email,
        avatar: res.user.avatar || res.user.name.charAt(0).toUpperCase(),
        preferences: res.user.preferences || {}
      });

      const userFavs = await api.getFavorites();
      setFavorites(userFavs || []);
      return res.user;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = async () => {
    await api.logout();
    setAuthToken(null);
    setUser(null);
    setFavorites([]);
  };

  const updateUserProfile = useCallback((updated) => {
    setUser((prev) => {
      if (!prev) return null;
      const next = {
        ...prev,
        ...updated,
        avatar: (updated.name || prev.name).charAt(0).toUpperCase()
      };
      return next;
    });
  }, []);

  // Toggle favorite location in MongoDB
  const toggleFavorite = async (cityName, countryName = '', temp = 25, condition = 'Partly Cloudy') => {
    const exists = favorites.some((f) => f.city.toLowerCase() === cityName.toLowerCase());
    if (exists) {
      setFavorites((prev) => prev.filter((f) => f.city.toLowerCase() !== cityName.toLowerCase()));
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
      setFavorites((prev) => [...prev, newFav]);
      await api.toggleFavorite(cityName, countryName, temp, condition);
    }
  };

  const isFavorite = (cityName) => {
    if (!cityName) return false;
    return favorites.some((f) => f.city.toLowerCase() === cityName.toLowerCase());
  };

  const selectCity = (cityName) => {
    setIsLiveLocation(false);
    setCurrentCity(cityName);
    setLoadingWeather(true);
  };

  const toggleTemperatureUnit = () => {
    setTemperatureUnit((prev) => (prev === 'celsius' ? 'fahrenheit' : 'celsius'));
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated: !!user,
        authLoading,
        login,
        register,
        logout,
        updateUserProfile,
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
        defaultLocation,
        setDefaultLocation,
        autoDetectLocation,
        setAutoDetectLocation,
        isLiveLocation,
        isSyncingLocation,
        syncDeviceLocation,
        deviceLocationName,
        favorites,
        toggleFavorite,
        isFavorite,
        alerts,
        setAlerts,
        notificationSettings,
        setNotificationSettings,
        mobileMenuOpen,
        setMobileMenuOpen
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
