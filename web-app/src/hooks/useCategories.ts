import { useState, useEffect } from 'react';
import { categoryService } from '../utils/firestore';
import { useAuthStore } from '../stores/authStore';
import type { Category, CategoryInput } from '../types';

export const useCategories = () => {
  const { user } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const data = await categoryService.getByUserId(user.uid);

      // If no categories exist, initialize defaults
      if (data.length === 0) {
        await categoryService.initializeDefaultCategories(user.uid);
        const newData = await categoryService.getByUserId(user.uid);
        setCategories(newData);
      } else {
        setCategories(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const addCategory = async (data: CategoryInput) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const id = await categoryService.create(user.uid, data);
      await fetchCategories(); // Refresh list
      return id;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add category';
      setError(message);
      throw new Error(message);
    }
  };

  const updateCategory = async (id: string, data: Partial<CategoryInput>) => {
    try {
      await categoryService.update(id, data);
      await fetchCategories(); // Refresh list
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update category';
      setError(message);
      throw new Error(message);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await categoryService.delete(id);
      await fetchCategories(); // Refresh list
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete category';
      setError(message);
      throw new Error(message);
    }
  };

  return {
    categories,
    loading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    refreshCategories: fetchCategories,
  };
};
