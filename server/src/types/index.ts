export interface MT5Credentials {
  loginId: string;
  password: string;
  server: string;
}

export interface MT5AccountInfo {
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
  stopOutLevel: number;
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
  stopLoss: number;
  takeProfit: number;
  profit: number;
  swap: number;
  openTime: string;
  comment: string;
}

export interface MT5Trade {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  volume: number;
  openPrice: number;
  closePrice: number;
  profit: number;
  swap: number;
  commission: number;
  openTime: string;
  closeTime: string;
  comment: string;
}

export interface BrokerInfo {
  name: string;
  server: string;
  domain: string;
  apiUrl: string;
  mt5ApiUrl: string;
}

export interface ConnectionResult {
  success: boolean;
  accountInfo?: MT5AccountInfo;
  error?: string;
  serverValid: boolean;
  authValid: boolean;
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

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'ewallet' | 'crypto';
  label: string;
  icon: string;
  enabled: boolean;
  minDeposit: number;
  maxDeposit: number;
  processingTime: string;
  fee: number;
}

export interface DepositRequest {
  methodId: string;
  amount: number;
  currency: string;
}

export interface WithdrawRequest {
  methodId: string;
  amount: number;
  currency: string;
  address?: string;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  method: string;
  methodLabel: string;
  createdAt: string;
  completedAt?: string;
  txHash?: string;
}
