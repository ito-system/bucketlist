import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { TextInput } from '@/components/TextInput';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { AdBanner } from '@/components/AdBanner';

export function ProfileEditScreen() {
  const navigation = useNavigation();
  const { user, updateUserProfile } = useAuthStore();

  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEmailChanged = email.trim() !== user?.email;

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert('入力エラー', '名前を入力してください');
      return;
    }
    if (isEmailChanged && !currentPassword) {
      Alert.alert('入力エラー', 'メールアドレスを変更する場合は現在のパスワードが必要です');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateUserProfile({
        displayName: displayName.trim(),
        email: email.trim(),
        currentPassword: isEmailChanged ? currentPassword : undefined,
      });
      Alert.alert('保存しました', '', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('エラー', getErrorMessage(e.code ?? e.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* ヘッダー */}
        <View className="flex-row items-center justify-between px-4 pt-2 pb-4 bg-gray-50">
          <TouchableOpacity
            className="w-9 h-9 items-center justify-center"
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={22} color="#111827" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-900">プロフィール編集</Text>
          <View className="w-9" />
        </View>

        <ScrollView keyboardShouldPersistTaps="handled" className="flex-1 px-5">
          {/* アイコン */}
          <View className="items-center mt-4 mb-6">
            <View className="w-24 h-24 rounded-full bg-primary/10 items-center justify-center">
              <Text className="text-4xl font-bold text-primary">
                {user?.displayName?.charAt(0).toUpperCase() ?? '?'}
              </Text>
            </View>
          </View>

          {/* 名前 */}
          <Text className="text-sm font-medium text-gray-700 mb-1.5">名前</Text>
          <TextInput
            className="border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900 bg-white mb-4"

            value={displayName}
            onChangeText={setDisplayName}
            autoCapitalize="words"
            maxLength={50}
          />

          {/* メールアドレス */}
          <Text className="text-sm font-medium text-gray-700 mb-1.5">
            メールアドレス
          </Text>
          <TextInput
            className="border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900 bg-white mb-1"

            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* メール変更時のみ現在のパスワードを要求 */}
          {isEmailChanged && (
            <View className="mb-4">
              <Text className="text-xs text-gray-400 mb-2">
                メールアドレスを変更するには現在のパスワードが必要です
              </Text>
              <View className="flex-row items-center border border-amber-300 rounded-xl px-4 bg-white">
                <TextInput
                  className="flex-1 py-3.5 text-base text-gray-900"
      
                  placeholder="現在のパスワード"
                  placeholderTextColor="#9CA3AF"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry={!showCurrentPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowCurrentPassword((v) => !v)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  {showCurrentPassword ? (
                    <EyeOff size={18} color="#9CA3AF" />
                  ) : (
                    <Eye size={18} color="#9CA3AF" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {!isEmailChanged && <View className="mb-4" />}

          {/* 保存ボタン */}
          <TouchableOpacity
            className="bg-primary rounded-xl py-4 items-center mb-8"
            onPress={handleSave}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-base">保存する</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
      <AdBanner />
    </SafeAreaView>
  );
}

function getErrorMessage(codeOrMessage: string): string {
  switch (codeOrMessage) {
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return '現在のパスワードが正しくありません';
    case 'auth/email-already-in-use':
      return 'このメールアドレスはすでに使用されています';
    case 'auth/invalid-email':
      return 'メールアドレスの形式が正しくありません';
    case 'auth/requires-recent-login':
      return 'セキュリティのため、一度ログアウトして再ログインしてから変更してください';
    case 'auth/network-request-failed':
      return 'ネットワークエラーが発生しました';
    default:
      return codeOrMessage ?? '保存に失敗しました';
  }
}
