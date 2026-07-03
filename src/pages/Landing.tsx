import { NavLink } from 'react-router';
import { motion } from 'framer-motion';
import {
  BookOpen, Brain, BarChart3, MessageSquare, PlayCircle, Calendar,
  Check, ArrowRight, TrendingUp, Shield, Zap, ChevronDown
} from 'lucide-react';
import { GradientMesh } from '@/components/GradientMesh';
import { GlassCard } from '@/components/GlassCard';
import { testimonials, pricingPlans, faqData } from '@/data/mockData';
import { useState } from 'react';

const features = [
  { icon: BookOpen, title: 'Automatic Trade Journaling', desc: 'Every trade from your MT5 account is imported and organized. No manual entry, no spreadsheets, no missed trades.' },
  { icon: Brain, title: 'AI-Powered Analytics', desc: 'Our AI analyzes your trading patterns, identifies psychological biases, and surfaces insights you\'d never see on your own.' },
  { icon: BarChart3, title: 'Advanced Performance Metrics', desc: 'Track equity curves, drawdowns, win rates, R-multiples, session analysis, and pair performance with institutional-grade charts.' },
  { icon: MessageSquare, title: 'AI Trading Coach', desc: 'Get personalized feedback on your trading psychology. Detect revenge trading, overtrading, and discipline drift before it costs you.' },
  { icon: PlayCircle, title: 'Trade Replay', desc: 'Revisit your trades candle-by-candle with entry/exit annotations. Learn from every winner and loser.' },
  { icon: Calendar, title: 'Economic Calendar', desc: 'Stay ahead of market-moving events with an integrated forex economic calendar and impact filters.' },
];

const stats = [
  { value: '10,000+', label: 'Active Traders' },
  { value: '$2.4B', label: 'Trades Analyzed' },
  { value: '94%', label: 'User Retention' },
  { value: '4.9', label: 'App Store Rating' },
];

