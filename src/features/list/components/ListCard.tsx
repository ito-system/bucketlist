import { View, Text, TouchableOpacity } from 'react-native';
import { Users, ChevronRight } from 'lucide-react-native';
import type { List } from '@/types';

type Props = {
  list: List;
  currentUserId: string;
  onPress: () => void;
  onLongPress?: () => void;
};

export function ListCard({ list, currentUserId, onPress, onLongPress }: Props) {
  const isOwner = list.ownerId === currentUserId;

  return (
    <TouchableOpacity
      className="bg-white rounded-2xl p-4 mb-3 flex-row items-center shadow-sm"
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View className="flex-1">
        <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
          {list.title}
        </Text>
        <View className="flex-row items-center mt-1 gap-x-1">
          <Users size={13} color="#9CA3AF" />
          <Text className="text-xs text-gray-400">
            {list.memberIds.length}人
            {isOwner ? ' · オーナー' : ''}
          </Text>
        </View>
      </View>
      <ChevronRight size={18} color="#D1D5DB" />
    </TouchableOpacity>
  );
}
