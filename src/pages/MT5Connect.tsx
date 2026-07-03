import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Server, Check, X, Loader2, Shield,
  Globe, Key, ChevronDown, AlertCircle
} from 'lucide-react';
import { GradientMesh } from '@/components/GradientMesh';
import { useMT5 } from '@/context/MT5Context';

const exnessServers = [
  { name: 'Exness Real', server: 'Exness-Real' },
  { name: 'Exness MT5Trial15', server: 'Exness-MT5Trial15' },
  { name: 'Exness MT5Trial16', server: 'Exness-MT5Trial16' },
];

interface FieldErrors {
  loginId?: string;
  password?: string;
  server?: string;
}

export default function MT5Connect() {
  const navigate = useNavigate();
  const { connect, connecting, connected, error, connectionState, account } = useMT5();
  const [form, setForm] = useState({ loginId: '', password: '', server: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const validate = (): boolean => {
    const errs: FieldErrors = {};
    if (!form.loginId.trim()) errs.loginId = 'Login ID is required';
    else if (!/^\d{5,}$/.test(form.loginId.trim())) errs.loginId = 'Login ID must be at least 5 digits';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 4) errs.password = 'Password must be at least 4 characters';
    if (!form.server) errs.server = 'Select a broker server';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => new Set(prev).add(field));
    validate();
  };

  const handleConnect = async () => {
    const allFields = new Set(['loginId', 'password', 'server']);
    setTouched(allFields);
    if (!validate()) return;
    const success = await connect(form.loginId.trim(), form.password, form.server);
    if (success) {
      setTimeout(() => navigate('/dashboard'), 7000);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      <GradientMesh opacity={0.25} />
      <div className="absolute inset-0 bg-background/50" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-lg"
      >
        <div className="flex items-center justify-center gap-4 mb-8">
          {['Account', 'Connect MT5', 'Dashboard'].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                connected || (i === 1 && connectionState === 'connected')
                  ? 'bg-[#22c55e] text-white'
                  : i === 1
                  ? 'bg-[#06b6d4] text-primary-foreground'
                  : 'bg-muted text-muted-foreground border border-border'
              }`}>
                {connected || (i === 1 && connectionState === 'connected') ? <Check size={14} /> : i + 1}
              </div>
              <span className={`text-xs ${i === 1 ? 'text-foreground' : 'text-muted-foreground'}`}>{step}</span>
              {i < 2 && <div className="w-8 h-px bg-border ml-2" />}
            </div>
          ))}
        </div>

        <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-[#06b6d4] to-[#3b82f6] flex items-center justify-center">
              <Server size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-wider text-foreground">TRADELENS</span>
          </div>

          {connected && account ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-[rgba(34,197,94,0.1)] border-2 border-[#22c55e] flex items-center justify-center mb-4">
                <Check size={28} className="text-[#22c55e]" />
              </div>
              {!account.isLive ? (
                <>
                  <h2 className="text-xl font-bold text-foreground">Welcome to your {account.server} account</h2>
                  <p className="text-sm text-muted-foreground mt-1">Your demo account is ready. Start exploring with ${account.balance.toLocaleString()} in virtual funds.</p>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-foreground">Connected to MT5</h2>
                  <p className="text-sm text-muted-foreground mt-1">{account.broker} — {account.server}</p>
                </>
              )}
              <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-border">
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div>
                    <div className="text-xs text-muted-foreground">Account</div>
                    <div className="text-sm font-medium text-foreground font-mono">{account.login}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Balance</div>
                    <div className="text-sm font-medium text-[#22c55e]">${account.balance.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Leverage</div>
                    <div className="text-sm font-medium text-foreground">1:{account.leverage}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Currency</div>
                    <div className="text-sm font-medium text-foreground">{account.currency}</div>
                  </div>
                </div>
              </div>
              <NavLink to="/dashboard"
                className="mt-6 inline-block w-full py-2.5 bg-[#06b6d4] text-primary-foreground rounded-lg font-semibold text-center hover:bg-[#22d3ee] transition-colors">
                Go to Dashboard
              </NavLink>
            </motion.div>
          ) : (
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <h1 className="text-xl font-bold text-foreground text-center">Connect Your MT5 Account</h1>
              <p className="text-sm text-muted-foreground text-center">
                Enter your MT5 credentials to import your trading history and analyze your performance.
              </p>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                  <Key size={12} /> MT5 Login ID
                </label>
                <input type="text" value={form.loginId}
                  onChange={(e) => { setForm({ ...form, loginId: e.target.value }); setFieldErrors({}); }}
                  onBlur={() => handleBlur('loginId')}
                  placeholder="12345678" autoComplete="off"
                  className={`w-full bg-muted/40 border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary transition-colors font-mono ${touched.has('loginId') && fieldErrors.loginId ? 'border-[#ef4444]' : 'border-border'}`} />
                {touched.has('loginId') && fieldErrors.loginId && <p className="text-xs text-[#ef4444] mt-1">{fieldErrors.loginId}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                  <Shield size={12} /> Investor Password (Read-Only)
                </label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={form.password}
                    onChange={(e) => { setForm({ ...form, password: e.target.value }); setFieldErrors({}); }}
                    onBlur={() => handleBlur('password')}
                    placeholder="••••••••" autoComplete="off"
                    className={`w-full bg-muted/40 border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary transition-colors pr-10 ${touched.has('password') && fieldErrors.password ? 'border-[#ef4444]' : 'border-border'}`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <X size={16} /> : <Shield size={16} />}
                  </button>
                </div>
                {touched.has('password') && fieldErrors.password && <p className="text-xs text-[#ef4444] mt-1">{fieldErrors.password}</p>}
                <p className="text-xs text-muted-foreground mt-1">We only need read-only (investor) access to your account</p>
              </div>

               <div>
                 <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                   <Globe size={12} /> Broker Server
                 </label>
                 <div className="relative">
                   <select value={form.server} onChange={(e) => { setForm({ ...form, server: e.target.value }); setFieldErrors({}); }}
                     onBlur={() => handleBlur('server')}
                     className={`w-full bg-muted/40 border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary transition-colors appearance-none ${touched.has('server') && fieldErrors.server ? 'border-[#ef4444]' : 'border-border'}`}>
                     <option value="">Select broker server...</option>
                     <optgroup label="Live Accounts">
                       {exnessServers.filter(s => !s.server.toLowerCase().includes('trial')).map((server) => (
                         <option key={server.server} value={server.server}>{server.name} — {server.server}</option>
                       ))}
                     </optgroup>
                     <optgroup label="Demo / Trial Accounts">
                       {exnessServers.filter(s => s.server.toLowerCase().includes('trial')).map((server) => (
                         <option key={server.server} value={server.server}>{server.name} — {server.server}</option>
                       ))}
                     </optgroup>
                   </select>
                   <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                     <ChevronDown size={16} />
                   </div>
                 </div>
                 {touched.has('server') && fieldErrors.server && <p className="text-xs text-[#ef4444] mt-1">{fieldErrors.server}</p>}
               </div>

               <div className="grid grid-cols-3 gap-2">
                 {exnessServers.map((server) => (
                   <button key={server.server} type="button" onClick={() => { setForm({ ...form, server: server.server }); setFieldErrors({}); }}
                     className={`p-2.5 rounded-lg border text-center transition-colors ${
                       form.server === server.server
                         ? 'border-primary bg-primary/5'
                         : 'border-border hover:border-border/60 bg-muted/30'
                     }`}>
                     <div className="text-xs font-medium text-foreground">{server.name}</div>
                   </button>
                 ))}
               </div>

              <AnimatePresence mode="wait">
                {connectionState === 'validating' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <Loader2 size={16} className="text-primary animate-spin" />
                    <div>
                      <span className="text-sm text-primary">Connecting to {form.server}...</span>
                      <p className="text-xs text-muted-foreground mt-0.5">Fetching your account data</p>
                    </div>
                  </motion.div>
                )}
                {connectionState === 'connected' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="p-3 rounded-lg bg-[rgba(34,197,94,0.05)] border border-[rgba(34,197,94,0.2)]">
                    <div className="flex items-center gap-2 mb-1">
                      <Check size={16} className="text-[#22c55e]" />
                      <span className="text-sm font-medium text-[#22c55e]">Connected!</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Account data synced. Redirecting...</p>
                  </motion.div>
                )}
                {connectionState === 'error' && error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="p-3 rounded-lg bg-[rgba(239,68,68,0.05)] border border-[rgba(239,68,68,0.2)] flex items-start gap-2">
                    <AlertCircle size={16} className="text-[#ef4444] mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-sm text-[#ef4444]">{error}</span>
                      <p className="text-xs text-muted-foreground mt-0.5">Double-check your login ID, password, and server name.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-3">
                <button type="button"
                  onClick={handleConnect}
                  disabled={connecting || !form.loginId || !form.password || !form.server}
                  className="flex-1 py-2.5 bg-[#06b6d4] text-primary-foreground rounded-lg font-semibold hover:bg-[#22d3ee] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {connecting ? <Loader2 size={16} className="animate-spin" /> : <Server size={16} />}
                  {connecting ? 'Connecting...' : 'Connect Account'}
                </button>
              </div>

              <div className="mt-6 flex items-center gap-2 text-muted-foreground justify-center">
                <Shield size={12} />
                <span className="text-xs">AES-256 encrypted · Read-only access · Never stored</span>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
