import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Button,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { formatDate } from '../../utils/date';
import { formatCurrency } from '../../utils/currency';
import type { Transaction } from '../../types';
import { useCategories } from '../../hooks/useCategories';

interface Props {
  transactions: Transaction[];
}

export const RecentTransactions = ({ transactions }: Props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { categories } = useCategories();

  const getCategoryById = (categoryId: string) => {
    return categories.find(c => c.id === categoryId);
  };

  if (transactions.length === 0) {
    return (
      <Paper sx={{ p: 3, height: 400 }}>
        <Typography variant="h6" gutterBottom>
          {t('dashboard.recent_transactions')}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: 'calc(100% - 40px)',
            gap: 2,
          }}
        >
          <Typography color="text.secondary" align="center">
            No transactions yet
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            Start tracking your spending by adding your first transaction
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/transactions/add')}
            size="small"
          >
            {t('transaction.add_transaction')}
          </Button>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, height: 400 }}>
      <Typography variant="h6" gutterBottom>
        {t('dashboard.recent_transactions')}
      </Typography>
      <List sx={{ overflowY: 'auto', maxHeight: 'calc(100% - 40px)' }}>
        {transactions.map((transaction) => {
          const category = getCategoryById(transaction.categoryId);
          return (
            <ListItem
              key={transaction.id}
              sx={{
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&:last-child': { borderBottom: 'none' },
              }}
            >
              <ListItemAvatar>
                <Avatar
                  sx={{
                    bgcolor: category?.color || '#CCCCCC',
                    fontSize: '1.5rem',
                  }}
                >
                  {category?.icon || '📦'}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1">{transaction.description}</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Box sx={{ display: 'flex', gap: 1, mt: 0.5, alignItems: 'center' }}>
                    <Chip
                      label={category?.name || 'Unknown'}
                      size="small"
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(new Date(transaction.date), 'MMM dd, yyyy')}
                    </Typography>
                    {transaction.location && (
                      <Typography variant="caption" color="text.secondary">
                        • {transaction.location}
                      </Typography>
                    )}
                  </Box>
                }
              />
            </ListItem>
          );
        })}
      </List>
    </Paper>
  );
};
