// App.js – entry point. Keep it small: providers + navigator only.
// ThemeProvider and AuthProvider wrap the whole app, so every screen
// can use useTheme() and useAuth().
// Q10: Reservation and Orders providers are app-wide (shared by customers
// and the manager) and load their saved data from AsyncStorage on start.
// A2 Q6: the menu now comes from the server (useApi in the screens), so the
// MenuProvider was removed. AuthProvider restores a saved login on start.
import { useState, useCallback } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ReservationProvider, useReservationContext } from './src/context/ReservationContext';
import { OrdersProvider, useOrders } from './src/context/OrdersContext';
import AppNavigator from './src/navigation/AppNavigator';
import BrandSplash from './src/components/BrandSplash';

// Inside the providers, so it can check that all saved data has loaded
function AppContent() {
  const { isHydrated: authReady } = useAuth();
  const { isHydrated: reservationsReady } = useReservationContext();
  const { isHydrated: ordersReady } = useOrders();
  const isReady = authReady && reservationsReady && ordersReady;

  // Animated Green Fork launch screen = loading screen while AsyncStorage loads
  const [showSplash, setShowSplash] = useState(true);
  const hideSplash = useCallback(() => setShowSplash(false), []);

  return (
    <View style={{ flex: 1 }}>
      <AppNavigator />
      {showSplash && <BrandSplash isReady={isReady} onFinish={hideSplash} />}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <ReservationProvider>
            <OrdersProvider>
              <AppContent />
            </OrdersProvider>
          </ReservationProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
