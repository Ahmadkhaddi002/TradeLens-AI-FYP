const BRIDGE_URL = 'http://localhost:5001';

async function bridgePost(path: string, body?: any): Promise<any> {
  const res = await fetch(`${BRIDGE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Python bridge error (${res.status}): ${text.slice(0, 200)}`);
  }
  return res.json();
}

async function bridgeGet(path: string): Promise<any> {
  const res = await fetch(`${BRIDGE_URL}${path}`);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Python bridge error (${res.status}): ${text.slice(0, 200)}`);
  }
  return res.json();
}

export async function connectViaBridge(loginId: string, password: string, server: string) {
  const health = await bridgeGet('/health');
  if (health.status !== 'ok') {
    throw new Error('Python MT5 bridge is not running');
  }
  const result = await bridgePost('/connect', { loginId, password, server });
  if (!result.success) {
    throw new Error(result.error || 'Python bridge connection failed');
  }
  return { account: result.account };
}

export async function getFullDataViaBridge(loginId: string, password: string, server: string) {
  const result = await bridgePost('/full-data', { loginId, password, server });
  if (!result.success) {
    throw new Error(result.error || 'Python bridge full-data failed');
  }
  return {
    account: result.account,
    positions: result.positions || [],
    trades: result.trades || [],
  };
}
