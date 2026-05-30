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
import { TextInput } from '@/components/TextInput';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { ArrowLeft, Plus, UserPlus, PlusCircle, GripVertical, ArrowUpAZ, Tag, Clock, Search, X } from 'lucide-react-native';
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
import { NativeAdBanner } from '@/components/NativeAdBanner';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

type Props = StackScreenProps<MainStackParamList, 'ListDetail'>;

type SortMode = 'manual' | 'name' | 'status' | 'newest' | 'tag';

const STATUS_ORDER = { todo: 0, doing: 1, done: 2 };
const STATUS_LABELS = { todo: 'やりたい', doing: 'チャレンジ中', done: '達成！' };

const SEARCH_FIELDS = [
  { key: 'all', label: 'すべて' },
  { key: 'title', label: 'タイトル' },
  { key: 'description', label: 'メモ' },
  { key: 'url', label: 'URL' },
  { key: 'status', label: 'ステータス' },
  { key: 'tag', label: 'タグ' },
] as const;
type SearchField = typeof SEARCH_FIELDS[number]['key'];

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
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState<SearchField>('all');

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
    let result = sortMode === 'manual' ? items : [...items];

    if (sortMode === 'name') {
      result = result.sort((a, b) => a.title.localeCompare(b.title, 'ja'));
    } else if (sortMode === 'status') {
      result = result.sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
    } else if (sortMode === 'newest') {
      result = result.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
    } else if (sortMode === 'tag') {
      result = result.sort((a, b) => {
        const nameA = a.tagIds?.[0] ? (tags.find((t) => t.tagId === a.tagIds![0])?.name ?? '') : '';
        const nameB = b.tagIds?.[0] ? (tags.find((t) => t.tagId === b.tagIds![0])?.name ?? '') : '';
        if (nameA === '' && nameB !== '') return 1;
        if (nameA !== '' && nameB === '') return -1;
        return nameA.localeCompare(nameB, 'ja');
      });
    }

    if (!searchQuery.trim()) return result;
    const q = searchQuery.trim().toLowerCase();
    return result.filter((item) => {
      switch (searchField) {
        case 'title':
          return item.title.toLowerCase().includes(q);
        case 'description':
          return item.description?.toLowerCase().includes(q) ?? false;
        case 'url':
          return item.url?.toLowerCase().includes(q) ?? false;
        case 'status':
          return STATUS_LABELS[item.status].toLowerCase().includes(q);
        case 'tag':
          return item.tagIds?.some((id) => tags.find((t) => t.tagId === id)?.name.toLowerCase().includes(q)) ?? false;
        default:
          return (
            item.title.toLowerCase().includes(q) ||
            (item.description?.toLowerCase().includes(q) ?? false) ||
            (item.url?.toLowerCase().includes(q) ?? false) ||
            STATUS_LABELS[item.status].toLowerCase().includes(q) ||
            (item.tagIds?.some((id) => tags.find((t) => t.tagId === id)?.name.toLowerCase().includes(q)) ?? false)
          );
      }
    });
  }, [items, sortMode, tags, searchQuery, searchField]);

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
    await deleteItem(listId, editingItem.itemId);
  };

  const handleDragEnd = async ({ data }: { data: Item[] }) => {
    try {
      await reorderItems(listId, data);
    } catch {
      // 楽観的更新済みのため画面上は反映されているが、次回起動時に元に戻る
    }
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
                message: `夢ノートに招待します！\n招待コード: ${code}`,
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
      <SafeAreaView className="flex-1 bg-amber-50">
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
            className="flex-1 text-lg font-bold text-amber-900 text-center"
            numberOfLines={1}
          >
            {title}
          </Text>

          <View className="flex-row gap-x-2 justify-end">
            <TouchableOpacity
              className="w-9 h-9 bg-white border border-amber-200 rounded-full items-center justify-center"
              onPress={() => {
                setShowSearch((v) => {
                  if (v) {
                    setSearchQuery('');
                    setSearchField('all');
                  }
                  return !v;
                });
              }}
            >
              {showSearch
                ? <X size={17} color="#F59E0B" />
                : <Search size={17} color="#D97706" />
              }
            </TouchableOpacity>
            <TouchableOpacity
              className="w-9 h-9 bg-white border border-amber-200 rounded-full items-center justify-center"
              onPress={handleInvite}
              disabled={isGeneratingCode}
            >
              {isGeneratingCode ? (
                <ActivityIndicator size="small" color="#F59E0B" />
              ) : (
                <UserPlus size={17} color="#D97706" />
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

        {/* 検索バー */}
        {showSearch && (
          <View className="px-4 pb-2 gap-y-2">
            <View className="flex-row items-center bg-white border border-amber-200 rounded-xl px-3 gap-x-2">
              <Search size={15} color="#D97706" />
              <TextInput
                className="flex-1 py-2.5 text-amber-900"
                style={{ fontSize: 14, lineHeight: 17 }}
                placeholder="キーワードを入力"
                placeholderTextColor="#D97706"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
                autoCapitalize="none"
                autoCorrect={false}
                clearButtonMode="while-editing"
              />
            </View>
            {/* 検索フィールド選択チップ */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 6 }}
            >
              {SEARCH_FIELDS.map(({ key, label }) => {
                const active = searchField === key;
                return (
                  <TouchableOpacity
                    key={key}
                    onPress={() => setSearchField(key)}
                    className={`px-3 py-1 rounded-full border ${
                      active ? 'bg-primary border-primary' : 'bg-white border-amber-200'
                    }`}
                  >
                    <Text className={`text-xs font-medium ${active ? 'text-white' : 'text-amber-700'}`}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* 検索件数 */}
        {showSearch && searchQuery.trim() !== '' && (
          <Text className="text-xs text-amber-600 px-5 pb-1">
            {sortedItems.length} 件ヒット
          </Text>
        )}

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
                  active ? 'bg-primary' : 'bg-white border border-amber-200'
                }`}
              >
                <Icon size={13} color={active ? '#fff' : '#D97706'} />
                <Text
                  className={`text-xs font-medium ${active ? 'text-white' : 'text-amber-700'}`}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* アイテム一覧 */}
        <View style={{ flex: 1 }}>
          {isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#F59E0B" />
            </View>
          ) : items.length === 0 ? (
            <View className="flex-1 items-center justify-center px-8">
              <PlusCircle size={64} color="#FDE68A" className="mb-4" />
              <Text className="text-lg font-semibold text-amber-900 mb-2">
                やりたいことを追加しよう
              </Text>
              <Text className="text-sm text-amber-600 text-center mb-6">
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
                    drag={sortMode === 'manual' && !searchQuery.trim() ? drag : undefined}
                    isActive={isActive}
                  />
                </ScaleDecorator>
              )}
            />
          )}
        </View>

        {/* アイテム追加・編集モーダル */}
        <ItemFormModal
          visible={formVisible}
          item={editingItem}
          onClose={() => setFormVisible(false)}
          onSubmit={handleSubmit}
          onDelete={editingItem ? handleDelete : undefined}
          isOwner={isOwner}
        />
        <NativeAdBanner />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
