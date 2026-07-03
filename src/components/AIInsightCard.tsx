import { Sparkles, X, Check } from 'lucide-react';

interface AIInsightCardProps {
  severity: 'green' | 'yellow' | 'red';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  onDismiss?: () => void;
  onMarkRead?: () => void;
}

const severityConfig = {
  green: { dot: 'bg-[#22c55e]', border: 'border-l-[#22c55e]' },
  yellow: { dot: 'bg-yellow-400', border: 'border-l-yellow-400' },
  red: { dot: 'bg-[#ef4444]', border: 'border-l-[#ef4444]' },
};

export function AIInsightCard({ severity, title, message, timestamp, read, onDismiss, onMarkRead }: AIInsightCardProps) {
  const config = severityConfig[severity];

  return (
    <div className={`bg-[rgba(10,10,14,0.8)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] rounded-xl p-4 border-l-[3px] ${config.border} transition-all duration-200 hover:border-[rgba(255,255,255,0.12)]`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <Sparkles size={16} className="text-[#06b6d4]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-2 h-2 rounded-full ${config.dot}`} />
            <h4 className="text-sm font-semibold text-[#f8fafc]">{title}</h4>
          </div>
          <p className={`text-sm leading-relaxed ${read ? 'text-[#64748b]' : 'text-[#94a3b8]'}`}>{message}</p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-[#64748b]">{timestamp}</span>
            <div className="flex items-center gap-2">
              {!read && onMarkRead && (
                <button onClick={onMarkRead} className="text-xs text-[#06b6d4] hover:text-[#22d3ee] flex items-center gap-1 transition-colors">
                  <Check size={12} /> Mark as Read
                </button>
              )}
              {onDismiss && (
                <button onClick={onDismiss} className="text-xs text-[#64748b] hover:text-[#94a3b8] flex items-center gap-1 transition-colors">
                  <X size={12} /> Dismiss
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
