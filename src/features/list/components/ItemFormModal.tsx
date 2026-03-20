import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  ScrollView,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { X, ImagePlus, Trash2 } from 'lucide-react-native';
import type { Item, ItemStatus } from '@/types';

type Props = {
  visible: boolean;
  /** null のとき新規作成モード */
  item: Item | null;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string | null;
    url: string | null;
    imageUri?: string;
    status: ItemStatus;
  }) => Promise<void>;
  onDelete?: () => Promise<void>;
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
}: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<ItemStatus>('todo');
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);
  const [existingImageURL, setExistingImageURL] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEdit = item !== null;

  // 編集モード時に既存データを反映
  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setDescription(item.description ?? '');
      setUrl(item.url ?? '');
      setStatus(item.status);
      setExistingImageURL(item.imageURL);
      setImageUri(undefined);
    } else {
      setTitle('');
      setDescription('');
      setUrl('');
      setStatus('todo');
      setImageUri(undefined);
      setExistingImageURL(null);
    }
  }, [item, visible]);

  const pickImage = async () => {
    const { status: permStatus } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permStatus !== 'granted') {
      Alert.alert('権限が必要です', 'フォトライブラリへのアクセスを許可してください');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setExistingImageURL(null);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || null,
        url: url.trim() || null,
        imageUri,
        status,
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

  const previewUri = imageUri ?? existingImageURL ?? null;

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
          {/* 写真 */}
          <TouchableOpacity
            className="w-full h-44 bg-gray-100 rounded-2xl mb-4 items-center justify-center overflow-hidden"
            onPress={pickImage}
          >
            {previewUri ? (
              <Image
                source={{ uri: previewUri }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="items-center gap-y-2">
                <ImagePlus size={28} color="#9CA3AF" />
                <Text className="text-sm text-gray-400">写真を追加</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* タイトル */}
          <TextInput
            className="border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900 bg-gray-50 mb-3"
            placeholder="タイトル（必須）"
            placeholderTextColor="#9CA3AF"
            value={title}
            onChangeText={setTitle}
            maxLength={80}
          />

          {/* 説明 */}
          <TextInput
            className="border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 bg-gray-50 mb-3"
            placeholder="詳細メモ（任意）"
            placeholderTextColor="#9CA3AF"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            maxLength={500}
          />

          {/* URL */}
          <TextInput
            className="border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900 bg-gray-50 mb-4"
            placeholder="参考 URL（任意）"
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
          <View className="flex-row gap-x-2 mb-8">
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
      </KeyboardAvoidingView>
    </Modal>
  );
}
