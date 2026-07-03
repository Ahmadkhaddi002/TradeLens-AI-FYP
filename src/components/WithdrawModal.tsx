import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Loader2, AlertCircle } from 'lucide-react';

interface PaymentMethod {
  id: string;
  type: string;
  label: string;
  enabled: boolean;
  processingTime: string;
  fee: number;
}

interface WithdrawModalProps {
  open: boolean;
  onClose: () => void;
  maxWithdraw: number;
}

export function WithdrawModal({ open, onClose, maxWithdraw }: WithdrawModalProps) {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [step, setStep] = useState<'select' | 'confirm' | 'processing' | 'done' | 'error'>('select');
  const [txResult, setTxResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (open) {
      fetch(`/api/payment/methods`).then(r => r.json()).then(data => {
        setMethods(data);
        if (data.length > 0) setSelectedMethod(data[0].id);
      }).catch(() => {});
      setStep('select');
      setAmount('');
      setAddress('');
    }
  }, [open]);

  const selected = methods.find(m => m.id === selectedMethod);

  const handleWithdraw = async () => {
    if (!selectedMethod || !amount) return;
    setStep('processing');
    try {
      const res = await fetch(`/api/payment/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ methodId: selectedMethod, amount: Number(amount), currency: 'USD', address }),
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
              <h2 className="text-lg font-semibold text-[#f8fafc]">Withdraw Funds</h2>
              <button onClick={onClose} className="p-1.5 rounded-lg text-[#64748b] hover:text-[#f8fafc] hover:bg-[rgba(255,255,255,0.05)]">
                <X size={18} />
              </button>
            </div>

            {step === 'select' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">Withdrawal Method</label>
                  <select value={selectedMethod} onChange={(e) => setSelectedMethod(e.target.value)}
                    className="w-full bg-[#1a1a24] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-2.5 text-sm text-[#f8fafc] outline-none focus:border-[#06b6d4]">
                    {methods.filter(m => m.enabled).map((m) => (
                      <option key={m.id} value={m.id}>{m.label} ({m.processingTime})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">
                    Amount (Available: ${maxWithdraw.toLocaleString()})
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] text-sm font-medium">$</span>
                    <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00" min={10} max={maxWithdraw}
                      className="w-full bg-[#1a1a24] border border-[rgba(255,255,255,0.08)] rounded-lg pl-8 pr-4 py-2.5 text-sm text-[#f8fafc] placeholder-[#64748b] outline-none focus:border-[#06b6d4] transition-colors font-mono" />
                  </div>
                </div>
                {selected?.type === 'crypto' && (
                  <div>
                    <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">Wallet Address</label>
                    <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter your wallet address"
                      className="w-full bg-[#1a1a24] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-2.5 text-sm text-[#f8fafc] placeholder-[#64748b] outline-none focus:border-[#06b6d4] transition-colors font-mono" />
                  </div>
                )}
                {selected && selected.fee > 0 && (
                  <div className="flex justify-between text-xs text-[#64748b] pt-2 border-t border-[rgba(255,255,255,0.06)]">
                    <span>Fee ({selected.fee}%)</span>
                    <span>${(Number(amount) * selected.fee / 100).toFixed(2)}</span>
                  </div>
                )}
                <button onClick={handleWithdraw} disabled={!amount || Number(amount) < 10 || Number(amount) > maxWithdraw || (selected?.type === 'crypto' && !address)}
                  className="w-full py-2.5 bg-[#ef4444] text-white rounded-lg font-semibold hover:bg-red-500 transition-colors disabled:opacity-50">
                  Withdraw ${Number(amount).toLocaleString()}
                </button>
              </div>
            )}

            {step === 'processing' && (
              <div className="text-center py-8">
                <Loader2 size={40} className="mx-auto text-[#06b6d4] animate-spin mb-4" />
                <p className="text-sm text-[#f8fafc]">Processing withdrawal...</p>
              </div>
            )}

            {step === 'done' && txResult && (
              <div className="text-center py-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-[rgba(34,197,94,0.1)] border-2 border-[#22c55e] flex items-center justify-center mb-4">
                  <Check size={28} className="text-[#22c55e]" />
                </div>
                <p className="text-lg font-semibold text-[#f8fafc]">Withdrawal Requested</p>
                <p className="text-2xl font-bold text-[#f8fafc] mt-2 font-mono">${Number(amount).toLocaleString()}</p>
                <p className="text-xs text-[#94a3b8] mt-1">Status: {txResult.status}</p>
                {txResult.txHash && (
                  <div className="mt-4 p-3 bg-[rgba(255,255,255,0.02)] rounded-lg">
                    <div className="text-xs text-[#64748b]">TX Hash</div>
                    <div className="text-xs text-[#f8fafc] font-mono break-all">{txResult.txHash}</div>
                  </div>
                )}
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
