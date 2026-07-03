export interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  email: string;
  loginId: string;
  server: string;
  broker: string;
  balance: number;
  equity: number;
  winRate: number;
  profitFactor: number;
  totalReturn: number;
  consistency: number;
  trades: number;
}

const leaderboardData: Map<string, LeaderboardEntry> = new Map();

export function registerOnLeaderboard(data: {
  name?: string;
  email?: string;
  avatar?: string;
  loginId?: string;
  server?: string;
  broker?: string;
  balance?: number;
  equity?: number;
  winRate?: number;
  profitFactor?: number;
  totalReturn?: number;
  consistency?: number;
  trades?: number;
}) {
  if (!data.email) return;
  const existing = leaderboardData.get(data.email);
  leaderboardData.set(data.email, {
    rank: 0,
    name: data.name || existing?.name || data.email.split('@')[0],
    avatar: data.avatar || existing?.avatar || (data.name || data.email).slice(0, 2).toUpperCase(),
    email: data.email,
    loginId: data.loginId || existing?.loginId || '',
    server: data.server || existing?.server || '',
    broker: data.broker || existing?.broker || '',
    balance: data.balance ?? existing?.balance ?? 0,
    equity: data.equity ?? existing?.equity ?? 0,
    winRate: data.winRate ?? existing?.winRate ?? 0,
    profitFactor: data.profitFactor ?? existing?.profitFactor ?? 0,
    totalReturn: data.totalReturn ?? existing?.totalReturn ?? 0,
    consistency: data.consistency ?? existing?.consistency ?? 0,
    trades: data.trades ?? existing?.trades ?? 0,
  });
}

export function getLeaderboard(): LeaderboardEntry[] {
  return Array.from(leaderboardData.values())
    .sort((a, b) => b.totalReturn - a.totalReturn)
    .map((entry, idx) => ({ ...entry, rank: idx + 1 }));
}
