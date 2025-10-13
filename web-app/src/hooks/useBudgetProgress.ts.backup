import { useMemo } from 'react';
import { useTransactions } from './useTransactions';
import { useBudgets } from './useBudgets';
import { useSettingsStore } from '../stores/settingsStore';
import { convertCurrency } from '../utils/currency';
import { getDaysRemaining } from '../utils/date';
import type { BudgetProgress } from '../types';

export const useBudgetProgress = () => {
  const { transactions } = useTransactions();
  const { budgets } = useBudgets();
  const { preferredCurrency } = useSettingsStore();

  const budgetProgress = useMemo((): BudgetProgress[] => {
    return budgets.map(budget => {
      // Filter transactions within budget period and matching categories
      const relevantTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        const inDateRange =
          transactionDate >= new Date(budget.startDate) &&
          transactionDate <= new Date(budget.endDate);

        const inCategory = budget.categories.length === 0 ||
          budget.categories.includes(t.categoryId);

        return inDateRange && inCategory;
      });

      // Calculate total spent (convert to budget currency)
      let spent = 0;
      relevantTransactions.forEach(t => {
        const amount = t.currency === budget.currency
          ? t.amount
          : convertCurrency(t.amount, t.currency, budget.currency);
        spent += amount;
      });

      // Calculate percentage
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

      // Calculate days remaining
      const daysRemaining = getDaysRemaining(new Date(budget.endDate));

      return {
        budgetId: budget.id,
        budgetName: budget.name,
        spent,
        total: budget.amount,
        percentage,
        currency: budget.currency,
        daysRemaining,
      };
    });
  }, [budgets, transactions, preferredCurrency]);

  // Calculate overall budget status
  const overallProgress = useMemo(() => {
    if (budgetProgress.length === 0) {
      return { totalBudgeted: 0, totalSpent: 0, percentage: 0, overBudget: 0 };
    }

    // Convert all to preferred currency for overall calculation
    let totalBudgeted = 0;
    let totalSpent = 0;
    let overBudget = 0;

    budgetProgress.forEach(bp => {
      const budgetInPreferred = bp.currency === preferredCurrency
        ? bp.total
        : convertCurrency(bp.total, bp.currency, preferredCurrency);

      const spentInPreferred = bp.currency === preferredCurrency
        ? bp.spent
        : convertCurrency(bp.spent, bp.currency, preferredCurrency);

      totalBudgeted += budgetInPreferred;
      totalSpent += spentInPreferred;

      if (bp.spent > bp.total) {
        const overAmount = bp.currency === preferredCurrency
          ? (bp.spent - bp.total)
          : convertCurrency(bp.spent - bp.total, bp.currency, preferredCurrency);
        overBudget += overAmount;
      }
    });

    const percentage = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

    return {
      totalBudgeted,
      totalSpent,
      percentage,
      overBudget,
    };
  }, [budgetProgress, preferredCurrency]);

  return {
    budgetProgress,
    overallProgress,
  };
};
