import { View, Text, TouchableOpacity } from 'react-native';
import { Link, CheckCircle2, Circle, Clock, GripVertical } from 'lucide-react-native';
import type { Item, ItemStatus } from '@/types';
import { useTagStore } from '@/store/tagStore';
import { openSafeUrl } from '@/lib/url';

type Props = {
  item: Item;
  onPress: () => void;
  drag?: () => void;
  isActive?: boolean;
};

const STATUS_CONFIG: Record<
  ItemStatus,
  { label: string; color: string; Icon: typeof Circle }
> = {
  todo: { label: 'やりたい', color: '#F59E0B', Icon: Circle },
  doing: { label: 'チャレンジ中', color: '#F59E0B', Icon: Clock },
  done: { label: '達成！', color: '#10B981', Icon: CheckCircle2 },
};

export function ItemCard({ item, onPress, drag, isActive }: Props) {
  const { label, color, Icon } = STATUS_CONFIG[item.status];
  const { tags } = useTagStore();

  const itemTags = item.tagIds?.length
    ? tags.filter((t) => item.tagIds!.includes(t.tagId))
    : [];

  return (
    <TouchableOpacity
      className="bg-white rounded-2xl mb-3 overflow-hidden"
      style={isActive ? { opacity: 0.9, shadowColor: '#F59E0B', shadowOpacity: 0.2, shadowRadius: 10, elevation: 8 } : { shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.10, shadowRadius: 10, elevation: 2 }}
      onPress={onPress}
      activeOpacity={0.7}
    >

      {/* ステータスとドラッグハンドルを右カラムに集約し、items-center で垂直中央揃え */}
      <View className="p-4 flex-row items-center gap-x-3">
        {/* 左: タイトル・説明・URL・タグ */}
        <View className="flex-1">
          <Text
            className="text-base font-semibold text-gray-900"
            numberOfLines={2}
          >
            {item.title}
          </Text>

          {item.description ? (
            <Text className="text-sm text-gray-500 mt-1.5" numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}

          {item.url ? (
            <TouchableOpacity
              className="flex-row items-center mt-2 gap-x-1"
              onPress={() => openSafeUrl(item.url!)}
              activeOpacity={0.7}
            >
              <Link size={12} color="#F59E0B" />
              <Text className="text-xs text-amber-500" numberOfLines={1}>
                {item.url.replace(/^https?:\/\//, '')}
              </Text>
            </TouchableOpacity>
          ) : null}

          {itemTags.length > 0 ? (
            <View className="flex-row flex-wrap gap-1.5 mt-2">
              {itemTags.map((tag) => (
                <View
                  key={tag.tagId}
                  className="flex-row items-center gap-x-1 px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: tag.color + '22' }}
                >
                  <View
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  <Text
                    className="text-xs font-medium"
                    style={{ color: tag.color }}
                  >
                    {tag.name}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        {/* 右: ステータスバッジ + ドラッグハンドル（横並び・垂直中央） */}
        <View className="flex-row items-center gap-x-2">
          <View className="flex-row items-center gap-x-1">
            <Icon size={14} color={color} />
            <Text className="text-xs font-medium" style={{ color }}>
              {label}
            </Text>
          </View>

          {drag ? (
            <TouchableOpacity
              onPressIn={drag}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <GripVertical size={20} color="#D1D5DB" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}
