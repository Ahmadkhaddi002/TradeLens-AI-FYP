// Equity curve data (30 days)
export const equityCurveData = Array.from({ length: 30 }, (_, i) => {
  const base = 22000;
  const growth = Math.sin(i * 0.3) * 800 + i * 120 + Math.random() * 400;
  return {
    date: `Jan ${i + 1}`,
    balance: Math.round((base + growth) * 100) / 100,
  };
});

// Performance by pair
export const pairPerformance = [
  { pair: 'EURUSD', netPnL: 1247, trades: 45, winRate: 62, avgWin: 89, avgLoss: -42, profitFactor: 2.14 },
  { pair: 'GBPUSD', netPnL: 892, trades: 38, winRate: 58, avgWin: 76, avgLoss: -38, profitFactor: 1.89 },
  { pair: 'USDJPY', netPnL: -234, trades: 32, winRate: 44, avgWin: 52, avgLoss: -48, profitFactor: 0.89 },
  { pair: 'XAUUSD', netPnL: 1567, trades: 28, winRate: 61, avgWin: 142, avgLoss: -67, profitFactor: 2.34 },
  { pair: 'US30', netPnL: 445, trades: 15, winRate: 60, avgWin: 98, avgLoss: -52, profitFactor: 1.88 },
  { pair: 'AUDUSD', netPnL: 312, trades: 22, winRate: 55, avgWin: 54, avgLoss: -35, profitFactor: 1.54 },
  { pair: 'USDCAD', netPnL: -89, trades: 18, winRate: 50, avgWin: 41, avgLoss: -39, profitFactor: 1.05 },
];

// Recent trades
export const recentTrades = [
  { id: 1, time: '2h ago', pair: 'EURUSD', type: 'Buy', entry: 1.0845, exit: 1.0867, lots: 0.5, pnl: 110, rr: '1:2.1', session: 'London', tags: ['follow-plan'], notes: 'Clean London breakout setup' },
  { id: 2, time: '5h ago', pair: 'GBPUSD', type: 'Sell', entry: 1.2634, exit: 1.2612, lots: 0.3, pnl: 66, rr: '1:1.8', session: 'NY', tags: ['follow-plan'], notes: 'NY session continuation' },
  { id: 3, time: 'Yesterday', pair: 'XAUUSD', type: 'Buy', entry: 2034.5, exit: 2028.3, lots: 0.2, pnl: -124, rr: '1:0.8', session: 'Asia', tags: ['revenge-trade'], notes: 'Entered without clear signal after previous loss' },
  { id: 4, time: 'Yesterday', pair: 'US30', type: 'Sell', entry: 38456, exit: 38312, lots: 0.15, pnl: 216, rr: '1:2.4', session: 'London', tags: ['follow-plan'], notes: 'Perfect supply zone rejection' },
  { id: 5, time: 'Jan 13', pair: 'USDJPY', type: 'Buy', entry: 148.32, exit: 147.89, lots: 0.4, pnl: -172, rr: '1:0.6', session: 'Asia', tags: ['early-exit'], notes: 'Stopped out, moved SL too tight' },
  { id: 6, time: 'Jan 13', pair: 'EURUSD', type: 'Sell', entry: 1.0892, exit: 1.0861, lots: 0.3, pnl: 93, rr: '1:2.0', session: 'NY', tags: ['follow-plan'], notes: '' },
  { id: 7, time: 'Jan 12', pair: 'XAUUSD', type: 'Buy', entry: 2028.1, exit: 2045.6, lots: 0.25, pnl: 437, rr: '1:3.2', session: 'London', tags: ['follow-plan', 'big-winner'], notes: 'Major support hold, added on pullback' },
  { id: 8, time: 'Jan 12', pair: 'GBPUSD', type: 'Buy', entry: 1.2589, exit: 1.2612, lots: 0.2, pnl: 46, rr: '1:1.5', session: 'London', tags: ['follow-plan'], notes: '' },
  { id: 9, time: 'Jan 11', pair: 'AUDUSD', type: 'Sell', entry: 0.6543, exit: 0.6521, lots: 0.3, pnl: 66, rr: '1:1.8', session: 'Asian', tags: ['follow-plan'], notes: '' },
  { id: 10, time: 'Jan 11', pair: 'USDCAD', type: 'Buy', entry: 1.3542, exit: 1.3528, lots: 0.25, pnl: -35, rr: '1:0.9', session: 'NY', tags: ['early-exit'], notes: 'Exited early due to news' },
];

