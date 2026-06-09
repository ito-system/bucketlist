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
import Svg, { Path } from 'react-native-svg';
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { signInWithEmail, signInWithGoogle } = useAuthStore();

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: "838187642905-ke7vt3lu7j20mljn92bt36i7h7830utb.apps.googleusercontent.com",
    iosClientId: "838187642905-tbgc08ujqga1bogrcbe1p7787f2ice2n.apps.googleusercontent.com",
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
      setErrorMessage('メールアドレスとパスワードを入力してください');
      return;
    }
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await signInWithEmail(email.trim(), password);
    } catch (e: any) {
      console.error('[LoginScreen] login error:', e);
      setErrorMessage(getErrorMessage(e?.code));
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
        <Text className="text-4xl font-bold text-primary mb-2">夢ノート</Text>
        <Text className="text-amber-600 mb-10">やりたいことを、全部叶えよう</Text>

        <View className="w-full gap-y-3">
          <TextInput
            className="w-full border border-amber-200 rounded-xl px-4 py-3.5 text-base text-amber-900 bg-white"

            placeholder="メールアドレス"
            placeholderTextColor="#D97706"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            className="w-full border border-amber-200 rounded-xl px-4 py-3.5 text-base text-amber-900 bg-white"

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

          {errorMessage && (
            <Text className="text-red-500 text-sm text-center mt-1">
              {errorMessage}
            </Text>
          )}
        </View>

        <View className="flex-row items-center w-full my-6">
          <View className="flex-1 h-px bg-amber-200" />
          <Text className="mx-3 text-amber-600 text-sm">または</Text>
          <View className="flex-1 h-px bg-amber-200" />
        </View>

        <TouchableOpacity
          className="w-full border border-amber-200 rounded-xl py-3.5 bg-white flex-row items-center justify-center gap-x-2"
          onPress={() => promptAsync()}
          disabled={!request || isSubmitting}
        >
          <GoogleLogo size={20} />
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

function GoogleLogo({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <Path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <Path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <Path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </Svg>
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
