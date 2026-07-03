import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router';
import { useTheme } from 'next-themes';
import { GlassCard } from '@/components/GlassCard';
import { PaymentMethods } from '@/components/PaymentMethods';
import { MT5Status } from '@/components/MT5Status';
import { useAuth } from '@/context/AuthContext';
import {
  User, Lock, Server, CreditCard, Bell, Monitor, Wallet,
  ChevronRight, Moon, Sun, Type, Trash2, RefreshCw, Loader2, Check, AlertCircle, X
} from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'profile', icon: User, label: 'Profile' },
  { id: 'security', icon: Lock, label: 'Security' },
  { id: 'mt5', icon: Server, label: 'MT5 Connections' },
  { id: 'payment', icon: Wallet, label: 'Payment Methods' },
  { id: 'subscription', icon: CreditCard, label: 'Subscription' },
  { id: 'notifications', icon: Bell, label: 'Notifications' },
  { id: 'display', icon: Monitor, label: 'Display' },
];

const notificationSettings = {
  email: [
    { id: 'weekly', label: 'Weekly summary', enabled: true },
    { id: 'insights', label: 'New AI insights', enabled: true },
    { id: 'billing', label: 'Subscription alerts', enabled: true },
  ],
  push: [
    { id: 'completed', label: 'Trade completed', enabled: true },
    { id: 'goals', label: 'Daily goal reached', enabled: false },
    { id: 'tips', label: 'AI coach tip', enabled: true },
  ],
};

