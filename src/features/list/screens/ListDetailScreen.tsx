import { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Share,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { ArrowLeft, Plus, UserPlus, PlusCircle, GripVertical, ArrowUpAZ, Tag, Clock } from 'lucide-react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import type { MainStackParamList } from '@/navigation/MainNavigator';
import { useAuthStore } from '@/store/authStore';
import { useItemStore } from '@/store/itemStore';
import { useListStore } from '@/store/listStore';
import { useTagStore } from '@/store/tagStore';
import { inviteService } from '@/features/invite/services/inviteService';
import { ItemCard } from '@/features/list/components/ItemCard';
import { ItemFormModal } from '@/features/list/components/ItemFormModal';
import type { Item } from '@/types';
import { PLAN_LIMITS } from '@/types';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

type Props = StackScreenProps<MainStackParamList, 'ListDetail'>;

type SortMode = 'manual' | 'name' | 'status' | 'newest' | 'tag';

const STATUS_ORDER = { todo: 0, doing: 1, done: 2 };

const SORT_OPTIONS: { key: SortMode; label: string; Icon: typeof GripVertical }[] = [
  { key: 'manual', label: '手動', Icon: GripVertical },
  { key: 'name', label: '名前順', Icon: ArrowUpAZ },
  { key: 'status', label: '状態別', Icon: Tag },
  { key: 'newest', label: '新着順', Icon: Clock },
  { key: 'tag', label: 'タグ別', Icon: Tag },
];

export function ListDetailScreen({ route, navigation }: Props) {
  const { listId, title } = route.params;
  const { user } = useAuthStore();
  const { items, isLoading, subscribe, unsubscribe, createItem, updateItem, deleteItem, reorderItems } =
    useItemStore();
  const { lists } = useListStore();
  const { tags, subscribe: subscribeTags, unsubscribe: unsubscribeTags } = useTagStore();

  const [formVisible, setFormVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>('manual');

  // オーナー情報（未ロードの場合は現在ユーザーを仮にセット）
  const list = lists.find((l) => l.listId === listId);
  const ownerId = list?.ownerId ?? user?.uid ?? '';
  const isOwner = user?.uid === ownerId;

  useEffect(() => {
    subscribe(listId);
    return () => unsubscribe();
  }, [listId]);

  // オーナーのタグを購読（メンバーもオーナーのタグを使う）
  useEffect(() => {
    if (ownerId) subscribeTags(ownerId);
    return () => unsubscribeTags();
  }, [ownerId]);

  const sortedItems = useMemo(() => {
    if (sortMode === 'manual') return items;
    const copy = [...items];
    if (sortMode === 'name') {
      return copy.sort((a, b) => a.title.localeCompare(b.title, 'ja'));
    }
    if (sortMode === 'status') {
      return copy.sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
    }
    if (sortMode === 'newest') {
      return copy.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
    }
    if (sortMode === 'tag') {
      return copy.sort((a, b) => {
        const nameA = a.tagIds?.[0]
          ? (tags.find((t) => t.tagId === a.tagIds![0])?.name ?? '')
          : '';
        const nameB = b.tagIds?.[0]
          ? (tags.find((t) => t.tagId === b.tagIds![0])?.name ?? '')
          : '';
        if (nameA === '' && nameB !== '') return 1;
        if (nameA !== '' && nameB === '') return -1;
        return nameA.localeCompare(nameB, 'ja');
      });
    }
    return copy;
  }, [items, sortMode, tags]);

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
    tagIds: string[];
  }) => {
    if (!user) return;

    if (editingItem) {
      await updateItem(listId, editingItem.itemId, data, editingItem.status);
    } else {
      await createItem(listId, {
        ...data,
        description: data.description ?? undefined,
        url: data.url ?? undefined,
        createdBy: user.uid,
      });
    }
  };

  const handleDelete = async () => {
    if (!editingItem) return;
    await deleteItem(listId, editingItem.itemId, editingItem.imageURL);
  };

  const handleDragEnd = async ({ data }: { data: Item[] }) => {
    await reorderItems(listId, data);
  };

  const handleInvite = async () => {
    if (!user) return;

    // メンバー上限チェック（オーナーのプランに基づく）
    if (isOwner && list) {
      const memberLimit = PLAN_LIMITS[user.planType].maxMembers;
      if (list.memberIds.length >= memberLimit) {
        navigation.navigate('Upgrade');
        return;
      }
    }

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className="flex-1 bg-gray-50">
        {/* ヘッダー */}
        <View className="flex-row items-center px-4 pt-2 pb-3">
          {/* 左右を同じ幅（w-20）に固定してタイトルを真ん中に揃える */}
          <View className="w-20 items-start">
            <TouchableOpacity
              className="w-9 h-9 items-center justify-center"
              onPress={() => navigation.goBack()}
            >
              <ArrowLeft size={22} color="#111827" />
            </TouchableOpacity>
          </View>

          <Text
            className="flex-1 text-lg font-bold text-gray-900 text-center"
            numberOfLines={1}
          >
            {title}
          </Text>

          <View className="w-20 flex-row gap-x-2 justify-end">
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

        {/* ソートチップ */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4 mb-2"
          style={{ flexGrow: 0 }}
          contentContainerStyle={{ paddingRight: 16, alignItems: 'center' }}
        >
          {SORT_OPTIONS.map(({ key, label, Icon }) => {
            const active = sortMode === key;
            return (
              <TouchableOpacity
                key={key}
                onPress={() => setSortMode(key)}
                className={`flex-row items-center gap-x-1.5 px-3 py-1.5 rounded-full mr-2 ${
                  active ? 'bg-primary' : 'bg-white border border-gray-200'
                }`}
              >
                <Icon size={13} color={active ? '#fff' : '#6B7280'} />
                <Text
                  className={`text-xs font-medium ${active ? 'text-white' : 'text-gray-600'}`}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* アイテム一覧 */}
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#6366F1" />
          </View>
        ) : items.length === 0 ? (
          <View className="flex-1 items-center justify-center px-8">
            <PlusCircle size={64} color="#D1D5DB" className="mb-4" />
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
          <DraggableFlatList
            data={sortedItems}
            keyExtractor={(item) => item.itemId}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
            onDragEnd={handleDragEnd}
            renderItem={({ item, drag, isActive }) => (
              <ScaleDecorator>
                <ItemCard
                  item={item}
                  onPress={() => handleEditItem(item)}
                  drag={sortMode === 'manual' ? drag : undefined}
                  isActive={isActive}
                />
              </ScaleDecorator>
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
          isOwner={isOwner}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
