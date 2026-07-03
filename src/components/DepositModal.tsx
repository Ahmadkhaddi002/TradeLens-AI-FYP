import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Banknote, Wallet, Bitcoin, Check, Loader2, AlertCircle } from 'lucide-react';

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'ewallet' | 'crypto';
  label: string;
  icon: string;
  enabled: boolean;
  minDeposit: number;
  maxDeposit: number;
  processingTime: string;
  fee: number;
}

interface DepositModalProps {
  open: boolean;
  onClose: () => void;
}

const methodIcons: Record<string, React.ReactNode> = {
  'credit-card': <CreditCard size={20} />,
  'bank': <Banknote size={20} />,
  'skrill': <Wallet size={20} />,
  'neteller': <Wallet size={20} />,
  'paypal': <Wallet size={20} />,
  'bitcoin': <Bitcoin size={20} />,
  'ethereum': <Bitcoin size={20} />,
  'usdt': <Bitcoin size={20} />,
};

const methodColors: Record<string, string> = {
  'visa-mc': 'from-blue-500 to-blue-600',
  'bank-transfer': 'from-gray-500 to-gray-600',
  'skrill': 'from-purple-500 to-purple-600',
  'neteller': 'from-orange-500 to-orange-600',
  'paypal': 'from-blue-400 to-blue-500',
  'bitcoin': 'from-amber-500 to-amber-600',
  'ethereum': 'from-indigo-500 to-indigo-600',
  'usdt-trc20': 'from-green-500 to-green-600',
};

