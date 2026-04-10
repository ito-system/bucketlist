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
      className="bg-white rounded-2xl p-4 mb-3 flex-row items-center"
      style={{ shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.14, shadowRadius: 16, elevation: 3 }}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      {/* アイコンエリア */}
      <View className="w-11 h-11 bg-amber-100 rounded-xl items-center justify-center mr-3">
        <Text className="text-xl font-bold text-amber-700">
          {list.title.charAt(0).toUpperCase()}
        </Text>
      </View>

      <View className="flex-1">
        <Text className="text-base font-semibold text-amber-900" numberOfLines={1}>
          {list.title}
        </Text>
        <View className="flex-row items-center mt-1 gap-x-1">
          <Users size={13} color="#D97706" />
          <Text className="text-xs text-amber-600">
            {list.memberIds.length}人
            {isOwner ? ' · オーナー' : ''}
          </Text>
        </View>
      </View>
      <ChevronRight size={18} color="#FDE68A" />
    </TouchableOpacity>
  );
}
