import { useMT5 } from '@/context/MT5Context';
import { NavLink } from 'react-router';
import { Server, Check, RefreshCw, Loader2 } from 'lucide-react';

export function MT5Status() {
  const { connected, connecting, account, positions, quotes, refreshData, connectionState } = useMT5();

  if (connecting || connectionState === 'validating') {
    return (
      <div className="bg-[rgba(6,182,212,0.05)] border border-[rgba(6,182,212,0.1)] rounded-xl p-4 flex items-center gap-3">
        <Loader2 size={18} className="text-[#06b6d4] animate-spin" />
        <span className="text-sm text-[#06b6d4]">Connecting to MT5 server...</span>
      </div>
    );
  }

  if (connected && account) {
    const openPositions = positions.length;
    const gainLoss = ((account.equity - account.balance) / account.balance * 100).toFixed(2);

    return (
      <div className="bg-[rgba(10,10,14,0.8)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] rounded-xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.2)] flex items-center justify-center">
              <Check size={20} className="text-[#22c55e]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#f8fafc]">{account.broker}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[rgba(34,197,94,0.1)] text-[#22c55e] font-medium">LIVE</span>
              </div>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-xs text-[#64748b] font-mono">{account.server}</span>
                <span className="text-xs text-[#64748b]">·</span>
                <span className="text-xs text-[#64748b] font-mono">{account.login}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-xs text-[#64748b]">Balance</div>
              <div className="text-sm font-semibold text-[#f8fafc] font-mono">${account.balance.toLocaleString()}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-[#64748b]">Equity</div>
              <div className="text-sm font-semibold text-[#22c55e] font-mono">${account.equity.toLocaleString()}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-[#64748b]">Open</div>
              <div className="text-sm font-semibold text-[#f8fafc] font-mono">{openPositions}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-[#64748b]">P&L</div>
              <div className={`text-sm font-semibold font-mono ${Number(gainLoss) >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                {Number(gainLoss) >= 0 ? '+' : ''}{gainLoss}%
              </div>
            </div>
          </div>

          <button onClick={refreshData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#64748b] hover:text-[#f8fafc] hover:bg-[rgba(255,255,255,0.05)] transition-colors">
            <RefreshCw size={12} /> Sync
          </button>
        </div>

        {quotes.length > 0 && (
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[rgba(255,255,255,0.06)] overflow-x-auto">
            {quotes.slice(0, 6).map((q) => (
              <div key={q.symbol} className="flex items-center gap-2 text-xs whitespace-nowrap">
                <span className="font-medium text-[#f8fafc]">{q.symbol}</span>
                <span className="font-mono text-[#94a3b8]">{q.bid.toFixed(5)}</span>
                <span className={`font-mono ${q.changePercent >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                  {q.changePercent >= 0 ? '+' : ''}{q.changePercent.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink to="/connect"
      className="block bg-[rgba(10,10,14,0.8)] backdrop-blur-xl border border-dashed border-[rgba(255,255,255,0.12)] rounded-xl p-4 hover:border-[#06b6d4] transition-colors group">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.03)] flex items-center justify-center group-hover:bg-[rgba(6,182,212,0.1)] transition-colors">
          <Server size={20} className="text-[#64748b] group-hover:text-[#06b6d4]" />
        </div>
        <div>
          <div className="text-sm font-semibold text-[#f8fafc]">Connect Your MT5 Account</div>
          <div className="text-xs text-[#64748b] mt-0.5">Sync trades and get AI-powered insights</div>
        </div>
        <span className="ml-auto text-xs text-[#06b6d4] group-hover:text-[#22d3ee]">Connect →</span>
      </div>
    </NavLink>
  );
}
