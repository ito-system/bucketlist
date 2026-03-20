import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import type { AuthStackParamList } from '@/navigation/AuthNavigator';
import { useAuthStore } from '@/store/authStore';

type Props = StackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signUpWithEmail } = useAuthStore();

  const handleRegister = async () => {
    if (!displayName.trim()) {
      Alert.alert('入力エラー', '名前を入力してください');
      return;
    }
    if (!email.trim()) {
      Alert.alert('入力エラー', 'メールアドレスを入力してください');
      return;
    }
    if (password.length < 6) {
      Alert.alert('入力エラー', 'パスワードは6文字以上で入力してください');
      return;
    }

    setIsSubmitting(true);
    try {
      await signUpWithEmail(email.trim(), password, displayName.trim());
    } catch (e: any) {
      Alert.alert('登録失敗', getErrorMessage(e.code));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerClassName="flex-grow items-center justify-center px-6 py-12"
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-3xl font-bold text-primary mb-2">
          アカウント作成
        </Text>
        <Text className="text-gray-500 mb-10">
          無料でバケットリストを始めよう
        </Text>

        <View className="w-full gap-y-3">
          <TextInput
            className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900 bg-gray-50"
            placeholder="名前（表示名）"
            placeholderTextColor="#9CA3AF"
            value={displayName}
            onChangeText={setDisplayName}
            autoCapitalize="words"
          />
          <TextInput
            className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900 bg-gray-50"
            placeholder="メールアドレス"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900 bg-gray-50"
            placeholder="パスワード（6文字以上）"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            className="w-full bg-primary rounded-xl py-3.5 items-center mt-2"
            onPress={handleRegister}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-base">
                登録する
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          className="mt-8"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-gray-500">
            すでにアカウントをお持ちの方は{' '}
            <Text className="text-primary font-semibold">ログイン</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function getErrorMessage(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'このメールアドレスはすでに使用されています';
    case 'auth/invalid-email':
      return 'メールアドレスの形式が正しくありません';
    case 'auth/weak-password':
      return 'パスワードが弱すぎます。6文字以上で設定してください';
    case 'auth/network-request-failed':
      return 'ネットワークエラーが発生しました';
    default:
      return '登録に失敗しました。再度お試しください';
  }
}
