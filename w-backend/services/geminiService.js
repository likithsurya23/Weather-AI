const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const PRIMARY_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
const CANDIDATE_MODELS = [PRIMARY_MODEL, 'gemini-3.5-flash-lite', 'gemini-3.7-flash'];

/**
 * Common cities list for quick regex detection
 */
const POPULAR_CITIES = [
  'London', 'Paris', 'Tokyo', 'Dubai', 'New York', 'Bengaluru', 'Bangalore',
  'Sydney', 'Mumbai', 'Delhi', 'Singapore', 'Berlin', 'Rome', 'Madrid',
  'Toronto', 'Chicago', 'San Francisco', 'Los Angeles', 'Miami', 'Seoul',
  'Amsterdam', 'Barcelona', 'Venice', 'Zurich', 'Vienna', 'Bangkok',
  'Istanbul', 'Kolkata', 'Chennai', 'Hyderabad', 'Beijing', 'Shanghai',
  'Cairo', 'Melbourne', 'Seattle', 'Boston', 'Austin', 'Vancouver'
];

/**
 * Detect cities mentioned in text or conversation history
 */
function extractCities(text = '') {
  if (!text) return [];
  const t = text.trim();
  const detected = [];

  // Check popular cities list
  for (const c of POPULAR_CITIES) {
    const cLower = c.toLowerCase();
    const regex = new RegExp(`\\b${cLower}\\b`, 'i');
    if (regex.test(t)) {
      const normalized = cLower === 'bangalore' ? 'Bengaluru' : c;
      if (!detected.includes(normalized)) {
        detected.push(normalized);
      }
    }
  }

  // Extract potential city names following prepositions: in/at/for/around/visit/visiting/to/near/of
  const prepRegex = /\b(?:in|at|for|around|visit|visiting|to|near|weather of|forecast of|compare)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/g;
  let match;
  while ((match = prepRegex.exec(t)) !== null) {
    const candidate = match[1].trim();
    const exclude = ['Today', 'Tomorrow', 'This', 'The', 'Next', 'Morning', 'Evening', 'Night', 'Winter', 'Summer', 'Spring', 'Fall', 'Autumn', 'WeatherWise', 'Globe', 'Radar', 'Alerts', 'Favorites'];
    if (!exclude.includes(candidate) && !detected.includes(candidate)) {
      detected.push(candidate);
    }
  }

  return detected;
}

/**
 * Format real-time weather data into a concise telemetry summary for Gemini
 */
function formatWeatherTelemetry(weatherData) {
  if (!weatherData || !weatherData.location || !weatherData.current) return null;

  const loc = weatherData.location;
  const curr = weatherData.current;
  const forecast = weatherData.forecast?.forecastday || [];
  const today = forecast[0]?.day;
  const tomorrow = forecast[1]?.day;

  let summary = `Location: ${loc.name}, Region/Country: ${loc.region ? loc.region + ', ' : ''}${loc.country}\n`;
  summary += `Current Conditions: ${curr.condition?.text || 'Clear'}, Temperature: ${Math.round(curr.temp_c)}°C (Feels like ${Math.round(curr.feelslike_c)}°C)\n`;
  summary += `Humidity: ${curr.humidity}%, Wind: ${Math.round(curr.wind_kph)} km/h (${curr.wind_dir}), Pressure: ${curr.pressure_mb} mb\n`;
  summary += `UV Index: ${curr.uv}, Precipitation: ${curr.precip_mm} mm\n`;

  if (curr.air_quality) {
    summary += `Air Quality: PM2.5: ${Math.round(curr.air_quality.pm2_5 || 0)}, PM10: ${Math.round(curr.air_quality.pm10 || 0)}\n`;
  }

  if (today) {
    summary += `Today's Forecast: High ${Math.round(today.maxtemp_c)}°C / Low ${Math.round(today.mintemp_c)}°C, Rain Chance: ${today.daily_chance_of_rain || 0}%, Condition: ${today.condition?.text}\n`;
  }

  if (tomorrow) {
    summary += `Tomorrow's Forecast: High ${Math.round(tomorrow.maxtemp_c)}°C / Low ${Math.round(tomorrow.mintemp_c)}°C, Rain Chance: ${tomorrow.daily_chance_of_rain || 0}%, Condition: ${tomorrow.condition?.text}\n`;
  }

  return summary;
}

/**
 * Complete application feature knowledge base for WeatherWise
 */
