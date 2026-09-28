// src/screens/DashboardScreen.js
// Manager Dashboard – visible ONLY to users with role "manager" (see AppNavigator).
// Q6: themed placeholder. The full dashboard (Incoming Orders, Reservations,
// Menu Management tabs) is built in Question 10.

import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { menuItems } from '../data/menu';
import { radius, spacing } from '../theme/colors';

export default function DashboardScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const stats = [
    { icon: 'receipt-outline', label: 'Incoming orders', value: 0 },
    { icon: 'calendar-outline', label: 'Reservations', value: 0 },
    { icon: 'restaurant-outline', label: 'Menu items', value: menuItems.length },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StatusBar style="light" />
      <Text style={styles.hello}>Welcome back, {user?.fullName?.split(' ')[0]} 👋</Text>
      <Text style={styles.title}>Restaurant overview</Text>

      <View style={styles.statsRow}>
        {stats.map((s) => (
          <View key={s.label} style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name={s.icon} size={20} color={colors.primaryText} />
            </View>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.infoCard}>
        <Ionicons name="construct-outline" size={22} color={colors.accent} />
        <Text style={styles.infoText}>
          Order management, reservation approvals and menu editing will appear here.
        </Text>
      </View>
    </ScrollView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.md, paddingBottom: 40 },
    hello: { fontSize: 15, fontWeight: '600', color: colors.textMuted, marginTop: 4 },
    title: { fontSize: 24, fontWeight: '800', color: colors.text, marginTop: 2 },
    statsRow: { flexDirection: 'row', gap: 10, marginTop: spacing.lg },
    statCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      padding: 14,
      shadowColor: colors.shadow,
      shadowOpacity: 0.06,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
    statIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    statValue: { fontSize: 26, fontWeight: '800', color: colors.text, marginTop: 10 },
    statLabel: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
    infoCard: {
      flexDirection: 'row',
      gap: 12,
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      padding: spacing.md,
      marginTop: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      borderStyle: 'dashed',
    },
    infoText: { flex: 1, color: colors.textMuted, lineHeight: 20 },
  });
