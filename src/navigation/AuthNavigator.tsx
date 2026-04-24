import { createStackNavigator } from "@react-navigation/stack";
import { LoginScreen } from "@/features/auth/screens/LoginScreen";
import { RegisterScreen } from "@/features/auth/screens/RegisterScreen";
import { LegalScreen } from "@/features/legal/screens/LegalScreen";

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  Legal: { type: 'terms' | 'privacy' | 'tokushoho' };
};

const Stack = createStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Legal">
        {({ route }) => <LegalScreen type={route.params.type} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
