# TradeLens AI — Technology Stack & Structure

## 1. Frontend — TypeScript / React 19

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Language | TypeScript 5.9 | Type-safe JavaScript |
| Framework | React 19.2 | UI components |
| Build tool | Vite 7.2 | Dev server & bundler |
| Routing | React Router v7 | Page navigation |
| Styling | Tailwind CSS 3.4 | Utility-first CSS |
| UI library | shadcn/ui (Radix primitives) | Prebuilt accessible components |
| Animation | Framer Motion 12 | Page & component transitions |
| Charts | Recharts 2.15 | Equity curve, bar/pie charts |
| Icons | Lucide React 0.562 | SVG icon set |
| Theme | next-themes 0.4 | Dark/light mode |
| Forms | react-hook-form 7.70 + zod 4.3 | Form validation |
| Notifications | sonner 2.0 | Toast notifications |
| Date handling | date-fns 4.1 | Date formatting |
| Carousel | embla-carousel-react 8.6 | Testimonials carousel |
| Class merging | tailwind-merge + clsx | Conditional class names |

### Frontend Structure (`src/`)
```
src/
├── main.tsx                # App entry point
├── App.tsx                 # Route definitions
├── index.css               # Tailwind + global styles
├── components/
│   ├── ui/                 # 53 shadcn/ui primitives
│   ├── AppLayout.tsx       # Sidebar + topnav wrapper
│   ├── Sidebar.tsx         # Navigation sidebar
│   ├── TopNav.tsx          # Top navigation bar
│   ├── MT5Status.tsx       # MT5 connection status bar
│   ├── StatCard.tsx        # KPI metric card
│   ├── GlassCard.tsx       # Glassmorphism container
│   ├── SectionHeader.tsx   # Reusable section title
│   ├── GradientMesh.tsx    # Background gradient effect
│   ├── ParticleNetwork.tsx # Animated particle bg
│   ├── AIInsightCard.tsx   # AI Coach insight card
│   ├── MetricPill.tsx      # Small metric badge
│   ├── DepositModal.tsx    # Deposit dialog
│   ├── WithdrawModal.tsx   # Withdrawal dialog
│   ├── SubscriptionModal.tsx
│   └── PaymentMethods.tsx  # Payment method grid
├── context/
│   ├── AuthContext.tsx      # Auth state + API calls
│   └── MT5Context.tsx       # MT5 connection + trade data
├── hooks/
│   ├── useCountUp.ts       # Animated number counter
│   └── use-mobile.ts       # Mobile detection
├── pages/                  # 15 route pages
│   ├── Landing.tsx         # Public landing page
│   ├── Login.tsx / Signup.tsx
│   ├── MT5Connect.tsx      # MT5 credential form
│   ├── Dashboard.tsx       # Main KPI dashboard
│   ├── TradeJournal.tsx    # Trade history table
│   ├── Analytics.tsx       # Charts & performance
│   ├── AICoach.tsx         # AI analysis & insights
│   ├── TradeReplay.tsx     # Trade replay simulation
│   ├── EconomicCalendar.tsx / CalendarJournal.tsx
│   ├── Leaderboard.tsx     # Trader rankings
│   ├── Community.tsx       # Social feed
│   ├── Pricing.tsx         # Subscription plans
│   └── Settings.tsx        # Profile, security, display
├── data/
│   └── mockData.ts         # Static demo data for Landing/Pricing
└── lib/
    └── utils.ts            # cn() helper
```

---

## 2. Backend — TypeScript / Node.js (Express)

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Language | TypeScript 5.6 | Server-side code |
| Runtime | Node.js 22 | JavaScript runtime |
| Framework | Express 4.21 | HTTP server & routing |
| Runner | tsx 4.19 | TypeScript execution (watch mode) |
| WebSocket | ws 8.18 | Live quote streaming |
| CORS | cors 2.8 | Cross-origin requests |
| UUID | uuid 10.0 | Unique ID generation |
| Env vars | dotenv 16.4 | .env file loading |

