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

// Header avatar (glass circle with initials) -> opens the account menu with Log out.
// (Proper logout with AuthContext comes in Q6.)
const accountButton = (navigation, route) => () => (
  <HeaderAvatar user={route.params?.user} onLogout={() => navigation.replace('Login')} />
);

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
            headerRight: accountButton(navigation, route),
          })}
        />
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={({ navigation, route }) => ({
            title: 'Dashboard',
            headerBackVisible: false,
            headerRight: accountButton(navigation, route),
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
