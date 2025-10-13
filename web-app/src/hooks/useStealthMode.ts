import { useMemo } from 'react';
import { useSettingsStore } from '../stores/settingsStore';
import { transformAmount, transformTransactions, getStealthModeStatus } from '../utils/stealthMode';
import type { Transaction } from '../types';

/**
 * Hook to apply stealth mode transformations to data
 */
export const useStealthMode = () => {
  const { stealthMode } = useSettingsStore();

  // Transform a single amount
  const transformSingleAmount = useMemo(
    () => (amount: number) => transformAmount(amount, stealthMode),
    [stealthMode]
  );

  // Transform transactions array
  const applyToTransactions = useMemo(
    () => (transactions: Transaction[]) => transformTransactions(transactions, stealthMode),
    [stealthMode]
  );

  // Get current status
  const status = useMemo(() => getStealthModeStatus(stealthMode), [stealthMode]);

  return {
    stealthMode,
    isActive: stealthMode.enabled,
    transformAmount: transformSingleAmount,
    transformTransactions: applyToTransactions,
    status,
  };
};
