const ChatHistory = require('../models/ChatHistory');
const API_KEY = process.env.WEATHER_API_KEY || 'a5a4f8e5c8544a76b0872757260909';

// Extract city from query text or default to Bengaluru
function detectCity(text = '') {
  const common = [
    'london', 'paris', 'tokyo', 'dubai', 'new york', 'bengaluru', 'bangalore', 
    'sydney', 'mumbai', 'delhi', 'singapore', 'berlin', 'rome', 'madrid', 
    'toronto', 'chicago', 'san francisco', 'los angeles', 'miami', 'seoul'
  ];
  const t = text.toLowerCase();
  for (const c of common) {
    if (t.includes(c)) {
      if (c === 'bangalore') return 'Bengaluru';
      return c.charAt(0).toUpperCase() + c.slice(1);
    }
  }
  return 'Bengaluru';
}

exports.getChatHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    let history = await ChatHistory.find({ userId }).sort({ createdAt: 1 });

    // If empty history, seed initial welcome message
    if (history.length === 0) {
      const welcomeMsg = new ChatHistory({
        userId,
        role: 'assistant',
        content: `Hi ${req.user.name || 'there'}! I'm your WeatherWise AI assistant. You can ask me anything about live weather, forecasts, outfits, travel tips, or disaster alerts.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      await welcomeMsg.save();
      history = [welcomeMsg];
    }

    res.json({
      success: true,
      data: history.map(item => ({
        id: item._id.toString(),
        _id: item._id.toString(),
        userId: item.userId.toString(),
        role: item.role,
        content: item.content,
        card: item.card,
        timestamp: item.timestamp,
        createdAt: item.createdAt
      }))
    });
  } catch (err) {
    next(err);
  }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message cannot be empty' });
    }

    // Save user message to MongoDB
    const userMsg = new ChatHistory({
      userId,
      role: 'user',
      content: message.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    await userMsg.save();

    const q = message.toLowerCase();
    const city = detectCity(message);

    let replyContent = "";
    let card = null;
    let suggestions = [
      "What should I wear today?",
      "Compare London and Tokyo",
      "Best time to visit Paris"
    ];

    // Fetch REAL-TIME forecast from WeatherAPI
    try {
      const url = `http://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${encodeURIComponent(city)}&days=2&aqi=yes`;
      const response = await fetch(url, { signal: AbortSignal.timeout(4500) });
      if (response.ok) {
        const data = await response.json();
        const loc = data.location;
        const curr = data.current;
        const todayForecast = data.forecast?.forecastday?.[0]?.day;
        const tomorrowForecast = data.forecast?.forecastday?.[1]?.day || todayForecast;
        
        const isTomorrow = q.includes('tomorrow');
        const targetDay = isTomorrow ? tomorrowForecast : todayForecast;
        const targetDate = isTomorrow ? 'Tomorrow' : 'Today';
        const rainChance = targetDay?.daily_chance_of_rain || 0;
        const temp = isTomorrow ? Math.round(targetDay?.avgtemp_c) : Math.round(curr.temp_c);
        const condition = isTomorrow ? targetDay?.condition.text : curr.condition.text;

        if (q.includes('rain') || q.includes('umbrella')) {
          if (rainChance >= 40) {
            replyContent = `There is a ${rainChance}% chance of rain in ${loc.name} ${targetDate.toLowerCase()}. Current temperatures are around ${temp}°C with ${condition.toLowerCase()}. I recommend carrying an umbrella!`;
          } else {
            replyContent = `Rain probability in ${loc.name} ${targetDate.toLowerCase()} is low at ${rainChance}%. Expect ${condition.toLowerCase()} with temperatures around ${temp}°C.`;
          }
        } else if (q.includes('wear') || q.includes('clothing') || q.includes('outfit')) {
          if (temp >= 28) {
            replyContent = `With temperatures currently at ${temp}°C in ${loc.name} and ${condition.toLowerCase()}, light, breathable cotton fabrics, sunglasses, and staying hydrated are best.`;
          } else if (temp <= 15) {
            replyContent = `It is brisk in ${loc.name} at ${temp}°C with ${condition.toLowerCase()}. A warm jacket or sweater and closed shoes will keep you comfortable.`;
          } else {
            replyContent = `Conditions in ${loc.name} are pleasant at ${temp}°C with ${condition.toLowerCase()}. Smart casual layers or a light cardigan for the evening are ideal.`;
          }
        } else if (q.includes('compare')) {
          replyContent = `Weather for ${loc.name} is currently ${temp}°C with ${condition}, humidity at ${curr.humidity}%, and winds of ${Math.round(curr.wind_kph)} km/h.`;
        } else {
          replyContent = `In ${loc.name}, it is currently ${temp}°C with ${condition}. Humidity is ${curr.humidity}% and winds are ${Math.round(curr.wind_kph)} km/h. Rain chance is ${rainChance}%.`;
        }

        card = {
          city: loc.name,
          country: loc.country,
          date: targetDate,
          temp: temp,
          condition: condition,
          rainChance: rainChance
        };

        suggestions = [
          `Will it rain in ${city} tomorrow?`,
          `What should I wear in ${city}?`,
          "Compare London and Tokyo"
        ];
      }
    } catch (e) {
      console.warn('[Chat Error]:', e.message);
      replyContent = `I am currently analyzing meteorological telemetry for ${city}. Please ask about current conditions, outfit tips, or rain probabilities!`;
    }

    // Save assistant reply to MongoDB
    const botMsg = new ChatHistory({
      userId,
      role: 'assistant',
      content: replyContent,
      card,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    await botMsg.save();

    res.json({
      success: true,
      data: {
        id: botMsg._id.toString(),
        _id: botMsg._id.toString(),
        userId: botMsg.userId.toString(),
        role: botMsg.role,
        content: botMsg.content,
        card: botMsg.card,
        timestamp: botMsg.timestamp
      },
      suggestions
    });
  } catch (err) {
    next(err);
  }
};

exports.clearHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    await ChatHistory.deleteMany({ userId });
    res.json({ success: true, message: 'Chat history cleared' });
  } catch (err) {
    next(err);
  }
};
