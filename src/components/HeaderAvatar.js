// src/components/HeaderAvatar.js
// Dark-green circle with a white border and white initials, shown in the header.
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
    backgroundColor: colors.primaryDark, // slightly darker green than the header
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { color: colors.white, fontWeight: '800', fontSize: 13, letterSpacing: 0.5 },
});
