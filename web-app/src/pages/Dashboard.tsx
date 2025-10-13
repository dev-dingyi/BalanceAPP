import { useTranslation } from 'react-i18next';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Stack,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';

export const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
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
                $0.00
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
              }}
            >
              <Typography color="text.secondary" gutterBottom>
                {t('dashboard.budget_progress')}
              </Typography>
              <Typography variant="h4" component="div">
                0%
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 'auto' }}>
                No budgets set
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
                0
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 'auto' }}>
                Add your first category
              </Typography>
            </Paper>
          </Stack>

          {/* Charts Row */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
            <Paper sx={{ p: 3, height: 300, flex: 1 }}>
              <Typography variant="h6" gutterBottom>
                {t('dashboard.spending_by_category')}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '80%',
                }}
              >
                <Typography color="text.secondary">
                  No data yet
                </Typography>
              </Box>
            </Paper>

            <Paper sx={{ p: 3, height: 300, flex: 1 }}>
              <Typography variant="h6" gutterBottom>
                {t('dashboard.recent_transactions')}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '80%',
                }}
              >
                <Typography color="text.secondary">
                  No transactions yet
                </Typography>
              </Box>
            </Paper>
          </Stack>

          {/* Spending Trend */}
          <Paper sx={{ p: 3, height: 300 }}>
            <Typography variant="h6" gutterBottom>
              {t('dashboard.spending_trend')}
            </Typography>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '80%',
              }}
            >
              <Typography color="text.secondary">
                No data yet
              </Typography>
            </Box>
          </Paper>
        </Stack>
      </Box>
    </Container>
  );
};
