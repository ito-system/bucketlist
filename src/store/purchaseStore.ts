import { create } from 'zustand';
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import { purchaseService } from '@/features/upgrade/services/purchaseService';
import type { PurchasesPackage, CustomerInfo } from 'react-native-purchases';

type PurchaseState = {
  isInitialized: boolean;
  isPremium: boolean;
  isLoading: boolean;
  /** RevenueCat を初期化し購入状態を同期する */
  initialize: (userId: string) => Promise<void>;
  /** パッケージを購入して Firestore の planType を更新する */
  purchasePackage: (pkg: PurchasesPackage) => Promise<void>;
  /** 以前の購入を復元する */
  restorePurchases: () => Promise<void>;
};

/** Firestore の planType を更新してストア側の user を再フェッチする */
async function syncPlanToFirestore(userId: string, customerInfo: CustomerInfo) {
  const isPremium = purchaseService.isPremium(customerInfo);
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    planType: isPremium ? 'premium' : 'free',
    updatedAt: serverTimestamp(),
  });
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    useAuthStore.setState({ user: snap.data() as any });
  }
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
      const userId = useAuthStore.getState().user?.uid;
      if (!userId) throw new Error('ログインが必要です');
      const customerInfo = await purchaseService.purchasePackage(pkg);
      const isPremium = purchaseService.isPremium(customerInfo);
      set({ isPremium });
      await syncPlanToFirestore(userId, customerInfo);
    } finally {
      set({ isLoading: false });
    }
  },

  restorePurchases: async () => {
    set({ isLoading: true });
    try {
      const userId = useAuthStore.getState().user?.uid;
      if (!userId) throw new Error('ログインが必要です');
      const customerInfo = await purchaseService.restorePurchases();
      const isPremium = purchaseService.isPremium(customerInfo);
      set({ isPremium });
      await syncPlanToFirestore(userId, customerInfo);
    } finally {
      set({ isLoading: false });
    }
  },
}));
