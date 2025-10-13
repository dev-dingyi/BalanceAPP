import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuthStore } from '../stores/authStore';
import { useSettingsStore } from '../stores/settingsStore';
import type { Currency } from '../types';

export const useSettings = () => {
  const { user } = useAuthStore();
  const {
    preferredCurrency,
    language,
    stealthMode,
    setPreferredCurrency,
    setLanguage,
    setStealthMode,
  } = useSettingsStore();

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Load settings from Firestore on mount
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, 'userSettings', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          // Update local store with Firestore data
          if (data.preferredCurrency) {
            setPreferredCurrency(data.preferredCurrency);
          }
          if (data.language) {
            setLanguage(data.language);
          }
          if (data.stealthMode !== undefined) {
            // Note: stealthMode structure might be complex, for now just sync enabled flag
            setStealthMode(data.stealthMode?.enabled || false);
          }
        } else {
          // No settings in Firestore, create with current local settings
          await syncToFirestore();
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  // Sync local settings to Firestore
  const syncToFirestore = async () => {
    if (!user) return;

    setSyncing(true);
    try {
      const docRef = doc(db, 'userSettings', user.uid);
      await setDoc(docRef, {
        userId: user.uid,
        preferredCurrency,
        language,
        stealthMode: {
          enabled: stealthMode,
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
            frequency: 0,
            amountRange: { min: 0, max: 0 },
          },
        },
        updatedAt: new Date(),
      }, { merge: true });
    } catch (error) {
      console.error('Error syncing settings:', error);
      throw error;
    } finally {
      setSyncing(false);
    }
  };

  // Update a specific setting and sync
  const updateSetting = async (key: string, value: any) => {
    if (!user) return;

    // Update local store first for immediate UI feedback
    switch (key) {
      case 'preferredCurrency':
        setPreferredCurrency(value as Currency);
        break;
      case 'language':
        setLanguage(value as 'en' | 'zh');
        break;
      case 'stealthMode':
        setStealthMode(value);
        break;
    }

    // Then sync to Firestore
    await syncToFirestore();
  };

  return {
    loading,
    syncing,
    preferredCurrency,
    language,
    stealthMode,
    updateSetting,
    syncToFirestore,
  };
};
