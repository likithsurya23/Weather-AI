export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface HourlyForecast {
  time: string;
  temp: number;
  condition: string;
  icon: string;
}

export interface DailyForecast {
  day: string;
  date: string;
  tempMax: number;
  tempMin: number;
  condition: string;
  icon: string;
  rainChance?: number;
}

export interface AirQualityData {
  aqi: number;
  label: string;
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
}

export interface SunMoonData {
  sunrise: string;
  sunset: string;
  daylight: string;
  moonPhase: string;
  moonrise: string;
}

export interface WeatherData {
  city: string;
  country: string;
  region?: string;
  lat?: number;
  lon?: number;
  temp: number;
  condition: string;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
  uvIndex: number;
  uvLabel: string;
  visibility: number;
  dewPoint: number;
  cloudCover: number;
  rainProbability: number;
  summary: string;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  airQuality: AirQualityData;
  sunMoon: SunMoonData;
  formattedTime?: string;
}

export interface LocationSearchResult {
  name: string;
  country: string;
  region: string;
  type: string;
  lat: number;
  lon: number;
}

export interface FavoriteLocation {
  id: string;
  city: string;
  country: string;
  lat?: number;
  lon?: number;
  temp: number;
  condition: string;
  isFavorite: boolean;
}

export interface WeatherAlert {
  id: string;
  title: string;
  location: string;
  severity: string;
  description: string;
  timestamp: string;
  active: boolean;
}

export interface DisasterNewsItem {
  id: string;
  title: string;
  category: string;
  severity: string;
  alertLevel: string;
  location: string;
  summary: string;
  source: string;
  publishedAt: string;
  url?: string;
  imageUrl?: string;
  isTrending?: boolean;
}

export interface ChatWeatherCard {
  city: string;
  country: string;
  date: string;
  temp: number;
  condition: string;
  rainChance: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  card?: ChatWeatherCard;
  timestamp: string;
}

export interface UserPreferences {
  temperatureUnit: TemperatureUnit;
  language: string;
  theme: ThemeMode;
  weatherAlerts: boolean;
  weeklySummary: boolean;
  marketingUpdates: boolean;
  autoDetectLocation: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  preferences: UserPreferences;
}
