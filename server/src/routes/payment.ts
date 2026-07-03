import { Router, Request, Response } from 'express';
import {
  getPaymentMethods,
  processDeposit,
  processWithdrawal,
  getTransactionHistory,
  confirmTransaction,
  getSubscription,
  subscribe,
  cancelSubscription,
} from '../services/payment/provider.js';

const router = Router();

router.get('/methods', (_req: Request, res: Response) => {
  res.json(getPaymentMethods());
});

router.post('/deposit', (req: Request, res: Response) => {
  try {
    const { methodId, amount, currency } = req.body;
    if (!methodId || !amount) {
      res.status(400).json({ success: false, error: 'Method ID and amount are required' });
      return;
    }
    const tx = processDeposit({ methodId, amount, currency: currency || 'USD' });
    res.json({ success: true, transaction: tx });
  } catch (err) {
    res.status(400).json({ success: false, error: (err as Error).message });
  }
});

router.post('/withdraw', (req: Request, res: Response) => {
  try {
    const { methodId, amount, currency, address } = req.body;
    if (!methodId || !amount) {
      res.status(400).json({ success: false, error: 'Method ID and amount are required' });
      return;
    }
    const tx = processWithdrawal({ methodId, amount, currency: currency || 'USD', address });
    res.json({ success: true, transaction: tx });
  } catch (err) {
    res.status(400).json({ success: false, error: (err as Error).message });
  }
});

router.get('/transactions', (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 50;
  res.json(getTransactionHistory(limit));
});

router.post('/confirm/:txId', (req: Request, res: Response) => {
  const tx = confirmTransaction(req.params.txId);
  if (tx) {
    res.json({ success: true, transaction: tx });
  } else {
    res.status(404).json({ success: false, error: 'Transaction not found' });
  }
});

router.get('/subscription', (_req: Request, res: Response) => {
  const sub = getSubscription();
  res.json(sub || { status: 'none' });
});

router.post('/subscribe', (req: Request, res: Response) => {
  try {
    const { plan, paymentMethodId, amount } = req.body;
    if (!plan || !paymentMethodId || !amount) {
      res.status(400).json({ success: false, error: 'Plan, payment method, and amount are required' });
      return;
    }
    const result = subscribe(plan, paymentMethodId, amount);
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, error: (err as Error).message });
  }
});

router.post('/cancel-subscription', (_req: Request, res: Response) => {
  try {
    const result = cancelSubscription();
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, error: (err as Error).message });
  }
});

export default router;
