const { favorites } = require('../models/store');
const API_KEY = process.env.WEATHER_API_KEY || 'a5a4f8e5c8544a76b0872757260909';

exports.getFavorites = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : 'usr_default_1';
    const userFavorites = favorites.filter(f => f.userId === userId || !f.userId);

    // Fetch live weather data for each favorite city using WeatherAPI
    const liveFavorites = await Promise.all(
      userFavorites.map(async (fav) => {
        try {
          const url = `http://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${encodeURIComponent(fav.city)}`;
          const response = await fetch(url, { signal: AbortSignal.timeout(3500) });
          if (response.ok) {
            const data = await response.json();
            return {
              ...fav,
              city: data.location.name,
              country: data.location.country,
              temp: Math.round(data.current.temp_c),
              condition: data.current.condition.text,
              iconUrl: data.current.condition.icon,
              lat: data.location.lat,
              lon: data.location.lon,
              updatedAt: new Date().toISOString()
            };
          }
        } catch (e) {
          console.warn(`[WeatherAPI] Error fetching live favorite for ${fav.city}:`, e.message);
        }
        return fav;
      })
    );

    res.json({
      success: true,
      data: liveFavorites
    });
  } catch (err) {
    next(err);
  }
};

exports.addFavorite = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : 'usr_default_1';
    const { city } = req.body;

    if (!city) {
      return res.status(400).json({ success: false, message: 'City is required' });
    }

    const existing = favorites.find(f => 
      (f.userId === userId || !f.userId) && 
      f.city.toLowerCase() === city.toLowerCase()
    );

    if (existing) {
      return res.json({ success: true, data: existing, message: 'City already in favorites' });
    }

    // Fetch real metrics from WeatherAPI
    let liveTemp = 24;
    let liveCondition = 'Sunny';
    let countryName = 'Global';
    let lat = 0;
    let lon = 0;

    try {
      const url = `http://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${encodeURIComponent(city)}`;
      const response = await fetch(url, { signal: AbortSignal.timeout(3500) });
      if (response.ok) {
        const data = await response.json();
        liveTemp = Math.round(data.current.temp_c);
        liveCondition = data.current.condition.text;
        countryName = data.location.country;
        lat = data.location.lat;
        lon = data.location.lon;
      }
    } catch (e) {}

    const newFav = {
      id: 'fav_' + Date.now(),
      userId,
      city,
      country: countryName,
      lat,
      lon,
      temp: liveTemp,
      condition: liveCondition,
      isFavorite: true,
      updatedAt: new Date().toISOString()
    };

    favorites.push(newFav);
    res.status(201).json({
      success: true,
      message: 'Added to favorites',
      data: newFav
    });
  } catch (err) {
    next(err);
  }
};

exports.removeFavorite = (req, res) => {
  const { id } = req.params;
  const index = favorites.findIndex(f => f.id === id || f.city.toLowerCase() === id.toLowerCase());
  
  if (index !== -1) {
    favorites.splice(index, 1);
    return res.json({ success: true, message: 'Removed from favorites' });
  }

  res.status(404).json({ success: false, message: 'Favorite not found' });
};

exports.toggleFavorite = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : 'usr_default_1';
    const { city } = req.body;

    if (!city) {
      return res.status(400).json({ success: false, message: 'City is required' });
    }

    const index = favorites.findIndex(f => 
      (f.userId === userId || !f.userId) && 
      f.city.toLowerCase() === city.toLowerCase()
    );

    if (index !== -1) {
      const removed = favorites.splice(index, 1)[0];
      return res.json({ success: true, action: 'removed', isFavorite: false, data: removed });
    } else {
      let liveTemp = 24;
      let liveCondition = 'Sunny';
      let countryName = 'Global';
      let lat = 0;
      let lon = 0;

      try {
        const url = `http://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${encodeURIComponent(city)}`;
        const response = await fetch(url, { signal: AbortSignal.timeout(3500) });
        if (response.ok) {
          const data = await response.json();
          liveTemp = Math.round(data.current.temp_c);
          liveCondition = data.current.condition.text;
          countryName = data.location.country;
          lat = data.location.lat;
          lon = data.location.lon;
        }
      } catch (e) {}

      const newFav = {
        id: 'fav_' + Date.now(),
        userId,
        city,
        country: countryName,
        lat,
        lon,
        temp: liveTemp,
        condition: liveCondition,
        isFavorite: true,
        updatedAt: new Date().toISOString()
      };
      favorites.push(newFav);
      return res.json({ success: true, action: 'added', isFavorite: true, data: newFav });
    }
  } catch (err) {
    next(err);
  }
};
