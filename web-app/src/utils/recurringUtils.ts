import type { RecurringTransaction, RecurringFrequency, TransactionInput } from '../types';
import { transactionService, recurringTransactionService } from './firestore';

/**
 * Calculate the next due date based on frequency
 */
export const calculateNextDue = (currentDate: Date, frequency: RecurringFrequency): Date => {
  const next = new Date(currentDate);

  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'biweekly':
      next.setDate(next.getDate() + 14);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'quarterly':
      next.setMonth(next.getMonth() + 3);
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1);
      break;
  }

  return next;
};

/**
 * Check if a recurring transaction is due
 */
export const isRecurringDue = (recurring: RecurringTransaction): boolean => {
  const now = new Date();
  const nextDue = new Date(recurring.nextDue);

  // Check if it's active and due date has passed
  if (!recurring.isActive) return false;

  // Check if end date has passed
  if (recurring.endDate) {
    const endDate = new Date(recurring.endDate);
    if (now > endDate) return false;
  }

  return now >= nextDue;
};

/**
 * Create a transaction from a recurring template
 */
export const createTransactionFromRecurring = async (
  recurring: RecurringTransaction,
  userId: string
): Promise<string> => {
  const now = new Date();

  const transactionData: TransactionInput = {
    amount: recurring.amount,
    currency: recurring.currency,
    description: recurring.description,
    categoryId: recurring.categoryId,
    location: recurring.location,
    date: now,
    time: now.toTimeString().slice(0, 5),
  };

  // Create the transaction
  const transactionId = await transactionService.create(userId, transactionData);

  // Update the recurring transaction's next due date
  const nextDue = calculateNextDue(now, recurring.frequency);
  await recurringTransactionService.updateNextDue(recurring.id, nextDue, now);

  return transactionId;
};

/**
 * Process all due recurring transactions for a user
 */
export const processDueRecurringTransactions = async (
  recurringTransactions: RecurringTransaction[],
  userId: string
): Promise<{ created: number; ids: string[] }> => {
  const dueTransactions = recurringTransactions.filter(isRecurringDue);

  const createdIds: string[] = [];

  for (const recurring of dueTransactions) {
    try {
      const id = await createTransactionFromRecurring(recurring, userId);
      createdIds.push(id);
    } catch (error) {
      console.error(`Failed to create transaction from recurring ${recurring.id}:`, error);
    }
  }

  return {
    created: createdIds.length,
    ids: createdIds,
  };
};

/**
 * Get frequency display text
 */
export const getFrequencyDisplay = (frequency: RecurringFrequency, t: (key: string) => string): string => {
  const key = `recurring.frequency_${frequency}`;
  return t(key);
};

/**
 * Format next due date display
 */
export const formatNextDue = (date: Date): string => {
  const now = new Date();
  const nextDue = new Date(date);
  const diffTime = nextDue.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'Overdue';
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 7) return `In ${diffDays} days`;
  if (diffDays < 30) return `In ${Math.floor(diffDays / 7)} weeks`;
  if (diffDays < 365) return `In ${Math.floor(diffDays / 30)} months`;
  return `In ${Math.floor(diffDays / 365)} years`;
};
