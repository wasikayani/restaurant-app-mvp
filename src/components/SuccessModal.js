// src/components/SuccessModal.js
// Animated confirmation popup shown after a successful login or signup.
// - Green circle with a tick "pops" in (spring animation)
// - Title + message fade in
// - A progress bar fills while we "take you" to the next screen
//
// Why useState for Animated.Value (and not useRef)?
// Question 3 is limited to useState. useState(() => new Animated.Value(0))
// creates the value ONCE (lazy initialiser) and keeps the same object on every
// render, because we never call the setter. (useRef is introduced in Q5.)

import { useState } from 'react';
import { Modal, View, Text, Animated, Easing, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { lightColors as colors, radius, spacing } from '../theme/colors';

export const SUCCESS_DURATION = 1800; // ms the popup stays before redirecting

export default function SuccessModal({ visible, title, message, icon = 'checkmark' }) {
  const [scale] = useState(() => new Animated.Value(0));
  const [fade] = useState(() => new Animated.Value(0));
  const [progress] = useState(() => new Animated.Value(0));

  // Modal's onShow runs when the popup appears – a perfect place to start
  // the animation without needing useEffect (Q4).
  const startAnimation = () => {
    scale.setValue(0);
    fade.setValue(0);
    progress.setValue(0);
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
      Animated.timing(fade, {
        toValue: 1,
        duration: 350,
        delay: 150,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(progress, {
        toValue: 1,
        duration: SUCCESS_DURATION - 100,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: false, // width cannot use the native driver
      }),
    ]).start();
  };

  const barWidth = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <Modal visible={visible} transparent animationType="fade" onShow={startAnimation}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Animated.View style={[styles.ring, { transform: [{ scale }] }]}>
            <View style={styles.circle}>
              <Ionicons name={icon} size={46} color={colors.white} />
            </View>
          </Animated.View>

          <Animated.View
            style={{
              opacity: fade,
              transform: [
                { translateY: fade.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) },
              ],
              alignItems: 'center',
            }}
          >
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
          </Animated.View>

          <View style={styles.track}>
            <Animated.View style={[styles.bar, { width: barWidth }]} />
          </View>
          <Text style={styles.redirect}>Redirecting…</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(6, 30, 22, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.card,
    borderRadius: 24,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  ring: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  circle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 22, fontWeight: '800', color: colors.text, textAlign: 'center' },
  message: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 21,
  },
  track: {
    width: '100%',
    height: 6,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    overflow: 'hidden',
    marginTop: spacing.lg,
  },
  bar: { height: '100%', backgroundColor: colors.primary, borderRadius: radius.pill },
  redirect: { fontSize: 12, color: colors.textMuted, marginTop: 8 },
});
