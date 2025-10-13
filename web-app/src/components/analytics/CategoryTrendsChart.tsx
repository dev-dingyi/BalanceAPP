import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Paper, Typography, Box, Chip, Stack } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '../../utils/currency';
import { convertCurrency } from '../../utils/currency';
import type { Transaction, Category, Currency } from '../../types';

interface Props {
  transactions: Transaction[];
  categories: Category[];
  currency: Currency;
  dateRange: { start: Date; end: Date };
  detailed?: boolean;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#a78bfa', '#fb923c', '#22d3ee'];

export const CategoryTrendsChart = ({ transactions, categories, currency, dateRange, detailed }: Props) => {
  const { t } = useTranslation();

  // Group transactions by month and category
  const trendData = useMemo(() => {
    const monthCategoryMap = new Map<string, Map<string, number>>();

    // Get all months in range
    const months: string[] = [];
    const current = new Date(dateRange.start);
    const end = new Date(dateRange.end);

    while (current <= end) {
      const monthKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
      months.push(monthKey);
      monthCategoryMap.set(monthKey, new Map());
      current.setMonth(current.getMonth() + 1);
    }

    // Fill in transaction data
    transactions.forEach(t => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthCategoryMap.has(monthKey)) return;

      const amount = t.currency === currency
        ? t.amount
        : convertCurrency(t.amount, t.currency, currency);

      const monthData = monthCategoryMap.get(monthKey)!;
      const current = monthData.get(t.categoryId) || 0;
      monthData.set(t.categoryId, current + amount);
    });

    // Convert to chart data
    const chartData = months.map(month => {
      const [year, monthNum] = month.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthLabel = `${monthNames[parseInt(monthNum) - 1]} ${year}`;

      const dataPoint: any = { month: monthLabel };
      const monthData = monthCategoryMap.get(month)!;

      categories.forEach(category => {
        dataPoint[category.name] = monthData.get(category.id) || 0;
      });

      return dataPoint;
    });

    return chartData;
  }, [transactions, categories, dateRange, currency]);

  // Calculate top categories
  const topCategories = useMemo(() => {
    const categoryTotals = new Map<string, number>();

    transactions.forEach(t => {
      const amount = t.currency === currency
        ? t.amount
        : convertCurrency(t.amount, t.currency, currency);

      const current = categoryTotals.get(t.categoryId) || 0;
      categoryTotals.set(t.categoryId, current + amount);
    });

    return Array.from(categoryTotals.entries())
      .map(([categoryId, total]) => {
        const category = categories.find(c => c.id === categoryId);
        return { categoryId, name: category?.name || 'Unknown', total };
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, detailed ? 10 : 5);
  }, [transactions, categories, currency, detailed]);

  if (trendData.length === 0 || topCategories.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('analytics.category_trends') || 'Category Trends'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('analytics.no_data') || 'No data available'}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('analytics.category_trends') || 'Category Trends Over Time'}
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
          {topCategories.map((cat, index) => (
            <Chip
              key={cat.categoryId}
              label={`${cat.name}: ${formatCurrency(cat.total, currency)}`}
              size="small"
              sx={{
                bgcolor: COLORS[index % COLORS.length] + '20',
                borderLeft: `3px solid ${COLORS[index % COLORS.length]}`,
              }}
            />
          ))}
        </Stack>
      </Box>

      <ResponsiveContainer width="100%" height={detailed ? 500 : 350}>
        <LineChart data={trendData}>
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
          {topCategories.map((cat, index) => (
            <Line
              key={cat.categoryId}
              type="monotone"
              dataKey={cat.name}
              stroke={COLORS[index % COLORS.length]}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
        {t('analytics.top_categories_shown') || `Showing top ${topCategories.length} categories by total spending`}
      </Typography>
    </Paper>
  );
};
