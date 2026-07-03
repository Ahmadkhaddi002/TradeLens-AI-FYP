import dns from 'dns/promises';
import { BrokerInfo } from '../../types/index.js';

const KNOWN_BROKERS: Record<string, BrokerInfo> = {
  'ICMarkets-Live': {
    name: 'IC Markets',
    server: 'ICMarkets-Live',
    domain: 'icmarkets.com',
    apiUrl: 'https://api.icmarkets.com',
    mt5ApiUrl: 'https://mt5api.icmarkets.com',
  },
  'ICMarkets-Demo': {
    name: 'IC Markets',
    server: 'ICMarkets-Demo',
    domain: 'icmarkets.com',
    apiUrl: 'https://api.icmarkets.com',
    mt5ApiUrl: 'https://mt5api.icmarkets.com',
  },
  'XMGlobal-Real': {
    name: 'XM',
    server: 'XMGlobal-Real',
    domain: 'xm.com',
    apiUrl: 'https://api.xm.com',
    mt5ApiUrl: 'https://mt5api.xm.com',
  },
  'XMGlobal-Demo': {
    name: 'XM',
    server: 'XMGlobal-Demo',
    domain: 'xm.com',
    apiUrl: 'https://api.xm.com',
    mt5ApiUrl: 'https://mt5api.xm.com',
  },
  'Pepperstone-Live': {
    name: 'Pepperstone',
    server: 'Pepperstone-Live',
    domain: 'pepperstone.com',
    apiUrl: 'https://api.pepperstone.com',
    mt5ApiUrl: 'https://mt5api.pepperstone.com',
  },
  'Pepperstone-Demo': {
    name: 'Pepperstone',
    server: 'Pepperstone-Demo',
    domain: 'pepperstone.com',
    apiUrl: 'https://api.pepperstone.com',
    mt5ApiUrl: 'https://mt5api.pepperstone.com',
  },
  'FPMarkets-Live': {
    name: 'FP Markets',
    server: 'FPMarkets-Live',
    domain: 'fpmarkets.com',
    apiUrl: 'https://api.fpmarkets.com',
    mt5ApiUrl: 'https://mt5api.fpmarkets.com',
  },
  'FPMarkets-Demo': {
    name: 'FP Markets',
    server: 'FPMarkets-Demo',
    domain: 'fpmarkets.com',
    apiUrl: 'https://api.fpmarkets.com',
    mt5ApiUrl: 'https://mt5api.fpmarkets.com',
  },
  'Oanda-Live': {
    name: 'Oanda',
    server: 'Oanda-Live',
    domain: 'oanda.com',
    apiUrl: 'https://api.oanda.com',
    mt5ApiUrl: 'https://mt5api.oanda.com',
  },
  'Forex.com-Live': {
    name: 'Forex.com',
    server: 'Forex.com-Live',
    domain: 'forex.com',
    apiUrl: 'https://api.forex.com',
    mt5ApiUrl: 'https://mt5api.forex.com',
  },
  'Exness-Real': {
    name: 'Exness',
    server: 'Exness-Real',
    domain: 'exness.com',
    apiUrl: 'https://api.exness.com',
    mt5ApiUrl: 'https://mt5api.exness.com',
  },
  'Exness-MT5Trial15': { name: 'Exness', server: 'Exness-MT5Trial15', domain: 'exness.com', apiUrl: 'https://api.exness.com', mt5ApiUrl: 'https://mt5api.exness.com' },
  'Exness-MT5Trial16': { name: 'Exness', server: 'Exness-MT5Trial16', domain: 'exness.com', apiUrl: 'https://api.exness.com', mt5ApiUrl: 'https://mt5api.exness.com' },
  'FTMO-Real': {
    name: 'FTMO',
    server: 'FTMO-Real',
    domain: 'ftmo.com',
    apiUrl: 'https://api.ftmo.com',
    mt5ApiUrl: 'https://mt5api.ftmo.com',
  },
  'JustMarkets-Live': {
    name: 'JustMarkets',
    server: 'JustMarkets-Live',
    domain: 'justmarkets.com',
    apiUrl: 'https://api.justmarkets.com',
    mt5ApiUrl: 'https://mt5api.justmarkets.com',
  },
};

export function getKnownBroker(server: string): BrokerInfo | undefined {
  return KNOWN_BROKERS[server];
}

export function getKnownBrokers(): BrokerInfo[] {
  return Object.values(KNOWN_BROKERS).filter(
    (b, i, arr) => arr.findIndex((x) => x.name === b.name) === i
  );
}

export function getServerList(): string[] {
  return Object.keys(KNOWN_BROKERS);
}

export function isDemoServer(server: string): boolean {
  return /demo|trial/i.test(server);
}

export async function resolveServerHost(server: string): Promise<{ valid: boolean; ips?: string[]; error?: string }> {
  try {
    const hostname = `${server.toLowerCase()}.mt5api`;
    const ips = await dns.resolve4(hostname).catch(() => []);
    if (ips.length > 0) {
      return { valid: true, ips };
    }
    const domainIps = await dns.resolve4(`${server.toLowerCase().replace(/\s+/g, '')}.com`).catch(() => []);
    if (domainIps.length > 0) {
      return { valid: true, ips: domainIps };
    }
    return { valid: false, error: `Could not resolve server: ${server}` };
  } catch (err) {
    return { valid: false, error: `DNS resolution failed for ${server}` };
  }
}

export async function testBrokerApiConnection(server: string): Promise<{ reachable: boolean; latencyMs?: number; error?: string }> {
  const broker = KNOWN_BROKERS[server];
  if (!broker) {
    return { reachable: false, error: `Unknown broker server: ${server}` };
  }
  try {
    const start = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(`${broker.mt5ApiUrl}/api/ping`, {
      signal: controller.signal,
    }).catch(() => null);
    clearTimeout(timeout);
    if (response && response.ok) {
      return { reachable: true, latencyMs: Date.now() - start };
    }
    return { reachable: false, error: `Broker API not reachable at ${broker.mt5ApiUrl}` };
  } catch (err) {
    return { reachable: false, error: `Connection test failed: ${(err as Error).message}` };
  }
}

export async function validateServer(server: string): Promise<{ valid: boolean; brokerInfo?: BrokerInfo; error?: string }> {
  const broker = KNOWN_BROKERS[server];
  if (!broker) {
    const dnsResult = await resolveServerHost(server);
    if (!dnsResult.valid) {
      return { valid: false, error: `Unknown broker server "${server}" and DNS resolution failed. Please check your server name.` };
    }
    return {
      valid: true,
      brokerInfo: {
        name: server,
        server,
        domain: `${server.toLowerCase()}.com`,
        apiUrl: `https://api.${server.toLowerCase()}.com`,
        mt5ApiUrl: `https://mt5api.${server.toLowerCase()}.com`,
      },
    };
  }
  return { valid: true, brokerInfo: broker };
}
