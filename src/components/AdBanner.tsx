import { Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { useAuthStore } from '@/store/authStore';

/**
 * フリープランのユーザーにのみ表示するバナー広告。
 * 本番用の Ad Unit ID は環境変数で管理してください。
 */
const AD_UNIT_ID = __DEV__
  ? TestIds.BANNER
  : Platform.select({
      ios: "ca-app-pub-1357523946741675/1097510151",
      android: process.env.EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID ?? TestIds.BANNER,
    }) ?? TestIds.BANNER;

export function AdBanner() {
  const { user } = useAuthStore();

  if (!user || user.planType === 'premium') return null;

  return (
    <BannerAd
      unitId={AD_UNIT_ID}
      size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      requestOptions={{ requestNonPersonalizedAdsOnly: true }}
    />
  );
}
