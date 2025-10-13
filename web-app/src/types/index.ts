import { Timestamp } from 'firebase/firestore';

// Currency types
export type Currency = 'USD' | 'CNY';

// Transaction types
export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  currency: Currency;
  date: Date;
  time: string;
  location?: string;
  description: string;
  categoryId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface TransactionInput {
  amount: number;
  currency: Currency;
  date: Date;
  time: string;
  location?: string;
  description: string;
  categoryId: string;
}

// Category types
export interface Category {
  id: string;
  userId: string;
  name: string;
  nameEn: string;
  nameCn: string;
  icon?: string;
  color?: string;
  isDefault?: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CategoryInput {
  name: string;
  nameEn: string;
  nameCn: string;
  icon?: string;
  color?: string;
}

// Budget types
export type BudgetType = 'monthly' | 'custom' | 'recurring';

export interface Budget {
  id: string;
  userId: string;
  name: string;
  nameEn: string;
  nameCn: string;
  type: BudgetType;
  amount: number;
  currency: Currency;
  categories: string[]; // Category IDs
  startDate: Date;
  endDate: Date;
  recurring?: {
    enabled: boolean;
    dayOfMonth?: number; // e.g., 15 for payday cycle
    cycleLength?: number; // days
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface BudgetInput {
  name: string;
  nameEn: string;
  nameCn: string;
  type: BudgetType;
  amount: number;
  currency: Currency;
  categories: string[];
  startDate: Date;
  endDate: Date;
  recurring?: {
    enabled: boolean;
    dayOfMonth?: number;
    cycleLength?: number;
  };
}

// User settings types
export interface UserSettings {
  id: string;
  userId: string;
  preferredCurrency: Currency;
  language: 'en' | 'zh';
  stealthMode: {
    enabled: boolean;
    scaling: {
      enabled: boolean;
      percentage: number; // 0-100
    };
    hiddenCategories: {
      enabled: boolean;
      categoryIds: string[];
    };
    noiseInjection: {
      enabled: boolean;
      frequency: number; // number of fake transactions per day
      amountRange: {
        min: number;
        max: number;
      };
    };
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// AI suggestion types
export interface AISuggestion {
  categoryId: string;
  confidence: number; // 0-1
  location?: string;
}

// Exchange rate types
export interface ExchangeRate {
  from: Currency;
  to: Currency;
  rate: number;
  lastUpdated: Date;
}

// Dashboard data types
export interface SpendingByCategory {
  categoryId: string;
  categoryName: string;
  amount: number;
  currency: Currency;
  percentage: number;
}

export interface BudgetProgress {
  budgetId: string;
  budgetName: string;
  spent: number;
  total: number;
  percentage: number;
  currency: Currency;
  daysRemaining: number;
}

export interface SpendingTrend {
  date: string;
  amount: number;
  currency: Currency;
}

// Recurring transaction types
export type RecurringFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';

export interface RecurringTransaction {
  id: string;
  userId: string;
  templateName: string;
  amount: number;
  currency: Currency;
  description: string;
  categoryId: string;
  location?: string;
  frequency: RecurringFrequency;
  startDate: Date;
  endDate?: Date; // Optional end date
  lastCreated?: Date; // Last time a transaction was created
  nextDue: Date; // Next scheduled creation date
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface RecurringTransactionInput {
  templateName: string;
  amount: number;
  currency: Currency;
  description: string;
  categoryId: string;
  location?: string;
  frequency: RecurringFrequency;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
}
