import { useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { LogOut, Crown, ChevronRight, Pencil, Lock, Tag } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { useListStore } from '@/store/listStore';
import { useTagStore } from '@/store/tagStore';
import { PLAN_LIMITS } from '@/types';
import type { MainStackParamList } from '@/navigation/MainNavigator';

type ProfileNavProp = StackNavigationProp<MainStackParamList>;

export function ProfileScreen() {
  const navigation = useNavigation<ProfileNavProp>();
  const { user, signOut } = useAuthStore();
  const { lists } = useListStore();
  const { tags, subscribe: subscribeTags } = useTagStore();

  // フォーカス時に自分自身のタグを購読する。
  // ブラー時はアンサブしない（TagManageScreen 等の子画面でもタグを参照できるようにするため）。
  // ListDetailScreen に遷移した際は ListDetailScreen 側が上書き購読するため問題ない。
  useFocusEffect(
    useCallback(() => {
      if (user) subscribeTags(user.uid);
    }, [user?.uid]),
  );

  const handleSignOut = () => {
    Alert.alert('ログアウト', 'ログアウトしますか？', [
      { text: 'キャンセル', style: 'cancel' },
      { text: 'ログアウト', style: 'destructive', onPress: signOut },
    ]);
  };

  if (!user) return null;

  const listLimit = PLAN_LIMITS[user.planType].maxLists;
  const memberLimit = PLAN_LIMITS[user.planType].maxMembers;
  const tagLimit = PLAN_LIMITS[user.planType].maxTags;
  const isPremium = user.planType === 'premium';

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Text className="text-2xl font-bold text-gray-900 px-5 pt-2 pb-5">
        プロフィール
      </Text>

      {/* ユーザー情報カード */}
      <TouchableOpacity
        className="bg-white mx-5 rounded-2xl p-5 mb-4 flex-row items-center gap-x-4"
        onPress={() => navigation.navigate('ProfileEdit')}
        activeOpacity={0.7}
      >
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
        <Pencil size={16} color="#9CA3AF" />
      </TouchableOpacity>

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
          <PlanRow
            label="作成できるタグ数"
            value={`${tags.length} / ${tagLimit === Infinity ? '無制限' : tagLimit}`}
          />
        </View>
      </View>

      {/* 設定メニュー */}
      <View className="bg-white mx-5 rounded-2xl mb-4 overflow-hidden">
        <MenuItem
          label="タグ管理"
          icon={<Tag size={18} color="#6B7280" />}
          onPress={() => navigation.navigate('TagManage')}
        />
        <View className="h-px bg-gray-100 mx-5" />
        <MenuItem
          label="パスワード変更"
          icon={<Lock size={18} color="#6B7280" />}
          onPress={() => navigation.navigate('PasswordChange')}
        />
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

function MenuItem({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      className="flex-row items-center px-5 py-4 gap-x-3"
      onPress={onPress}
      activeOpacity={0.7}
    >
      {icon}
      <Text className="flex-1 text-base text-gray-800">{label}</Text>
      <ChevronRight size={16} color="#D1D5DB" />
    </TouchableOpacity>
  );
}
