import { View, Text } from "react-native";
import type { StackScreenProps } from "@react-navigation/stack";
import type { AuthStackParamList } from "@/navigation/AuthNavigator";

type Props = StackScreenProps<AuthStackParamList, "Register">;

export function RegisterScreen({ navigation }: Props) {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-2xl font-bold text-primary mb-8">アカウント作成</Text>
      {/* TODO: フォーム実装 */}
    </View>
  );
}
