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
import { ArrowLeft, CheckCircle2, Circle, Eye, EyeOff } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { AdBanner } from '@/components/AdBanner';
import { validatePassword, PASSWORD_RULES } from '@/lib/passwordValidation';

export function PasswordChangeScreen() {
  const navigation = useNavigation();
  const { changePassword } = useAuthStore();

  const [currentPassword, setCurrentPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const validation = validatePassword(newPassword);
  const showValidation = newPassword.length > 0;

  const passwordsMatch = newPassword === confirmPassword;
  const showConfirmError = confirmPassword.length > 0 && !passwordsMatch;
  const showConfirmSuccess = confirmPassword.length > 0 && passwordsMatch;

  const canSubmit =
    currentPassword.length > 0 &&
    validation.isValid &&
    confirmPassword.length > 0 &&
    passwordsMatch;

  const handleSave = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);
      Alert.alert('変更しました', 'パスワードを変更しました', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('エラー', getErrorMessage(e.code));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-rose-50">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* ヘッダー */}
        <View className="flex-row items-center justify-between px-4 pt-2 pb-4 bg-rose-50">
          <TouchableOpacity
            className="w-9 h-9 items-center justify-center"
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={22} color="#111827" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-900">パスワード変更</Text>
          <View className="w-9" />
        </View>

        <ScrollView keyboardShouldPersistTaps="handled" className="flex-1 px-5 pt-4">

          {/* 現在のパスワード */}
          <Text className="text-sm font-medium text-gray-700 mb-1.5">
            現在のパスワード
          </Text>
          <View className="flex-row items-center border border-gray-200 rounded-xl px-4 bg-white mb-5">
            <TextInput
              className="flex-1 py-3.5 text-base text-gray-900"

              placeholder="現在のパスワードを入力"
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

          {/* 新しいパスワード */}
          <Text className="text-sm font-medium text-gray-700 mb-1.5">
            新しいパスワード
          </Text>
          <View className="flex-row items-center border border-gray-200 rounded-xl px-4 bg-white mb-3">
            <TextInput
              className="flex-1 py-3.5 text-base text-gray-900"

              placeholder="新しいパスワードを入力"
              placeholderTextColor="#9CA3AF"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showNewPassword}
            />
            <TouchableOpacity
              onPress={() => setShowNewPassword((v) => !v)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              {showNewPassword ? (
                <EyeOff size={18} color="#9CA3AF" />
              ) : (
                <Eye size={18} color="#9CA3AF" />
              )}
            </TouchableOpacity>
          </View>

          {/* バリデーションチェックリスト */}
          {showValidation && (
            <View className="bg-white border border-gray-100 rounded-xl px-4 py-3 mb-4 gap-y-2.5">
              {PASSWORD_RULES.map((rule) => {
                const met = validation[rule.key];
                return (
                  <View key={rule.key} className="flex-row items-center gap-x-2">
                    {met ? (
                      <CheckCircle2 size={15} color="#10B981" />
                    ) : (
                      <Circle size={15} color="#EF4444" />
                    )}
                    <Text
                      className={`text-sm ${met ? 'text-emerald-600' : 'text-red-500'}`}
                    >
                      {rule.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* 確認用パスワード */}
          <Text className="text-sm font-medium text-gray-700 mb-1.5">
            新しいパスワード（確認）
          </Text>
          <View
            className={`flex-row items-center border rounded-xl px-4 bg-white mb-1 ${
              showConfirmError
                ? 'border-red-300'
                : showConfirmSuccess
                  ? 'border-emerald-400'
                  : 'border-gray-200'
            }`}
          >
            <TextInput
              className="flex-1 py-3.5 text-base text-gray-900"

              placeholder="もう一度入力してください"
              placeholderTextColor="#9CA3AF"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword((v) => !v)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              {showConfirmPassword ? (
                <EyeOff size={18} color="#9CA3AF" />
              ) : (
                <Eye size={18} color="#9CA3AF" />
              )}
            </TouchableOpacity>
          </View>

          {showConfirmError && (
            <Text className="text-xs text-red-500 mb-4">
              パスワードが一致しません
            </Text>
          )}
          {showConfirmSuccess && (
            <Text className="text-xs text-emerald-600 mb-4">
              パスワードが一致しています
            </Text>
          )}
          {!showConfirmError && !showConfirmSuccess && <View className="mb-4" />}

          {/* 変更ボタン */}
          <TouchableOpacity
            className={`rounded-xl py-4 items-center mb-8 ${
              canSubmit ? 'bg-primary' : 'bg-gray-200'
            }`}
            onPress={handleSave}
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text
                className={`font-semibold text-base ${
                  canSubmit ? 'text-white' : 'text-gray-400'
                }`}
              >
                パスワードを変更する
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
      <AdBanner />
    </SafeAreaView>
  );
}

function getErrorMessage(code: string): string {
  switch (code) {
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return '現在のパスワードが正しくありません';
    case 'auth/weak-password':
      return 'パスワードが弱すぎます';
    case 'auth/requires-recent-login':
      return 'セキュリティのため、一度ログアウトして再ログインしてから変更してください';
    case 'auth/network-request-failed':
      return 'ネットワークエラーが発生しました';
    default:
      return 'パスワードの変更に失敗しました';
  }
}
