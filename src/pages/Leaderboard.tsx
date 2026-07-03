import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/GlassCard';
import { SectionHeader } from '@/components/SectionHeader';
import { useMT5 } from '@/context/MT5Context';
import { Trophy, ArrowUpRight } from 'lucide-react';

interface Trader {
  rank: number;
  name: string;
  avatar: string;
  loginId: string;
  server: string;
  broker: string;
  balance: number;
  equity: number;
  winRate: number;
  profitFactor: number;
  totalReturn: number;
  consistency: number;
  trades: number;
}

const periods = ['This Week', 'This Month', 'All Time'];

const medalColors: Record<number, string> = {
  1: 'from-yellow-400 to-yellow-600',
  2: 'from-gray-300 to-gray-500',
  3: 'from-amber-600 to-amber-800',
};

const medalBg: Record<number, string> = {
  1: 'bg-[rgba(234,179,8,0.1)]',
  2: 'bg-[rgba(156,163,175,0.1)]',
  3: 'bg-[rgba(180,83,9,0.1)]',
};

export default function Leaderboard() {
  const { account, trades } = useMT5();
  const [period, setPeriod] = useState('This Month');
  const [leaderboard, setLeaderboard] = useState<Trader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('/api/leaderboard')
      .then((r) => r.json())
      .then(setLeaderboard)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalTrades = trades.length;
  const wins = trades.filter((t) => t.profit > 0).length;
  const userWinRate = totalTrades > 0 ? Math.round((wins / totalTrades) * 100) : 0;
  const totalPnl = trades.reduce((sum, t) => sum + t.profit, 0);
  const grossProfit = trades.filter((t) => t.profit > 0).reduce((s, t) => s + t.profit, 0);
  const grossLoss = Math.abs(trades.filter((t) => t.profit < 0).reduce((s, t) => s + t.profit, 0));
  const userProfitFactor = grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : '∞';
  const balance = account?.balance || 25000;
  const userReturn = balance > 0 ? Math.round(((totalPnl / balance) * 100) * 10) / 10 : 0;

  const userRank = leaderboard.length > 0
    ? leaderboard.findIndex((t) => userWinRate >= t.winRate && totalTrades >= t.trades) + 1
    : 0;

  const rankPosition = userRank > 0 ? userRank : leaderboard.length + 1;
  const totalParticipants = leaderboard.length + (userRank > 0 ? 0 : 1);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
            <Trophy size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#f8fafc]">Leaderboard</h1>
            <p className="text-xs text-[#94a3b8]">Top performing traders ranked by consistency</p>
          </div>
        </div>

        <div className="flex bg-[#1a1a24] border border-[rgba(255,255,255,0.08)] rounded-lg overflow-hidden">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 text-xs font-medium transition-colors ${
                period === p ? 'bg-[rgba(6,182,212,0.1)] text-[#06b6d4]' : 'text-[#94a3b8] hover:text-[#f8fafc]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <GlassCard>
          <div className="text-center py-12 text-[#64748b] text-sm">Loading leaderboard...</div>
        </GlassCard>
      ) : leaderboard.length === 0 ? (
        <GlassCard>
          <div className="text-center py-12">
            <Trophy size={40} className="mx-auto text-[#64748b] mb-3" />
            <div className="text-sm text-[#64748b]">No connected traders yet.</div>
            <div className="text-xs text-[#64748b] mt-1">Connect your MT5 account to appear on the leaderboard.</div>
          </div>
        </GlassCard>
      ) : (
        <>
          {/* Top 3 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {leaderboard.slice(0, 3).map((trader, i) => (
              <motion.div
                key={trader.rank}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassCard className={`${medalBg[trader.rank] || ''}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${medalColors[trader.rank] || 'from-[#06b6d4] to-[#3b82f6]'} flex items-center justify-center text-white font-bold text-lg`}>
                      {trader.rank}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#06b6d4] to-[#8b5cf6] flex items-center justify-center text-xs font-semibold text-white">
                          {trader.avatar}
                        </div>
                        <h3 className="text-base font-semibold text-[#f8fafc]">{trader.name}</h3>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        <div>
                          <div className="text-xs text-[#64748b]">Win Rate</div>
                          <div className="text-sm font-semibold text-[#f8fafc]">{trader.winRate}%</div>
                        </div>
                        <div>
                          <div className="text-xs text-[#64748b]">Return</div>
                          <div className="text-sm font-semibold text-[#22c55e]">+{trader.totalReturn}%</div>
                        </div>
                        <div>
                          <div className="text-xs text-[#64748b]">PF</div>
                          <div className="text-sm font-semibold text-[#f8fafc]">{trader.profitFactor}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          {/* Full Rankings Table */}
          <GlassCard>
            <SectionHeader title="Rankings" subtitle={`${leaderboard.length} active traders`} />
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,0.08)]">
                    {['Rank', 'Trader', 'Account', 'Server', 'Balance', 'Equity', 'Win Rate', 'Profit Factor', 'Total Return', 'Consistency', 'Trades'].map((h) => (
                      <th key={h} className="text-left text-[11px] font-medium uppercase tracking-wider text-[#64748b] px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((t) => (
                    <tr key={t.rank} className={`border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)] transition-colors ${t.rank <= 3 ? medalBg[t.rank] || '' : ''}`}>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-bold ${t.rank <= 3 ? 'text-[#f8fafc]' : 'text-[#64748b]'}`}>
                          {t.rank <= 3 ? ['🥇', '🥈', '🥉'][t.rank - 1] : `#${t.rank}`}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#06b6d4] to-[#8b5cf6] flex items-center justify-center text-xs font-semibold text-white">
                            {t.avatar}
                          </div>
                          <span className="text-sm font-medium text-[#f8fafc]">{t.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-[#94a3b8]">{t.loginId}</td>
                      <td className="px-4 py-3 text-sm text-[#94a3b8]">{t.server}</td>
                      <td className="px-4 py-3 text-sm text-[#22c55e] font-mono">${t.balance?.toLocaleString() || '0'}</td>
                      <td className="px-4 py-3 text-sm text-[#f8fafc] font-mono">${t.equity?.toLocaleString() || '0'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${t.winRate >= 60 ? 'bg-[rgba(34,197,94,0.1)] text-[#22c55e]' : 'bg-[rgba(239,68,68,0.1)] text-[#ef4444]'}`}>
                          {t.winRate}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#f8fafc] font-mono">{t.profitFactor}</td>
                      <td className="px-4 py-3 text-sm text-[#22c55e] font-medium">+{t.totalReturn}%</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#06b6d4] to-[#22c55e] rounded-full" style={{ width: `${t.consistency}%` }} />
                          </div>
                          <span className="text-xs text-[#94a3b8]">{t.consistency}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#94a3b8]">{t.trades}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>

          {/* Your Rank */}
          <GlassCard className="!bg-[rgba(6,182,212,0.05)] !border-[rgba(6,182,212,0.15)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#06b6d4] to-[#8b5cf6] flex items-center justify-center text-sm font-semibold text-white">
                  {account?.name?.slice(0, 2).toUpperCase() || 'TK'}
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#f8fafc]">
                    Your Ranking: <span className="text-[#06b6d4]">#{rankPosition}</span> of {totalParticipants}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-[#94a3b8]">
                    <span>Login: {account?.login || '—'}</span>
                    <span>Server: {account?.server || '—'}</span>
                    <span>Balance: ${account?.balance?.toLocaleString() || '0'}</span>
                    <span>Win Rate {userWinRate}%</span>
                    <span>PF {userProfitFactor}</span>
                    <span>Return {userReturn >= 0 ? '+' : ''}{userReturn}%</span>
                    <span>{totalTrades} trades</span>
                  </div>
                </div>
              </div>
              <button className="text-xs text-[#06b6d4] hover:text-[#22d3ee] flex items-center gap-1">
                Improve your rank <ArrowUpRight size={12} />
              </button>
            </div>
          </GlassCard>
        </>
      )}
    </motion.div>
  );
}