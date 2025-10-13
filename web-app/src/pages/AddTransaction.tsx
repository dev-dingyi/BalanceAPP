import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Alert,
  CircularProgress,
  Chip,
  Stack,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  AutoAwesome as AIIcon,
  Close as CloseIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { useTransactions } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';
import { useSettingsStore } from '../stores/settingsStore';
import { formatDateForInput, formatTimeForInput } from '../utils/date';
import { parseTransactionTextAsync, examplePrompts } from '../utils/aiParser';
import { isAIConfigured } from '../services/aiService';
import { ReceiptScanner } from '../components/receipt/ReceiptScanner';
import type { ParsedReceipt } from '../services/ocrService';
import type { Currency } from '../types';

export const AddTransaction = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addTransaction } = useTransactions();
  const { categories, loading: categoriesLoading } = useCategories();
  const { preferredCurrency } = useSettingsStore();

  const [formData, setFormData] = useState({
    amount: '',
    currency: preferredCurrency as Currency,
    date: formatDateForInput(new Date()),
    time: formatTimeForInput(new Date()),
    location: '',
    description: '',
    categoryId: '',
  });

  const [aiInput, setAiInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiParsing, setAiParsing] = useState(false);
  const [error, setError] = useState('');
  const [parseSuccess, setParseSuccess] = useState(false);
  const [showReceiptScanner, setShowReceiptScanner] = useState(false);

  const handleAIParse = async () => {
    if (!aiInput.trim()) return;

    setAiParsing(true);
    setError('');
    setParseSuccess(false);

    try {
      const parsed = await parseTransactionTextAsync(aiInput, categories);

    // Auto-fill form with parsed data
    const newFormData = { ...formData };

    if (parsed.amount) {
      newFormData.amount = parsed.amount.toString();
    }

    if (parsed.currency) {
      newFormData.currency = parsed.currency;
    }

    if (parsed.description) {
      newFormData.description = parsed.description;
    }

    if (parsed.location) {
      newFormData.location = parsed.location;
    }

    if (parsed.suggestedCategory) {
      newFormData.categoryId = parsed.suggestedCategory;
    }

      setFormData(newFormData);
      setParseSuccess(true);

      // Show success message briefly
      setTimeout(() => setParseSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse transaction');
    } finally {
      setAiParsing(false);
    }
  };

  const handleExampleClick = async (example: string) => {
    setAiInput(example);
    setAiParsing(true);
    setError('');

    try {
      const parsed = await parseTransactionTextAsync(example, categories);
      const newFormData = { ...formData };

      if (parsed.amount) newFormData.amount = parsed.amount.toString();
      if (parsed.currency) newFormData.currency = parsed.currency;
      if (parsed.description) newFormData.description = parsed.description;
      if (parsed.location) newFormData.location = parsed.location;
      if (parsed.suggestedCategory) newFormData.categoryId = parsed.suggestedCategory;

      setFormData(newFormData);
      setParseSuccess(true);
      setTimeout(() => setParseSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse transaction');
    } finally {
      setAiParsing(false);
    }
  };

  const clearAIInput = () => {
    setAiInput('');
    setParseSuccess(false);
  };

  const handleReceiptParsed = (receipt: ParsedReceipt) => {
    // Auto-fill form with receipt data
    const newFormData = { ...formData };

    newFormData.amount = receipt.amount.toString();
    newFormData.currency = receipt.currency;
    newFormData.description = receipt.description;
    newFormData.date = formatDateForInput(receipt.date);
    newFormData.time = receipt.time;

    if (receipt.location) {
      newFormData.location = receipt.location;
    }

    if (receipt.categoryId) {
      newFormData.categoryId = receipt.categoryId;
    }

    setFormData(newFormData);
    setShowReceiptScanner(false);
    setParseSuccess(true);
    setTimeout(() => setParseSuccess(false), 3000);
  };

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

      await addTransaction({
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        date: dateTime,
        time: formData.time,
        location: formData.location,
        description: formData.description,
        categoryId: formData.categoryId,
      });

      // Success - navigate back to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', minHeight: 'calc(100vh - 64px)' }}>
      <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 3, maxWidth: 800, mx: 'auto' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('transaction.add_transaction')}
        </Typography>

        <Paper sx={{ p: 3, mt: 3 }}>
          {/* AI Smart Input Section */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <AIIcon color="primary" />
              <Typography variant="h6">
                {t('transaction.ai_smart_input') || 'AI Smart Input'}
              </Typography>
              {isAIConfigured() ? (
                <Chip
                  label="Claude AI"
                  size="small"
                  color="success"
                  sx={{ ml: 1 }}
                />
              ) : (
                <Chip
                  label="Regex"
                  size="small"
                  color="default"
                  sx={{ ml: 1 }}
                />
              )}
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {isAIConfigured()
                ? t('transaction.ai_description_claude') || 'Powered by Claude AI for intelligent natural language parsing'
                : t('transaction.ai_description') || 'Type naturally and let AI parse your transaction'}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                placeholder={t('transaction.ai_placeholder') || 'e.g., Coffee 45 CNY at Starbucks'}
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAIParse();
                  }
                }}
                InputProps={{
                  endAdornment: aiInput && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={clearAIInput}>
                        <CloseIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Tooltip title={t('transaction.parse') || 'Parse'}>
                <Button
                  variant="contained"
                  onClick={handleAIParse}
                  disabled={!aiInput.trim() || aiParsing}
                  startIcon={aiParsing ? <CircularProgress size={20} /> : <AIIcon />}
                  sx={{ minWidth: 120 }}
                >
                  {aiParsing ? t('common.loading') : t('transaction.parse') || 'Parse'}
                </Button>
              </Tooltip>
            </Box>

            {/* Example Prompts */}
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                {t('transaction.try_examples') || 'Try these examples:'}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {examplePrompts.slice(0, 5).map((example, index) => (
                  <Chip
                    key={index}
                    label={example}
                    size="small"
                    onClick={() => handleExampleClick(example)}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Stack>
            </Box>

            {parseSuccess && (
              <Alert severity="success" sx={{ mt: 2 }}>
                {t('transaction.parsed_success') || 'Successfully parsed! Check the form below.'}
              </Alert>
            )}
          </Box>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              {t('common.or') || 'OR'}
            </Typography>
          </Divider>

          {/* Receipt Scanning Section */}
          {!showReceiptScanner ? (
            <Box sx={{ textAlign: 'center', my: 3 }}>
              <Button
                variant="outlined"
                startIcon={<ReceiptIcon />}
                onClick={() => setShowReceiptScanner(true)}
                size="large"
              >
                {t('receipt.scan_receipt') || 'Scan Receipt'}
              </Button>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                {t('receipt.scan_description') || 'Upload or take a photo of your receipt'}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ mb: 4 }}>
              <ReceiptScanner
                onReceiptParsed={handleReceiptParsed}
                onClose={() => setShowReceiptScanner(false)}
                userCategories={categories}
              />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
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
              placeholder={t('transaction.smart_input_placeholder') || 'e.g., Coffee at Starbucks'}
            />

            {/* Location */}
            <TextField
              label={t('transaction.location')}
              fullWidth
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              sx={{ mb: 3 }}
              placeholder="e.g., Starbucks, 5th Ave"
            />

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/dashboard')}
                disabled={loading}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading || categoriesLoading}
                startIcon={loading && <CircularProgress size={20} />}
              >
                {loading ? t('common.loading') : t('common.save')}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};
