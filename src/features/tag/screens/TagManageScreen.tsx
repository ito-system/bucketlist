import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, Trash2, Tag } from 'lucide-react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import type { MainStackParamList } from '@/navigation/MainNavigator';
import { useAuthStore } from '@/store/authStore';
import { useTagStore } from '@/store/tagStore';
import { PLAN_LIMITS } from '@/types';
import { AdBanner } from '@/components/AdBanner';

type Props = StackScreenProps<MainStackParamList, 'TagManage'>;

const PRESET_COLORS = [
  '#EF4444', // red
  '#F97316', // orange
  '#EAB308', // yellow
  '#22C55E', // green
  '#14B8A6', // teal
  '#FF6B6B', // coral (primary)
  '#A855F7', // purple
  '#EC4899', // pink
  '#64748B', // slate
  '#78716C', // stone
];

export function TagManageScreen({ navigation }: Props) {
  const { user } = useAuthStore();
  const { tags, isLoading, createTag, deleteTag } = useTagStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [tagName, setTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[5]);
  const [isSaving, setIsSaving] = useState(false);

  if (!user) return null;

  const maxTags = PLAN_LIMITS[user.planType].maxTags;
  const canCreate = maxTags === Infinity || tags.length < maxTags;

  const handleOpenModal = () => {
    if (!canCreate) {
      navigation.navigate('Upgrade');
      return;
    }
    setTagName('');
    setSelectedColor(PRESET_COLORS[5]);
    setModalVisible(true);
  };

  const handleCreate = async () => {
    const name = tagName.trim();
    if (!name) return;
    setIsSaving(true);
    try {
      await createTag(user.uid, { name, color: selectedColor });
      setModalVisible(false);
    } catch {
      Alert.alert('エラー', 'タグの作成に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (tagId: string, tagName: string) => {
    Alert.alert(
      'タグを削除',
      `「${tagName}」を削除しますか？\nアイテムからも削除されます。`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: () => deleteTag(user.uid, tagId),
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-rose-50">
      {/* ヘッダー */}
      <View className="flex-row items-center justify-between px-4 pt-2 pb-3">
        <TouchableOpacity
          className="w-9 h-9 items-center justify-center"
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={22} color="#111827" />
        </TouchableOpacity>
        <Text className="flex-1 text-lg font-bold text-gray-900 text-center mx-2">
          タグ管理
        </Text>
        <TouchableOpacity
          className="w-9 h-9 bg-primary rounded-full items-center justify-center"
          onPress={handleOpenModal}
        >
          <Plus size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* プラン情報 */}
      <View className="mx-4 mb-3 bg-white rounded-xl px-4 py-3">
        <Text className="text-sm text-gray-500">
          {maxTags === Infinity
            ? `作成済み: ${tags.length}個（無制限）`
            : `作成済み: ${tags.length} / ${maxTags}個`}
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FF6B6B" />
        </View>
      ) : tags.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Tag size={64} color="#D1D5DB" />
          <Text className="text-lg font-semibold text-gray-700 mt-4 mb-2">
            タグがありません
          </Text>
          <Text className="text-sm text-gray-400 text-center mb-6">
            「+」ボタンからタグを作成できます
          </Text>
          <TouchableOpacity
            className="bg-primary rounded-xl px-6 py-3"
            onPress={handleOpenModal}
          >
            <Text className="text-white font-semibold">タグを作成する</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={tags}
          keyExtractor={(t) => t.tagId}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          renderItem={({ item }) => (
            <View className="bg-white rounded-2xl mb-3 px-4 py-4 flex-row items-center gap-x-3">
              <View
                className="w-5 h-5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <Text className="flex-1 text-base font-medium text-gray-800">
                {item.name}
              </Text>
              <TouchableOpacity
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                onPress={() => handleDelete(item.tagId, item.name)}
              >
                <Trash2 size={18} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {/* 新規タグ作成モーダル */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/40"
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        />
        <View className="bg-white rounded-t-3xl px-5 pt-5 pb-8">
          <Text className="text-lg font-bold text-gray-900 mb-4">新しいタグ</Text>

          {/* タグ名 */}
          <Text className="text-sm font-medium text-gray-700 mb-1.5">タグ名</Text>
          <TextInput
            className="bg-gray-100 rounded-xl px-4 py-3 text-gray-900 mb-4"
            style={{ lineHeight: 17 }}
            placeholder="タグ名を入力"
            placeholderTextColor="#9CA3AF"
            value={tagName}
            onChangeText={setTagName}
            maxLength={20}
            returnKeyType="done"
          />

          {/* カラー選択 */}
          <Text className="text-sm font-medium text-gray-700 mb-3">カラー</Text>
          <View className="flex-row flex-wrap gap-3 mb-6">
            {PRESET_COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                onPress={() => setSelectedColor(color)}
                className="w-9 h-9 rounded-full items-center justify-center"
                style={{ backgroundColor: color }}
              >
                {selectedColor === color && (
                  <View className="w-3 h-3 rounded-full bg-white" />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* プレビュー */}
          {tagName.trim() ? (
            <View className="flex-row items-center gap-x-2 mb-6">
              <Text className="text-sm text-gray-500">プレビュー:</Text>
              <View
                className="flex-row items-center gap-x-1 px-2.5 py-1 rounded-full"
                style={{ backgroundColor: selectedColor + '22' }}
              >
                <View
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: selectedColor }}
                />
                <Text
                  className="text-xs font-medium"
                  style={{ color: selectedColor }}
                >
                  {tagName.trim()}
                </Text>
              </View>
            </View>
          ) : (
            <View className="mb-6" />
          )}

          <TouchableOpacity
            className={`rounded-xl py-3.5 items-center ${
              tagName.trim() && !isSaving ? 'bg-primary' : 'bg-gray-200'
            }`}
            onPress={handleCreate}
            disabled={!tagName.trim() || isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text
                className={`font-semibold ${tagName.trim() ? 'text-white' : 'text-gray-400'}`}
              >
                作成する
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </Modal>
      <AdBanner />
    </SafeAreaView>
  );
}
