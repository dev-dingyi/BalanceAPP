import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TextField,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Language as LanguageIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useSettingsStore } from '../stores/settingsStore';
import { useTransactions } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';
import { useBudgets } from '../hooks/useBudgets';
import { deleteCompleteAccount } from '../utils/accountManagement';
import { useNavigate } from 'react-router-dom';
import { StealthModeSettings } from '../components/settings/StealthModeSettings';
import type { Currency } from '../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const Settings = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { preferredCurrency, setPreferredCurrency, language, setLanguage } = useSettingsStore();
  const { transactions } = useTransactions();
  const { categories } = useCategories();
  const { budgets } = useBudgets();

  const [tabValue, setTabValue] = useState(0);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleLanguageChange = (newLanguage: 'en' | 'zh') => {
    setLanguage(newLanguage);
    i18n.changeLanguage(newLanguage);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleCurrencyChange = (newCurrency: Currency) => {
    setPreferredCurrency(newCurrency);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      // Compile all user data
      const exportData = {
        exportDate: new Date().toISOString(),
        user: {
          email: user?.email,
          uid: user?.uid,
        },
        settings: {
          preferredCurrency,
          language,
        },
        transactions,
        categories,
        budgets,
        stats: {
          totalTransactions: transactions.length,
          totalCategories: categories.length,
          totalBudgets: budgets.length,
        },
      };

      // Create blob and download
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `balance-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportDialogOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    setDeleting(true);
    setDeleteError('');

    try {
      await deleteCompleteAccount(user);

      // Close dialog
      setDeleteDialogOpen(false);

      // Sign out and redirect to login
      await signOut();
      navigate('/login');
    } catch (error: any) {
      console.error('Delete account failed:', error);
      setDeleteError(error.message || 'Failed to delete account');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box sx={{ width: '100%', minHeight: 'calc(100vh - 64px)' }}>
      <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 3, maxWidth: 1000, mx: 'auto' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('settings.settings')}
        </Typography>

        {saveSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Settings saved successfully!
          </Alert>
        )}

        <Paper sx={{ mt: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="settings tabs"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab icon={<LanguageIcon />} label={t('settings.general')} />
            <Tab icon={<PersonIcon />} label={t('settings.account')} />
            <Tab icon={<SecurityIcon />} label={t('settings.privacy')} />
          </Tabs>

          {/* General Settings */}
          <TabPanel value={tabValue} index={0}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  {t('settings.general')}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Configure your language and currency preferences
                </Typography>
              </Box>

              <FormControl fullWidth>
                <InputLabel>{t('settings.language')}</InputLabel>
                <Select
                  value={language}
                  label={t('settings.language')}
                  onChange={(e) => handleLanguageChange(e.target.value as 'en' | 'zh')}
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="zh">中文 (Chinese)</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>{t('settings.preferred_currency')}</InputLabel>
                <Select
                  value={preferredCurrency}
                  label={t('settings.preferred_currency')}
                  onChange={(e) => handleCurrencyChange(e.target.value as Currency)}
                >
                  <MenuItem value="USD">USD ($) - US Dollar</MenuItem>
                  <MenuItem value="CNY">CNY (¥) - Chinese Yuan</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </TabPanel>

          {/* Account Settings */}
          <TabPanel value={tabValue} index={1}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  {t('settings.account')}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Manage your account information
                </Typography>
              </Box>

              <TextField
                label="Email"
                value={user?.email || ''}
                disabled
                fullWidth
                helperText="Email cannot be changed"
              />

              <TextField
                label="User ID"
                value={user?.uid || ''}
                disabled
                fullWidth
                helperText="Your unique user identifier"
              />

              <Divider />

              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Data Management
                </Typography>
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => setExportDialogOpen(true)}
                    fullWidth
                  >
                    Export All Data
                  </Button>
                  <Typography variant="caption" color="text.secondary">
                    Download all your transactions, categories, and budgets as JSON
                  </Typography>
                </Stack>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle1" gutterBottom color="error">
                  Danger Zone
                </Typography>
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => setDeleteDialogOpen(true)}
                    fullWidth
                  >
                    Delete Account
                  </Button>
                  <Typography variant="caption" color="text.secondary">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </TabPanel>

          {/* Privacy Settings */}
          <TabPanel value={tabValue} index={2}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  {t('settings.privacy')}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Privacy and security settings
                </Typography>
              </Box>

              <StealthModeSettings />

              <Divider />

              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Data Privacy
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Your data is stored securely in Firebase Firestore. Only you have access to your financial information.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  We do not share your data with third parties. All data is encrypted at rest and in transit.
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Security
                </Typography>
                <Button variant="outlined" onClick={signOut} fullWidth>
                  Sign Out
                </Button>
              </Box>
            </Stack>
          </TabPanel>
        </Paper>
      </Box>

      {/* Export Data Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)}>
        <DialogTitle>Export All Data</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will download all your data including:
          </DialogContentText>
          <ul>
            <li>{transactions.length} transactions</li>
            <li>{categories.length} categories</li>
            <li>{budgets.length} budgets</li>
            <li>Account settings</li>
          </ul>
          <DialogContentText sx={{ mt: 2 }}>
            The data will be exported as a JSON file that you can save as a backup.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)} disabled={exporting}>
            Cancel
          </Button>
          <Button
            onClick={handleExportData}
            variant="contained"
            disabled={exporting}
            startIcon={exporting ? <CircularProgress size={20} /> : <DownloadIcon />}
          >
            {exporting ? 'Exporting...' : 'Export'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => !deleting && setDeleteDialogOpen(false)}>
        <DialogTitle color="error">Delete Account</DialogTitle>
        <DialogContent>
          {deleteError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {deleteError}
            </Alert>
          )}
          <DialogContentText>
            Are you sure you want to delete your account? This will permanently delete:
          </DialogContentText>
          <ul>
            <li>All {transactions.length} transactions</li>
            <li>All {categories.length} categories</li>
            <li>All {budgets.length} budgets</li>
            <li>Your account settings</li>
            <li>Your authentication credentials</li>
          </ul>
          <DialogContentText sx={{ mt: 2 }} color="error">
            <strong>This action cannot be undone!</strong>
          </DialogContentText>
          {deleting && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
              <CircularProgress size={20} />
              <Typography variant="body2">Deleting your account...</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteAccount}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
