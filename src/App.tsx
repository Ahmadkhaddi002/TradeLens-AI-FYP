import { Routes, Route } from 'react-router';
import { AppLayout } from '@/components/AppLayout';

// Pages
import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import MT5Connect from '@/pages/MT5Connect';
import Dashboard from '@/pages/Dashboard';
import TradeJournal from '@/pages/TradeJournal';
import Analytics from '@/pages/Analytics';
import AICoach from '@/pages/AICoach';
import TradeReplay from '@/pages/TradeReplay';
import EconomicCalendar from '@/pages/EconomicCalendar';
import CalendarJournal from '@/pages/CalendarJournal';
import Leaderboard from '@/pages/Leaderboard';
import Community from '@/pages/Community';
import Pricing from '@/pages/Pricing';
import Settings from '@/pages/Settings';

export default function App() {
  return (
    <Routes>
      {/* Public pages (no sidebar) */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/connect" element={<MT5Connect />} />

      {/* Dashboard pages (with sidebar) */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/journal" element={<TradeJournal />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/ai-coach" element={<AICoach />} />
        <Route path="/replay" element={<TradeReplay />} />
        <Route path="/calendar" element={<EconomicCalendar />} />
        <Route path="/journal-calendar" element={<CalendarJournal />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/community" element={<Community />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
