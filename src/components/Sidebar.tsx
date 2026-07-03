import { useState } from 'react';
import { NavLink, useLocation } from 'react-router';
import {
  LayoutDashboard, BookOpen, BarChart3, Brain, PlayCircle,
  Calendar, CalendarDays, Trophy, Users, CreditCard, Settings,
  Menu, X, ChevronLeft, ChevronRight,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Overview', path: '/dashboard' },
  { icon: BookOpen, label: 'Journal', path: '/journal' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: Brain, label: 'AI Coach', path: '/ai-coach', badge: 'NEW' },
  { icon: PlayCircle, label: 'Replay', path: '/replay' },
  { icon: Calendar, label: 'Calendar', path: '/calendar' },
  { icon: CalendarDays, label: 'Journal Calendar', path: '/journal-calendar' },
  { icon: Trophy, label: 'Leaderboard', path: '/leaderboard' },
  { icon: Users, label: 'Community', path: '/community' },
  { icon: CreditCard, label: 'Pricing', path: '/pricing' },
  { icon: Settings, label: 'Settings', path: '/settings' },
  { icon: HelpCircle, label: 'Help', path: '/help' }
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between h-14 px-4 border-b border-border">
        {!collapsed && (
          <NavLink to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#06b6d4] to-[#3b82f6] flex items-center justify-center">
              <BarChart3 size={16} className="text-white" />
            </div>
            <span className="text-sm font-bold tracking-wider text-foreground">TRADELENS</span>
          </NavLink>
        )}
        {collapsed && (
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#06b6d4] to-[#3b82f6] flex items-center justify-center mx-auto">
            <BarChart3 size={16} className="text-white" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center w-6 h-6 rounded-md bg-muted/30 text-muted-foreground hover:text-foreground transition-colors"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150 relative',
                isActive
                  ? 'bg-accent/20 text-foreground border-l-2 border-primary'
                  : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground'
              )}
            >
              <item.icon size={18} className="flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-primary/15 text-primary rounded">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <NavLink
          to="/connect"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all',
            location.pathname === '/connect'
              ? 'bg-accent/20 text-foreground'
              : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground'
          )}
        >
          <div className="w-2 h-2 rounded-full bg-[#22c55e] flex-shrink-0" />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-foreground">MT5-Live</div>
              <div className="text-[10px] text-muted-foreground">Connected</div>
            </div>
          )}
        </NavLink>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-3 left-3 z-50 w-10 h-10 rounded-lg bg-sidebar border border-border flex items-center justify-center text-muted-foreground"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full z-40 bg-sidebar border-r border-border flex flex-col transition-all duration-250',
          collapsed ? 'w-16' : 'w-60',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
