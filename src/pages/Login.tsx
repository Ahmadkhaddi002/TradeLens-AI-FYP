import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Loader2 } from 'lucide-react';
import { GradientMesh } from '@/components/GradientMesh';
import { useAuth } from '@/context/AuthContext';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FieldErrors {
  email?: string;
  password?: string;
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const validate = (): boolean => {
    const errs: FieldErrors = {};
    if (!email.trim()) errs.email = 'Email is required';
    else if (!EMAIL_RE.test(email.trim())) errs.email = 'Enter a valid email address';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 8) errs.password = 'Password must be at least 8 characters';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setError('');
    const ok = await login(email.trim(), password);
    if (ok) {
      navigate('/dashboard');
    } else {
      setError('Invalid email or password');
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      <GradientMesh opacity={0.3} />
      <div className="absolute inset-0 bg-[rgba(5,5,7,0.5)]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-[rgba(10,10,14,0.8)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] rounded-2xl p-8">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-[#06b6d4] to-[#3b82f6] flex items-center justify-center">
              <Lock size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-wider text-[#f8fafc]">TRADELENS</span>
          </div>

          <h1 className="text-2xl font-bold text-[#f8fafc] text-center">Welcome back</h1>
          <p className="text-sm text-[#94a3b8] text-center mt-2">Sign in to your account</p>

          <form className="mt-8 space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFieldErrors({}); setError(''); }}
                placeholder="trader@example.com"
                className={`w-full bg-[#1a1a24] border rounded-lg px-4 py-2.5 text-sm text-[#f8fafc] placeholder-[#64748b] outline-none focus:border-[#06b6d4] transition-colors ${fieldErrors.email ? 'border-[#ef4444]' : 'border-[rgba(255,255,255,0.08)]'}`}
              />
              {fieldErrors.email && <p className="text-xs text-[#ef4444] mt-1">{fieldErrors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFieldErrors({}); setError(''); }}
                  placeholder="••••••••"
                  className={`w-full bg-[#1a1a24] border rounded-lg px-4 py-2.5 text-sm text-[#f8fafc] placeholder-[#64748b] outline-none focus:border-[#06b6d4] transition-colors pr-10 ${fieldErrors.password ? 'border-[#ef4444]' : 'border-[rgba(255,255,255,0.08)]'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#94a3b8]"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.password && <p className="text-xs text-[#ef4444] mt-1">{fieldErrors.password}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-[rgba(255,255,255,0.2)] bg-[#1a1a24] accent-[#06b6d4]"
                />
                <span className="text-sm text-[#94a3b8]">Remember me</span>
              </label>
              <button type="button" className="text-sm text-[#06b6d4] hover:text-[#22d3ee]">
                Forgot password?
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-[rgba(239,68,68,0.05)] border border-[rgba(239,68,68,0.2)] flex items-start gap-2">
                <span className="text-sm text-[#ef4444]">{error}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="block w-full py-2.5 bg-[#06b6d4] text-[#050507] rounded-lg font-semibold text-center hover:bg-[#22d3ee] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
              {submitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-[rgba(255,255,255,0.08)]" />
            <span className="text-xs text-[#64748b]">or continue with</span>
            <div className="flex-1 h-px bg-[rgba(255,255,255,0.08)]" />
          </div>

          <button className="mt-6 w-full flex items-center justify-center gap-2 bg-[#12121a] border border-[rgba(255,255,255,0.08)] rounded-lg py-2.5 text-sm text-[#f8fafc] hover:border-[rgba(255,255,255,0.2)] transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <p className="mt-6 text-center text-sm text-[#94a3b8]">
            Don't have an account?{' '}
            <NavLink to="/signup" className="text-[#06b6d4] hover:text-[#22d3ee]">Sign up</NavLink>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
