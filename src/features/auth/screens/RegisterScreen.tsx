import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TextInput } from '@/components/TextInput';
import { CheckCircle2, Circle, Eye, EyeOff, ArrowLeft } from 'lucide-react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import type { AuthStackParamList } from '@/navigation/AuthNavigator';
import { useAuthStore } from '@/store/authStore';
import { validatePassword, PASSWORD_RULES } from '@/lib/passwordValidation';

type Props = StackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signUpWithEmail } = useAuthStore();
  const insets = useSafeAreaInsets();

  const validation = validatePassword(password);
  const showValidation = password.length > 0;

  const handleRegister = async () => {
    if (!displayName.trim()) {
      Alert.alert('入力エラー', '名前を入力してください');
      return;
    }
    if (!email.trim()) {
      Alert.alert('入力エラー', 'メールアドレスを入力してください');
      return;
    }
    if (!validation.isValid) {
      Alert.alert('入力エラー', 'パスワードの要件を満たしていません');
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
      className="flex-1 bg-amber-50"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={{ paddingTop: insets.top }} className="px-4 bg-amber-50">
        <TouchableOpacity
          className="py-3 self-start"
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ArrowLeft size={22} color="#111827" />
        </TouchableOpacity>
      </View>
      <ScrollView
        contentContainerClassName="flex-grow items-center justify-center px-6 pb-12"
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-3xl font-bold text-primary mb-2">
          アカウント作成
        </Text>
        <Text className="text-amber-600 mb-10">
          無料で夢ノートを始めよう
        </Text>

        <View className="w-full gap-y-3">
          <TextInput
            className="w-full border border-amber-200 rounded-xl px-4 py-3.5 text-base text-amber-900 bg-white"
            style={{ lineHeight: 17 }}
            placeholder="名前（表示名）"
            placeholderTextColor="#D97706"
            value={displayName}
            onChangeText={setDisplayName}
            autoCapitalize="words"
          />
          <TextInput
            className="w-full border border-amber-200 rounded-xl px-4 py-3.5 text-base text-amber-900 bg-white"
            style={{ lineHeight: 17 }}
            placeholder="メールアドレス"
            placeholderTextColor="#D97706"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* パスワード（表示トグル付き） */}
          <View className="w-full flex-row items-center border border-amber-200 rounded-xl px-4 bg-white">
            <TextInput
              className="flex-1 py-3.5 text-base text-amber-900"

              placeholder="パスワード"
              placeholderTextColor="#D97706"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword((v) => !v)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              {showPassword ? (
                <EyeOff size={18} color="#D97706" />
              ) : (
                <Eye size={18} color="#D97706" />
              )}
            </TouchableOpacity>
          </View>

          {/* 入力中にリアルタイムで表示するバリデーションリスト */}
          {showValidation && (
            <View className="bg-amber-50 rounded-xl px-4 py-3 gap-y-2">
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

          <TouchableOpacity
            className={`w-full rounded-xl py-3.5 items-center mt-1 ${
              validation.isValid ? 'bg-primary' : 'bg-gray-200'
            }`}
            onPress={handleRegister}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text
                className={`font-semibold text-base ${
                  validation.isValid ? 'text-white' : 'text-gray-400'
                }`}
              >
                登録する
              </Text>
            )}
          </TouchableOpacity>

          {/* 利用規約・プライバシーポリシー同意文言 */}
          <Text className="text-xs text-gray-400 text-center mt-3 leading-5">
            登録することで{' '}
            <Text
              className="text-amber-600 underline"
              onPress={() => navigation.navigate('Legal', { type: 'terms' })}
            >
              利用規約
            </Text>
            {' '}および{' '}
            <Text
              className="text-amber-600 underline"
              onPress={() => navigation.navigate('Legal', { type: 'privacy' })}
            >
              プライバシーポリシー
            </Text>
            に{'\n'}同意したものとみなします。
          </Text>
        </View>

        <TouchableOpacity className="mt-8" onPress={() => navigation.goBack()}>
          <Text className="text-amber-700">
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
      return 'パスワードが弱すぎます';
    case 'auth/network-request-failed':
      return 'ネットワークエラーが発生しました';
    default:
      return '登録に失敗しました。再度お試しください';
  }
}
