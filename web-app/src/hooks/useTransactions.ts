import { useState, useEffect } from 'react';
import { transactionService } from '../utils/firestore';
import { useAuthStore } from '../stores/authStore';
import type { Transaction, TransactionInput } from '../types';

export const useTransactions = (limitCount?: number, categoryId?: string) => {
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const data = await transactionService.getByUserId(user.uid, limitCount, categoryId);
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, limitCount, categoryId]);

  const addTransaction = async (data: TransactionInput) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const id = await transactionService.create(user.uid, data);
      await fetchTransactions(); // Refresh list
      return id;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add transaction';
      setError(message);
      throw new Error(message);
    }
  };

  const updateTransaction = async (id: string, data: Partial<TransactionInput>) => {
    try {
      await transactionService.update(id, data);
      await fetchTransactions(); // Refresh list
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update transaction';
      setError(message);
      throw new Error(message);
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await transactionService.delete(id);
      await fetchTransactions(); // Refresh list
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete transaction';
      setError(message);
      throw new Error(message);
    }
  };

  return {
    transactions,
    loading,
    error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refreshTransactions: fetchTransactions,
  };
};
