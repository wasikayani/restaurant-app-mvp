// src/components/HeaderAvatar.js
// Frosted-glass circle with the user's initials, shown in the header.
// Tapping it opens the AccountMenu sheet (which contains Log out).

import { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import AccountMenu, { getInitials } from './AccountMenu';
import { lightColors as colors } from '../theme/colors';

export default function HeaderAvatar({ user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={styles.avatar}
        onPress={() => setMenuOpen(true)}
        activeOpacity={0.75}
        hitSlop={8}
        accessibilityLabel="Open account menu"
      >
        <Text style={styles.initials}>{getInitials(user?.fullName)}</Text>
      </TouchableOpacity>

      <AccountMenu
        visible={menuOpen}
        user={user}
        onClose={() => setMenuOpen(false)}
        onLogout={onLogout}
      />
    </>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { color: colors.white, fontWeight: '800', fontSize: 13, letterSpacing: 0.5 },
});
