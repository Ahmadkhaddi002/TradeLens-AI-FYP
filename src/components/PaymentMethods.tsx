import { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard';
import { SectionHeader } from './SectionHeader';
import { DepositModal } from './DepositModal';
import { WithdrawModal } from './WithdrawModal';
import {
  CreditCard, Banknote, Wallet, Bitcoin, ArrowDownCircle, ArrowUpCircle,
  Plus, Clock, CheckCircle, XCircle, RefreshCw
} from 'lucide-react';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  method: string;
  methodLabel: string;
  createdAt: string;
  completedAt?: string;
  txHash?: string;
}

export function PaymentMethods() {
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(24856.4);

  useEffect(() => {
    loadTransactions();
    const stored = localStorage.getItem('mt5_account');
    if (stored) {
      try { setBalance(JSON.parse(stored).balance); } catch {}
    }
  }, []);

  const loadTransactions = async () => {
    try {
      const res = await fetch(`/api/payment/transactions`);
      const data = await res.json();
      setTransactions(data);
    } catch { /* ignore */ }
  };

  const totalDeposited = transactions.filter(t => t.type === 'deposit' && t.status === 'completed').reduce((s, t) => s + t.amount, 0);
  const totalWithdrawn = transactions.filter(t => t.type === 'withdrawal' && t.status === 'completed').reduce((s, t) => s + t.amount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-[#22c55e] bg-[rgba(34,197,94,0.1)]';
      case 'pending': return 'text-yellow-400 bg-[rgba(234,179,8,0.1)]';
      case 'failed': return 'text-[#ef4444] bg-[rgba(239,68,68,0.1)]';
      default: return 'text-[#64748b] bg-[rgba(255,255,255,0.05)]';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle size={12} />;
      case 'pending': return <Clock size={12} />;
      case 'failed': return <XCircle size={12} />;
      default: return <XCircle size={12} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard>
          <div className="p-5">
            <div className="text-xs text-[#64748b] uppercase tracking-wider mb-1">Account Balance</div>
            <div className="text-3xl font-bold text-[#f8fafc] font-mono">${balance.toLocaleString()}</div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-5">
            <div className="text-xs text-[#64748b] uppercase tracking-wider mb-1">Total Deposited</div>
            <div className="text-2xl font-bold text-[#22c55e] font-mono">${totalDeposited.toLocaleString()}</div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-5">
            <div className="text-xs text-[#64748b] uppercase tracking-wider mb-1">Total Withdrawn</div>
            <div className="text-2xl font-bold text-[#ef4444] font-mono">${totalWithdrawn.toLocaleString()}</div>
          </div>
        </GlassCard>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button onClick={() => setShowDeposit(true)}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#06b6d4] text-[#050507] rounded-xl font-semibold hover:bg-[#22d3ee] transition-colors">
          <ArrowDownCircle size={18} /> Deposit
        </button>
        <button onClick={() => setShowWithdraw(true)}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-[rgba(255,255,255,0.08)] text-[#f8fafc] rounded-xl font-semibold hover:bg-[rgba(255,255,255,0.12)] transition-colors">
          <ArrowUpCircle size={18} /> Withdraw
        </button>
      </div>

      {/* Payment Methods Grid */}
      <GlassCard>
        <SectionHeader
          title="Available Payment Methods"
          subtitle="Choose your preferred way to deposit and withdraw"
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-1">
          {[
            { icon: <CreditCard size={24} />, label: 'Visa / MC', sub: 'Instant', color: 'from-blue-500 to-blue-600' },
            { icon: <Banknote size={24} />, label: 'Bank Transfer', sub: '1-3 days', color: 'from-gray-500 to-gray-600' },
            { icon: <Wallet size={24} />, label: 'Skrill', sub: 'Instant', color: 'from-purple-500 to-purple-600' },
            { icon: <Wallet size={24} />, label: 'Neteller', sub: 'Instant', color: 'from-orange-500 to-orange-600' },
            { icon: <Wallet size={24} />, label: 'PayPal', sub: 'Instant', color: 'from-blue-400 to-blue-500' },
            { icon: <Bitcoin size={24} />, label: 'Bitcoin', sub: '10-30 min', color: 'from-amber-500 to-amber-600' },
            { icon: <Bitcoin size={24} />, label: 'Ethereum', sub: '2-5 min', color: 'from-indigo-500 to-indigo-600' },
            { icon: <Bitcoin size={24} />, label: 'USDT (TRC-20)', sub: 'Instant', color: 'from-green-500 to-green-600' },
          ].map((m, i) => (
            <div key={i} className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)] transition-colors text-center">
              <div className={`w-10 h-10 mx-auto rounded-lg bg-gradient-to-br ${m.color} flex items-center justify-center mb-2`}>
                {m.icon}
              </div>
              <div className="text-xs font-medium text-[#f8fafc]">{m.label}</div>
              <div className="text-[10px] text-[#64748b]">{m.sub}</div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Transaction History */}
      <GlassCard>
        <SectionHeader
          title="Transaction History"
          subtitle="All deposits and withdrawals"
          action={
            <button onClick={loadTransactions} className="p-1.5 rounded-md hover:bg-[rgba(255,255,255,0.05)] text-[#64748b]">
              <RefreshCw size={14} />
            </button>
          }
        />
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto rounded-full bg-[rgba(255,255,255,0.03)] flex items-center justify-center mb-3">
              <Plus size={20} className="text-[#64748b]" />
            </div>
            <p className="text-sm text-[#64748b]">No transactions yet</p>
            <p className="text-xs text-[#64748b] mt-1">Make your first deposit to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.08)]">
                  {['ID', 'Type', 'Amount', 'Method', 'Status', 'Date', ''].map((h) => (
                    <th key={h} className="text-left text-[11px] font-medium uppercase tracking-wider text-[#64748b] px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                    <td className="px-4 py-3 text-xs font-mono text-[#64748b]">{tx.id}</td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1.5 text-xs font-medium ${tx.type === 'deposit' ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                        {tx.type === 'deposit' ? <ArrowDownCircle size={12} /> : <ArrowUpCircle size={12} />}
                        {tx.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-sm font-mono font-medium ${tx.type === 'deposit' ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                      {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#94a3b8]">{tx.methodLabel}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${getStatusColor(tx.status)}`}>
                        {getStatusIcon(tx.status)} {tx.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#64748b]">{new Date(tx.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      {tx.txHash && (
                        <span className="text-[10px] font-mono text-[#64748b] truncate max-w-[60px] block">{tx.txHash.slice(0, 10)}...</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      <DepositModal open={showDeposit} onClose={() => { setShowDeposit(false); loadTransactions(); }} />
      <WithdrawModal open={showWithdraw} onClose={() => { setShowWithdraw(false); loadTransactions(); }} maxWithdraw={balance} />
    </div>
  );
}
