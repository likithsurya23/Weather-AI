const mongoose = require('mongoose');
const ChatHistory = require('../models/ChatHistory');
const geminiService = require('../services/geminiService');
const API_KEY = process.env.WEATHER_API_KEY;

// Fetch forecast telemetry from WeatherAPI
async function fetchWeatherData(city) {
  if (!city || !API_KEY) return null;
  try {
    const url = `http://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${encodeURIComponent(city)}&days=2&aqi=yes`;
    const response = await fetch(url, { signal: AbortSignal.timeout(4500) });
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn(`[WeatherAPI Fetch Warning for ${city}]:`, err.message);
  }
  return null;
}

exports.getChatHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const rawLang = req.query.language || 'English';
    const langInfo = geminiService.normalizeLanguage(rawLang);
    const langName = langInfo.name;
    let history = await ChatHistory.find({ userId }).sort({ createdAt: 1 });

    // Seed welcoming initial greeting if history is fresh
    if (history.length === 0) {
      let welcomeContent = `Hello ${req.user.name || 'there'}! I am your WeatherWise AI assistant powered by Google Gemini. Ask me about live weather, forecasts, attire advice, or any feature of our platform.`;

      if (langName === 'Hindi') {
        welcomeContent = `नमस्ते ${req.user.name || ''}! मैं आपका वेदरवाइज़ एआई सहायक हूँ। मुझसे लाइव मौसम, पूर्वानुमान, पहनावे के सुझाव या एप्लिकेशन की सुविधाओं के बारे में कुछ भी पूछें।`;
      } else if (langName === 'Kannada') {
        welcomeContent = `ನಮಸ್ಕಾರ ${req.user.name || ''}! ನಾನು ನಿಮ್ಮ ವೆದರ್‌ವೈಸ್ ಎಐ ಸಹಾಯಕ. ಲೈವ್ ಹವಾಮಾನ, ಮುನ್ಸೂಚನೆಗಳು ಅಥವಾ ಅಪ್ಲಿಕೇಶನ್ ವೈಶಿಷ್ಟ್ಯಗಳ ಕುರಿತು ನನ್ನನ್ನು ಕೇಳಿ.`;
      } else if (langName === 'Spanish') {
        welcomeContent = `¡Hola ${req.user.name || ''}! Soy tu asistente meteorológico de WeatherWise. Pregúntame sobre el clima en vivo, pronósticos o cualquier función de la plataforma.`;
      } else if (langName === 'French') {
        welcomeContent = `Bonjour ${req.user.name || ''} ! Je suis votre assistant météo IA WeatherWise. Posez-moi des questions sur la météo en direct, les prévisions ou les fonctionnalités de la plateforme.`;
      } else if (langName === 'German') {
        welcomeContent = `Hallo ${req.user.name || ''}! Ich bin Ihr WeatherWise KI-Wetterassistent. Fragen Sie mich nach dem aktuellen Wetter, Vorhersagen, Kleidungstipps oder Funktionen der Plattform.`;
      } else if (langName === 'Japanese') {
        welcomeContent = `こんにちは ${req.user.name || ''}さん！WeatherWise AI気象アシスタントです。リアルタイムの天気、予報、服装のアドバイス、アプリの機能についてお気軽にお尋ねください。`;
      }

      const welcomeMsg = new ChatHistory({
        userId,
        role: 'assistant',
        content: welcomeContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      await welcomeMsg.save();
      history = [welcomeMsg];
    }

    // Language-aware initial suggested explorations for all 7 settings languages
    let initialSuggestions = [
      "What features are available in WeatherWise?",
      "How does the 3D Weather Globe work?",
      "How do I track natural disaster alerts?"
    ];

    if (langName === 'Hindi') {
      initialSuggestions = [
        "वेदरवाइज़ में कौन-कौन से फीचर्स उपलब्ध हैं?",
        "3डी वेदर ग्लोब कैसे काम करता है?",
        "प्राकृतिक आपदा अलर्ट कैसे देखें?"
      ];
    } else if (langName === 'Kannada') {
      initialSuggestions = [
        "ವೆದರ್‌ವೈಸ್‌ನಲ್ಲಿ ಯಾವ ವೈಶಿಷ್ಟ್ಯಗಳು ಲಭ್ಯವಿದೆ?",
        "3ಡಿ ಹವಾಮಾನ ಗ್ಲೋಬ್ ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ?",
        "ನೈಸರ್ಗಿಕ ವಿಕೋಪಗಳ ಎಚ್ಚರಿಕೆಗಳನ್ನು ನೋಡುವುದು ಹೇಗೆ?"
      ];
    } else if (langName === 'Spanish') {
      initialSuggestions = [
        "¿Qué funciones están disponibles en WeatherWise?",
        "¿Cómo funciona el Globo Meteorológico 3D?",
        "¿Cómo puedo seguir las alertas de desastres naturales?"
      ];
    } else if (langName === 'French') {
      initialSuggestions = [
        "Quelles fonctionnalités sont disponibles sur WeatherWise ?",
        "Comment fonctionne le globe météo 3D ?",
        "Comment suivre les alertes de catastrophes naturelles ?"
      ];
    } else if (langName === 'German') {
      initialSuggestions = [
        "Welche Funktionen bietet WeatherWise?",
        "Wie funktioniert der 3D-Wetterglobus?",
        "Wie kann ich Naturkatastrophen-Warnungen verfolgen?"
      ];
    } else if (langName === 'Japanese') {
      initialSuggestions = [
        "WeatherWiseにはどんな機能がありますか？",
        "3D気象グローブはどのように使いますか？",
        "自然災害アラートはどこで確認できますか？"
      ];
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
      })),
      suggestions: initialSuggestions
    });
  } catch (err) {
    next(err);
  }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { message, language = 'English', currentCity } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message cannot be empty' });
    }

    const trimmedMsg = message.trim();

    // 1. Save user message to MongoDB
    const userMsg = new ChatHistory({
      userId,
      role: 'user',
      content: trimmedMsg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    await userMsg.save();

    // 2. Retrieve recent history for conversational memory
    const recentHistory = await ChatHistory.find({ userId })
      .sort({ createdAt: -1 })
      .limit(6);
    recentHistory.reverse();

    // 3. Extract city or cities from message
    let detectedCities = geminiService.extractCities(trimmedMsg);

    // If no city found in current message, check previous turns for context
    if (detectedCities.length === 0) {
      for (let i = recentHistory.length - 2; i >= 0; i--) {
        const prevCities = geminiService.extractCities(recentHistory[i].content);
        if (prevCities.length > 0) {
          detectedCities = prevCities;
          break;
        }
      }
    }

    // Check if the query is an application feature question or general conversation
    const isAppFeatureQuery = /\b(globe|3d|radar|leaf|layer|alert|disaster|feed|hazard|earthquake|flood|wildfire|favorite|bookmark|save|unit|celsius|fahrenheit|theme|dark|light|login|register|account|language|translate|how do i|how to|features?|app|platform)\b/i.test(trimmedMsg);

    let primaryCity = null;
    let secondaryCity = null;

    // Only fetch weather telemetry if specific cities are mentioned or asked about
    if (detectedCities.length > 0) {
      primaryCity = detectedCities[0];
      secondaryCity = detectedCities[1] || null;
    } else if (!isAppFeatureQuery && /\b(weather|temperature|forecast|rain|snow|humidity|wind|uv|aqi|wear|umbrella)\b/i.test(trimmedMsg)) {
      primaryCity = (currentCity && typeof currentCity === 'string' && currentCity.trim()) ? currentCity.trim() : 'Bengaluru';
    }

    // 4. Fetch real-time weather if applicable
    let primaryWeather = primaryCity ? await fetchWeatherData(primaryCity) : null;
    let secondaryWeather = secondaryCity ? await fetchWeatherData(secondaryCity) : null;

    // 5. Generate dynamic AI reply using Google Gemini in the requested language
    let geminiResult = await geminiService.generateWeatherChatReply({
      userMessage: trimmedMsg,
      history: recentHistory,
      primaryWeather,
      secondaryWeather,
      language
    });

    let replyContent = "";
    let suggestions = [];
    let showCard = false;

    if (geminiResult && geminiResult.reply) {
      replyContent = geminiResult.reply;
      suggestions = geminiResult.suggestions || [];
      showCard = Boolean(geminiResult.showWeatherCard);
    } else {
      // Graceful dynamic network error notice if AI service is temporarily unavailable
      replyContent = "I'm temporarily experiencing high traffic connecting to the meteorological intelligence service. Please ask your question again in a few moments!";
      suggestions = [
        "What features does WeatherWise have?",
        "How do I use the 3D Weather Globe?",
        "Where are natural disaster alerts located?"
      ];
    }

    // 6. Build interactive Weather Preview Card ONLY if telemetry is relevant and requested
    let card = null;
    if (showCard && primaryWeather && primaryWeather.location) {
      const loc = primaryWeather.location;
      const curr = primaryWeather.current;
      const isTomorrow = /\btomorrow\b/i.test(trimmedMsg);
      const targetDay = isTomorrow
        ? (primaryWeather.forecast?.forecastday?.[1]?.day || primaryWeather.forecast?.forecastday?.[0]?.day)
        : primaryWeather.forecast?.forecastday?.[0]?.day;

      card = {
        city: loc.name,
        country: loc.country,
        date: isTomorrow ? 'Tomorrow' : 'Today',
        temp: isTomorrow ? Math.round(targetDay?.avgtemp_c || curr.temp_c) : Math.round(curr.temp_c),
        condition: isTomorrow ? (targetDay?.condition?.text || curr.condition.text) : curr.condition.text,
        rainChance: targetDay?.daily_chance_of_rain || 0,
        high: Math.round(targetDay?.maxtemp_c !== undefined ? targetDay.maxtemp_c : curr.temp_c + 2),
        low: Math.round(targetDay?.mintemp_c !== undefined ? targetDay.mintemp_c : curr.temp_c - 4),
        wind: Math.round(
          isTomorrow
            ? (targetDay?.maxwind_kph ?? curr.wind_kph ?? 14)
            : (curr.wind_kph ?? targetDay?.maxwind_kph ?? 14)
        )
      };
    }

    // 7. Save assistant reply to MongoDB
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
        timestamp: botMsg.timestamp,
        createdAt: botMsg.createdAt
      },
      userMessage: {
        id: userMsg._id.toString(),
        _id: userMsg._id.toString(),
        userId: userMsg.userId.toString(),
        role: userMsg.role,
        content: userMsg.content,
        timestamp: userMsg.timestamp,
        createdAt: userMsg.createdAt
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

exports.deleteMessage = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid message ID' });
    }

    const targetMsg = await ChatHistory.findOne({ _id: id, userId });
    if (!targetMsg) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    const idsToDelete = [targetMsg._id];

    // If deleting a user prompt, also find and delete the immediate assistant response
    if (targetMsg.role === 'user') {
      const botResponse = await ChatHistory.findOne({
        userId,
        role: 'assistant',
        createdAt: { $gte: targetMsg.createdAt }
      }).sort({ createdAt: 1 });

      if (botResponse) {
        idsToDelete.push(botResponse._id);
      }
    }

    await ChatHistory.deleteMany({ _id: { $in: idsToDelete }, userId });

    res.json({
      success: true,
      message: 'Chat message deleted successfully',
      deletedIds: idsToDelete.map(i => i.toString())
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteMessages = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { messageIds } = req.body;

    if (!Array.isArray(messageIds) || messageIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Array of message IDs required' });
    }

    const validIds = messageIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid message IDs provided' });
    }

    const targetMsgs = await ChatHistory.find({ _id: { $in: validIds }, userId });
    const allIdsToDelete = new Set(targetMsgs.map(m => m._id.toString()));

    for (const msg of targetMsgs) {
      if (msg.role === 'user') {
        const botResponse = await ChatHistory.findOne({
          userId,
          role: 'assistant',
          createdAt: { $gte: msg.createdAt }
        }).sort({ createdAt: 1 });

        if (botResponse) {
          allIdsToDelete.add(botResponse._id.toString());
        }
      }
    }

    const deleteArray = Array.from(allIdsToDelete).map(id => new mongoose.Types.ObjectId(id));
    await ChatHistory.deleteMany({ _id: { $in: deleteArray }, userId });

    res.json({
      success: true,
      message: 'Selected chats deleted successfully',
      deletedIds: Array.from(allIdsToDelete)
    });
  } catch (err) {
    next(err);
  }
};
