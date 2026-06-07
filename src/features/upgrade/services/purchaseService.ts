import Purchases, {
  type PurchasesOffering,
  type PurchasesPackage,
  type CustomerInfo,
} from 'react-native-purchases';
import { Platform } from 'react-native';

/** RevenueCat API キー */
const REVENUECAT_API_KEY = Platform.select({
  ios: "appl_kTTGLxMpMzABXfulOEKJhjMREfC",     // ← RevenueCat iOS Public API Key
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY ?? '', // ← RevenueCat Android Public API Key
}) ?? '';

/** RevenueCat で設定したエンタイトルメント ID */
export const ENTITLEMENT_ID = 'premium';

/** API Key が本番用に設定済みかどうか */
const isConfigured =
  !REVENUECAT_API_KEY.includes('XXXX') && REVENUECAT_API_KEY.length > 0;

export const purchaseService = {
  /**
   * RevenueCat を初期化する。ユーザーログイン後に一度だけ呼ぶこと。
   * API Key が未設定の場合（開発中）は何もしない。
   */
  async initialize(userId: string): Promise<void> {
    if (!isConfigured) return;
    Purchases.configure({ apiKey: REVENUECAT_API_KEY, appUserID: userId });
  },

  /** 現在有効なオファリング（商品一覧）を取得する */
  async getOfferings(): Promise<PurchasesOffering | null> {
    if (!isConfigured) return null;
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  },

  /** パッケージを購入する */
  async purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo> {
    if (!isConfigured) throw new Error('RevenueCat が未設定です');
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return customerInfo;
  },

  /** 以前の購入を復元する（アプリ再インストール後など） */
  async restorePurchases(): Promise<CustomerInfo> {
    if (!isConfigured) throw new Error('RevenueCat が未設定です');
    return Purchases.restorePurchases();
  },

  /** 現在の購入情報を取得する */
  async getCustomerInfo(): Promise<CustomerInfo | null> {
    if (!isConfigured) return null;
    return Purchases.getCustomerInfo();
  },

  /** プレミアムエンタイトルメントが有効か判定する */
  isPremium(customerInfo: CustomerInfo | null): boolean {
    if (!customerInfo) return false;
    return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
  },
};
