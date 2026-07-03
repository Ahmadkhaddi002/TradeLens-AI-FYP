import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/GlassCard';
import { useMT5 } from '@/context/MT5Context';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarJournal() {
  const { trades } = useMT5();
  const [month, setMonth] = useState(() => new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const year = new Date().getFullYear();

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const dayDataMap = useMemo(() => {
    const map = new Map<number, { pnl: number; tradeCount: number; wins: number; losses: number; winRate: number }>();
    if (!trades || trades.length === 0) return map;
    const currentYear = year;
    const currentMonth = month;
    trades.forEach((t) => {
      const d = new Date(t.closeTime);
      if (d.getFullYear() !== currentYear || d.getMonth() !== currentMonth) return;
      const day = d.getDate();
      const entry = map.get(day) || { pnl: 0, tradeCount: 0, wins: 0, losses: 0, winRate: 0 };
      entry.pnl += t.profit;
      entry.tradeCount += 1;
      if (t.profit >= 0) entry.wins += 1;
      else entry.losses += 1;
      entry.winRate = entry.tradeCount > 0 ? Math.round((entry.wins / entry.tradeCount) * 100) : 0;
      map.set(day, entry);
    });
    return map;
  }, [trades, month, year]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const maxPnl = Math.max(...Array.from(dayDataMap.values()).map((d) => Math.abs(d.pnl)), 1);
  const totalTrades = Array.from(dayDataMap.values()).reduce((sum, d) => sum + d.tradeCount, 0);
  const totalPnl = Array.from(dayDataMap.values()).reduce((sum, d) => sum + d.pnl, 0);

  function getHeatmapColor(pnl: number) {
    if (pnl === 0) return 'transparent';
    if (pnl > 0) {
      const intensity = Math.min(pnl / maxPnl, 1);
      return `rgba(34, 197, 94, ${0.1 + intensity * 0.5})`;
    }
    const intensity = Math.min(Math.abs(pnl) / maxPnl, 1);
    return `rgba(239, 68, 68, ${0.1 + intensity * 0.5})`;
  }

  const dayTrades = useMemo(() => {
    if (selectedDay === null) return [];
    return trades.filter((t) => {
      const d = new Date(t.closeTime);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === selectedDay;
    });
  }, [trades, selectedDay, month, year]);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => setMonth(Math.max(0, month - 1))} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50">
            <ChevronLeft size={18} />
          </button>
          <h2 className="text-xl font-semibold text-foreground">{monthNames[month]} {year}</h2>
          <button onClick={() => setMonth(Math.min(11, month + 1))} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50">
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">
            <span className="text-foreground font-medium">{dayDataMap.size}</span> trading days
          </span>
          <span className="text-muted-foreground">
            <span className="text-foreground font-medium">{totalTrades}</span> trades
          </span>
          <span className={`font-medium ${totalPnl >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
            {totalPnl >= 0 ? '+' : ''}${totalPnl.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Calendar Grid */}
      <GlassCard>
        {dayDataMap.size > 0 && dayDataMap.size <= daysInMonth / 2 ? (
          /* Sparse trading — show only days with trades */
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground mb-3">{dayDataMap.size} trading days this month</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {Array.from(dayDataMap.entries()).sort((a, b) => a[0] - b[0]).map(([day, dd]) => (
                <button key={day} onClick={() => setSelectedDay(day)}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-[rgba(255,255,255,0.2)] transition-all hover:scale-[1.02] text-left"
                  style={{ background: getHeatmapColor(dd.pnl) }}>
                  <span className="text-lg font-bold text-foreground w-6">{day}</span>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-semibold font-mono ${dd.pnl >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                      {dd.pnl >= 0 ? '+' : ''}{Math.abs(dd.pnl) >= 1000 ? `${(dd.pnl / 1000).toFixed(1)}k` : Math.round(dd.pnl)}
                    </div>
                    <div className="text-xs text-muted-foreground">{dd.tradeCount} trade{dd.tradeCount !== 1 ? 's' : ''} · {dd.winRate}% win</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Full calendar heatmap */
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider py-2">{d}</div>
            ))}
            {Array.from({ length: firstDayOfWeek }, (_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dayData = dayDataMap.get(day);
              return (
                <button
                  key={day}
                  onClick={() => dayData && setSelectedDay(day)}
                  className="aspect-square rounded-lg p-1.5 flex flex-col items-start justify-between transition-all hover:scale-105 border border-transparent hover:border-[rgba(255,255,255,0.1)]"
                  style={{ background: getHeatmapColor(dayData?.pnl || 0) }}
                >
                  <span className="text-xs text-muted-foreground">{day}</span>
                  {dayData && (
                    <>
                      <span className={`text-sm font-semibold font-mono ${dayData.pnl >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                        {dayData.pnl >= 0 ? '+' : ''}{Math.abs(dayData.pnl) >= 1000 ? `${(dayData.pnl / 1000).toFixed(1)}k` : Math.round(dayData.pnl)}
                      </span>
                      <div className="w-full flex gap-px">
                        {Array.from({ length: Math.min(dayData.tradeCount, 8) }, (_, j) => (
                          <div key={j} className="flex-1 h-1 rounded-full" style={{ background: j < dayData.wins ? '#22c55e' : '#ef4444', opacity: 0.6 }} />
                        ))}
                      </div>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border/80">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-[rgba(34,197,94,0.3)]" />
            <span className="text-xs text-muted-foreground">Profitable</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-[rgba(239,68,68,0.3)]" />
            <span className="text-xs text-muted-foreground">Losing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded border border-[rgba(255,255,255,0.1)]" />
            <span className="text-xs text-muted-foreground">No trades</span>
          </div>
        </div>
      </GlassCard>

      {/* Day Detail Modal */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedDay(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border/80 rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{monthNames[month]} {selectedDay}, {year}</h3>
                  <div className="flex items-center gap-3 mt-1 text-sm">
                    {dayDataMap.get(selectedDay) && (
                      <>
                        <span className={`font-mono font-medium ${(dayDataMap.get(selectedDay)?.pnl || 0) >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                          {(dayDataMap.get(selectedDay)?.pnl || 0) >= 0 ? '+' : ''}${(dayDataMap.get(selectedDay)?.pnl || 0).toLocaleString()}
                        </span>
                        <span className="text-muted-foreground">{dayDataMap.get(selectedDay)?.tradeCount || 0} trades</span>
                        <span className="text-muted-foreground">{dayDataMap.get(selectedDay)?.winRate || 0}% win rate</span>
                      </>
                    )}
                  </div>
                </div>
                <button onClick={() => setSelectedDay(null)} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50">
                  <X size={18} />
                </button>
              </div>

              {dayTrades.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-8">No trades on this day</p>
              ) : (
                <div className="space-y-2">
                  {dayTrades.map((t) => (
                    <div key={t.id} className="flex items-center justify-between p-3 bg-[rgba(255,255,255,0.02)] rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${t.type === 'buy' ? 'bg-[rgba(34,197,94,0.1)] text-[#22c55e]' : 'bg-[rgba(239,68,68,0.1)] text-[#ef4444]'}`}>
                          {t.type === 'buy' ? 'Buy' : 'Sell'}
                        </span>
                        <span className="text-sm font-medium text-foreground">{t.symbol}</span>
                        <span className="text-xs text-muted-foreground">{t.volume} lots</span>
                      </div>
                      <span className={`text-sm font-mono font-medium ${t.profit >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                        {t.profit >= 0 ? '+' : ''}${t.profit.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {dayTrades.length > 0 && (
                <div className="mt-4 p-3 bg-[rgba(6,182,212,0.05)] border border-[rgba(6,182,212,0.1)] rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <span className="text-[#06b6d4] font-medium">AI Insight:</span>{' '}
                    You had {dayTrades.length} trade{dayTrades.length > 1 ? 's' : ''} on this day
                    with {dayTrades.filter((t) => t.profit >= 0).length} winners and {dayTrades.filter((t) => t.profit < 0).length} losers.
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}