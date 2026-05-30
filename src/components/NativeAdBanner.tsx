import { useEffect, useState } from 'react';
import { Image, Platform, Text, TouchableOpacity, View } from 'react-native';
import {
  NativeAd,
  NativeAdView,
  NativeAsset,
  NativeAssetType,
  TestIds,
} from 'react-native-google-mobile-ads';
import { useAuthStore } from '@/store/authStore';

const AD_UNIT_ID = __DEV__
  ? TestIds.NATIVE
  : Platform.select({
      ios: process.env.EXPO_PUBLIC_ADMOB_IOS_NATIVE_ID ?? TestIds.NATIVE,
      android: process.env.EXPO_PUBLIC_ADMOB_ANDROID_NATIVE_ID ?? TestIds.NATIVE,
    }) ?? TestIds.NATIVE;

export function NativeAdBanner() {
  const { user } = useAuthStore();
  const [nativeAd, setNativeAd] = useState<NativeAd | null>(null);

  useEffect(() => {
    if (!user || user.planType === 'premium') return;

    let ad: NativeAd | null = null;

    NativeAd.createForAdRequest(AD_UNIT_ID, {
      requestNonPersonalizedAdsOnly: true,
    })
      .then((loadedAd) => {
        ad = loadedAd;
        setNativeAd(loadedAd);
      })
      .catch(() => {
        // ロード失敗時は何も表示しない
      });

    return () => {
      ad?.destroy();
    };
  }, [user]);

  if (!user || user.planType === 'premium' || !nativeAd) return null;

  return (
    <NativeAdView nativeAd={nativeAd}>
      <View
        style={{
          backgroundColor: '#fff',
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderTopWidth: 1,
          borderTopColor: '#e5e5ea',
        }}
      >
        {/* ヘッダー: アイコン + 広告ラベル/headline + CTAボタン */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          {nativeAd.icon ? (
            <NativeAsset assetType={NativeAssetType.ICON}>
              <Image
                source={{ uri: nativeAd.icon.url }}
                style={{ width: 32, height: 32, borderRadius: 6 }}
              />
            </NativeAsset>
          ) : null}
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 10, color: '#8e8e93' }}>
              {'広告' + (nativeAd.advertiser ? ` · ${nativeAd.advertiser}` : '')}
            </Text>
            <NativeAsset assetType={NativeAssetType.HEADLINE}>
              <Text
                style={{ fontSize: 13, fontWeight: '600', color: '#1c1c1e' }}
                numberOfLines={1}
              >
                {nativeAd.headline}
              </Text>
            </NativeAsset>
          </View>
          <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
            <TouchableOpacity
              style={{
                backgroundColor: '#4a90e2',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 14,
              }}
            >
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}>
                {nativeAd.callToAction}
              </Text>
            </TouchableOpacity>
          </NativeAsset>
        </View>
        {/* body */}
        <NativeAsset assetType={NativeAssetType.BODY}>
          <Text style={{ fontSize: 11, color: '#555', lineHeight: 16 }} numberOfLines={2}>
            {nativeAd.body}
          </Text>
        </NativeAsset>
      </View>
    </NativeAdView>
  );
}
