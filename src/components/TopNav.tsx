import { useState, useRef, useEffect } from 'react';
import { Search, Bell, ChevronDown, Moon, Sun, LogOut, Check, TrendingUp, AlertTriangle, Sparkles, Zap } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { useTheme } from 'next-themes';
import { useAuth } from '@/context/AuthContext';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/journal': 'Trade Journal',
  '/analytics': 'Analytics',
  '/ai-coach': 'AI Coach',
  '/replay': 'Trade Replay',
  '/calendar': 'Economic Calendar',
  '/journal-calendar': 'Journal Calendar',
  '/leaderboard': 'Leaderboard',
  '/community': 'Community',
  '/pricing': 'Pricing',
  '/settings': 'Settings',
  '/connect': 'Connect MT5',
};

interface Notification {
  id: string;
  icon: typeof Bell;
  color: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const defaultNotifs: Notification[] = [
  { id: '1', icon: Sparkles, color: '#06b6d4', title: 'AI Coach Tip Available', description: 'New personalized trading insight ready', time: '2m ago', read: false },
  { id: '2', icon: TrendingUp, color: '#22c55e', title: 'Daily Goal Reached', description: 'You hit 3 winning trades today', time: '1h ago', read: false },
  { id: '3', icon: Zap, color: '#f59e0b', title: 'Market Alert', description: 'EUR/USD volatility spike detected', time: '3h ago', read: false },
  { id: '4', icon: AlertTriangle, color: '#ef4444', title: 'Drawdown Warning', description: 'Account drawdown exceeded 5%', time: '1d ago', read: true },
  { id: '5', icon: Check, color: '#22c55e', title: 'Weekly Summary Ready', description: 'Your performance report is available', time: '2d ago', read: true },
];

export function TopNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notification[]>(defaultNotifs);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const title = pageTitles[location.pathname] || 'TradeLens AI';
  const unreadCount = notifs.filter((n) => !n.read).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = () => setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));

  const avatarContent = user?.avatar?.startsWith('data:') || user?.avatar?.startsWith('http')
    ? <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
    : <span className="text-xs font-semibold text-white">{(user?.avatar || user?.name || '?').slice(0, 2).toUpperCase()}</span>;

  return (
    <header className="h-14 bg-background/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4 lg:ml-0 ml-12">
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center bg-muted/40 border border-border rounded-lg px-3 py-1.5 w-72">
          <Search size={16} className="text-muted-foreground mr-2 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search trades, pairs, insights..."
            className="bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none w-full"
          />
        </div>

        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="relative" ref={notifRef}>
          <button onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#ef4444] rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <span className="text-sm font-semibold text-foreground">Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-[#06b6d4] hover:text-[#22d3ee]">Mark all read</button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifs.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">No notifications</div>
                ) : (
                  notifs.map((n) => {
                    const Icon = n.icon;
                    return (
                      <div key={n.id} className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors ${!n.read ? 'bg-muted/10' : ''}`}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: n.color + '1a' }}>
                          <Icon size={14} style={{ color: n.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground">{n.title}</div>
                          <div className="text-xs text-muted-foreground truncate">{n.description}</div>
                          <div className="text-[11px] text-muted-foreground/60 mt-0.5">{n.time}</div>
                        </div>
                        {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-[#06b6d4] mt-2 flex-shrink-0" />}
                      </div>
                    );
                  })
                )}
              </div>
              <div className="border-t border-border px-4 py-2.5 text-center">
                <button onClick={() => { setNotifOpen(false); navigate('/settings?tab=notifications'); }}
                  className="text-xs text-muted-foreground hover:text-foreground">All notification settings</button>
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={menuRef}>
          <button onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#06b6d4] to-[#8b5cf6] flex items-center justify-center overflow-hidden">
              {avatarContent}
            </div>
            <span className="text-sm text-foreground hidden sm:block max-w-[100px] truncate">{user?.name || 'User'}</span>
            <ChevronDown size={14} className="text-muted-foreground hidden sm:block" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50">
              <button onClick={() => { setMenuOpen(false); navigate('/settings'); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted/50 transition-colors">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#06b6d4] to-[#8b5cf6] flex items-center justify-center overflow-hidden text-xs font-semibold text-white">
                  {avatarContent}
                </div>
                <div className="text-left">
                  <div className="font-medium">{user?.name}</div>
                  <div className="text-xs text-muted-foreground">{user?.email}</div>
                </div>
              </button>
              <div className="h-px bg-border mx-3" />
              <button onClick={() => { setMenuOpen(false); logout(); navigate('/'); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#ef4444] hover:bg-muted/50 transition-colors">
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
