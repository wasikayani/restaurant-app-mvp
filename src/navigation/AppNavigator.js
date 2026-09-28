// src/navigation/AppNavigator.js
// Navigation structure (Q6):
//
//   RootStack
//   ├── Login                      (when nobody is logged in)
//   └── Main  -> Bottom Tabs       (when a user is logged in)
//        ├── DashboardTab -> Stack -> DashboardScreen   (MANAGER ONLY)
//        ├── MenuTab      -> Stack -> MenuScreen
//        └── ProfileTab   -> Stack -> ProfileScreen
//
// The Root stack shows Login OR Main depending on `user` from AuthContext.
// On logout, user becomes null, so React Navigation removes the whole Main
// tree and shows Login – the navigation stack is fully reset (no "back" to the app).

import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HeaderAvatar from '../components/HeaderAvatar';
import LoginScreen from '../screens/LoginScreen';
import MenuScreen from '../screens/MenuScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const RootStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const MenuStack = createNativeStackNavigator();
const DashboardStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

// Shared header style for every stack, built from the current theme.
// On iOS 26+ the system wraps header buttons in a light "glass" bubble;
// headerRightItems with hidesSharedBackground: true removes it.
const stackOptions = (colors) => ({
  headerStyle: { backgroundColor: colors.header },
  headerTintColor: colors.white,
  headerTitleStyle: { fontWeight: '800' },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colors.background },
  headerRight: () => <HeaderAvatar />,
  unstable_headerRightItems: () => [
    { type: 'custom', element: <HeaderAvatar />, hidesSharedBackground: true },
  ],
});

function MenuStackScreen() {
  const { colors } = useTheme();
  return (
    <MenuStack.Navigator screenOptions={stackOptions(colors)}>
      <MenuStack.Screen name="Menu" component={MenuScreen} options={{ title: 'Menu' }} />
    </MenuStack.Navigator>
  );
}

function DashboardStackScreen() {
  const { colors } = useTheme();
  return (
    <DashboardStack.Navigator screenOptions={stackOptions(colors)}>
      <DashboardStack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
    </DashboardStack.Navigator>
  );
}

function ProfileStackScreen() {
  const { colors } = useTheme();
  return (
    <ProfileStack.Navigator screenOptions={stackOptions(colors)}>
      <ProfileStack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'My Profile' }}
      />
    </ProfileStack.Navigator>
  );
}

const TAB_ICONS = {
  DashboardTab: ['stats-chart', 'stats-chart-outline'],
  MenuTab: ['restaurant', 'restaurant-outline'],
  ProfileTab: ['person', 'person-outline'],
};

function MainTabs() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const isManager = user?.role === 'manager';

  return (
    <Tab.Navigator
      // Manager lands on Dashboard, Customer lands on Menu (Q3 requirement)
      initialRouteName={isManager ? 'DashboardTab' : 'MenuTab'}
      screenOptions={({ route }) => ({
        headerShown: false, // each tab has its own stack header
        tabBarActiveTintColor: colors.primaryText,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        tabBarLabelStyle: { fontWeight: '700', fontSize: 11 },
        tabBarIcon: ({ focused, color, size }) => {
          const [active, inactive] = TAB_ICONS[route.name];
          return <Ionicons name={focused ? active : inactive} size={size} color={color} />;
        },
      })}
    >
      {/* Role-based navigation: Dashboard tab exists ONLY for managers */}
      {isManager && (
        <Tab.Screen
          name="DashboardTab"
          component={DashboardStackScreen}
          options={{ title: 'Dashboard' }}
        />
      )}
      <Tab.Screen name="MenuTab" component={MenuStackScreen} options={{ title: 'Menu' }} />
      <Tab.Screen name="ProfileTab" component={ProfileStackScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user } = useAuth();
  const { colors, isDark } = useTheme();

  // Give React Navigation our palette so its backgrounds match in light/dark mode
  const base = isDark ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.primaryText,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <RootStack.Screen name="Main" component={MainTabs} />
        ) : (
          <RootStack.Screen
            name="Login"
            component={LoginScreen}
            options={{ animationTypeForReplace: 'pop' }}
          />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
