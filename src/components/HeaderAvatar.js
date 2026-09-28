// src/components/HeaderAvatar.js
// Dark-green circle with a white border and white initials, shown in the header.
// Tapping it opens the AccountMenu sheet (Profile, Dark mode, Log out).
// The user comes from AuthContext, so no props are needed.

import { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AccountMenu, { getInitials } from './AccountMenu';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function HeaderAvatar() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  const styles = createStyles(colors);
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
        onClose={() => setMenuOpen(false)}
        onOpenProfile={() => navigation.navigate('ProfileTab')}
      />
    </>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
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