// Full trade journal data (50 trades)
export const tradeJournalData = Array.from({ length: 50 }, (_, i) => {
  const pairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD', 'US30', 'AUDUSD', 'USDCAD'];
  const types = ['Buy', 'Sell'];
  const sessions = ['Asian', 'London', 'London-NY', 'NY'];
  const tagsList = [['follow-plan'], ['early-exit'], ['revenge-trade'], ['over-trading'], ['follow-plan', 'big-winner']];
  const pair = pairs[i % pairs.length];
  const pnl = Math.round((Math.random() * 300 - 80) * (Math.random() > 0.42 ? 1 : -1));
  return {
    id: i + 1,
    date: new Date(2025, 0, 15 - Math.floor(i / 3)),
    pair,
    type: types[i % 2],
    entry: pair === 'XAUUSD' ? 2000 + Math.random() * 100 : pair === 'US30' ? 38000 + Math.random() * 1000 : 1 + Math.random() * 0.3,
    exit: pair === 'XAUUSD' ? 2000 + Math.random() * 100 : pair === 'US30' ? 38000 + Math.random() * 1000 : 1 + Math.random() * 0.3,
    lots: [0.1, 0.2, 0.25, 0.3, 0.5, 0.75, 1.0][i % 7],
    pnl,
    rr: `1:${(Math.random() * 3 + 0.5).toFixed(1)}`,
    session: sessions[i % 4],
    tags: tagsList[i % 5],
    notes: '',
  };
});

// Monthly performance data
export const monthlyPerformance = [
  { month: 'Aug', pnl: 1840 },
  { month: 'Sep', pnl: -450 },
  { month: 'Oct', pnl: 2340 },
  { month: 'Nov', pnl: 1560 },
  { month: 'Dec', pnl: 890 },
  { month: 'Jan', pnl: 3120 },
];

// Session analysis data
export const sessionAnalysis = [
  { session: 'Asian', pnl: -340 },
  { session: 'London Pre', pnl: 680 },
  { session: 'London-NY', pnl: 2340 },
  { session: 'New York', pnl: 1200 },
  { session: 'Pacific', pnl: -80 },
];

// R-multiple distribution
export const rMultipleDist = [
  { bucket: '-3R', count: 2 },
  { bucket: '-2R', count: 5 },
  { bucket: '-1R', count: 12 },
  { bucket: '0R', count: 8 },
  { bucket: '+1R', count: 28 },
  { bucket: '+2R', count: 22 },
  { bucket: '+3R', count: 14 },
  { bucket: '+4R+', count: 6 },
];

// Drawdown data
export const drawdownData = Array.from({ length: 30 }, (_, i) => ({
  date: `Day ${i + 1}`,
  drawdown: -(Math.random() * 4.2 * Math.exp(-i * 0.1)),
}));

// AI Insights
export const aiInsights = [
  { id: 1, severity: 'yellow', title: 'Early Exit Pattern', message: 'You exited 3 trades early this week before reaching target, leaving $340 on the table. Consider widening your stops.', timestamp: '2 days ago', read: false },
  { id: 2, severity: 'red', title: 'Lot Size Discipline', message: 'After 2 consecutive losses on Jan 14, you increased lot size by 2x on the next trade. This revenge trading pattern has cost you $892 over the past month.', timestamp: '1 day ago', read: false },
  { id: 3, severity: 'green', title: 'Session Optimization', message: 'Your win rate is 71% during London-NY overlap vs 38% in Asian session. Consider focusing your trading hours.', timestamp: '3 days ago', read: true },
  { id: 4, severity: 'red', title: 'Overtrading Alert', message: 'You placed 8 trades on Jan 13, 3x your daily average. 6 of these were losses. Set a daily trade limit.', timestamp: '2 days ago', read: false },
  { id: 5, severity: 'green', title: 'Pair Performance', message: 'XAUUSD is your best performing pair with a 2.34 profit factor. Consider allocating more risk to this instrument.', timestamp: '4 days ago', read: true },
  { id: 6, severity: 'yellow', title: 'Weekend Hold', message: 'You held trades over the weekend 4 times this month. 3 of these resulted in gap losses totaling $267.', timestamp: '5 days ago', read: true },
  { id: 7, severity: 'yellow', title: 'Risk Consistency', message: 'Your risk per trade varies from 0.5% to 3.2%. Standardizing at 1% would improve consistency.', timestamp: '1 week ago', read: true },
  { id: 8, severity: 'green', title: 'Profit Taking', message: 'Your R-multiple average is 1.8R. Traders who hold to 2R+ targets see 23% better long-term returns.', timestamp: '1 week ago', read: true },
];

