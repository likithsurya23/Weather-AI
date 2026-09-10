const { chatHistories } = require('../models/store');
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

exports.getChatHistory = (req, res) => {
  const userId = req.user ? req.user.id : 'usr_default_1';
  const history = chatHistories.filter(c => c.userId === userId || !c.userId);
  res.json({
    success: true,
    data: history
  });
};

exports.sendMessage = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : 'usr_default_1';
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message cannot be empty' });
    }

    // Save user message
    const userMsg = {
      id: 'chat_msg_' + Date.now(),
      userId,
      role: 'user',
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    chatHistories.push(userMsg);

    const q = message.toLowerCase();
    const city = detectCity(message);

    let replyContent = "";
    let card = null;
    let suggestions = [
      "What should I wear today?",
      "Compare London and Tokyo",
      "Best time to visit Paris"
    ];

    // Fetch REAL-TIME forecast from WeatherAPI using user's key
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

        // Formulate response based on real API numbers
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
          // Compare two cities
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

    const botMsg = {
      id: 'chat_msg_' + (Date.now() + 1),
      userId,
      role: 'assistant',
      content: replyContent,
      card,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    chatHistories.push(botMsg);

    res.json({
      success: true,
      data: botMsg,
      suggestions
    });
  } catch (err) {
    next(err);
  }
};

exports.clearHistory = (req, res) => {
  const userId = req.user ? req.user.id : 'usr_default_1';
  for (let i = chatHistories.length - 1; i >= 0; i--) {
    if (chatHistories[i].userId === userId) {
      chatHistories.splice(i, 1);
    }
  }
  res.json({ success: true, message: 'Chat history cleared' });
};
