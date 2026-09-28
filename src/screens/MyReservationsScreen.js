// src/screens/MyReservationsScreen.js
// Question 9 – list of the customer's bookings. Each upcoming booking can be
// cancelled after an Alert confirmation. UI only – data and cancelReservation()
// come from the useReservation hook.

import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import useReservation, { formatDateLabel } from '../hooks/useReservation';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing } from '../theme/colors';

const STATUS_STYLE = {
  Pending: { icon: 'hourglass-outline', key: 'accent' },
  Confirmed: { icon: 'checkmark-circle', key: 'success' },
  Declined: { icon: 'close-circle', key: 'error' },
  Cancelled: { icon: 'ban-outline', key: 'textMuted' },
};

export default function MyReservationsScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { myReservations, cancelReservation } = useReservation();

  const confirmCancel = (r) =>
    Alert.alert(
      'Cancel reservation?',
      `Table ${r.tableNumber} on ${formatDateLabel(r.date)} at ${r.time} will be released.`,
      [
        { text: 'Keep it', style: 'cancel' },
        { text: 'Cancel booking', style: 'destructive', onPress: () => cancelReservation(r.id) },
      ],
    );

  if (myReservations.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <StatusBar style="light" />
        <View style={styles.emptyIcon}>
          <Ionicons name="calendar-outline" size={44} color={colors.primaryText} />
        </View>
        <Text style={styles.emptyTitle}>No reservations yet</Text>
        <Text style={styles.emptyText}>Book a table and it will appear here.</Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Reservation')}
        >
          <Text style={styles.primaryButtonText}>Book a table</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderItem = ({ item }) => {
    const s = STATUS_STYLE[item.status] ?? STATUS_STYLE.Pending;
    const statusColor = colors[s.key];
    const canCancel = item.status === 'Pending' || item.status === 'Confirmed';
    const [, , day] = item.date.split('-');
    return (
      <View style={[styles.card, !canCancel && styles.cardInactive]}>
        <View style={styles.dateBox}>
          <Text style={styles.dateDay}>{Number(day)}</Text>
          <Text style={styles.dateMonth}>{formatDateLabel(item.date).split(' ')[2]}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>
            {formatDateLabel(item.date)} · {item.time}
          </Text>
          <Text style={styles.cardMeta}>
            Table {item.tableNumber} · {item.partySize} {item.partySize === 1 ? 'guest' : 'guests'}
          </Text>
          {item.note ? <Text style={styles.cardNote}>“{item.note}”</Text> : null}
          <View style={styles.cardFooter}>
            <View style={[styles.status, { borderColor: statusColor }]}>
              <Ionicons name={s.icon} size={13} color={statusColor} />
              <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
            </View>
            {canCancel && (
              <TouchableOpacity onPress={() => confirmCancel(item)} hitSlop={10}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <FlatList
        data={myReservations}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Text style={styles.header}>
            {myReservations.length} {myReservations.length === 1 ? 'booking' : 'bookings'}
          </Text>
        }
      />
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    list: { padding: spacing.md },
    header: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 12 },
    card: {
      flexDirection: 'row',
      gap: 14,
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      padding: 14,
      marginBottom: 12,
      shadowColor: colors.shadow,
      shadowOpacity: 0.06,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
    cardInactive: { opacity: 0.6 },
    dateBox: {
      width: 58,
      height: 64,
      borderRadius: radius.md,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dateDay: { fontSize: 22, fontWeight: '800', color: colors.primaryText },
    dateMonth: { fontSize: 12, fontWeight: '700', color: colors.primaryText },
    cardTitle: { fontSize: 15.5, fontWeight: '800', color: colors.text },
    cardMeta: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
    cardNote: { fontSize: 12.5, color: colors.textMuted, fontStyle: 'italic', marginTop: 2 },
    cardFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    status: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      borderWidth: 1,
      borderRadius: radius.pill,
      paddingHorizontal: 9,
      paddingVertical: 3,
    },
    statusText: { fontSize: 12, fontWeight: '800' },
    cancelText: { color: colors.error, fontWeight: '800' },
    emptyWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
      backgroundColor: colors.background,
    },
    emptyIcon: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
    },
    emptyTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
    emptyText: { color: colors.textMuted, marginTop: 6 },
    primaryButton: {
      marginTop: spacing.lg,
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 13,
      borderRadius: radius.pill,
    },
    primaryButtonText: { color: colors.onPrimary, fontWeight: '800', fontSize: 15 },
  });
