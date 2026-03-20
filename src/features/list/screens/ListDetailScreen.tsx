import { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { ArrowLeft, Plus, UserPlus, Copy } from 'lucide-react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import type { MainStackParamList } from '@/navigation/MainNavigator';
import { useAuthStore } from '@/store/authStore';
import { useItemStore } from '@/store/itemStore';
import { inviteService } from '@/features/invite/services/inviteService';
import { ItemCard } from '@/features/list/components/ItemCard';
import { ItemFormModal } from '@/features/list/components/ItemFormModal';
import type { Item } from '@/types';

type Props = StackScreenProps<MainStackParamList, 'ListDetail'>;

export function ListDetailScreen({ route, navigation }: Props) {
  const { listId, title } = route.params;
  const { user } = useAuthStore();
  const { items, isLoading, subscribe, unsubscribe, createItem, updateItem, deleteItem } =
    useItemStore();

  const [formVisible, setFormVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  useEffect(() => {
    subscribe(listId);
    return () => unsubscribe();
  }, [listId]);

  const handleAddItem = () => {
    setEditingItem(null);
    setFormVisible(true);
  };

  const handleEditItem = (item: Item) => {
    setEditingItem(item);
    setFormVisible(true);
  };

  const handleSubmit = async (data: {
    title: string;
    description: string | null;
    url: string | null;
    imageUri?: string;
    status: Item['status'];
  }) => {
    if (!user) return;

    if (editingItem) {
      await updateItem(listId, editingItem.itemId, data, editingItem.status);
    } else {
      await createItem(listId, { ...data, createdBy: user.uid });
    }
  };

  const handleDelete = async () => {
    if (!editingItem) return;
    await deleteItem(listId, editingItem.itemId, editingItem.imageURL);
  };

  const handleInvite = async () => {
    if (!user) return;

    setIsGeneratingCode(true);
    try {
      const code = await inviteService.createInviteCode(listId, user.uid);

      Alert.alert(
        '招待コード',
        `${code}\n\n有効期限: 7日間\nこのコードを相手に共有してください`,
        [
          {
            text: 'コピー',
            onPress: async () => {
              await Clipboard.setStringAsync(code);
              Alert.alert('コピーしました', '招待コードをクリップボードにコピーしました');
            },
          },
          {
            text: 'シェア',
            onPress: () =>
              Share.share({
                message: `BucketListに招待します！\n招待コード: ${code}`,
              }),
          },
          { text: '閉じる', style: 'cancel' },
        ],
      );
    } catch {
      Alert.alert('エラー', '招待コードの生成に失敗しました');
    } finally {
      setIsGeneratingCode(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* ヘッダー */}
      <View className="flex-row items-center justify-between px-4 pt-2 pb-4">
        <TouchableOpacity
          className="w-9 h-9 items-center justify-center"
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={22} color="#111827" />
        </TouchableOpacity>

        <Text
          className="flex-1 text-lg font-bold text-gray-900 text-center mx-2"
          numberOfLines={1}
        >
          {title}
        </Text>

        <View className="flex-row gap-x-2">
          <TouchableOpacity
            className="w-9 h-9 bg-white border border-gray-200 rounded-full items-center justify-center"
            onPress={handleInvite}
            disabled={isGeneratingCode}
          >
            {isGeneratingCode ? (
              <ActivityIndicator size="small" color="#6366F1" />
            ) : (
              <UserPlus size={17} color="#6B7280" />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            className="w-9 h-9 bg-primary rounded-full items-center justify-center"
            onPress={handleAddItem}
          >
            <Plus size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* アイテム一覧 */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      ) : items.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-5xl mb-4">✨</Text>
          <Text className="text-lg font-semibold text-gray-700 mb-2">
            やりたいことを追加しよう
          </Text>
          <Text className="text-sm text-gray-400 text-center mb-6">
            「+」ボタンからアイテムを追加できます
          </Text>
          <TouchableOpacity
            className="bg-primary rounded-xl px-6 py-3"
            onPress={handleAddItem}
          >
            <Text className="text-white font-semibold">追加する</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.itemId}
          contentContainerClassName="px-5 pb-6"
          renderItem={({ item }) => (
            <ItemCard item={item} onPress={() => handleEditItem(item)} />
          )}
        />
      )}

      {/* アイテム追加・編集モーダル */}
      <ItemFormModal
        visible={formVisible}
        item={editingItem}
        onClose={() => setFormVisible(false)}
        onSubmit={handleSubmit}
        onDelete={editingItem ? handleDelete : undefined}
      />
    </SafeAreaView>
  );
}
