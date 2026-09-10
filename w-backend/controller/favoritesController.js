const Favorite = require('../models/Favorite');
const API_KEY = process.env.WEATHER_API_KEY || 'a5a4f8e5c8544a76b0872757260909';

exports.getFavorites = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userFavorites = await Favorite.find({ userId }).sort({ createdAt: -1 });

    // Enrich with live weather from WeatherAPI
    const liveFavorites = await Promise.all(
      userFavorites.map(async (fav) => {
        try {
          const url = `http://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${encodeURIComponent(fav.city)}`;
          const response = await fetch(url, { signal: AbortSignal.timeout(3500) });
          if (response.ok) {
            const data = await response.json();
            return {
              id: fav._id.toString(),
              _id: fav._id.toString(),
              userId: fav.userId.toString(),
              city: data.location.name,
              country: data.location.country,
              temp: Math.round(data.current.temp_c),
              condition: data.current.condition.text,
              iconUrl: data.current.condition.icon,
              lat: data.location.lat,
              lon: data.location.lon,
              isFavorite: true,
              updatedAt: fav.updatedAt
            };
          }
        } catch (e) {
          console.warn(`[WeatherAPI] Error fetching live favorite for ${fav.city}:`, e.message);
        }
        return {
          id: fav._id.toString(),
          _id: fav._id.toString(),
          userId: fav.userId.toString(),
          city: fav.city,
          country: fav.country,
          temp: fav.temp,
          condition: fav.condition,
          iconUrl: fav.iconUrl,
          lat: fav.lat,
          lon: fav.lon,
          isFavorite: true,
          updatedAt: fav.updatedAt
        };
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
    const userId = req.user._id;
    const { city } = req.body;

    if (!city || !city.trim()) {
      return res.status(400).json({ success: false, message: 'City is required' });
    }

    const trimmedCity = city.trim();
    const existing = await Favorite.findOne({
      userId,
      city: { $regex: new RegExp(`^${trimmedCity}$`, 'i') }
    });

    if (existing) {
      return res.json({
        success: true,
        data: existing,
        message: 'City already in favorites'
      });
    }

    // Fetch live metrics
    let liveTemp = 24;
    let liveCondition = 'Sunny';
    let countryName = 'Global';
    let lat = 0;
    let lon = 0;

    try {
      const url = `http://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${encodeURIComponent(trimmedCity)}`;
      const response = await fetch(url, { signal: AbortSignal.timeout(3500) });
      if (response.ok) {
        const data = await response.json();
        liveTemp = Math.round(data.current.temp_c);
        liveCondition = data.current.condition.text;
        countryName = data.location.country;
        lat = data.location.lat;
        lon = data.location.lon;
      }
    } catch (e) {
      // Use fallback
    }

    const newFav = new Favorite({
      userId,
      city: trimmedCity,
      country: countryName,
      lat,
      lon,
      temp: liveTemp,
      condition: liveCondition,
      isFavorite: true
    });

    await newFav.save();

    res.status(201).json({
      success: true,
      message: 'Added to favorites',
      data: {
        id: newFav._id.toString(),
        _id: newFav._id.toString(),
        city: newFav.city,
        country: newFav.country,
        temp: newFav.temp,
        condition: newFav.condition,
        isFavorite: true
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.toggleFavorite = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { city, country, temp, condition } = req.body;

    if (!city || !city.trim()) {
      return res.status(400).json({ success: false, message: 'City is required' });
    }

    const trimmedCity = city.trim();
    const existing = await Favorite.findOne({
      userId,
      city: { $regex: new RegExp(`^${trimmedCity}$`, 'i') }
    });

    if (existing) {
      await Favorite.findByIdAndDelete(existing._id);
      return res.json({
        success: true,
        action: 'removed',
        isFavorite: false,
        data: { id: existing._id.toString(), city: trimmedCity }
      });
    }

    let liveTemp = temp || 24;
    let liveCondition = condition || 'Sunny';
    let countryName = country || 'Global';
    let lat = 0;
    let lon = 0;

    try {
      const url = `http://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${encodeURIComponent(trimmedCity)}`;
      const response = await fetch(url, { signal: AbortSignal.timeout(3500) });
      if (response.ok) {
        const data = await response.json();
        liveTemp = Math.round(data.current.temp_c);
        liveCondition = data.current.condition.text;
        countryName = data.location.country;
        lat = data.location.lat;
        lon = data.location.lon;
      }
    } catch (e) {
      // Keep defaults
    }

    const newFav = new Favorite({
      userId,
      city: trimmedCity,
      country: countryName,
      lat,
      lon,
      temp: liveTemp,
      condition: liveCondition,
      isFavorite: true
    });

    await newFav.save();

    return res.json({
      success: true,
      action: 'added',
      isFavorite: true,
      data: {
        id: newFav._id.toString(),
        _id: newFav._id.toString(),
        city: newFav.city,
        country: newFav.country,
        temp: newFav.temp,
        condition: newFav.condition,
        isFavorite: true
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.removeFavorite = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const query = {
      userId,
      $or: [
        { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
        { city: { $regex: new RegExp(`^${id}$`, 'i') } }
      ].filter(Boolean)
    };

    const deleted = await Favorite.findOneAndDelete(query);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Favorite not found' });
    }

    res.json({ success: true, message: 'Removed from favorites' });
  } catch (err) {
    next(err);
  }
};
