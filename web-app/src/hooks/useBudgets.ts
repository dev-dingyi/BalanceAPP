import { useState, useEffect } from 'react';
import { budgetService } from '../utils/firestore';
import { useAuthStore } from '../stores/authStore';
import type { Budget, BudgetInput } from '../types';

export const useBudgets = () => {
  const { user } = useAuthStore();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBudgets = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const data = await budgetService.getByUserId(user.uid);
      setBudgets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch budgets');
      console.error('Error fetching budgets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [user]);

  const addBudget = async (data: BudgetInput) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const id = await budgetService.create(user.uid, data);
      await fetchBudgets(); // Refresh list
      return id;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add budget';
      setError(message);
      throw new Error(message);
    }
  };

  const updateBudget = async (id: string, data: Partial<BudgetInput>) => {
    try {
      await budgetService.update(id, data);
      await fetchBudgets(); // Refresh list
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update budget';
      setError(message);
      throw new Error(message);
    }
  };

  const deleteBudget = async (id: string) => {
    try {
      await budgetService.delete(id);
      await fetchBudgets(); // Refresh list
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete budget';
      setError(message);
      throw new Error(message);
    }
  };

  return {
    budgets,
    loading,
    error,
    addBudget,
    updateBudget,
    deleteBudget,
    refreshBudgets: fetchBudgets,
  };
};
