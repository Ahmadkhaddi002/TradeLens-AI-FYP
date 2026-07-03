import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface MT5Account {
  login: string;
  name: string;
  server: string;
  broker: string;
  balance: number;
  equity: number;
  margin: number;
  marginFree: number;
  marginLevel: number;
  currency: string;
  leverage: number;
  isLive: boolean;
  connected: boolean;
}

export interface MT5Position {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  volume: number;
  openPrice: number;
  currentPrice: number;
  profit: number;
  openTime: string;
}

export interface MT5Trade {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  volume: number;
  openPrice: number;
  closePrice: number;
  profit: number;
  openTime: string;
  closeTime: string;
}

export interface LiveQuote {
  symbol: string;
  bid: number;
  ask: number;
  spread: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  time: string;
}

interface MT5ContextType {
  connecting: boolean;
  connected: boolean;
  error: string | null;
  account: MT5Account | null;
  positions: MT5Position[];
  trades: MT5Trade[];
  quotes: LiveQuote[];
  demoMode: boolean;
  creds: { loginId: string; password: string; server: string } | null;
  connect: (loginId: string, password: string, server: string) => Promise<boolean>;
  disconnect: () => void;
  refreshData: () => Promise<void>;
  connectionState: 'idle' | 'validating' | 'connecting' | 'connected' | 'error';
}

const MT5Context = createContext<MT5ContextType | null>(null);

const WS_URL = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`;

function loadCreds(): { loginId: string; password: string; server: string } | null {
  try {
    const raw = localStorage.getItem('mt5_creds');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function MT5Provider({ children }: { children: ReactNode }) {
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [account, setAccount] = useState<MT5Account | null>(null);
  const [positions, setPositions] = useState<MT5Position[]>([]);
  const [trades, setTrades] = useState<MT5Trade[]>([]);
  const [quotes, setQuotes] = useState<LiveQuote[]>([]);
  const [demoMode, setDemoMode] = useState(false);
  const [connectionState, setConnectionState] = useState<'idle' | 'validating' | 'connecting' | 'connected' | 'error'>('idle');

  const { user: authUser } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const [creds, setCreds] = useState<{ loginId: string; password: string; server: string } | null>(loadCreds);

  const connectWs = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    try {
      const ws = new WebSocket(WS_URL);
      ws.onopen = () => console.log('WS connected');
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'quotes') {
            setQuotes(msg.data);
          }
        } catch { /* ignore */ }
      };
      ws.onclose = () => {
        reconnectRef.current = setTimeout(connectWs, 3000);
      };
      ws.onerror = () => ws.close();
      wsRef.current = ws;
    } catch {
      reconnectRef.current = setTimeout(connectWs, 3000);
    }
  }, []);

  useEffect(() => {
    if (connected) connectWs();
    return () => {
      clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
  }, [connected, connectWs]);

  const connect = useCallback(async (loginId: string, password: string, server: string) => {
    setConnecting(true);
    setError(null);
    setConnectionState('validating');

    try {
      const res = await fetch(`/api/mt5/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId, password, server }),
      });

      const data = await res.json();

      if (data.success) {
        setAccount(data.account);
        setDemoMode(data.demoMode || false);
        setConnectionState('connected');
        setConnected(true);
        setCreds({ loginId, password, server });
        localStorage.setItem('mt5_creds', JSON.stringify({ loginId, password, server }));

        const fullDataRes = await fetch(`/api/mt5/full-data`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ loginId, password, server }),
        });
        const fullData = await fullDataRes.json();
        if (fullData.success) {
          setPositions(fullData.positions || []);
          setTrades(fullData.trades || []);
          localStorage.setItem('mt5_connected', 'true');
          localStorage.setItem('mt5_account', JSON.stringify(fullData.account));

          if (authUser?.email) {
            const wins = (fullData.trades || []).filter((t: any) => t.profit > 0).length;
            const total = (fullData.trades || []).length;
            const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
            const grossP = (fullData.trades || []).filter((t: any) => t.profit > 0).reduce((s: number, t: any) => s + t.profit, 0);
            const grossL = Math.abs((fullData.trades || []).filter((t: any) => t.profit < 0).reduce((s: number, t: any) => s + t.profit, 0));
            const pf = grossL > 0 ? parseFloat((grossP / grossL).toFixed(2)) : grossP > 0 ? 3.0 : 0;
            const totalReturn = (fullData.account?.balance || 0) > 0
              ? Math.round((((fullData.trades || []).reduce((s: number, t: any) => s + t.profit, 0) / (fullData.account?.balance || 25000)) * 100) * 10) / 10
              : 0;
            const acc = fullData.account || {};
            fetch('/api/leaderboard/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: authUser.email,
                name: authUser.name,
                avatar: authUser.avatar,
                loginId: acc.login || '',
                server: acc.server || '',
                broker: acc.broker || '',
                balance: acc.balance || 0,
                equity: acc.equity || 0,
                winRate,
                profitFactor: pf,
                totalReturn,
                consistency: Math.min(100, Math.max(0, winRate + Math.round(Math.random() * 20))),
                trades: total,
              }),
            }).catch(() => {});
          }
        }

        setConnecting(false);
        return true;
      } else {
        setError(data.error || 'Connection failed');
        setConnectionState('error');
        setConnecting(false);
        return false;
      }
    } catch (err) {
      setError('Could not reach the server. Make sure the backend is running.');
      setConnectionState('error');
      setConnecting(false);
      return false;
    }
  }, []);

  const disconnect = useCallback(() => {
    setConnected(false);
    setAccount(null);
    setPositions([]);
    setTrades([]);
    setDemoMode(false);
    setConnectionState('idle');
    setCreds(null);
    wsRef.current?.close();
    localStorage.removeItem('mt5_connected');
    localStorage.removeItem('mt5_account');
    localStorage.removeItem('mt5_creds');
  }, []);

  const refreshData = useCallback(async () => {
    if (!creds) return;
    try {
      const res = await fetch(`/api/mt5/full-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creds),
      });
      const data = await res.json();
      if (data.success) {
        setAccount(data.account);
        setDemoMode(data.demoMode || false);
        setPositions(data.positions || []);
        setTrades(data.trades || []);
      }
    } catch { /* ignore */ }
  }, [creds]);

  return (
    <MT5Context.Provider value={{
      connecting, connected, error, account, positions, trades, quotes, demoMode, creds,
      connect, disconnect, refreshData, connectionState,
    }}>
      {children}
    </MT5Context.Provider>
  );
}

export function useMT5() {
  const ctx = useContext(MT5Context);
  if (!ctx) throw new Error('useMT5 must be used within MT5Provider');
  return ctx;
}
