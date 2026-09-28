// src/components/AccountMenu.js
// Slide-up "account" sheet opened from the avatar in the header.
// Shows who is logged in, account shortcuts, and a Log out action.
// Shortcuts marked "Soon" are switched on in later questions
// (Profile & Dark mode in Q6, Reservations in Q9, Orders in Q10).

import { Modal, View, Text, TouchableOpacity, Pressable, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { lightColors as colors, radius, spacing } from '../theme/colors';

export const getInitials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || '?';

const SHORTCUTS = [
  { icon: 'person-circle-outline', label: 'My Profile', sub: 'Name, email and role' },
  { icon: 'moon-outline', label: 'Dark mode', sub: 'Switch light / dark theme' },
  { icon: 'calendar-outline', label: 'My Reservations', sub: 'Upcoming table bookings' },
  { icon: 'receipt-outline', label: 'My Orders', sub: 'Track your orders' },
];

export default function AccountMenu({ visible, user, onClose, onLogout }) {
  const isManager = user?.role === 'manager';

  const confirmLogout = () => {
    Alert.alert('Log out?', 'You will need to log in again to place orders.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: () => {
          onClose();
          onLogout();
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
                color={colors.primaryDark}
              />
              <Text style={styles.roleText}>{isManager ? 'Manager' : 'Customer'}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} hitSlop={10} accessibilityLabel="Close">
            <Ionicons name="close" size={24} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Shortcuts (enabled in later questions) */}
        {SHORTCUTS.map((item) => (
          <View key={item.label} style={[styles.row, styles.rowDisabled]}>
            <Ionicons name={item.icon} size={22} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>{item.label}</Text>
              <Text style={styles.rowSub}>{item.sub}</Text>
            </View>
            <Text style={styles.soon}>Soon</Text>
          </View>
        ))}

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

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(6, 30, 22, 0.45)' },
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
    borderBottomColor: '#F0EBE0',
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
  bigAvatarText: { color: colors.white, fontWeight: '800', fontSize: 20 },
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
  roleText: { fontSize: 11, fontWeight: '800', color: colors.primaryDark },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12 },
  rowDisabled: { opacity: 0.55 },
  rowLabel: { fontSize: 16, fontWeight: '700', color: colors.text },
  rowSub: { fontSize: 12.5, color: colors.textMuted, marginTop: 1 },
  soon: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    backgroundColor: '#F3EFE6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  divider: { height: 1, backgroundColor: '#F0EBE0', marginVertical: 4 },
});
