import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Crown, Check, RotateCcw } from 'lucide-react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import type { MainStackParamList } from '@/navigation/MainNavigator';
import { usePurchaseStore } from '@/store/purchaseStore';
import type { PurchasesPackage } from 'react-native-purchases';

type Props = StackScreenProps<MainStackParamList, 'Upgrade'>;

const BENEFITS = [
  'リスト作成数が無制限',
  'リストあたりのメンバーが最大10人',
  'タグ作成数が無制限',
  '広告が非表示',
];

export function UpgradeScreen({ navigation }: Props) {
  const { purchasePackage, restorePurchases, isLoading } = usePurchaseStore();
  const [offerings, setOfferings] = useState<{
    monthly: PurchasesPackage | null;
    annual: PurchasesPackage | null;
    forever: PurchasesPackage | null;
  }>({ monthly: null, annual: null, forever: null });
  const [isLoadingOfferings, setIsLoadingOfferings] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { purchaseService } = await import(
          '@/features/upgrade/services/purchaseService'
        );
        const offering = await purchaseService.getOfferings();
        if (offering) {
          setOfferings({
            monthly: offering.monthly ?? null,
            annual: offering.annual ?? null,
            forever: offering.availablePackages?.find(p => p.identifier === 'forever') ?? null,
          });
        }
      } catch {
        // オファリング取得失敗は無視（ネイティブビルドが必要）
      } finally {
        setIsLoadingOfferings(false);
      }
    })();
  }, []);

  const handlePurchase = async (pkg: PurchasesPackage) => {
    try {
      await purchasePackage(pkg);
      Alert.alert('アップグレード完了！', 'プレミアムプランにアップグレードしました。', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      if (e?.userCancelled) return;
      Alert.alert('購入エラー', e.message ?? '購入に失敗しました。');
    }
  };

  const handleRestore = async () => {
    try {
      await restorePurchases();
      Alert.alert('復元完了', '購入情報を復元しました。', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('復元エラー', e.message ?? '復元に失敗しました。');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-amber-50">
      {/* ヘッダー */}
      <View className="flex-row items-center px-4 pt-2 pb-3">
        <TouchableOpacity
          className="w-9 h-9 items-center justify-center"
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={22} color="#111827" />
        </TouchableOpacity>
        <Text className="flex-1 text-lg font-bold text-amber-900 text-center mr-9">
          プレミアムにアップグレード
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        {/* ヒーローエリア */}
        <View className="items-center py-8">
          <View className="w-20 h-20 rounded-full bg-amber-100 items-center justify-center mb-4">
            <Crown size={40} color="#F59E0B" />
          </View>
          <Text className="text-2xl font-bold text-amber-900 mb-2">
            プレミアムプラン
          </Text>
          <Text className="text-sm text-amber-600 text-center">
            制限なしで夢ノートを楽しもう
          </Text>
        </View>

        {/* 特典リスト */}
        <View className="bg-white rounded-2xl p-5 mb-6">
          <Text className="text-base font-semibold text-amber-900 mb-4">
            プレミアムの特典
          </Text>
          {BENEFITS.map((benefit) => (
            <View key={benefit} className="flex-row items-center gap-x-3 mb-3">
              <View className="w-6 h-6 rounded-full bg-green-100 items-center justify-center">
                <Check size={14} color="#10B981" />
              </View>
              <Text className="text-sm text-amber-900">{benefit}</Text>
            </View>
          ))}
        </View>

        {/* 購入ボタン */}
        {isLoadingOfferings ? (
          <ActivityIndicator size="large" color="#F59E0B" />
        ) : (
          <View className="gap-y-3">
            {offerings.monthly && (
              <PurchaseButton
                pkg={offerings.monthly}
                title="月額プラン"
                badge="いつでもキャンセル可"
                suffix="/ 月"
                onPress={() => handlePurchase(offerings.monthly!)}
                isLoading={isLoading}
                primary
              />
            )}
            {offerings.annual && (
              <PurchaseButton
                pkg={offerings.annual}
                title="年間プラン"
                badge="月額より割安"
                suffix="/ 年"
                savingsBase={offerings.monthly?.product.price}
                onPress={() => handlePurchase(offerings.annual!)}
                isLoading={isLoading}
                primary={false}
              />
            )}
            {offerings.forever && (
              <PurchaseButton
                pkg={offerings.forever}
                title="買い切りプラン"
                badge="一度の購入で永久利用"
                onPress={() => handlePurchase(offerings.forever!)}
                isLoading={isLoading}
                primary={false}
              />
            )}
            {!offerings.monthly && !offerings.annual && !offerings.forever && (
              <View className="bg-amber-50 rounded-xl p-4">
                <Text className="text-sm text-amber-700 text-center">
                  現在、購入プランを読み込めませんでした。{'\n'}
                  ネイティブビルドが必要です（Expo Go 非対応）。
                </Text>
              </View>
            )}
          </View>
        )}

        {/* 購入を復元 */}
        <TouchableOpacity
          className="flex-row items-center justify-center gap-x-2 mt-5 py-3"
          onPress={handleRestore}
          disabled={isLoading}
        >
          <RotateCcw size={14} color="#D97706" />
          <Text className="text-sm text-amber-600">以前の購入を復元する</Text>
        </TouchableOpacity>

        <Text className="text-xs text-amber-600 text-center mt-2 leading-5">
          お支払いは iTunes アカウントに請求されます。{'\n'}
          サブスクリプションは現在の期間終了の24時間前までに{'\n'}
          キャンセルしない限り自動更新されます。
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function PurchaseButton({
  pkg,
  title,
  badge,
  suffix,
  savingsBase,
  onPress,
  isLoading,
  primary,
}: {
  pkg: PurchasesPackage;
  title: string;
  badge: string;
  suffix?: string;
  /** 月額price を渡すと年間プランの節約額バッジを表示する */
  savingsBase?: number;
  onPress: () => void;
  isLoading: boolean;
  primary: boolean;
}) {
  const savings = savingsBase != null
    ? Math.round(savingsBase * 12 - pkg.product.price)
    : 0;
  const savingsText = savings > 0 ? `¥${savings.toLocaleString()} お得！` : null;

  return (
    <TouchableOpacity
      className={`rounded-2xl p-5 ${primary ? 'bg-primary' : 'bg-white border border-amber-200'}`}
      onPress={onPress}
      disabled={isLoading}
      activeOpacity={0.8}
    >
      <View className="flex-row items-center justify-between">
        <View>
          <View className="flex-row items-center gap-x-2">
            <Text className={`text-base font-bold ${primary ? 'text-white' : 'text-amber-900'}`}>
              {title}
            </Text>
            {savingsText && (
              <View className="bg-amber-100 rounded-full px-2 py-0.5">
                <Text className="text-amber-700 text-xs font-semibold">{savingsText}</Text>
              </View>
            )}
          </View>
          <Text className={`text-xs mt-0.5 ${primary ? 'text-amber-200' : 'text-amber-600'}`}>
            {badge}
          </Text>
        </View>
        <View className="items-end">
          <Text className={`text-xl font-bold ${primary ? 'text-white' : 'text-amber-900'}`}>
            {pkg.product.priceString}
          </Text>
          {suffix && (
            <Text className={`text-xs ${primary ? 'text-amber-200' : 'text-amber-600'}`}>
              {suffix}
            </Text>
          )}
        </View>
      </View>
      {isLoading && (
        <View className="absolute inset-0 items-center justify-center bg-black/10 rounded-2xl">
          <ActivityIndicator color={primary ? '#fff' : '#F59E0B'} />
        </View>
      )}
    </TouchableOpacity>
  );
}
