import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Paper,
  Stack,
  CircularProgress,
  Alert,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
} from '@mui/material';
import {
  FileDownload as DownloadIcon,
  PictureAsPdf as PdfIcon,
  TrendingUp as TrendIcon,
} from '@mui/icons-material';
import { useTransactions } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';
import { useSettingsStore } from '../stores/settingsStore';
import { useStealthMode } from '../hooks/useStealthMode';
import { formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/date';
import { convertCurrency } from '../utils/currency';
import { MonthOverMonthComparison } from '../components/analytics/MonthOverMonthComparison';
import { CategoryTrendsChart } from '../components/analytics/CategoryTrendsChart';
import { SpendingForecast } from '../components/analytics/SpendingForecast';
import { BudgetVsActualChart } from '../components/analytics/BudgetVsActualChart';
import { exportAnalyticsToPDF } from '../utils/pdfExport';
import { exportAnalyticsToCSV } from '../utils/export';
import type { Transaction } from '../types';

type DateRangePreset = 'thisMonth' | 'lastMonth' | 'last3Months' | 'last6Months' | 'thisYear' | 'custom';
type TabValue = 'overview' | 'trends' | 'forecast' | 'budget';

export const Analytics = () => {
  const { t } = useTranslation();
  const { transactions, loading: transactionsLoading } = useTransactions();
  const { categories } = useCategories();
  const { preferredCurrency } = useSettingsStore();
  const { transformTransactions } = useStealthMode();

  // State
  const [dateRangePreset, setDateRangePreset] = useState<DateRangePreset>('last3Months');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [activeTab, setActiveTab] = useState<TabValue>('overview');

  // Calculate date range based on preset
  const dateRange = useMemo(() => {
    const now = new Date();
    let start: Date;
    let end: Date = now;

    switch (dateRangePreset) {
      case 'thisMonth':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'lastMonth':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'last3Months':
        start = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case 'last6Months':
        start = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        break;
      case 'thisYear':
        start = new Date(now.getFullYear(), 0, 1);
        break;
      case 'custom':
        start = customStartDate ? new Date(customStartDate) : new Date(now.getFullYear(), now.getMonth() - 3, 1);
        end = customEndDate ? new Date(customEndDate) : now;
        break;
      default:
        start = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    }

    return { start, end };
  }, [dateRangePreset, customStartDate, customEndDate]);

  // Filter and transform transactions
  const filteredTransactions = useMemo(() => {
    const transformed = transformTransactions(transactions);
    return transformed.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= dateRange.start && transactionDate <= dateRange.end;
    });
  }, [transactions, dateRange, transformTransactions]);

  // Calculate analytics data
  const analyticsData = useMemo(() => {
    // Group by month
    const monthlyData = new Map<string, { total: number; transactions: Transaction[] }>();

    filteredTransactions.forEach(t => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      const amount = t.currency === preferredCurrency
        ? t.amount
        : convertCurrency(t.amount, t.currency, preferredCurrency);

      const existing = monthlyData.get(monthKey) || { total: 0, transactions: [] };
      monthlyData.set(monthKey, {
        total: existing.total + amount,
        transactions: [...existing.transactions, t],
      });
    });

    // Group by category
    const categoryData = new Map<string, number>();
    filteredTransactions.forEach(t => {
      const amount = t.currency === preferredCurrency
        ? t.amount
        : convertCurrency(t.amount, t.currency, preferredCurrency);

      const current = categoryData.get(t.categoryId) || 0;
      categoryData.set(t.categoryId, current + amount);
    });

    // Calculate totals
    const totalSpent = filteredTransactions.reduce((sum, t) => {
      const amount = t.currency === preferredCurrency
        ? t.amount
        : convertCurrency(t.amount, t.currency, preferredCurrency);
      return sum + amount;
    }, 0);

    const averageTransaction = filteredTransactions.length > 0
      ? totalSpent / filteredTransactions.length
      : 0;

    return {
      monthlyData: Array.from(monthlyData.entries())
        .map(([month, data]) => ({ month, ...data }))
        .sort((a, b) => a.month.localeCompare(b.month)),
      categoryData: Array.from(categoryData.entries())
        .map(([categoryId, amount]) => {
          const category = categories.find(c => c.id === categoryId);
          return {
            categoryId,
            categoryName: category?.name || 'Unknown',
            amount,
            percentage: totalSpent > 0 ? (amount / totalSpent) * 100 : 0,
          };
        })
        .sort((a, b) => b.amount - a.amount),
      totalSpent,
      transactionCount: filteredTransactions.length,
      averageTransaction,
    };
  }, [filteredTransactions, categories, preferredCurrency]);

  const handleExportPDF = () => {
    exportAnalyticsToPDF(analyticsData, dateRange, preferredCurrency, t);
  };

  const handleExportCSV = () => {
    const data = analyticsData.monthlyData.map(m => ({
      month: m.month,
      total: m.total.toFixed(2),
      transactions: m.transactions.length,
      average: (m.total / m.transactions.length).toFixed(2),
    }));
    exportAnalyticsToCSV(data, `analytics_${dateRange.start.toISOString().split('T')[0]}_to_${dateRange.end.toISOString().split('T')[0]}`);
  };

  if (transactionsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', minHeight: 'calc(100vh - 64px)' }}>
      <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {t('analytics.title') || 'Analytics'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatDate(dateRange.start, 'MMM dd, yyyy')} - {formatDate(dateRange.end, 'MMM dd, yyyy')}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportCSV}
              disabled={filteredTransactions.length === 0}
            >
              {t('common.export_csv') || 'CSV'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<PdfIcon />}
              onClick={handleExportPDF}
              disabled={filteredTransactions.length === 0}
            >
              {t('common.export_pdf') || 'PDF'}
            </Button>
          </Stack>
        </Box>

        {/* Date Range Selector */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h6">{t('analytics.date_range') || 'Date Range'}</Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel>{t('analytics.preset') || 'Preset'}</InputLabel>
                <Select
                  value={dateRangePreset}
                  label={t('analytics.preset') || 'Preset'}
                  onChange={(e) => setDateRangePreset(e.target.value as DateRangePreset)}
                >
                  <MenuItem value="thisMonth">{t('analytics.this_month') || 'This Month'}</MenuItem>
                  <MenuItem value="lastMonth">{t('analytics.last_month') || 'Last Month'}</MenuItem>
                  <MenuItem value="last3Months">{t('analytics.last_3_months') || 'Last 3 Months'}</MenuItem>
                  <MenuItem value="last6Months">{t('analytics.last_6_months') || 'Last 6 Months'}</MenuItem>
                  <MenuItem value="thisYear">{t('analytics.this_year') || 'This Year'}</MenuItem>
                  <MenuItem value="custom">{t('analytics.custom') || 'Custom'}</MenuItem>
                </Select>
              </FormControl>

              {dateRangePreset === 'custom' && (
                <>
                  <TextField
                    label={t('analytics.start_date') || 'Start Date'}
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                  <TextField
                    label={t('analytics.end_date') || 'End Date'}
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                </>
              )}
            </Stack>
          </Stack>
        </Paper>

        {filteredTransactions.length === 0 ? (
          <Alert severity="info">
            {t('analytics.no_data') || 'No transactions found for the selected date range'}
          </Alert>
        ) : (
          <>
            {/* Summary Cards */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 3 }}>
              <Box>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {t('analytics.total_spent') || 'Total Spent'}
                  </Typography>
                  <Typography variant="h5">
                    {formatCurrency(analyticsData.totalSpent, preferredCurrency)}
                  </Typography>
                </Paper>
              </Box>
              <Box>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {t('analytics.transactions') || 'Transactions'}
                  </Typography>
                  <Typography variant="h5">
                    {analyticsData.transactionCount}
                  </Typography>
                </Paper>
              </Box>
              <Box>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {t('analytics.average') || 'Average'}
                  </Typography>
                  <Typography variant="h5">
                    {formatCurrency(analyticsData.averageTransaction, preferredCurrency)}
                  </Typography>
                </Paper>
              </Box>
              <Box>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {t('analytics.months') || 'Months'}
                  </Typography>
                  <Typography variant="h5">
                    {analyticsData.monthlyData.length}
                  </Typography>
                </Paper>
              </Box>
            </Box>

            {/* Tabs */}
            <Paper sx={{ mb: 3 }}>
              <Tabs
                value={activeTab}
                onChange={(_, newValue) => setActiveTab(newValue)}
                variant="fullWidth"
              >
                <Tab
                  value="overview"
                  label={t('analytics.overview') || 'Overview'}
                />
                <Tab
                  value="trends"
                  label={t('analytics.trends') || 'Trends'}
                />
                <Tab
                  value="forecast"
                  label={t('analytics.forecast') || 'Forecast'}
                  icon={<TrendIcon />}
                  iconPosition="end"
                />
                <Tab
                  value="budget"
                  label={t('analytics.budget_analysis') || 'Budget Analysis'}
                />
              </Tabs>
            </Paper>

            {/* Tab Panels */}
            {activeTab === 'overview' && (
              <Stack spacing={3}>
                <MonthOverMonthComparison
                  monthlyData={analyticsData.monthlyData}
                  currency={preferredCurrency}
                />
                <CategoryTrendsChart
                  transactions={filteredTransactions}
                  categories={categories}
                  currency={preferredCurrency}
                  dateRange={dateRange}
                />
              </Stack>
            )}

            {activeTab === 'trends' && (
              <CategoryTrendsChart
                transactions={filteredTransactions}
                categories={categories}
                currency={preferredCurrency}
                dateRange={dateRange}
                detailed
              />
            )}

            {activeTab === 'forecast' && (
              <SpendingForecast
                monthlyData={analyticsData.monthlyData}
                currency={preferredCurrency}
              />
            )}

            {activeTab === 'budget' && (
              <BudgetVsActualChart
                transactions={filteredTransactions}
                currency={preferredCurrency}
              />
            )}
          </>
        )}
      </Box>
    </Box>
  );
};
