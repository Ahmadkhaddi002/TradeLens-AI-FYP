import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Cell
} from 'recharts';
import { GlassCard } from '@/components/GlassCard';
import { SectionHeader } from '@/components/SectionHeader';
import { useMT5 } from '@/context/MT5Context';
import { Database } from 'lucide-react';

const timeRanges = ['1W', '1M', '3M', '6M', '1Y', 'All'];

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[rgba(10,10,14,0.95)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-[#64748b]">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-semibold" style={{ color: p.color }}>{p.value}</p>
      ))}
    </div>
  );
}

function getSession(hour: number): string {
  if (hour >= 0 && hour < 8) return 'Asian';
  if (hour >= 8 && hour < 13) return 'London';
  if (hour >= 13 && hour < 17) return 'London-NY';
  if (hour >= 17 && hour < 22) return 'New York';
  return 'Pacific';
}

export default function Analytics() {
  const [range, setRange] = useState('1M');
  const { connected, trades: mt5Trades, account } = useMT5();

  const computed = useMemo(() => {
    if (!connected || mt5Trades.length === 0) {
      return { monthlyPerformance: [], sessionAnalysis: [], rMultipleDist: [], drawdownData: [], pairWinLoss: [] };
    }

    const trades = mt5Trades;

    const monthlyMap: Record<string, number> = {};
    trades.forEach(t => {
      const month = new Date(t.closeTime).toLocaleString('en', { month: 'short' });
      monthlyMap[month] = (monthlyMap[month] || 0) + t.profit;
    });
    const computedMonthly = Object.entries(monthlyMap).map(([month, pnl]) => ({ month, pnl: Math.round(pnl) }));

    const sessionMap: Record<string, number> = {};
    trades.forEach(t => {
      const hour = new Date(t.closeTime).getHours();
      const s = getSession(hour);
      sessionMap[s] = (sessionMap[s] || 0) + t.profit;
    });
    const computedSession = Object.entries(sessionMap).map(([session, pnl]) => ({ session, pnl: Math.round(pnl) }));

    const avgLoss = Math.abs(trades.filter(t => t.profit < 0).reduce((s, t) => s + t.profit, 0) / Math.max(trades.filter(t => t.profit < 0).length, 1));
    const rBuckets = ['-3R', '-2R', '-1R', '0R', '+1R', '+2R', '+3R', '+4R+'];
    const rDist: Record<string, number> = {};
    rBuckets.forEach(b => rDist[b] = 0);
    trades.forEach(t => {
      const r = avgLoss > 0 ? t.profit / avgLoss : 0;
      if (r < -2.5) rDist['-3R']++;
      else if (r < -1.5) rDist['-2R']++;
      else if (r < -0.5) rDist['-1R']++;
      else if (r < 0.5) rDist['0R']++;
      else if (r < 1.5) rDist['+1R']++;
      else if (r < 2.5) rDist['+2R']++;
      else if (r < 3.5) rDist['+3R']++;
      else rDist['+4R+']++;
    });
    const computedR = Object.entries(rDist).map(([bucket, count]) => ({ bucket, count }));

    const sortedTrades = [...trades].sort((a, b) => new Date(a.closeTime).getTime() - new Date(b.closeTime).getTime());
    const dailyPnL: Record<string, number> = {};
    sortedTrades.forEach(t => {
      const date = new Date(t.closeTime).toISOString().slice(0, 10);
      dailyPnL[date] = (dailyPnL[date] || 0) + t.profit;
    });
    let peak = account?.balance || 30000;
    const ddValues: { date: string; drawdown: number }[] = [];
    let cumulative = peak;
    Object.entries(dailyPnL).forEach(([date, pnl]) => {
      cumulative -= pnl;
      const dd = peak > 0 ? ((cumulative - peak) / peak) * 100 : 0;
      peak = Math.max(peak, cumulative);
      ddValues.push({ date: date.slice(5), drawdown: Math.round(dd * 100) / 100 });
    });

    const pairMap: Record<string, { wins: number; losses: number }> = {};
    trades.forEach(t => {
      if (!pairMap[t.symbol]) pairMap[t.symbol] = { wins: 0, losses: 0 };
      if (t.profit > 0) pairMap[t.symbol].wins++;
      else pairMap[t.symbol].losses++;
    });
    const computedPair = Object.entries(pairMap).map(([pair, d]) => ({ pair, wins: d.wins, losses: d.losses }));

    return {
      monthlyPerformance: computedMonthly,
      sessionAnalysis: computedSession,
      rMultipleDist: computedR,
      drawdownData: ddValues,
      pairWinLoss: computedPair,
    };
  }, [connected, mt5Trades, account]);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {!connected ? (
        <GlassCard>
          <div className="text-center py-12 text-[#64748b]">
            <Database size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Connect your MT5 account to see analytics</p>
          </div>
        </GlassCard>
      ) : (
      <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {timeRanges.map((r) => (
            <button key={r} onClick={() => setRange(r)}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors ${
                range === r ? 'bg-[rgba(6,182,212,0.1)] text-[#06b6d4] border border-[#06b6d4]' : 'text-[#94a3b8] hover:text-[#f8fafc] border border-transparent'
              }`}>{r}</button>
          ))}
        </div>
        {connected && <span className="text-xs text-[#22c55e] flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" /> Live data</span>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <SectionHeader title="Monthly Performance" subtitle="P&L by month" />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={computed.monthlyPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                  {computed.monthlyPerformance.map((entry, i) => (
                    <Cell key={i} fill={entry.pnl >= 0 ? '#22c55e' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard>
          <SectionHeader title="Session Performance" subtitle="P&L by trading session" />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={computed.sessionAnalysis} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <YAxis type="category" dataKey="session" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={90} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="pnl" radius={[0, 4, 4, 0]} fill="#06b6d4" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <SectionHeader title="R-Multiple Distribution" subtitle="Trade outcomes by R-multiple" />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={computed.rMultipleDist}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard>
          <SectionHeader title="Pair Performance" subtitle="Wins vs Losses by pair" />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={computed.pairWinLoss.length > 0 ? computed.pairWinLoss : []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="pair" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="wins" stackId="a" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="losses" stackId="a" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
            {computed.pairWinLoss.length === 0 && (
              <div className="text-center text-xs text-[#64748b] -mt-12">No pair data available</div>
            )}
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <SectionHeader title="Drawdown Analysis" subtitle="Portfolio drawdown over time" />
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={computed.drawdownData}>
              <defs>
                <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="drawdown" stroke="#ef4444" strokeWidth={2} fill="url(#ddGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
      </>
      )}
    </motion.div>
  );
}
