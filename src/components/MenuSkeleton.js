// src/components/MenuSkeleton.js
// Grey "placeholder" cards that gently pulse while the menu is loading.
// Modern apps (Uber Eats, foodpanda) use this instead of an empty screen.

import { useState, useEffect } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { lightColors as colors, radius, spacing } from '../theme/colors';

export default function MenuSkeleton({ count = 4 }) {
  // Animated value created once (lazy useState initialiser)
  const [pulse] = useState(() => new Animated.Value(0.4));

  // Start an endless fade in/out loop when the skeleton appears,
  // and stop it when it disappears (cleanup function).
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <Animated.View key={i} style={[styles.card, { opacity: pulse }]}>
          <View style={styles.image} />
          <View style={styles.body}>
            <View style={[styles.line, { width: '70%', height: 14 }]} />
            <View style={[styles.line, { width: '95%' }]} />
            <View style={[styles.line, { width: '60%' }]} />
            <View style={styles.row}>
              <View style={[styles.line, { width: 70, height: 16 }]} />
              <View style={styles.button} />
            </View>
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 12,
    marginHorizontal: spacing.md,
    marginBottom: 14,
  },
  image: { width: 104, height: 104, borderRadius: radius.md, backgroundColor: '#ECE6DA' },
  body: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
  line: { height: 10, borderRadius: 6, backgroundColor: '#ECE6DA', marginBottom: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  button: { width: 64, height: 32, borderRadius: radius.pill, backgroundColor: '#ECE6DA' },
});
