import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/GlassCard';
import { SectionHeader } from '@/components/SectionHeader';
import { ChevronLeft, ChevronRight, Clock, Filter, Wifi, WifiOff } from 'lucide-react';

interface CalendarEvent {
  time: string;
  currency: string;
  event: string;
  impact: string;
  actual: string;
  forecast: string;
  previous: string;
  date: string;
}

const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD', 'CNY'];
const impacts = [
  { label: 'High', color: '#ef4444' },
  { label: 'Medium', color: '#eab308' },
  { label: 'Low', color: '#64748b' },
];

export default function EconomicCalendar() {
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>([]);
  const [selectedImpacts, setSelectedImpacts] = useState<string[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('/api/economic-calendar')
      .then((r) => r.json())
      .then((data) => { setEvents(data); setConnected(true); })
      .catch(() => { setConnected(false); })
      .finally(() => setLoading(false));
  }, []);

  const toggleCurrency = (c: string) => {
    setSelectedCurrencies((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  };

  const toggleImpact = (i: string) => {
    setSelectedImpacts((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]);
  };

  const filtered = events.filter((e) => {
    const matchCurrency = selectedCurrencies.length === 0 || selectedCurrencies.includes(e.currency);
    const matchImpact = selectedImpacts.length === 0 || selectedImpacts.includes(e.impact);
    return matchCurrency && matchImpact;
  });

  const getImpactColor = (impact: string) => {
    if (impact === 'high') return '#ef4444';
    if (impact === 'medium') return '#eab308';
    return '#64748b';
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Connection Status */}
      {!connected && !loading && (
        <div className="flex items-center gap-2 px-4 py-2 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] rounded-lg text-sm text-[#ef4444]">
          <WifiOff size={14} /> Calendar server unavailable — showing cached data
        </div>
      )}
      {connected && !loading && (
        <div className="flex items-center gap-2 px-4 py-2 bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.2)] rounded-lg text-sm text-[#22c55e]">
          <Wifi size={14} /> Live data
        </div>
      )}

      {/* Filters */}
      <GlassCard className="!p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <ChevronLeft size={16} className="text-[#94a3b8] cursor-pointer hover:text-[#f8fafc]" />
            <span className="text-sm font-medium text-[#f8fafc]">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            <ChevronRight size={16} className="text-[#94a3b8] cursor-pointer hover:text-[#f8fafc]" />
            <button className="ml-2 text-xs px-3 py-1.5 bg-[rgba(6,182,212,0.1)] text-[#06b6d4] rounded-md">Today</button>
          </div>

          <div className="h-6 w-px bg-[rgba(255,255,255,0.08)]" />

          <div className="flex items-center gap-2">
            <Filter size={14} className="text-[#64748b]" />
            {currencies.map((c) => (
              <button
                key={c}
                onClick={() => toggleCurrency(c)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  selectedCurrencies.includes(c)
                    ? 'bg-[rgba(6,182,212,0.1)] text-[#06b6d4] border border-[#06b6d4]'
                    : 'bg-[#1a1a24] text-[#94a3b8] border border-[rgba(255,255,255,0.08)] hover:text-[#f8fafc]'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {impacts.map((i) => (
              <button
                key={i.label}
                onClick={() => toggleImpact(i.label)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  selectedImpacts.includes(i.label)
                    ? 'bg-[rgba(255,255,255,0.05)] text-[#f8fafc] border border-[rgba(255,255,255,0.15)]'
                    : 'text-[#64748b] border border-transparent'
                }`}
              >
                <div className="w-2 h-2 rounded-full" style={{ background: i.color }} />
                {i.label}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <GlassCard>
            <SectionHeader title="Economic Events" subtitle={`${filtered.length} events today`} />
            {loading ? (
              <div className="text-center py-12 text-[#64748b] text-sm">Loading calendar data...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[rgba(255,255,255,0.08)]">
                      {['Time', 'Currency', 'Event', 'Impact', 'Actual', 'Forecast', 'Previous'].map((h) => (
                        <th key={h} className="text-left text-[11px] font-medium uppercase tracking-wider text-[#64748b] px-4 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((e, i) => (
                      <tr key={i} className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                        <td className="px-4 py-3 text-sm text-[#94a3b8] font-mono flex items-center gap-1.5">
                          <Clock size={12} /> {e.time}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-0.5 rounded bg-[rgba(255,255,255,0.05)] text-[#f8fafc] font-medium">{e.currency}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-[#f8fafc]">{e.event}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full" style={{ background: getImpactColor(e.impact) }} />
                            <span className="text-xs text-[#94a3b8] capitalize">{e.impact}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-mono font-medium text-[#f8fafc]">{e.actual}</td>
                        <td className="px-4 py-3 text-sm font-mono text-[#94a3b8]">{e.forecast}</td>
                        <td className="px-4 py-3 text-sm font-mono text-[#64748b]">{e.previous}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>
        </div>

        <div>
          <GlassCard>
            <SectionHeader title="Next 24 Hours" />
            {loading ? (
              <div className="text-center py-8 text-[#64748b] text-sm">Loading...</div>
            ) : (
              <div className="space-y-3">
                {events.slice(0, 5).map((e, i) => (
                  <div key={i} className="p-3 bg-[rgba(255,255,255,0.02)] rounded-lg border border-[rgba(255,255,255,0.04)]">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full" style={{ background: getImpactColor(e.impact) }} />
                      <span className="text-xs text-[#64748b]">{e.time}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-[rgba(255,255,255,0.05)] text-[#f8fafc]">{e.currency}</span>
                    </div>
                    <p className="text-sm text-[#f8fafc]">{e.event}</p>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
}