import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Switch,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as CreateIcon,
} from '@mui/icons-material';
import { useRecurringTransactions } from '../hooks/useRecurringTransactions';
import { useCategories } from '../hooks/useCategories';
import { useSettingsStore } from '../stores/settingsStore';
import { useAuthStore } from '../stores/authStore';
import { formatCurrency } from '../utils/currency';
import { formatNextDue, getFrequencyDisplay, createTransactionFromRecurring, processDueRecurringTransactions } from '../utils/recurringUtils';
import { formatDateForInput } from '../utils/date';
import type { Currency, RecurringFrequency, RecurringTransactionInput } from '../types';

export const RecurringTransactions = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { recurringTransactions, loading, error, addRecurringTransaction, updateRecurringTransaction, deleteRecurringTransaction, toggleActive, refreshRecurringTransactions } = useRecurringTransactions();
  const { categories } = useCategories();
  const { preferredCurrency } = useSettingsStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState<RecurringTransactionInput>({
    templateName: '',
    amount: 0,
    currency: preferredCurrency as Currency,
    description: '',
    categoryId: '',
    location: '',
    frequency: 'monthly',
    startDate: new Date(),
    endDate: undefined,
    isActive: true,
  });

  useEffect(() => {
    if (!dialogOpen) {
      setEditingId(null);
      setFormData({
        templateName: '',
        amount: 0,
        currency: preferredCurrency as Currency,
        description: '',
        categoryId: '',
        location: '',
        frequency: 'monthly',
        startDate: new Date(),
        endDate: undefined,
        isActive: true,
      });
    }
  }, [dialogOpen, preferredCurrency]);

  const handleEdit = (id: string) => {
    const recurring = recurringTransactions.find(r => r.id === id);
    if (recurring) {
      setEditingId(id);
      setFormData({
        templateName: recurring.templateName,
        amount: recurring.amount,
        currency: recurring.currency,
        description: recurring.description,
        categoryId: recurring.categoryId,
        location: recurring.location || '',
        frequency: recurring.frequency,
        startDate: new Date(recurring.startDate),
        endDate: recurring.endDate ? new Date(recurring.endDate) : undefined,
        isActive: recurring.isActive,
      });
      setDialogOpen(true);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await updateRecurringTransaction(editingId, formData);
      } else {
        await addRecurringTransaction(formData);
      }
      setDialogOpen(false);
    } catch (err) {
      console.error('Failed to save recurring transaction:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t('recurring.delete_confirm') || 'Delete this recurring transaction?')) {
      await deleteRecurringTransaction(id);
    }
  };

  const handleCreateNow = async (id: string) => {
    const recurring = recurringTransactions.find(r => r.id === id);
    if (recurring && user) {
      try {
        setProcessing(true);
        await createTransactionFromRecurring(recurring, user.uid);
        await refreshRecurringTransactions();
        alert(t('recurring.created_success') || 'Transaction created successfully!');
      } catch (err) {
        alert(t('recurring.create_failed') || 'Failed to create transaction');
      } finally {
        setProcessing(false);
      }
    }
  };

  const handleProcessAll = async () => {
    if (user) {
      try {
        setProcessing(true);
        const result = await processDueRecurringTransactions(recurringTransactions, user.uid);
        await refreshRecurringTransactions();
        alert(`${t('recurring.processed') || 'Processed'}: ${result.created} ${t('recurring.transactions_created') || 'transactions created'}`);
      } catch (err) {
        alert(t('recurring.process_failed') || 'Failed to process due transactions');
      } finally {
        setProcessing(false);
      }
    }
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
      <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4" component="h1">
            {t('recurring.title') || 'Recurring Transactions'}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<CreateIcon />}
              onClick={handleProcessAll}
              disabled={processing || recurringTransactions.filter(r => r.isActive).length === 0}
            >
              {t('recurring.process_due') || 'Process Due'}
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setDialogOpen(true)}
            >
              {t('recurring.add') || 'Add Recurring'}
            </Button>
          </Stack>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {recurringTransactions.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {t('recurring.no_recurring') || 'No recurring transactions'}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setDialogOpen(true)}
              sx={{ mt: 2 }}
            >
              {t('recurring.add_first') || 'Add Your First'}
            </Button>
          </Paper>
        ) : (
          <Paper>
            <List>
              {recurringTransactions.map((recurring) => {
                const category = categories.find(c => c.id === recurring.categoryId);
                return (
                  <ListItem key={recurring.id} divider>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1">{recurring.templateName}</Typography>
                          <Chip
                            label={getFrequencyDisplay(recurring.frequency, t)}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          <Chip
                            label={formatNextDue(new Date(recurring.nextDue))}
                            size="small"
                            color={new Date(recurring.nextDue) < new Date() ? 'error' : 'default'}
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          {recurring.description} • {category?.name || 'Unknown'} •{' '}
                          {formatCurrency(recurring.amount, recurring.currency)}
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Switch
                          checked={recurring.isActive}
                          onChange={(e) => toggleActive(recurring.id, e.target.checked)}
                          size="small"
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleCreateNow(recurring.id)}
                          disabled={processing}
                        >
                          <CreateIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleEdit(recurring.id)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(recurring.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </ListItemSecondaryAction>
                  </ListItem>
                );
              })}
            </List>
          </Paper>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingId ? t('recurring.edit') : t('recurring.add')}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label={t('recurring.template_name') || 'Template Name'}
                value={formData.templateName}
                onChange={(e) => setFormData({ ...formData, templateName: e.target.value })}
                required
                fullWidth
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label={t('transaction.amount')}
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                  required
                  fullWidth
                  InputProps={{
                    startAdornment: <InputAdornment position="start">{formData.currency === 'CNY' ? '¥' : '$'}</InputAdornment>,
                  }}
                />
                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel>{t('transaction.currency')}</InputLabel>
                  <Select
                    value={formData.currency}
                    label={t('transaction.currency')}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value as Currency })}
                  >
                    <MenuItem value="USD">USD</MenuItem>
                    <MenuItem value="CNY">CNY</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <FormControl fullWidth>
                <InputLabel>{t('transaction.category')}</InputLabel>
                <Select
                  value={formData.categoryId}
                  label={t('transaction.category')}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  required
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label={t('transaction.description')}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                fullWidth
                multiline
                rows={2}
              />
              <TextField
                label={t('transaction.location')}
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>{t('recurring.frequency')}</InputLabel>
                <Select
                  value={formData.frequency}
                  label={t('recurring.frequency')}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value as RecurringFrequency })}
                >
                  <MenuItem value="daily">{t('recurring.frequency_daily') || 'Daily'}</MenuItem>
                  <MenuItem value="weekly">{t('recurring.frequency_weekly') || 'Weekly'}</MenuItem>
                  <MenuItem value="biweekly">{t('recurring.frequency_biweekly') || 'Biweekly'}</MenuItem>
                  <MenuItem value="monthly">{t('recurring.frequency_monthly') || 'Monthly'}</MenuItem>
                  <MenuItem value="quarterly">{t('recurring.frequency_quarterly') || 'Quarterly'}</MenuItem>
                  <MenuItem value="yearly">{t('recurring.frequency_yearly') || 'Yearly'}</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label={t('recurring.start_date') || 'Start Date'}
                type="date"
                value={formatDateForInput(formData.startDate)}
                onChange={(e) => setFormData({ ...formData, startDate: new Date(e.target.value) })}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label={t('recurring.end_date') || 'End Date (Optional)'}
                type="date"
                value={formData.endDate ? formatDateForInput(formData.endDate) : ''}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value ? new Date(e.target.value) : undefined })}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleSubmit} variant="contained">
              {t('common.save')}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};
