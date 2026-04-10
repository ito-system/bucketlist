import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, Crown, Zap } from 'lucide-react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import type { MainStackParamList } from '@/navigation/MainNavigator';
import { useAuthStore } from '@/store/authStore';
import { usePurchaseStore } from '@/store/purchaseStore';
import { PLAN_LIMITS } from '@/types';
import type { PurchasesPackage } from 'react-native-purchases';

type Props = StackScreenProps<MainStackParamList, 'PlanSelect'>;

const PLAN_ROWS: { label: string; free: string; premium: string }[] = [
  {
    label: '作成できるリスト数',
    free: `${PLAN_LIMITS.free.maxLists}件`,
    premium: '無制限',
  },
  {
    label: 'リストあたりのメンバー数',
    free: `最大${PLAN_LIMITS.free.maxMembers}人`,
    premium: `最大${PLAN_LIMITS.premium.maxMembers}人`,
  },
  {
    label: '作成できるタグ数',
    free: `${PLAN_LIMITS.free.maxTags}個`,
    premium: '無制限',
  },
  {
    label: 'バナー広告',
    free: 'あり',
    premium: 'なし',
  },
];

export function PlanSelectScreen({ navigation }: Props) {
  const { clearNewUser } = useAuthStore();
  const { purchasePackage, isLoading } = usePurchaseStore();

  const [monthlyPkg, setMonthlyPkg] = useState<PurchasesPackage | null>(null);
  const [annualPkg, setAnnualPkg] = useState<PurchasesPackage | null>(null);
  const [lifetimePkg, setLifetimePkg] = useState<PurchasesPackage | null>(null);
  const [isLoadingOfferings, setIsLoadingOfferings] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { purchaseService } = await import(
          '@/features/upgrade/services/purchaseService'
        );
        const offering = await purchaseService.getOfferings();
        if (offering) {
          setMonthlyPkg(offering.monthly ?? null);
          setAnnualPkg(offering.annual ?? null);
          setLifetimePkg(offering.lifetime ?? null);
        }
      } catch {
        // RevenueCat 未設定時は無視
      } finally {
        setIsLoadingOfferings(false);
      }
    })();
  }, []);

  const goToHome = () => {
    clearNewUser();
    navigation.replace('Tabs');
  };

  const handlePurchase = async (pkg: PurchasesPackage) => {
    try {
      await purchasePackage(pkg);
      clearNewUser();
      navigation.replace('Tabs');
    } catch (e: any) {
      if (e?.userCancelled) return;
      Alert.alert('購入エラー', e.message ?? '購入に失敗しました。');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-amber-50">
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ヘッダー */}
        <View className="items-center pt-10 pb-8">
          <Text className="text-2xl font-bold text-amber-900 mb-2">
            プランを選択してください
          </Text>
          <Text className="text-sm text-amber-600 text-center">
            あとからプロフィール画面でいつでも変更できます
          </Text>
        </View>

        {/* プラン比較テーブル */}
        <View className="bg-white rounded-2xl overflow-hidden mb-6">
          {/* ヘッダー行 */}
          <View className="flex-row bg-amber-50 border-b border-amber-100">
            <View className="flex-1 p-3" />
            <View className="w-28 items-center p-3 border-l border-amber-100">
              <Text className="text-sm font-semibold text-amber-700">フリー</Text>
            </View>
            <View className="w-28 items-center p-3 border-l border-primary bg-primary/5">
              <View className="flex-row items-center gap-x-1">
                <Crown size={12} color="#F59E0B" />
                <Text className="text-sm font-semibold text-primary">プレミアム</Text>
              </View>
            </View>
          </View>

          {/* 各行 */}
          {PLAN_ROWS.map((row, i) => (
            <View
              key={row.label}
              className={`flex-row ${i < PLAN_ROWS.length - 1 ? 'border-b border-amber-100' : ''}`}
            >
              <View className="flex-1 p-3 justify-center">
                <Text className="text-sm text-amber-900">{row.label}</Text>
              </View>
              <View className="w-28 items-center p-3 border-l border-amber-100 justify-center">
                <Text className="text-sm text-amber-700">{row.free}</Text>
              </View>
              <View className="w-28 items-center p-3 border-l border-primary bg-primary/5 justify-center">
                <Text className="text-sm font-medium text-primary">{row.premium}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* プレミアム購入ボタン */}
        <View className="gap-y-3 mb-4">
          {isLoadingOfferings ? (
            <ActivityIndicator color="#F59E0B" />
          ) : (
            <>
              {/* 月額プラン */}
              <TouchableOpacity
                className="bg-primary rounded-2xl p-5 flex-row items-center justify-between"
                onPress={() => monthlyPkg ? handlePurchase(monthlyPkg) : undefined}
                disabled={isLoading || !monthlyPkg}
                activeOpacity={monthlyPkg ? 0.8 : 1}
              >
                <View className="flex-row items-center gap-x-3">
                  <View className="w-9 h-9 rounded-full bg-white/20 items-center justify-center">
                    <Crown size={18} color="#fff" />
                  </View>
                  <View>
                    <Text className="text-white font-bold text-base">月額プラン</Text>
                    <Text className="text-amber-200 text-xs">いつでもキャンセル可</Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="text-white font-bold text-lg">
                    {monthlyPkg ? monthlyPkg.product.priceString : '¥300'}
                  </Text>
                  <Text className="text-amber-200 text-xs">/ 月</Text>
                </View>
              </TouchableOpacity>

              {/* 年間プラン */}
              {(() => {
                const annualPrice = annualPkg?.product.price ?? 2400;
                const monthlyPrice = monthlyPkg?.product.price ?? 300;
                const savings = Math.round(monthlyPrice * 12 - annualPrice);
                const savingsText = savings > 0
                  ? `¥${savings.toLocaleString()} お得！`
                  : null;
                return (
                  <TouchableOpacity
                    className="bg-white border border-amber-200 rounded-2xl p-5"
                    onPress={() => annualPkg ? handlePurchase(annualPkg) : undefined}
                    disabled={isLoading || !annualPkg}
                    activeOpacity={annualPkg ? 0.8 : 1}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-x-3">
                        <View className="w-9 h-9 rounded-full bg-primary/10 items-center justify-center">
                          <Crown size={18} color="#F59E0B" />
                        </View>
                        <View>
                          <View className="flex-row items-center gap-x-2">
                            <Text className="text-amber-900 font-bold text-base">年間プラン</Text>
                            {savingsText && (
                              <View className="bg-amber-100 rounded-full px-2 py-0.5">
                                <Text className="text-amber-700 text-xs font-semibold">
                                  {savingsText}
                                </Text>
                              </View>
                            )}
                          </View>
                          <Text className="text-amber-600 text-xs">月額より割安</Text>
                        </View>
                      </View>
                      <View className="items-end">
                        <Text className="text-amber-900 font-bold text-lg">
                          {annualPkg ? annualPkg.product.priceString : '¥2,400'}
                        </Text>
                        <Text className="text-amber-600 text-xs">/ 年</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })()}

              {/* 買い切りプラン */}
              <TouchableOpacity
                className="bg-white border border-amber-200 rounded-2xl p-5 flex-row items-center justify-between"
                onPress={() => lifetimePkg ? handlePurchase(lifetimePkg) : undefined}
                disabled={isLoading || !lifetimePkg}
                activeOpacity={lifetimePkg ? 0.8 : 1}
              >
                <View className="flex-row items-center gap-x-3">
                  <View className="w-9 h-9 rounded-full bg-amber-100 items-center justify-center">
                    <Zap size={18} color="#F59E0B" />
                  </View>
                  <View>
                    <Text className="text-amber-900 font-bold text-base">買い切りプラン</Text>
                    <Text className="text-amber-600 text-xs">一度の購入で永久利用</Text>
                  </View>
                </View>
                <Text className="text-amber-900 font-bold text-lg">
                  {lifetimePkg ? lifetimePkg.product.priceString : '¥4,800'}
                </Text>
              </TouchableOpacity>
              {isLoading && (
                <View className="items-center py-2">
                  <ActivityIndicator color="#F59E0B" />
                </View>
              )}
            </>
          )}
        </View>

        {/* フリープランで始める */}
        <TouchableOpacity
          className="border border-amber-200 bg-white rounded-2xl p-4 items-center"
          onPress={goToHome}
          disabled={isLoading}
          activeOpacity={0.7}
        >
          <View className="flex-row items-center gap-x-2">
            <Check size={15} color="#D97706" />
            <Text className="text-amber-700 font-semibold text-base">
              フリープランで始める
            </Text>
          </View>
          <Text className="text-xs text-amber-600 mt-1">
            あとからアップグレードできます
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