export default function Landing() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col overflow-hidden">
        <GradientMesh className="z-0" opacity={0.5} />
        <div className="absolute inset-0 bg-[rgba(5,5,7,0.4)] z-[1]" />

        {/* Navigation */}
        <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-[#06b6d4] to-[#3b82f6] flex items-center justify-center">
              <TrendingUp size={18} className="text-white" />
            </div>
            <span className="text-sm font-bold tracking-wider text-[#f8fafc]">TRADELENS</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-[#94a3b8] hover:text-[#f8fafc] transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-[#94a3b8] hover:text-[#f8fafc] transition-colors">Pricing</a>
            <a href="#community" className="text-sm text-[#94a3b8] hover:text-[#f8fafc] transition-colors">Community</a>
          </div>
          <div className="flex items-center gap-3">
            <NavLink to="/login" className="text-sm text-[#94a3b8] hover:text-[#f8fafc] transition-colors">Sign In</NavLink>
            <NavLink to="/signup" className="text-sm bg-[#06b6d4] text-[#050507] px-4 py-2 rounded-md font-semibold hover:bg-[#22d3ee] transition-colors">
              Get Started
            </NavLink>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center pt-8 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(6,182,212,0.1)] border border-[rgba(6,182,212,0.2)] text-[#06b6d4] text-xs font-medium mb-6">
              <Zap size={12} />
              AI-Powered Trading Analytics
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#f8fafc] max-w-3xl leading-tight"
            style={{ textShadow: '0 2px 40px rgba(0,0,0,0.5)' }}
          >
            Understand Your{' '}
            <span className="bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] bg-clip-text text-transparent">Trading Edge</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg text-[#94a3b8] max-w-xl leading-relaxed"
          >
            Auto MT5 journaling, AI trading analytics, and behavioral insights for serious traders.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-col sm:flex-row items-center gap-4"
          >
            <NavLink
              to="/signup"
              className="px-7 py-3 bg-[#06b6d4] text-[#050507] rounded-md font-semibold hover:bg-[#22d3ee] transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center gap-2"
            >
              Start Free Trial <ArrowRight size={16} />
            </NavLink>
            <NavLink
              to="/connect"
              className="px-7 py-3 bg-transparent border border-[rgba(255,255,255,0.2)] text-[#f8fafc] rounded-md font-medium hover:border-[rgba(255,255,255,0.4)] transition-colors"
            >
              Connect MT5
            </NavLink>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-xs text-[#64748b] flex items-center gap-3"
          >
            <Shield size={12} /> Free 14-day trial <span className="text-[rgba(255,255,255,0.2)]">·</span> No credit card required <span className="text-[rgba(255,255,255,0.2)]">·</span> Cancel anytime
          </motion.p>

          {/* Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-12 w-full max-w-5xl"
            style={{ perspective: '1200px' }}
          >
            <div
              className="rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.1)] shadow-2xl"
              style={{ transform: 'rotateX(2deg)' }}
            >
              <img
                src="/hero-dashboard.jpg"
                alt="TradeLens Dashboard"
                className="w-full h-auto"
              />
            </div>
          </motion.div>
        </div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="relative z-10 flex justify-center pb-4"
        >
          <ChevronDown size={20} className="text-[#64748b]" />
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#f8fafc]">Everything You Need to Trade Smarter</h2>
            <p className="mt-4 text-[#94a3b8] max-w-lg mx-auto">Connect your MT5 account and let AI reveal the patterns hiding in your data.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassCard>
                  <div className="w-12 h-12 rounded-full bg-[rgba(6,182,212,0.1)] flex items-center justify-center mb-4">
                    <f.icon size={20} className="text-[#06b6d4]" />
                  </div>
                  <h3 className="text-base font-semibold text-[#f8fafc] mb-2">{f.title}</h3>
                  <p className="text-sm text-[#94a3b8] leading-relaxed">{f.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-[#12121a]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-2xl lg:text-3xl text-[#f8fafc] italic leading-relaxed">
              "{testimonials[0].quote}"
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#06b6d4] to-[#8b5cf6] flex items-center justify-center text-xs font-semibold text-white">
                {testimonials[0].avatar}
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-[#f8fafc]">{testimonials[0].author}</div>
                <div className="text-xs text-[#64748b]">{testimonials[0].role}</div>
              </div>
            </div>
          </motion.div>

          <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-[#06b6d4]">{s.value}</div>
                <div className="text-xs uppercase tracking-wider text-[#64748b] mt-1">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#f8fafc]">Simple Pricing</h2>
            <p className="mt-4 text-[#94a3b8]">Start free, upgrade when you're ready to go pro.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassCard
                  className={`h-full flex flex-col ${plan.popular ? 'border-[rgba(6,182,212,0.3)] shadow-[0_0_20px_rgba(6,182,212,0.15)]' : ''}`}
                  hover={!plan.popular}
                >
                  {plan.popular && (
                    <span className="self-start px-2.5 py-1 text-[10px] font-semibold uppercase bg-[rgba(6,182,212,0.1)] text-[#06b6d4] rounded-full mb-4">
                      Most Popular
                    </span>
                  )}
                  <h3 className="text-lg font-semibold text-[#f8fafc]">{plan.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-[#f8fafc]">${plan.price}</span>
                    <span className="text-sm text-[#64748b]">/{plan.period}</span>
                  </div>
                  <p className="mt-2 text-sm text-[#94a3b8]">{plan.description}</p>
                  <ul className="mt-6 space-y-3 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-[#94a3b8]">
                        <Check size={16} className="text-[#22c55e] flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <NavLink
                    to="/signup"
                    className={`mt-6 block text-center py-2.5 rounded-md font-medium transition-colors ${
                      plan.popular
                        ? 'bg-[#06b6d4] text-[#050507] hover:bg-[#22d3ee]'
                        : 'border border-[rgba(255,255,255,0.2)] text-[#f8fafc] hover:border-[rgba(255,255,255,0.4)]'
                    }`}
                  >
                    {plan.cta}
                  </NavLink>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-[#f8fafc] text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqData.map((faq, i) => (
              <div key={i} className="bg-[rgba(10,10,14,0.8)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] rounded-lg overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                >
                  <span className="text-sm font-medium text-[#f8fafc]">{faq.q}</span>
                  <ChevronDown size={16} className={`text-[#64748b] transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="px-4 pb-4"
                  >
                    <p className="text-sm text-[#94a3b8] leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative py-24 px-6 overflow-hidden">
        <GradientMesh opacity={0.3} />
        <div className="relative z-10 max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#f8fafc]">Ready to Understand Your Trading?</h2>
          <p className="mt-4 text-[#94a3b8]">Join 10,000+ traders who've transformed their performance with data-driven insights.</p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <NavLink to="/signup" className="px-8 py-3.5 bg-[#06b6d4] text-[#050507] rounded-md font-semibold hover:bg-[#22d3ee] transition-colors">
              Start Free Trial
            </NavLink>
            <a href="#pricing" className="text-[#06b6d4] hover:text-[#22d3ee] transition-colors underline underline-offset-4">
              View Pricing
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[rgba(255,255,255,0.08)] py-12 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-sm font-semibold text-[#f8fafc] mb-4">Product</h4>
            <ul className="space-y-2">
              <li><NavLink to="/journal" className="text-sm text-[#64748b] hover:text-[#94a3b8] transition-colors">Journal</NavLink></li>
              <li><NavLink to="/analytics" className="text-sm text-[#64748b] hover:text-[#94a3b8] transition-colors">Analytics</NavLink></li>
              <li><NavLink to="/ai-coach" className="text-sm text-[#64748b] hover:text-[#94a3b8] transition-colors">AI Coach</NavLink></li>
              <li><NavLink to="/replay" className="text-sm text-[#64748b] hover:text-[#94a3b8] transition-colors">Replay</NavLink></li>
              <li><NavLink to="/calendar" className="text-sm text-[#64748b] hover:text-[#94a3b8] transition-colors">Calendar</NavLink></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#f8fafc] mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-[#64748b] hover:text-[#94a3b8] transition-colors">Blog</a></li>
              <li><a href="#" className="text-sm text-[#64748b] hover:text-[#94a3b8] transition-colors">Documentation</a></li>
              <li><NavLink to="/community" className="text-sm text-[#64748b] hover:text-[#94a3b8] transition-colors">Community</NavLink></li>
              <li><NavLink to="/settings" className="text-sm text-[#64748b] hover:text-[#94a3b8] transition-colors">Support</NavLink></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#f8fafc] mb-4">Company</h4>
            <ul className="space-y-2">
              <li><span onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-sm text-[#64748b] hover:text-[#94a3b8] cursor-pointer transition-colors">About</span></li>
              <li><span className="text-sm text-[#64748b] hover:text-[#94a3b8] cursor-pointer transition-colors">Careers</span></li>
              <li><span className="text-sm text-[#64748b] hover:text-[#94a3b8] cursor-pointer transition-colors">Privacy</span></li>
              <li><span className="text-sm text-[#64748b] hover:text-[#94a3b8] cursor-pointer transition-colors">Terms</span></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#f8fafc] mb-4">Connect</h4>
            <ul className="space-y-2">
              <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-sm text-[#64748b] hover:text-[#94a3b8] transition-colors">Twitter/X</a></li>
              <li><a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-sm text-[#64748b] hover:text-[#94a3b8] transition-colors">Discord</a></li>
              <li><a href="mailto:support@tradelens.ai" className="text-sm text-[#64748b] hover:text-[#94a3b8] transition-colors">Email</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-[rgba(255,255,255,0.08)] text-center">
          <p className="text-xs text-[#64748b]">© 2025 TradeLens AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
