import { View, Text, TouchableOpacity } from 'react-native';
import { Users, MoreVertical } from 'lucide-react-native';
import { ICON_MAP } from './CreateListModal';
import type { List } from '@/types';

type Props = {
  list: List;
  currentUserId: string;
  onPress: () => void;
  onMenuPress?: () => void;
};

export function ListCard({ list, currentUserId, onPress, onMenuPress }: Props) {
  const isOwner = list.ownerId === currentUserId;
  const IconComponent = list.emoji ? ICON_MAP[list.emoji] : null;

  return (
    <TouchableOpacity
      className="bg-white rounded-2xl p-5 mb-3 flex-row items-center"
      style={{ shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.14, shadowRadius: 16, elevation: 3 }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* アイコンエリア */}
      <View className="w-14 h-14 bg-amber-100 rounded-xl items-center justify-center mr-3">
        {IconComponent ? (
          <IconComponent size={28} color="#D97706" />
        ) : (
          <Text className="text-2xl font-bold text-amber-700">
            {list.title.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>

      <View className="flex-1">
        <Text className="text-base font-bold text-amber-900" numberOfLines={1}>
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

      {isOwner && onMenuPress ? (
        <TouchableOpacity
          onPress={onMenuPress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className="pl-2"
        >
          <MoreVertical size={18} color="#9CA3AF" />
        </TouchableOpacity>
      ) : null}
    </TouchableOpacity>
  );
}
