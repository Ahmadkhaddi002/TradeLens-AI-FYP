import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import { GlassCard } from '@/components/GlassCard';
import { SectionHeader } from '@/components/SectionHeader';
import { AIInsightCard } from '@/components/AIInsightCard';
import { ParticleNetwork } from '@/components/ParticleNetwork';
import { useMT5 } from '@/context/MT5Context';
import {
  Brain, Lightbulb, CheckCircle,
  ThumbsUp, ThumbsDown, AlertOctagon, RefreshCw, BarChart3,
  Target, Zap, Trophy, Clock, DollarSign
} from 'lucide-react';

interface Analysis {
  summary: { totalTrades: number; winRate: number; profitFactor: number; totalPnL: number; avgWin: number; avgLoss: number; avgRRR: number; expectancy: number; maxConsecutiveWins: number; maxConsecutiveLosses: number; sharpeRatio: number; bestTrade: number; worstTrade: number };
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
  shouldTrade: { recommendation: 'trade' | 'avoid' | 'caution'; reason: string; confidence: number };
  dailyTip: string;
}

const defaultAnalysis: Analysis = {
  summary: { totalTrades: 0, winRate: 0, profitFactor: 0, totalPnL: 0, avgWin: 0, avgLoss: 0, avgRRR: 0, expectancy: 0, maxConsecutiveWins: 0, maxConsecutiveLosses: 0, sharpeRatio: 0, bestTrade: 0, worstTrade: 0 },
  byPair: [], bySession: [], byDayOfWeek: [], monthlyPerformance: [], drawdown: [], rMultipleDist: [],
  psychology: [],
  insights: [],
  actionPlan: [{ id: 1, text: 'Connect your MT5 account to get personalized coaching', completed: false }],
  disciplineScore: 0,
  breakdown: [],
  shouldTrade: { recommendation: 'caution', reason: 'Connect your MT5 account for personalized trade recommendations.', confidence: 0 },
  dailyTip: 'The best traders focus on process, not profits. If your process is solid, profits follow.',
};

const recConfig = {
  trade: { icon: ThumbsUp, color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.2)', label: 'Recommended to Trade' },
  avoid: { icon: ThumbsDown, color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)', label: 'Avoid Trading' },
  caution: { icon: AlertOctagon, color: '#eab308', bg: 'rgba(234,179,8,0.1)', border: 'rgba(234,179,8,0.2)', label: 'Proceed with Caution' },
};

