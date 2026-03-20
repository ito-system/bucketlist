import { createStackNavigator } from '@react-navigation/stack';
import { TabNavigator } from './TabNavigator';
import { ListDetailScreen } from '@/features/list/screens/ListDetailScreen';
import { ProfileEditScreen } from '@/features/profile/screens/ProfileEditScreen';
import { PasswordChangeScreen } from '@/features/profile/screens/PasswordChangeScreen';
import { TagManageScreen } from '@/features/tag/screens/TagManageScreen';

export type MainStackParamList = {
  Tabs: undefined;
  ListDetail: { listId: string; title: string };
  ProfileEdit: undefined;
  PasswordChange: undefined;
  TagManage: undefined;
};

const Stack = createStackNavigator<MainStackParamList>();

export function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen name="ListDetail" component={ListDetailScreen} />
      <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
      <Stack.Screen name="PasswordChange" component={PasswordChangeScreen} />
      <Stack.Screen name="TagManage" component={TagManageScreen} />
    </Stack.Navigator>
  );
}
