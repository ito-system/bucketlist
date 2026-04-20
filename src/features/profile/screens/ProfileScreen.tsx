import { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import {
  LogOut,
  Crown,
  ChevronRight,
  Lock,
  Tag,
  Trash2,
  CheckSquare,
  Square,
} from 'lucide-react-native';
import { AdBanner } from '@/components/AdBanner';
import { useAuthStore } from '@/store/authStore';
import { useListStore } from '@/store/listStore';
import { useTagStore } from '@/store/tagStore';
import { PLAN_LIMITS } from '@/types';
import type { MainStackParamList } from '@/navigation/MainNavigator';

type ProfileNavProp = StackNavigationProp<MainStackParamList>;

const DELETE_CHECKS = [
  'リスト・アイテム・タグのデータがすべて削除されます',
  '削除したデータは復元できません',
  'プレミアムプランに加入中の場合、各ストア（App Store / Google Play）のサブスクリプション設定から別途キャンセルが必要です。支払済みの料金は返金されません',
  '上記の内容を確認し、アカウントを削除することに同意します',
] as const;

export function ProfileScreen() {
  const navigation = useNavigation<ProfileNavProp>();
  const { user, signOut, deleteAccount } = useAuthStore();
  const { lists, deleteList } = useListStore();
  const { tags, subscribe: subscribeTags } = useTagStore();

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [checks, setChecks] = useState<boolean[]>([false, false, false, false]);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const openDeleteModal = () => {
    setChecks([false, false, false, false]);
    setDeleteModalVisible(true);
  };

  const toggleCheck = (i: number) => {
    setChecks((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'アカウントを削除しますか？',
      'この操作は取り消せません。本当に削除しますか？',
      [
        { text: 'いいえ', style: 'cancel' },
        { text: 'はい', style: 'destructive', onPress: executeDeleteAccount },
      ],
    );
  };

  const executeDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      // 自分が所有するリストを削除
      const ownedLists = lists.filter((l) => l.ownerId === user!.uid);
      await Promise.all(ownedLists.map((l) => deleteList(l.listId)));

      // タグ・ユーザードキュメント・Firebase Auth を削除
      await deleteAccount();
    } catch (e: any) {
      setIsDeleting(false);
      if (e?.code === 'auth/requires-recent-login') {
        Alert.alert(
          '再ログインが必要です',
          'セキュリティのため、一度ログアウトして再ログイン後にもう一度お試しください。',
        );
        setDeleteModalVisible(false);
      } else {
        Alert.alert('エラー', e.message ?? 'アカウントの削除に失敗しました。');
      }
    }
  };

  if (!user) return null;

  const listLimit = PLAN_LIMITS[user.planType].maxLists;
  const memberLimit = PLAN_LIMITS[user.planType].maxMembers;
  const tagLimit = PLAN_LIMITS[user.planType].maxTags;
  const isPremium = user.planType === 'premium';
  const allChecked = checks.every(Boolean);

  return (
    <SafeAreaView className="flex-1 bg-amber-50">
      {/* ScrollView でラップ（コンテンツが増えたため） */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* タイトル */}
        <Text className="text-2xl font-bold text-amber-900 px-5 pt-2 pb-4">
          プロフィール
        </Text>

        {/* ヒーローカード - タップでプロフィール編集 */}
        <TouchableOpacity
          className="bg-white mx-5 rounded-2xl p-5 mb-4 items-center"
          onPress={() => navigation.navigate('ProfileEdit')}
          activeOpacity={0.7}
          style={{ shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.10, shadowRadius: 16, elevation: 3 }}
        >
          {user.photoURL ? (
            <Image
              source={{ uri: user.photoURL }}
              className="w-20 h-20 rounded-2xl mb-3"
            />
          ) : (
            <View
              className="w-20 h-20 rounded-2xl items-center justify-center mb-3"
              style={{ backgroundColor: '#F59E0B' }}
            >
              <Text className="text-3xl font-bold text-white">
                {user.displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <Text className="text-xl font-bold text-amber-900 mb-1">
            {user.displayName}
          </Text>
          <Text className="text-sm text-amber-600 mb-3">{user.email}</Text>
          {/* プランバッジ */}
          <View className="flex-row items-center bg-amber-100 rounded-full px-3 py-1 gap-x-1">
            {isPremium && <Crown size={12} color="#F59E0B" />}
            <Text className="text-xs font-semibold text-amber-800">
              {isPremium ? '🌟 プレミアムプラン' : 'フリープラン'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* アップグレードボタン（フリープランのみ） */}
        {!isPremium && (
          <TouchableOpacity
            className="bg-primary mx-5 rounded-2xl p-4 mb-4 flex-row items-center justify-center gap-x-2"
            onPress={() => navigation.navigate('Upgrade')}
          >
            <Crown size={16} color="#fff" />
            <Text className="text-white font-semibold text-base">
              プレミアムにアップグレード
            </Text>
          </TouchableOpacity>
        )}

        {/* 統計カード */}
        <View className="flex-row mx-5 gap-x-3 mb-4">
          <View
            className="flex-1 bg-white rounded-2xl py-4 items-center"
            style={{ shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.10, shadowRadius: 8, elevation: 2 }}
          >
            <Text className="text-2xl font-extrabold text-amber-400">{lists.length}</Text>
            <Text className="text-xs text-amber-600 mt-1">リスト</Text>
          </View>
          <View
            className="flex-1 bg-white rounded-2xl py-4 items-center"
            style={{ shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.10, shadowRadius: 8, elevation: 2 }}
          >
            <Text className="text-2xl font-extrabold text-amber-400">{tags.length}</Text>
            <Text className="text-xs text-amber-600 mt-1">タグ</Text>
          </View>
          <View
            className="flex-1 bg-white rounded-2xl py-4 items-center"
            style={{ shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.10, shadowRadius: 8, elevation: 2 }}
          >
            <Text className="text-2xl font-extrabold text-amber-400">
              {memberLimit}
            </Text>
            <Text className="text-xs text-amber-600 mt-1">招待上限</Text>
          </View>
        </View>

        {/* プラン情報（テキストのみ・簡略版） */}
        <View className="bg-white mx-5 rounded-2xl p-4 mb-4">
          <PlanRow
            label="作成できるリスト数"
            value={`${lists.length} / ${listLimit === Infinity ? '無制限' : listLimit}`}
          />
          <View className="h-px bg-amber-100 my-2" />
          <PlanRow
            label="作成できるタグ数"
            value={`${tags.length} / ${tagLimit === Infinity ? '無制限' : tagLimit}`}
          />
        </View>

        {/* 設定メニュー */}
        <View className="bg-white mx-5 rounded-2xl mb-4 overflow-hidden">
          <MenuItem
            label="タグ管理"
            icon={<Tag size={18} color="#D97706" />}
            onPress={() => navigation.navigate('TagManage')}
          />
          <View className="h-px bg-amber-100 mx-5" />
          <MenuItem
            label="パスワード変更"
            icon={<Lock size={18} color="#D97706" />}
            onPress={() => navigation.navigate('PasswordChange')}
          />
        </View>

        {/* ログアウト */}
        <TouchableOpacity
          className="bg-white mx-5 rounded-2xl p-4 flex-row items-center gap-x-3 mb-3"
          onPress={handleSignOut}
        >
          <LogOut size={20} color="#EF4444" />
          <Text className="text-base font-medium text-red-500">ログアウト</Text>
        </TouchableOpacity>

        {/* アカウント削除 */}
        <TouchableOpacity
          className="bg-red-50 border border-red-200 mx-5 rounded-2xl p-4 flex-row items-center gap-x-3 mb-8"
          onPress={openDeleteModal}
        >
          <Trash2 size={20} color="#FCA5A5" />
          <Text className="text-base font-medium text-red-400">アカウントを削除</Text>
        </TouchableOpacity>
      </ScrollView>

      <AdBanner />

      {/* アカウント削除確認モーダル（変更なし） */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => !isDeleting && setDeleteModalVisible(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/40"
          activeOpacity={1}
          onPress={() => !isDeleting && setDeleteModalVisible(false)}
        />
        <View className="bg-white rounded-t-3xl px-5 pt-6 pb-10">
          <Text className="text-lg font-bold text-gray-900 mb-1">
            アカウントを削除しますか？
          </Text>
          <Text className="text-sm text-gray-500 mb-6">
            削除する前に以下の内容をご確認ください
          </Text>

          <ScrollView scrollEnabled={false}>
            {DELETE_CHECKS.map((label, i) => (
              <TouchableOpacity
                key={i}
                className="flex-row items-start gap-x-3 mb-4"
                onPress={() => toggleCheck(i)}
                activeOpacity={0.7}
                disabled={isDeleting}
              >
                <View className="h-5 items-center justify-center">
                  {checks[i] ? (
                    <CheckSquare size={20} color="#EF4444" />
                  ) : (
                    <Square size={20} color="#D1D5DB" />
                  )}
                </View>
                <Text className="flex-1 text-sm text-gray-700 leading-5">
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            className={`rounded-xl py-3.5 items-center mt-2 ${
              allChecked && !isDeleting ? 'bg-red-500' : 'bg-gray-200'
            }`}
            onPress={handleDeleteAccount}
            disabled={!allChecked || isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text
                className={`font-semibold text-base ${
                  allChecked ? 'text-white' : 'text-gray-400'
                }`}
              >
                アカウントを削除する
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function PlanRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-sm text-amber-600">{label}</Text>
      <Text className="text-sm font-medium text-amber-900">{value}</Text>
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
      <Text className="flex-1 text-base text-amber-900">{label}</Text>
      <ChevronRight size={16} color="#FDE68A" />
    </TouchableOpacity>
  );
}
