interface Trade {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  volume: number;
  openPrice: number;
  closePrice: number;
  profit: number;
  openTime: string;
  closeTime: string;
  swap?: number;
  commission?: number;
}

interface Position {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  volume: number;
  openPrice: number;
  currentPrice: number;
  profit: number;
  openTime: string;
}

interface AccountInfo {
  balance: number;
  equity: number;
  marginFree: number;
}

interface AnalysisResult {
  summary: {
    totalTrades: number;
    winRate: number;
    profitFactor: number;
    totalPnL: number;
    avgWin: number;
    avgLoss: number;
    avgRRR: number;
    expectancy: number;
    maxConsecutiveWins: number;
    maxConsecutiveLosses: number;
    sharpeRatio: number;
    bestTrade: number;
    worstTrade: number;
  };
  byPair: Array<{ pair: string; trades: number; wins: number; pnl: number; winRate: number; profitFactor: number }>;
  bySession: Array<{ session: string; pnl: number; trades: number; wins: number }>;
  byDayOfWeek: Array<{ day: string; pnl: number; trades: number; winRate: number }>;
  monthlyPerformance: Array<{ month: string; pnl: number }>;
  drawdown: Array<{ date: string; drawdown: number }>;
  rMultipleDist: Array<{ bucket: string; count: number }>;
  psychology: Array<{ name: string; value: string; status: 'green' | 'yellow' | 'red'; label: string }>;
  insights: Array<{ severity: 'green' | 'yellow' | 'red'; title: string; message: string }>;
  actionPlan: Array<{ id: number; text: string; completed: boolean }>;
  disciplineScore: number;
  breakdown: Array<{ name: string; value: number; fill: string }>;
  shouldTrade: {
    recommendation: 'trade' | 'avoid' | 'caution';
    reason: string;
    confidence: number;
  };
  dailyTip: string;
}

function getSession(hour: number): string {
  if (hour >= 0 && hour < 8) return 'Asian';
  if (hour >= 8 && hour < 13) return 'London';
  if (hour >= 13 && hour < 17) return 'London-NY';
  if (hour >= 17 && hour < 22) return 'New York';
  return 'Pacific';
}

function getDayName(date: Date): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