const APPLICATION_FEATURE_KNOWLEDGE = `
WEATHERWISE APPLICATION SPECIFICATION & COMPLETE FEATURE GUIDE:
You are the official AI Assistant & Meteorologist built directly into the WeatherWise (Weather-AI) platform.
You have comprehensive knowledge of every capability, screen, and feature available in WeatherWise:

1. 3D Realistic Weather Globe:
   - Built with Three.js & React Three Fiber (@react-three/fiber).
   - Features a photorealistic 3D Earth with atmospheric glow, dynamic cloud layers, interactive mouse/touch rotation, zoom, and clickable 3D city markers.
   - Clicking or hovering on city markers displays instant live temperatures and current weather conditions globally.

2. 2D Interactive Live Radar Map:
   - High-resolution interactive Leaflet map (react-leaflet).
   - Supports meteorological layer overlays: Precipitation radar, Temperature heatmaps, Wind speed vectors, and Cloud coverage.
   - Includes a one-click Expand/Fullscreen viewport toggle to inspect radar in detail.

3. Real-Time Atmospheric Dashboard:
   - Comprehensive telemetry: Current temperature, "Feels Like" temperature, humidity, atmospheric pressure (mb), dew point, visibility (km/mi), and UV index with safety ratings.
   - Air Quality Index (AQI): Detailed readings of PM2.5, PM10, Ozone (O3), Nitrogen Dioxide (NO2), Carbon Monoxide (CO), accompanied by EPA health categories (Good, Moderate, Unhealthy, etc.).
   - Astronomy Telemetry: Live tracking of sunrise, sunset, moonrise, moonset, and lunar phase progression.

4. Forecasting Horizons:
   - 24-Hour Interactive Hourly Slider: Scroll through the upcoming day to view hourly temperatures, precipitation likelihood, and conditions.
   - 7-Day Extended Forecast: Multi-day projection with high/low temperature curves, weather icons, and daily rain chance percentages.

5. Natural Hazards & Disaster Alert Feeds:
   - Real-time disaster intelligence integrated with NewsData.io and USGS/GDELT feeds.
   - Filterable categories: All, Earthquakes, Floods, Wildfires, Cyclones, Hurricanes, Tsunamis, Severe Storms, and Volcanic Activity.
   - Displays severity indicators (Danger, Warning, Threat, Advisory), event timestamps, impact summaries, and source links.

6. Location Management & Bookmarking (Saved Locations):
   - Global search autocomplete with instant geocoding for any city or region worldwide.
   - One-tap GPS Auto-Detect to instantly fetch local weather for your current position.
   - Bookmarking system to save frequently checked places categorized under custom tags ('Home', 'Work', 'Travel', 'Other').

7. Personalization & Settings:
   - Unit Toggling: Instant switch between Celsius (°C) and Fahrenheit (°F), and wind speed between km/h and mph via the navigation bar.
   - Multilingual Support: Complete UI translations for English, Hindi (हिन्दी), Kannada (ಕನ್ನಡ), Spanish (Español), and French (Français).
   - Theme Switching: Dark mode and Light mode featuring a modern glassmorphism aesthetic.
   - User Accounts: Secure stateless JWT authentication, user registration, login, profile management, and custom avatar customization.

8. AI Weather Consultation (Powered by Google Gemini):
   - You are this AI! You assist users with live weather analysis, clothing/attire recommendations, travel itineraries, storm safety guidance, and complete feature assistance for navigating WeatherWise.
`;

/**
 * Normalize language identifier from Settings (handles labels like 'Hindi (हिन्दी)', 'Japanese (日本語)')
 */
function normalizeLanguage(lang = 'English') {
  if (!lang) return { name: 'English', native: 'English', script: 'Latin' };
  const l = lang.toLowerCase();
  if (l.includes('hindi') || l.includes('हिन्दी')) {
    return { name: 'Hindi', native: 'हिन्दी', script: 'Devanagari script (हिन्दी)' };
  }
  if (l.includes('kannada') || l.includes('ಕನ್ನಡ')) {
    return { name: 'Kannada', native: 'ಕನ್ನಡ', script: 'Kannada script (ಕನ್ನಡ)' };
  }
  if (l.includes('spanish') || l.includes('español')) {
    return { name: 'Spanish', native: 'Español', script: 'Spanish' };
  }
  if (l.includes('french') || l.includes('français')) {
    return { name: 'French', native: 'Français', script: 'French' };
  }
  if (l.includes('german') || l.includes('deutsch')) {
    return { name: 'German', native: 'Deutsch', script: 'German' };
  }
  if (l.includes('japanese') || l.includes('日本語')) {
    return { name: 'Japanese', native: '日本語', script: 'Japanese (Kanji, Hiragana, and Katakana)' };
  }
  return { name: lang, native: lang, script: 'standard script' };
}

/**
 * Generate intelligent meteorological & application reply using Google Gemini API
 */
