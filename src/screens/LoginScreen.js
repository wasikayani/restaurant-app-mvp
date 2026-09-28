// src/screens/LoginScreen.js
// Question 3 – Login & Signup in ONE screen, using only useState.
//
// State used:
//   mode          -> 'login' | 'signup'   (which form is showing)
//   form          -> all controlled input values
//   errors        -> { fieldName: 'message' }  (cleared as soon as that field is edited)
//   showPassword  -> eye icon toggle
//   isSubmitting  -> true during the fake 1 second "network" call
//   success       -> data for the animated confirmation popup (null = hidden)
//
// Animations use React Native's built-in Animated + LayoutAnimation APIs
// (no extra library). Animated values are created with
// useState(() => new Animated.Value(..)) so this screen still uses ONLY useState.
//
// Q9 refactor: the form values, errors, field-change handler and submit/validate
// flow now come from the reusable useForm custom hook (src/hooks/useForm.js).
//
// Q6 refactor: a successful login now stores the user in AuthContext
// (login(user) from useAuth) instead of passing it through navigation params.
// AppNavigator watches `user` and shows the right tabs automatically:
// Customer -> Menu tab, Manager -> Dashboard tab.

import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Keyboard,
  LayoutAnimation,
  ImageBackground,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StyleSheet,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import FormInput from '../components/FormInput';
import SuccessModal, { SUCCESS_DURATION } from '../components/SuccessModal';
import { findUser, emailExists, addUser } from '../data/users';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import useForm from '../hooks/useForm';
import { radius, spacing } from '../theme/colors';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80';

const EMPTY_FORM = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'customer',
};

// Simple, readable email check: something@something.something
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// At least 8 characters AND at least one digit
const PASSWORD_REGEX = /^(?=.*\d).{8,}$/;

