import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type {
  Transaction,
  TransactionInput,
  Category,
  CategoryInput,
  Budget,
  BudgetInput,
  UserSettings,
  RecurringTransaction,
  RecurringTransactionInput,
} from '../types';

// Collection names
const COLLECTIONS = {
  TRANSACTIONS: 'transactions',
  CATEGORIES: 'categories',
  BUDGETS: 'budgets',
  USER_SETTINGS: 'userSettings',
  RECURRING_TRANSACTIONS: 'recurringTransactions',
};

// Transaction operations
export const transactionService = {
  async create(userId: string, data: TransactionInput): Promise<string> {
    const transactionData = {
      ...data,
      userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    const docRef = await addDoc(collection(db, COLLECTIONS.TRANSACTIONS), transactionData);
    return docRef.id;
  },

  async update(transactionId: string, data: Partial<TransactionInput>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.TRANSACTIONS, transactionId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  async delete(transactionId: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.TRANSACTIONS, transactionId);
    await deleteDoc(docRef);
  },

  async getById(transactionId: string): Promise<Transaction | null> {
    const docRef = doc(db, COLLECTIONS.TRANSACTIONS, transactionId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        date: docSnap.data().date.toDate(),
      } as Transaction;
    }
    return null;
  },

  async getByUserId(
    userId: string,
    limitCount?: number,
    categoryId?: string
  ): Promise<Transaction[]> {
    const constraints: QueryConstraint[] = [
      where('userId', '==', userId),
      orderBy('date', 'desc'),
    ];

    if (categoryId) {
      constraints.push(where('categoryId', '==', categoryId));
    }

    if (limitCount) {
      constraints.push(limit(limitCount));
    }

    const q = query(collection(db, COLLECTIONS.TRANSACTIONS), ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate(),
    })) as Transaction[];
  },

  async getByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Transaction[]> {
    const q = query(
      collection(db, COLLECTIONS.TRANSACTIONS),
      where('userId', '==', userId),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate(),
    })) as Transaction[];
  },
};

