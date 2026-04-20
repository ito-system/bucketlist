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

const PRESET_EMOJIS = [
  '🌍', '🛫', '🗻', '🎯', '📚', '🎵', '🎨', '🏃',
  '🍜', '💪', '🎭', '🌸', '🌊', '🚗', '🎮', '💡',
  '⭐', '🌙', '🏠', '💼', '🎉', '🌈', '🚀', '🎸',
  '🦋', '🌺', '🐶', '🍀', '🏆', '💖',
];

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (title: string, emoji?: string) => Promise<void>;
};

export function CreateListModal({ visible, onClose, onSubmit }: Props) {
  const [title, setTitle] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmed = title.trim();
    if (!trimmed) return;

    setIsSubmitting(true);
    try {
      await onSubmit(trimmed, selectedEmoji);
      setTitle('');
      setSelectedEmoji(undefined);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setSelectedEmoji(undefined);
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
              新しいリストを作成
            </Text>
            <TouchableOpacity onPress={handleClose} className="p-1">
              <X size={20} color="#D97706" />
            </TouchableOpacity>
          </View>

          {/* タイトル入力 */}
          <TextInput
            className="border border-amber-200 rounded-xl px-4 py-3.5 text-base text-amber-900 bg-amber-50 mb-4"
            placeholder="リストのタイトル（例: カップルでやりたいこと）"
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
                onPress={() => setSelectedEmoji(undefined)}
                className={`w-10 h-10 rounded-xl items-center justify-center border ${
                  selectedEmoji === undefined
                    ? 'bg-amber-400 border-amber-400'
                    : 'bg-amber-50 border-amber-200'
                }`}
              >
                <Text className={`text-xs font-medium ${selectedEmoji === undefined ? 'text-white' : 'text-amber-600'}`}>
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

          {/* 作成ボタン */}
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
                作成する
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
