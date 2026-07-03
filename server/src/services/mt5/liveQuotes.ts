import { LiveQuote } from '../../types/index.js';

const SYMBOLS = ['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD', 'US30', 'AUDUSD', 'USDCAD', 'BTCUSD', 'ETHUSD', 'GBPJPY', 'EURJPY', 'NZDUSD'];

const basePrices: Record<string, number> = {
  EURUSD: 1.0845,
  GBPUSD: 1.2634,
  USDJPY: 148.32,
  XAUUSD: 2034.5,
  US30: 38456,
  AUDUSD: 0.6543,
  USDCAD: 1.3542,
  BTCUSD: 43250,
  ETHUSD: 2280,
  GBPJPY: 187.45,
  EURJPY: 160.82,
  NZDUSD: 0.6123,
};

export function generateQuotes(): LiveQuote[] {
  return SYMBOLS.map((symbol) => {
    const base = basePrices[symbol] || 100;
    const change = (Math.random() - 0.5) * base * 0.02;
    const bid = base + change;
    const spread = base * (0.0001 + Math.random() * 0.0005);
    return {
      symbol,
      bid: Math.round(bid * (symbol.includes('JPY') ? 100 : 100000)) / (symbol.includes('JPY') ? 100 : 100000),
      ask: Math.round((bid + spread) * (symbol.includes('JPY') ? 100 : 100000)) / (symbol.includes('JPY') ? 100 : 100000),
      spread: Math.round(spread * (symbol.includes('JPY') ? 100 : 100000)),
      change: Math.round(change * (symbol.includes('JPY') ? 100 : 100000)) / (symbol.includes('JPY') ? 100 : 100000),
      changePercent: Math.round((change / base) * 10000) / 100,
      high: Math.round((base + Math.abs(change) + Math.random() * base * 0.005) * (symbol.includes('JPY') ? 100 : 100000)) / (symbol.includes('JPY') ? 100 : 100000),
      low: Math.round((base - Math.abs(change) - Math.random() * base * 0.005) * (symbol.includes('JPY') ? 100 : 100000)) / (symbol.includes('JPY') ? 100 : 100000),
      time: new Date().toISOString(),
    };
  });
}