// Category operations
export const categoryService = {
  async create(userId: string, data: CategoryInput): Promise<string> {
    const categoryData = {
      ...data,
      userId,
      isDefault: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    const docRef = await addDoc(collection(db, COLLECTIONS.CATEGORIES), categoryData);
    return docRef.id;
  },

  async update(categoryId: string, data: Partial<CategoryInput>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.CATEGORIES, categoryId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  async delete(categoryId: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.CATEGORIES, categoryId);
    await deleteDoc(docRef);
  },

  async getById(categoryId: string): Promise<Category | null> {
    const docRef = doc(db, COLLECTIONS.CATEGORIES, categoryId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Category;
    }
    return null;
  },

  async getByUserId(userId: string): Promise<Category[]> {
    const q = query(
      collection(db, COLLECTIONS.CATEGORIES),
      where('userId', '==', userId),
      orderBy('name', 'asc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Category[];
  },

  async initializeDefaultCategories(userId: string): Promise<void> {
    const defaultCategories: CategoryInput[] = [
      { name: 'Food & Dining', nameEn: 'Food & Dining', nameCn: '餐饮', icon: '🍽️', color: '#FF6B6B' },
      { name: 'Transportation', nameEn: 'Transportation', nameCn: '交通', icon: '🚗', color: '#4ECDC4' },
      { name: 'Shopping', nameEn: 'Shopping', nameCn: '购物', icon: '🛍️', color: '#FFE66D' },
      { name: 'Entertainment', nameEn: 'Entertainment', nameCn: '娱乐', icon: '🎬', color: '#A8E6CF' },
      { name: 'Bills & Utilities', nameEn: 'Bills & Utilities', nameCn: '账单', icon: '💡', color: '#FF8B94' },
      { name: 'Healthcare', nameEn: 'Healthcare', nameCn: '医疗', icon: '🏥', color: '#B4A7D6' },
      { name: 'Education', nameEn: 'Education', nameCn: '教育', icon: '📚', color: '#95E1D3' },
      { name: 'Other', nameEn: 'Other', nameCn: '其他', icon: '📦', color: '#CCCCCC' },
    ];

    const promises = defaultCategories.map((category) => {
      const categoryData = {
        ...category,
        userId,
        isDefault: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      return addDoc(collection(db, COLLECTIONS.CATEGORIES), categoryData);
    });

    await Promise.all(promises);
  },
};

// Budget operations
export const budgetService = {
  async create(userId: string, data: BudgetInput): Promise<string> {
    const budgetData = {
      ...data,
      userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    const docRef = await addDoc(collection(db, COLLECTIONS.BUDGETS), budgetData);
    return docRef.id;
  },

  async update(budgetId: string, data: Partial<BudgetInput>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.BUDGETS, budgetId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  async delete(budgetId: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.BUDGETS, budgetId);
    await deleteDoc(docRef);
  },

  async getByUserId(userId: string): Promise<Budget[]> {
    const q = query(
      collection(db, COLLECTIONS.BUDGETS),
      where('userId', '==', userId),
      orderBy('startDate', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate.toDate(),
      endDate: doc.data().endDate.toDate(),
    })) as Budget[];
  },
};

// User settings operations
export const userSettingsService = {
  async get(userId: string): Promise<UserSettings | null> {
    const docRef = doc(db, COLLECTIONS.USER_SETTINGS, userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as UserSettings;
    }
    return null;
  },

  async create(userId: string, settings: Partial<UserSettings>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.USER_SETTINGS, userId);
    const defaultSettings: Partial<UserSettings> = {
      userId,
      preferredCurrency: 'USD',
      language: 'en',
      stealthMode: {
        enabled: false,
        scaling: { enabled: false, percentage: 50 },
        hiddenCategories: { enabled: false, categoryIds: [] },
        noiseInjection: {
          enabled: false,
          frequency: 0,
          amountRange: { min: 0, max: 0 },
        },
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      ...settings,
    };
    await updateDoc(docRef, defaultSettings);
  },

  async update(userId: string, settings: Partial<UserSettings>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.USER_SETTINGS, userId);
    await updateDoc(docRef, {
      ...settings,
      updatedAt: Timestamp.now(),
    });
  },
};

// Recurring transaction operations
export const recurringTransactionService = {
  async create(userId: string, data: RecurringTransactionInput): Promise<string> {
    const recurringData = {
      ...data,
      userId,
      nextDue: data.startDate,
      lastCreated: null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    const docRef = await addDoc(collection(db, COLLECTIONS.RECURRING_TRANSACTIONS), recurringData);
    return docRef.id;
  },

  async update(id: string, data: Partial<RecurringTransactionInput>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.RECURRING_TRANSACTIONS, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.RECURRING_TRANSACTIONS, id);
    await deleteDoc(docRef);
  },

  async getByUserId(userId: string): Promise<RecurringTransaction[]> {
    const q = query(
      collection(db, COLLECTIONS.RECURRING_TRANSACTIONS),
      where('userId', '==', userId),
      orderBy('nextDue', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as RecurringTransaction[];
  },

  async getById(id: string): Promise<RecurringTransaction | null> {
    const docRef = doc(db, COLLECTIONS.RECURRING_TRANSACTIONS, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as RecurringTransaction;
    }
    return null;
  },

  async toggleActive(id: string, isActive: boolean): Promise<void> {
    const docRef = doc(db, COLLECTIONS.RECURRING_TRANSACTIONS, id);
    await updateDoc(docRef, {
      isActive,
      updatedAt: Timestamp.now(),
    });
  },

  async updateNextDue(id: string, nextDue: Date, lastCreated: Date): Promise<void> {
    const docRef = doc(db, COLLECTIONS.RECURRING_TRANSACTIONS, id);
    await updateDoc(docRef, {
      nextDue,
      lastCreated,
      updatedAt: Timestamp.now(),
    });
  },
};
