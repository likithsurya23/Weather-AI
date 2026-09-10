import type { WeatherData, LocationSearchResult, FavoriteLocation, WeatherAlert, DisasterNewsItem, ChatMessage, UserProfile } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000/api';
const WEATHER_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

// Decode condition text to icon key
export function getConditionIcon(text = ''): string {
  const t = text.toLowerCase();
  if (t.includes('thunder') || t.includes('storm')) return 'storm';
  if (t.includes('snow') || t.includes('sleet') || t.includes('ice')) return 'snow';
  if (t.includes('rain') || t.includes('drizzle') || t.includes('shower')) return 'rain';
  if (t.includes('fog') || t.includes('mist')) return 'fog';
  if (t.includes('cloud') || t.includes('overcast')) return 'cloudy';
  if (t.includes('partly')) return 'partly-cloudy';
  return 'sun';
}

export const api = {
  async getWeather(city = 'Bengaluru', lat?: number, lon?: number): Promise<WeatherData | null> {
    // 1. Try Backend API
    try {
      const params = new URLSearchParams();
      if (city) params.append('city', city);
      if (lat !== undefined && lon !== undefined) {
        params.append('lat', lat.toString());
        params.append('lon', lon.toString());
      }
      const res = await fetch(`${API_BASE}/weather?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch {
      // Fall through to direct WeatherAPI
    }

    // 2. Direct WeatherAPI
    try {
      const query = (lat !== undefined && lon !== undefined) ? `${lat},${lon}` : city;
      const res = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_KEY}&q=${encodeURIComponent(query)}&days=7&aqi=yes&alerts=yes`);
      if (res.ok) {
        const data = await res.json();
        const loc = data.location;
        const curr = data.current;
        const fday = data.forecast?.forecastday || [];

        const currentHour = new Date(loc.localtime).getHours();
        const allHours = [...(fday[0]?.hour || []), ...(fday[1]?.hour || [])];
        const hourly = [];
        for (let i = 0; i < 8; i++) {
          const h = allHours[currentHour + i] || allHours[i];
          if (h) {
            const timePart = h.time.split(' ')[1];
            const [hh] = timePart.split(':');
            const hNum = parseInt(hh, 10);
            const ampm = hNum >= 12 ? 'PM' : 'AM';
            const hour12 = hNum % 12 || 12;
            hourly.push({
              time: i === 0 ? 'Now' : `${hour12} ${ampm}`,
              temp: Math.round(h.temp_c),
              condition: h.condition.text,
              icon: getConditionIcon(h.condition.text)
            });
          }
        }

        const daily = fday.map((fd: { date: string; day: { maxtemp_c: number; mintemp_c: number; condition: { text: string }; daily_chance_of_rain?: number } }, idx: number) => {
          const d = new Date(fd.date + 'T00:00:00');
          const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          return {
            day: idx === 0 ? 'Today' : dayNames[d.getDay()],
            date: `${d.getDate()} ${monthNames[d.getMonth()]}`,
            tempMax: Math.round(fd.day.maxtemp_c),
            tempMin: Math.round(fd.day.mintemp_c),
            condition: fd.day.condition.text,
            icon: getConditionIcon(fd.day.condition.text),
            rainChance: fd.day.daily_chance_of_rain || 0
          };
        });

        const aqiObj = curr.air_quality || {};
        return {
          city: loc.name,
          country: loc.country,
          region: loc.region,
          lat: loc.lat,
          lon: loc.lon,
          temp: Math.round(curr.temp_c),
          condition: curr.condition.text,
          feelsLike: Math.round(curr.feelslike_c),
          humidity: curr.humidity,
          windSpeed: Math.round(curr.wind_kph),
          pressure: Math.round(curr.pressure_mb),
          uvIndex: Math.round(curr.uv),
          uvLabel: curr.uv > 6 ? 'High' : 'Moderate',
          visibility: Math.round(curr.vis_km),
          dewPoint: Math.round(curr.dewpoint_c),
          cloudCover: curr.cloud,
          rainProbability: fday[0]?.day?.daily_chance_of_rain || 0,
          summary: `${curr.condition.text} throughout the day with temperatures ranging from ${Math.round(fday[0]?.day?.mintemp_c || curr.temp_c)}°C to ${Math.round(fday[0]?.day?.maxtemp_c || curr.temp_c)}°C.`,
          hourly,
          daily,
          airQuality: {
            aqi: Math.round((aqiObj.pm2_5 || 12) * 2.5),
            label: aqiObj['us-epa-index'] === 1 ? 'Good' : 'Moderate',
            pm25: Math.round((aqiObj.pm2_5 || 12) * 10) / 10,
            pm10: Math.round((aqiObj.pm10 || 24) * 10) / 10,
            o3: Math.round((aqiObj.o3 || 45) * 10) / 10,
            no2: Math.round((aqiObj.no2 || 18) * 10) / 10
          },
          sunMoon: {
            sunrise: fday[0]?.astro?.sunrise || '06:00 AM',
            sunset: fday[0]?.astro?.sunset || '06:00 PM',
            daylight: '12h 00m',
            moonPhase: fday[0]?.astro?.moon_phase || 'Waxing Crescent',
            moonrise: fday[0]?.astro?.moonrise || '04:00 PM'
          }
        };
      }
    } catch {
      // Failed
    }

    return null;
  },

  async searchLocations(query: string, type = 'all'): Promise<LocationSearchResult[]> {
    try {
      const res = await fetch(`${API_BASE}/weather/search?q=${encodeURIComponent(query)}&type=${type}`);
      if (res.ok) {
        const json = await res.json();
        return json.data || [];
      }
    } catch {
      // Backend not reached
    }

    // Direct WeatherAPI search
    if (query) {
      try {
        const res = await fetch(`https://api.weatherapi.com/v1/search.json?key=${WEATHER_KEY}&q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const list = await res.json();
          return list.map((item: { name: string; country: string; region: string; lat: number; lon: number }) => ({
            name: item.name,
            country: item.country,
            region: item.region,
            type: 'city',
            lat: item.lat,
            lon: item.lon
          }));
        }
      } catch {
        // Search API failed
      }
    }

    return [];
  },

  async getFavorites(): Promise<FavoriteLocation[]> {
    try {
      const res = await fetch(`${API_BASE}/favorites`);
      if (res.ok) {
        const json = await res.json();
        return json.data || [];
      }
    } catch {
      // Error
    }
    return [];
  },

  async toggleFavorite(city: string, country = '', temp = 24, condition = 'Partly Cloudy'): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/favorites/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city, country, temp, condition })
      });
      if (res.ok) {
        const json = await res.json();
        return json.isFavorite;
      }
    } catch {
      // Error
    }
    return false;
  },

  async getAlerts(): Promise<WeatherAlert[]> {
    try {
      const res = await fetch(`${API_BASE}/alerts`);
      if (res.ok) {
        const json = await res.json();
        return json.data || [];
      }
    } catch {
      // Error
    }
    return [];
  },

  async getDisasterNews(category = 'all', search = '', limit: number | null = null, refresh = false): Promise<DisasterNewsItem[]> {
    try {
      const params = new URLSearchParams();
      if (category && category !== 'all') params.append('category', category);
      if (search) params.append('search', search);
      if (limit) params.append('limit', limit.toString());
      if (refresh) params.append('refresh', 'true');

      const url = `${API_BASE}/alerts/disaster-news?${params.toString()}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        return json.data || [];
      }
    } catch {
      // Error
    }
    return [];
  },

  async getChatHistory(): Promise<ChatMessage[]> {
    try {
      const res = await fetch(`${API_BASE}/chat/history`);
      if (res.ok) {
        const json = await res.json();
        return json.data || [];
      }
    } catch {
      // Error
    }
    return [];
  },

  async sendChatMessage(message: string): Promise<{ data?: ChatMessage; suggestions?: string[] }> {
    try {
      const res = await fetch(`${API_BASE}/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      if (res.ok) {
        const json = await res.json();
        return json;
      }
    } catch {
      // Error
    }
    return {};
  },

  async clearChatHistory(): Promise<void> {
    try {
      await fetch(`${API_BASE}/chat/history`, { method: 'DELETE' });
    } catch {
      // Error
    }
  },

  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const res = await fetch(`${API_BASE}/auth/me`);
      if (res.ok) {
        const json = await res.json();
        return json.user || null;
      }
    } catch {
      // Error
    }
    return null;
  }
};
