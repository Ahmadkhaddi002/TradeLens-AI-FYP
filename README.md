# 📈 TradeLens AI

> **An AI-powered full-stack trading analytics platform that connects to MetaTrader 5 (MT5) to help traders analyze performance, improve consistency, and make data-driven trading decisions.**

TradeLens AI combines real-time market data, advanced trading analytics, AI-generated insights, and community features into a single platform. It enables traders to monitor their trading performance, identify strengths and weaknesses, and receive intelligent recommendations to improve long-term profitability.


# ✨ Features

## 🔗 MT5 Connection

* Connect directly to live MetaTrader 5 accounts
* Python bridge for local MT5 terminal integration
* MetaApi cloud integration
* Automatic demo data fallback when MT5 is unavailable



## 📊 Trading Dashboard

Monitor your trading account in real time with:

* Account Balance
* Equity
* Floating Profit/Loss
* Win Rate
* Total Profit & Loss
* Live Market Quotes
* Equity Curve
* Performance by Trading Pair
* Account Statistics



## 📖 Trade Journal

A complete trading journal designed for detailed trade review.

Features include:

* Complete trade history
* Search and filtering
* Currency pair filtering
* Buy/Sell filtering
* Win/Loss filtering
* Pagination
* Expandable trade details



## 📈 Advanced Analytics

Gain deeper insights into your trading performance.

Analytics include:

* Monthly Performance
* Daily Performance
* Trading Session Analysis
* Win/Loss Distribution
* Pair Performance
* Drawdown Analysis
* R-Multiple Distribution
* Risk Analysis



## 🤖 AI Coach

TradeLens AI automatically analyzes your trading data and provides personalized coaching.

AI-powered metrics include:

* Win Rate
* Profit Factor
* Expectancy
* Sharpe Ratio
* Risk Score
* Psychology Score
* Trading Consistency
* Behavioral Analysis
* Personalized Improvement Tips
* "Should I Trade Today?" Recommendation



## 🎬 Trade Replay

Replay historical trades directly on candlestick charts.

Features:

* Playback Controls
* Adjustable Speed
* Trade Timeline
* Entry & Exit Visualization
* Historical Price Action



## 🌍 Community

Connect with other traders.

Features:

* Global Leaderboard
* Community Feed
* Trader Profiles
* Performance Rankings
* Trading Posts



## 💳 Subscription System

Multiple subscription plans:

* Free
* Pro
* Premium

Supported payment methods:

* Credit/Debit Cards
* Bank Transfer
* E-Wallets
* Cryptocurrency



# 🛠 Technology Stack

## Frontend

* React 19
* TypeScript
* Vite 7
* Tailwind CSS
* shadcn/ui
* Recharts
* Framer Motion

## Backend

* Node.js
* Express 4
* TypeScript
* WebSocket
* MetaApi REST API

## Python Bridge

* Python 3.8+
* Flask
* MetaTrader5 Python Package

---

# 📡 System Architecture


                    MetaTrader 5
                          │
                Python MT5 Bridge (Flask)
                          │
                ┌─────────┴─────────┐
                │                   │
         Express Backend      MetaApi Cloud
                │
         WebSocket API
                │
         React Frontend
                │
             End Users


# 🚀 Running the Project

## Frontend

```
Port: 3000
```

## Backend

```
Port: 4000
```

## Python Bridge

```
Port: 5001
```



# 📂 Project Structure

```
TradeLens-AI/

├── frontend/
├── backend/
├── python-bridge/
├── docs/
├── screenshots/
├── public/
├── README.md
├── LICENSE
└── .gitignore
```

---

# 🎯 Roadmap

### Phase 1

* Trading Dashboard
* Trade Journal
* MT5 Integration
* Analytics

### Phase 2

* AI Coach
* Trade Replay
* Community Features

### Phase 3

* Mobile Application
* Portfolio Tracking
* Advanced AI Recommendations
* Multi-Broker Support


# 📸 Screenshots

Screenshots and demo GIFs will be added as development progresses.


# 🔒 Disclaimer

TradeLens AI is an analytics and educational platform. It does **not** provide financial advice or guarantee trading results. Users remain fully responsible for their own trading decisions.


# 👨‍💻 Author

**Ahmad Ur Rahman**

Software Engineer• Full-Stack Developer • AI Engineering Enthusiast • Forex Trader



## ⭐ Support the Project

If you find this project useful, please consider giving it a **Star** on GitHub. Your support helps the project grow and motivates future development.
