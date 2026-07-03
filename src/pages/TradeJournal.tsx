import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/GlassCard';
import { SectionHeader } from '@/components/SectionHeader';
import { useMT5 } from '@/context/MT5Context';
import { Search, Download, Filter, ChevronDown, ChevronUp, Calendar, ArrowUpDown, RefreshCw } from 'lucide-react';

const pairs = ['All', 'EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD', 'US30', 'AUDUSD', 'USDCAD', 'BTCUSD'];
const types = ['All', 'Buy', 'Sell'];
const results = ['All', 'Win', 'Loss'];

export default function TradeJournal() {
  const { connected, trades: mt5Trades, refreshData } = useMT5();
  const [search, setSearch] = useState('');
  const [filterPair, setFilterPair] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterResult, setFilterResult] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  const allTrades = useMemo(() => {
    if (!connected || mt5Trades.length === 0) return [];
    return mt5Trades.map((t, i) => ({
      id: t.id || `mt5_${i}`,
      date: new Date(t.closeTime),
      pair: t.symbol,
      type: t.type === 'buy' ? 'Buy' as const : 'Sell' as const,
      entry: t.openPrice,
      exit: t.closePrice,
      lots: t.volume,
      pnl: Math.round(t.profit),
      rr: '',
      session: '',
      tags: [] as string[],
      notes: '',
    }));
  }, [connected, mt5Trades]);

  const filtered = useMemo(() => allTrades.filter((t) => {
    const matchesSearch = t.pair.toLowerCase().includes(search.toLowerCase());
    const matchesPair = filterPair === 'All' || t.pair === filterPair;
    const matchesType = filterType === 'All' || t.type === filterType;
    const matchesResult = filterResult === 'All' || (filterResult === 'Win' ? t.pnl > 0 : t.pnl <= 0);
    return matchesSearch && matchesPair && matchesType && matchesResult;
  }), [allTrades, search, filterPair, filterType, filterResult]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const totalPnl = allTrades.reduce((s, t) => s + t.pnl, 0);
  const wins = allTrades.filter(t => t.pnl > 0).length;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Summary Bar */}
      <div className="grid grid-cols-4 gap-4">
        <GlassCard><div className="p-4"><div className="text-xs text-[#64748b]">Total Trades</div><div className="text-xl font-bold text-[#f8fafc] mt-1">{allTrades.length}</div></div></GlassCard>
        <GlassCard><div className="p-4"><div className="text-xs text-[#64748b]">Wins</div><div className="text-xl font-bold text-[#22c55e] mt-1">{wins}</div></div></GlassCard>
        <GlassCard><div className="p-4"><div className="text-xs text-[#64748b]">Losses</div><div className="text-xl font-bold text-[#ef4444] mt-1">{allTrades.length - wins}</div></div></GlassCard>
        <GlassCard><div className="p-4"><div className="text-xs text-[#64748b]">Total P&L</div><div className={`text-xl font-bold mt-1 font-mono ${totalPnl >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>{totalPnl >= 0 ? '+' : ''}${totalPnl.toLocaleString()}</div></div></GlassCard>
      </div>

      {/* Filters */}
      <GlassCard className="!p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-[#1a1a24] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-2 flex-1 min-w-[200px]">
            <Search size={14} className="text-[#64748b] mr-2" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by pair..."
              className="bg-transparent text-sm text-[#f8fafc] placeholder-[#64748b] outline-none w-full" />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-[#64748b]" />
            <select value={filterPair} onChange={(e) => setFilterPair(e.target.value)}
              className="bg-[#1a1a24] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-2 text-sm text-[#f8fafc] outline-none">
              {pairs.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="flex bg-[#1a1a24] border border-[rgba(255,255,255,0.08)] rounded-lg overflow-hidden">
            {types.map((t) => (
              <button key={t} onClick={() => setFilterType(t)}
                className={`px-3 py-2 text-xs font-medium transition-colors ${filterType === t ? 'bg-[rgba(6,182,212,0.1)] text-[#06b6d4]' : 'text-[#94a3b8] hover:text-[#f8fafc]'}`}>{t}</button>
            ))}
          </div>
          <div className="flex bg-[#1a1a24] border border-[rgba(255,255,255,0.08)] rounded-lg overflow-hidden">
            {results.map((r) => (
              <button key={r} onClick={() => setFilterResult(r)}
                className={`px-3 py-2 text-xs font-medium transition-colors ${filterResult === r ? 'bg-[rgba(6,182,212,0.1)] text-[#06b6d4]' : 'text-[#94a3b8] hover:text-[#f8fafc]'}`}>{r}</button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-3 py-2 border border-[rgba(255,255,255,0.08)] rounded-lg text-sm text-[#94a3b8] hover:text-[#f8fafc] hover:border-[rgba(255,255,255,0.15)] transition-colors">
            <Download size={14} /> Export CSV
          </button>
          {connected && (
            <button onClick={refreshData} className="p-2 rounded-lg text-[#64748b] hover:text-[#f8fafc] hover:bg-[rgba(255,255,255,0.05)]">
              <RefreshCw size={14} />
            </button>
          )}
        </div>
      </GlassCard>

      {/* Table */}
      <GlassCard>
        <SectionHeader title="All Trades" subtitle={connected ? `${allTrades.length} trades` : 'Connect MT5 to see your trades'} />
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.08)]">
                {['Date/Time', 'Pair', 'Type', 'Entry', 'Exit', 'Lots', 'P&L', 'R:R', 'Session', 'Tags'].map((h) => (
                  <th key={h} className="text-left text-[11px] font-medium uppercase tracking-wider text-[#64748b] px-4 py-3">
                    <span className="flex items-center gap-1">{h} <ArrowUpDown size={10} /></span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allTrades.length === 0 ? (
                <tr><td colSpan={10} className="px-4 py-12 text-center text-sm text-[#64748b]">{connected ? 'No trades found. Trades will appear once your MT5 account has trading history.' : 'Connect your MT5 account to see your trades.'}</td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={10} className="px-4 py-12 text-center text-sm text-[#64748b]">No trades match your filters</td></tr>
              ) : (
                paginated.map((t) => (
                  <>
                    <tr key={t.id} onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
                      className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)] transition-colors cursor-pointer">
                      <td className="px-4 py-3 text-sm text-[#94a3b8]">
                        <span className="flex items-center gap-1"><Calendar size={12} /> {t.date.toLocaleDateString()}</span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-[#f8fafc]">{t.pair}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${t.type === 'Buy' ? 'bg-[rgba(34,197,94,0.1)] text-[#22c55e]' : 'bg-[rgba(239,68,68,0.1)] text-[#ef4444]'}`}>{t.type}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#94a3b8] font-mono">{t.entry.toFixed(5)}</td>
                      <td className="px-4 py-3 text-sm text-[#94a3b8] font-mono">{t.exit.toFixed(5)}</td>
                      <td className="px-4 py-3 text-sm text-[#94a3b8]">{t.lots}</td>
                      <td className={`px-4 py-3 text-sm font-mono font-medium ${t.pnl >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>{t.pnl >= 0 ? '+' : ''}${t.pnl}</td>
                      <td className="px-4 py-3 text-sm text-[#94a3b8] font-mono">{t.rr || '-'}</td>
                      <td className="px-4 py-3 text-sm text-[#94a3b8]">{t.session || '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {t.tags.map((tag) => (
                            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-[rgba(6,182,212,0.1)] text-[#06b6d4]">{tag}</span>
                          ))}
                          <span className="text-[#64748b] ml-1">{expandedId === t.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}</span>
                        </div>
                      </td>
                    </tr>
                    {expandedId === t.id && (
                      <tr key={`${t.id}_exp`}>
                        <td colSpan={10} className="px-4 py-4 bg-[rgba(6,182,212,0.02)]">
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <h4 className="text-xs font-medium text-[#94a3b8] mb-2">Trade Details</h4>
                              <div className="grid grid-cols-4 gap-4 text-sm">
                                <div><span className="text-[#64748b]">Volume:</span> <span className="text-[#f8fafc] font-mono">{t.lots} lots</span></div>
                                <div><span className="text-[#64748b]">Entry:</span> <span className="text-[#f8fafc] font-mono">{t.entry}</span></div>
                                <div><span className="text-[#64748b]">Exit:</span> <span className="text-[#f8fafc] font-mono">{t.exit}</span></div>
                                <div><span className="text-[#64748b]">P&L:</span> <span className={`font-mono ${t.pnl >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>${t.pnl}</span></div>
                              </div>
                            </div>
                            <div className="w-48">
                              <h4 className="text-xs font-medium text-[#94a3b8] mb-2">Notes</h4>
                              <div className="w-full h-24 bg-[#1a1a24] rounded-lg flex items-center justify-center text-xs text-[#64748b]">
                                {t.notes || 'No notes'}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[rgba(255,255,255,0.08)]">
          <span className="text-xs text-[#64748b]">Showing {(currentPage - 1) * perPage + 1}-{Math.min(currentPage * perPage, filtered.length)} of {filtered.length} trades</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}
              className="px-3 py-1.5 text-xs rounded-lg border border-[rgba(255,255,255,0.08)] text-[#94a3b8] hover:text-[#f8fafc] disabled:opacity-30">Prev</button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 text-xs rounded-lg transition-colors ${currentPage === i + 1 ? 'bg-[rgba(6,182,212,0.1)] text-[#06b6d4]' : 'text-[#94a3b8] hover:text-[#f8fafc]'}`}>{i + 1}</button>
            ))}
            <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-xs rounded-lg border border-[rgba(255,255,255,0.08)] text-[#94a3b8] hover:text-[#f8fafc] disabled:opacity-30">Next</button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
