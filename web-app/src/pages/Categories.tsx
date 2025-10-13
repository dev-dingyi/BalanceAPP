import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useCategories } from '../hooks/useCategories';
import type { Category, CategoryInput } from '../types';

const EMOJI_OPTIONS = ['🍽️', '🚗', '🛍️', '🎬', '💡', '🏥', '📚', '📦', '💰', '🏠', '✈️', '☕', '🎮', '🏃', '🎵'];
const COLOR_OPTIONS = [
  '#FF6B6B', '#4ECDC4', '#FFE66D', '#A8E6CF', '#FF8B94',
  '#B4A7D6', '#95E1D3', '#CCCCCC', '#FF9FF3', '#FECA57',
];

export const Categories = () => {
  const { t } = useTranslation();
  const { categories, loading, error, addCategory, updateCategory, deleteCategory } = useCategories();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryInput>({
    name: '',
    nameEn: '',
    nameCn: '',
    icon: '📦',
    color: '#CCCCCC',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        nameEn: category.nameEn,
        nameCn: category.nameCn,
        icon: category.icon || '📦',
        color: category.color || '#CCCCCC',
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        nameEn: '',
        nameCn: '',
        icon: '📦',
        color: '#CCCCCC',
      });
    }
    setFormError('');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCategory(null);
    setFormError('');
  };

  const handleSubmit = async () => {
    setFormError('');

    // Validation
    if (!formData.name.trim() || !formData.nameEn.trim() || !formData.nameCn.trim()) {
      setFormError('All name fields are required');
      return;
    }

    setSubmitting(true);

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
      } else {
        await addCategory(formData);
      }
      handleCloseDialog();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (category: Category) => {
    const confirmMessage = category.isDefault
      ? `Are you sure you want to delete the default category "${category.name}"? This action cannot be undone.`
      : `Delete category "${category.name}"?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      await deleteCategory(category.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete category');
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
      <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 3, maxWidth: 800, mx: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            {t('category.categories')}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            {t('category.add_category')}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper>
          <List>
            {categories.length === 0 ? (
              <ListItem>
                <ListItemText
                  primary="No categories yet"
                  secondary="Click 'Add Category' to create your first category"
                />
              </ListItem>
            ) : (
              categories.map((category) => (
                <ListItem
                  key={category.id}
                  secondaryAction={
                    <Box>
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={() => handleOpenDialog(category)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDelete(category)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemIcon>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        backgroundColor: category.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                      }}
                    >
                      {category.icon}
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={category.name}
                    secondary={`${category.nameEn} / ${category.nameCn}`}
                  />
                </ListItem>
              ))
            )}
          </List>
        </Paper>

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingCategory ? t('category.edit_category') : t('category.add_category')}
          </DialogTitle>
          <DialogContent>
            {formError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {formError}
              </Alert>
            )}

            <TextField
              label={t('category.category_name')}
              fullWidth
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              sx={{ mt: 2, mb: 2 }}
            />

            <TextField
              label={t('category.category_name_en')}
              fullWidth
              required
              value={formData.nameEn}
              onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
              sx={{ mb: 2 }}
            />

            <TextField
              label={t('category.category_name_cn')}
              fullWidth
              required
              value={formData.nameCn}
              onChange={(e) => setFormData({ ...formData, nameCn: e.target.value })}
              sx={{ mb: 2 }}
            />

            <Typography variant="subtitle2" gutterBottom>
              {t('category.icon')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              {EMOJI_OPTIONS.map((emoji) => (
                <Button
                  key={emoji}
                  variant={formData.icon === emoji ? 'contained' : 'outlined'}
                  onClick={() => setFormData({ ...formData, icon: emoji })}
                  sx={{ minWidth: 50, fontSize: '1.5rem' }}
                >
                  {emoji}
                </Button>
              ))}
            </Box>

            <Typography variant="subtitle2" gutterBottom>
              {t('category.color')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {COLOR_OPTIONS.map((color) => (
                <Button
                  key={color}
                  variant="outlined"
                  onClick={() => setFormData({ ...formData, color })}
                  sx={{
                    minWidth: 50,
                    height: 50,
                    backgroundColor: color,
                    border: formData.color === color ? '3px solid #000' : '1px solid #ccc',
                    '&:hover': { backgroundColor: color, opacity: 0.8 },
                  }}
                />
              ))}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={submitting}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={submitting}
              startIcon={submitting && <CircularProgress size={20} />}
            >
              {submitting ? t('common.loading') : t('common.save')}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};
