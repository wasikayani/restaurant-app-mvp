// App.js – entry point. Keep it small: providers + navigator only.
// ThemeProvider and AuthProvider wrap the whole app, so every screen
// can use useTheme() and useAuth().
import { useState, useCallback } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { ReservationProvider } from './src/context/ReservationContext';
import AppNavigator from './src/navigation/AppNavigator';
import BrandSplash from './src/components/BrandSplash';

export default function App() {
  // Animated Green Fork launch screen, drawn on top of the app for ~2.6 s
  const [showSplash, setShowSplash] = useState(true);
  const hideSplash = useCallback(() => setShowSplash(false), []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          {/* Reservations are app-wide so the manager can see customers' bookings */}
          <ReservationProvider>
            <View style={{ flex: 1 }}>
              <AppNavigator />
              {showSplash && <BrandSplash onFinish={hideSplash} />}
            </View>
          </ReservationProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
