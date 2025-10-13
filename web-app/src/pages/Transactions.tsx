import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  IconButton,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Avatar,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Clear as ClearIcon,
  FileDownload as DownloadIcon,
  TableChart as ExcelIcon,
} from '@mui/icons-material';
import { useTransactions } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';
import { useStealthMode } from '../hooks/useStealthMode';
import { useSettingsStore } from '../stores/settingsStore';
import { formatDate } from '../utils/date';
import { formatCurrency } from '../utils/currency';
import { exportTransactionsToCSV, exportTransactionsToExcel } from '../utils/export';
import type { Transaction } from '../types';
import { EditTransactionDialog } from '../components/transaction/EditTransactionDialog';
import { DeleteConfirmDialog } from '../components/transaction/DeleteConfirmDialog';

export const Transactions = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { transactions, loading, error, deleteTransaction } = useTransactions();
  const { categories } = useCategories();
  const { transformTransactions } = useStealthMode();
  const { preferredCurrency } = useSettingsStore();

  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuTransaction, setMenuTransaction] = useState<Transaction | null>(null);

  // Apply stealth mode transformations
  const transformedTransactions = useMemo(
    () => transformTransactions(transactions),
    [transactions, transformTransactions]
  );

  // Filter and search logic
  const filteredTransactions = useMemo(() => {
    let filtered = [...transformedTransactions];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.description.toLowerCase().includes(query) ||
          t.location?.toLowerCase().includes(query) ||
          categories.find((c) => c.id === t.categoryId)?.name.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((t) => t.categoryId === categoryFilter);
    }

    // Date range filter
    if (startDate) {
      filtered = filtered.filter((t) => new Date(t.date) >= new Date(startDate));
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter((t) => new Date(t.date) <= end);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        const comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        return sortOrder === 'asc' ? comparison : -comparison;
      } else {
        const comparison = a.amount - b.amount;
        return sortOrder === 'asc' ? comparison : -comparison;
      }
    });

    return filtered;
  }, [
    transformedTransactions,
    searchQuery,
    categoryFilter,
    startDate,
    endDate,
    sortBy,
    sortOrder,
    categories,
  ]);

  // Pagination
  const paginatedTransactions = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredTransactions.slice(start, start + rowsPerPage);
  }, [filteredTransactions, page, rowsPerPage]);

  // Statistics
  const stats = useMemo(() => {
    const total = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
    const count = filteredTransactions.length;
    const average = count > 0 ? total / count : 0;
    return { total, count, average };
  }, [filteredTransactions]);

  // Handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, transaction: Transaction) => {
    setAnchorEl(event.currentTarget);
    setMenuTransaction(transaction);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuTransaction(null);
  };

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const handleDelete = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (selectedTransaction) {
      try {
        await deleteTransaction(selectedTransaction.id);
        setDeleteDialogOpen(false);
        setSelectedTransaction(null);
      } catch (err) {
        console.error('Failed to delete transaction:', err);
      }
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setStartDate('');
    setEndDate('');
    setPage(0);
  };

  const getCategoryById = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId);
  };

  const getCategoryName = (categoryId: string) => {
    const category = getCategoryById(categoryId);
    return category ? category.name : 'Unknown';
  };

  const handleExportCSV = () => {
    exportTransactionsToCSV(filteredTransactions, getCategoryName);
  };

  const handleExportExcel = () => {
    exportTransactionsToExcel(filteredTransactions, getCategoryName);
  };

  const hasActiveFilters = searchQuery || categoryFilter !== 'all' || startDate || endDate;

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
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4" component="h1">
            {t('transaction.transactions')}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportCSV}
              disabled={filteredTransactions.length === 0}
            >
              {t('transaction.export_csv')}
            </Button>
            <Button
              variant="outlined"
              startIcon={<ExcelIcon />}
              onClick={handleExportExcel}
              disabled={filteredTransactions.length === 0}
            >
              {t('transaction.export_excel')}
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/transactions/add')}
            >
              {t('transaction.add_transaction')}
            </Button>
          </Stack>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Statistics Cards */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
          <Paper sx={{ p: 2, flex: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {t('transaction.total_transactions')}
            </Typography>
            <Typography variant="h5">{stats.count}</Typography>
          </Paper>
          <Paper sx={{ p: 2, flex: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {t('transaction.total_amount')}
            </Typography>
            <Typography variant="h5">{formatCurrency(stats.total, preferredCurrency)}</Typography>
          </Paper>
          <Paper sx={{ p: 2, flex: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {t('transaction.average_amount')}
            </Typography>
            <Typography variant="h5">{formatCurrency(stats.average, preferredCurrency)}</Typography>
          </Paper>
        </Stack>

        {/* Filters */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FilterIcon sx={{ mr: 1 }} />
            <Typography variant="h6">{t('common.filters')}</Typography>
            {hasActiveFilters && (
              <Button
                size="small"
                startIcon={<ClearIcon />}
                onClick={handleClearFilters}
                sx={{ ml: 'auto' }}
              >
                {t('common.clear_filters')}
              </Button>
            )}
          </Box>

          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              {/* Search */}
              <TextField
                fullWidth
                placeholder={t('transaction.search_placeholder')}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(0);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Category Filter */}
              <FormControl fullWidth>
                <InputLabel>{t('transaction.category')}</InputLabel>
                <Select
                  value={categoryFilter}
                  label={t('transaction.category')}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="all">{t('common.all_categories')}</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              {/* Date Range */}
              <TextField
                fullWidth
                label={t('transaction.start_date')}
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(0);
                }}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label={t('transaction.end_date')}
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(0);
                }}
                InputLabelProps={{ shrink: true }}
              />

              {/* Sort */}
              <FormControl fullWidth>
                <InputLabel>{t('common.sort_by')}</InputLabel>
                <Select
                  value={`${sortBy}-${sortOrder}`}
                  label={t('common.sort_by')}
                  onChange={(e) => {
                    const [sort, order] = e.target.value.split('-') as ['date' | 'amount', 'asc' | 'desc'];
                    setSortBy(sort);
                    setSortOrder(order);
                  }}
                >
                  <MenuItem value="date-desc">{t('transaction.newest_first')}</MenuItem>
                  <MenuItem value="date-asc">{t('transaction.oldest_first')}</MenuItem>
                  <MenuItem value="amount-desc">{t('transaction.highest_amount')}</MenuItem>
                  <MenuItem value="amount-asc">{t('transaction.lowest_amount')}</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Stack>

          {hasActiveFilters && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {t('transaction.showing_results', { count: filteredTransactions.length })}
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Transactions Table */}
        <Paper>
          {filteredTransactions.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {hasActiveFilters ? t('transaction.no_results') : t('transaction.no_transactions')}
              </Typography>
              {hasActiveFilters ? (
                <Button variant="outlined" onClick={handleClearFilters} sx={{ mt: 2 }}>
                  {t('common.clear_filters')}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/transactions/add')}
                  sx={{ mt: 2 }}
                >
                  {t('transaction.add_transaction')}
                </Button>
              )}
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('transaction.category')}</TableCell>
                      <TableCell>{t('transaction.description')}</TableCell>
                      <TableCell>{t('transaction.date')}</TableCell>
                      <TableCell>{t('transaction.location')}</TableCell>
                      <TableCell align="right">{t('transaction.amount')}</TableCell>
                      <TableCell align="right">{t('common.actions')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedTransactions.map((transaction) => {
                      const category = getCategoryById(transaction.categoryId);
                      return (
                        <TableRow key={transaction.id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar
                                sx={{
                                  bgcolor: category?.color || '#CCCCCC',
                                  width: 32,
                                  height: 32,
                                  fontSize: '1rem',
                                }}
                              >
                                {category?.icon || '📦'}
                              </Avatar>
                              <Typography variant="body2">{category?.name || 'Unknown'}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{transaction.description}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(new Date(transaction.date), 'MMM dd, yyyy')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {transaction.time}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {transaction.location || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="bold">
                              {formatCurrency(transaction.amount, transaction.currency)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              onClick={(e) => handleMenuOpen(e, transaction)}
                            >
                              <MoreVertIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={filteredTransactions.length}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[5, 10, 25, 50]}
              />
            </>
          )}
        </Paper>

        {/* Action Menu */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem
            onClick={() => {
              if (menuTransaction) handleEdit(menuTransaction);
            }}
          >
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t('common.edit')}</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              if (menuTransaction) handleDelete(menuTransaction);
            }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText sx={{ color: 'error.main' }}>{t('common.delete')}</ListItemText>
          </MenuItem>
        </Menu>

        {/* Edit Dialog */}
        {selectedTransaction && (
          <EditTransactionDialog
            open={editDialogOpen}
            transaction={selectedTransaction}
            onClose={() => {
              setEditDialogOpen(false);
              setSelectedTransaction(null);
            }}
          />
        )}

        {/* Delete Confirmation Dialog */}
        {selectedTransaction && (
          <DeleteConfirmDialog
            open={deleteDialogOpen}
            title={t('transaction.delete_transaction')}
            message={t('transaction.delete_confirm', {
              description: selectedTransaction.description,
            })}
            onClose={() => {
              setDeleteDialogOpen(false);
              setSelectedTransaction(null);
            }}
            onConfirm={handleDeleteConfirm}
          />
        )}
      </Box>
    </Box>
  );
};
