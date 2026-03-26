import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { TextInput } from '@/components/TextInput';
import { X, Trash2 } from 'lucide-react-native';
import type { Item, ItemStatus } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { useTagStore } from '@/store/tagStore';
import { PLAN_LIMITS } from '@/types';
import { AdBanner } from '@/components/AdBanner';

type Props = {
  visible: boolean;
  /** null のとき新規作成モード */
  item: Item | null;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string | null;
    url: string | null;
    status: ItemStatus;
    tagIds: string[];
  }) => Promise<void>;
  onDelete?: () => Promise<void>;
  /** 現在のユーザーがリストのオーナーかどうか。false のときタグ数制限なし */
  isOwner?: boolean;
};

const STATUS_OPTIONS: { value: ItemStatus; label: string }[] = [
  { value: 'todo', label: 'やりたい' },
  { value: 'doing', label: 'チャレンジ中' },
  { value: 'done', label: '達成！' },
];

export function ItemFormModal({
  visible,
  item,
  onClose,
  onSubmit,
  onDelete,
  isOwner = true,
}: Props) {
  const { user } = useAuthStore();
  const { tags } = useTagStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<ItemStatus>('todo');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEdit = item !== null;

  // 編集モード時に既存データを反映
  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setDescription(item.description ?? '');
      setUrl(item.url ?? '');
      setStatus(item.status);
      setSelectedTagIds(item.tagIds ?? []);
    } else {
      setTitle('');
      setDescription('');
      setUrl('');
      setStatus('todo');
      setSelectedTagIds([]);
    }
  }, [item, visible]);

  const maxTags = isOwner && user ? PLAN_LIMITS[user.planType].maxTags : Infinity;

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) => {
      if (prev.includes(tagId)) {
        return prev.filter((id) => id !== tagId);
      }
      if (maxTags !== Infinity && prev.length >= maxTags) {
        Alert.alert(
          'タグ上限',
          `1つのアイテムに付与できるタグは${maxTags}つまでです`,
        );
        return prev;
      }
      return [...prev, tagId];
    });
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || null,
        url: url.trim() || null,
        status,
        tagIds: selectedTagIds,
      });
      onClose();
    } catch {
      Alert.alert('エラー', '保存に失敗しました。再度お試しください');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('削除の確認', 'このアイテムを削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: async () => {
          setIsSubmitting(true);
          try {
            await onDelete?.();
            onClose();
          } finally {
            setIsSubmitting(false);
          }
        },
      },
    ]);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        className="flex-1 bg-white"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* ヘッダー */}
        <View className="flex-row items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
          <TouchableOpacity onPress={onClose} className="p-1">
            <X size={22} color="#6B7280" />
          </TouchableOpacity>
          <Text className="text-base font-bold text-gray-900">
            {isEdit ? 'アイテムを編集' : 'アイテムを追加'}
          </Text>
          {isEdit ? (
            <TouchableOpacity onPress={handleDelete} className="p-1">
              <Trash2 size={20} color="#EF4444" />
            </TouchableOpacity>
          ) : (
            <View className="w-8" />
          )}
        </View>

        <ScrollView
          className="flex-1 px-5 pt-5"
          keyboardShouldPersistTaps="handled"
        >
          {/* タイトル */}
          <Text className="text-sm font-medium text-gray-700 mb-1.5">タイトル <Text className="text-red-400">*</Text></Text>
          <TextInput
            className="border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900 bg-gray-50 mb-4"
            placeholder="例: 富士山に登る"
            placeholderTextColor="#9CA3AF"
            value={title}
            onChangeText={setTitle}
            maxLength={80}
          />

          {/* 説明 */}
          <Text className="text-sm font-medium text-gray-700 mb-1.5">メモ <Text className="text-gray-400 font-normal">（任意）</Text></Text>
          <TextInput
            className="border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 bg-gray-50 mb-4"
            placeholder="詳細や感想など"
            placeholderTextColor="#9CA3AF"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            maxLength={500}
          />

          {/* URL */}
          <Text className="text-sm font-medium text-gray-700 mb-1.5">参考URL <Text className="text-gray-400 font-normal">（任意）</Text></Text>
          <TextInput
            className="border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900 bg-gray-50 mb-4"
            placeholder="https://"
            placeholderTextColor="#9CA3AF"
            value={url}
            onChangeText={setUrl}
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* ステータス */}
          <Text className="text-sm font-medium text-gray-700 mb-2">
            ステータス
          </Text>
          <View className="flex-row gap-x-2 mb-4">
            {STATUS_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                className={`flex-1 py-2.5 rounded-xl items-center border ${
                  status === opt.value
                    ? 'bg-primary border-primary'
                    : 'bg-gray-50 border-gray-200'
                }`}
                onPress={() => setStatus(opt.value)}
              >
                <Text
                  className={`text-sm font-medium ${
                    status === opt.value ? 'text-white' : 'text-gray-600'
                  }`}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* タグ */}
          <Text className="text-sm font-medium text-gray-700 mb-2">
            タグ
          </Text>
          {tags.length > 0 ? (
            <View className="flex-row flex-wrap gap-2 mb-8">
              {tags.map((tag) => {
                const selected = selectedTagIds.includes(tag.tagId);
                return (
                  <TouchableOpacity
                    key={tag.tagId}
                    onPress={() => toggleTag(tag.tagId)}
                    className="flex-row items-center gap-x-1.5 px-3 py-1.5 rounded-full border"
                    style={{
                      backgroundColor: selected ? tag.color + '22' : '#F9FAFB',
                      borderColor: selected ? tag.color : '#E5E7EB',
                    }}
                  >
                    <View
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <Text
                      className="text-xs font-medium"
                      style={{ color: selected ? tag.color : '#6B7280' }}
                    >
                      {tag.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <Text className="text-xs text-gray-400 mb-8">
              タグがありません。プロフィールの「タグ管理」から作成できます。
            </Text>
          )}
        </ScrollView>

        {/* 保存ボタン */}
        <View className="px-5 pb-8 pt-3 border-t border-gray-100">
          <TouchableOpacity
            className={`rounded-xl py-4 items-center ${
              title.trim() && !isSubmitting ? 'bg-primary' : 'bg-gray-200'
            }`}
            onPress={handleSubmit}
            disabled={!title.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text
                className={`font-semibold text-base ${
                  title.trim() ? 'text-white' : 'text-gray-400'
                }`}
              >
                {isEdit ? '保存する' : '追加する'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
        <AdBanner />
      </KeyboardAvoidingView>
    </Modal>
  );
}
