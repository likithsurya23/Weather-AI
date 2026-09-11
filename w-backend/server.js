require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');

const authRouter = require('./routers/authRouter');
const weatherRouter = require('./routers/weatherRouter');
const favoritesRouter = require('./routers/favoritesRouter');
const alertsRouter = require('./routers/alertsRouter');
const chatRouter = require('./routers/chatRouter');
const userRouter = require('./routers/userRouter');

const app = express();
const PORT = process.env.PORT || 5000;

const clientUrl = process.env.Client_URL || process.env.CLIENT_URL;
const allowedOrigins = [
  clientUrl,
  'https://weather---ai.vercel.app',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
].filter(Boolean);

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || (typeof origin === 'string' && origin.endsWith('.vercel.app'))) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString().slice(11, 19)}] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'WeatherWise Backend Service',
    version: '1.0.0'
  });
});

// Mount Routes
app.use('/api/auth', authRouter);
app.use('/api/weather', weatherRouter);
app.use('/api/favorites', favoritesRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/chat', chatRouter);
app.use('/api/user', userRouter);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use(errorHandler);

// Start server
async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(` Server running on port ${PORT}`);
    console.log(` Local: http://localhost:${PORT}`);
  });
}

startServer();