export default function LoginScreen() {
  const { login } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(null); // { title, message }

  // --- Animation values (created once, never re-created) ---
  const [entrance] = useState(() => new Animated.Value(0)); // 0 -> 1 on first layout
  const [shake] = useState(() => new Animated.Value(0)); // horizontal wiggle on error
  const [hasEntered, setHasEntered] = useState(false);

  const isSignup = mode === 'signup';

  // Returns an errors object – empty object means the form is valid.
  // Signup mode checks extra fields (name, confirm password).
  const validate = (form) => {
    const e = {};
    if (isSignup && form.fullName.trim().length < 3) {
      e.fullName = 'Please enter your full name (at least 3 letters).';
    }
    if (!EMAIL_REGEX.test(form.email.trim())) {
      e.email = 'Enter a valid email, e.g. name@example.com';
    }
    if (!PASSWORD_REGEX.test(form.password)) {
      e.password = 'Password must be at least 8 characters and contain a number.';
    }
    if (isSignup && form.confirmPassword !== form.password) {
      e.confirmPassword = 'Passwords do not match.';
    }
    return e;
  };

  // Q9: useForm gives controlled values, errors (cleared as soon as a field is
  // edited), handleChange, handleSubmit (validate -> onValid / onInvalid) and reset.
  const { values: form, errors, handleChange, handleSubmit, reset } = useForm(EMPTY_FORM, validate);

  // Slide-up + fade-in of the form card, run once when the card is first laid out.
  // (With useEffect in Q4 we could run this "on mount"; for Q3 onLayout does the job.)
  const playEntrance = () => {
    if (hasEntered) return;
    setHasEntered(true);
    Animated.timing(entrance, {
      toValue: 1,
      duration: 650,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  // Quick left-right shake so the user feels that something is wrong
  const playShake = () => {
    shake.setValue(0);
    Animated.sequence(
      [12, -12, 8, -8, 4, 0].map((toValue) =>
        Animated.timing(shake, { toValue, duration: 55, useNativeDriver: true }),
      ),
    ).start();
  };

  // Smoothly animates the next layout change (fields appearing / errors showing)
  const animateNextLayout = () =>
    LayoutAnimation.configureNext(LayoutAnimation.create(250, 'easeInEaseOut', 'opacity'));

  const switchMode = (newMode) => {
    animateNextLayout();
    setMode(newMode);
    reset(); // back to empty fields, no errors
    setShowPassword(false);
  };

  const goToHome = (user) => {
    // Save the user globally. AppNavigator re-renders and swaps the Login
    // screen for the tabs (Customer -> Menu, Manager -> Dashboard).
    login(user);
  };

  // Show the animated confirmation, then navigate when the progress bar is full
  const showSuccessThenNavigate = (user, title, message) => {
    setSuccess({ title, message });
    setTimeout(() => {
      setSuccess(null);
      goToHome(user);
    }, SUCCESS_DURATION);
  };

  const onSubmit = () => {
    Keyboard.dismiss();
    animateNextLayout();
    // useForm validates; invalid -> shake, valid -> fake network call
    handleSubmit(submitValidForm, playShake);
  };

  const submitValidForm = () => {
    setIsSubmitting(true);

    // Pretend we are calling a server: wait 1 second
    setTimeout(() => {
      if (isSignup) {
        if (emailExists(form.email)) {
          setIsSubmitting(false);
          Alert.alert('Signup failed', 'An account with this email already exists. Please log in.');
          return;
        }
        const newUser = addUser(form);
        setIsSubmitting(false);
        const roleLabel = newUser.role === 'manager' ? 'Manager' : 'Customer';
        showSuccessThenNavigate(
          newUser,
          'Account created!',
          `${newUser.fullName} is now registered as a ${roleLabel}. Welcome to Green Fork!`,
        );
      } else {
        const user = findUser(form.email, form.password);
        setIsSubmitting(false);
        if (!user) {
          playShake();
          Alert.alert('Login failed', 'Incorrect email or password. Please try again.');
          return;
        }
        const firstName = user.fullName.split(' ')[0];
        showSuccessThenNavigate(
          user,
          `Welcome back, ${firstName}!`,
          user.role === 'manager'
            ? 'Logged in successfully. Opening your dashboard…'
            : 'Logged in successfully. Today’s specials are waiting.',
        );
      }
    }, 1000);
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="light" />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {/* ---------- Hero header with food photo ---------- */}
        <ImageBackground source={{ uri: HERO_IMAGE }} style={styles.hero}>
          <View style={styles.heroOverlay}>
            <Animated.View
              style={{
                alignItems: 'center',
                opacity: entrance,
                transform: [
                  { scale: entrance.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) },
                ],
              }}
            >
              <View style={styles.logo}>
                <Ionicons name="restaurant" size={30} color={colors.white} />
              </View>
              <Text style={styles.brand}>Green Fork</Text>
              <Text style={styles.tagline}>Order ahead. Skip the queue.</Text>
            </Animated.View>
          </View>
        </ImageBackground>

        {/* ---------- Form card (slides up on first layout) ---------- */}
        <Animated.View
          onLayout={playEntrance}
          style={[
            styles.card,
            {
              opacity: entrance,
              transform: [
                { translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [60, 0] }) },
              ],
            },
          ]}
        >
          {/* Login / Sign Up switch driven by the `mode` state */}
          <View style={styles.segment}>
            {['login', 'signup'].map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.segmentBtn, mode === m && styles.segmentBtnActive]}
                onPress={() => switchMode(m)}
                disabled={isSubmitting}
              >
                <Text style={[styles.segmentText, mode === m && styles.segmentTextActive]}>
                  {m === 'login' ? 'Login' : 'Sign Up'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.title}>{isSignup ? 'Create your account' : 'Welcome back'}</Text>
          <Text style={styles.subtitle}>
            {isSignup
              ? 'Join us to book tables and order in seconds.'
              : 'Log in to see today’s specials.'}
          </Text>

          {/* Fields shake together when validation fails */}
          <Animated.View style={{ transform: [{ translateX: shake }] }}>
            {isSignup && (
              <FormInput
                icon="person-outline"
                placeholder="Full name"
                autoCapitalize="words"
                value={form.fullName}
                onChangeText={(t) => handleChange('fullName', t)}
                error={errors.fullName}
              />
            )}

            <FormInput
              icon="mail-outline"
              placeholder="Email address"
              keyboardType="email-address"
              value={form.email}
              onChangeText={(t) => handleChange('email', t)}
              error={errors.email}
            />

            <FormInput
              icon="lock-closed-outline"
              placeholder="Password"
              secure
              showSecure={showPassword}
              onToggleSecure={() => setShowPassword((s) => !s)}
              value={form.password}
              onChangeText={(t) => handleChange('password', t)}
              error={errors.password}
            />

            {isSignup && (
              <>
                <FormInput
                  icon="shield-checkmark-outline"
                  placeholder="Confirm password"
                  secure
                  showSecure={showPassword}
                  onToggleSecure={() => setShowPassword((s) => !s)}
                  value={form.confirmPassword}
                  onChangeText={(t) => handleChange('confirmPassword', t)}
                  error={errors.confirmPassword}
                />

                {/* Role selector */}
                <Text style={styles.label}>I am a</Text>
                <View style={styles.roleRow}>
                  {[
                    { value: 'customer', label: 'Customer', icon: 'fast-food-outline' },
                    { value: 'manager', label: 'Manager', icon: 'briefcase-outline' },
                  ].map((r) => {
                    const active = form.role === r.value;
                    return (
                      <TouchableOpacity
                        key={r.value}
                        style={[styles.roleCard, active && styles.roleCardActive]}
                        onPress={() => handleChange('role', r.value)}
                      >
                        <Ionicons
                          name={r.icon}
                          size={22}
                          color={active ? colors.primaryText : colors.textMuted}
                        />
                        <Text style={[styles.roleText, active && styles.roleTextActive]}>
                          {r.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}
          </Animated.View>

          {/* Submit button – disabled + spinner while submitting */}
          <TouchableOpacity
            style={[styles.button, isSubmitting && styles.buttonDisabled]}
            onPress={onSubmit}
            disabled={isSubmitting || success !== null}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.buttonText}>{isSignup ? 'Create Account' : 'Login'}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => switchMode(isSignup ? 'login' : 'signup')}
            disabled={isSubmitting}
          >
            <Text style={styles.switchText}>
              {isSignup ? 'Already have an account? ' : 'New here? '}
              <Text style={styles.switchLink}>{isSignup ? 'Login' : 'Create an account'}</Text>
            </Text>
          </TouchableOpacity>

          {/* Demo credentials hint (helps the teacher test quickly) */}
          {!isSignup && (
            <View style={styles.hint}>
              <Ionicons name="information-circle-outline" size={16} color={colors.primaryText} />
              <Text style={styles.hintText}>
                Customer: customer@greenfork.pk / customer123{'\n'}
                Manager: manager@greenfork.pk / manager123
              </Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Animated success confirmation */}
      <SuccessModal visible={success !== null} title={success?.title} message={success?.message} />
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.background },
    scroll: { flexGrow: 1 },
    hero: { height: 280, backgroundColor: colors.primaryDark },
    heroOverlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 30,
    },
    logo: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      borderColor: 'rgba(255,255,255,0.35)',
      marginBottom: spacing.sm,
    },
    brand: { color: colors.white, fontSize: 32, fontWeight: '800', letterSpacing: 0.5 },
    tagline: { color: '#E7F5EE', fontSize: 15, marginTop: 4 },
    card: {
      flex: 1,
      backgroundColor: colors.background,
      marginTop: -28,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      padding: spacing.lg,
      paddingBottom: spacing.xl,
    },
    segment: {
      flexDirection: 'row',
      backgroundColor: colors.muted,
      borderRadius: radius.pill,
      padding: 4,
      marginBottom: spacing.lg,
    },
    segmentBtn: { flex: 1, paddingVertical: 10, borderRadius: radius.pill, alignItems: 'center' },
    segmentBtnActive: { backgroundColor: colors.primary },
    segmentText: { fontWeight: '600', color: colors.textMuted },
    segmentTextActive: { color: colors.white },
    title: { fontSize: 24, fontWeight: '800', color: colors.text },
    subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 4, marginBottom: spacing.lg },
    label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },
    roleRow: { flexDirection: 'row', gap: 12, marginBottom: spacing.lg },
    roleCard: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 14,
      borderRadius: radius.md,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.card,
      gap: 6,
    },
    roleCardActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
    roleText: { fontWeight: '600', color: colors.textMuted },
    roleTextActive: { color: colors.primaryText },
    button: {
      backgroundColor: colors.primary,
      height: 54,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: spacing.sm,
      shadowColor: colors.primary,
      shadowOpacity: 0.3,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: colors.white, fontSize: 16, fontWeight: '700' },
    switchText: { textAlign: 'center', marginTop: spacing.lg, color: colors.textMuted },
    switchLink: { color: colors.primaryText, fontWeight: '700' },
    hint: {
      flexDirection: 'row',
      gap: 8,
      backgroundColor: colors.primarySoft,
      padding: spacing.md,
      borderRadius: radius.md,
      marginTop: spacing.lg,
    },
    hintText: { flex: 1, fontSize: 12, color: colors.primaryText, lineHeight: 18 },
  });