// Psychological metrics
export const psychMetrics = [
  { name: 'Revenge Trading Frequency', value: '2.3x/week', status: 'red', label: 'Above average' },
  { name: 'Avg Holding Time', value: '4.2h', status: 'green', label: 'Optimal' },
  { name: 'Risk-per-Trade Variance', value: '\u00b11.35%', status: 'yellow', label: 'Inconsistent' },
  { name: 'Win Streak (current)', value: '4 trades', status: 'green', label: 'Personal best' },
  { name: 'Loss Streak (max)', value: '6 trades', status: 'red', label: 'Watch closely' },
  { name: 'Expectancy per Trade', value: '+$42.50', status: 'green', label: 'Positive' },
];

// AI Action Plan
export const aiActionPlan = [
  { id: 1, text: 'Set a hard stop at 3 trades per day to prevent overtrading', completed: false },
  { id: 2, text: 'Use a fixed 1% risk per trade for the next 30 days', completed: true },
  { id: 3, text: 'Avoid trading the first 2 hours of Asian session', completed: false },
  { id: 4, text: 'Journal your emotional state before each trade', completed: true },
];

// Calendar journal data
export const calendarJournalData = Array.from({ length: 31 }, (_, i) => {
  const hasTrades = Math.random() > 0.25;
  const pnl = hasTrades ? Math.round((Math.random() * 800 - 200)) : 0;
  const tradeCount = hasTrades ? Math.floor(Math.random() * 10) + 1 : 0;
  const wins = hasTrades ? Math.floor(tradeCount * (0.4 + Math.random() * 0.3)) : 0;
  return {
    day: i + 1,
    pnl,
    tradeCount,
    winRate: hasTrades ? Math.round((wins / tradeCount) * 100) : 0,
    wins,
    losses: tradeCount - wins,
  };
});

// Economic calendar events
export const economicEvents = [
  { time: '08:30', currency: 'USD', event: 'Non-Farm Payrolls', impact: 'high', actual: '185K', forecast: '175K', previous: '162K', date: '2025-01-15' },
  { time: '10:00', currency: 'EUR', event: 'ECB Interest Rate Decision', impact: 'high', actual: '4.5%', forecast: '4.5%', previous: '4.5%', date: '2025-01-15' },
  { time: '14:00', currency: 'USD', event: 'ISM Manufacturing PMI', impact: 'medium', actual: '49.2', forecast: '48.5', previous: '47.9', date: '2025-01-15' },
  { time: '02:00', currency: 'AUD', event: 'RBA Meeting Minutes', impact: 'medium', actual: '-', forecast: '-', previous: '-', date: '2025-01-15' },
  { time: '04:30', currency: 'JPY', event: 'Industrial Production m/m', impact: 'low', actual: '1.2%', forecast: '0.8%', previous: '-0.3%', date: '2025-01-15' },
  { time: '09:00', currency: 'GBP', event: 'GDP m/m', impact: 'high', actual: '-0.1%', forecast: '0.1%', previous: '0.2%', date: '2025-01-15' },
  { time: '13:30', currency: 'CAD', event: 'Employment Change', impact: 'high', actual: '15.2K', forecast: '20.0K', previous: '25.1K', date: '2025-01-15' },
  { time: '16:00', currency: 'USD', event: 'Crude Oil Inventories', impact: 'medium', actual: '-2.1M', forecast: '-1.5M', previous: '-3.2M', date: '2025-01-15' },
  { time: '21:45', currency: 'NZD', event: 'CPI q/q', impact: 'high', actual: '0.6%', forecast: '0.5%', previous: '0.4%', date: '2025-01-15' },
  { time: '07:00', currency: 'EUR', event: 'German CPI m/m', impact: 'medium', actual: '0.3%', forecast: '0.2%', previous: '0.1%', date: '2025-01-15' },
];

