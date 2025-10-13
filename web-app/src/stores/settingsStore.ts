import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Currency } from '../types';

interface StealthModeConfig {
  enabled: boolean;
  scaling: {
    enabled: boolean;
    percentage: number; // 0-100 (percentage to show, e.g., 50 = show 50% of actual)
  };
  hiddenCategories: {
    enabled: boolean;
    categoryIds: string[];
  };
  noiseInjection: {
    enabled: boolean;
    frequency: number; // transactions per day
    amountRange: {
      min: number;
      max: number;
    };
  };
}

interface SettingsState {
  preferredCurrency: Currency;
  language: 'en' | 'zh';
  stealthMode: StealthModeConfig;
  setPreferredCurrency: (currency: Currency) => void;
  setLanguage: (language: 'en' | 'zh') => void;
  setStealthMode: (config: Partial<StealthModeConfig>) => void;
  toggleStealthMode: () => void;
}

const defaultStealthConfig: StealthModeConfig = {
  enabled: false,
  scaling: {
    enabled: false,
    percentage: 50,
  },
  hiddenCategories: {
    enabled: false,
    categoryIds: [],
  },
  noiseInjection: {
    enabled: false,
    frequency: 2,
    amountRange: {
      min: 5,
      max: 50,
    },
  },
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      preferredCurrency: 'USD',
      language: 'en',
      stealthMode: defaultStealthConfig,
      setPreferredCurrency: (currency) => set({ preferredCurrency: currency }),
      setLanguage: (language) => set({ language }),
      setStealthMode: (config) => set((state) => ({
        stealthMode: { ...state.stealthMode, ...config },
      })),
      toggleStealthMode: () => set((state) => ({
        stealthMode: { ...state.stealthMode, enabled: !state.stealthMode.enabled },
      })),
    }),
    {
      name: 'balance-settings',
      version: 2, // Increment version to force migration
      migrate: (persistedState: any, version: number) => {
        // Migrate from old boolean stealthMode to new object structure
        if (version === 0 || version === 1) {
          const oldStealthMode = persistedState.stealthMode;

          // If stealthMode is a boolean (old format), convert it
          if (typeof oldStealthMode === 'boolean') {
            return {
              ...persistedState,
              stealthMode: {
                ...defaultStealthConfig,
                enabled: oldStealthMode,
              },
            };
          }

          // If stealthMode is missing or malformed, use default
          if (!oldStealthMode || typeof oldStealthMode !== 'object') {
            return {
              ...persistedState,
              stealthMode: defaultStealthConfig,
            };
          }
        }

        return persistedState;
      },
    }
  )
);
