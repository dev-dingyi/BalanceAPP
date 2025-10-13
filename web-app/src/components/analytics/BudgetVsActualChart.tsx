import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Paper, Typography, Box, Alert } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useBudgets } from '../../hooks/useBudgets';
import { convertCurrency } from '../../utils/currency';
import { formatCurrency } from '../../utils/currency';
import type { Transaction, Currency } from '../../types';

interface Props {
  transactions: Transaction[];
  currency: Currency;
}

export const BudgetVsActualChart = ({ transactions, currency }: Props) => {
  const { t } = useTranslation();
  const { budgets } = useBudgets();

  const budgetData = useMemo(() => {
    if (budgets.length === 0) return [];

    return budgets.map(budget => {
      // Calculate actual spending for this budget's categories
      const relevantTransactions = transactions.filter(t =>
        budget.categories.includes(t.categoryId)
      );

      const actualSpent = relevantTransactions.reduce((sum, t) => {
        const amount = t.currency === currency
          ? t.amount
          : convertCurrency(t.amount, t.currency, currency);
        return sum + amount;
      }, 0);

      // Convert budget amount to preferred currency if needed
      const budgetAmount = budget.currency === currency
        ? budget.amount
        : convertCurrency(budget.amount, budget.currency, currency);

      const percentage = (actualSpent / budgetAmount) * 100;
      const remaining = budgetAmount - actualSpent;

      return {
        name: budget.name,
        budget: budgetAmount,
        actual: actualSpent,
        remaining: Math.max(0, remaining),
        overSpent: Math.max(0, actualSpent - budgetAmount),
        percentage: percentage.toFixed(1),
        isOverBudget: actualSpent > budgetAmount,
      };
    }).sort((a, b) => b.actual - a.actual);
  }, [budgets, transactions, currency]);

  if (budgets.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('analytics.budget_vs_actual') || 'Budget vs Actual Spending'}
        </Typography>
        <Alert severity="info">
          {t('analytics.no_budgets') || 'No budgets set. Create budgets to see analysis.'}
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {t('analytics.budget_vs_actual') || 'Budget vs Actual Spending'}
      </Typography>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={budgetData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis
            tickFormatter={(value) => formatCurrency(value, currency, true)}
          />
          <Tooltip
            formatter={(value: number) => formatCurrency(value, currency)}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <Box sx={{ bgcolor: 'background.paper', p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="body2" fontWeight="bold" gutterBottom>
                      {data.name}
                    </Typography>
                    <Typography variant="body2">
                      {t('analytics.budget') || 'Budget'}: {formatCurrency(data.budget, currency)}
                    </Typography>
                    <Typography variant="body2">
                      {t('analytics.actual') || 'Actual'}: {formatCurrency(data.actual, currency)}
                    </Typography>
                    {data.isOverBudget ? (
                      <Typography variant="body2" color="error.main">
                        {t('analytics.over_budget') || 'Over Budget'}: {formatCurrency(data.overSpent, currency)}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="success.main">
                        {t('analytics.remaining') || 'Remaining'}: {formatCurrency(data.remaining, currency)}
                      </Typography>
                    )}
                    <Typography variant="body2" fontWeight="bold">
                      {data.percentage}% {t('analytics.of_budget') || 'of budget'}
                    </Typography>
                  </Box>
                );
              }
              return null;
            }}
          />
          <Legend />
          <Bar dataKey="budget" fill="#8884d8" name={t('analytics.budget') || 'Budget'} />
          <Bar dataKey="actual" fill="#82ca9d" name={t('analytics.actual') || 'Actual'} />
          <Bar dataKey="overSpent" fill="#ef5350" name={t('analytics.over_spent') || 'Over Spent'} />
        </BarChart>
      </ResponsiveContainer>

      {/* Summary */}
      <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
        <Typography variant="body2" gutterBottom>
          <strong>{t('analytics.summary') || 'Summary'}:</strong>
        </Typography>
        {budgetData.map((data, index) => (
          <Typography
            key={index}
            variant="body2"
            color={data.isOverBudget ? 'error.main' : 'text.secondary'}
          >
            • {data.name}: {data.percentage}% used
            {data.isOverBudget && ` (${t('analytics.over_by') || 'over by'} ${formatCurrency(data.overSpent, currency)})`}
          </Typography>
        ))}
      </Box>
    </Paper>
  );
};
