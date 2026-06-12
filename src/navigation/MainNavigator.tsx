import { createStackNavigator } from '@react-navigation/stack';
import { TabNavigator } from './TabNavigator';
import { ListDetailScreen } from '@/features/list/screens/ListDetailScreen';
import { ProfileEditScreen } from '@/features/profile/screens/ProfileEditScreen';
import { PasswordChangeScreen } from '@/features/profile/screens/PasswordChangeScreen';
import { TagManageScreen } from '@/features/tag/screens/TagManageScreen';
import { UpgradeScreen } from '@/features/upgrade/screens/UpgradeScreen';
import { PlanSelectScreen } from '@/features/auth/screens/PlanSelectScreen';
import { LegalScreen } from '@/features/legal/screens/LegalScreen';
import { useAuthStore } from '@/store/authStore';

export type MainStackParamList = {
  Tabs: undefined;
  ListDetail: { listId: string; title: string };
  ProfileEdit: undefined;
  PasswordChange: undefined;
  TagManage: undefined;
  Upgrade: undefined;
  PlanSelect: undefined;
  Legal: { type: 'terms' | 'privacy' | 'tokushoho' };
};

const Stack = createStackNavigator<MainStackParamList>();

export function MainNavigator() {
  const { isNewUser, user } = useAuthStore();
  const showPlanSelect = isNewUser && user?.planType !== 'premium';

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={showPlanSelect ? 'PlanSelect' : 'Tabs'}
    >
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen name="PlanSelect" component={PlanSelectScreen} />
      <Stack.Screen name="ListDetail" component={ListDetailScreen} />
      <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
      <Stack.Screen name="PasswordChange" component={PasswordChangeScreen} />
      <Stack.Screen name="TagManage" component={TagManageScreen} />
      <Stack.Screen name="Upgrade" component={UpgradeScreen} />
      <Stack.Screen name="Legal">
        {({ route }) => <LegalScreen type={route.params.type} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