async function generateWeatherChatReply({
  userMessage,
  history = [],
  primaryWeather = null,
  secondaryWeather = null,
  language = 'English'
}) {
  const apiKey = process.env.GEMINI_API_KEY || GEMINI_API_KEY;

  if (!apiKey) {
    console.warn('[GeminiService]: No GEMINI_API_KEY set.');
    return null;
  }

  // Format past history turns for conversation context (limit to last 6 turns)
  const conversationContext = history.slice(-6).map(item => {
    return `${item.role === 'user' ? 'User' : 'Assistant'}: ${item.content}`;
  }).join('\n');

  // Format telemetry if available
  const primaryTelemetry = formatWeatherTelemetry(primaryWeather);
  const secondaryTelemetry = formatWeatherTelemetry(secondaryWeather);

  let telemetryBlock = 'None requested or needed for this query.';
  if (primaryTelemetry) {
    telemetryBlock = `Primary Location Live Telemetry:\n${primaryTelemetry}`;
  }
  if (secondaryTelemetry) {
    telemetryBlock += `\n\nSecondary Location Live Telemetry (for comparison):\n${secondaryTelemetry}`;
  }

  const langInfo = normalizeLanguage(language);
  const langDirective = langInfo.name !== 'English'
    ? `MANDATORY LANGUAGE: The user's active application language is "${language}" (${langInfo.name} / ${langInfo.native}). You MUST formulate your entire "reply" and all 3 "suggestions" strictly in ${langInfo.name} using ${langInfo.script}. DO NOT output English or any other language.`
    : `MANDATORY LANGUAGE: Output in clear, natural English.`;

  const promptText = `${APPLICATION_FEATURE_KNOWLEDGE}

OPERATING INSTRUCTIONS:
1. ${langDirective}
2. Answer ANY question asked by the user naturally, accurately, and conversationally:
   - If the user asks about ANY WeatherWise application feature (e.g. 3D globe, 2D radar, disaster alerts, saved locations, unit switching, languages, accounts), explain exactly how it works in the app with friendly, clear guidance.
   - If the user asks about live weather, forecast, rain chances, outfits, travel, or disaster safety, use the provided Live Telemetry to give expert, accurate meteorological advice.
   - If the user asks general questions or greetings, respond warmly and helpfully.
3. NO PREDEFINED OR CANNED ANSWERS. Formulate every response dynamically based on the exact user message, language, and context.
4. Keep the reply conversational, well-structured, and concise (typically 2 to 4 sentences). DO NOT use markdown headers (like # or ##) or markdown asterisks (like **bold** or *bullets*), as this text is rendered in clean chat bubbles.
5. Dynamically generate 3 RELEVANT, ORIGINAL follow-up prompt questions for the user to explore next. These suggestions MUST be tailored to the topic and strictly written in ${langInfo.name} (${langInfo.native}).
6. Set "showWeatherCard" to true ONLY if live weather telemetry was retrieved for a specific city mentioned or requested in the conversation. Set it to false if the user is asking about application features, general questions, or topics where a weather card is irrelevant.

Recent Conversation History:
${conversationContext || 'None'}

Live Meteorological Telemetry:
${telemetryBlock}

Current User Message:
"${userMessage}"

You MUST respond strictly in valid JSON matching this schema:
{
  "reply": "Your dynamically generated response in ${langInfo.name} (${langInfo.native})",
  "showWeatherCard": true or false,
  "suggestions": [
    "Contextual follow-up question 1 in ${langInfo.name} (${langInfo.native})",
    "Contextual follow-up question 2 in ${langInfo.name} (${langInfo.native})",
    "Contextual follow-up question 3 in ${langInfo.name} (${langInfo.native})"
  ]
}`;

  // Try candidate models in order for maximum availability and resilience
  for (const model of CANDIDATE_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: promptText }]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.7,
            maxOutputTokens: 2048
          }
        }),
        signal: AbortSignal.timeout(12000)
      });

      if (!response.ok) {
        const errBody = await response.text();
        console.warn(`[GeminiService Warning on ${model}] HTTP ${response.status}:`, errBody.slice(0, 150));
        continue; // Try next model candidate
      }

      const data = await response.json();
      const parts = data?.candidates?.[0]?.content?.parts || [];
      let fullText = '';
      for (const p of parts) {
        if (p.text) fullText += p.text;
      }

      if (!fullText.trim()) {
        continue;
      }

      const cleanedText = fullText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      const parsed = JSON.parse(cleanedText);

      return {
        reply: parsed.reply?.trim() || '',
        showWeatherCard: Boolean(parsed.showWeatherCard),
        suggestions: Array.isArray(parsed.suggestions) && parsed.suggestions.length > 0
          ? parsed.suggestions.slice(0, 3)
          : []
      };
    } catch (error) {
      console.warn(`[GeminiService Warning on ${model}]:`, error.message);
    }
  }

  return null;
}

module.exports = {
  extractCities,
  formatWeatherTelemetry,
  generateWeatherChatReply,
  normalizeLanguage
};
