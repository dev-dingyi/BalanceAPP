import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  FormControlLabel,
  Switch,
  Slider,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Chip,
  TextField,
  Paper,
  Divider,
  Stack,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useSettingsStore } from '../../stores/settingsStore';
import { useCategories } from '../../hooks/useCategories';
import { getStealthModeStatus } from '../../utils/stealthMode';

export const StealthModeSettings = () => {
  const { t } = useTranslation();
  const { stealthMode, setStealthMode } = useSettingsStore();
  const { categories } = useCategories();

  const stealthStatus = getStealthModeStatus(stealthMode);

  const handleMasterToggle = (enabled: boolean) => {
    setStealthMode({ enabled });
  };

  const handleScalingToggle = (enabled: boolean) => {
    setStealthMode({
      scaling: { ...stealthMode.scaling, enabled },
    });
  };

  const handleScalingPercentage = (percentage: number) => {
    setStealthMode({
      scaling: { ...stealthMode.scaling, percentage },
    });
  };

  const handleHiddenCategoriesToggle = (enabled: boolean) => {
    setStealthMode({
      hiddenCategories: { ...stealthMode.hiddenCategories, enabled },
    });
  };

  const handleHiddenCategoriesChange = (categoryIds: string[]) => {
    setStealthMode({
      hiddenCategories: { ...stealthMode.hiddenCategories, categoryIds },
    });
  };

  const handleNoiseInjectionToggle = (enabled: boolean) => {
    setStealthMode({
      noiseInjection: { ...stealthMode.noiseInjection, enabled },
    });
  };

  const handleNoiseFrequency = (frequency: number) => {
    setStealthMode({
      noiseInjection: { ...stealthMode.noiseInjection, frequency },
    });
  };

  const handleNoiseAmountRange = (min: number, max: number) => {
    setStealthMode({
      noiseInjection: {
        ...stealthMode.noiseInjection,
        amountRange: { min, max },
      },
    });
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h6" gutterBottom>
          {t('stealth.stealth_mode')}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {t('stealth.stealth_mode_description')}
        </Typography>
      </Box>

      {/* Master Toggle */}
      <Paper sx={{ p: 2, bgcolor: stealthMode.enabled ? 'action.selected' : 'background.paper' }}>
        <FormControlLabel
          control={
            <Switch
              checked={stealthMode.enabled}
              onChange={(e) => handleMasterToggle(e.target.checked)}
              color="secondary"
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {stealthMode.enabled ? <VisibilityOff /> : <Visibility />}
              <Typography variant="h6">{t('stealth.enable_stealth')}</Typography>
            </Box>
          }
        />
        {stealthMode.enabled && stealthStatus.features.length > 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Active: {stealthStatus.description}
          </Alert>
        )}
      </Paper>

      {/* Scaling Feature */}
      <Paper sx={{ p: 3 }}>
        <FormControlLabel
          control={
            <Switch
              checked={stealthMode.scaling.enabled}
              onChange={(e) => handleScalingToggle(e.target.checked)}
              disabled={!stealthMode.enabled}
            />
          }
          label={
            <Box>
              <Typography variant="subtitle1">{t('stealth.scaling')}</Typography>
              <Typography variant="caption" color="text.secondary">
                {t('stealth.scaling_description')}
              </Typography>
            </Box>
          }
        />

        {stealthMode.scaling.enabled && (
          <Box sx={{ mt: 3, px: 2 }}>
            <Typography gutterBottom>
              {t('stealth.scaling_percentage')}: {stealthMode.scaling.percentage}%
            </Typography>
            <Slider
              value={stealthMode.scaling.percentage}
              onChange={(_e, value) => handleScalingPercentage(value as number)}
              min={10}
              max={100}
              step={5}
              marks={[
                { value: 10, label: '10%' },
                { value: 25, label: '25%' },
                { value: 50, label: '50%' },
                { value: 75, label: '75%' },
                { value: 100, label: '100%' },
              ]}
              disabled={!stealthMode.enabled}
              valueLabelDisplay="auto"
            />
            <Alert severity="info" sx={{ mt: 2 }}>
              All displayed amounts will show {stealthMode.scaling.percentage}% of actual values.
              For example, $100 will appear as ${(100 * stealthMode.scaling.percentage / 100).toFixed(2)}.
            </Alert>
          </Box>
        )}
      </Paper>

      {/* Hidden Categories */}
      <Paper sx={{ p: 3 }}>
        <FormControlLabel
          control={
            <Switch
              checked={stealthMode.hiddenCategories.enabled}
              onChange={(e) => handleHiddenCategoriesToggle(e.target.checked)}
              disabled={!stealthMode.enabled}
            />
          }
          label={
            <Box>
              <Typography variant="subtitle1">{t('stealth.hidden_categories')}</Typography>
              <Typography variant="caption" color="text.secondary">
                {t('stealth.hidden_categories_description')}
              </Typography>
            </Box>
          }
        />

        {stealthMode.hiddenCategories.enabled && (
          <Box sx={{ mt: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Select categories to hide</InputLabel>
              <Select
                multiple
                value={stealthMode.hiddenCategories.categoryIds}
                onChange={(e) => handleHiddenCategoriesChange(e.target.value as string[])}
                input={<OutlinedInput label="Select categories to hide" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const cat = categories.find((c) => c.id === value);
                      return (
                        <Chip
                          key={value}
                          label={cat ? `${cat.icon} ${cat.name}` : value}
                          size="small"
                        />
                      );
                    })}
                  </Box>
                )}
                disabled={!stealthMode.enabled}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Alert severity="warning" sx={{ mt: 2 }}>
              Transactions in hidden categories will not appear in lists, charts, or totals.
              They are still stored in the database.
            </Alert>
          </Box>
        )}
      </Paper>

      {/* Noise Injection */}
      <Paper sx={{ p: 3 }}>
        <FormControlLabel
          control={
            <Switch
              checked={stealthMode.noiseInjection.enabled}
              onChange={(e) => handleNoiseInjectionToggle(e.target.checked)}
              disabled={!stealthMode.enabled}
            />
          }
          label={
            <Box>
              <Typography variant="subtitle1">{t('stealth.noise_injection')}</Typography>
              <Typography variant="caption" color="text.secondary">
                {t('stealth.noise_injection_description')}
              </Typography>
            </Box>
          }
        />

        {stealthMode.noiseInjection.enabled && (
          <Box sx={{ mt: 3 }}>
            <TextField
              label={t('stealth.frequency')}
              type="number"
              value={stealthMode.noiseInjection.frequency}
              onChange={(e) => handleNoiseFrequency(parseInt(e.target.value) || 0)}
              inputProps={{ min: 0, max: 10 }}
              fullWidth
              disabled={!stealthMode.enabled}
              helperText="Number of fake transactions to generate per day"
              sx={{ mb: 2 }}
            />

            <Divider sx={{ my: 2 }} />

            <Typography gutterBottom>{t('stealth.amount_range')}</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Min"
                type="number"
                value={stealthMode.noiseInjection.amountRange.min}
                onChange={(e) =>
                  handleNoiseAmountRange(
                    parseFloat(e.target.value) || 0,
                    stealthMode.noiseInjection.amountRange.max
                  )
                }
                inputProps={{ min: 0, step: 0.01 }}
                disabled={!stealthMode.enabled}
              />
              <TextField
                label="Max"
                type="number"
                value={stealthMode.noiseInjection.amountRange.max}
                onChange={(e) =>
                  handleNoiseAmountRange(
                    stealthMode.noiseInjection.amountRange.min,
                    parseFloat(e.target.value) || 0
                  )
                }
                inputProps={{ min: 0, step: 0.01 }}
                disabled={!stealthMode.enabled}
              />
            </Box>

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                <strong>Note:</strong> Fake transactions are for display only and won't be saved to your database.
              </Typography>
              <Typography variant="caption">
                This feature adds random transactions to make your spending history appear more authentic.
                The fake data is generated on-the-fly and is not persistent.
              </Typography>
            </Alert>
          </Box>
        )}
      </Paper>

      {/* Warning */}
      {stealthMode.enabled && (
        <Alert severity="warning">
          <Typography variant="body2" gutterBottom>
            <strong>Important:</strong> Stealth mode only affects what you see on screen.
          </Typography>
          <Typography variant="caption">
            Your actual data in the database remains unchanged. Stealth mode is purely visual
            and will not modify your stored transactions, categories, or budgets.
          </Typography>
        </Alert>
      )}
    </Stack>
  );
};
