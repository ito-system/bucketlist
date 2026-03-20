import { View, Text } from "react-native";
import { useBucketStore } from "@/store/bucketStore";

export function BucketListScreen() {
  const { items } = useBucketStore();

  return (
    <View className="flex-1 bg-gray-50 px-4 pt-12">
      <Text className="text-2xl font-bold text-gray-900 mb-4">
        バケットリスト
      </Text>
      {/* TODO: リスト実装 */}
    </View>
  );
}
