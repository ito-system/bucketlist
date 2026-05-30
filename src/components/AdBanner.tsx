import { Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { useAuthStore } from '@/store/authStore';

/**
 * フリープランのユーザーにのみ表示するバナー広告。
 * 本番用の Ad Unit ID は環境変数で管理してください。
 */
const ADS_DISABLED = process.env.EXPO_PUBLIC_ADS_DISABLED === 'true';

const AD_UNIT_ID = __DEV__
  ? TestIds.BANNER
  : Platform.select({
      ios: process.env.EXPO_PUBLIC_ADMOB_IOS_BANNER_ID ?? TestIds.BANNER,
      android: process.env.EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID ?? TestIds.BANNER,
    }) ?? TestIds.BANNER;

export function AdBanner() {
  const { user } = useAuthStore();

  if (!user || user.planType === 'premium' || ADS_DISABLED) return null;

  return (
    <BannerAd
      unitId={AD_UNIT_ID}
      size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      requestOptions={{ requestNonPersonalizedAdsOnly: true }}
    />
  );
}
