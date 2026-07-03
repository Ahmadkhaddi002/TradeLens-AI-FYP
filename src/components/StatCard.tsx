import { TrendingUp, TrendingDown } from 'lucide-react';
import { useCountUp } from '@/hooks/useCountUp';

interface StatCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  trend: number;
  trendLabel?: string;
}

export function StatCard({ label, value, prefix = '', suffix = '', decimals = 2, trend, trendLabel }: StatCardProps) {
  const { formatted } = useCountUp(value, 800, true, prefix, suffix, decimals);
  const isPositive = trend >= 0;

  return (
    <div className="bg-[rgba(10,10,14,0.8)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] rounded-xl p-5 transition-all duration-200 hover:border-[rgba(255,255,255,0.12)] hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-medium uppercase tracking-wider text-[#64748b]">{label}</span>
        <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${isPositive ? 'bg-[rgba(34,197,94,0.1)] text-[#22c55e]' : 'bg-[rgba(239,68,68,0.1)] text-[#ef4444]'}`}>
          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {isPositive ? '+' : ''}{trend}%
        </span>
      </div>
      <div className="text-2xl font-semibold text-[#f8fafc] font-mono">{formatted}</div>
      {trendLabel && <div className="text-xs text-[#64748b] mt-1">{trendLabel}</div>}
    </div>
  );
}