### Backend Structure (`server/src/`)
```
server/src/
├── index.ts                  # Server entry (Express + WebSocket)
├── config.ts                 # MetaApi tokens
├── routes/
│   ├── mt5.ts                # /api/mt5/* — connect, full-data, analyze
│   ├── auth.ts               # /api/auth/* — signup, login, profile
│   └── payment.ts            # /api/payment/* — deposits, withdrawals
├── services/
│   ├── mt5/
│   │   ├── index.ts          # Re-exports all MT5 services
│   │   ├── pythonBridge.ts   # HTTP client to Python bridge
│   │   ├── connector.ts      # Demo data generator (fallback)
│   │   ├── metaapi.ts        # MetaApi cloud REST client
│   │   ├── validator.ts      # Broker server validation
│   │   ├── analyzer.ts       # Trade analysis engine
│   │   └── liveQuotes.ts     # Simulated real-time quotes
│   ├── leaderboard.ts        # In-memory leaderboard
│   └── payment/
│       └── provider.ts       # Payment/subscription logic
└── types/
    └── index.ts              # Shared TypeScript interfaces
```

### Data Flow
```
Frontend (React :3000)
    ↓ fetch() to /api/*
Backend (Express :4000)
    ↓ HTTP POST
Python Bridge (Flask :5001)
    ↓ mt5 python API
MetaTrader 5 Desktop Terminal
    ↓ TCP/IP
Broker Server (Exness)
```

---

## 3. Python Bridge — Python / Flask

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Language | Python 3.8 | Bridge service |
| Framework | Flask 3.0 | HTTP API server |
| MT5 API | MetaTrader5 5.0.45 | Connect to MT5 terminal |
| CORS | flask-cors 4.0 | Cross-origin support |

### File
```
server/python/
└── mt5_bridge.py     # Flask server on :5001
```

### Python Bridge Endpoints
| Method | Route | Purpose |
|--------|-------|---------|
| GET | /health | Connection status, account info |
| POST | /connect | Return account details |
| POST | /full-data | Account + positions + trades |

### Connection Priority (fallback chain)
```
1. Python Bridge (local MT5 terminal)   ← PRIMARY
2. MetaApi Cloud (if tokens configured)  ← FALLBACK
3. Demo Data Generator (in-memory)      ← LAST RESORT
```

---

## 4. DevOps & Configuration

| Tool | File | Purpose |
|------|------|---------|
| ESLint | `eslint.config.js` | Code linting |
| PostCSS | `postcss.config.js` | CSS processing |
| Tailwind | `tailwind.config.js` | Theme customization |
| TypeScript | `tsconfig.json` (app + node + server) | Compiler options |
| Git | `.gitignore` | Ignored files |
| Env | `.env` (root + server) | Environment variables |

---

## 5. All Languages & Technologies (Summary)

| # | Language / Technology | Role | Where |
|---|---------------------|------|-------|
| 1 | **TypeScript** 5.9 / 5.6 | Frontend + Backend logic | `src/` + `server/src/` |
| 2 | **React** 19 | UI framework | `src/` |
| 3 | **Vite** 7 | Build & dev server | `vite.config.ts` |
| 4 | **Tailwind CSS** 3 | Styling | `src/` + config |
| 5 | **shadcn/ui** (Radix) | UI component library | `src/components/ui/` |
| 6 | **Framer Motion** 12 | Animations | `src/pages/`, `src/components/` |
| 7 | **Recharts** 2 | Charts | `Dashboard`, `Analytics` |
| 8 | **Lucide React** | Icons | Throughout frontend |
| 9 | **Node.js** 22 | JavaScript runtime | `server/` |
| 10 | **Express** 4 | HTTP server | `server/src/index.ts` |
| 11 | **WebSocket** (ws) | Live quotes | `server/src/index.ts` |
| 12 | **Python** 3.8 | Bridge service | `server/python/` |
| 13 | **Flask** 3 | Python HTTP server | `server/python/mt5_bridge.py` |
| 14 | **MetaTrader5** Python | MT5 terminal API | `server/python/mt5_bridge.py` |
| 15 | **MetaApi** (REST) | Cloud MT5 fallback | `server/src/services/mt5/metaapi.ts` |
| 16 | **HTML** / **CSS** | Markup & styles | `index.html`, `src/` |

---

## 6. Ports & URLs

| Service | Port | URL |
|---------|------|-----|
| Frontend (Vite) | 3000 | http://localhost:3000 |
| Backend (Express) | 4000 | http://localhost:4000 |
| Python Bridge | 5001 | http://localhost:5001 |
| WebSocket | 4000 | ws://localhost:4000/ws |
