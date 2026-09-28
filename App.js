// App.js – entry point. Keep it small: providers + navigator only.
// ThemeProvider and AuthProvider wrap the whole app, so every screen
// can use useTheme() and useAuth().
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { ReservationProvider } from './src/context/ReservationContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          {/* Reservations are app-wide so the manager can see customers' bookings */}
          <ReservationProvider>
            <AppNavigator />
          </ReservationProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
