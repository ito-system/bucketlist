import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ListTodo, PlusCircle, User } from "lucide-react-native";
import { BucketListScreen } from "@/features/bucket/screens/BucketListScreen";
import { AddBucketScreen } from "@/features/bucket/screens/AddBucketScreen";
import { ProfileScreen } from "@/features/profile/screens/ProfileScreen";

export type TabParamList = {
  BucketList: undefined;
  Add: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#6366F1",
        tabBarInactiveTintColor: "#9CA3AF",
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="BucketList"
        component={BucketListScreen}
        options={{
          title: "リスト",
          tabBarIcon: ({ color, size }) => (
            <ListTodo color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Add"
        component={AddBucketScreen}
        options={{
          title: "追加",
          tabBarIcon: ({ color, size }) => (
            <PlusCircle color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "プロフィール",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}