export function analyzeTrading(trades: Trade[], positions: Position[], account: AccountInfo): AnalysisResult {
  const totalTrades = trades.length;
  const winningTrades = trades.filter(t => t.profit > 0);
  const losingTrades = trades.filter(t => t.profit <= 0);
  const wins = winningTrades.length;
  const losses = losingTrades.length;
  const totalPnL = trades.reduce((s, t) => s + t.profit, 0);
  const totalWon = winningTrades.reduce((s, t) => s + t.profit, 0);
  const totalLost = Math.abs(losingTrades.reduce((s, t) => s + t.profit, 0));
  const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
  const profitFactor = totalLost > 0 ? totalWon / totalLost : totalWon > 0 ? Infinity : 0;
  const avgWin = wins > 0 ? totalWon / wins : 0;
  const avgLoss = losses > 0 ? losingTrades.reduce((s, t) => s + t.profit, 0) / losses : 0;

  const rrrValues = trades.map(t => {
    const risk = Math.abs(t.profit >= 0 ? avgLoss : t.profit);
    return risk > 0 ? Math.abs(t.profit) / risk : 0;
  });
  const avgRRR = rrrValues.length > 0 ? rrrValues.reduce((s, v) => s + v, 0) / rrrValues.length : 0;
  const expectancy = totalTrades > 0 ? totalPnL / totalTrades : 0;

  let maxConsecutiveWins = 0, maxConsecutiveLosses = 0;
  let currentStreak = 0, currentType = '';
  for (const t of trades) {
    const isWin = t.profit > 0;
    if ((isWin && currentType === 'win') || (!isWin && currentType === 'loss')) {
      currentStreak++;
    } else {
      if (currentType === 'win') maxConsecutiveWins = Math.max(maxConsecutiveWins, currentStreak);
      if (currentType === 'loss') maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentStreak);
      currentStreak = 1;
      currentType = isWin ? 'win' : 'loss';
    }
  }
  if (currentType === 'win') maxConsecutiveWins = Math.max(maxConsecutiveWins, currentStreak);
  if (currentType === 'loss') maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentStreak);

  const bestTrade = Math.max(...trades.map(t => t.profit), 0);
  const worstTrade = Math.min(...trades.map(t => t.profit), 0);

  const returns = trades.map(t => t.profit / (account.balance || 10000));
  const avgReturn = returns.reduce((s, r) => s + r, 0) / returns.length;
  const stdDev = Math.sqrt(returns.reduce((s, r) => s + Math.pow(r - avgReturn, 2), 0) / returns.length);
  const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0;

  const sortedTrades = [...trades].sort((a, b) => new Date(a.closeTime).getTime() - new Date(b.closeTime).getTime());

  const dailyPnL: Record<string, number> = {};
  sortedTrades.forEach(t => {
    const date = new Date(t.closeTime).toISOString().slice(0, 10);
    dailyPnL[date] = (dailyPnL[date] || 0) + t.profit;
  });

  let peak = 0;
  const drawdownValues: number[] = [];
  const drawdownDates: string[] = [];
  let cumulative = account.balance;
  Object.entries(dailyPnL).forEach(([date, pnl]) => {
    cumulative -= pnl;
    const dd = peak > 0 ? ((cumulative - peak) / peak) * 100 : 0;
    peak = Math.max(peak, cumulative);
    drawdownValues.push(dd);
    drawdownDates.push(date);
  });

  const byPairMap: Record<string, { trades: number; wins: number; pnl: number }> = {};
  trades.forEach(t => {
    if (!byPairMap[t.symbol]) byPairMap[t.symbol] = { trades: 0, wins: 0, pnl: 0 };
    byPairMap[t.symbol].trades++;
    byPairMap[t.symbol].pnl += t.profit;
    if (t.profit > 0) byPairMap[t.symbol].wins++;
  });
  const byPair = Object.entries(byPairMap).map(([pair, d]) => ({
    pair,
    ...d,
    winRate: d.trades > 0 ? (d.wins / d.trades) * 100 : 0,
    profitFactor: d.trades - d.wins > 0 ? d.pnl / Math.abs(d.pnl) || 0 : 0,
  }));

  const bySessionMap: Record<string, { pnl: number; trades: number; wins: number }> = {};
  trades.forEach(t => {
    const hour = new Date(t.closeTime).getHours();
    const session = getSession(hour);
    if (!bySessionMap[session]) bySessionMap[session] = { pnl: 0, trades: 0, wins: 0 };
    bySessionMap[session].pnl += t.profit;
    bySessionMap[session].trades++;
    if (t.profit > 0) bySessionMap[session].wins++;
  });
  const bySession = Object.entries(bySessionMap).map(([session, d]) => ({ session, ...d }));

  const byDayMap: Record<string, { pnl: number; trades: number; wins: number }> = {};
  trades.forEach(t => {
    const day = getDayName(new Date(t.closeTime));
    if (!byDayMap[day]) byDayMap[day] = { pnl: 0, trades: 0, wins: 0 };
    byDayMap[day].pnl += t.profit;
    byDayMap[day].trades++;
    if (t.profit > 0) byDayMap[day].wins++;
  });
  const byDayOfWeek = Object.entries(byDayMap).map(([day, d]) => ({
    day, ...d, winRate: d.trades > 0 ? (d.wins / d.trades) * 100 : 0,
  }));

  const monthlyMap: Record<string, number> = {};
  trades.forEach(t => {
    const month = new Date(t.closeTime).toLocaleString('en', { month: 'short' });
    monthlyMap[month] = (monthlyMap[month] || 0) + t.profit;
  });
  const monthlyPerformance = Object.entries(monthlyMap).map(([month, pnl]) => ({ month, pnl }));

  const rMulitpleBuckets = ['-3R', '-2R', '-1R', '0R', '+1R', '+2R', '+3R', '+4R+'];
  const rDist: Record<string, number> = {};
  rMulitpleBuckets.forEach(b => rDist[b] = 0);
  trades.forEach(t => {
    const r = avgLoss !== 0 ? t.profit / Math.abs(avgLoss) : 0;
    if (r < -2.5) rDist['-3R']++;
    else if (r < -1.5) rDist['-2R']++;
    else if (r < -0.5) rDist['-1R']++;
    else if (r < 0.5) rDist['0R']++;
    else if (r < 1.5) rDist['+1R']++;
    else if (r < 2.5) rDist['+2R']++;
    else if (r < 3.5) rDist['+3R']++;
    else rDist['+4R+']++;
  });
  const rMultipleDist = Object.entries(rDist).map(([bucket, count]) => ({ bucket, count }));

  const psychMetrics: AnalysisResult['psychology'] = [];
  psychMetrics.push({ name: 'Win Rate', value: `${winRate.toFixed(1)}%`, status: winRate >= 55 ? 'green' : winRate >= 45 ? 'yellow' : 'red', label: winRate >= 55 ? 'Above average' : winRate >= 45 ? 'Average' : 'Below average' });
  psychMetrics.push({ name: 'Profit Factor', value: isFinite(profitFactor) ? profitFactor.toFixed(2) : '∞', status: profitFactor >= 2 ? 'green' : profitFactor >= 1.5 ? 'yellow' : 'red', label: profitFactor >= 2 ? 'Excellent' : profitFactor >= 1.5 ? 'Good' : 'Needs work' });
  psychMetrics.push({ name: 'Avg R:R Ratio', value: `1:${avgRRR.toFixed(1)}`, status: avgRRR >= 2 ? 'green' : avgRRR >= 1 ? 'yellow' : 'red', label: avgRRR >= 2 ? 'Optimal' : avgRRR >= 1 ? 'Fair' : 'Low' });
  psychMetrics.push({ name: 'Max Consecutive Wins', value: `${maxConsecutiveWins}`, status: maxConsecutiveWins >= 5 ? 'green' : 'yellow', label: 'Current streak' });
  psychMetrics.push({ name: 'Max Consecutive Losses', value: `${maxConsecutiveLosses}`, status: maxConsecutiveLosses <= 3 ? 'green' : maxConsecutiveLosses <= 5 ? 'yellow' : 'red', label: maxConsecutiveLosses <= 3 ? 'Controlled' : 'Watch closely' });
  psychMetrics.push({ name: 'Expectancy per Trade', value: `$${expectancy.toFixed(2)}`, status: expectancy > 0 ? 'green' : 'red', label: expectancy > 0 ? 'Positive' : 'Negative' });

  const insights: AnalysisResult['insights'] = [];

  if (maxConsecutiveLosses >= 4) {
    insights.push({ severity: 'red', title: 'Loss Streak Pattern', message: `You had ${maxConsecutiveLosses} consecutive losses. After a 2nd loss, consider stepping away to avoid revenge trading.` });
  }
  if (avgRRR < 1.5) {
    insights.push({ severity: 'yellow', title: 'Risk-Reward Optimization', message: `Your average R:R is 1:${avgRRR.toFixed(1)}. Aim for at least 1:2 to improve long-term profitability.` });
  }
  if (bySession.length > 0) {
    const bestSession = bySession.reduce((a, b) => a.pnl > b.pnl ? a : b);
    const worstSession = bySession.reduce((a, b) => a.pnl < b.pnl ? a : b);
    if (bestSession.pnl > 0) {
      insights.push({ severity: 'green', title: `Best Session: ${bestSession.session}`, message: `You perform best during the ${bestSession.session} session ($${bestSession.pnl.toFixed(0)} P&L). Consider focusing your trading hours here.` });
    }
    if (worstSession.pnl < 0) {
      insights.push({ severity: 'red', title: `Worst Session: ${worstSession.session}`, message: `The ${worstSession.session} session costs you $${Math.abs(worstSession.pnl).toFixed(0)}. Consider avoiding trading during this time.` });
    }
  }
  if (byDayOfWeek.length > 0) {
    const bestDay = byDayOfWeek.reduce((a, b) => a.pnl > b.pnl ? a : b);
    const worstDay = byDayOfWeek.reduce((a, b) => a.pnl < b.pnl ? a : b);
    if (bestDay.pnl > 0) insights.push({ severity: 'green', title: `Best Day: ${bestDay.day}`, message: `You make the most on ${bestDay.day}s ($${bestDay.pnl.toFixed(0)}). Plan your strategy around this day.` });
    if (worstDay.pnl < 0) insights.push({ severity: 'yellow', title: `Watch ${worstDay.day}`, message: `${worstDay.day}s are your least profitable day ($${Math.abs(worstDay.pnl).toFixed(0)}). Trade with smaller size or review your approach.` });
  }
  const bestPair = byPair.reduce((a, b) => a.pnl > b.pnl ? a : b);
  const worstPair = byPair.reduce((a, b) => a.pnl < b.pnl ? a : b);
  if (bestPair.pnl > 0) insights.push({ severity: 'green', title: `Best Pair: ${bestPair.pair}`, message: `${bestPair.pair} is your strongest pair ($${bestPair.pnl.toFixed(0)}). Allocate more focus here.` });
  if (worstPair.pnl < 0) insights.push({ severity: 'red', title: `Weakest Pair: ${worstPair.pair}`, message: `${worstPair.pair} costs you $${Math.abs(worstPair.pnl).toFixed(0)}. Reduce size or avoid this pair temporarily.` });
  if (profitFactor < 1.5) insights.push({ severity: 'red', title: 'Profit Factor Alert', message: `Your profit factor is ${profitFactor.toFixed(2)} (ideal is > 2.0). Focus on cutting losses shorter and letting winners run.` });
  if (winRate > 60) insights.push({ severity: 'green', title: 'Strong Win Rate', message: `Your ${winRate.toFixed(1)}% win rate is excellent! Maintain discipline and don't get overconfident.` });
  if (totalTrades >= 20 && avgRRR >= 2) insights.push({ severity: 'green', title: 'Solid Risk Management', message: `Your average 1:${avgRRR.toFixed(1)} R:R shows excellent risk management. Keep it up!` });

  const actionItems: AnalysisResult['actionPlan'] = [];
  const usedActions = new Set<string>();
  if (avgRRR < 1.5) { actionItems.push({ id: 1, text: 'Aim for 1:2 risk-reward ratio minimum on all trades', completed: false }); usedActions.add('rrr'); }
  if (maxConsecutiveLosses >= 4) { actionItems.push({ id: 2, text: 'After 2 consecutive losses, stop trading for the day', completed: false }); usedActions.add('streak'); }
  if (profitFactor < 1.5) { actionItems.push({ id: 3, text: 'Cut losing trades earlier — set a max loss per day', completed: false }); usedActions.add('pf'); }
  if (!usedActions.has('rrr')) actionItems.push({ id: 1, text: 'Maintain your risk-reward discipline', completed: true });
  if (!usedActions.has('streak')) actionItems.push({ id: 2, text: 'Review your trade journal daily for patterns', completed: true });
  if (!usedActions.has('pf')) actionItems.push({ id: 3, text: 'Set a daily trade limit to prevent overtrading', completed: false });
  actionItems.push({ id: 4, text: 'Log emotional state before each trade entry', completed: false });
  actionItems.push({ id: 5, text: 'Review this week\'s trades every Sunday', completed: false });

  const disciplineScore = Math.min(100, Math.max(10,
    Math.round(
      (winRate >= 55 ? 25 : winRate >= 45 ? 18 : 10) +
      (profitFactor >= 2 ? 25 : profitFactor >= 1.5 ? 18 : 8) +
      (avgRRR >= 2 ? 20 : avgRRR >= 1 ? 14 : 6) +
      (maxConsecutiveLosses <= 3 ? 15 : maxConsecutiveLosses <= 5 ? 10 : 4) +
      (totalTrades >= 20 ? 15 : 8)
    )
  ));

  const breakdown = [
    { name: 'Risk Management', value: Math.min(100, Math.round((avgRRR / 3) * 100)), fill: '#22c55e' },
    { name: 'Consistency', value: Math.min(100, Math.round(winRate * 0.8 + 20)), fill: '#eab308' },
    { name: 'Emotional Control', value: Math.min(100, Math.round((1 - Math.min(maxConsecutiveLosses, 10) / 10) * 70 + 30)), fill: '#3b82f6' },
    { name: 'Strategy', value: Math.min(100, Math.round(Math.min(profitFactor, 5) / 5 * 80 + 20)), fill: '#8b5cf6' },
  ];

  let shouldTradeRec: 'trade' | 'avoid' | 'caution';
  let shouldTradeReason: string;
  let shouldTradeConfidence: number;

  const openRisk = positions.reduce((s, p) => s + Math.abs(p.profit), 0);
  const marginRatio = account.balance > 0 ? (account.equity / account.balance) : 1;
  const recentPerformance = trades.slice(0, 5).filter(t => t.profit > 0).length;

  if (positions.length > 3) {
    shouldTradeRec = 'avoid';
    shouldTradeReason = `You already have ${positions.length} open positions. Focus on managing existing trades.`;
    shouldTradeConfidence = 85;
  } else if (recentPerformance <= 1 && trades.length >= 5) {
    shouldTradeRec = 'avoid';
    shouldTradeReason = `You've lost ${5 - recentPerformance} of your last 5 trades. Take a break and review your strategy.`;
    shouldTradeConfidence = 75;
  } else if (marginRatio < 0.9) {
    shouldTradeRec = 'caution';
    shouldTradeReason = 'Your margin level is low. Reduce position sizes or add funds before trading.';
    shouldTradeConfidence = 70;
  } else if (winRate >= 50 && profitFactor >= 1.5) {
    shouldTradeRec = 'trade';
    shouldTradeReason = 'Your recent performance is strong. Stay disciplined with your current strategy.';
    shouldTradeConfidence = 80;
  } else if (totalTrades < 10) {
    shouldTradeRec = 'caution';
    shouldTradeReason = 'Not enough data for a confident recommendation. Trade small until we learn your patterns.';
    shouldTradeConfidence = 50;
  } else {
    shouldTradeRec = 'caution';
    shouldTradeReason = 'Mixed signals in recent performance. Use smaller position sizes and tighter stops.';
    shouldTradeConfidence = 60;
  }

  const tips = [
    'The best traders focus on process, not profits. If your process is solid, profits follow.',
    'Keep a trading journal. Writing down your thoughts before each trade improves discipline by 34%.',
    'Never average into a losing position. It\'s better to cut and reassess.',
    'Your stop loss is your insurance. Never remove a stop loss once placed.',
    'Trade the trend. In an uptrend, buy dips. In a downtrend, sell rallies.',
    'If you\'re angry, tired, or distracted — don\'t trade. Emotions cost money.',
    'Risk 1% per trade. If you lose 10 trades in a row, you\'re still in the game.',
    'The market is always right. Don\'t fight the trend — trade what you see, not what you think.',
    'Take profits at your target. Letting winners run is good, but greed turns winners into losers.',
    'Review your trades weekly. Find one mistake to fix and one strength to amplify.',
  ];
  const dailyTip = tips[Math.floor(Math.random() * tips.length)];

  return {
    summary: { totalTrades, winRate, profitFactor, totalPnL, avgWin, avgLoss, avgRRR, expectancy, maxConsecutiveWins, maxConsecutiveLosses, sharpeRatio: Math.round(sharpeRatio * 100) / 100, bestTrade, worstTrade },
    byPair, bySession, byDayOfWeek, monthlyPerformance,
    drawdown: drawdownDates.map((date, i) => ({ date, drawdown: Math.round(drawdownValues[i] * 100) / 100 })),
    rMultipleDist,
    psychology: psychMetrics,
    insights,
    actionPlan: actionItems,
    disciplineScore,
    breakdown,
    shouldTrade: { recommendation: shouldTradeRec, reason: shouldTradeReason, confidence: shouldTradeConfidence },
    dailyTip,
  };
}