// Leaderboard data
export const leaderboardData = [
  { rank: 1, name: 'AlexTrader', avatar: 'AT', winRate: 68, profitFactor: 2.4, totalReturn: 32, consistency: 94, trades: 234 },
  { rank: 2, name: 'ForexQueen', avatar: 'FQ', winRate: 64, profitFactor: 2.1, totalReturn: 28, consistency: 91, trades: 189 },
  { rank: 3, name: 'PipMaster', avatar: 'PM', winRate: 61, profitFactor: 1.9, totalReturn: 25, consistency: 89, trades: 312 },
  { rank: 4, name: 'GoldHunter', avatar: 'GH', winRate: 58, profitFactor: 1.8, totalReturn: 22, consistency: 85, trades: 156 },
  { rank: 5, name: 'SwingKing', avatar: 'SK', winRate: 57, profitFactor: 1.7, totalReturn: 20, consistency: 83, trades: 278 },
  { rank: 6, name: 'ScalpPro', avatar: 'SP', winRate: 55, profitFactor: 1.6, totalReturn: 18, consistency: 80, trades: 412 },
  { rank: 7, name: 'TrendRider', avatar: 'TR', winRate: 54, profitFactor: 1.5, totalReturn: 16, consistency: 78, trades: 198 },
  { rank: 8, name: 'DayTrader99', avatar: 'D9', winRate: 53, profitFactor: 1.5, totalReturn: 15, consistency: 76, trades: 356 },
  { rank: 9, name: 'FXNinja', avatar: 'FN', winRate: 52, profitFactor: 1.4, totalReturn: 14, consistency: 74, trades: 267 },
  { rank: 10, name: 'PipsQueen', avatar: 'PQ', winRate: 51, profitFactor: 1.4, totalReturn: 13, consistency: 72, trades: 189 },
];

// Community posts
export const communityPosts = [
  {
    id: 1,
    author: 'AlexTrader',
    avatar: 'AT',
    time: '2h ago',
    content: 'Finally nailed that EURUSD long after waiting for the London open. AI Coach called out my patience improvement! 🎯',
    trade: { pair: 'EURUSD', type: 'Buy', pnl: 110, rr: '1:2.1' },
    likes: 24,
    comments: 5,
    liked: false,
  },
  {
    id: 2,
    author: 'ForexQueen',
    avatar: 'FQ',
    time: '4h ago',
    content: 'Gold is respecting the daily support zone perfectly. Accumulating longs with tight stops below 2020. Anyone else watching this setup?',
    trade: null,
    likes: 42,
    comments: 12,
    liked: true,
  },
  {
    id: 3,
    author: 'PipMaster',
    avatar: 'PM',
    time: '6h ago',
    content: 'The discipline score improvement is real. Went from 62 to 78 in three weeks just by following the AI action plan. Consistency is everything.',
    trade: null,
    likes: 67,
    comments: 18,
    liked: false,
  },
  {
    id: 4,
    author: 'GoldHunter',
    avatar: 'GH',
    time: '8h ago',
    content: 'Caught this beautiful supply zone rejection on US30. R:R was too good to pass up.',
    trade: { pair: 'US30', type: 'Sell', pnl: 216, rr: '1:2.4' },
    likes: 31,
    comments: 7,
    liked: false,
  },
  {
    id: 5,
    author: 'SwingKing',
    avatar: 'SK',
    time: '12h ago',
    content: 'Journal review from last month: biggest takeaway was overtrading on Fridays. Cut Friday trades by 70% this month and already seeing better results.',
    trade: null,
    likes: 55,
    comments: 14,
    liked: true,
  },
];

// Trending traders
export const trendingTraders = [
  { name: 'AlexTrader', followers: 2340, avatar: 'AT' },
  { name: 'ForexQueen', followers: 1890, avatar: 'FQ' },
  { name: 'PipMaster', followers: 1560, avatar: 'PM' },
  { name: 'GoldHunter', followers: 1230, avatar: 'GH' },
  { name: 'SwingKing', followers: 980, avatar: 'SK' },
];

