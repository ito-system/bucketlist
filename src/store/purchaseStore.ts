import { create } from 'zustand';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuthStore } from '@/store/authStore';
import { purchaseService } from '@/features/upgrade/services/purchaseService';
import type { PurchasesPackage } from 'react-native-purchases';

type PurchaseState = {
  isInitialized: boolean;
  isPremium: boolean;
  isLoading: boolean;
  /** RevenueCat を初期化し購入状態を同期する */
  initialize: (userId: string) => Promise<void>;
  /** パッケージを購入して Cloud Functions 経由で planType を更新する */
  purchasePackage: (pkg: PurchasesPackage) => Promise<void>;
  /** 以前の購入を復元する */
  restorePurchases: () => Promise<void>;
};

/**
 * Cloud Functions の syncPremiumStatus を呼び出して planType を更新する。
 * Admin SDK で更新するため Firestore Rules の planType 制限を安全に迂回できる。
 */
async function syncPlanViaCloudFunction(): Promise<void> {
  const functions = getFunctions();
  const syncPremiumStatus = httpsCallable(functions, 'syncPremiumStatus');
  await syncPremiumStatus({});
  // Cloud Functions 側で Firestore を更新したので、ローカル状態を再取得する
  await useAuthStore.getState().refreshUser();
}

export const usePurchaseStore = create<PurchaseState>((set) => ({
  isInitialized: false,
  isPremium: false,
  isLoading: false,

  initialize: async (userId) => {
    try {
      await purchaseService.initialize(userId);
      const customerInfo = await purchaseService.getCustomerInfo();
      const isPremium = purchaseService.isPremium(customerInfo);
      set({ isInitialized: true, isPremium });
    } catch {
      // 開発環境など RevenueCat 未設定時は無視
      set({ isInitialized: true });
    }
  },

  purchasePackage: async (pkg) => {
    set({ isLoading: true });
    try {
      const customerInfo = await purchaseService.purchasePackage(pkg);
      const isPremium = purchaseService.isPremium(customerInfo);
      set({ isPremium });
      // Cloud Functions 経由で Firestore の planType を更新（失敗しても購入は成功扱い）
      syncPlanViaCloudFunction().catch(() => {
        useAuthStore.getState().refreshUser().catch(() => {});
      });
    } finally {
      set({ isLoading: false });
    }
  },

  restorePurchases: async () => {
    set({ isLoading: true });
    try {
      const customerInfo = await purchaseService.restorePurchases();
      const isPremium = purchaseService.isPremium(customerInfo);
      set({ isPremium });
      // Cloud Functions 経由で Firestore の planType を更新（失敗しても復元は成功扱い）
      syncPlanViaCloudFunction().catch(() => {
        useAuthStore.getState().refreshUser().catch(() => {});
      });
    } finally {
      set({ isLoading: false });
    }
  },
}));
