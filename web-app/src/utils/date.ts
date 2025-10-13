import { format, startOfMonth, endOfMonth, subMonths, isWithinInterval } from 'date-fns';

// Format date for display
export const formatDate = (date: Date, formatStr: string = 'MMM dd, yyyy'): string => {
  return format(date, formatStr);
};

// Format date for input fields (YYYY-MM-DD)
export const formatDateForInput = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

// Format time for input fields (HH:mm)
export const formatTimeForInput = (date: Date): string => {
  return format(date, 'HH:mm');
};

// Get current month date range
export const getCurrentMonthRange = (): { start: Date; end: Date } => {
  const now = new Date();
  return {
    start: startOfMonth(now),
    end: endOfMonth(now),
  };
};

// Get previous month date range
export const getPreviousMonthRange = (): { start: Date; end: Date } => {
  const lastMonth = subMonths(new Date(), 1);
  return {
    start: startOfMonth(lastMonth),
    end: endOfMonth(lastMonth),
  };
};

// Check if date is in current month
export const isCurrentMonth = (date: Date): boolean => {
  const { start, end } = getCurrentMonthRange();
  return isWithinInterval(date, { start, end });
};

// Get custom date range
export const getCustomRange = (startDate: Date, endDate: Date) => {
  return { start: startDate, end: endDate };
};

// Get days remaining in period
export const getDaysRemaining = (endDate: Date): number => {
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};
