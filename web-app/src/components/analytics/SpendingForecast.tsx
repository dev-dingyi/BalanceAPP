import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Paper, Typography, Box, Alert } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { formatCurrency } from '../../utils/currency';
import type { Currency } from '../../types';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

interface MonthlyDataPoint {
  month: string;
  total: number;
  transactions: any[];
}

interface Props {
  monthlyData: MonthlyDataPoint[];
  currency: Currency;
}

export const SpendingForecast = ({ monthlyData, currency }: Props) => {
  const { t } = useTranslation();

  const forecastData = useMemo(() => {
    if (monthlyData.length < 2) return null;

    // Simple linear regression for forecasting
    const n = monthlyData.length;
    const amounts = monthlyData.map(d => d.total);

    // Calculate average
    const avgAmount = amounts.reduce((sum, val) => sum + val, 0) / n;

    // Calculate trend (simple linear regression slope)
    let sumXY = 0;
    let sumX = 0;
    let sumX2 = 0;

    amounts.forEach((amount, index) => {
      sumXY += index * amount;
      sumX += index;
      sumX2 += index * index;
    });

    const slope = (n * sumXY - sumX * amounts.reduce((sum, val) => sum + val, 0)) / (n * sumX2 - sumX * sumX);
    const intercept = avgAmount - slope * ((n - 1) / 2);

    // Generate forecast for next 3 months
    const forecastMonths = 3;
    const allData = [];

    // Historical data
    monthlyData.forEach((data) => {
      const [year, month] = data.month.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthLabel = `${monthNames[parseInt(month) - 1]} ${year}`;

      allData.push({
        month: monthLabel,
        actual: data.total,
        forecast: null,
        isHistorical: true,
      });
    });

    // Forecast data
    for (let i = 1; i <= forecastMonths; i++) {
      const forecastValue = intercept + slope * (n + i - 1);
      const lastDate = new Date(monthlyData[n - 1].month);
      lastDate.setMonth(lastDate.getMonth() + i);

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthLabel = `${monthNames[lastDate.getMonth()]} ${lastDate.getFullYear()}`;

      allData.push({
        month: monthLabel,
        actual: null,
        forecast: Math.max(0, forecastValue), // Don't forecast negative
        isHistorical: false,
      });
    }

    return {
      data: allData,
      avgAmount,
      trend: slope > 0 ? 'increasing' : 'decreasing',
      trendPercent: (Math.abs(slope) / avgAmount) * 100,
    };
  }, [monthlyData]);

  if (!forecastData || monthlyData.length < 2) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('analytics.spending_forecast') || 'Spending Forecast'}
        </Typography>
        <Alert severity="info">
          {t('analytics.need_more_data') || 'Need at least 2 months of data to generate forecast'}
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          {t('analytics.spending_forecast') || 'Spending Forecast (Next 3 Months)'}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUpIcon
            color={forecastData.trend === 'increasing' ? 'error' : 'success'}
            sx={{ transform: forecastData.trend === 'increasing' ? 'none' : 'rotate(180deg)' }}
          />
          <Typography
            variant="body2"
            color={forecastData.trend === 'increasing' ? 'error.main' : 'success.main'}
            fontWeight="bold"
          >
            {forecastData.trend === 'increasing' ? '↑' : '↓'} {forecastData.trendPercent.toFixed(1)}%
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('analytics.trend') || 'trend'}
          </Typography>
        </Box>
      </Box>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={forecastData.data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis
            tickFormatter={(value) => formatCurrency(value, currency, true)}
          />
          <Tooltip
            formatter={(value: number) => formatCurrency(value, currency)}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
          <Legend />
          <ReferenceLine
            y={forecastData.avgAmount}
            label={t('analytics.average') || 'Average'}
            stroke="#666"
            strokeDasharray="5 5"
          />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#8884d8"
            strokeWidth={3}
            dot={{ r: 5 }}
            name={t('analytics.actual_spending') || 'Actual Spending'}
          />
          <Line
            type="monotone"
            dataKey="forecast"
            stroke="#82ca9d"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 4 }}
            name={t('analytics.forecast') || 'Forecast'}
          />
        </LineChart>
      </ResponsiveContainer>

      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          {t('analytics.forecast_note') || 'Forecast is based on historical spending patterns using linear regression. Actual spending may vary based on your habits and circumstances.'}
        </Typography>
      </Alert>

      <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
        <Typography variant="body2" gutterBottom>
          <strong>{t('analytics.average_monthly') || 'Average Monthly Spending'}:</strong> {formatCurrency(forecastData.avgAmount, currency)}
        </Typography>
        <Typography variant="body2">
          <strong>{t('analytics.predicted_next_month') || 'Predicted Next Month'}:</strong>{' '}
          {formatCurrency(forecastData.data[forecastData.data.length - 3].forecast || 0, currency)}
        </Typography>
      </Box>
    </Paper>
  );
};
