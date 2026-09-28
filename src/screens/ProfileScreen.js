// src/screens/ProfileScreen.js
// Question 6 – Profile and Theme screen (hook: useContext via useAuth + useTheme)
//
// Shows the logged-in user's name, email and role (from AuthContext)
// and a switch that toggles light / dark mode for the WHOLE app (ThemeContext).

import { View, Text, ScrollView, Switch, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getInitials } from '../components/AccountMenu';
import { radius, spacing } from '../theme/colors';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const styles = createStyles(colors);
  const isManager = user?.role === 'manager';

  const confirmLogout = () => {
    Alert.alert('Log out?', 'You will need to log in again to place orders.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: logout },
    ]);
  };

  const details = [
    { icon: 'person-outline', label: 'Full name', value: user?.fullName },
    { icon: 'mail-outline', label: 'Email', value: user?.email },
    {
      icon: isManager ? 'briefcase-outline' : 'fast-food-outline',
      label: 'Role',
      value: isManager ? 'Restaurant Manager' : 'Customer',
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StatusBar style="light" />

      {/* Header card */}
      <View style={styles.headerCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(user?.fullName)}</Text>
        </View>
        <Text style={styles.name}>{user?.fullName}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Ionicons
            name={isManager ? 'briefcase' : 'fast-food'}
            size={12}
            color={colors.primaryText}
          />
          <Text style={styles.roleText}>{isManager ? 'Manager' : 'Customer'}</Text>
        </View>
      </View>

      {/* Account details */}
      <Text style={styles.sectionTitle}>Account details</Text>
      <View style={styles.card}>
        {details.map((row, index) => (
          <View key={row.label} style={[styles.row, index > 0 && styles.rowBorder]}>
            <View style={styles.iconBox}>
              <Ionicons name={row.icon} size={18} color={colors.primaryText} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>{row.label}</Text>
              <Text style={styles.rowValue}>{row.value}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Appearance */}
      <Text style={styles.sectionTitle}>Appearance</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.iconBox}>
            <Ionicons name={isDark ? 'moon' : 'sunny'} size={18} color={colors.primaryText} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowValue}>Dark mode</Text>
            <Text style={styles.rowLabel}>
              {isDark ? 'Dark theme is on' : 'Light theme is on'} · changes every screen
            </Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
            accessibilityLabel="Toggle dark mode"
          />
        </View>
      </View>

      {/* Log out */}
      <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={20} color={colors.error} />
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>Green Fork · version 1.0.0</Text>
    </ScrollView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.md, paddingBottom: 40 },
    headerCard: {
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.md,
      shadowColor: colors.shadow,
      shadowOpacity: 0.06,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
    avatar: {
      width: 84,
      height: 84,
      borderRadius: 42,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 4,
      borderColor: colors.primarySoft,
      marginBottom: 12,
    },
    avatarText: { color: colors.onPrimary, fontSize: 28, fontWeight: '800' },
    name: { fontSize: 22, fontWeight: '800', color: colors.text },
    email: { fontSize: 14, color: colors.textMuted, marginTop: 3 },
    roleBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: colors.primarySoft,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: radius.pill,
      marginTop: 10,
    },
    roleText: { fontSize: 12, fontWeight: '800', color: colors.primaryText },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
      marginLeft: 4,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      paddingHorizontal: spacing.md,
    },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
    rowBorder: { borderTopWidth: 1, borderTopColor: colors.divider },
    iconBox: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rowLabel: { fontSize: 12.5, color: colors.textMuted },
    rowValue: { fontSize: 15.5, fontWeight: '700', color: colors.text, marginTop: 1 },
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginTop: spacing.lg,
      borderWidth: 1.5,
      borderColor: colors.error,
      borderRadius: radius.md,
      paddingVertical: 14,
    },
    logoutText: { color: colors.error, fontWeight: '800', fontSize: 16 },
    footer: { textAlign: 'center', color: colors.textMuted, fontSize: 12, marginTop: spacing.lg },
  });
