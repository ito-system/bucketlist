import { View, Text } from "react-native";
import { useAuthStore } from "@/store/authStore";

export function ProfileScreen() {
  const { user } = useAuthStore();

  return (
    <View className="flex-1 bg-gray-50 px-4 pt-12">
      <Text className="text-2xl font-bold text-gray-900 mb-4">
        プロフィール
      </Text>
      {/* TODO: プロフィール実装 */}
    </View>
  );
}
