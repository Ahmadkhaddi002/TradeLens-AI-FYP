import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import mt5Router from './routes/mt5.js';
import paymentRouter from './routes/payment.js';
import authRouter from './routes/auth.js';
import { generateQuotes } from './services/mt5/liveQuotes.js';
import { registerOnLeaderboard, getLeaderboard, LeaderboardEntry } from './services/leaderboard.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'] }));
app.use(express.json());

app.use('/api/mt5', mt5Router);
app.use('/api/payment', paymentRouter);
app.use('/api/auth', authRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/economic-calendar', (_req, res) => {
  const events = [
    { time: '08:30', currency: 'USD', event: 'Non-Farm Payrolls', impact: 'high', actual: '185K', forecast: '175K', previous: '162K', date: new Date().toISOString().slice(0, 10) },
    { time: '10:00', currency: 'EUR', event: 'ECB Interest Rate Decision', impact: 'high', actual: '4.5%', forecast: '4.5%', previous: '4.5%', date: new Date().toISOString().slice(0, 10) },
    { time: '14:00', currency: 'USD', event: 'ISM Manufacturing PMI', impact: 'medium', actual: '49.2', forecast: '48.5', previous: '47.9', date: new Date().toISOString().slice(0, 10) },
    { time: '02:00', currency: 'AUD', event: 'RBA Meeting Minutes', impact: 'medium', actual: '-', forecast: '-', previous: '-', date: new Date().toISOString().slice(0, 10) },
    { time: '04:30', currency: 'JPY', event: 'Industrial Production m/m', impact: 'low', actual: '1.2%', forecast: '0.8%', previous: '-0.3%', date: new Date().toISOString().slice(0, 10) },
    { time: '09:00', currency: 'GBP', event: 'GDP m/m', impact: 'high', actual: '-0.1%', forecast: '0.1%', previous: '0.2%', date: new Date().toISOString().slice(0, 10) },
    { time: '13:30', currency: 'CAD', event: 'Employment Change', impact: 'high', actual: '15.2K', forecast: '20.0K', previous: '25.1K', date: new Date().toISOString().slice(0, 10) },
    { time: '16:00', currency: 'USD', event: 'Crude Oil Inventories', impact: 'medium', actual: '-2.1M', forecast: '-1.5M', previous: '-3.2M', date: new Date().toISOString().slice(0, 10) },
    { time: '21:45', currency: 'NZD', event: 'CPI q/q', impact: 'high', actual: '0.6%', forecast: '0.5%', previous: '0.4%', date: new Date().toISOString().slice(0, 10) },
    { time: '07:00', currency: 'EUR', event: 'German CPI m/m', impact: 'medium', actual: '0.3%', forecast: '0.2%', previous: '0.1%', date: new Date().toISOString().slice(0, 10) },
  ];
  res.json(events);
});

app.get('/api/leaderboard', (_req, res) => {
  res.json(getLeaderboard());
});

app.post('/api/leaderboard/register', (req, res) => {
  const { name, email, avatar, loginId, server, broker, balance, equity, winRate, profitFactor, totalReturn, consistency, trades } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  registerOnLeaderboard({ name, email, avatar, loginId, server, broker, balance, equity, winRate, profitFactor, totalReturn, consistency, trades });
  res.json({ success: true });
});

const communityPosts: any[] = [];
let nextPostId = 1;

app.get('/api/community/posts', (_req, res) => {
  res.json(communityPosts);
});

app.post('/api/community/posts', (req, res) => {
  const { author, content, authorEmail } = req.body;
  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }
  const newPost = {
    id: nextPostId++,
    author: author || 'Anonymous',
    avatar: (author || 'An').slice(0, 2).toUpperCase(),
    time: 'just now',
    content,
    trade: null,
    likes: 0,
    comments: 0,
    liked: false,
    authorEmail: authorEmail || null,
  };
  communityPosts.unshift(newPost);
  res.status(201).json(newPost);
});

app.get('/api/community/trending', (_req, res) => {
  // Only trending from real connected users
  res.json([]);
});

app.get('/', (_req, res) => {
  res.send(`<!DOCTYPE html><html><head><title>TradeLens Server</title><style>body{background:#050507;color:#f8fafc;font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;margin:0}div{text-align:center}h1{font-size:2rem;margin-bottom:0.5rem;background:linear-gradient(135deg,#06b6d4,#3b82f6);-webkit-background-clip:text;-webkit-text-fill-color:transparent}p{color:#94a3b8}code{background:#1a1a24;padding:2px 6px;border-radius:4px;color:#06b6d4}</style></head><body><div><h1>TradeLens AI Server</h1><p>Server is running on port ${process.env.PORT || '4000'}</p><p>API: <code>/api</code> &middot; WebSocket: <code>/ws</code></p></div></body></html>`);
});

wss.on('connection', (ws: WebSocket) => {
  console.log('Client connected to WebSocket');

  const quoteInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'quotes',
        data: generateQuotes(),
        timestamp: new Date().toISOString(),
      }));
    }
  }, 2000);

  ws.on('message', (message) => {
    try {
      const parsed = JSON.parse(message.toString());
      if (parsed.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong' }));
      }
    } catch {
      // ignore invalid messages
    }
  });

  ws.on('close', () => {
    clearInterval(quoteInterval);
    console.log('Client disconnected from WebSocket');
  });

  ws.on('error', () => {
    clearInterval(quoteInterval);
  });
});

const PORT = parseInt(process.env.PORT || '4000');
server.listen(PORT, () => {
  console.log(`\n  ✓ TradeLens Server running on http://localhost:${PORT}`);
  console.log(`  ✓ API:       http://localhost:${PORT}/api`);
  console.log(`  ✓ WebSocket: ws://localhost:${PORT}/ws (auto-proxied via Vite on :3000)\n`);
});

export default app;
