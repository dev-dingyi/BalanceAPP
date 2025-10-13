import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Currency } from '../types';

interface SettingsState {
  preferredCurrency: Currency;
  language: 'en' | 'zh';
  stealthMode: boolean;
  setPreferredCurrency: (currency: Currency) => void;
  setLanguage: (language: 'en' | 'zh') => void;
  setStealthMode: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      preferredCurrency: 'USD',
      language: 'en',
      stealthMode: false,
      setPreferredCurrency: (currency) => set({ preferredCurrency: currency }),
      setLanguage: (language) => set({ language }),
      setStealthMode: (enabled) => set({ stealthMode: enabled }),
    }),
    {
      name: 'balance-settings',
    }
  )
);