export default function Settings() {
  const { user: authUser, updateProfile, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'profile');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);
  const { theme, setTheme } = useTheme();
  const [notifs, setNotifs] = useState(notificationSettings);

  const [timeFormat, setTimeFormat] = useState(() => localStorage.getItem('tradelens_timeFormat') || '24h');
  const [currency, setCurrency] = useState(() => localStorage.getItem('tradelens_currency') || 'USD ($)');
  const [density, setDensity] = useState(() => localStorage.getItem('tradelens_density') || 'Comfortable');
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('tradelens_fontSize') || 'Medium');

  useEffect(() => { localStorage.setItem('tradelens_timeFormat', timeFormat); }, [timeFormat]);
  useEffect(() => { localStorage.setItem('tradelens_currency', currency); }, [currency]);
  useEffect(() => { localStorage.setItem('tradelens_density', density); }, [density]);
  useEffect(() => {
    localStorage.setItem('tradelens_fontSize', fontSize);
    document.documentElement.style.fontSize =
      fontSize === 'Small' ? '14px' : fontSize === 'Large' ? '17px' : '16px';
  }, [fontSize]);

  const [profileName, setProfileName] = useState(authUser?.name || '');
  const [profileEmail, setProfileEmail] = useState(authUser?.email || '');
  const [profileBio, setProfileBio] = useState(authUser?.bio || '');
  const [profileExperience, setProfileExperience] = useState(authUser?.experience || 'Intermediate');
  const [profileTimezone, setProfileTimezone] = useState(authUser?.timezone || 'UTC-5 (Eastern Time)');
  const [profileAvatar, setProfileAvatar] = useState(authUser?.avatar || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();

  // Security modals
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [changeEmailValue, setChangeEmailValue] = useState('');
  const [changeEmailPassword, setChangeEmailPassword] = useState('');
  const [changeEmailErr, setChangeEmailErr] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPwValue, setCurrentPwValue] = useState('');
  const [newPwValue, setNewPwValue] = useState('');
  const [confirmPwValue, setConfirmPwValue] = useState('');
  const [changePwErr, setChangePwErr] = useState('');
  const [showDisconnectGoogle, setShowDisconnectGoogle] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [deletePw, setDeletePw] = useState('');
  const [deleteErr, setDeleteErr] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Subscription state
  const [subscription, setSubscription] = useState<any>(null);
  const [subLoading, setSubLoading] = useState(true);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [cancelDone, setCancelDone] = useState(false);

  useEffect(() => {
    if (activeTab === 'subscription') loadSubscription();
  }, [activeTab]);

  const loadSubscription = async () => {
    setSubLoading(true);
    try {
      const res = await fetch('/api/payment/subscription');
      const data = await res.json();
      setSubscription(data);
    } catch {}
    setSubLoading(false);
  };

  const handleCancel = async () => {
    setCanceling(true);
    try {
      const res = await fetch('/api/payment/cancel-subscription', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setCancelDone(true);
        setShowCancelConfirm(false);
        setSubscription(data.subscription);
        setTimeout(() => setCancelDone(false), 3000);
      }
    } catch {}
    setCanceling(false);
  };

  useEffect(() => {
    if (authUser) {
      setProfileName(authUser.name || '');
      setProfileEmail(authUser.email || '');
      setProfileBio(authUser.bio || '');
      setProfileExperience(authUser.experience || 'Intermediate');
      setProfileTimezone(authUser.timezone || 'UTC-5 (Eastern Time)');
      setProfileAvatar(authUser.avatar || authUser.name?.slice(0, 2).toUpperCase() || '');
    }
  }, [authUser]);

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaved(false);
    const avatarVal = profileAvatar || profileName.slice(0, 2).toUpperCase();
    const ok = await updateProfile({
      name: profileName,
      avatar: avatarVal,
      bio: profileBio,
      experience: profileExperience,
      timezone: profileTimezone,
    });
    setSaving(false);
    if (ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const toggleNotif = (category: 'email' | 'push', id: string) => {
    setNotifs({
      ...notifs,
      [category]: notifs[category].map((n) => n.id === id ? { ...n, enabled: !n.enabled } : n),
    });
  };

  const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <button onClick={onChange}
      className={`relative w-10 h-5 rounded-full transition-colors ${enabled ? 'bg-[#06b6d4]' : 'bg-[rgba(255,255,255,0.1)]'}`}>
      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${enabled ? 'left-5' : 'left-0.5'}`} />
    </button>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="space-y-1">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-[rgba(6,182,212,0.1)] text-[#06b6d4] border border-[rgba(6,182,212,0.2)]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-[rgba(255,255,255,0.03)]'
              )}>
              <tab.icon size={18} />
              {tab.label}
              <ChevronRight size={14} className="ml-auto" />
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {activeTab === 'profile' && (
            <GlassCard>
              <h2 className="text-lg font-semibold text-foreground mb-6">Profile Settings</h2>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#06b6d4] to-[#8b5cf6] flex items-center justify-center text-xl font-semibold text-white overflow-hidden">
                    {profileAvatar?.startsWith('data:') || profileAvatar?.startsWith('http')
                      ? <img src={profileAvatar} alt="" className="w-full h-full object-cover" />
                      : profileAvatar || profileName.slice(0, 2).toUpperCase() || '?'
                    }
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-[#06b6d4] hover:text-[#22d3ee] cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.size > 2 * 1024 * 1024) return alert('Image must be under 2MB');
                          const reader = new FileReader();
                          reader.onload = (ev) => setProfileAvatar(ev.target?.result as string);
                          reader.readAsDataURL(file);
                        }}
                        className="hidden"
                      />
                      Upload Photo
                    </label>
                    {profileAvatar && (
                      <button onClick={() => setProfileAvatar('')}
                        className="text-xs text-[#ef4444] hover:text-red-400 text-left">Remove</button>
                    )}
                    <span className="text-xs text-muted-foreground">PNG, JPG under 2MB</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Display Name</label>
                    <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:border-[#06b6d4]" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email</label>
                    <input type="email" value={profileEmail} disabled className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-sm text-muted-foreground outline-none cursor-not-allowed" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Bio</label>
                  <textarea value={profileBio} onChange={(e) => setProfileBio(e.target.value)} placeholder="Tell other traders about yourself..." className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:border-[#06b6d4] resize-none min-h-[80px]" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Experience Level</label>
                    <select value={profileExperience} onChange={(e) => setProfileExperience(e.target.value)} className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:border-[#06b6d4]">
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                      <option>Professional</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Timezone</label>
                    <select value={profileTimezone} onChange={(e) => setProfileTimezone(e.target.value)} className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:border-[#06b6d4]">
                      <option>UTC-5 (Eastern Time)</option>
                      <option>UTC+0 (London)</option>
                      <option>UTC+1 (Central Europe)</option>
                      <option>UTC+8 (Singapore)</option>
                    </select>
                  </div>
                </div>
                <button onClick={handleSaveProfile} disabled={saving} className="px-6 py-2.5 bg-[#06b6d4] text-primary-foreground rounded-lg font-medium hover:bg-[#22d3ee] transition-colors flex items-center gap-2 disabled:opacity-50">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : null}
                  {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
                </button>
              </div>
            </GlassCard>
          )}

          {activeTab === 'security' && (
            <GlassCard>
              <h2 className="text-lg font-semibold text-foreground mb-6">Account Security</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-[rgba(255,255,255,0.02)] rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-foreground">Email Address</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{authUser?.email || 'No email set'}</div>
                  </div>
                  <button onClick={() => setShowChangeEmail(true)} className="text-sm text-[#06b6d4] hover:text-[#22d3ee]">Change</button>
                </div>
                <div className="flex items-center justify-between p-4 bg-[rgba(255,255,255,0.02)] rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-foreground">Password</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{authUser?.googleConnected ? 'Set a password for your Google account' : 'Update your password'}</div>
                  </div>
                  <button onClick={() => setShowChangePassword(true)} className="text-sm text-[#06b6d4] hover:text-[#22d3ee]">{authUser?.googleConnected ? 'Set Password' : 'Change Password'}</button>
                </div>
                <div className="flex items-center justify-between p-4 bg-[rgba(255,255,255,0.02)] rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-foreground">Two-Factor Authentication</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Add an extra layer of security</div>
                  </div>
                  <ToggleSwitch enabled={false} onChange={() => {}} />
                </div>
                {authUser?.googleConnected && (
                  <div className="flex items-center justify-between p-4 bg-[rgba(255,255,255,0.02)] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[rgba(255,255,255,0.05)] flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">Google</div>
                        <div className="text-xs text-[#22c55e]">Connected</div>
                      </div>
                    </div>
                    <button onClick={() => setShowDisconnectGoogle(true)} className="text-sm text-[#ef4444] hover:text-red-400">Disconnect</button>
                  </div>
                )}
                <div className="pt-6 border-t border-border">
                  <button onClick={() => setShowDeleteAccount(true)} className="flex items-center gap-2 text-sm text-[#ef4444] hover:text-red-400 transition-colors">
                    <Trash2 size={14} /> Delete Account
                  </button>
                </div>
              </div>

              {/* Change Email Modal */}
              <AnimatePresence>
                {showChangeEmail && (
                  <SecurityModal title="Change Email" onClose={() => setShowChangeEmail(false)} onSubmit={async () => {
                    const res = await fetch('/api/auth/change-email', {
                      method: 'POST', headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email: authUser?.email, newEmail: changeEmailValue, password: changeEmailPassword }),
                    });
                    const data = await res.json();
                    if (data.success) {
                      await updateProfile({ name: authUser?.name || '' });
                      setShowChangeEmail(false); setChangeEmailValue(''); setChangeEmailPassword(''); setChangeEmailErr('');
                    } else { setChangeEmailErr(data.error); }
                  }} error={changeEmailErr}>
                    <input type="email" value={changeEmailValue} onChange={e => setChangeEmailValue(e.target.value)} placeholder="New email address" className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:border-[#06b6d4]" />
                    {authUser?.googleConnected ? null : <input type="password" value={changeEmailPassword} onChange={e => setChangeEmailPassword(e.target.value)} placeholder="Current password" className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:border-[#06b6d4]" />}
                  </SecurityModal>
                )}
              </AnimatePresence>

              {/* Change Password Modal */}
              <AnimatePresence>
                {showChangePassword && (
                  <SecurityModal title={authUser?.googleConnected ? 'Set Password' : 'Change Password'} onClose={() => setShowChangePassword(false)} onSubmit={async () => {
                    if (newPwValue.length < 8) { setChangePwErr('Password must be at least 8 characters'); return; }
                    if (newPwValue !== confirmPwValue) { setChangePwErr('Passwords do not match'); return; }
                    const res = await fetch('/api/auth/change-password', {
                      method: 'POST', headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email: authUser?.email, currentPassword: currentPwValue, newPassword: newPwValue }),
                    });
                    const data = await res.json();
                    if (data.success) { setShowChangePassword(false); setCurrentPwValue(''); setNewPwValue(''); setConfirmPwValue(''); setChangePwErr(''); }
                    else { setChangePwErr(data.error); }
                  }} error={changePwErr}>
                    {authUser?.googleConnected ? null : <input type="password" value={currentPwValue} onChange={e => setCurrentPwValue(e.target.value)} placeholder="Current password" className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:border-[#06b6d4]" />}
                    <input type="password" value={newPwValue} onChange={e => setNewPwValue(e.target.value)} placeholder="New password" className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:border-[#06b6d4]" />
                    <input type="password" value={confirmPwValue} onChange={e => setConfirmPwValue(e.target.value)} placeholder="Confirm new password" className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:border-[#06b6d4]" />
                  </SecurityModal>
                )}
              </AnimatePresence>

              {/* Disconnect Google Modal */}
              <AnimatePresence>
                {showDisconnectGoogle && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDisconnectGoogle(false)} />
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                      className="relative z-10 w-full max-w-sm bg-card border border-border rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-semibold text-foreground">Disconnect Google</h3>
                        <button onClick={() => setShowDisconnectGoogle(false)} className="p-1 rounded-lg text-muted-foreground hover:text-foreground"><X size={16} /></button>
                      </div>
                      <p className="text-sm text-muted-foreground mb-6">Are you sure? You will need to set a password to sign in with email.</p>
                      <div className="flex gap-3">
                        <button onClick={() => setShowDisconnectGoogle(false)} className="flex-1 py-2.5 border border-border rounded-lg text-sm text-foreground hover:border-[rgba(255,255,255,0.3)] transition-colors">Cancel</button>
                        <button onClick={async () => {
                          await fetch('/api/auth/disconnect-google', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: authUser?.email }) });
                          await updateProfile({ name: authUser?.name || '' });
                          setShowDisconnectGoogle(false);
                        }} className="flex-1 py-2.5 bg-[#ef4444] text-white rounded-lg text-sm font-medium hover:bg-red-500 transition-colors">Disconnect</button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Delete Account Modal */}
              <AnimatePresence>
                {showDeleteAccount && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !deleting && setShowDeleteAccount(false)} />
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                      className="relative z-10 w-full max-w-sm bg-card border border-border rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2"><AlertCircle size={18} className="text-[#ef4444]" /><span className="text-base font-semibold text-foreground">Delete Account</span></div>
                        <button onClick={() => setShowDeleteAccount(false)} className="p-1 rounded-lg text-muted-foreground hover:text-foreground"><X size={16} /></button>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">This action is permanent. All your data will be lost.</p>
                      {authUser?.googleConnected ? null : (
                        <input type="password" value={deletePw} onChange={e => setDeletePw(e.target.value)} placeholder="Enter password to confirm" className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:border-[#ef4444] mb-4" />
                      )}
                      {deleteErr && <p className="text-xs text-[#ef4444] mb-4">{deleteErr}</p>}
                      <div className="flex gap-3">
                        <button onClick={() => setShowDeleteAccount(false)} disabled={deleting} className="flex-1 py-2.5 border border-border rounded-lg text-sm text-foreground hover:border-[rgba(255,255,255,0.3)] transition-colors">Keep Account</button>
                        <button onClick={async () => {
                          setDeleting(true);
                          const res = await fetch('/api/auth/account', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: authUser?.email, password: deletePw }) });
                          const data = await res.json();
                          if (data.success) { logout(); navigate('/'); }
                          else { setDeleteErr(data.error); setDeleting(false); }
                        }} disabled={deleting} className="flex-1 py-2.5 bg-[#ef4444] text-white rounded-lg text-sm font-medium hover:bg-red-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                          {deleting ? <Loader2 size={14} className="animate-spin" /> : null}
                          {deleting ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          )}

          {activeTab === 'mt5' && (
            <GlassCard>
              <h2 className="text-lg font-semibold text-foreground mb-6">MT5 Connections</h2>
              <MT5Status />
              <div className="mt-4 space-y-4">
                <div className="p-4 bg-[rgba(255,255,255,0.02)] rounded-lg border border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
                      <div>
                        <div className="text-sm font-medium text-foreground">IC Markets — ICMarkets-Live</div>
                        <div className="text-xs text-muted-foreground font-mono">12****78</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Synced 2m ago</span>
                      <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50">
                        <RefreshCw size={14} />
                      </button>
                    </div>
                  </div>
                </div>
                <button className="w-full py-3 border border-dashed border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:border-[rgba(255,255,255,0.3)] transition-colors flex items-center justify-center gap-2">
                  <Server size={14} /> + Add Another Account
                </button>
              </div>
            </GlassCard>
          )}

          {activeTab === 'payment' && <PaymentMethods />}

          {activeTab === 'subscription' && (
            <GlassCard>
              <h2 className="text-lg font-semibold text-foreground mb-6">Subscription</h2>
              {subLoading ? (
                <div className="flex items-center justify-center py-8"><Loader2 size={20} className="animate-spin text-muted-foreground" /></div>
              ) : !subscription || subscription.status === 'none' ? (
                <div className="text-center py-8">
                  <CreditCard size={36} className="mx-auto text-muted-foreground mb-3" />
                  <div className="text-sm text-muted-foreground">No active subscription</div>
                  <a href="/pricing" className="mt-3 inline-block px-5 py-2 bg-[#06b6d4] text-primary-foreground rounded-lg text-sm font-medium hover:bg-[#22d3ee] transition-colors">View Plans</a>
                </div>
              ) : (
                <>
                  <div className={`p-4 rounded-lg mb-6 border ${subscription.status === 'active' ? 'bg-[rgba(6,182,212,0.05)] border-[rgba(6,182,212,0.15)]' : 'bg-[rgba(239,68,68,0.05)] border-[rgba(239,68,68,0.15)]'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`text-sm font-medium ${subscription.status === 'active' ? 'text-[#06b6d4]' : 'text-[#ef4444]'}`}>
                          {subscription.plan?.charAt(0).toUpperCase() + subscription.plan?.slice(1)} Plan
                        </div>
                        <div className="text-2xl font-bold text-foreground mt-1">
                          ${subscription.amount}<span className="text-sm text-muted-foreground font-normal">/month</span>
                        </div>
                        {subscription.status === 'active' && (
                          <div className="text-xs text-muted-foreground mt-1">Next billing: {new Date(subscription.nextBillingAt).toLocaleDateString()}</div>
                        )}
                        {subscription.status === 'canceled' && (
                          <div className="text-xs text-muted-foreground mt-1">Canceled on {new Date(subscription.canceledAt).toLocaleDateString()}</div>
                        )}
                      </div>
                      <div className={`text-xs px-3 py-1 rounded-full font-medium ${subscription.status === 'active' ? 'bg-[rgba(34,197,94,0.1)] text-[#22c55e]' : 'bg-[rgba(239,68,68,0.1)] text-[#ef4444]'}`}>
                        {subscription.status === 'active' ? 'Active' : 'Canceled'}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Started</span>
                      <span className="text-foreground">{new Date(subscription.startedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Payment Method</span>
                      <span className="text-foreground font-mono text-xs">****{subscription.paymentMethodId?.slice(-4) || 'N/A'}</span>
                    </div>

                    {cancelDone && (
                      <div className="p-3 rounded-lg bg-[rgba(34,197,94,0.05)] border border-[rgba(34,197,94,0.2)] flex items-center gap-2">
                        <Check size={14} className="text-[#22c55e]" />
                        <span className="text-sm text-[#22c55e]">Subscription canceled</span>
                      </div>
                    )}

                    <div className="flex gap-3 pt-4">
                      <a href="/pricing" className="px-4 py-2 border border-border rounded-lg text-sm text-foreground hover:border-[rgba(255,255,255,0.3)] transition-colors">Change Plan</a>
                      {subscription.status === 'active' && (
                        <button onClick={() => setShowCancelConfirm(true)} className="px-4 py-2 text-sm text-[#ef4444] hover:text-red-400 transition-colors">Cancel Subscription</button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </GlassCard>
          )}

          {/* Cancel Confirmation Dialog */}
          <AnimatePresence>
            {showCancelConfirm && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !canceling && setShowCancelConfirm(false)} />
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="relative z-10 w-full max-w-sm bg-card border border-border rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={18} className="text-[#ef4444]" />
                      <span className="text-base font-semibold text-foreground">Cancel Subscription</span>
                    </div>
                    <button onClick={() => setShowCancelConfirm(false)} className="p-1 rounded-lg text-muted-foreground hover:text-foreground"><X size={16} /></button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">Are you sure you want to cancel? You'll lose access to premium features at the end of your billing period.</p>
                  <div className="flex gap-3">
                    <button onClick={() => setShowCancelConfirm(false)} disabled={canceling}
                      className="flex-1 py-2.5 border border-border rounded-lg text-sm text-foreground hover:border-[rgba(255,255,255,0.3)] transition-colors">
                      Keep Plan
                    </button>
                    <button onClick={handleCancel} disabled={canceling}
                      className="flex-1 py-2.5 bg-[#ef4444] text-white rounded-lg text-sm font-medium hover:bg-red-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                      {canceling ? <Loader2 size={14} className="animate-spin" /> : null}
                      {canceling ? 'Canceling...' : 'Yes, Cancel'}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {activeTab === 'notifications' && (
            <GlassCard>
              <h2 className="text-lg font-semibold text-foreground mb-6">Notification Preferences</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Email Notifications</h3>
                  <div className="space-y-3">
                    {notifs.email.map((n) => (
                      <div key={n.id} className="flex items-center justify-between py-2">
                        <span className="text-sm text-foreground">{n.label}</span>
                        <ToggleSwitch enabled={n.enabled} onChange={() => toggleNotif('email', n.id)} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-4 border-t border-border">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Push Notifications</h3>
                  <div className="space-y-3">
                    {notifs.push.map((n) => (
                      <div key={n.id} className="flex items-center justify-between py-2">
                        <span className="text-sm text-foreground">{n.label}</span>
                        <ToggleSwitch enabled={n.enabled} onChange={() => toggleNotif('push', n.id)} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>
          )}

          {activeTab === 'display' && (
            <GlassCard>
              <h2 className="text-lg font-semibold text-foreground mb-6">Display Preferences</h2>
              <div className="space-y-6">
                {/* Theme */}
                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="text-sm font-medium text-foreground">Theme</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Choose your preferred color scheme</div>
                  </div>
                  <div className="flex bg-muted/40 border border-border rounded-lg overflow-hidden">
                    <button onClick={() => setTheme('dark')}
                      className={cn('flex items-center gap-2 px-4 py-2 text-xs font-medium transition-colors',
                        theme === 'dark' ? 'bg-primary/15 text-primary' : 'text-muted-foreground'
                      )}>
                      <Moon size={14} /> Dark
                    </button>
                    <button onClick={() => setTheme('light')}
                      className={cn('flex items-center gap-2 px-4 py-2 text-xs font-medium transition-colors',
                        theme === 'light' ? 'bg-primary/15 text-primary' : 'text-muted-foreground'
                      )}>
                      <Sun size={14} /> Light
                    </button>
                  </div>
                </div>
                {/* Font Size */}
                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="text-sm font-medium text-foreground">Font Size</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Adjust text size across the app</div>
                  </div>
                  <div className="flex bg-muted/40 border border-border rounded-lg overflow-hidden">
                    {['Small', 'Medium', 'Large'].map((s) => (
                      <button key={s} onClick={() => setFontSize(s)}
                        className={cn('flex items-center gap-2 px-4 py-2 text-xs font-medium transition-colors',
                          fontSize === s ? 'bg-primary/15 text-primary' : 'text-muted-foreground'
                        )}>
                        <Type size={14} /> {s}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Time Format */}
                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="text-sm font-medium text-foreground">Time Format</div>
                  </div>
                  <div className="flex bg-muted/40 border border-border rounded-lg overflow-hidden">
                    {['24h', '12h'].map((t) => (
                      <button key={t} onClick={() => setTimeFormat(t)}
                        className={cn('px-4 py-2 text-xs font-medium transition-colors',
                          timeFormat === t ? 'bg-primary/15 text-primary' : 'text-muted-foreground'
                        )}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Currency Display */}
                <div className="flex items-center justify-between py-2">
                  <div><div className="text-sm font-medium text-foreground">Currency Display</div></div>
                  <select value={currency} onChange={(e) => setCurrency(e.target.value)}
                    className="bg-muted/40 border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none">
                    <option>USD ($)</option>
                    <option>EUR (€)</option>
                    <option>GBP (£)</option>
                  </select>
                </div>
                {/* Layout Density */}
                <div className="flex items-center justify-between py-2">
                  <div><div className="text-sm font-medium text-foreground">Layout Density</div></div>
                  <div className="flex bg-muted/40 border border-border rounded-lg overflow-hidden">
                    {['Compact', 'Comfortable'].map((d) => (
                      <button key={d} onClick={() => setDensity(d)}
                        className={cn('px-4 py-2 text-xs font-medium transition-colors',
                          density === d ? 'bg-primary/15 text-primary' : 'text-muted-foreground'
                        )}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function SecurityModal({ title, onClose, onSubmit, error, children }: { title: string; onClose: () => void; onSubmit: () => Promise<void>; error?: string; children: React.ReactNode }) {
  const [submitting, setSubmitting] = useState(false);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !submitting && onClose()} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="relative z-10 w-full max-w-sm bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <button onClick={onClose} disabled={submitting} className="p-1 rounded-lg text-muted-foreground hover:text-foreground"><X size={16} /></button>
        </div>
        <form onSubmit={async (e) => { e.preventDefault(); if (submitting) return; setSubmitting(true); await onSubmit(); setSubmitting(false); }} className="space-y-4">
          {children}
          {error && <p className="text-xs text-[#ef4444]">{error}</p>}
          <button type="submit" disabled={submitting} className="w-full py-2.5 bg-[#06b6d4] text-primary-foreground rounded-lg text-sm font-medium hover:bg-[#22d3ee] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
            {submitting ? 'Saving...' : 'Save'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