export function DepositModal({ open, onClose }: DepositModalProps) {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<'select' | 'confirm' | 'processing' | 'done' | 'error'>('select');
  const [txResult, setTxResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (open) {
      fetch(`/api/payment/methods`)
        .then(r => r.json())
        .then(data => {
          setMethods(data);
          if (data.length > 0) setSelectedMethod(data[0].id);
        })
        .catch(() => {});
      setStep('select');
      setAmount('');
      setTxResult(null);
    }
  }, [open]);

  const selected = methods.find(m => m.id === selectedMethod);

  const presets = selected
    ? [selected.minDeposit, selected.minDeposit * 2, selected.minDeposit * 5, selected.maxDeposit > 10000 ? 10000 : selected.maxDeposit]
    : [100, 250, 500, 1000];

  const handleDeposit = async () => {
    if (!selectedMethod || !amount) return;
    setStep('processing');
    try {
      const res = await fetch(`/api/payment/deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ methodId: selectedMethod, amount: Number(amount), currency: 'USD' }),
      });
      const data = await res.json();
      if (data.success) {
        setTxResult(data.transaction);
        setStep('done');
      } else {
        setErrorMsg(data.error);
        setStep('error');
      }
    } catch {
      setErrorMsg('Connection error. Ensure server is running.');
      setStep('error');
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-[#0a0a0e] border border-[rgba(255,255,255,0.08)] rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#f8fafc]">Deposit Funds</h2>
              <button onClick={onClose} className="p-1.5 rounded-lg text-[#64748b] hover:text-[#f8fafc] hover:bg-[rgba(255,255,255,0.05)]">
                <X size={18} />
              </button>
            </div>

            {step === 'select' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {methods.filter(m => m.enabled).map((m) => (
                    <button key={m.id} onClick={() => setSelectedMethod(m.id)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        selectedMethod === m.id
                          ? 'border-[#06b6d4] bg-[rgba(6,182,212,0.05)]'
                          : 'border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)] bg-[#12121a]'
                      }`}>
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${methodColors[m.id] || 'from-cyan-500 to-blue-500'} flex items-center justify-center mb-2`}>
                        {methodIcons[m.icon] || <CreditCard size={16} className="text-white" />}
                      </div>
                      <div className="text-xs font-medium text-[#f8fafc]">{m.label}</div>
                      <div className="text-[10px] text-[#64748b]">{m.processingTime}</div>
                    </button>
                  ))}
                </div>

                {selected && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">
                        Amount (Min: ${selected.minDeposit} — Max: ${selected.maxDeposit.toLocaleString()})
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] text-sm font-medium">$</span>
                        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                          placeholder="0.00" min={selected.minDeposit} max={selected.maxDeposit}
                          className="w-full bg-[#1a1a24] border border-[rgba(255,255,255,0.08)] rounded-lg pl-8 pr-4 py-2.5 text-sm text-[#f8fafc] placeholder-[#64748b] outline-none focus:border-[#06b6d4] transition-colors font-mono" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {presets.map((p) => (
                        <button key={p} onClick={() => setAmount(String(p))}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            Number(amount) === p
                              ? 'bg-[rgba(6,182,212,0.1)] text-[#06b6d4] border border-[rgba(6,182,212,0.2)]'
                              : 'bg-[#1a1a24] text-[#94a3b8] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)]'
                          }`}>
                          ${p.toLocaleString()}
                        </button>
                      ))}
                    </div>
                    {selected.fee > 0 && (
                      <div className="flex justify-between text-xs text-[#64748b] pt-2 border-t border-[rgba(255,255,255,0.06)]">
                        <span>Fee ({selected.fee}%)</span>
                        <span>${(Number(amount) * selected.fee / 100).toFixed(2)}</span>
                      </div>
                    )}
                    <button onClick={handleDeposit} disabled={!amount || Number(amount) < selected.minDeposit}
                      className="w-full py-2.5 bg-[#06b6d4] text-[#050507] rounded-lg font-semibold hover:bg-[#22d3ee] transition-colors disabled:opacity-50">
                      Deposit ${Number(amount).toLocaleString()}
                    </button>
                  </div>
                )}
              </div>
            )}

            {step === 'processing' && (
              <div className="text-center py-8">
                <Loader2 size={40} className="mx-auto text-[#06b6d4] animate-spin mb-4" />
                <p className="text-sm text-[#f8fafc]">Processing your deposit...</p>
                <p className="text-xs text-[#64748b] mt-1">Please wait while we process the transaction</p>
              </div>
            )}

            {step === 'done' && txResult && (
              <div className="text-center py-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-[rgba(34,197,94,0.1)] border-2 border-[#22c55e] flex items-center justify-center mb-4">
                  <Check size={28} className="text-[#22c55e]" />
                </div>
                <p className="text-lg font-semibold text-[#f8fafc]">Deposit Successful</p>
                <p className="text-2xl font-bold text-[#22c55e] mt-2 font-mono">${Number(amount).toLocaleString()}</p>
                <div className="mt-4 p-3 bg-[rgba(255,255,255,0.02)] rounded-lg text-left space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#64748b]">Transaction ID</span>
                    <span className="text-[#f8fafc] font-mono">{txResult.id}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#64748b]">Method</span>
                    <span className="text-[#f8fafc]">{txResult.methodLabel}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#64748b]">Status</span>
                    <span className="text-[#22c55e] capitalize">{txResult.status}</span>
                  </div>
                  {txResult.txHash && (
                    <div className="flex justify-between text-xs">
                      <span className="text-[#64748b]">TX Hash</span>
                      <span className="text-[#f8fafc] font-mono text-[10px] truncate max-w-[180px]">{txResult.txHash}</span>
                    </div>
                  )}
                </div>
                <button onClick={onClose} className="mt-4 w-full py-2.5 bg-[#06b6d4] text-[#050507] rounded-lg font-semibold hover:bg-[#22d3ee] transition-colors">
                  Done
                </button>
              </div>
            )}

            {step === 'error' && (
              <div className="text-center py-4">
                <AlertCircle size={40} className="mx-auto text-[#ef4444] mb-4" />
                <p className="text-sm text-[#ef4444]">{errorMsg}</p>
                <button onClick={() => setStep('select')} className="mt-4 w-full py-2.5 bg-[rgba(255,255,255,0.1)] text-[#f8fafc] rounded-lg font-medium hover:bg-[rgba(255,255,255,0.15)] transition-colors">
                  Try Again
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
