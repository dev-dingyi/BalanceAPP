import { useTranslation } from 'react-i18next';
import { Box, Typography, Paper } from '@mui/material';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import type { SpendingTrend as SpendingTrendType } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { format } from 'date-fns';

interface Props {
  data: SpendingTrendType[];
  currency: string;
}

export const SpendingTrend = ({ data, currency }: Props) => {
  const { t } = useTranslation();

  if (data.length === 0) {
    return (
      <Paper sx={{ p: 3, height: 300 }}>
        <Typography variant="h6" gutterBottom>
          {t('dashboard.spending_trend')}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 'calc(100% - 40px)',
          }}
        >
          <Typography color="text.secondary">No data yet</Typography>
        </Box>
      </Paper>
    );
  }

  const chartData = data.map(item => ({
    date: format(new Date(item.date), 'MMM dd'),
    fullDate: item.date,
    amount: item.amount,
  }));

  return (
    <Paper sx={{ p: 3, height: 300 }}>
      <Typography variant="h6" gutterBottom>
        {t('dashboard.spending_trend')}
      </Typography>
      <ResponsiveContainer width="100%" height="calc(100% - 40px)">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1976d2" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#1976d2" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => formatCurrency(value, currency as any, false)}
          />
          <Tooltip
            formatter={(value: number) => formatCurrency(value, currency as any)}
            labelFormatter={(label) => {
              const item = chartData.find(d => d.date === label);
              return item ? format(new Date(item.fullDate), 'MMM dd, yyyy') : label;
            }}
          />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#1976d2"
            fillOpacity={1}
            fill="url(#colorAmount)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Paper>
  );
};
