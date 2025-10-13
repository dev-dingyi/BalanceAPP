import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Paper, Typography, Box } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { formatCurrency } from '../../utils/currency';
import type { Currency } from '../../types';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

interface MonthlyDataPoint {
  month: string;
  total: number;
  transactions: any[];
}

interface Props {
  monthlyData: MonthlyDataPoint[];
  currency: Currency;
}

export const MonthOverMonthComparison = ({ monthlyData, currency }: Props) => {
  const { t } = useTranslation();

  const chartData = useMemo(() => {
    return monthlyData.map((data, index) => {
      const prevData = index > 0 ? monthlyData[index - 1] : null;
      const change = prevData ? ((data.total - prevData.total) / prevData.total) * 100 : 0;

      // Format month label (e.g., "2025-01" -> "Jan 2025")
      const [year, month] = data.month.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthLabel = `${monthNames[parseInt(month) - 1]} ${year}`;

      return {
        month: monthLabel,
        amount: data.total,
        change: change.toFixed(1),
        transactionCount: data.transactions.length,
        isIncrease: change > 0,
        isFirst: index === 0,
      };
    });
  }, [monthlyData]);

  // Calculate overall trend
  const overallTrend = useMemo(() => {
    if (monthlyData.length < 2) return 0;
    const first = monthlyData[0].total;
    const last = monthlyData[monthlyData.length - 1].total;
    return ((last - first) / first) * 100;
  }, [monthlyData]);

  if (monthlyData.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('analytics.month_comparison') || 'Month-over-Month Comparison'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('analytics.no_data') || 'No data available'}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          {t('analytics.month_comparison') || 'Month-over-Month Comparison'}
        </Typography>
        {monthlyData.length >= 2 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {overallTrend > 0 ? (
              <TrendingUpIcon color="error" />
            ) : (
              <TrendingDownIcon color="success" />
            )}
            <Typography
              variant="body2"
              color={overallTrend > 0 ? 'error.main' : 'success.main'}
              fontWeight="bold"
            >
              {overallTrend > 0 ? '+' : ''}{overallTrend.toFixed(1)}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('analytics.overall_trend') || 'overall'}
            </Typography>
          </Box>
        )}
      </Box>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
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
                    <Typography variant="body2" fontWeight="bold">
                      {data.month}
                    </Typography>
                    <Typography variant="body2">
                      {t('analytics.spent') || 'Spent'}: {formatCurrency(data.amount, currency)}
                    </Typography>
                    <Typography variant="body2">
                      {t('analytics.transactions') || 'Transactions'}: {data.transactionCount}
                    </Typography>
                    {!data.isFirst && (
                      <Typography
                        variant="body2"
                        color={data.isIncrease ? 'error.main' : 'success.main'}
                      >
                        {data.isIncrease ? '↑' : '↓'} {Math.abs(parseFloat(data.change))}% {t('analytics.vs_last_month') || 'vs last month'}
                      </Typography>
                    )}
                  </Box>
                );
              }
              return null;
            }}
          />
          <Legend />
          <Bar dataKey="amount" name={t('analytics.spending') || 'Spending'}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.isFirst ? '#8884d8' : entry.isIncrease ? '#ef5350' : '#66bb6a'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
        {t('analytics.comparison_note') || 'Green indicates decreased spending, red indicates increased spending'}
      </Typography>
    </Paper>
  );
};
