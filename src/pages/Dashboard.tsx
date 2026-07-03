import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { StatCard } from '@/components/StatCard';
import { GlassCard } from '@/components/GlassCard';
import { SectionHeader } from '@/components/SectionHeader';
import { ParticleNetwork } from '@/components/ParticleNetwork';
import { useMT5 } from '@/context/MT5Context';
import { TrendingUp, Clock, ArrowUpRight, RefreshCw } from 'lucide-react';
import { MT5Status } from '@/components/MT5Status';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[rgba(10,10,14,0.95)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-[#64748b]">{label}</p>
      <p className="text-sm font-semibold text-[#f8fafc]">${payload[0].value?.toLocaleString()}</p>
    </div>
  );
}

export default function Dashboard() {
  const { connected, account, trades, quotes, refreshData, demoMode } = useMT5();

  const totalProfit = useMemo(() => trades.reduce((sum, t) => sum + t.profit, 0), [trades]);
  const winTrades = useMemo(() => trades.filter(t => t.profit > 0).length, [trades]);
  const totalTrades = trades.length;
  const winRate = totalTrades > 0 ? (winTrades / totalTrades) * 100 : 0;

  const equityData = useMemo(() => {
    const sorted = [...trades].sort((a, b) => new Date(a.closeTime).getTime() - new Date(b.closeTime).getTime());
    let cumPnl = 0;
    const points: { date: string; balance: number }[] = [];
    sorted.forEach((t) => {
      cumPnl += t.profit;
      const d = t.closeTime ? new Date(t.closeTime).toLocaleDateString() : '';
      if (d) points.push({ date: d, balance: cumPnl + (account?.balance ?? 0) - totalProfit });
    });
    if (points.length === 0 && account?.balance) {
      points.push({ date: new Date().toLocaleDateString(), balance: account.balance });
    }
    return points;
  }, [trades, account?.balance, totalProfit]);

  const actualWinCount = winTrades;
  const actualLossCount = totalTrades - winTrades;
  const winLossData = totalTrades > 0
    ? [
        { name: 'Win', value: parseFloat(((actualWinCount / totalTrades) * 100).toFixed(1)), color: '#22c55e' },
        { name: 'Loss', value: parseFloat(((actualLossCount / totalTrades) * 100).toFixed(1)), color: '#ef4444' },
      ]
    : [
        { name: 'Win', value: 0, color: '#22c55e' },
        { name: 'Loss', value: 0, color: '#ef4444' },
      ];

  const balance = account?.balance ?? 0;
  const equity = account?.equity ?? 0;
  const totalReturn = balance > 0 ? ((balance - 10000) / 10000) * 100 : 0;

  const isConnected = connected && account;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* MT5 Status Bar */}
      <motion.div variants={itemVariants}>
        <MT5Status />
      </motion.div>

      {/* Demo Mode Banner */}
      {demoMode && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative z-10"
        >
          <div className="bg-gradient-to-r from-amber-500/20 via-amber-600/10 to-amber-500/20 border border-amber-500/30 rounded-xl px-6 py-4 text-center">
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-lg font-bold text-amber-400"
            >
              We are Welcome & have look on your demo account
            </motion.h2>
          </div>
        </motion.div>
      )}

      {/* Particle Background */}
      <div className="relative">
        <div className="absolute inset-0 h-64 opacity-30 pointer-events-none">
          <ParticleNetwork />
        </div>

        {/* KPI Row */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
          <StatCard label="Account Balance" value={balance} prefix="$" decimals={2} trend={isConnected ? 2.4 : 0} trendLabel={isConnected ? '+$587 today' : ''} />
          <StatCard label="Equity" value={equity || balance} prefix="$" decimals={2} trend={isConnected ? 1.8 : 0} />
          <StatCard label="Win Rate" value={winRate} suffix="%" decimals={1} trend={isConnected ? -0.5 : 0} />
          <StatCard label="Total P&L" value={totalProfit} prefix="$" decimals={2} trend={isConnected ? 3.2 : 0} trendLabel={isConnected ? 'All time' : ''} />
        </motion.div>
      </div>

      {/* Live Quotes Row */}
      {connected && quotes.length > 0 && (
        <motion.div variants={itemVariants}>
          <GlassCard>
            <SectionHeader
              title="Live Quotes"
              subtitle="Real-time market data via MT5"
              action={
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
                  <span className="text-xs text-[#22c55e]">LIVE</span>
                  <button onClick={refreshData} className="p-1.5 rounded-md hover:bg-[rgba(255,255,255,0.05)] text-[#64748b]">
                    <RefreshCw size={14} />
                  </button>
                </div>
              }
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {quotes.slice(0, 12).map((q) => (
                <div key={q.symbol} className="bg-[rgba(255,255,255,0.02)] rounded-lg p-3 border border-[rgba(255,255,255,0.06)]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-[#f8fafc]">{q.symbol}</span>
                    <span className={`text-[10px] font-medium ${q.changePercent >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                      {q.changePercent >= 0 ? '+' : ''}{q.changePercent.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="font-mono text-[#94a3b8]">{q.bid.toFixed(5)}</span>
                    <span className="font-mono text-[#94a3b8]">{q.ask.toFixed(5)}</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equity Curve */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <GlassCard>
            <SectionHeader
              title="Equity Curve"
              subtitle="Account balance over the last 30 days"
              action={
                <span className="flex items-center gap-1 text-xs text-[#22c55e]">
                  <TrendingUp size={14} /> +{totalReturn.toFixed(1)}%
                </span>
              }
            />
            <div className="h-72">
              {isConnected && equityData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={equityData}>
                    <defs>
                      <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} interval={4} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="balance" stroke="#06b6d4" strokeWidth={2} fill="url(#equityGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-[#64748b] text-sm">
                  {isConnected ? 'No trade data to plot' : 'Connect MT5 to view equity curve'}
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* Win/Loss Donut */}
        <motion.div variants={itemVariants}>
          <GlassCard>
            <SectionHeader title="Win Rate" />
            <div className="h-48 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={winLossData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value" stroke="none">
                    {winLossData.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-bold text-[#f8fafc]">{winRate.toFixed(1)}%</span>
                <span className="text-xs text-[#64748b]">Win Rate</span>
              </div>
            </div>
            <div className="flex justify-center gap-6 mt-2">
              {winLossData.map((d) => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="text-xs text-[#94a3b8]">{d.name} {d.value}%</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Performance Table */}
      <motion.div variants={itemVariants}>
        <GlassCard>
          <SectionHeader title="Performance by Pair" subtitle="Sorted by net P&L" />
          {isConnected ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.08)]">
                  {['Pair', 'Net P&L', 'Trades', 'Win Rate', 'Avg Win', 'Avg Loss', 'Profit Factor'].map((h) => (
                    <th key={h} className="text-left text-[11px] font-medium uppercase tracking-wider text-[#64748b] px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {trades.length > 0 ? (
                  (() => {
                    const pairMap = new Map<string, { pnl: number; trades: number; wins: number }>();
                    trades.forEach(t => {
                      const e = pairMap.get(t.symbol) || { pnl: 0, trades: 0, wins: 0 };
                      e.pnl += t.profit; e.trades += 1;
                      if (t.profit > 0) e.wins += 1;
                      pairMap.set(t.symbol, e);
                    });
                    return Array.from(pairMap.entries()).map(([pair, data]) => (
                      <tr key={pair} className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-[#f8fafc]">{pair}</td>
                        <td className={`px-4 py-3 text-sm font-mono ${data.pnl >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                          {data.pnl >= 0 ? '+' : ''}${data.pnl.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-[#94a3b8]">{data.trades}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${data.wins / data.trades >= 0.55 ? 'bg-[rgba(34,197,94,0.1)] text-[#22c55e]' : 'bg-[rgba(239,68,68,0.1)] text-[#ef4444]'}`}>
                            {Math.round((data.wins / data.trades) * 100)}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-[#22c55e] font-mono">+${(data.pnl / data.trades).toFixed(0)}</td>
                        <td className="px-4 py-3 text-sm text-[#ef4444] font-mono">$--</td>
                        <td className="px-4 py-3 text-sm text-[#f8fafc] font-mono">--</td>
                      </tr>
                    ));
                  })()
                ) : (
                  <tr><td colSpan={7} className="text-center py-8 text-[#64748b] text-sm">No trades yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
          ) : (
            <div className="text-center py-8 text-[#64748b] text-sm">Connect MT5 to view performance by pair</div>
          )}
        </GlassCard>
      </motion.div>

      {/* Recent Trades */}
      <motion.div variants={itemVariants}>
        <GlassCard>
          <SectionHeader
            title="Recent Trades"
            action={
              <button className="text-xs text-[#06b6d4] hover:text-[#22d3ee] flex items-center gap-1">
                View All <ArrowUpRight size={12} />
              </button>
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.08)]">
                  {['Time', 'Pair', 'Type', 'Entry', 'Exit', 'Lots', 'P&L', 'R:R'].map((h) => (
                    <th key={h} className="text-left text-[11px] font-medium uppercase tracking-wider text-[#64748b] px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {trades.length > 0 ? trades.slice(0, 5).map((t: any) => (
                  <tr key={t.id} className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                    <td className="px-4 py-3 text-sm text-[#94a3b8] flex items-center gap-1.5">
                      <Clock size={12} /> {t.closeTime ? new Date(t.closeTime).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-[#f8fafc]">{t.symbol}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${t.type === 'buy' ? 'bg-[rgba(34,197,94,0.1)] text-[#22c55e]' : 'bg-[rgba(239,68,68,0.1)] text-[#ef4444]'}`}>
                        {t.type === 'buy' ? 'Buy' : 'Sell'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#94a3b8] font-mono">{t.openPrice}</td>
                    <td className="px-4 py-3 text-sm text-[#94a3b8] font-mono">{t.closePrice}</td>
                    <td className="px-4 py-3 text-sm text-[#94a3b8]">{t.volume}</td>
                    <td className={`px-4 py-3 text-sm font-mono font-medium ${t.profit >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                      {t.profit >= 0 ? '+' : ''}${t.profit?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#94a3b8] font-mono">-</td>
                  </tr>
                )) : (
                  <tr><td colSpan={8} className="text-center py-8 text-[#64748b] text-sm">No trades yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
