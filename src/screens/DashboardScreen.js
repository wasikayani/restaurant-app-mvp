// src/screens/DashboardScreen.js
// TEMPORARY placeholder for Question 3 – the real dashboard is built in Question 10.

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { lightColors as colors } from '../theme/colors';

export default function DashboardScreen({ route, navigation }) {
  const user = route.params?.user;
  return (
    <View style={styles.container}>
      <Ionicons name="stats-chart" size={64} color={colors.primary} />
      <Text style={styles.title}>Manager Dashboard</Text>
      <Text style={styles.text}>
        Welcome {user?.fullName ?? 'Manager'}. Orders, reservations and menu management arrive in
        Question 10.
      </Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.replace('Login')}>
        <Text style={styles.buttonText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: { fontSize: 24, fontWeight: '800', color: colors.text, marginTop: 16 },
  text: { color: colors.textMuted, textAlign: 'center', marginTop: 8 },
  button: {
    marginTop: 24,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: { color: colors.white, fontWeight: '700' },
});
