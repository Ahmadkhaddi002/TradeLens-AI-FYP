import { MT5Credentials, MT5AccountInfo, MT5Position, MT5Trade, ConnectionResult, BrokerInfo } from '../../types/index.js';
import { validateServer } from './validator.js';

const mockCache = new Map<string, MT5FullData>();

function cacheKey(creds: MT5Credentials): string {
  return `${creds.loginId}|${creds.server}`;
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function generateMockAccountInfo(credentials: MT5Credentials, broker: BrokerInfo): MT5AccountInfo {
  const loginNum = parseInt(credentials.loginId) || 12345678;
  const lastDigit = loginNum % 10;
  const s = loginNum;
  return {
    login: credentials.loginId,
    name: `Trader ${lastDigit}`,
    server: credentials.server,
    broker: broker.name,
    balance: 500 + Math.floor(seededRandom(s) * 3500),
    equity: 500 + Math.floor(seededRandom(s + 100) * 3500),
    margin: Math.floor(seededRandom(s + 200) * 50),
    marginFree: 250 + Math.floor(seededRandom(s + 300) * 200),
    marginLevel: 500 + Math.floor(seededRandom(s + 400) * 300),
    currency: 'USD',
    leverage: lastDigit % 3 === 0 ? 500 : lastDigit % 3 === 1 ? 200 : 100,
    stopOutLevel: 50,
    isLive: false,
    connected: true,
  };
}

function generateMockPositions(account: MT5AccountInfo): MT5Position[] {
  const symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD', 'US30', 'AUDUSD', 'USDCAD', 'BTCUSD'];
  const count = Math.floor(Math.random() * 5);
  const positions: MT5Position[] = [];
  for (let i = 0; i < count; i++) {
    const symbol = symbols[i % symbols.length];
    const isBuy = Math.random() > 0.4;
    const price = symbol === 'XAUUSD' ? 2000 + Math.random() * 100
      : symbol === 'US30' ? 38000 + Math.random() * 1000
      : symbol === 'BTCUSD' ? 40000 + Math.random() * 10000
      : 1 + Math.random() * 0.3;
    positions.push({
      id: `pos_${Date.now()}_${i}`,
      symbol,
      type: isBuy ? 'buy' : 'sell',
      volume: [0.1, 0.2, 0.3, 0.5, 1.0][Math.floor(Math.random() * 5)],
      openPrice: price,
      currentPrice: price + (isBuy ? 1 : -1) * (Math.random() * 0.02 * price),
      stopLoss: isBuy ? price * 0.98 : price * 1.02,
      takeProfit: isBuy ? price * 1.03 : price * 0.97,
      profit: (Math.random() - 0.45) * 200,
      swap: (Math.random() - 0.5) * 10,
      openTime: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
      comment: '',
    });
  }
  return positions;
}

function generateMockTradeHistory(account: MT5AccountInfo): MT5Trade[] {
  const symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD', 'US30', 'AUDUSD', 'USDCAD', 'BTCUSD'];
  const count = 30 + Math.floor(Math.random() * 20);
  const trades: MT5Trade[] = [];
  for (let i = 0; i < count; i++) {
    const symbol = symbols[i % symbols.length];
    const isBuy = Math.random() > 0.4;
    const openPrice = symbol === 'XAUUSD' ? 2000 + Math.random() * 100
      : symbol === 'US30' ? 38000 + Math.random() * 1000
      : symbol === 'BTCUSD' ? 40000 + Math.random() * 10000
      : 1 + Math.random() * 0.3;
    const pnlMultiplier = (Math.random() - 0.42) * 300;
    trades.push({
      id: `trade_${Date.now()}_${i}`,
      symbol,
      type: isBuy ? 'buy' : 'sell',
      volume: [0.1, 0.2, 0.3, 0.5, 1.0, 1.5][Math.floor(Math.random() * 6)],
      openPrice,
      closePrice: openPrice + (isBuy ? 1 : -1) * pnlMultiplier / 100000,
      profit: Math.round(pnlMultiplier),
      swap: (Math.random() - 0.5) * 15,
      commission: -(Math.random() * 15 + 3),
      openTime: new Date(Date.now() - Math.random() * 86400000 * 60).toISOString(),
      closeTime: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(),
      comment: `Trade #${i + 1}`,
    });
  }
  return trades.sort((a, b) => new Date(b.closeTime).getTime() - new Date(a.closeTime).getTime());
}

export async function connectToMT5(credentials: MT5Credentials): Promise<ConnectionResult> {
  const serverValidation = await validateServer(credentials.server);
  if (!serverValidation.valid) {
    return {
      success: false,
      serverValid: false,
      authValid: false,
      error: serverValidation.error || 'Invalid broker server',
    };
  }

  const broker = serverValidation.brokerInfo!;

  if (!credentials.loginId || credentials.loginId.length < 4) {
    return {
      success: false,
      serverValid: true,
      authValid: false,
      error: 'MT5 Login ID must be at least 4 digits',
    };
  }

  if (!credentials.password || credentials.password.length < 4) {
    return {
      success: false,
      serverValid: true,
      authValid: false,
      error: 'Password must be at least 4 characters',
    };
  }

  const accountInfo = generateMockAccountInfo(credentials, broker);
  return {
    success: true,
    serverValid: true,
    authValid: true,
    accountInfo,
  };
}

export async function getAccountInfo(credentials: MT5Credentials): Promise<MT5AccountInfo | null> {
  const result = await connectToMT5(credentials);
  return result.accountInfo || null;
}

export interface MT5FullData {
  account: MT5AccountInfo;
  positions: MT5Position[];
  trades: MT5Trade[];
}

export async function getFullData(credentials: MT5Credentials): Promise<MT5FullData> {
  const key = cacheKey(credentials);
  const cached = mockCache.get(key);
  if (cached) return cached;

  const account = await getAccountInfo(credentials) || generateMockAccountInfo(credentials, { name: 'Demo', server: credentials.server, domain: '', apiUrl: '', mt5ApiUrl: '' });
  const positions = generateMockPositions(account);
  const trades = generateMockTradeHistory(account);
  const data: MT5FullData = { account, positions, trades };
  mockCache.set(key, data);
  return data;
}
