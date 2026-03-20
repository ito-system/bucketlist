import { View, Text } from "react-native";
import type { StackScreenProps } from "@react-navigation/stack";
import type { AuthStackParamList } from "@/navigation/AuthNavigator";

type Props = StackScreenProps<AuthStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-3xl font-bold text-primary mb-2">BucketList</Text>
      <Text className="text-gray-500 mb-8">夢を叶えるリストを作ろう</Text>
      {/* TODO: フォーム実装 */}
    </View>
  );
}
