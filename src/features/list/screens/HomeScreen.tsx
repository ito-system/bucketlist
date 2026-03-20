import { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { Plus, UserPlus } from 'lucide-react-native';
import type { MainStackParamList } from '@/navigation/MainNavigator';
import { useAuthStore } from '@/store/authStore';
import { useListStore } from '@/store/listStore';
import { inviteService } from '@/features/invite/services/inviteService';
import { ListCard } from '@/features/list/components/ListCard';
import { CreateListModal } from '@/features/list/components/CreateListModal';
import { PLAN_LIMITS } from '@/types';

type HomeNavProp = StackNavigationProp<MainStackParamList, 'Tabs'>;

export function HomeScreen() {
  const navigation = useNavigation<HomeNavProp>();
  const { user } = useAuthStore();
  const { lists, isLoading, subscribe, unsubscribe, createList, deleteList } =
    useListStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    if (user) subscribe(user.uid);
    return () => unsubscribe();
  }, [user?.uid]);

  const handleCreateList = async (title: string) => {
    if (!user) return;

    const limit = PLAN_LIMITS[user.planType].maxLists;
    if (lists.length >= limit) {
      Alert.alert(
        'リスト上限に達しました',
        `${user.planType === 'free' ? 'フリー' : ''}プランでは最大 ${limit} 件まで作成できます`,
      );
      return;
    }
    await createList(title, user.uid);
  };

  const handleDeleteList = (listId: string, title: string) => {
    Alert.alert(`「${title}」を削除`, 'このリストとすべてのアイテムを削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: () => deleteList(listId),
      },
    ]);
  };

  const handleJoinByCode = async () => {
    if (!user || !inviteCode.trim()) return;

    setIsJoining(true);
    try {
      const { listTitle } = await inviteService.joinByCode(
        inviteCode,
        user.uid,
      );
      setInviteCode('');
      setShowJoinModal(false);
      Alert.alert('参加しました！', `「${listTitle}」に参加しました`);
    } catch (e: any) {
      Alert.alert('エラー', e.message ?? '参加に失敗しました');
    } finally {
      setIsJoining(false);
    }
  };

  if (!user) return null;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* ヘッダー */}
      <View className="flex-row items-center justify-between px-5 pt-2 pb-4">
        <Text className="text-2xl font-bold text-gray-900">マイリスト</Text>
        <View className="flex-row gap-x-2">
          <TouchableOpacity
            className="w-9 h-9 bg-white border border-gray-200 rounded-full items-center justify-center"
            onPress={() => setShowJoinModal(true)}
          >
            <UserPlus size={18} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity
            className="w-9 h-9 bg-primary rounded-full items-center justify-center"
            onPress={() => setShowCreateModal(true)}
          >
            <Plus size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* リスト */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      ) : lists.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-5xl mb-4">🪣</Text>
          <Text className="text-lg font-semibold text-gray-700 mb-2">
            リストがありません
          </Text>
          <Text className="text-sm text-gray-400 text-center mb-6">
            「+」ボタンでリストを作成するか、{'\n'}招待コードで参加しましょう
          </Text>
          <TouchableOpacity
            className="bg-primary rounded-xl px-6 py-3"
            onPress={() => setShowCreateModal(true)}
          >
            <Text className="text-white font-semibold">リストを作成する</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={lists}
          keyExtractor={(item) => item.listId}
          contentContainerClassName="px-5 pb-6"
          renderItem={({ item }) => (
            <ListCard
              list={item}
              currentUserId={user.uid}
              onPress={() =>
                navigation.navigate('ListDetail', {
                  listId: item.listId,
                  title: item.title,
                })
              }
              onLongPress={
                item.ownerId === user.uid
                  ? () => handleDeleteList(item.listId, item.title)
                  : undefined
              }
            />
          )}
        />
      )}

      {/* リスト作成モーダル */}
      <CreateListModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateList}
      />

      {/* 招待コード参加モーダル */}
      <Modal
        visible={showJoinModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowJoinModal(false)}
      >
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableOpacity
            className="flex-1 bg-black/40"
            activeOpacity={1}
            onPress={() => setShowJoinModal(false)}
          />
          <View className="bg-white rounded-t-3xl px-6 pt-5 pb-10">
            <Text className="text-lg font-bold text-gray-900 mb-2">
              招待コードで参加
            </Text>
            <Text className="text-sm text-gray-400 mb-4">
              6桁の招待コードを入力してください
            </Text>
            <TextInput
              className="border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900 bg-gray-50 mb-4 tracking-widest text-center"
              placeholder="XXXXXX"
              placeholderTextColor="#9CA3AF"
              value={inviteCode}
              onChangeText={(t) => setInviteCode(t.toUpperCase())}
              autoCapitalize="characters"
              maxLength={6}
              autoFocus
            />
            <TouchableOpacity
              className={`rounded-xl py-3.5 items-center ${
                inviteCode.length === 6 && !isJoining
                  ? 'bg-primary'
                  : 'bg-gray-200'
              }`}
              onPress={handleJoinByCode}
              disabled={inviteCode.length !== 6 || isJoining}
            >
              {isJoining ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text
                  className={`font-semibold text-base ${
                    inviteCode.length === 6 ? 'text-white' : 'text-gray-400'
                  }`}
                >
                  参加する
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
