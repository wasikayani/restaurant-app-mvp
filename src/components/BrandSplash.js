// src/components/BrandSplash.js
// Animated Green Fork launch screen, shown for ~2.6 s when the app opens.
// It sits ON TOP of the navigator (absolute fill), so the Login screen is
// already rendered underneath and appears instantly when the splash fades out.
//
// Animation timeline (all Animated API, useNativeDriver: true):
//   0.00s  logo tile pops in (spring)            – scale 0.6 → 1
//   0.15s  fork slides up into the tile           – translateY 40 → 0
//   0.55s  leaf "grows" out of the fork           – scale 0 → 1, rotate -40° → 0°
//   0.90s  two rings pulse out behind the logo    – loop
//   0.95s  "Green Fork" + tagline fade/slide in
//   1.00s  progress bar fills to 100%
//   2.40s  whole splash fades out → onFinish()

import { useEffect, useState } from 'react';
import { View, Text, Animated, Easing, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const forkImage = require('../../assets/brand/logo-fork.png');
const leafImage = require('../../assets/brand/logo-leaf.png');

const LOGO = 132; // tile size
const BAR_WIDTH = 140;

export default function BrandSplash({ onFinish }) {
  // lazy initial state → each Animated.Value is created once
  const [anim] = useState(() => ({
    tile: new Animated.Value(0),
    fork: new Animated.Value(0),
    leaf: new Animated.Value(0),
    text: new Animated.Value(0),
    bar: new Animated.Value(0),
    ring1: new Animated.Value(0),
    ring2: new Animated.Value(0),
    fade: new Animated.Value(1),
  }));

  useEffect(() => {
    const ease = Easing.out(Easing.cubic);
    const ring = (value, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, { toValue: 1, duration: 1400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(value, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
      );

    const rings = Animated.parallel([ring(anim.ring1, 900), ring(anim.ring2, 1600)]);
    rings.start();

    const intro = Animated.sequence([
      Animated.parallel([
        Animated.spring(anim.tile, { toValue: 1, friction: 6, tension: 70, useNativeDriver: true }),
        Animated.timing(anim.fork, { toValue: 1, duration: 550, delay: 150, easing: ease, useNativeDriver: true }),
        Animated.spring(anim.leaf, { toValue: 1, friction: 5, tension: 60, delay: 550, useNativeDriver: true }),
        Animated.timing(anim.text, { toValue: 1, duration: 600, delay: 950, easing: ease, useNativeDriver: true }),
        // the bar uses scaleX so it can run on the native driver
        Animated.timing(anim.bar, { toValue: 1, duration: 1300, delay: 1000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
      Animated.timing(anim.fade, { toValue: 0, duration: 380, easing: Easing.in(Easing.quad), useNativeDriver: true }),
    ]);

    intro.start(({ finished }) => {
      if (finished) onFinish?.();
    });

    // cleanup: stop animations if the component unmounts early
    return () => {
      intro.stop();
      rings.stop();
    };
  }, [anim, onFinish]);

  const ringStyle = (value) => ({
    opacity: value.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 0.35, 0] }),
    transform: [{ scale: value.interpolate({ inputRange: [0, 1], outputRange: [1, 2.3] }) }],
  });

  return (
    <Animated.View style={[styles.container, { opacity: anim.fade }]} pointerEvents="none">
      <StatusBar style="light" />

      {/* soft decorative circles */}
      <View style={[styles.blob, styles.blobTop]} />
      <View style={[styles.blob, styles.blobBottom]} />

      <View style={styles.center}>
        <View style={styles.logoArea}>
          <Animated.View style={[styles.ring, ringStyle(anim.ring1)]} />
          <Animated.View style={[styles.ring, ringStyle(anim.ring2)]} />

          <Animated.View
            style={[
              styles.tile,
              {
                opacity: anim.tile,
                transform: [{ scale: anim.tile.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }],
              },
            ]}
          >
            <Animated.Image
              source={forkImage}
              style={[
                styles.layer,
                {
                  opacity: anim.fork,
                  transform: [{ translateY: anim.fork.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }],
                },
              ]}
            />
            <Animated.Image
              source={leafImage}
              style={[
                styles.layer,
                {
                  opacity: anim.leaf.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 1, 1] }),
                  transform: [
                    { scale: anim.leaf },
                    { rotate: anim.leaf.interpolate({ inputRange: [0, 1], outputRange: ['-40deg', '0deg'] }) },
                  ],
                },
              ]}
            />
          </Animated.View>
        </View>

        <Animated.View
          style={{
            alignItems: 'center',
            opacity: anim.text,
            transform: [{ translateY: anim.text.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
          }}
        >
          <Text style={styles.name}>
            Green <Text style={styles.nameAccent}>Fork</Text>
          </Text>
          <Text style={styles.tagline}>FRESH · FAST · CONTINENTAL</Text>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <View style={styles.barTrack}>
          <Animated.View
            style={[
              styles.barFill,
              {
                transform: [
                  // grow from the left edge: move left by half, then scale
                  { translateX: anim.bar.interpolate({ inputRange: [0, 1], outputRange: [-BAR_WIDTH / 2, 0] }) },
                  { scaleX: anim.bar },
                ],
              },
            ]}
          />
        </View>
        <Text style={styles.footerText}>Preparing your table…</Text>
      </View>
    </Animated.View>
  );
}

// Not themed on purpose: the launch screen always uses the brand emerald
// so it matches the app icon and the Expo Go loading screen.
const styles = StyleSheet.create({
  container: {
    // full-screen overlay (StyleSheet.absoluteFillObject was removed in RN 0.86)
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#047857',
    zIndex: 100,
    elevation: 100,
  },
  blob: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.06)' },
  blobTop: { width: 380, height: 380, top: -140, right: -120 },
  blobBottom: { width: 300, height: 300, bottom: -110, left: -110, backgroundColor: 'rgba(6,95,70,0.55)' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logoArea: {
    width: LOGO,
    height: LOGO,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  ring: {
    position: 'absolute',
    width: LOGO,
    height: LOGO,
    borderRadius: LOGO / 2,
    borderWidth: 2,
    borderColor: '#A7F3D0',
  },
  tile: {
    width: LOGO,
    height: LOGO,
    borderRadius: 36,
    backgroundColor: '#065F46',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.18)',
    overflow: 'hidden',
    shadowColor: '#022C22',
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  layer: { position: 'absolute', width: '100%', height: '100%' },
  name: { fontSize: 38, fontWeight: '800', color: '#FBF7EF', letterSpacing: 0.5 },
  nameAccent: { color: '#6EE7B7' },
  tagline: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(251,247,239,0.75)',
    letterSpacing: 3,
  },
  footer: { alignItems: 'center', paddingBottom: 64 },
  barTrack: {
    width: BAR_WIDTH,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.18)',
    overflow: 'hidden',
  },
  barFill: { width: BAR_WIDTH, height: 4, borderRadius: 2, backgroundColor: '#FBF7EF' },
  footerText: { marginTop: 12, fontSize: 12.5, color: 'rgba(251,247,239,0.7)', fontWeight: '600' },
});
