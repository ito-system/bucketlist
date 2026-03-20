import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Link, CheckCircle2, Circle, Clock } from 'lucide-react-native';
import type { Item, ItemStatus } from '@/types';

type Props = {
  item: Item;
  onPress: () => void;
};

const STATUS_CONFIG: Record<
  ItemStatus,
  { label: string; color: string; Icon: typeof Circle }
> = {
  todo: { label: 'やりたい', color: '#9CA3AF', Icon: Circle },
  doing: { label: 'チャレンジ中', color: '#F59E0B', Icon: Clock },
  done: { label: '達成！', color: '#10B981', Icon: CheckCircle2 },
};

export function ItemCard({ item, onPress }: Props) {
  const { label, color, Icon } = STATUS_CONFIG[item.status];

  return (
    <TouchableOpacity
      className="bg-white rounded-2xl mb-3 overflow-hidden shadow-sm"
      onPress={onPress}
      activeOpacity={0.7}
    >
      {item.imageURL ? (
        <Image
          source={{ uri: item.imageURL }}
          className="w-full h-40"
          resizeMode="cover"
        />
      ) : null}

      <View className="p-4">
        <View className="flex-row items-start justify-between gap-x-2">
          <Text
            className="flex-1 text-base font-semibold text-gray-900"
            numberOfLines={2}
          >
            {item.title}
          </Text>
          <View className="flex-row items-center gap-x-1 mt-0.5">
            <Icon size={14} color={color} />
            <Text className="text-xs font-medium" style={{ color }}>
              {label}
            </Text>
          </View>
        </View>

        {item.description ? (
          <Text className="text-sm text-gray-500 mt-1.5" numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}

        {item.url ? (
          <View className="flex-row items-center mt-2 gap-x-1">
            <Link size={12} color="#6366F1" />
            <Text
              className="text-xs text-primary"
              numberOfLines={1}
            >
              {item.url.replace(/^https?:\/\//, '')}
            </Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}
