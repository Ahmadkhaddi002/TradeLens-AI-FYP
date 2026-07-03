import { Router, Request, Response } from 'express';
import { connectToMT5, getFullData, validateServer, getKnownBrokers, getServerList, isDemoServer, connectWithMT5Credentials, connectViaBridge, getFullDataViaBridge } from '../services/mt5/index.js';
import { METAPI_REST_TOKEN, METAPI_MGMT_TOKEN } from '../config.js';

const router = Router();

async function tryBridgeConnect(loginId: string, password: string, server: string) {
  return connectViaBridge(loginId, password, server);
}

async function tryBridgeFullData(loginId: string, password: string, server: string) {
  return getFullDataViaBridge(loginId, password, server);
}

async function tryMetaApiConnect(loginId: string, password: string, server: string) {
  if (!METAPI_MGMT_TOKEN || !METAPI_REST_TOKEN) throw new Error('MetaApi tokens not configured');
  return connectWithMT5Credentials(METAPI_MGMT_TOKEN, METAPI_REST_TOKEN, loginId, password, server);
}

async function tryMetaApiFullData(loginId: string, password: string, server: string) {
  if (!METAPI_MGMT_TOKEN || !METAPI_REST_TOKEN) throw new Error('MetaApi tokens not configured');
  const data = await connectWithMT5Credentials(METAPI_MGMT_TOKEN, METAPI_REST_TOKEN, loginId, password, server);
  return { account: data.account, positions: data.positions, trades: data.trades };
}

router.post('/connect', async (req: Request, res: Response) => {
  try {
    const { loginId, password, server } = req.body;
    if (!loginId || !password || !server) {
      res.status(400).json({ success: false, error: 'Login ID, password, and server are required' });
      return;
    }
    await new Promise(r => setTimeout(r, 3000 + Math.floor(Math.random() * 3000)));

    // 1. Try Python bridge (local MT5 terminal)
    try {
      const bridgeData = await tryBridgeConnect(loginId, password, server);
      res.json({ success: true, account: bridgeData.account });
      return;
    } catch (bridgeErr) {
      console.warn('[Bridge] Python bridge not available:', (bridgeErr as Error).message);
    }

    // 2. Try MetaApi cloud
    try {
      const metaApiData = await tryMetaApiConnect(loginId, password, server);
      res.json({ success: true, account: metaApiData.account });
      return;
    } catch (metaErr) {
      console.warn('[MetaApi] Connection failed:', (metaErr as Error).message);
    }

    // 3. Fall back to demo data
    if (!isDemoServer(server)) {
      res.status(502).json({ success: false, error: 'Could not connect to live server. Please check your credentials or try a demo account.' });
      return;
    }
    const result = await connectToMT5({ loginId, password, server });
    if (result.success && result.accountInfo) {
      res.json({ success: true, demoMode: true, account: result.accountInfo });
    } else {
      res.status(401).json({ success: false, error: result.error || 'Connection failed', serverValid: result.serverValid });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

router.post('/validate-server', async (req: Request, res: Response) => {
  try {
    const { server } = req.body;
    if (!server) {
      res.status(400).json({ valid: false, error: 'Server name is required' });
      return;
    }
    const result = await validateServer(server);
    res.json(result);
  } catch (err) {
    res.status(500).json({ valid: false, error: (err as Error).message });
  }
});

router.get('/brokers', (_req: Request, res: Response) => {
  res.json(getKnownBrokers());
});

router.get('/servers', (_req: Request, res: Response) => {
  res.json(getServerList());
});

router.post('/full-data', async (req: Request, res: Response) => {
  try {
    const { loginId, password, server } = req.body;
    if (!loginId || !password || !server) {
      res.status(400).json({ success: false, error: 'Missing credentials' });
      return;
    }
    await new Promise(r => setTimeout(r, 2000 + Math.floor(Math.random() * 2000)));

    // 1. Try Python bridge
    try {
      const bridgeData = await tryBridgeFullData(loginId, password, server);
      res.json({ success: true, ...bridgeData });
      return;
    } catch (bridgeErr) {
      console.warn('[Bridge] Python bridge not available:', (bridgeErr as Error).message);
    }

    // 2. Try MetaApi
    try {
      const metaApiData = await tryMetaApiFullData(loginId, password, server);
      res.json({ success: true, ...metaApiData });
      return;
    } catch (metaErr) {
      console.warn('[MetaApi] Full data failed:', (metaErr as Error).message);
    }

    // 3. Fall back to demo
    if (!isDemoServer(server)) {
      res.status(502).json({ success: false, error: 'Could not fetch live data. Please check your credentials or use a demo account.' });
      return;
    }
    const data = await getFullData({ loginId, password, server });
    res.json({ success: true, demoMode: true, ...data });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { loginId, password, server } = req.body;
    if (!loginId || !password || !server) {
      res.status(400).json({ success: false, error: 'Missing credentials' });
      return;
    }
    await new Promise(r => setTimeout(r, 2000 + Math.floor(Math.random() * 2000)));

    let data: any;
    let isDemo = false;

    // 1. Try Python bridge
    try {
      data = await tryBridgeFullData(loginId, password, server);
    } catch (bridgeErr) {
      console.warn('[Bridge] Python bridge not available:', (bridgeErr as Error).message);
      // 2. Try MetaApi
      try {
        data = await tryMetaApiFullData(loginId, password, server);
      } catch (metaErr) {
        console.warn('[MetaApi] Analyze failed:', (metaErr as Error).message);
        // 3. Fall back to demo
        if (!isDemoServer(server)) {
          res.status(502).json({ success: false, error: 'Could not analyze live data. Please check your credentials or use a demo account.' });
          return;
        }
        data = await getFullData({ loginId, password, server });
        isDemo = true;
      }
    }
    const { analyzeTrading } = await import('../services/mt5/analyzer.js');
    const analysis = analyzeTrading(data.trades, data.positions, data.account);
    const resp: any = { success: true, analysis };
    if (isDemo) resp.demoMode = true;
    res.json(resp);
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

export default router;
