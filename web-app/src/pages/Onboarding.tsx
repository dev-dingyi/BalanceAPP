import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useSettingsStore } from '../stores/settingsStore';
import type { Currency } from '../types';

export const Onboarding = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { setPreferredCurrency, setLanguage } = useSettingsStore();

  const [currency, setCurrency] = useState<Currency>('USD');
  const [language, setLanguageState] = useState<'en' | 'zh'>(
    (i18n.language as 'en' | 'zh') || 'en'
  );

  const handleComplete = () => {
    setPreferredCurrency(currency);
    setLanguage(language);
    i18n.changeLanguage(language);
    localStorage.setItem('language', language);
    navigate('/dashboard');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            {t('onboarding.welcome')}
          </Typography>

          <Box sx={{ mt: 4 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>{t('onboarding.select_language')}</InputLabel>
              <Select
                value={language}
                label={t('onboarding.select_language')}
                onChange={(e) => {
                  const newLang = e.target.value as 'en' | 'zh';
                  setLanguageState(newLang);
                  i18n.changeLanguage(newLang);
                }}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="zh">中文</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>{t('onboarding.select_currency')}</InputLabel>
              <Select
                value={currency}
                label={t('onboarding.select_currency')}
                onChange={(e) => setCurrency(e.target.value as Currency)}
              >
                <MenuItem value="USD">USD ($)</MenuItem>
                <MenuItem value="CNY">CNY (¥)</MenuItem>
              </Select>
            </FormControl>

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleComplete}
              sx={{ mt: 2 }}
            >
              {t('onboarding.get_started')}
            </Button>
          </Box>
        </Paper>
        </Box>
      </Container>
    </Box>
  );
};