export default function AICoach() {
  const { connected, account, creds } = useMT5();
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis>(defaultAnalysis);
  const [insights, setInsights] = useState<Array<{ severity: 'green' | 'yellow' | 'red'; title: string; message: string; read: boolean }>>(analysis.insights.map(i => ({ ...i, read: false })));
  const [actionPlan, setActionPlan] = useState(analysis.actionPlan);

  const fetchAnalysis = useCallback(async () => {
    if (!connected || !creds) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/mt5/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creds),
      });
      const data = await res.json();
      if (data.success) setAnalysis(data.analysis);
    } catch { /* use defaults */ }
    setLoading(false);
  }, [connected, creds]);

  useEffect(() => { fetchAnalysis(); }, [fetchAnalysis]);
  useEffect(() => { setInsights(analysis.insights.map(i => ({ ...i, read: false }))); setActionPlan(analysis.actionPlan); }, [analysis]);

  const handleMarkRead = (id: number) => setInsights(insights.map((i, idx) => idx === id ? { ...i, read: true } : i));
  const handleDismiss = (id: number) => setInsights(insights.filter((_, idx) => idx !== id));
  const toggleAction = (id: number) => setActionPlan(actionPlan.map((a) => a.id === id ? { ...a, completed: !a.completed } : a));

  const isConnected = connected && account;
  const { summary, disciplineScore, breakdown, shouldTrade, psychology, dailyTip } = analysis;
  const RecIcon = recConfig[shouldTrade.recommendation].icon;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#06b6d4] to-[#8b5cf6] flex items-center justify-center">
            <Brain size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#f8fafc]">AI Trading Coach</h1>
            <p className="text-xs text-[#94a3b8]">{isConnected ? `${summary.totalTrades} trades analyzed` : 'Connect MT5 for personalized analysis'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {loading && <RefreshCw size={14} className="animate-spin text-[#06b6d4]" />}
          {isConnected && <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Should I Trade? */}
        <GlassCard className="lg:col-span-4">
          <SectionHeader title="Should I Trade Today?" />
          <div className={`p-4 rounded-xl ${recConfig[shouldTrade.recommendation].bg} border ${recConfig[shouldTrade.recommendation].border} text-center`}>
            <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center" style={{ background: recConfig[shouldTrade.recommendation].bg }}>
              <RecIcon size={32} style={{ color: recConfig[shouldTrade.recommendation].color }} />
            </div>
            <h3 className="text-lg font-bold mt-3" style={{ color: recConfig[shouldTrade.recommendation].color }}>
              {recConfig[shouldTrade.recommendation].label}
            </h3>
            <p className="text-sm text-[#94a3b8] mt-2">{shouldTrade.reason}</p>
            <div className="mt-3">
              <div className="flex justify-between text-xs text-[#64748b] mb-1">
                <span>Confidence</span>
                <span>{shouldTrade.confidence}%</span>
              </div>
              <div className="h-2 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${shouldTrade.confidence}%`, background: recConfig[shouldTrade.recommendation].color }} />
              </div>
            </div>
          </div>

          {isConnected && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm py-1">
                <span className="text-[#94a3b8]">Win Rate</span>
                <span className="text-[#f8fafc] font-mono">{summary.winRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-sm py-1">
                <span className="text-[#94a3b8]">Profit Factor</span>
                <span className="text-[#f8fafc] font-mono">{isFinite(summary.profitFactor) ? summary.profitFactor.toFixed(2) : '∞'}</span>
              </div>
              <div className="flex justify-between text-sm py-1">
                <span className="text-[#94a3b8]">Avg R:R</span>
                <span className="text-[#f8fafc] font-mono">1:{summary.avgRRR.toFixed(1)}</span>
              </div>
              <div className="flex justify-between text-sm py-1">
                <span className="text-[#94a3b8]">Expectancy</span>
                <span className={`font-mono ${summary.expectancy >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>${summary.expectancy.toFixed(2)}</span>
              </div>
            </div>
          )}
        </GlassCard>

        {/* Discipline Score */}
        <GlassCard className="lg:col-span-4 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 pointer-events-none"><ParticleNetwork /></div>
          <div className="relative z-10">
            <SectionHeader title="Discipline Score" />
            <div className="flex items-center gap-6">
              <div className="w-36 h-36 relative flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="100%" data={[{ name: 'Score', value: disciplineScore, fill: '#06b6d4' }]} startAngle={180} endAngle={0}>
                    <RadialBar dataKey="value" cornerRadius={8} background={{ fill: 'rgba(255,255,255,0.05)' }} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-[#f8fafc]">{disciplineScore}</span>
                  <span className="text-[10px] text-[#64748b] uppercase tracking-wider">of 100</span>
                </div>
              </div>
              <div className="flex-1 space-y-3">
                {breakdown.map((d) => (
                  <div key={d.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#94a3b8]">{d.name}</span>
                      <span className="text-[#f8fafc] font-medium">{d.value}%</span>
                    </div>
                    <div className="h-1.5 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${d.value}%`, background: d.fill }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Daily Tip */}
        <GlassCard className="lg:col-span-4">
          <SectionHeader title="Coach's Tip" subtitle="Daily actionable advice" />
          <div className="p-4 bg-gradient-to-br from-[rgba(139,92,246,0.05)] to-[rgba(6,182,212,0.05)] rounded-xl border border-[rgba(139,92,246,0.1)] h-full flex flex-col justify-center">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#06b6d4] flex items-center justify-center flex-shrink-0 mt-1">
                <Lightbulb size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-[#f8fafc] leading-relaxed">{dailyTip}</p>
                {isConnected && (
                  <div className="mt-4 flex items-center gap-4 text-xs text-[#64748b]">
                    <span className="flex items-center gap-1"><Trophy size={12} /> {summary.totalTrades} trades</span>
                    <span className="flex items-center gap-1"><BarChart3 size={12} /> {summary.winRate.toFixed(0)}% WR</span>
                    <span className="flex items-center gap-1"><DollarSign size={12} /> ${summary.totalPnL.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Psychological Metrics */}
      <GlassCard>
        <SectionHeader title="Psychological Metrics" subtitle="Real-time behavioral analysis" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {psychology.length === 0 ? (
            <div className="col-span-full text-center py-6 text-sm text-[#64748b]">Connect MT5 to see your psychological metrics</div>
          ) : (
            psychology.map((m, i) => (
              <motion.div key={m.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="p-3 bg-[rgba(255,255,255,0.02)] rounded-lg border border-[rgba(255,255,255,0.04)]">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${m.status === 'green' ? 'bg-[#22c55e]' : m.status === 'yellow' ? 'bg-yellow-400' : 'bg-[#ef4444]'}`} />
                  <span className="text-[10px] text-[#64748b] uppercase tracking-wider">{m.label}</span>
                </div>
                <div className="text-lg font-semibold text-[#f8fafc] font-mono">{m.value}</div>
                <div className="text-xs text-[#94a3b8] mt-0.5">{m.name}</div>
              </motion.div>
            ))
          )}
        </div>
      </GlassCard>

      {/* AI Insights & Action Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <SectionHeader title="AI Insights" subtitle={`${insights.filter((i) => !i.read).length} unread insights`} />
          {insights.length === 0 ? (
            <GlassCard><div className="p-6 text-center text-sm text-[#64748b]">No insights yet. Trade more to generate personalized feedback.</div></GlassCard>
          ) : (
            <div className="relative">
              {insights.map((insight, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto', marginBottom: 16 }}
                  transition={{ delay: idx * 0.15, duration: 0.35, ease: 'easeOut' }}
                >
                  <AIInsightCard severity={insight.severity as 'green' | 'yellow' | 'red'}
                    title={insight.title} message={insight.message}
                    timestamp={`Insight #${idx + 1}`} read={insight.read || false}
                    onMarkRead={() => handleMarkRead(idx)}
                    onDismiss={() => handleDismiss(idx)} />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Action Plan */}
        <div>
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target size={16} className="text-yellow-400" />
                <h3 className="text-sm font-semibold text-[#f8fafc]">Action Plan</h3>
              </div>
            </div>
            <div className="space-y-3">
              {actionPlan.map((action) => (
                <button key={action.id} onClick={() => toggleAction(action.id)}
                  className="w-full flex items-start gap-3 text-left p-3 rounded-lg hover:bg-[rgba(255,255,255,0.02)] transition-colors group">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                    action.completed ? 'bg-[#22c55e] border-[#22c55e]' : 'border-[rgba(255,255,255,0.2)] group-hover:border-[#06b6d4]'
                  }`}>
                    {action.completed && <CheckCircle size={14} className="text-white" />}
                  </div>
                  <span className={`text-sm leading-relaxed ${action.completed ? 'text-[#64748b] line-through' : 'text-[#94a3b8]'}`}>{action.text}</span>
                </button>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.08)]">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#64748b]">Progress</span>
                <span className="text-[#06b6d4] font-medium">{actionPlan.filter((a) => a.completed).length}/{actionPlan.length}</span>
              </div>
              <div className="mt-2 h-1.5 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#06b6d4] to-[#22c55e] rounded-full transition-all"
                  style={{ width: `${(actionPlan.filter((a) => a.completed).length / actionPlan.length) * 100}%` }} />
              </div>
            </div>
          </GlassCard>

          {/* Quick Stats */}
          {isConnected && (
            <GlassCard className="mt-4">
              <SectionHeader title="Quick Stats" />
              <div className="space-y-3">
                <div className="flex items-center justify-between py-1">
                  <span className="flex items-center gap-1.5 text-xs text-[#94a3b8]"><Trophy size={12} /> Best Trade</span>
                  <span className="text-xs font-mono text-[#22c55e]">+${summary.bestTrade.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="flex items-center gap-1.5 text-xs text-[#94a3b8]"><Trophy size={12} /> Worst Trade</span>
                  <span className="text-xs font-mono text-[#ef4444]">-${Math.abs(summary.worstTrade).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="flex items-center gap-1.5 text-xs text-[#94a3b8]"><Zap size={12} /> Sharpe Ratio</span>
                  <span className={`text-xs font-mono ${summary.sharpeRatio >= 1 ? 'text-[#22c55e]' : 'text-[#eab308]'}`}>{summary.sharpeRatio.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="flex items-center gap-1.5 text-xs text-[#94a3b8]"><Clock size={12} /> Win Streak</span>
                  <span className="text-xs font-mono text-[#f8fafc]">{summary.maxConsecutiveWins}</span>
                </div>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </motion.div>
  );
}
