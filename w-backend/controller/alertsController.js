const Alert = require('../models/Alert');
const API_KEY = process.env.WEATHER_API_KEY || 'a5a4f8e5c8544a76b0872757260909';

// Monitored cities for active global weather alerts
const monitoredCities = ['Bengaluru', 'Dubai', 'London', 'Tokyo', 'New York'];

exports.getAlerts = async (req, res, next) => {
  try {
    const liveAlerts = [];
    const userId = req.user?._id;

    // 1. Fetch any custom user-specific alerts from MongoDB
    if (userId) {
      const dbAlerts = await Alert.find({
        $or: [{ userId }, { userId: null }],
        active: true,
        dismissedBy: { $ne: userId }
      }).sort({ createdAt: -1 });

      dbAlerts.forEach((da) => {
        liveAlerts.push({
          id: da._id.toString(),
          _id: da._id.toString(),
          title: da.title,
          location: da.location,
          severity: da.severity,
          description: da.description,
          timestamp: da.timestamp,
          active: da.active
        });
      });
    }

    // 2. Query live forecasts with alerts=yes for monitored cities
    await Promise.all(
      monitoredCities.map(async (city) => {
        try {
          const url = `http://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${encodeURIComponent(city)}&days=1&aqi=yes&alerts=yes`;
          const response = await fetch(url, { signal: AbortSignal.timeout(4000) });
          if (response.ok) {
            const data = await response.json();
            const loc = data.location;
            const curr = data.current;
            const fday = data.forecast?.forecastday?.[0];
            const govAlerts = data.alerts?.alert || [];

            // Government alerts
            if (govAlerts.length > 0) {
              govAlerts.forEach((ga, idx) => {
                liveAlerts.push({
                  id: `alt_gov_${loc.name}_${idx}`,
                  title: ga.headline || ga.event || 'Severe Weather Warning',
                  location: `${loc.name}, ${loc.country}`,
                  severity: ga.severity?.toLowerCase() === 'extreme' ? 'danger' : 'warning',
                  description: ga.desc || ga.instruction || 'Official meteorological advisory issued.',
                  timestamp: ga.effective ? new Date(ga.effective).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live Alert',
                  active: true
                });
              });
            }

            // Real-time telemetry advisories
            const rainChance = fday?.day?.daily_chance_of_rain || 0;
            const temp = Math.round(curr.temp_c);
            const wind = Math.round(curr.wind_kph);
            const aqi = curr.air_quality?.['us-epa-index'] || 1;

            if (temp >= 35) {
              liveAlerts.push({
                id: `alt_temp_${loc.name}`,
                title: 'High Temperature Warning',
                location: `${loc.name}, ${loc.country}`,
                severity: 'warning',
                description: `Live temperature is recorded at ${temp}°C (feels like ${Math.round(curr.feelslike_c)}°C). Limit midday outdoor exertion and maintain hydration.`,
                timestamp: 'Live Advisory',
                active: true
              });
            }

            if (rainChance >= 50 || curr.precip_mm > 1.0) {
              liveAlerts.push({
                id: `alt_rain_${loc.name}`,
                title: 'Precipitation & Rain Alert',
                location: `${loc.name}, ${loc.country}`,
                severity: rainChance >= 75 ? 'danger' : 'warning',
                description: `High precipitation probability of ${rainChance}% with ${curr.condition.text.toLowerCase()} reported. Expect potential traffic delays.`,
                timestamp: 'Live Radar Alert',
                active: true
              });
            }

            if (wind >= 20) {
              liveAlerts.push({
                id: `alt_wind_${loc.name}`,
                title: 'Strong Wind Advisory',
                location: `${loc.name}, ${loc.country}`,
                severity: 'info',
                description: `Sustained surface winds at ${wind} km/h from ${curr.wind_dir}. Caution recommended on open bridges and elevated structures.`,
                timestamp: 'Live Sensor Notice',
                active: true
              });
            }

            if (aqi >= 3) {
              liveAlerts.push({
                id: `alt_aqi_${loc.name}`,
                title: 'Air Quality Advisory',
                location: `${loc.name}, ${loc.country}`,
                severity: 'info',
                description: `Elevated particulate levels (PM2.5: ${Math.round(curr.air_quality?.pm2_5 || 0)} µg/m³). Sensitive individuals should wear masks outdoors.`,
                timestamp: 'Atmospheric Notice',
                active: true
              });
            }
          }
        } catch (e) {
          console.warn(`[Alerts] Error querying ${city}:`, e.message);
        }
      })
    );

    if (liveAlerts.length === 0) {
      liveAlerts.push({
        id: 'alt_calm_1',
        title: 'Mild Weather Conditions',
        location: 'Global Meteorological Network',
        severity: 'info',
        description: 'No severe weather warnings active across primary monitored stations. Atmospheric conditions remain stable.',
        timestamp: 'Live Check',
        active: true
      });
    }

    res.json({
      success: true,
      data: liveAlerts
    });
  } catch (err) {
    next(err);
  }
};

exports.dismissAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (userId && id.match(/^[0-9a-fA-F]{24}$/)) {
      await Alert.findByIdAndUpdate(id, {
        $addToSet: { dismissedBy: userId }
      });
    }

    res.json({ success: true, message: 'Alert acknowledged' });
  } catch (err) {
    next(err);
  }
};

exports.updateSettings = async (req, res, next) => {
  try {
    const user = req.user;
    if (user && user.preferences) {
      const { weatherAlerts, weeklySummary, marketingUpdates } = req.body;
      if (weatherAlerts !== undefined) user.preferences.weatherAlerts = weatherAlerts;
      if (weeklySummary !== undefined) user.preferences.weeklySummary = weeklySummary;
      if (marketingUpdates !== undefined) user.preferences.marketingUpdates = marketingUpdates;
      await user.save();
    }
    res.json({ success: true, message: 'Alert preferences updated' });
  } catch (err) {
    next(err);
  }
};
