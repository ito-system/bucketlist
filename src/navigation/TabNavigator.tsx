import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ListTodo, User } from 'lucide-react-native';
import { HomeScreen } from '@/features/list/screens/HomeScreen';
import { ProfileScreen } from '@/features/profile/screens/ProfileScreen';

export type TabParamList = {
  Home: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#F59E0B',
        tabBarInactiveTintColor: '#D97706',
        headerShown: false,
        tabBarStyle: {
          borderTopColor: '#FEF3C7',
          backgroundColor: '#ffffff',
          elevation: 0,
          shadowOpacity: 0,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'リスト',
          tabBarIcon: ({ color, size }) => (
            <ListTodo color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'プロフィール',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}
