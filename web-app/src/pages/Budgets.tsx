import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Button,
  Paper,
  List,
  IconButton,
  LinearProgress,
  Chip,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useBudgets } from '../hooks/useBudgets';
import { useBudgetProgress } from '../hooks/useBudgetProgress';
import { useCategories } from '../hooks/useCategories';
import { formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/date';
import { BudgetDialog } from '../components/budget/BudgetDialog';
import type { Budget } from '../types';

export const Budgets = () => {
  const { t } = useTranslation();
  const { budgets, loading, error, deleteBudget } = useBudgets();
  const { budgetProgress } = useBudgetProgress();
  const { categories } = useCategories();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const handleOpenDialog = (budget?: Budget) => {
    if (budget) {
      setEditingBudget(budget);
    } else {
      setEditingBudget(null);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingBudget(null);
  };

  const handleDelete = async (budget: Budget) => {
    if (!window.confirm(`Delete budget "${budget.name}"?`)) {
      return;
    }

    try {
      await deleteBudget(budget.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete budget');
    }
  };

  const getBudgetProgress = (budgetId: string) => {
    return budgetProgress.find(bp => bp.budgetId === budgetId);
  };

  const getCategoryNames = (categoryIds: string[]) => {
    if (categoryIds.length === 0) return 'All categories';
    return categoryIds
      .map(id => {
        const cat = categories.find(c => c.id === id);
        return cat?.name || 'Unknown';
      })
      .join(', ');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', minHeight: 'calc(100vh - 64px)' }}>
      <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 3, maxWidth: 1200, mx: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            {t('budget.budgets')}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            {t('budget.add_budget')}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {budgets.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No budgets yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create your first budget to start tracking your spending
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              {t('budget.add_budget')}
            </Button>
          </Paper>
        ) : (
          <List>
            {budgets.map((budget) => {
              const progress = getBudgetProgress(budget.id);
              const isOverBudget = progress && progress.percentage > 100;
              const isWarning = progress && progress.percentage > 80 && progress.percentage <= 100;

              return (
                <Paper key={budget.id} sx={{ mb: 2, p: 3 }}>
                  <Stack spacing={2}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          {budget.name}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                          <Chip
                            label={budget.type}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          {progress && progress.daysRemaining >= 0 && (
                            <Chip
                              label={`${progress.daysRemaining} days left`}
                              size="small"
                              color={progress.daysRemaining < 7 ? 'warning' : 'default'}
                            />
                          )}
                          {isOverBudget && (
                            <Chip
                              label="Over Budget"
                              size="small"
                              color="error"
                            />
                          )}
                          {isWarning && (
                            <Chip
                              label="Near Limit"
                              size="small"
                              color="warning"
                            />
                          )}
                        </Stack>
                      </Box>
                      <Box>
                        <IconButton
                          onClick={() => handleOpenDialog(budget)}
                          size="small"
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(budget)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>

                    {/* Progress Bar */}
                    {progress && (
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {formatCurrency(progress.spent, progress.currency)} / {formatCurrency(progress.total, progress.currency)}
                          </Typography>
                          <Typography
                            variant="body2"
                            color={isOverBudget ? 'error.main' : isWarning ? 'warning.main' : 'text.secondary'}
                            fontWeight="bold"
                          >
                            {progress.percentage.toFixed(1)}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(progress.percentage, 100)}
                          color={isOverBudget ? 'error' : isWarning ? 'warning' : 'primary'}
                          sx={{ height: 8, borderRadius: 1 }}
                        />
                      </Box>
                    )}

                    {/* Details */}
                    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Period
                        </Typography>
                        <Typography variant="body2">
                          {formatDate(new Date(budget.startDate), 'MMM dd, yyyy')} - {formatDate(new Date(budget.endDate), 'MMM dd, yyyy')}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Categories
                        </Typography>
                        <Typography variant="body2">
                          {getCategoryNames(budget.categories)}
                        </Typography>
                      </Box>
                      {budget.recurring?.enabled && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Recurring
                          </Typography>
                          <Typography variant="body2">
                            Every {budget.recurring.cycleLength} days
                            {budget.recurring.dayOfMonth && ` on day ${budget.recurring.dayOfMonth}`}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Stack>
                </Paper>
              );
            })}
          </List>
        )}

        {/* Add/Edit Dialog */}
        <BudgetDialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          budget={editingBudget}
        />
      </Box>
    </Box>
  );
};
