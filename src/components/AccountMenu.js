// src/components/AccountMenu.js
// Slide-up "account" sheet opened from the avatar in the header.
// Shows who is logged in (from AuthContext), a working Dark-mode switch
// (from ThemeContext), shortcuts, and Log out.
// Shortcuts: My Reservations (Q9, customers) and My Orders (Q10).

import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Switch,
  Alert,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { radius, spacing } from '../theme/colors';

export const getInitials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || '?';

export default function AccountMenu({
  visible,
  onClose,
  onOpenProfile,
  onOpenReservations,
  onOpenOrders,
}) {
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const styles = createStyles(colors);
  const isManager = user?.role === 'manager';

  const confirmLogout = () => {
    Alert.alert('Log out?', 'You will need to log in again to place orders.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: () => {
          onClose();
          logout(); // clears user in AuthContext -> navigator shows Login again
        },
      },
    ]);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      {/* Tap the dark area to close */}
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={styles.sheet}>
        <View style={styles.grabber} />

        {/* User card */}
        <View style={styles.userRow}>
          <View style={styles.bigAvatar}>
            <Text style={styles.bigAvatarText}>{getInitials(user?.fullName)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{user?.fullName ?? 'Guest'}</Text>
            <Text style={styles.email}>{user?.email ?? ''}</Text>
            <View style={styles.roleBadge}>
              <Ionicons
                name={isManager ? 'briefcase' : 'fast-food'}
                size={11}
                color={colors.primaryText}
              />
              <Text style={styles.roleText}>{isManager ? 'Manager' : 'Customer'}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} hitSlop={10} accessibilityLabel="Close">
            <Ionicons name="close" size={24} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* My Profile */}
        <TouchableOpacity
          style={styles.row}
          onPress={() => {
            onClose();
            onOpenProfile();
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="person-circle-outline" size={22} color={colors.primaryText} />
          <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>My Profile</Text>
            <Text style={styles.rowSub}>Name, email and role</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Dark mode switch (ThemeContext) */}
        <View style={styles.row}>
          <Ionicons name={isDark ? 'moon' : 'moon-outline'} size={22} color={colors.primaryText} />
          <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>Dark mode</Text>
            <Text style={styles.rowSub}>{isDark ? 'On' : 'Off'} · applies to the whole app</Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>

        {/* My Reservations (Q9) – customers only */}
        {onOpenReservations && (
          <TouchableOpacity
            style={styles.row}
            onPress={() => {
              onClose();
              onOpenReservations();
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="calendar-outline" size={22} color={colors.primaryText} />
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>My Reservations</Text>
              <Text style={styles.rowSub}>Upcoming table bookings</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}

        {/* My Orders (Q10) */}
        {onOpenOrders && (
          <TouchableOpacity
            style={styles.row}
            onPress={() => {
              onClose();
              onOpenOrders();
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="receipt-outline" size={22} color={colors.primaryText} />
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>My Orders</Text>
              <Text style={styles.rowSub}>Track your orders live</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}

        <View style={styles.divider} />

        {/* Log out */}
        <TouchableOpacity style={styles.row} onPress={confirmLogout} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={22} color={colors.error} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.rowLabel, { color: colors.error }]}>Log out</Text>
            <Text style={styles.rowSub}>Return to the login screen</Text>
          </View>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: colors.backdrop },
    sheet: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: spacing.lg - 4,
      paddingTop: 10,
      paddingBottom: 36,
    },
    grabber: {
      alignSelf: 'center',
      width: 40,
      height: 5,
      borderRadius: 3,
      backgroundColor: colors.border,
      marginBottom: 14,
    },
    userRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
      marginBottom: 6,
    },
    bigAvatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    bigAvatarText: { color: colors.onPrimary, fontWeight: '800', fontSize: 20 },
    name: { fontSize: 18, fontWeight: '800', color: colors.text },
    email: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
    roleBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      alignSelf: 'flex-start',
      backgroundColor: colors.primarySoft,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: radius.pill,
      marginTop: 6,
    },
    roleText: { fontSize: 11, fontWeight: '800', color: colors.primaryText },
    row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12 },
    rowLabel: { fontSize: 16, fontWeight: '700', color: colors.text },
    rowSub: { fontSize: 12.5, color: colors.textMuted, marginTop: 1 },
    divider: { height: 1, backgroundColor: colors.divider, marginVertical: 4 },
  });
