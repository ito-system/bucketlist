import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, Crown } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { useListStore } from '@/store/listStore';
import { PLAN_LIMITS } from '@/types';

export function ProfileScreen() {
  const { user, signOut } = useAuthStore();
  const { lists } = useListStore();

  const handleSignOut = () => {
    Alert.alert('ログアウト', 'ログアウトしますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: 'ログアウト',
        style: 'destructive',
        onPress: signOut,
      },
    ]);
  };

  if (!user) return null;

  const listLimit = PLAN_LIMITS[user.planType].maxLists;
  const memberLimit = PLAN_LIMITS[user.planType].maxMembers;
  const isPremium = user.planType === 'premium';

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Text className="text-2xl font-bold text-gray-900 px-5 pt-2 pb-5">
        プロフィール
      </Text>

      {/* ユーザー情報カード */}
      <View className="bg-white mx-5 rounded-2xl p-5 mb-4 flex-row items-center gap-x-4">
        {user.photoURL ? (
          <Image
            source={{ uri: user.photoURL }}
            className="w-16 h-16 rounded-full"
          />
        ) : (
          <View className="w-16 h-16 rounded-full bg-primary-100 items-center justify-center">
            <Text className="text-2xl font-bold text-primary">
              {user.displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-900">
            {user.displayName}
          </Text>
          <Text className="text-sm text-gray-400">{user.email}</Text>
        </View>
      </View>

      {/* プラン情報 */}
      <View className="bg-white mx-5 rounded-2xl p-5 mb-4">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-x-2">
            {isPremium && <Crown size={16} color="#F59E0B" />}
            <Text className="text-base font-semibold text-gray-900">
              {isPremium ? 'プレミアムプラン' : 'フリープラン'}
            </Text>
          </View>
          {!isPremium && (
            <TouchableOpacity className="bg-secondary-500 rounded-lg px-3 py-1.5">
              <Text className="text-white text-xs font-semibold">
                アップグレード
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View className="gap-y-2">
          <PlanRow
            label="作成できるリスト数"
            value={`${lists.length} / ${listLimit === Infinity ? '無制限' : listLimit}`}
          />
          <PlanRow
            label="リストあたりのメンバー数"
            value={`最大 ${memberLimit}人`}
          />
        </View>
      </View>

      {/* ログアウト */}
      <TouchableOpacity
        className="bg-white mx-5 rounded-2xl p-4 flex-row items-center gap-x-3"
        onPress={handleSignOut}
      >
        <LogOut size={20} color="#EF4444" />
        <Text className="text-base font-medium text-red-500">ログアウト</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function PlanRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-sm text-gray-500">{label}</Text>
      <Text className="text-sm font-medium text-gray-800">{value}</Text>
    </View>
  );
}
