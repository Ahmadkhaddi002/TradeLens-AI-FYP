import { PaymentMethod, Transaction, DepositRequest, WithdrawRequest } from '../../types/index.js';
import { v4 as uuidv4 } from 'uuid';

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'visa-mc',
    type: 'card',
    label: 'Visa / Mastercard',
    icon: 'credit-card',
    enabled: true,
    minDeposit: 50,
    maxDeposit: 25000,
    processingTime: 'Instant',
    fee: 0,
  },
  {
    id: 'bank-transfer',
    type: 'bank',
    label: 'Bank Transfer',
    icon: 'bank',
    enabled: true,
    minDeposit: 500,
    maxDeposit: 100000,
    processingTime: '1-3 business days',
    fee: 0,
  },
  {
    id: 'skrill',
    type: 'ewallet',
    label: 'Skrill',
    icon: 'skrill',
    enabled: true,
    minDeposit: 20,
    maxDeposit: 50000,
    processingTime: 'Instant',
    fee: 1,
  },
  {
    id: 'neteller',
    type: 'ewallet',
    label: 'Neteller',
    icon: 'neteller',
    enabled: true,
    minDeposit: 20,
    maxDeposit: 50000,
    processingTime: 'Instant',
    fee: 1.5,
  },
  {
    id: 'paypal',
    type: 'ewallet',
    label: 'PayPal',
    icon: 'paypal',
    enabled: true,
    minDeposit: 20,
    maxDeposit: 20000,
    processingTime: 'Instant',
    fee: 2.5,
  },
  {
    id: 'bitcoin',
    type: 'crypto',
    label: 'Bitcoin',
    icon: 'bitcoin',
    enabled: true,
    minDeposit: 100,
    maxDeposit: 100000,
    processingTime: '10-30 minutes',
    fee: 0,
  },
  {
    id: 'ethereum',
    type: 'crypto',
    label: 'Ethereum',
    icon: 'ethereum',
    enabled: true,
    minDeposit: 100,
    maxDeposit: 100000,
    processingTime: '2-5 minutes',
    fee: 0,
  },
  {
    id: 'usdt-trc20',
    type: 'crypto',
    label: 'USDT (TRC-20)',
    icon: 'usdt',
    enabled: true,
    minDeposit: 50,
    maxDeposit: 100000,
    processingTime: 'Instant',
    fee: 0,
  },
];

const transactions: Transaction[] = [];

export function getPaymentMethods(): PaymentMethod[] {
  return PAYMENT_METHODS;
}

export function processDeposit(request: DepositRequest): Transaction {
  const method = PAYMENT_METHODS.find((m) => m.id === request.methodId);
  if (!method) {
    throw new Error(`Payment method ${request.methodId} not found`);
  }
  if (request.amount < method.minDeposit) {
    throw new Error(`Minimum deposit for ${method.label} is $${method.minDeposit}`);
  }
  if (request.amount > method.maxDeposit) {
    throw new Error(`Maximum deposit for ${method.label} is $${method.maxDeposit}`);
  }

  const fee = request.amount * (method.fee / 100);
  const tx: Transaction = {
    id: uuidv4().slice(0, 8).toUpperCase(),
    type: 'deposit',
    amount: request.amount,
    currency: request.currency || 'USD',
    status: method.type === 'crypto' ? 'pending' : 'completed',
    method: request.methodId,
    methodLabel: method.label,
    createdAt: new Date().toISOString(),
    completedAt: method.type === 'crypto' ? undefined : new Date().toISOString(),
    txHash: method.type === 'crypto' ? `0x${uuidv4().replace(/-/g, '').slice(0, 64)}` : undefined,
  };

  transactions.unshift(tx);
  return tx;
}

export function processWithdrawal(request: WithdrawRequest): Transaction {
  const method = PAYMENT_METHODS.find((m) => m.id === request.methodId);
  if (!method) {
    throw new Error(`Payment method ${request.methodId} not found`);
  }

  const fee = request.amount * (method.fee / 100);
  const tx: Transaction = {
    id: uuidv4().slice(0, 8).toUpperCase(),
    type: 'withdrawal',
    amount: request.amount,
    currency: request.currency || 'USD',
    status: 'pending',
    method: request.methodId,
    methodLabel: method.label,
    createdAt: new Date().toISOString(),
    txHash: method.type === 'crypto' ? `0x${uuidv4().replace(/-/g, '').slice(0, 64)}` : undefined,
  };

  transactions.unshift(tx);
  return tx;
}

export function getTransactionHistory(limit = 50): Transaction[] {
  return transactions.slice(0, limit);
}

export function confirmTransaction(txId: string): Transaction | null {
  const tx = transactions.find((t) => t.id === txId);
  if (tx && tx.status === 'pending') {
    tx.status = 'completed';
    tx.completedAt = new Date().toISOString();
  }
  return tx || null;
}

// --- Subscription ---
interface Subscription {
  plan: string;
  status: 'active' | 'canceled' | 'expired';
  startedAt: string;
  nextBillingAt: string;
  canceledAt?: string;
  paymentMethodId: string;
  amount: number;
  currency: string;
}

let currentSubscription: Subscription | null = null;

export function getSubscription(): Subscription | null {
  return currentSubscription;
}

export function subscribe(plan: string, paymentMethodId: string, amount: number): { success: boolean; subscription: Subscription; transaction: Transaction } {
  if (currentSubscription?.status === 'active') {
    throw new Error('You already have an active subscription');
  }
  const method = PAYMENT_METHODS.find((m) => m.id === paymentMethodId);
  if (!method) throw new Error(`Payment method ${paymentMethodId} not found`);

  const now = new Date();
  const nextBilling = new Date(now);
  nextBilling.setMonth(nextBilling.getMonth() + 1);

  currentSubscription = {
    plan,
    status: 'active',
    startedAt: now.toISOString(),
    nextBillingAt: nextBilling.toISOString(),
    paymentMethodId,
    amount,
    currency: 'USD',
  };

  const tx: Transaction = {
    id: uuidv4().slice(0, 8).toUpperCase(),
    type: 'deposit',
    amount: -amount,
    currency: 'USD',
    status: 'completed',
    method: paymentMethodId,
    methodLabel: `${method.label} · Subscription`,
    createdAt: now.toISOString(),
    completedAt: now.toISOString(),
  };
  transactions.unshift(tx);

  return { success: true, subscription: currentSubscription, transaction: tx };
}

export function cancelSubscription(): { success: boolean; subscription: Subscription } {
  if (!currentSubscription || currentSubscription.status !== 'active') {
    throw new Error('No active subscription to cancel');
  }
  currentSubscription.status = 'canceled';
  currentSubscription.canceledAt = new Date().toISOString();
  return { success: true, subscription: currentSubscription };
}
