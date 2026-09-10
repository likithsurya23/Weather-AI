# WeatherWise (Weather-AI)

<div align="center">

![WeatherWise Logo](https://img.shields.io/badge/Weather-Wise-blue?style=for-the-badge&logo=cloud)
[![Next.js](https://img.shields.io/badge/Next.js-16.3.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express_5-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-forestgreen?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL_Globe-black?style=for-the-badge&logo=three.js)](https://threejs.org/)

**Stay Informed. Stay Safer.**  
A modern, AI-powered atmospheric intelligence platform providing real-time weather telemetry, natural disaster news feeds, 3D interactive satellite globes, and proactive meteorological AI consultations.

[Key Features](#key-features) • [Tech Stack](#tech-stack) • [Architecture](#architecture) • [Getting Started](#getting-started) • [Environment Variables](#environment-variables) • [API Reference](#api-reference) • [Project Structure](#project-structure)

</div>

---

## 🌟 Key Features

### 1. 🌦️ Real-Time Atmospheric Telemetry
* **Hyperlocal Current Weather**: Temperature, feels-like, wind speed & direction, pressure, humidity, dew point, visibility, and UV index.
* **Forecast Horizons**: Detailed 24-hour hourly slider and comprehensive 7-day extended forecasts.
* **Air Quality Index (AQI)**: Breakdown of PM2.5, PM10, Ozone ($O_3$), Nitrogen Dioxide ($NO_2$), and Carbon Monoxide ($CO$) with health safety ratings.
* **Sun & Moon Telemetry**: Astronomical tracking of sunrise, sunset, moonrise, moonset, and lunar phase progression.

### 2. 🚨 Natural Hazard & Disaster Alert Feeds
* **Live Severe Weather Advisories**: Integration with meteorological emergency broadcasts for cyclones, blizzards, heatwaves, and storms.
* **Categorized Hazard News**: Live crisis news for Wildfires, Floods, Earthquakes, and Severe Storms powered by NewsData.io.
* **Filter & Search**: Filter disaster bulletins by category (`All`, `Earthquake`, `Flood`, `Wildfire`, `Storm`) with responsive hamburger navigation on mobile.

### 3. 🤖 AI Weather Consultation Chatbot
* **Natural Language Queries**: Ask context-aware questions such as *"Is it safe to drive to Seattle tonight?"* or *"What should I pack for Tokyo this weekend?"*.
* **Atmospheric Safety Analysis**: Generates proactive travel advisories, flight disruption alerts, and protective health recommendations.
* **Persistent History**: Chat consultation sessions automatically saved to MongoDB per user.

### 4. 🌍 3D Realistic Weather Globe & 2D Live Radar
* **Interactive 3D WebGL Globe**: Built with Three.js and React Three Fiber featuring realistic atmospheric glow, city markers, and real-time place tooltips.
* **2D Live Radar Map**: High-resolution interactive Leaflet radar supporting Temperature, Precipitation, Wind Speed, and Cloud Coverage tile layers.
* **Expandable Viewport**: Smooth one-click toggle between compact mode and expansive elaborate full-screen inspection.

### 5. 📍 Location Management & Bookmarking
* **Favorites System**: Bookmark cities organized under custom tags (`Home`, `Work`, `Travel`, `Other`).
* **Instant City Autocomplete**: Fast geocoding and location search with regional administrative disambiguation.
* **GPS Auto-Detect**: One-tap browser geolocation to fetch local telemetry instantly.

### 6. 📱 Responsive & Mobile-First Design
* **Optimized Mobile Views**: Specialized high-density card layouts, compact dialogs, bottom navigation bars, and mobile drawers designed specifically for `< 640px` screens.
* **Glassmorphism UI**: High-contrast, accessibility-tested dark/light theme switching with smooth transitions.

---

## 🛠️ Tech Stack

### Frontend (`w-frontend`)
| Technology | Description |
| :--- | :--- |
| **Next.js 16 (App Router)** | Server & client hybrid framework with Turbopack compilation |
| **React 19** | Modern declarative UI component library |
| **Tailwind CSS v4** | Utility-first styling with modern CSS variables |
| **Three.js & @react-three/fiber** | WebGL 3D photorealistic globe rendering |
| **Leaflet & React-Leaflet** | Interactive 2D satellite and meteorological radar maps |
| **Lucide React** | Consistent, modern icon system |
| **Motion** | Fluid micro-interactions and smooth layout transitions |

### Backend (`w-backend`)
| Technology | Description |
| :--- | :--- |
| **Node.js & Express 5** | REST API server with modular routing and global error handling |
| **MongoDB & Mongoose 9** | Cloud database persistence with structured data schemas |
| **JWT & bcryptjs** | Secure stateless authentication and salted password hashing |
| **CORS & Dotenv** | Cross-origin resource sharing and environment management |

---

## 🏗️ Architecture

```mermaid
graph TD
    A[Client Browser / Mobile PWA] -->|HTTPS Requests| B[Next.js 16 Frontend :3000]
    B -->|REST API / Bearer JWT| C[Express 5 Backend :5000]
    C -->|Mongoose ODM| D[(MongoDB Atlas Database)]
    C -->|Meteorological Telemetry| E[WeatherAPI.com]
    C -->|Disaster Feeds| F[NewsData.io API]
    C -->|Natural Hazard Data| G[USGS & GDELT Feeds]
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: `v18.0.0` or higher
* **npm** or **yarn** / **pnpm**
* **MongoDB**: A free MongoDB Atlas cluster URI or local MongoDB instance

---

### 1. Clone the Repository
```bash
git clone https://github.com/likithsurya23/Weather-AI.git
cd Weather-AI
```

---

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd w-backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `w-backend` directory:
   ```env
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret_key
   WEATHER_API_KEY=your_weatherapi_key
   NEWSDATA_API_KEY=your_newsdata_api_key
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/weatherai?retryWrites=true&w=majority
   ```
4. Start the backend server:
   ```bash
   npm start
   ```
   *The server will run at `http://localhost:5000` with connected MongoDB status.*

---

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd w-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the `w-frontend` directory:
   ```env
   NEXT_PUBLIC_API_BASE=http://localhost:5000/api
   NEXT_PUBLIC_WEATHER_API_KEY=your_weatherapi_key
   NEXT_PUBLIC_NEWSDATA_API_KEY=your_newsdata_api_key
   ```
4. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   *The frontend will launch at `http://localhost:3000`.*

---

## 🔐 Environment Variables

### Backend (`w-backend/.env`)
| Variable | Description | Required |
| :--- | :--- | :---: |
| `PORT` | Port for Express server (default: `5000`) | No |
| `NODE_ENV` | Environment mode (`development` / `production`) | No |
| `JWT_SECRET` | Secret key for signing and verifying JWT tokens | **Yes** |
| `MONGODB_URI` | MongoDB connection string (Atlas or local) | **Yes** |
| `WEATHER_API_KEY` | API key from [WeatherAPI.com](https://www.weatherapi.com/) | **Yes** |
| `NEWSDATA_API_KEY` | API key from [NewsData.io](https://newsdata.io/) | **Yes** |

### Frontend (`w-frontend/.env.local`)
| Variable | Description | Required |
| :--- | :--- | :---: |
| `NEXT_PUBLIC_API_BASE` | Base URL of the backend API (`http://localhost:5000/api`) | **Yes** |
| `NEXT_PUBLIC_WEATHER_API_KEY` | WeatherAPI public key for direct client utilities | **Yes** |
| `NEXT_PUBLIC_NEWSDATA_API_KEY` | NewsData key for client-side fallbacks | No |

---

## 📡 API Reference

### Health Check
* `GET /api/health` — Checks API service status and uptime.

### Authentication (`/api/auth`)
* `POST /api/auth/register` — Register a new account (`name`, `email`, `password`).
* `POST /api/auth/login` — Authenticate and receive a JWT token.
* `GET /api/auth/me` — Retrieve current authenticated user profile *(Requires Bearer Token)*.

### Weather Telemetry (`/api/weather`)
* `GET /api/weather/current?city={cityName}` — Real-time atmospheric metrics.
* `GET /api/weather/forecast?city={cityName}&days=7` — Extended hourly and 7-day forecast.
* `GET /api/weather/search?q={query}` — Location autocomplete and geocoding search.

### Favorites (`/api/favorites`)
* `GET /api/favorites` — Fetch all bookmarked locations for the authenticated user.
* `POST /api/favorites` — Save a new location bookmark with optional category tag.
* `DELETE /api/favorites/:id` — Remove a bookmarked location.

### Alerts & Disaster News (`/api/alerts`)
* `GET /api/alerts` — Fetch active weather alerts and disaster news feed.

### AI Chatbot (`/api/chat`)
* `POST /api/chat/ask` — Submit a question to the Weather AI consultant.
* `GET /api/chat/history` — Retrieve past chat consultation history for the user.
* `DELETE /api/chat/history` — Clear consultation history.

### User Settings & Profile (`/api/user`)
* `PUT /api/user/profile` — Update user name, email, or avatar.
* `PUT /api/user/preferences` — Save notification and location preferences.
* `DELETE /api/user/account` — Permanently delete user account and associated data.

---

## 📂 Project Structure

```text
Weather-AI/
├── w-backend/                  # Express.js Backend Service
│   ├── config/                 # Database & environment configurations
│   │   └── db.js               # MongoDB connection handler
│   ├── controller/             # Business logic controllers
│   │   ├── alertsController.js
│   │   ├── authController.js
│   │   ├── chatController.js
│   │   ├── favoritesController.js
│   │   ├── newsController.js
│   │   └── userController.js
│   ├── middleware/             # Express middlewares (JWT Auth, Error handler)
│   │   ├── authMiddleware.js
│   │   └── errorHandler.js
│   ├── models/                 # Mongoose schemas
│   │   ├── Alert.js
│   │   ├── ChatHistory.js
│   │   ├── Favorite.js
│   │   └── User.js
│   ├── routers/                # Express API routes
│   │   ├── alertsRouter.js
│   │   ├── authRouter.js
│   │   ├── chatRouter.js
│   │   ├── favoritesRouter.js
│   │   ├── userRouter.js
│   │   └── weatherRouter.js
│   ├── services/               # Internal service utilities
│   │   └── authService.js
│   ├── package.json
│   └── server.js               # Application entry point
│
├── w-frontend/                 # Next.js 16 Frontend App
│   ├── app/                    # App Router Pages
│   │   ├── alerts/             # Disaster & severe weather news
│   │   ├── chat/               # Weather AI Chat assistant
│   │   ├── dashboard/          # Comprehensive weather dashboard
│   │   ├── favorites/          # Saved cities & categories
│   │   ├── login/              # Authentication login screen
│   │   ├── map/                # 3D Globe & 2D Live Radar viewer
│   │   ├── profile/            # User profile & account security
│   │   ├── search/             # Global location search
│   │   ├── settings/           # Location, notification, language settings
│   │   ├── signup/             # Account creation screen
│   │   ├── layout.jsx          # Root layout with providers
│   │   └── page.jsx            # Public landing page
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/           # ProtectedRoute wrapper
│   │   │   ├── chat/           # Chatbot message views
│   │   │   ├── layout/         # TopNavbar, Sidebar, PublicNavbar
│   │   │   ├── map/            # WeatherGlobe, WeatherMapViewer, LeafletMap
│   │   │   └── ui/             # 3D-globe WebGL canvas & UI primitives
│   │   ├── Hooks/
│   │   │   └── useAppContext.jsx # Global state, auth, language, weather context
│   │   └── lib/
│   │       ├── api.js          # API client with token management
│   │       └── weatherUtils.js # Meteorological units and formatters
│   ├── package.json
│   └── next.config.mjs
│
└── README.md                   # Root Project Documentation
```

---

## 🛡️ License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
Made with ❤️ for atmospheric intelligence & public disaster safety.
</div>