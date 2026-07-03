import { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/GlassCard';
import { SectionHeader } from '@/components/SectionHeader';
import { SubscriptionModal } from '@/components/SubscriptionModal';
import { useAuth } from '@/context/AuthContext';
import { pricingPlans, featureComparison, faqData } from '@/data/mockData';
import { Check, X, ChevronDown, Zap } from 'lucide-react';

export default function Pricing() {
  const { isAuthenticated } = useAuth();
  const [isAnnual, setIsAnnual] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [subModal, setSubModal] = useState<{ open: boolean; plan: string; price: number }>({ open: false, plan: '', price: 0 });

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[#f8fafc]">Choose Your Plan</h1>
        <p className="text-sm text-[#94a3b8] mt-2">Unlock the full power of AI-driven trading analytics</p>
        <div className="flex items-center justify-center gap-3 mt-6">
          <span className={`text-sm ${!isAnnual ? 'text-[#f8fafc] font-medium' : 'text-[#64748b]'}`}>Monthly</span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className="relative w-12 h-6 bg-[#1a1a24] border border-[rgba(255,255,255,0.08)] rounded-full transition-colors"
          >
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-[#06b6d4] transition-all ${isAnnual ? 'left-6' : 'left-0.5'}`} />
          </button>
          <span className={`text-sm ${isAnnual ? 'text-[#f8fafc] font-medium' : 'text-[#64748b]'}`}>Annual</span>
          {isAnnual && (
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-[rgba(34,197,94,0.1)] text-[#22c55e] rounded-full">
              Save 20%
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {pricingPlans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <GlassCard
              className={`h-full flex flex-col ${plan.popular ? 'border-[rgba(6,182,212,0.3)] shadow-[0_0_20px_rgba(6,182,212,0.1)]' : ''}`}
              hover={!plan.popular}
            >
              {plan.popular && (
                <div className="flex items-center gap-1.5 mb-4">
                  <Zap size={14} className="text-[#06b6d4]" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-[rgba(6,182,212,0.1)] text-[#06b6d4] px-2 py-0.5 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              <h3 className="text-lg font-semibold text-[#f8fafc]">{plan.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-[#f8fafc]">
                  ${isAnnual ? Math.round(plan.price * 0.8) : plan.price}
                </span>
                <span className="text-sm text-[#64748b]">/month</span>
              </div>
              {isAnnual && plan.price > 0 && (
                <p className="text-xs text-[#22c55e] mt-1">${Math.round(plan.price * 0.8 * 12)}/year (save ${Math.round(plan.price * 12 * 0.2)})</p>
              )}
              <p className="text-sm text-[#94a3b8] mt-3">{plan.description}</p>

              <ul className="mt-6 space-y-3 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-[#94a3b8]">
                    <Check size={16} className="text-[#22c55e] flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              {plan.price === 0 ? (
                <button
                  onClick={() => {
                    if (isAuthenticated) window.location.href = '/dashboard';
                    else window.location.href = '/signup';
                  }}
                  className="mt-6 block w-full text-center py-2.5 rounded-lg font-medium border border-[rgba(255,255,255,0.2)] text-[#f8fafc] hover:border-[rgba(255,255,255,0.4)] transition-colors"
                >
                  Get Started
                </button>
              ) : (
                <button
                  onClick={() => setSubModal({ open: true, plan: plan.name, price: plan.price })}
                  className={`mt-6 block w-full text-center py-2.5 rounded-lg font-medium transition-colors ${
                    plan.popular
                      ? 'bg-[#06b6d4] text-[#050507] hover:bg-[#22d3ee]'
                      : 'border border-[rgba(255,255,255,0.2)] text-[#f8fafc] hover:border-[rgba(255,255,255,0.4)]'
                  }`}
                >
                  {plan.cta}
                </button>
              )}
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <GlassCard>
        <SectionHeader title="Feature Comparison" />
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.08)]">
                <th className="text-left text-[11px] font-medium uppercase tracking-wider text-[#64748b] px-4 py-3">Feature</th>
                <th className="text-center text-[11px] font-medium uppercase tracking-wider text-[#64748b] px-4 py-3">Free</th>
                <th className="text-center text-[11px] font-medium uppercase tracking-wider text-[#06b6d4] px-4 py-3">Pro</th>
                <th className="text-center text-[11px] font-medium uppercase tracking-wider text-[#8b5cf6] px-4 py-3">Premium</th>
              </tr>
            </thead>
            <tbody>
              {featureComparison.map((f, i) => (
                <tr key={i} className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)]">
                  <td className="px-4 py-3 text-sm text-[#f8fafc]">{f.feature}</td>
                  <td className="px-4 py-3 text-center">
                    {typeof f.free === 'boolean' ? (
                      f.free ? <Check size={16} className="text-[#22c55e] mx-auto" /> : <X size={16} className="text-[#64748b] mx-auto" />
                    ) : <span className="text-sm text-[#94a3b8]">{f.free}</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {typeof f.pro === 'boolean' ? (
                      f.pro ? <Check size={16} className="text-[#06b6d4] mx-auto" /> : <X size={16} className="text-[#64748b] mx-auto" />
                    ) : <span className="text-sm text-[#06b6d4]">{f.pro}</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {typeof f.premium === 'boolean' ? (
                      f.premium ? <Check size={16} className="text-[#8b5cf6] mx-auto" /> : <X size={16} className="text-[#64748b] mx-auto" />
                    ) : <span className="text-sm text-[#8b5cf6]">{f.premium}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <GlassCard>
        <SectionHeader title="Frequently Asked Questions" />
        <div className="space-y-3">
          {faqData.map((faq, i) => (
            <div key={i} className="border border-[rgba(255,255,255,0.08)] rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-[rgba(255,255,255,0.02)] transition-colors"
              >
                <span className="text-sm font-medium text-[#f8fafc]">{faq.q}</span>
                <ChevronDown size={16} className={`text-[#64748b] transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4">
                  <p className="text-sm text-[#94a3b8] leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </GlassCard>

      <SubscriptionModal
        open={subModal.open}
        onClose={() => setSubModal({ open: false, plan: '', price: 0 })}
        planName={subModal.plan}
        planPrice={subModal.price}
        isAnnual={isAnnual}
      />
    </motion.div>
  );
}
