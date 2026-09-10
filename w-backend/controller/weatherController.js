const API_KEY = process.env.WEATHER_API_KEY || 'a5a4f8e5c8544a76b0872757260909';

// Decode weather condition text to icon type
function getConditionIcon(text = '') {
  const t = text.toLowerCase();
  if (t.includes('thunder') || t.includes('storm')) return 'storm';
  if (t.includes('snow') || t.includes('sleet') || t.includes('ice') || t.includes('blizzard')) return 'snow';
  if (t.includes('rain') || t.includes('drizzle') || t.includes('shower')) return 'rain';
  if (t.includes('fog') || t.includes('mist')) return 'fog';
  if (t.includes('cloud') || t.includes('overcast')) return 'cloudy';
  if (t.includes('partly')) return 'partly-cloudy';
  return 'sun';
}

function getAqiLabel(epaIndex = 1) {
  if (epaIndex === 1) return 'Good';
  if (epaIndex === 2) return 'Moderate';
  if (epaIndex === 3) return 'Unhealthy for Sensitive';
  if (epaIndex === 4) return 'Unhealthy';
  if (epaIndex === 5) return 'Very Unhealthy';
  return 'Hazardous';
}

function getUvLabel(uv = 3) {
  if (uv <= 2) return 'Low';
  if (uv <= 5) return 'Moderate';
  if (uv <= 7) return 'High';
  if (uv <= 10) return 'Very High';
  return 'Extreme';
}

function formatLocalTime(localtimeStr) {
  if (!localtimeStr) return new Date().toLocaleString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true });
  const d = new Date(localtimeStr.replace(' ', 'T'));
  if (isNaN(d.getTime())) return localtimeStr;
  const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
  const dayNum = d.getDate();
  const monthName = d.toLocaleDateString('en-US', { month: 'short' });
  const yearNum = d.getFullYear();
  const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${dayName}, ${dayNum} ${monthName} ${yearNum} • ${timeStr}`;
}

async function fetchFromWeatherAPI(query) {
  try {
    const url = `http://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${encodeURIComponent(query)}&days=7&aqi=yes&alerts=yes`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) throw new Error('WeatherAPI status: ' + res.status);
    const data = await res.json();

    const loc = data.location;
    const curr = data.current;
    const fday = data.forecast?.forecastday || [];

    // Build hourly from current day + next day (next 8 hours)
    const currentHour = new Date(loc.localtime.replace(' ', 'T')).getHours();
    const allHours = [];
    if (fday[0]) allHours.push(...fday[0].hour);
    if (fday[1]) allHours.push(...fday[1].hour);

    const hourly = [];
    for (let i = 0; i < 8; i++) {
      const targetIdx = currentHour + i;
      const h = allHours[targetIdx] || allHours[i];
      if (h) {
        const timePart = h.time.split(' ')[1];
        let [hh] = timePart.split(':');
        let hNum = parseInt(hh, 10);
        let ampm = hNum >= 12 ? 'PM' : 'AM';
        let hour12 = hNum % 12 || 12;
        const timeLabel = i === 0 ? 'Now' : `${hour12} ${ampm}`;

        hourly.push({
          time: timeLabel,
          temp: Math.round(h.temp_c),
          condition: h.condition.text,
          icon: getConditionIcon(h.condition.text),
          iconUrl: h.condition.icon
        });
      }
    }

    // Build 7-day forecast
    const daily = fday.map((fd, idx) => {
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
        iconUrl: fd.day.condition.icon,
        rainChance: fd.day.daily_chance_of_rain || 0
      };
    });

    // Air Quality
    const aqiObj = curr.air_quality || {};
    const aqiScore = Math.round(aqiObj.pm2_5 ? aqiObj.pm2_5 * 2.5 : 42);

    // Astro
    const astro = fday[0]?.astro || {};

    return {
      city: loc.name,
      country: loc.country,
      region: loc.region,
      lat: loc.lat,
      lon: loc.lon,
      formattedTime: formatLocalTime(loc.localtime),
      temp: Math.round(curr.temp_c),
      condition: curr.condition.text,
      conditionIcon: curr.condition.icon,
      feelsLike: Math.round(curr.feelslike_c),
      humidity: curr.humidity,
      windSpeed: Math.round(curr.wind_kph),
      pressure: Math.round(curr.pressure_mb),
      uvIndex: Math.round(curr.uv),
      uvLabel: getUvLabel(curr.uv),
      visibility: Math.round(curr.vis_km),
      dewPoint: Math.round(curr.dewpoint_c),
      cloudCover: curr.cloud,
      rainProbability: fday[0]?.day?.daily_chance_of_rain || 0,
      summary: `${curr.condition.text} throughout the day with temperatures ranging from ${Math.round(fday[0]?.day?.mintemp_c || curr.temp_c)}°C to ${Math.round(fday[0]?.day?.maxtemp_c || curr.temp_c)}°C. Winds reaching ${Math.round(curr.wind_kph)} km/h.`,
      hourly,
      daily,
      airQuality: {
        aqi: aqiScore,
        label: getAqiLabel(aqiObj['us-epa-index']),
        pm25: Math.round((aqiObj.pm2_5 || 12) * 10) / 10,
        pm10: Math.round((aqiObj.pm10 || 24) * 10) / 10,
        o3: Math.round((aqiObj.o3 || 45) * 10) / 10,
        no2: Math.round((aqiObj.no2 || 18) * 10) / 10
      },
      sunMoon: {
        sunrise: astro.sunrise || '06:02 AM',
        sunset: astro.sunset || '06:21 PM',
        daylight: '12h 19m',
        moonPhase: astro.moon_phase || 'Waxing Crescent',
        moonrise: astro.moonrise || '04:15 PM'
      },
      rawAlerts: data.alerts?.alert || []
    };
  } catch (err) {
    console.warn('[WeatherAPI Error]:', err.message);
    return null;
  }
}

