import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { TextInput } from '@/components/TextInput';
import { X } from 'lucide-react-native';
import type { List } from '@/types';

const PRESET_EMOJIS = [
  '🌍', '🛫', '🗻', '🎯', '📚', '🎵', '🎨', '🏃',
  '🍜', '💪', '🎭', '🌸', '🌊', '🚗', '🎮', '💡',
  '⭐', '🌙', '🏠', '💼', '🎉', '🌈', '🚀', '🎸',
  '🦋', '🌺', '🐶', '🍀', '🏆', '💖',
];

type Props = {
  list: List;
  visible: boolean;
  onClose: () => void;
  onSubmit: (title: string, emoji: string | null) => Promise<void>;
};

export function EditListModal({ list, visible, onClose, onSubmit }: Props) {
  const [title, setTitle] = useState(list.title);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(list.emoji ?? null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmed = title.trim();
    if (!trimmed) return;

    setIsSubmitting(true);
    try {
      await onSubmit(trimmed, selectedEmoji);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setTitle(list.title);
    setSelectedEmoji(list.emoji ?? null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity
          className="flex-1 bg-black/40"
          activeOpacity={1}
          onPress={handleClose}
        />
        <View className="bg-white rounded-t-3xl px-6 pt-5 pb-10">
          {/* ヘッダー */}
          <View className="flex-row items-center justify-between mb-5">
            <Text className="text-lg font-bold text-amber-900">
              リストを編集
            </Text>
            <TouchableOpacity onPress={handleClose} className="p-1">
              <X size={20} color="#D97706" />
            </TouchableOpacity>
          </View>

          {/* タイトル入力 */}
          <TextInput
            className="border border-amber-200 rounded-xl px-4 py-3.5 text-base text-amber-900 bg-amber-50 mb-4"
            placeholder="リストのタイトル"
            placeholderTextColor="#D97706"
            value={title}
            onChangeText={setTitle}
            autoFocus
            maxLength={50}
            onSubmitEditing={handleSubmit}
            returnKeyType="done"
          />

          {/* 絵文字ピッカー */}
          <Text className="text-sm font-medium text-amber-900 mb-2">
            アイコン（任意）
          </Text>
          <ScrollView style={{ maxHeight: 140 }} showsVerticalScrollIndicator={false}>
            <View className="flex-row flex-wrap gap-2 mb-5">
              {/* なし（クリア）ボタン */}
              <TouchableOpacity
                onPress={() => setSelectedEmoji(null)}
                className={`w-10 h-10 rounded-xl items-center justify-center border ${
                  selectedEmoji === null
                    ? 'bg-amber-400 border-amber-400'
                    : 'bg-amber-50 border-amber-200'
                }`}
              >
                <Text className={`text-xs font-medium ${selectedEmoji === null ? 'text-white' : 'text-amber-600'}`}>
                  なし
                </Text>
              </TouchableOpacity>
              {PRESET_EMOJIS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  onPress={() => setSelectedEmoji(emoji)}
                  className={`w-10 h-10 rounded-xl items-center justify-center border ${
                    selectedEmoji === emoji
                      ? 'bg-amber-400 border-amber-400'
                      : 'bg-amber-50 border-amber-200'
                  }`}
                >
                  <Text className="text-xl">{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* 保存ボタン */}
          <TouchableOpacity
            className={`rounded-xl py-3.5 items-center ${
              title.trim() ? 'bg-primary' : 'bg-gray-200'
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
                保存する
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
