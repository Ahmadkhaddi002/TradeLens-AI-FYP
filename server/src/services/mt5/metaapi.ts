const PROVISIONING_API = 'https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai';

function clientApiUrl(region: string): string {
  return `https://mt-client-api-v1.${region}.agiliumtrade.agiliumtrade.ai`;
}

async function apiGet(url: string, token: string): Promise<any> {
  const res = await fetch(url, {
    headers: { 'auth-token': token },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`MetaApi request failed (${res.status}): ${text.slice(0, 200)}`);
  }
  return res.json();
}

async function apiPost(url: string, token: string, body: any): Promise<any> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'auth-token': token },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`MetaApi request failed (${res.status}): ${text.slice(0, 200)}`);
  }
  return res.json();
}

async function createAccount(token: string, login: string, password: string, server: string): Promise<string> {
  const account = await apiPost(`${PROVISIONING_API}/users/current/accounts`, token, {
    login,
    password,
    server,
    magic: 0,
    platform: 'mt5',
    type: 'cloud-g2',
    name: `TradeLens - ${login}`,
    manualTrades: true,
    quoteStreamingIntervalInSeconds: 2.5,
    reliability: 'high',
  });
  return account._id;
}

async function deployAccount(token: string, accountId: string): Promise<void> {
  await apiPost(`${PROVISIONING_API}/users/current/accounts/${accountId}/deploy`, token, {});
}

async function waitForDeployed(token: string, accountId: string, timeoutMs = 90000): Promise<string> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const account = await apiGet(`${PROVISIONING_API}/users/current/accounts/${accountId}`, token);
    if (account.state === 'DEPLOYED') return account.region;
    if (account.state === 'FAILED') throw new Error(`Account deployment failed: ${JSON.stringify(account)}`);
    await new Promise(r => setTimeout(r, 3000));
  }
  throw new Error('Account deployment timed out');
}

async function findAccountByLogin(token: string, login: string, server: string): Promise<{ id: string; region: string } | null> {
  const accounts = await apiGet(`${PROVISIONING_API}/users/current/accounts`, token);
  for (const a of accounts || []) {
    if (String(a.login) === String(login) && a.server.toLowerCase() === server.toLowerCase()) {
      if (a.state === 'DEPLOYED') return { id: a._id, region: a.region };
      if (a.state === 'UNDEPLOYED' || a.state === 'DEPLOYING') {
        if (a.state === 'UNDEPLOYED') await deployAccount(token, a._id);
        const region = await waitForDeployed(token, a._id);
        return { id: a._id, region };
      }
    }
  }
  return null;
}

export async function connectWithMT5Credentials(mgmtToken: string, restToken: string, loginId: string, password: string, server: string) {
  let accountRef = await findAccountByLogin(mgmtToken, loginId, server);
  if (!accountRef) {
    const newId = await createAccount(mgmtToken, loginId, password, server);
    console.log('[MetaApi] Account created:', newId);
    await deployAccount(mgmtToken, newId);
    console.log('[MetaApi] Deploy requested');
    const region = await waitForDeployed(mgmtToken, newId);
    console.log('[MetaApi] Deployed, region:', region);
    await new Promise(r => setTimeout(r, 2000));
    accountRef = { id: newId, region };
  }
  console.log('[MetaApi] Fetching data for account:', accountRef.id);
  return getFullDataViaMetaApi(restToken, accountRef.id, accountRef.region);
}

function formatDate(d: Date): string {
  return d.toISOString().replace('T', ' ').replace('Z', '');
}

export async function getFullDataViaMetaApi(token: string, accountId: string, region: string) {
  const [accountInfo, positions, deals] = await Promise.all([
    apiGet(`${clientApiUrl(region)}/users/current/accounts/${accountId}/account-information`, token),
    apiGet(`${clientApiUrl(region)}/users/current/accounts/${accountId}/positions`, token),
    apiGet(`${clientApiUrl(region)}/users/current/accounts/${accountId}/history-deals/time/${encodeURIComponent(formatDate(new Date(Date.now() - 86400000 * 365)))}/${encodeURIComponent(formatDate(new Date()))}`, token),
  ]);

  const mappedPositions = (positions || []).map((p: any) => ({
    id: p.id,
    symbol: p.symbol,
    type: p.type === 'POSITION_TYPE_BUY' ? 'buy' as const : 'sell' as const,
    volume: p.volume,
    openPrice: p.openPrice,
    currentPrice: p.currentPrice,
    profit: p.profit,
    swap: p.swap || 0,
    openTime: p.time,
  }));

  const byPosition: Record<string, any[]> = {};
  for (const d of deals || []) {
    if (!byPosition[d.positionId]) byPosition[d.positionId] = [];
    byPosition[d.positionId].push(d);
  }

  const trades: any[] = [];
  for (const posDeals of Object.values(byPosition)) {
    const entryDeal = posDeals.find((d: any) => d.entryType === 'DEAL_ENTRY_IN' || d.entryType === 'DEAL_ENTRY_INOUT');
    const exitDeal = posDeals.find((d: any) => d.entryType === 'DEAL_ENTRY_OUT' || d.entryType === 'DEAL_ENTRY_OUT_BY');
    if (!entryDeal) continue;
    const totalProfit = posDeals.reduce((sum: number, d: any) => sum + (d.profit || 0), 0);
    trades.push({
      id: entryDeal.positionId,
      symbol: entryDeal.symbol,
      type: entryDeal.type === 'DEAL_TYPE_BUY' ? 'buy' as const : 'sell' as const,
      volume: entryDeal.volume,
      openPrice: entryDeal.price,
      closePrice: exitDeal ? exitDeal.price : entryDeal.price,
      profit: totalProfit,
      swap: posDeals.reduce((s: number, d: any) => s + (d.swap || 0), 0),
      commission: posDeals.reduce((s: number, d: any) => s + (d.commission || 0), 0),
      openTime: entryDeal.time,
      closeTime: exitDeal ? exitDeal.time : entryDeal.time,
    });
  }

  trades.sort((a: any, b: any) => new Date(b.closeTime).getTime() - new Date(a.closeTime).getTime());

  return {
    account: {
      login: String(accountInfo.login || ''),
      name: accountInfo.name || accountInfo.broker || '',
      server: accountInfo.server || '',
      broker: accountInfo.broker || '',
      balance: accountInfo.balance || 0,
      equity: accountInfo.equity || 0,
      margin: accountInfo.margin || 0,
      marginFree: accountInfo.freeMargin || 0,
      marginLevel: accountInfo.marginLevel || 0,
      currency: accountInfo.currency || 'USD',
      leverage: accountInfo.leverage || 0,
      isLive: !String(accountInfo.type || '').includes('DEMO'),
      connected: true,
    },
    positions: mappedPositions,
    trades,
  };
}
