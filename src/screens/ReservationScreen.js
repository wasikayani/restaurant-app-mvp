// src/screens/ReservationScreen.js
// Question 9 – Table Reservation screen.
// This file contains ONLY UI code. Every rule (availability, validation, saving)
// comes from the useReservation custom hook.

import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import FormInput from '../components/FormInput';
import SuccessModal, { SUCCESS_DURATION } from '../components/SuccessModal';
import useReservation, { formatDateLabel } from '../hooks/useReservation';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing } from '../theme/colors';

export default function ReservationScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const booking = useReservation();
  const { values, errors, slots, freeTables, selectedTable } = booking;

  // UI-only state: which popup is showing
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(null);
  const [saveError, setSaveError] = useState('');

  const onReview = () => booking.reviewBooking(() => setShowConfirm(true));

  const onConfirm = () => {
    const result = booking.createReservation();
    setShowConfirm(false);
    if (!result.ok) {
      setSaveError(result.message);
      return;
    }
    setSaveError('');
    setSuccess({
      title: 'Table requested!',
      message: `Table ${result.reservation.tableNumber} for ${result.reservation.partySize} on ${formatDateLabel(result.reservation.date)} at ${result.reservation.time}.`,
    });
    setTimeout(() => {
      setSuccess(null);
      navigation.navigate('MyReservations');
    }, SUCCESS_DURATION);
  };

  const upcomingCount = booking.myReservations.filter(
    (r) => r.status === 'Pending' || r.status === 'Confirmed',
  ).length;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Intro + link to My Reservations */}
        <View style={styles.introRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Book a table</Text>
            <Text style={styles.subtitle}>
              Reserve now, and your table is ready when you arrive.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.myButton}
            onPress={() => navigation.navigate('MyReservations')}
            accessibilityLabel="My reservations"
          >
            <Ionicons name="calendar" size={18} color={colors.primaryText} />
            {upcomingCount > 0 && (
              <View style={styles.myBadge}>
                <Text style={styles.myBadgeText}>{upcomingCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* 1. Date */}
        <Text style={styles.sectionTitle}>Date</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateRow}
        >
          {booking.dateOptions.map((d) => {
            const active = values.date === d.key;
            return (
              <TouchableOpacity
                key={d.key}
                style={[styles.dateChip, active && styles.dateChipActive]}
                onPress={() => booking.selectDate(d.key)}
              >
                <Text style={[styles.dateLabel, active && styles.textOnPrimary]}>{d.label}</Text>
                <Text style={[styles.dateDay, active && styles.textOnPrimary]}>{d.day}</Text>
                <Text style={[styles.dateMonth, active && styles.textOnPrimary]}>{d.month}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        {errors.date ? <Text style={styles.error}>{errors.date}</Text> : null}

        {/* 2. Party size */}
        <Text style={styles.sectionTitle}>Guests</Text>
        <View style={styles.guestCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.guestValue}>
              {values.partySize} {values.partySize === 1 ? 'guest' : 'guests'}
            </Text>
            <Text style={styles.hint}>
              {booking.minParty}–{booking.maxParty} people per booking
            </Text>
          </View>
          <View style={styles.stepper}>
            <TouchableOpacity
              style={[styles.stepBtn, values.partySize <= booking.minParty && styles.stepBtnOff]}
              onPress={() => booking.setPartySize(values.partySize - 1)}
              disabled={values.partySize <= booking.minParty}
              accessibilityLabel="Fewer guests"
            >
              <Ionicons name="remove" size={18} color={colors.primaryText} />
            </TouchableOpacity>
            <Text style={styles.stepValue}>{values.partySize}</Text>
            <TouchableOpacity
              style={[styles.stepBtn, values.partySize >= booking.maxParty && styles.stepBtnOff]}
              onPress={() => booking.setPartySize(values.partySize + 1)}
              disabled={values.partySize >= booking.maxParty}
              accessibilityLabel="More guests"
            >
              <Ionicons name="add" size={18} color={colors.primaryText} />
            </TouchableOpacity>
          </View>
        </View>
        {errors.partySize ? <Text style={styles.error}>{errors.partySize}</Text> : null}

        {/* 3. Time slots */}
        <View style={styles.slotHeader}>
          <Text style={styles.sectionTitle}>Time</Text>
          <View style={styles.legend}>
            <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
            <Text style={styles.legendText}>Selected</Text>
            <View style={[styles.legendDot, { backgroundColor: colors.error }]} />
            <Text style={styles.legendText}>Full</Text>
          </View>
        </View>
        <View style={styles.slotGrid}>
          {slots.map((s) => {
            const active = values.time === s.time;
            const disabled = s.status !== 'available';
            return (
              <TouchableOpacity
                key={s.time}
                style={[
                  styles.slot,
                  active && styles.slotActive,
                  s.status === 'full' && styles.slotFull,
                  s.status === 'tooSoon' && styles.slotPast,
                ]}
                onPress={() => booking.selectTime(s.time)}
                disabled={disabled}
                accessibilityLabel={`${s.time} ${disabled ? 'unavailable' : 'available'}`}
              >
                <Text
                  style={[
                    styles.slotTime,
                    active && styles.textOnPrimary,
                    s.status === 'full' && styles.slotFullText,
                    s.status === 'tooSoon' && styles.slotPastText,
                  ]}
                >
                  {s.time}
                </Text>
                <Text
                  style={[
                    styles.slotSub,
                    active && styles.textOnPrimary,
                    s.status === 'full' && styles.slotFullText,
                  ]}
                >
                  {s.status === 'full'
                    ? 'Full'
                    : s.status === 'tooSoon'
                      ? 'Closed'
                      : `${s.freeCount} ${s.freeCount === 1 ? 'table' : 'tables'}`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {errors.time ? <Text style={styles.error}>{errors.time}</Text> : null}

        {/* 4. Table */}
        {values.time && (
          <>
            <Text style={styles.sectionTitle}>Table</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tableRow}
            >
              {freeTables.map((t) => {
                const active = values.tableId === t.id;
                return (
                  <TouchableOpacity
                    key={t.id}
                    style={[styles.tableChip, active && styles.tableChipActive]}
                    onPress={() => booking.selectTable(t.id)}
                  >
                    <Ionicons
                      name="restaurant-outline"
                      size={16}
                      color={active ? colors.primaryText : colors.textMuted}
                    />
                    <View>
                      <Text style={[styles.tableName, active && { color: colors.primaryText }]}>
                        Table {t.number}
                      </Text>
                      <Text style={styles.tableMeta}>
                        {t.seats} seats · {t.area}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            {errors.tableId ? <Text style={styles.error}>{errors.tableId}</Text> : null}
          </>
        )}

        {/* 5. Contact details */}
        <Text style={styles.sectionTitle}>Contact details</Text>
        <FormInput
          icon="person-outline"
          placeholder="Full name"
          autoCapitalize="words"
          value={values.name}
          onChangeText={booking.setName}
          error={errors.name}
        />
        <FormInput
          icon="call-outline"
          placeholder="0300-1234567"
          keyboardType="phone-pad"
          value={values.phone}
          onChangeText={booking.setPhone}
          maxLength={12}
          error={errors.phone}
        />
        <FormInput
          icon="chatbubble-ellipses-outline"
          placeholder="Special request (optional) e.g. birthday, high chair"
          value={values.note}
          onChangeText={booking.setNote}
          maxLength={120}
        />
        {saveError ? <Text style={styles.error}>{saveError}</Text> : null}

        <TouchableOpacity style={styles.primaryButton} onPress={onReview} activeOpacity={0.85}>
          <Text style={styles.primaryButtonText}>Review booking</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.onPrimary} />
        </TouchableOpacity>
      </ScrollView>

      {/* Confirmation modal – summary before saving */}
      <Modal
        visible={showConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirm(false)}
      >
        <View style={styles.backdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalIcon}>
              <Ionicons name="calendar-outline" size={30} color={colors.primaryText} />
            </View>
            <Text style={styles.modalTitle}>Confirm your booking</Text>
            {[
              ['calendar-outline', 'Date', formatDateLabel(values.date)],
              ['time-outline', 'Time', values.time],
              ['people-outline', 'Guests', `${values.partySize}`],
              [
                'restaurant-outline',
                'Table',
                selectedTable ? `Table ${selectedTable.number} · ${selectedTable.area}` : '-',
              ],
              ['person-outline', 'Name', values.name],
              ['call-outline', 'Phone', values.phone],
              ...(values.note ? [['chatbubble-ellipses-outline', 'Request', values.note]] : []),
            ].map(([icon, label, value]) => (
              <View key={label} style={styles.summaryRow}>
                <Ionicons name={icon} size={17} color={colors.textMuted} />
                <Text style={styles.summaryLabel}>{label}</Text>
                <Text style={styles.summaryValue} numberOfLines={2}>
                  {value}
                </Text>
              </View>
            ))}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => setShowConfirm(false)}
              >
                <Text style={styles.secondaryText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
                <Text style={styles.primaryButtonText}>Confirm booking</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <SuccessModal visible={success !== null} title={success?.title} message={success?.message} />
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.md, paddingBottom: 40 },
    introRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    title: { fontSize: 24, fontWeight: '800', color: colors.text },
    subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 2 },
    myButton: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    myBadge: {
      position: 'absolute',
      top: -2,
      right: -2,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
    },
    myBadgeText: { color: colors.white, fontSize: 10, fontWeight: '800' },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
    },
    textOnPrimary: { color: colors.onPrimary },
    error: { color: colors.error, fontSize: 12.5, marginTop: 6, marginLeft: 4 },
    hint: { color: colors.textMuted, fontSize: 12.5, marginTop: 2 },

    // Dates
    dateRow: { gap: 10, paddingRight: spacing.md },
    dateChip: {
      width: 68,
      paddingVertical: 10,
      borderRadius: radius.md,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    dateChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    dateLabel: { fontSize: 11, fontWeight: '700', color: colors.textMuted },
    dateDay: { fontSize: 22, fontWeight: '800', color: colors.text, marginVertical: 1 },
    dateMonth: { fontSize: 11, fontWeight: '700', color: colors.textMuted },

    // Guests
    guestCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      padding: spacing.md,
    },
    guestValue: { fontSize: 17, fontWeight: '800', color: colors.text },
    stepper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primarySoft,
      borderRadius: radius.pill,
      padding: 4,
    },
    stepBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.card,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepBtnOff: { opacity: 0.4 },
    stepValue: {
      minWidth: 36,
      textAlign: 'center',
      fontSize: 17,
      fontWeight: '800',
      color: colors.text,
    },

    // Slots
    slotHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
    legend: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: spacing.sm },
    legendDot: { width: 9, height: 9, borderRadius: 5, marginLeft: 6 },
    legendText: { fontSize: 11.5, color: colors.textMuted, fontWeight: '600' },
    slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    slot: {
      width: '30.5%',
      paddingVertical: 10,
      borderRadius: radius.md,
      backgroundColor: colors.card,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: 'center',
    },
    slotActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    slotFull: { backgroundColor: colors.errorSoft, borderColor: colors.errorSoft },
    slotPast: { backgroundColor: colors.muted, borderColor: colors.muted, opacity: 0.6 },
    slotTime: { fontSize: 16, fontWeight: '800', color: colors.text },
    slotSub: { fontSize: 11, fontWeight: '700', color: colors.textMuted, marginTop: 2 },
    slotFullText: { color: colors.error, textDecorationLine: 'line-through' },
    slotPastText: { color: colors.textMuted },

    // Tables
    tableRow: { gap: 10, paddingRight: spacing.md },
    tableChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: radius.md,
      backgroundColor: colors.card,
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    tableChipActive: { borderColor: colors.primaryText, backgroundColor: colors.primarySoft },
    tableName: { fontSize: 14.5, fontWeight: '800', color: colors.text },
    tableMeta: { fontSize: 11.5, color: colors.textMuted },

    // Buttons
    primaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: colors.primary,
      height: 54,
      borderRadius: radius.md,
      marginTop: spacing.sm,
    },
    primaryButtonText: { color: colors.onPrimary, fontWeight: '800', fontSize: 16 },

    // Modal
    backdrop: {
      flex: 1,
      backgroundColor: colors.backdrop,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.lg,
    },
    modalCard: {
      width: '100%',
      maxWidth: 380,
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: spacing.lg,
    },
    modalIcon: {
      alignSelf: 'center',
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.text,
      textAlign: 'center',
      marginBottom: spacing.md,
    },
    summaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    summaryLabel: { width: 64, color: colors.textMuted, fontSize: 13.5 },
    summaryValue: {
      flex: 1,
      color: colors.text,
      fontSize: 14.5,
      fontWeight: '700',
      textAlign: 'right',
    },
    modalButtons: { flexDirection: 'row', gap: 10, marginTop: spacing.lg },
    secondaryButton: {
      flex: 1,
      height: 50,
      borderRadius: radius.md,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondaryText: { color: colors.text, fontWeight: '800', fontSize: 15 },
    confirmButton: {
      flex: 2,
      height: 50,
      borderRadius: radius.md,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
