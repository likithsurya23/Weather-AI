const bcrypt = require('bcryptjs');

// In-Memory Data Store (seed data matching wireframe screens)
const users = [
  {
    id: 'usr_default_1',
    name: 'Likith D',
    email: 'likith@example.com',
    passwordHash: bcrypt.hashSync('password123', 8),
    avatar: 'L',
    preferences: {
      temperatureUnit: 'celsius', // 'celsius' or 'fahrenheit'
      language: 'English',
      theme: 'system', // 'light', 'dark', 'system'
      weatherAlerts: true,
      weeklySummary: true,
      marketingUpdates: false,
      autoDetectLocation: true
    },
    createdAt: new Date().toISOString()
  }
];

const favorites = [];

const alerts = [
  {
    id: 'alt_1',
    title: 'Heavy Rain Alert',
    location: 'Bengaluru, India',
    severity: 'danger', // 'danger', 'warning', 'info'
    description: 'Heavy rainfall is expected in the next 3 hours with potential water logging.',
    timestamp: '9 Sep 2026, 8:30 AM',
    active: true
  },
  {
    id: 'alt_2',
    title: 'High Temperature Warning',
    location: 'Dubai, UAE',
    severity: 'warning',
    description: 'Temperatures are expected to exceed 40°C tomorrow. Stay hydrated and avoid outdoor activity at noon.',
    timestamp: '8 Sep 2026, 6:00 PM',
    active: true
  },
  {
    id: 'alt_3',
    title: 'Strong Wind Advisory',
    location: 'London, United Kingdom',
    severity: 'info',
    description: 'Strong winds expected (up to 50 km/h) tonight into tomorrow morning.',
    timestamp: '8 Sep 2026, 4:15 PM',
    active: true
  }
];

const chatHistories = [
  {
    id: 'chat_seed_1',
    userId: 'usr_default_1',
    role: 'assistant',
    content: "Hi! I'm your WeatherWise assistant. You can ask me anything about weather, travel plans, or get recommendations.",
    timestamp: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'chat_seed_2',
    userId: 'usr_default_1',
    role: 'user',
    content: "Will it rain in London tomorrow?",
    timestamp: new Date(Date.now() - 3500000).toISOString()
  },
  {
    id: 'chat_seed_3',
    userId: 'usr_default_1',
    role: 'assistant',
    content: "There is a 70% chance of rain in London tomorrow. Temperatures will be around 18°C with light rain showers throughout the day. I recommend carrying an umbrella!",
    card: {
      city: "London",
      country: "UK",
      date: "Tue, 10 Sep 2026",
      temp: 18,
      condition: "Light Rain",
      rainChance: 70
    },
    timestamp: new Date(Date.now() - 3400000).toISOString()
  }
];

module.exports = {
  users,
  favorites,
  alerts,
  chatHistories
};
