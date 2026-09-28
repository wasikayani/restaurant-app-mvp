// src/navigation/AppNavigator.js
// All screens are registered here. In Q6/Q10 this becomes
// bottom tabs + nested stacks, shown according to the user's role.

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HeaderAvatar from '../components/HeaderAvatar';
import LoginScreen from '../screens/LoginScreen';
import MenuScreen from '../screens/MenuScreen';
import DashboardScreen from '../screens/DashboardScreen';
import { lightColors as colors } from '../theme/colors';

const Stack = createNativeStackNavigator();

// Header avatar (dark-green circle with initials) -> opens the account menu with Log out.
// (Proper logout with AuthContext comes in Q6.)
const avatarElement = (navigation, route) => (
  <HeaderAvatar user={route.params?.user} onLogout={() => navigation.replace('Login')} />
);

// On iOS 26+ the system wraps header buttons in a light "glass" bubble.
// headerRightItems with hidesSharedBackground: true removes that bubble,
// so our avatar looks exactly as designed. headerRight is used on Android.
const avatarOptions = (navigation, route) => ({
  headerRight: () => avatarElement(navigation, route),
  unstable_headerRightItems: () => [
    { type: 'custom', element: avatarElement(navigation, route), hidesSharedBackground: true },
  ],
});

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.white,
          headerTitleStyle: { fontWeight: '800' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen
          name="Menu"
          component={MenuScreen}
          options={({ navigation, route }) => ({
            title: 'Menu',
            headerBackVisible: false,
            ...avatarOptions(navigation, route),
          })}
        />
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={({ navigation, route }) => ({
            title: 'Dashboard',
            headerBackVisible: false,
            ...avatarOptions(navigation, route),
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
