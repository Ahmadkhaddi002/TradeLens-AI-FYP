import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Banknote, Wallet, Bitcoin, Check, Loader2, AlertCircle, Zap } from 'lucide-react';

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'ewallet' | 'crypto';
  label: string;
  icon: string;
  minDeposit: number;
  maxDeposit: number;
  processingTime: string;
  fee: number;
}

interface SubscriptionModalProps {
  open: boolean;
  onClose: () => void;
  planName: string;
  planPrice: number;
  isAnnual: boolean;
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

export function SubscriptionModal({ open, onClose, planName, planPrice, isAnnual }: SubscriptionModalProps) {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [step, setStep] = useState<'select' | 'confirm' | 'processing' | 'success' | 'error'>('select');
  const [errorMsg, setErrorMsg] = useState('');

  const monthlyPrice = planPrice;
  const annualPrice = Math.round(planPrice * 0.8);
  const finalAmount = isAnnual ? annualPrice : monthlyPrice;
  const totalLabel = isAnnual ? `$${annualPrice * 12}/year` : `$${monthlyPrice}/month`;

  useEffect(() => {
    if (!open) return;
    setStep('select');
    setSelectedMethod(null);
    setErrorMsg('');
    fetchMethods();
  }, [open]);

  const fetchMethods = async () => {
    try {
      const res = await fetch('/api/payment/methods');
      const data = await res.json();
      setMethods(data);
      if (data.length > 0) setSelectedMethod(data[0].id);
    } catch {}
  };

  const handleSubscribe = async () => {
    if (!selectedMethod) return;
    setStep('processing');
    setErrorMsg('');
    try {
      const res = await fetch('/api/payment/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: planName.toLowerCase(),
          paymentMethodId: selectedMethod,
          amount: finalAmount,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStep('success');
      } else {
        setStep('error');
        setErrorMsg(data.error || 'Subscription failed');
      }
    } catch {
      setStep('error');
      setErrorMsg('Could not reach the server');
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => step !== 'processing' && onClose()} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-10 w-full max-w-md bg-[#0d0d14] border border-[rgba(255,255,255,0.1)] rounded-2xl overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Zap size={18} className="text-[#06b6d4]" />
                  <span className="text-lg font-bold text-[#f8fafc]">Subscribe</span>
                </div>
                <button onClick={() => step !== 'processing' && onClose()} className="p-1.5 rounded-lg text-[#64748b] hover:text-[#f8fafc] hover:bg-[rgba(255,255,255,0.05)] transition-colors">
                  <X size={18} />
                </button>
              </div>

              <AnimatePresence mode="wait">
                {step === 'select' && (
                  <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                    <div className="p-4 bg-[rgba(6,182,212,0.05)] border border-[rgba(6,182,212,0.15)] rounded-xl">
                      <div className="text-xs text-[#94a3b8]">Selected Plan</div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-lg font-bold text-[#f8fafc]">{planName} Plan</span>
                        <span className="text-sm font-semibold text-[#06b6d4]">{totalLabel}</span>
                      </div>
                      <div className="text-xs text-[#64748b] mt-1">Billed {isAnnual ? 'annually' : 'monthly'}</div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-[#f8fafc] mb-3">Payment Method</div>
                      <div className="space-y-2 max-h-[200px] overflow-y-auto">
                        {methods.map((m) => (
                          <button
                            key={m.id}
                            onClick={() => setSelectedMethod(m.id)}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                              selectedMethod === m.id
                                ? 'border-[#06b6d4] bg-[rgba(6,182,212,0.05)]'
                                : 'border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)]'
                            }`}
                          >
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#06b6d4] to-[#3b82f6] flex items-center justify-center">
                              {methodIcons[m.icon] || <Wallet size={18} />}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-[#f8fafc]">{m.label}</div>
                              <div className="text-xs text-[#64748b]">{m.processingTime} · {m.fee > 0 ? `${m.fee}% fee` : 'No fee'}</div>
                            </div>
                            {selectedMethod === m.id && <Check size={16} className="text-[#06b6d4]" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 bg-[rgba(255,255,255,0.02)] rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#94a3b8]">Subscription</span>
                        <span className="text-[#f8fafc] font-medium">{planName} Plan</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-[#94a3b8]">Amount</span>
                        <span className="text-[#f8fafc] font-mono font-medium">${finalAmount}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-[#94a3b8]">Payment via</span>
                        <span className="text-[#94a3b8] font-mono text-xs">{methods.find(m => m.id === selectedMethod)?.label || selectedMethod}</span>
                      </div>
                    </div>

                    <button
                      onClick={handleSubscribe}
                      disabled={!selectedMethod}
                      className="w-full py-3 bg-[#06b6d4] text-[#050507] rounded-xl font-semibold hover:bg-[#22d3ee] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Pay ${finalAmount} via {methods.find(m => m.id === selectedMethod)?.label || 'selected method'}
                    </button>
                  </motion.div>
                )}

                {step === 'processing' && (
                  <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-8">
                    <Loader2 size={40} className="mx-auto text-[#06b6d4] animate-spin mb-4" />
                    <div className="text-base font-medium text-[#f8fafc]">Processing Payment</div>
                    <div className="text-sm text-[#64748b] mt-1">Please wait while we process your subscription...</div>
                  </motion.div>
                )}

                {step === 'success' && (
                  <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-8">
                    <div className="w-16 h-16 mx-auto rounded-full bg-[rgba(34,197,94,0.1)] border-2 border-[#22c55e] flex items-center justify-center mb-4">
                      <Check size={28} className="text-[#22c55e]" />
                    </div>
                    <div className="text-base font-medium text-[#f8fafc]">Subscription Active!</div>
                    <div className="text-sm text-[#64748b] mt-1">Your {planName} plan is now active.</div>
                    <button onClick={onClose} className="mt-6 px-6 py-2.5 bg-[#06b6d4] text-[#050507] rounded-lg font-medium hover:bg-[#22d3ee] transition-colors">
                      Done
                    </button>
                  </motion.div>
                )}

                {step === 'error' && (
                  <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-8">
                    <div className="w-16 h-16 mx-auto rounded-full bg-[rgba(239,68,68,0.1)] border-2 border-[#ef4444] flex items-center justify-center mb-4">
                      <AlertCircle size={28} className="text-[#ef4444]" />
                    </div>
                    <div className="text-base font-medium text-[#f8fafc]">Payment Failed</div>
                    <div className="text-sm text-[#64748b] mt-1">{errorMsg}</div>
                    <button onClick={() => setStep('select')} className="mt-6 px-6 py-2.5 bg-[#06b6d4] text-[#050507] rounded-lg font-medium hover:bg-[#22d3ee] transition-colors">
                      Try Again
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
