import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import { useDashboardData } from '../hooks/useDashboardData';
import { useCategories } from '../hooks/useCategories';
import { useBudgetProgress } from '../hooks/useBudgetProgress';
import { useSettingsStore } from '../stores/settingsStore';
import { formatCurrency } from '../utils/currency';
import { SpendingByCategory } from '../components/dashboard/SpendingByCategory';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';
import { SpendingTrend } from '../components/dashboard/SpendingTrend';

export const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { preferredCurrency } = useSettingsStore();
  const { categories } = useCategories();
  const { overallProgress } = useBudgetProgress();
  const {
    totalSpent,
    categorySpending,
    spendingTrend,
    recentTransactions,
    loading,
    error,
  } = useDashboardData();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', minHeight: 'calc(100vh - 64px)' }}>
      <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            {t('dashboard.title')}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/transactions/add')}
          >
            {t('transaction.add_transaction')}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Stack spacing={3}>
          {/* Summary Cards */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                height: 140,
                flex: 1,
              }}
            >
              <Typography color="text.secondary" gutterBottom>
                {t('dashboard.total_spent')}
              </Typography>
              <Typography variant="h4" component="div">
                {formatCurrency(totalSpent, preferredCurrency)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 'auto' }}>
                This month
              </Typography>
            </Paper>

            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                height: 140,
                flex: 1,
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
              }}
              onClick={() => navigate('/budgets')}
            >
              <Typography color="text.secondary" gutterBottom>
                {t('dashboard.budget_progress')}
              </Typography>
              <Typography
                variant="h4"
                component="div"
                color={overallProgress.percentage > 100 ? 'error.main' : overallProgress.percentage > 80 ? 'warning.main' : 'text.primary'}
              >
                {overallProgress.totalBudgeted > 0 ? `${overallProgress.percentage.toFixed(0)}%` : '0%'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 'auto' }}>
                {overallProgress.totalBudgeted > 0
                  ? `${formatCurrency(overallProgress.totalSpent, preferredCurrency)} / ${formatCurrency(overallProgress.totalBudgeted, preferredCurrency)}`
                  : 'No budgets set'}
              </Typography>
            </Paper>

            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                height: 140,
                flex: 1,
              }}
            >
              <Typography color="text.secondary" gutterBottom>
                {t('category.categories')}
              </Typography>
              <Typography variant="h4" component="div">
                {categories.length}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 'auto' }}>
                {categories.length === 0 ? 'Add your first category' : 'Active categories'}
              </Typography>
            </Paper>
          </Stack>

          {/* Charts Row */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
            <Box sx={{ flex: 1 }}>
              <SpendingByCategory data={categorySpending} currency={preferredCurrency} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <RecentTransactions transactions={recentTransactions} />
            </Box>
          </Stack>

          {/* Spending Trend */}
          <SpendingTrend data={spendingTrend} currency={preferredCurrency} />
        </Stack>
      </Box>
    </Box>
  );
};
