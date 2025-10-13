import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  InputAdornment,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useTransactions } from '../../hooks/useTransactions';
import { useCategories } from '../../hooks/useCategories';
import { formatDateForInput } from '../../utils/date';
import type { Transaction, Currency } from '../../types';

interface Props {
  open: boolean;
  transaction: Transaction;
  onClose: () => void;
}

export const EditTransactionDialog = ({ open, transaction, onClose }: Props) => {
  const { t } = useTranslation();
  const { updateTransaction } = useTransactions();
  const { categories, loading: categoriesLoading } = useCategories();

  const [formData, setFormData] = useState({
    amount: transaction.amount.toString(),
    currency: transaction.currency as Currency,
    date: formatDateForInput(new Date(transaction.date)),
    time: transaction.time,
    location: transaction.location || '',
    description: transaction.description,
    categoryId: transaction.categoryId,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      // Reset form when dialog opens
      setFormData({
        amount: transaction.amount.toString(),
        currency: transaction.currency as Currency,
        date: formatDateForInput(new Date(transaction.date)),
        time: transaction.time,
        location: transaction.location || '',
        description: transaction.description,
        categoryId: transaction.categoryId,
      });
      setError('');
    }
  }, [open, transaction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError(t('transaction.error_invalid_amount') || 'Please enter a valid amount');
      return;
    }

    if (!formData.categoryId) {
      setError(t('transaction.error_select_category') || 'Please select a category');
      return;
    }

    if (!formData.description.trim()) {
      setError(t('transaction.error_description_required') || 'Please enter a description');
      return;
    }

    setLoading(true);

    try {
      // Combine date and time
      const dateTime = new Date(`${formData.date}T${formData.time}`);

      await updateTransaction(transaction.id, {
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        date: dateTime,
        time: formData.time,
        location: formData.location,
        description: formData.description,
        categoryId: formData.categoryId,
      });

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('transaction.edit_transaction')}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" id="edit-transaction-form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {/* Amount and Currency */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              label={t('transaction.amount')}
              type="number"
              required
              fullWidth
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {formData.currency === 'CNY' ? '¥' : '$'}
                  </InputAdornment>
                ),
              }}
              inputProps={{
                step: '0.01',
                min: '0',
              }}
            />
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>{t('transaction.currency')}</InputLabel>
              <Select
                value={formData.currency}
                label={t('transaction.currency')}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value as Currency })}
              >
                <MenuItem value="USD">USD ($)</MenuItem>
                <MenuItem value="CNY">CNY (¥)</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Date and Time */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              label={t('transaction.date')}
              type="date"
              required
              fullWidth
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label={t('transaction.time')}
              type="time"
              required
              fullWidth
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          {/* Category */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>{t('transaction.category')}</InputLabel>
            <Select
              value={formData.categoryId}
              label={t('transaction.category')}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              disabled={categoriesLoading}
              required
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Description */}
          <TextField
            label={t('transaction.description')}
            required
            fullWidth
            multiline
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            sx={{ mb: 3 }}
          />

          {/* Location */}
          <TextField
            label={t('transaction.location')}
            fullWidth
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {t('common.cancel')}
        </Button>
        <Button
          type="submit"
          form="edit-transaction-form"
          variant="contained"
          disabled={loading || categoriesLoading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? t('common.loading') : t('common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
