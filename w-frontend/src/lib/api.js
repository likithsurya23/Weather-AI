const rawBase = (process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000/api').replace(/\/+$/, '');
const API_BASE = rawBase.endsWith('/api') ? rawBase : `${rawBase}/api`;
const WEATHER_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

export const TOKEN_KEY = 'weatherwise_token';

export function getAuthToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token) {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getAuthHeaders() {
  const token = getAuthToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Decode condition text to icon key
export function getConditionIcon(text = '') {
  const t = text.toLowerCase();
  if (t.includes('thunder') || t.includes('storm') || t.includes('lightning')) return 'storm';
  if (t.includes('snow') || t.includes('sleet') || t.includes('ice') || t.includes('blizzard')) return 'snow';
  if (t.includes('rain') || t.includes('drizzle') || t.includes('shower')) return 'rain';
  if (t.includes('fog') || t.includes('mist') || t.includes('haze')) return 'fog';
  if (t.includes('cloud') && t.includes('partly')) return 'partly-cloudy';
  if (t.includes('cloud') || t.includes('overcast')) return 'cloudy';
  return 'sun';
}

const NEWSDATA_KEY = process.env.NEXT_PUBLIC_NEWSDATA_API_KEY || 'pub_92ebde5a4f7b49388cfa21ddb8baaf03';

const DISASTER_IMAGES = {
  earthquake: 'https://images.unsplash.com/photo-1589824783837-6169889fa20f?w=800&q=80',
  flood: 'https://images.unsplash.com/photo-1514632595-4944383f2737?w=800&q=80',
  cyclone: 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=800&q=80',
  hurricane: 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=800&q=80',
  tsunami: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800&q=80',
  wildfire: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80',
  landslide: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
  drought: 'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=800&q=80',
  volcano: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80',
  storm: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=800&q=80'
};

function calculateAqi(pm25 = 12) {
  const c = Math.max(0, pm25);
  let aqi = 50;
  let label = 'Good';

  if (c <= 12.0) {
    aqi = Math.round((50 / 12.0) * c);
    label = 'Good';
  } else if (c <= 35.4) {
    aqi = Math.round(50 + ((100 - 51) / (35.4 - 12.1)) * (c - 12.1));
    label = 'Moderate';
  } else if (c <= 55.4) {
    aqi = Math.round(101 + ((150 - 101) / (55.4 - 35.5)) * (c - 35.5));
    label = 'Unhealthy (SG)';
  } else if (c <= 150.4) {
    aqi = Math.round(151 + ((200 - 151) / (150.4 - 55.5)) * (c - 55.5));
    label = 'Unhealthy';
  } else {
    aqi = Math.round(201 + Math.min((c - 150.5) * 0.7, 100));
    label = 'Very Unhealthy';
  }

  return { aqi: Math.max(1, aqi), label };
}

function categorizeText(text = '') {
  const t = text.toLowerCase();
  if (/tsunami|tidal wave/.test(t)) return 'tsunami';
  if (/volcan|eruption|lava|magma|ash plume/.test(t)) return 'volcano';
  if (/tornado|twister|funnel cloud/.test(t)) return 'cyclone';
  if (/hurricane|typhoon|cyclone/.test(t)) return 'cyclone';
  if (/earthquake|quake|tremor|seismic|aftershock|richter/.test(t)) return 'earthquake';
  if (/landslide|mudslide|rockslide|debris flow/.test(t)) return 'landslide';
  if (/wildfire|forest fire|bushfire|brush fire|\bblaze\b/.test(t)) return 'wildfire';
  if (/flood|inundat|deluge|river overflow|heavy rain|monsoon|submerged/.test(t)) return 'flood';
  if (/drought|heatwave|heat dome|water crisis|water shortage/.test(t)) return 'drought';
  return 'storm';
}

function determineSeverity(text = '') {
  const t = text.toLowerCase();
  if (/deadly|fatal|catastrophic|killed|emergency|massive|death toll|destructive|flattened/.test(t)) {
    return 'danger';
  }
  if (/warning|alert|severe|evacuat|injur|major|damage|danger|threat|disruption/.test(t)) {
    return 'warning';
  }
  return 'info';
}

function timeAgo(dateString) {
  if (!dateString) return 'Recently';
  const now = new Date();
  const past = new Date(dateString);
  const diffInMinutes = Math.floor((now - past) / (1000 * 60));
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

export const api = {
  async getWeather(city = 'Mysore', lat, lon) {
    const query = (lat !== undefined && lon !== undefined) ? `${lat},${lon}` : (city || 'Mysore');

    // 1. Query WeatherAPI with full 7-day forecast, hourly data, AQI, and alerts
    try {
      const res = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_KEY}&q=${encodeURIComponent(query)}&days=7&aqi=yes&alerts=yes`);
      if (res.ok) {
        const data = await res.json();
        const loc = data.location;
        const curr = data.current;
        const fdays = data.forecast?.forecastday || [];

        // Parse Local Time & Current Hour
        const localTimeDate = loc.localtime ? new Date(loc.localtime.replace(' ', 'T')) : new Date();
        const currentHour = localTimeDate.getHours();

        // Flatten hourly forecasts across days to guarantee a continuous 24-hour sequence
        const allHours = [];
        fdays.forEach((fd) => {
          if (fd.hour && Array.isArray(fd.hour)) {
            allHours.push(...fd.hour);
          }
        });

        // Extract sequential 24 hours starting from the current local hour
        const hourly = [];
        for (let i = 0; i < 24; i++) {
          const h = allHours[currentHour + i] || allHours[i];
          if (h) {
            const timePart = h.time.split(' ')[1] || '00:00';
            const [hh] = timePart.split(':');
            const hNum = parseInt(hh, 10);
            const ampm = hNum >= 12 ? 'PM' : 'AM';
            const hour12 = hNum % 12 || 12;
            hourly.push({
              time: i === 0 ? 'Now' : `${hour12} ${ampm}`,
              temp: Math.round(h.temp_c),
              feelsLike: Math.round(h.feelslike_c),
              condition: h.condition?.text || 'Clear',
              icon: getConditionIcon(h.condition?.text),
              humidity: h.humidity,
              windSpeed: Math.round(h.wind_kph),
              rainChance: h.chance_of_rain || 0
            });
          }
        }

        // Daily 5 to 7-Day Forecast Mapping
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        const daily = fdays.map((fd, idx) => {
          const d = new Date(fd.date + 'T00:00:00');
          return {
            day: idx === 0 ? 'Today' : dayNames[d.getDay()],
            date: `${dayNames[d.getDay()]}, ${monthNames[d.getMonth()]} ${d.getDate()}`,
            tempMax: Math.round(fd.day.maxtemp_c),
            tempMin: Math.round(fd.day.mintemp_c),
            avgTemp: Math.round(fd.day.avgtemp_c),
            condition: fd.day.condition?.text || 'Partly Cloudy',
            icon: getConditionIcon(fd.day.condition?.text),
            rainChance: fd.day.daily_chance_of_rain || 0,
            humidity: fd.day.avghumidity,
            windSpeed: Math.round(fd.day.maxwind_kph)
          };
        });

        // Air Quality Calculation
        const aqiObj = curr.air_quality || {};
        const pm25Val = aqiObj.pm2_5 !== undefined ? Math.round(aqiObj.pm2_5 * 10) / 10 : 15;
        const pm10Val = aqiObj.pm10 !== undefined ? Math.round(aqiObj.pm10 * 10) / 10 : 28;
        const no2Val = aqiObj.no2 !== undefined ? Math.round(aqiObj.no2 * 10) / 10 : 18;
        const so2Val = aqiObj.so2 !== undefined ? Math.round(aqiObj.so2 * 10) / 10 : 6;
        const o3Val = aqiObj.o3 !== undefined ? Math.round(aqiObj.o3 * 10) / 10 : 42;
        const { aqi, label: aqiLabel } = calculateAqi(pm25Val);

        // Astro
        const astro0 = fdays[0]?.astro || {};

        return {
          city: loc.name,
          region: loc.region || '',
          country: loc.country,
          lat: loc.lat,
          lon: loc.lon,
          localtime: loc.localtime,
          temp: Math.round(curr.temp_c),
          feelsLike: Math.round(curr.feelslike_c),
          condition: curr.condition?.text || 'Clear',
          humidity: curr.humidity,
          windSpeed: Math.round(curr.wind_kph),
          windDir: curr.wind_dir || 'NE',
          pressure: Math.round(curr.pressure_mb),
          visibility: Math.round(curr.vis_km),
          cloudCover: curr.cloud,
          uvIndex: Math.round(curr.uv),
          rainProbability: fdays[0]?.day?.daily_chance_of_rain || 0,
          hourly,
          daily,
          airQuality: {
            aqi,
            label: aqiLabel,
            pm25: pm25Val,
            pm10: pm10Val,
            no2: no2Val,
            so2: so2Val,
            o3: o3Val
          },
          sunMoon: {
            sunrise: astro0.sunrise || '06:12 AM',
            sunset: astro0.sunset || '06:32 PM',
            moonPhase: astro0.moon_phase || 'Waxing Gibbous',
            moonIllumination: `${astro0.moon_illumination || 78}%`
          }
        };
      }
    } catch (e) {
      console.warn('[api.getWeather] Direct call error:', e);
    }

    // 2. Try Backend API as fallback
    try {
      const params = new URLSearchParams();
      if (city) params.append('city', city);
      const res = await fetch(`${API_BASE}/weather?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch {
      // Backend not reached
    }

    return null;
  },

  async searchLocations(query, type = 'all') {
    if (!query || !query.trim()) return [];

    try {
      const res = await fetch(`https://api.weatherapi.com/v1/search.json?key=${WEATHER_KEY}&q=${encodeURIComponent(query.trim())}`);
      if (res.ok) {
        const list = await res.json();
        return list.map((item) => ({
          name: item.name,
          country: item.country,
          region: item.region,
          type: 'city',
          lat: item.lat,
          lon: item.lon
        }));
      }
    } catch {
      // Fallback to backend search
    }

    try {
      const res = await fetch(`${API_BASE}/weather/search?q=${encodeURIComponent(query)}&type=${type}`);
      if (res.ok) {
        const json = await res.json();
        return json.data || [];
      }
    } catch {
      // Error
    }

    return [];
  },

  async getFavorites() {
    try {
      const res = await fetch(`${API_BASE}/favorites`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || [];
      }
    } catch {
      // Error
    }
    return [];
  },

  async toggleFavorite(city, country = '', temp = 24, condition = 'Partly Cloudy') {
    try {
      const res = await fetch(`${API_BASE}/favorites/toggle`, {
        method: 'POST',
        headers: getAuthHeaders(),
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

  async getAlerts(city = 'Mysore') {
    try {
      const res = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_KEY}&q=${encodeURIComponent(city)}&days=1&alerts=yes`);
      if (res.ok) {
        const data = await res.json();
        const govAlerts = data.alerts?.alert || [];
        if (govAlerts.length > 0) {
          return govAlerts.map((ga, idx) => ({
            id: `gov_${idx}`,
            title: ga.headline || ga.event || 'Severe Weather Warning',
            location: `${data.location?.name || city}, ${data.location?.country || ''}`,
            severity: ga.severity?.toLowerCase() === 'extreme' ? 'danger' : 'warning',
            description: ga.desc || ga.instruction || 'Official meteorological advisory issued.',
            time: 'Live Alert'
          }));
        }

        const curr = data.current;
        const rainChance = data.forecast?.forecastday?.[0]?.day?.daily_chance_of_rain || 0;
        const alertsList = [];

        if (rainChance >= 40 || curr.precip_mm > 0.5) {
          alertsList.push({
            id: 'alt_rain',
            type: 'rain',
            conditionText: curr.condition?.text || 'Rain',
            rainChance,
            cityName: data.location?.name || city,
            title: `${curr.condition?.text || 'Rain'} Advisory`,
            location: `${data.location?.name}, ${data.location?.country}`,
            severity: 'warning',
            description: `${curr.condition?.text} with ${rainChance}% precipitation probability observed in ${data.location?.name}.`,
            time: 'Live Alert'
          });
        }

        if (curr.wind_kph >= 15) {
          alertsList.push({
            id: 'alt_wind',
            type: 'wind',
            windKph: Math.round(curr.wind_kph),
            windDir: curr.wind_dir,
            cityName: data.location?.name || city,
            title: 'Active Wind Advisory',
            location: `${data.location?.name}, ${data.location?.country}`,
            severity: 'info',
            description: `Surface wind speed recorded at ${Math.round(curr.wind_kph)} km/h (${curr.wind_dir}).`,
            time: 'Live Advisory'
          });
        }

        if (alertsList.length > 0) return alertsList;
      }
    } catch {
      // Fallback
    }

    try {
      const res = await fetch(`${API_BASE}/alerts`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) return json.data;
      }
    } catch {
      // Error
    }

    return [
      {
        id: 'alt_live_default',
        title: 'Mild Weather Conditions',
        location: `${city}, Global Network`,
        severity: 'info',
        description: 'Atmospheric telemetry indicates stable weather. No severe weather warnings active.',
        time: 'Live Update'
      }
    ];
  },

  async getDisasterNews(category = 'all', search = '', limit = 30, refresh = false) {
    const allArticles = [];

    // Helper to build queries
    let queryTopic = 'earthquake OR flood OR cyclone OR hurricane OR wildfire OR landslide OR volcano OR storm OR tsunami OR drought';
    if (category && category !== 'all') {
      if (category === 'volcano') queryTopic = 'volcano OR eruption OR lava';
      else if (category === 'earthquake') queryTopic = 'earthquake OR seismic OR tremor';
      else if (category === 'cyclone') queryTopic = 'cyclone OR typhoon OR hurricane';
      else if (category === 'flood') queryTopic = 'flood OR flooding OR inundation';
      else if (category === 'wildfire') queryTopic = 'wildfire OR "forest fire" OR bushfire';
      else if (category === 'landslide') queryTopic = 'landslide OR mudslide';
      else if (category === 'drought') queryTopic = 'drought OR "water crisis" OR heatwave';
      else queryTopic = category;
    }

    if (search && search.trim()) {
      queryTopic = `(${queryTopic}) AND (${search.trim()})`;
    }

    // 1. Try Backend endpoint first (Server-side aggregation with caching, GDELT, GDACS, USGS, etc.)
    try {
      const params = new URLSearchParams();
      if (category && category !== 'all') params.append('category', category);
      if (search) params.append('search', search);
      if (limit) params.append('limit', limit.toString());
      if (refresh) params.append('refresh', 'true');

      const url = `${API_BASE}/alerts/disaster-news?${params.toString()}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          json.data.forEach((bItem) => {
            allArticles.push({
              ...bItem,
              category: bItem.category ? bItem.category.charAt(0).toUpperCase() + bItem.category.slice(1) : 'Disaster',
              time: timeAgo(bItem.publishedAt)
            });
          });
        }
      }
    } catch {
      // Backend temporarily unreachable or slow - fall through to direct live feeds
    }

    // 2. Direct Live Fetch from NewsData.io (fast, high-quality news with images)
    if (NEWSDATA_KEY) {
      try {
        const ndUrl = `https://newsdata.io/api/1/news?apikey=${NEWSDATA_KEY}&q=${encodeURIComponent(queryTopic)}&language=en`;
        const res = await fetch(ndUrl, { signal: AbortSignal.timeout(8000) });
        if (res.ok) {
          const json = await res.json();
          if (json.results && Array.isArray(json.results)) {
            json.results.forEach((item, idx) => {
              if (item.title) {
                const combined = `${item.title} ${item.description || ''}`;
                const cat = categorizeText(combined);
                const sev = determineSeverity(combined);
                allArticles.push({
                  id: `nd_${item.article_id || idx}_${Date.now()}`,
                  title: item.title,
                  summary: item.description || item.content || item.title,
                  location: item.country ? (Array.isArray(item.country) ? item.country.join(', ').toUpperCase() : item.country) : (item.source_id || 'Global'),
                  time: timeAgo(item.pubDate),
                  publishedAt: item.pubDate || new Date().toISOString(),
                  category: cat.charAt(0).toUpperCase() + cat.slice(1),
                  severity: sev,
                  status: sev === 'danger' ? 'High Alert' : sev === 'warning' ? 'Moderate Risk' : 'Advisory',
                  statusColor: sev === 'danger'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : sev === 'warning'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-blue-50 text-blue-700 border-blue-200',
                  isBreaking: sev === 'danger',
                  imageUrl: item.image_url || DISASTER_IMAGES[cat] || DISASTER_IMAGES.storm,
                  url: item.link || item.source_url || 'https://newsdata.io',
                  source: item.source_name || item.source_id || 'NewsData'
                });
              }
            });
          }
        }
      } catch {
        // NewsData fetch failed or quota exceeded
      }
    }

    // 3. Direct Live Fetch from USGS Realtime Earthquakes (reliable GeoJSON)
    if (category === 'all' || category === 'earthquake') {
      try {
        const usgsRes = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson', { signal: AbortSignal.timeout(8000) });
        if (usgsRes.ok) {
          const uData = await usgsRes.json();
          if (uData.features && Array.isArray(uData.features)) {
            uData.features.slice(0, 8).forEach((f) => {
              const p = f.properties;
              if (p) {
                const mag = p.mag;
                const place = p.place || 'Unknown location';
                const isHigh = mag >= 5.5;
                allArticles.push({
                  id: `usgs_${f.id}`,
                  title: `M ${mag.toFixed(1)} Earthquake Detected - ${place}`,
                  summary: `Seismic activity measured at magnitude ${mag.toFixed(1)} with a depth of ${f.geometry?.coordinates?.[2] || 10}km. Recorded by USGS Seismological Network.`,
                  location: place,
                  time: timeAgo(p.time),
                  publishedAt: new Date(p.time).toISOString(),
                  category: 'Earthquake',
                  severity: isHigh ? 'danger' : 'warning',
                  status: isHigh ? 'High Alert' : 'Seismic Alert',
                  statusColor: isHigh ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200',
                  isBreaking: isHigh,
                  imageUrl: DISASTER_IMAGES.earthquake,
                  url: p.url || 'https://earthquake.usgs.gov',
                  source: 'USGS Seismology'
                });
              }
            });
          }
        }
      } catch {
        // USGS fetch timed out or offline
      }
    }

    // 4. Supplementary Live Fetch from GDELT Project v2 (only if we have few articles)
    if (allArticles.length < 15) {
      try {
        const gdeltUrl = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(queryTopic)}&mode=artlist&format=json&maxrecords=35&sort=DateDesc`;
        const res = await fetch(gdeltUrl, { signal: AbortSignal.timeout(10000) });
        if (res.ok) {
          const data = await res.json();
          if (data?.articles && Array.isArray(data.articles)) {
            data.articles.forEach((a, i) => {
              if (a.title) {
                const cat = categorizeText(a.title);
                const sev = determineSeverity(a.title);
                allArticles.push({
                  id: `gdelt_${i}_${Date.now()}`,
                  title: a.title,
                  summary: `Disaster report documented by ${a.domain || 'international monitoring'}: ${a.title}`,
                  location: a.sourcecountry || a.domain || 'Global Dispatch',
                  time: a.seendate
                    ? timeAgo(`${a.seendate.slice(0, 4)}-${a.seendate.slice(4, 6)}-${a.seendate.slice(6, 8)}T${a.seendate.slice(9, 11) || '12'}:${a.seendate.slice(11, 13) || '00'}:00Z`)
                    : 'Live Alert',
                  publishedAt: a.seendate
                    ? `${a.seendate.slice(0, 4)}-${a.seendate.slice(4, 6)}-${a.seendate.slice(6, 8)}T12:00:00Z`
                    : new Date().toISOString(),
                  category: cat.charAt(0).toUpperCase() + cat.slice(1),
                  severity: sev,
                  status: sev === 'danger' ? 'High Alert' : sev === 'warning' ? 'Moderate Risk' : 'Advisory',
                  statusColor: sev === 'danger'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : sev === 'warning'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-blue-50 text-blue-700 border-blue-200',
                  isBreaking: sev === 'danger',
                  imageUrl: a.socialimage || DISASTER_IMAGES[cat] || DISASTER_IMAGES.storm,
                  url: a.url,
                  source: a.domain || 'GDELT Live'
                });
              }
            });
          }
        }
      } catch {
        // GDELT timed out, blocked by adblocker/CORS, or unreachable - ignore quietly
      }
    }

    // De-duplicate by title/url
    const seen = new Set();
    const unique = [];
    for (const item of allArticles) {
      const key = (item.title || '').trim().toLowerCase();
      if (key && !seen.has(key)) {
        seen.add(key);
        unique.push(item);
      }
    }

    if (limit && Number(limit) > 0) {
      return unique.slice(0, Number(limit));
    }
    return unique;
  },

  async getChatHistory(language = 'English') {
    try {
      const res = await fetch(`${API_BASE}/chat/history?language=${encodeURIComponent(language)}`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        return {
          data: json.data || [],
          suggestions: json.suggestions || []
        };
      }
    } catch {
      // Error
    }
    return { data: [], suggestions: [] };
  },

  async sendChatMessage(message, language = 'English', currentCity = '') {
    try {
      const res = await fetch(`${API_BASE}/chat/message`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ message, language, currentCity })
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

  async clearChatHistory() {
    try {
      const res = await fetch(`${API_BASE}/chat/history`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Error
    }
    return { success: false };
  },

  async deleteChatMessage(id) {
    try {
      const res = await fetch(`${API_BASE}/chat/message/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Error
    }
    return { success: false };
  },

  async deleteChatMessages(messageIds) {
    try {
      const res = await fetch(`${API_BASE}/chat/delete-messages`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ messageIds })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Error
    }
    return { success: false };
  },

  async register({ name, email, password, confirmPassword }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, confirmPassword })
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Registration failed');
    }
    if (json.token) {
      setAuthToken(json.token);
    }
    return json;
  },

  async login({ email, password }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Login failed');
    }
    if (json.token) {
      setAuthToken(json.token);
    }
    return json;
  },

  async logout() {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
    } catch {
      // Ignore network errors on logout
    } finally {
      setAuthToken(null);
    }
  },

  async getUserProfile() {
    const token = getAuthToken();
    if (!token) return null;
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        return json.user || null;
      } else if (res.status === 401) {
        setAuthToken(null);
      }
    } catch {
      // Error
    }
    return null;
  },

  async getPreferences() {
    const token = getAuthToken();
    if (!token) return null;
    try {
      const res = await fetch(`${API_BASE}/user/preferences`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || null;
      }
    } catch {
      // Error
    }
    return null;
  },

  async updatePreferences(preferences) {
    const token = getAuthToken();
    if (!token) return null;
    try {
      const res = await fetch(`${API_BASE}/user/preferences`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(preferences)
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || null;
      }
    } catch {
      // Error
    }
    return null;
  },

  async updateProfile(data) {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to update profile');
    return json;
  },

  async changePassword(currentPassword, newPassword) {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to change password');
    return json;
  },

  async deleteAccount() {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');
    const res = await fetch(`${API_BASE}/user/account`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to delete account');
    setAuthToken(null);
    return json;
  }
};
