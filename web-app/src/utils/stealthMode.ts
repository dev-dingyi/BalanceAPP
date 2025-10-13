import type { Transaction } from '../types';

/**
 * Apply scaling to an amount based on stealth mode settings
 */
export const applyScaling = (amount: number, percentage: number): number => {
  return (amount * percentage) / 100;
};

/**
 * Apply stealth mode transformations to a single amount
 */
export const transformAmount = (
  amount: number,
  stealthConfig: {
    enabled: boolean;
    scaling: { enabled: boolean; percentage: number };
  }
): number => {
  // Safety check - if config is malformed, return original amount
  if (!stealthConfig || typeof stealthConfig !== 'object') {
    return amount;
  }

  if (!stealthConfig.enabled) {
    return amount;
  }

  if (stealthConfig.scaling?.enabled && stealthConfig.scaling?.percentage) {
    return applyScaling(amount, stealthConfig.scaling.percentage);
  }

  return amount;
};

/**
 * Check if a transaction should be hidden based on stealth mode settings
 */
export const isTransactionHidden = (
  transaction: Transaction,
  stealthConfig: {
    enabled: boolean;
    hiddenCategories: { enabled: boolean; categoryIds: string[] };
  }
): boolean => {
  // Safety check
  if (!stealthConfig || typeof stealthConfig !== 'object') {
    return false;
  }

  if (!stealthConfig.enabled) {
    return false;
  }

  if (stealthConfig.hiddenCategories?.enabled && Array.isArray(stealthConfig.hiddenCategories?.categoryIds)) {
    return stealthConfig.hiddenCategories.categoryIds.includes(transaction.categoryId);
  }

  return false;
};

/**
 * Filter out hidden transactions
 */
export const filterVisibleTransactions = (
  transactions: Transaction[],
  stealthConfig: {
    enabled: boolean;
    hiddenCategories: { enabled: boolean; categoryIds: string[] };
  }
): Transaction[] => {
  return transactions.filter((t) => !isTransactionHidden(t, stealthConfig));
};

/**
 * Apply stealth mode transformations to transactions
 */
export const transformTransactions = (
  transactions: Transaction[],
  stealthConfig: {
    enabled: boolean;
    scaling: { enabled: boolean; percentage: number };
    hiddenCategories: { enabled: boolean; categoryIds: string[] };
  }
): Transaction[] => {
  // Safety check
  if (!stealthConfig || typeof stealthConfig !== 'object') {
    return transactions;
  }

  // First filter hidden categories
  const visible = filterVisibleTransactions(transactions, stealthConfig);

  // Then apply scaling if enabled
  if (!stealthConfig.enabled || !stealthConfig.scaling?.enabled) {
    return visible;
  }

  return visible.map((t) => ({
    ...t,
    amount: applyScaling(t.amount, stealthConfig.scaling.percentage),
  }));
};

/**
 * Generate a fake transaction for noise injection
 */
export const generateFakeTransaction = (
  userId: string,
  categoryIds: string[],
  amountRange: { min: number; max: number },
  currency: 'USD' | 'CNY'
): Partial<Transaction> => {
  const amount = Math.random() * (amountRange.max - amountRange.min) + amountRange.min;
  const randomCategory = categoryIds[Math.floor(Math.random() * categoryIds.length)];

  const descriptions = [
    'Coffee',
    'Lunch',
    'Groceries',
    'Gas',
    'Shopping',
    'Dinner',
    'Snacks',
    'Transportation',
  ];

  return {
    userId,
    amount: Math.round(amount * 100) / 100,
    currency,
    date: new Date(),
    time: new Date().toLocaleTimeString('en-US', { hour12: false }),
    description: descriptions[Math.floor(Math.random() * descriptions.length)],
    categoryId: randomCategory,
    // Mark as fake (we'll add a flag in the future)
  };
};

/**
 * Calculate how many fake transactions should exist for today
 */
export const calculateRequiredFakeTransactions = (frequency: number): number => {
  // frequency is transactions per day
  return frequency;
};

/**
 * Get stealth mode status for display
 */
export const getStealthModeStatus = (stealthConfig: {
  enabled: boolean;
  scaling: { enabled: boolean; percentage: number };
  hiddenCategories: { enabled: boolean; categoryIds: string[] };
  noiseInjection: { enabled: boolean; frequency: number };
}): {
  active: boolean;
  features: string[];
  description: string;
} => {
  if (!stealthConfig.enabled) {
    return {
      active: false,
      features: [],
      description: 'Stealth mode is off',
    };
  }

  const features: string[] = [];

  if (stealthConfig.scaling.enabled) {
    features.push(`Scaling (${stealthConfig.scaling.percentage}%)`);
  }

  if (stealthConfig.hiddenCategories.enabled && stealthConfig.hiddenCategories.categoryIds.length > 0) {
    features.push(`${stealthConfig.hiddenCategories.categoryIds.length} hidden categories`);
  }

  if (stealthConfig.noiseInjection.enabled) {
    features.push(`Noise injection (${stealthConfig.noiseInjection.frequency}/day)`);
  }

  return {
    active: true,
    features,
    description: features.length > 0 ? features.join(', ') : 'Stealth mode active (no features enabled)',
  };
};
