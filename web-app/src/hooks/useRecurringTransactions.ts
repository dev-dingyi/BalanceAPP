import { useState, useEffect } from 'react';
import { recurringTransactionService } from '../utils/firestore';
import { useAuthStore } from '../stores/authStore';
import type { RecurringTransaction, RecurringTransactionInput } from '../types';

export const useRecurringTransactions = () => {
  const { user } = useAuthStore();
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecurringTransactions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const data = await recurringTransactionService.getByUserId(user.uid);
      setRecurringTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recurring transactions');
      console.error('Error fetching recurring transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecurringTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const addRecurringTransaction = async (data: RecurringTransactionInput) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const id = await recurringTransactionService.create(user.uid, data);
      await fetchRecurringTransactions();
      return id;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add recurring transaction';
      setError(message);
      throw new Error(message);
    }
  };

  const updateRecurringTransaction = async (id: string, data: Partial<RecurringTransactionInput>) => {
    try {
      await recurringTransactionService.update(id, data);
      await fetchRecurringTransactions();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update recurring transaction';
      setError(message);
      throw new Error(message);
    }
  };

  const deleteRecurringTransaction = async (id: string) => {
    try {
      await recurringTransactionService.delete(id);
      await fetchRecurringTransactions();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete recurring transaction';
      setError(message);
      throw new Error(message);
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      await recurringTransactionService.toggleActive(id, isActive);
      await fetchRecurringTransactions();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to toggle recurring transaction';
      setError(message);
      throw new Error(message);
    }
  };

  return {
    recurringTransactions,
    loading,
    error,
    addRecurringTransaction,
    updateRecurringTransaction,
    deleteRecurringTransaction,
    toggleActive,
    refreshRecurringTransactions: fetchRecurringTransactions,
  };
};