// Hot topics
export const hotTopics = ['#EURUSD', '#Gold', '#Psychology', '#AIcoach', '#LondonSession', '#RiskManagement'];

// Pricing plans
export const pricingPlans = [
  {
    name: 'Free',
    price: 0,
    period: 'month',
    description: 'Get started with basic journaling',
    features: [
      '1 MT5 account connection',
      'Basic trade journaling',
      '30-day trade history',
      'Performance dashboard',
      'Email support',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Pro',
    price: 29,
    period: 'month',
    description: 'Everything you need to trade smarter',
    features: [
      '3 MT5 account connections',
      'Unlimited trade history',
      'Full AI Coach access',
      'Advanced analytics',
      'Trade replay',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Premium',
    price: 79,
    period: 'month',
    description: 'For professional traders and teams',
    features: [
      'Unlimited MT5 accounts',
      'Custom AI models',
      'API access',
      'Community features',
      'Dedicated support',
      'White-label options',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

// Feature comparison
export const featureComparison = [
  { feature: 'MT5 Accounts', free: '1', pro: '3', premium: 'Unlimited' },
  { feature: 'Trade History', free: '30 days', pro: 'Unlimited', premium: 'Unlimited' },
  { feature: 'AI Coach', free: 'Basic', pro: 'Full', premium: 'Full + Custom' },
  { feature: 'Trade Replay', free: false, pro: true, premium: true },
  { feature: 'Advanced Analytics', free: false, pro: true, premium: true },
  { feature: 'Economic Calendar', free: 'Basic', pro: 'Full', premium: 'Full' },
  { feature: 'Community', free: 'Read-only', pro: 'Full', premium: 'Full + Verified' },
  { feature: 'API Access', free: false, pro: false, premium: true },
  { feature: 'Support', free: 'Email', pro: 'Priority', premium: 'Dedicated' },
  { feature: 'Custom Reports', free: false, pro: false, premium: true },
];

// FAQ data
export const faqData = [
  { q: 'How does the MT5 connection work?', a: 'We use read-only access via your investor password to sync trades in real-time. Your credentials are encrypted with AES-256 and never stored on our servers.' },
  { q: 'Can I cancel my subscription anytime?', a: 'Yes, you can cancel anytime from your settings page. Your access continues until the end of your billing period.' },
  { q: 'Is my trading data secure?', a: 'Absolutely. We use bank-level encryption, never share your data with third parties, and you can delete your account and all data at any time.' },
  { q: 'What brokers are supported?', a: 'We support any broker that offers MetaTrader 5. This includes IC Markets, XM, Pepperstone, FP Markets, Oanda, Forex.com, and hundreds more.' },
  { q: 'How accurate is the AI Coach?', a: 'Our AI analyzes patterns across millions of trades and has been trained on professional trading psychology frameworks. Users report a 23% average improvement in win rate after 30 days.' },
];

// Candlestick data for replay
export const candlestickData = Array.from({ length: 48 }, (_, i) => {
  const open = 1.0840 + Math.sin(i * 0.2) * 0.003 + Math.random() * 0.001;
  const close = open + (Math.random() - 0.4) * 0.002;
  const high = Math.max(open, close) + Math.random() * 0.001;
  const low = Math.min(open, close) - Math.random() * 0.001;
  return {
    time: `${9 + Math.floor(i / 4)}:${(i % 4) * 15}`,
    open: Math.round(open * 10000) / 10000,
    high: Math.round(high * 10000) / 10000,
    low: Math.round(low * 10000) / 10000,
    close: Math.round(close * 10000) / 10000,
    volume: Math.floor(Math.random() * 500) + 100,
  };
});

// Testimonials
export const testimonials = [
  {
    quote: "TradeLens showed me I was revenge trading after every loss. My win rate jumped 23% in the first month just from being aware.",
    author: "Alex K.",
    role: "Forex Trader",
    avatar: "AK",
  },
  {
    quote: "The AI Coach is like having a professional trading psychologist watching every move. The insights are scarily accurate.",
    author: "Sarah M.",
    role: "Day Trader",
    avatar: "SM",
  },
  {
    quote: "I've tried every journal out there. TradeLens is the first one that actually made me a better trader, not just organized my data.",
    author: "James R.",
    role: "Swing Trader",
    avatar: "JR",
  },
];
