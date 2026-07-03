import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/GlassCard';
import { useMT5 } from '@/context/MT5Context';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, ZoomIn, ZoomOut, Target, MessageSquare } from 'lucide-react';

function Candlestick({ data, width, index }: { data: { open: number; high: number; low: number; close: number; volume: number }; width: number; index: number }) {
  const isBullish = data.close >= data.open;
  const color = isBullish ? '#22c55e' : '#ef4444';
  const bodyTop = Math.max(data.open, data.close);
  const bodyBottom = Math.min(data.open, data.close);
  const allPrices = [data.high, data.low];
  const range = Math.max(...allPrices) - Math.min(...allPrices) || 0.001;
  const scale = 280;
  const y = (v: number) => scale - ((v - Math.min(...allPrices)) / range) * scale;

  return (
    <g>
      <line x1={index * width + width / 2} y1={y(data.high)} x2={index * width + width / 2} y2={y(data.low)} stroke={color} strokeWidth={1} />
      <rect x={index * width + width * 0.2} y={y(bodyTop)} width={width * 0.6} height={Math.max(2, y(bodyBottom) - y(bodyTop))} fill={color} rx={1} />
    </g>
  );
}

function generateCandles(seed: number) {
  return Array.from({ length: 48 }, (_, i) => {
    const open = 1.0840 + Math.sin(i * 0.2 + seed) * 0.003 + Math.random() * 0.001;
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
}

export default function TradeReplay() {
  const { trades } = useMT5();
  const [selectedTradeId, setSelectedTradeId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [currentCandle, setCurrentCandle] = useState(30);
  const [candles, setCandles] = useState(() => generateCandles(0));
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const speeds = [1, 2, 4, 8];

  const replayTrades = trades.filter((t) => t.symbol && t.openPrice && t.closePrice).slice(0, 20);
  const selectedTrade = replayTrades.find((t) => t.id === selectedTradeId);
  const tradeForReplay = selectedTrade || (replayTrades.length > 0 ? replayTrades[0] : null);

  useEffect(() => {
    if (selectedTrade) {
      setCandles(generateCandles(parseInt(selectedTrade.id, 36) || 0));
      setCurrentCandle(0);
      setIsPlaying(false);
    }
  }, [selectedTradeId]);

  useEffect(() => {
    if (isPlaying && currentCandle < candles.length) {
      timerRef.current = setInterval(() => {
        setCurrentCandle((prev) => Math.min(prev + 1, candles.length));
      }, 500 / speed);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, speed, currentCandle, candles.length]);

  useEffect(() => {
    if (currentCandle >= candles.length) setIsPlaying(false);
  }, [currentCandle, candles.length]);

  const priceRange = candles.length > 0 ? Math.max(...candles.map((c) => c.high)) - Math.min(...candles.map((c) => c.low)) : 0.01;
  const priceMin = candles.length > 0 ? Math.min(...candles.map((c) => c.low)) : 1.08;
  const entryY = 280 - ((tradeForReplay.openPrice - priceMin) / priceRange) * 280;
  const exitY = 280 - ((tradeForReplay.closePrice - priceMin) / priceRange) * 280;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Trade Selector */}
      {replayTrades.length > 0 && (
        <GlassCard className="!p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-medium text-[#64748b] uppercase tracking-wider">Select Trade</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {replayTrades.slice(0, 10).map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTradeId(t.id)}
                className={`flex-shrink-0 px-3 py-2 text-xs rounded-lg border transition-all ${
                  t.id === selectedTradeId || (!selectedTradeId && t === replayTrades[0])
                    ? 'border-[#06b6d4] bg-[rgba(6,182,212,0.1)] text-[#06b6d4]'
                    : 'border-[rgba(255,255,255,0.08)] text-[#94a3b8] hover:border-[rgba(255,255,255,0.2)]'
                }`}
              >
                <span className="font-medium">{t.symbol}</span>
                <span className={`ml-1.5 ${t.profit >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                  {t.profit >= 0 ? '+' : ''}${Math.abs(t.profit).toFixed(0)}
                </span>
              </button>
            ))}
          </div>
        </GlassCard>
      )}

      {!tradeForReplay && replayTrades.length === 0 && (
        <GlassCard>
          <div className="text-center py-12">
            <p className="text-[#64748b] text-sm">No trades found to replay. Connect MT5 or make some trades first.</p>
          </div>
        </GlassCard>
      )}

      {tradeForReplay && (
        <>
          {/* Candlestick Chart */}
          <GlassCard className="!p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-[#f8fafc]">{tradeForReplay.symbol}</h2>
                <span className={`px-2 py-0.5 text-xs rounded-full ${tradeForReplay.type === 'buy' ? 'bg-[rgba(34,197,94,0.1)] text-[#22c55e]' : 'bg-[rgba(239,68,68,0.1)] text-[#ef4444]'}`}>
                  {tradeForReplay.type === 'buy' ? 'Buy' : 'Sell'}
                </span>
                <span className="text-xs text-[#64748b]">15-Min Chart</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-1.5 rounded text-[#64748b] hover:text-[#f8fafc] hover:bg-[rgba(255,255,255,0.05)]"><ZoomOut size={14} /></button>
                <button className="p-1.5 rounded text-[#64748b] hover:text-[#f8fafc] hover:bg-[rgba(255,255,255,0.05)]"><ZoomIn size={14} /></button>
              </div>
            </div>

            <svg viewBox="0 0 800 300" className="w-full h-72">
              {Array.from({ length: 6 }, (_, i) => (
                <line key={i} x1={0} y1={i * 50 + 25} x2={800} y2={i * 50 + 25} stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
              ))}
              {candles.slice(0, currentCandle).map((d, i) => (
                <Candlestick key={i} data={d} width={800 / candles.length} index={i} />
              ))}
              {currentCandle > 0 && candles[0] && (
                <>
                  <line x1={0} y1={entryY} x2={800} y2={entryY} stroke="#06b6d4" strokeWidth={1} strokeDasharray="4 4" opacity={0.5} />
                  <text x={750} y={entryY - 3} fontSize="10" fill="#06b6d4">Entry {tradeForReplay.openPrice.toFixed(4)}</text>
                </>
              )}
              {currentCandle >= candles.length && (
                <>
                  <line x1={0} y1={exitY} x2={800} y2={exitY} stroke="#8b5cf6" strokeWidth={1} strokeDasharray="4 4" opacity={0.5} />
                  <text x={750} y={exitY - 3} fontSize="10" fill="#8b5cf6">Exit {tradeForReplay.closePrice.toFixed(4)}</text>
                </>
              )}
              <line x1={currentCandle * (800 / candles.length)} y1={0} x2={currentCandle * (800 / candles.length)} y2={300} stroke="#06b6d4" strokeWidth={1} opacity={0.3} />
            </svg>

            <div className="h-12 mt-2 flex items-end gap-px">
              {candles.slice(0, currentCandle).map((d, i) => (
                <div key={i} className="flex-1 rounded-t" style={{ height: `${(d.volume / 600) * 100}%`, background: d.close >= d.open ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)' }} />
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.08)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentCandle(Math.max(0, currentCandle - 1))} className="p-2 rounded-lg text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[rgba(255,255,255,0.05)]">
                  <SkipBack size={16} />
                </button>
                <button onClick={() => setIsPlaying(!isPlaying)} className="p-3 rounded-full bg-[#06b6d4] text-[#050507] hover:bg-[#22d3ee] transition-colors">
                  {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                </button>
                <button onClick={() => setCurrentCandle(Math.min(candles.length, currentCandle + 1))} className="p-2 rounded-lg text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[rgba(255,255,255,0.05)]">
                  <SkipForward size={16} />
                </button>
                <button onClick={() => { setCurrentCandle(0); setIsPlaying(false); }} className="p-2 rounded-lg text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[rgba(255,255,255,0.05)]">
                  <RotateCcw size={16} />
                </button>
              </div>

              <div className="flex items-center gap-1 bg-[#1a1a24] rounded-lg p-0.5">
                {speeds.map((s) => (
                  <button key={s} onClick={() => setSpeed(s)} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${speed === s ? 'bg-[rgba(6,182,212,0.1)] text-[#06b6d4]' : 'text-[#94a3b8] hover:text-[#f8fafc]'}`}>{s}x</button>
                ))}
              </div>

              <div className="flex items-center gap-4 text-xs text-[#64748b] font-mono">
                <span>Entry: {new Date(tradeForReplay.openTime).toLocaleTimeString()}</span>
                <span>Current: {candles[Math.min(currentCandle, candles.length - 1)]?.time || '-'}</span>
              </div>
            </div>

            <div className="mt-3 h-1 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#06b6d4] to-[#8b5cf6] rounded-full transition-all" style={{ width: `${(currentCandle / candles.length) * 100}%` }} />
            </div>
          </GlassCard>

          {/* Trade Info Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <GlassCard>
              <h3 className="text-sm font-semibold text-[#f8fafc] mb-4">Trade Details</h3>
              <div className="space-y-3">
                {[
                  { label: 'Pair', value: tradeForReplay.symbol },
                  { label: 'Direction', value: tradeForReplay.type === 'buy' ? 'Buy' : 'Sell', color: tradeForReplay.type === 'buy' ? '#22c55e' : '#ef4444' },
                  { label: 'Entry', value: tradeForReplay.openPrice.toFixed(4), mono: true },
                  { label: 'Exit', value: tradeForReplay.closePrice.toFixed(4), mono: true },
                  { label: 'Lots', value: tradeForReplay.volume.toString() },
                  { label: 'P&L', value: `${tradeForReplay.profit >= 0 ? '+' : ''}$${tradeForReplay.profit.toFixed(2)}`, color: tradeForReplay.profit >= 0 ? '#22c55e' : '#ef4444' },
                  { label: 'Open', value: new Date(tradeForReplay.openTime).toLocaleString() },
                  { label: 'Close', value: new Date(tradeForReplay.closeTime).toLocaleString() },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between">
                    <span className="text-xs text-[#64748b]">{item.label}</span>
                    <span className={`text-sm font-medium ${item.mono ? 'font-mono' : ''}`} style={{ color: item.color || '#f8fafc' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard>
              <h3 className="text-sm font-semibold text-[#f8fafc] mb-4">AI Note</h3>
              <div className="p-3 bg-[rgba(6,182,212,0.05)] border border-[rgba(6,182,212,0.1)] rounded-lg">
                <p className="text-sm text-[#94a3b8]">
                  {tradeForReplay.profit >= 0
                    ? `Good trade on ${tradeForReplay.symbol}. Profit of $${tradeForReplay.profit.toFixed(2)} with ${tradeForReplay.volume} lots.`
                    : `Loss of $${Math.abs(tradeForReplay.profit).toFixed(2)} on ${tradeForReplay.symbol}. Review entry conditions for this setup.`}
                </p>
              </div>
            </GlassCard>

            <GlassCard>
              <h3 className="text-sm font-semibold text-[#f8fafc] mb-4">Annotations</h3>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-12 text-xs text-[#64748b] font-mono pt-0.5">{new Date(tradeForReplay.openTime).toLocaleTimeString()}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Target size={12} className="text-[#06b6d4]" />
                      <span className="text-xs text-[#06b6d4]">Entry</span>
                    </div>
                    <p className="text-sm text-[#94a3b8]">Entered {tradeForReplay.type === 'buy' ? 'long' : 'short'} on {tradeForReplay.symbol} at {tradeForReplay.openPrice.toFixed(4)}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-12 text-xs text-[#64748b] font-mono pt-0.5">{new Date(tradeForReplay.closeTime).toLocaleTimeString()}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <MessageSquare size={12} className="text-[#06b6d4]" />
                      <span className="text-xs text-[#06b6d4]">Exit</span>
                    </div>
                    <p className="text-sm text-[#94a3b8]">Closed at {tradeForReplay.closePrice.toFixed(4)} with {tradeForReplay.profit >= 0 ? 'profit' : 'loss'} of ${Math.abs(tradeForReplay.profit).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </>
      )}
    </motion.div>
  );
}