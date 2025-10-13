import { useState, useEffect } from 'react';
import { useTransactions } from './useTransactions';
import { useCategories } from './useCategories';
import { useSettingsStore } from '../stores/settingsStore';
import { useStealthMode } from './useStealthMode';
import { getCurrentMonthRange } from '../utils/date';
import { convertCurrency } from '../utils/currency';
import type { SpendingByCategory, SpendingTrend, Transaction } from '../types';

interface DashboardData {
  totalSpent: number;
  categorySpending: SpendingByCategory[];
  spendingTrend: SpendingTrend[];
  recentTransactions: Transaction[];
  loading: boolean;
  error: string | null;
}

export const useDashboardData = (dateRange?: { start: Date; end: Date }) => {
  const { transactions, loading: transactionsLoading, error: transactionsError } = useTransactions();
  const { categories, loading: categoriesLoading } = useCategories();
  const { preferredCurrency } = useSettingsStore();
  const { transformTransactions } = useStealthMode();

  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalSpent: 0,
    categorySpending: [],
    spendingTrend: [],
    recentTransactions: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (transactionsLoading || categoriesLoading) {
      setDashboardData(prev => ({ ...prev, loading: true }));
      return;
    }

    if (transactionsError) {
      setDashboardData(prev => ({ ...prev, loading: false, error: transactionsError }));
      return;
    }

    try {
      // Use provided date range or default to current month
      const range = dateRange || getCurrentMonthRange();

      // Apply stealth mode transformations FIRST
      const transformedTransactions = transformTransactions(transactions);

      // Filter transactions by date range
      const filteredTransactions = transformedTransactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= range.start && transactionDate <= range.end;
      });

      // Calculate total spent (convert to preferred currency)
      // Note: Amounts are already transformed by stealth mode
      let totalSpent = 0;
      filteredTransactions.forEach(t => {
        const amount = t.currency === preferredCurrency
          ? t.amount
          : convertCurrency(t.amount, t.currency, preferredCurrency);
        totalSpent += amount;
      });

      // Calculate spending by category
      const categoryMap = new Map<string, number>();
      filteredTransactions.forEach(t => {
        const amount = t.currency === preferredCurrency
          ? t.amount
          : convertCurrency(t.amount, t.currency, preferredCurrency);

        const current = categoryMap.get(t.categoryId) || 0;
        categoryMap.set(t.categoryId, current + amount);
      });

      const categorySpending: SpendingByCategory[] = Array.from(categoryMap.entries())
        .map(([categoryId, amount]) => {
          const category = categories.find(c => c.id === categoryId);
          return {
            categoryId,
            categoryName: category?.name || 'Unknown',
            amount,
            currency: preferredCurrency,
            percentage: totalSpent > 0 ? (amount / totalSpent) * 100 : 0,
          };
        })
        .sort((a, b) => b.amount - a.amount);

      // Calculate spending trend (by day)
      const trendMap = new Map<string, number>();
      filteredTransactions.forEach(t => {
        const dateStr = new Date(t.date).toISOString().split('T')[0];
        const amount = t.currency === preferredCurrency
          ? t.amount
          : convertCurrency(t.amount, t.currency, preferredCurrency);

        const current = trendMap.get(dateStr) || 0;
        trendMap.set(dateStr, current + amount);
      });

      const spendingTrend: SpendingTrend[] = Array.from(trendMap.entries())
        .map(([date, amount]) => ({
          date,
          amount,
          currency: preferredCurrency,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Get recent transactions (top 10)
      const recentTransactions = [...filteredTransactions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10);

      setDashboardData({
        totalSpent,
        categorySpending,
        spendingTrend,
        recentTransactions,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error calculating dashboard data:', error);
      setDashboardData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to calculate dashboard data',
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions, categories, preferredCurrency, dateRange, transactionsLoading, categoriesLoading, transactionsError]);

  return dashboardData;
};
