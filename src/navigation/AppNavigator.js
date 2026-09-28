// src/navigation/AppNavigator.js
// All screens are registered here. In Q6/Q10 this becomes
// bottom tabs + nested stacks, shown according to the user's role.

import { TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import LoginScreen from '../screens/LoginScreen';
import MenuScreen from '../screens/MenuScreen';
import DashboardScreen from '../screens/DashboardScreen';
import { lightColors as colors } from '../theme/colors';

const Stack = createNativeStackNavigator();

// Temporary logout button (proper logout with AuthContext comes in Q6)
// Solid white circle so it stands out clearly on the emerald header.
const logoutButton = (navigation) => () => (
  <TouchableOpacity
    onPress={() => navigation.replace('Login')}
    hitSlop={10}
    activeOpacity={0.8}
    accessibilityLabel="Log out"
    style={{
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.white,
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Ionicons name="log-out-outline" size={20} color={colors.primary} />
  </TouchableOpacity>
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
          options={({ navigation }) => ({
            title: 'Menu',
            headerBackVisible: false,
            headerRight: logoutButton(navigation),
          })}
        />
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={({ navigation }) => ({
            title: 'Dashboard',
            headerBackVisible: false,
            headerRight: logoutButton(navigation),
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