exports.getWeather = async (req, res, next) => {
  try {
    const { city, lat, lon } = req.query;
    const query = (lat && lon) ? `${lat},${lon}` : (city || 'Bengaluru');

    // Fetch live from WeatherAPI with user's key
    const liveData = await fetchFromWeatherAPI(query);
    if (liveData) {
      return res.json({ success: true, data: liveData });
    }

    res.status(500).json({ success: false, message: 'Could not fetch live weather from WeatherAPI' });
  } catch (err) {
    next(err);
  }
};

exports.searchLocations = async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    const type = req.query.type || 'all';

    let results = [];

    // Live search on WeatherAPI
    if (q) {
      try {
        const sUrl = `http://api.weatherapi.com/v1/search.json?key=${API_KEY}&q=${encodeURIComponent(q)}`;
        const sRes = await fetch(sUrl, { signal: AbortSignal.timeout(4000) });
        if (sRes.ok) {
          const sData = await sRes.json();
          results = sData.map(item => ({
            name: item.name,
            country: item.country,
            region: item.region,
            type: 'city',
            lat: item.lat,
            lon: item.lon
          }));
        }
      } catch (err) {
        console.warn('WeatherAPI search error:', err.message);
      }
    }

    if (type !== 'all') {
      if (type === 'cities') results = results.filter(r => r.type === 'city');
      if (type === 'countries') results = results.filter(r => r.type === 'country');
      if (type === 'regions') results = results.filter(r => r.type === 'region');
    }

    res.json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
};

exports.getMapData = async (req, res) => {
  const layer = req.query.layer || 'temperature';
  
  const cities = [
    // Major Indian States & Cities
    { city: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946, x: 71, y: 55 },
    { city: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777, x: 69, y: 52 },
    { city: 'New Delhi', state: 'Delhi', lat: 28.6139, lng: 77.2090, x: 71, y: 46 },
    { city: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, x: 72, y: 56 },
    { city: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639, x: 74, y: 50 },
    { city: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867, x: 71, y: 53 },
    { city: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873, x: 70, y: 47 },
    { city: 'Kochi', state: 'Kerala', lat: 9.9312, lng: 76.2673, x: 71, y: 58 },
    { city: 'Panaji', state: 'Goa', lat: 15.4909, lng: 73.8278, x: 70, y: 54 },
    { city: 'Shimla', state: 'Himachal Pradesh', lat: 31.1048, lng: 77.1734, x: 71, y: 44 },
    { city: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714, x: 69, y: 49 },
    // International Key Hubs
    { city: 'New York', state: 'USA', lat: 40.7128, lng: -74.0060, x: 28, y: 36 },
    { city: 'London', state: 'UK', lat: 51.5074, lng: -0.1278, x: 48, y: 28 },
    { city: 'Paris', state: 'France', lat: 48.8566, lng: 2.3522, x: 50, y: 32 },
    { city: 'Dubai', state: 'UAE', lat: 25.2048, lng: 55.2708, x: 64, y: 44 },
    { city: 'Tokyo', state: 'Japan', lat: 35.6762, lng: 139.6503, x: 86, y: 38 },
    { city: 'Sydney', state: 'Australia', lat: -33.8688, lng: 151.2093, x: 89, y: 78 }
  ];

  // Fetch live weather points in parallel from WeatherAPI
  const points = await Promise.all(
    cities.map(async (c) => {
      try {
        const url = `http://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${encodeURIComponent(c.city)}`;
        const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
        if (response.ok) {
          const data = await response.json();
          return {
            city: data.location.name,
            lat: data.location.lat || c.lat,
            lng: data.location.lon || c.lng,
            x: c.x,
            y: c.y,
            temp: Math.round(data.current.temp_c),
            condition: data.current.condition.text,
            rain: data.current.precip_mm > 0 ? 70 : 10,
            wind: Math.round(data.current.wind_kph),
            clouds: data.current.cloud,
            pressure: Math.round(data.current.pressure_mb),
            label: `${data.current.condition.text} ${Math.round(data.current.temp_c)}°C`
          };
        }
      } catch (e) {}

      return {
        city: c.city,
        lat: c.lat,
        lng: c.lng,
        x: c.x,
        y: c.y,
        temp: 24,
        condition: 'Clear',
        rain: 10,
        wind: 10,
        clouds: 20,
        pressure: 1013,
        label: `${c.city} 24°C`
      };
    })
  );

  res.json({ success: true, layer, points });
};
