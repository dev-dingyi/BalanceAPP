import type { Currency } from '../types';

// Format currency for display
export const formatCurrency = (amount: number, currency: Currency, withSymbol: boolean = true): string => {
  if (!withSymbol) {
    return amount.toFixed(2);
  }

  const formatter = new Intl.NumberFormat(currency === 'CNY' ? 'zh-CN' : 'en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatter.format(amount);
};

// Get currency symbol
export const getCurrencySymbol = (currency: Currency): string => {
  return currency === 'CNY' ? '¥' : '$';
};

// Exchange rate cache (simple in-memory cache)
let exchangeRateCache: { rate: number; lastUpdated: Date } | null = null;

// Fetch exchange rate from API
export const fetchExchangeRate = async (): Promise<number> => {
  // Check cache (valid for 1 hour)
  if (exchangeRateCache) {
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (exchangeRateCache.lastUpdated > hourAgo) {
      return exchangeRateCache.rate;
    }
  }

  try {
    // Using free API - you can replace with your preferred service
    const response = await fetch(
      'https://api.exchangerate-api.com/v4/latest/USD'
    );
    const data = await response.json();
    const rate = data.rates.CNY;

    // Cache the result
    exchangeRateCache = {
      rate,
      lastUpdated: new Date(),
    };

    return rate;
  } catch (error) {
    console.error('Failed to fetch exchange rate:', error);
    // Return a fallback rate (approximate)
    return 7.2;
  }
};

// Convert between currencies (synchronous with fallback rate)
export const convertCurrency = (
  amount: number,
  from: Currency,
  to: Currency,
  rate: number = 7.2
): number => {
  if (from === to) return amount;

  if (from === 'USD' && to === 'CNY') {
    return amount * rate;
  } else if (from === 'CNY' && to === 'USD') {
    return amount / rate;
  }

  return amount;
};

// Convert between currencies (async with fetched rate)
export const convertCurrencyAsync = async (
  amount: number,
  from: Currency,
  to: Currency
): Promise<number> => {
  if (from === to) return amount;

  const rate = await fetchExchangeRate();

  if (from === 'USD' && to === 'CNY') {
    return amount * rate;
  } else if (from === 'CNY' && to === 'USD') {
    return amount / rate;
  }

  return amount;
};

// Normalize amounts to a single currency for calculations
export const normalizeAmount = async (
  amount: number,
  currency: Currency,
  targetCurrency: Currency
): Promise<number> => {
  return await convertCurrencyAsync(amount, currency, targetCurrency);
};
