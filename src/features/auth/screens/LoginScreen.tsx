import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { TextInput } from '@/components/TextInput';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import type { StackScreenProps } from '@react-navigation/stack';
import type { AuthStackParamList } from '@/navigation/AuthNavigator';
import { useAuthStore } from '@/store/authStore';

// OAuth リダイレクト後のブラウザセッションをアプリ側で完了させる
WebBrowser.maybeCompleteAuthSession();

type Props = StackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signInWithEmail, signInWithGoogle } = useAuthStore();

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID,
  });

  useEffect(() => {
    if (response?.type !== 'success') return;

    // authorization code フロー（デフォルト）: PKCE 交換後に authentication に idToken が入る
    const idToken = response.authentication?.idToken;
    const accessToken = response.authentication?.accessToken;

    if (!idToken && !accessToken) {
      Alert.alert('エラー', 'Google からトークンを取得できませんでした');
      return;
    }

    setIsSubmitting(true);
    signInWithGoogle(idToken ?? null, accessToken ?? null)
      .catch(() => Alert.alert('エラー', 'Google ログインに失敗しました'))
      .finally(() => setIsSubmitting(false));
  }, [response]);

  const handleEmailLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('入力エラー', 'メールアドレスとパスワードを入力してください');
      return;
    }
    setIsSubmitting(true);
    try {
      await signInWithEmail(email.trim(), password);
    } catch (e: any) {
      Alert.alert('ログイン失敗', getErrorMessage(e.code));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-amber-50"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-4xl font-bold text-primary mb-2">BucketList</Text>
        <Text className="text-amber-600 mb-10">夢を叶えるリストを作ろう</Text>

        <View className="w-full gap-y-3">
          <TextInput
            className="w-full border border-amber-200 rounded-xl px-4 py-3.5 text-base text-amber-900 bg-amber-50"

            placeholder="メールアドレス"
            placeholderTextColor="#D97706"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            className="w-full border border-amber-200 rounded-xl px-4 py-3.5 text-base text-amber-900 bg-amber-50"

            placeholder="パスワード（6文字以上）"
            placeholderTextColor="#D97706"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            className="w-full bg-primary rounded-xl py-3.5 items-center mt-1"
            onPress={handleEmailLogin}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-base">
                ログイン
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center w-full my-6">
          <View className="flex-1 h-px bg-amber-200" />
          <Text className="mx-3 text-amber-600 text-sm">または</Text>
          <View className="flex-1 h-px bg-amber-200" />
        </View>

        <TouchableOpacity
          className="w-full border border-amber-200 rounded-xl py-3.5 items-center"
          onPress={() => promptAsync()}
          disabled={!request || isSubmitting}
        >
          <Text className="text-amber-900 font-medium text-base">
            Google でログイン
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="mt-8"
          onPress={() => navigation.navigate('Register')}
        >
          <Text className="text-amber-700">
            アカウントをお持ちでない方は{' '}
            <Text className="text-primary font-semibold">新規登録</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function getErrorMessage(code: string): string {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'メールアドレスまたはパスワードが正しくありません';
    case 'auth/too-many-requests':
      return 'ログイン試行が多すぎます。しばらく待ってからお試しください';
    case 'auth/network-request-failed':
      return 'ネットワークエラーが発生しました';
    default:
      return 'ログインに失敗しました。再度お試しください';
  }
}
