import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, List, ListItem, ListItemText, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { SpendingByCategory as SpendingByCategoryType } from '../../types';
import { formatCurrency } from '../../utils/currency';

interface Props {
  data: SpendingByCategoryType[];
  currency: string;
}

const COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A8E6CF', '#FF8B94', '#B4A7D6', '#95E1D3', '#CCCCCC'];

export const SpendingByCategory = ({ data, currency }: Props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (data.length === 0) {
    return (
      <Paper sx={{ p: 3, height: 400 }}>
        <Typography variant="h6" gutterBottom>
          {t('dashboard.spending_by_category')}
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
            No spending data yet
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            Add transactions to see your spending breakdown
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

  const chartData = data.map((item, index) => ({
    name: item.categoryName,
    value: item.amount,
    percentage: item.percentage,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <Paper sx={{ p: 3, height: 400 }}>
      <Typography variant="h6" gutterBottom>
        {t('dashboard.spending_by_category')}
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, height: 'calc(100% - 40px)' }}>
        {/* Pie Chart */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => `${entry.percentage.toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatCurrency(value, currency as any)}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Box>

        {/* List */}
        <Box sx={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
          <List dense>
            {data.map((item, index) => (
              <ListItem key={item.categoryId} sx={{ px: 0 }}>
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    backgroundColor: COLORS[index % COLORS.length],
                    mr: 2,
                  }}
                />
                <ListItemText
                  primary={item.categoryName}
                  secondary={`${formatCurrency(item.amount, currency as any)} (${item.percentage.toFixed(1)}%)`}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>
    </Paper>
  );
};
