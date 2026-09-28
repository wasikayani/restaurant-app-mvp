// src/components/dashboard/ReservationsPanel.js
// Question 10 – Manager Dashboard › Reservations.
// New customer bookings arrive as "Pending"; the manager accepts (Confirmed)
// or declines them. The customer sees the new status in My Reservations.

import { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useReservationContext } from '../../context/ReservationContext';
import { useTheme } from '../../context/ThemeContext';
import { formatDateLabel } from '../../hooks/useReservation';
import { toDateKey } from '../../utils/reservationRules';
import { createPanelStyles } from './OrdersPanel';

const FILTERS = ['Pending', 'Upcoming', 'All'];
const STATUS_COLOR = { Pending: 'accent', Confirmed: 'success', Declined: 'error', Cancelled: 'textMuted' };

export default function ReservationsPanel() {
  const { reservations, updateReservationStatus } = useReservationContext();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [filter, setFilter] = useState('Pending');

  const visible = useMemo(() => {
    const today = toDateKey(new Date());
    const sorted = [...reservations].sort((a, b) =>
      `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`),
    );
    if (filter === 'Pending') return sorted.filter((r) => r.status === 'Pending');
    if (filter === 'Upcoming')
      return sorted.filter((r) => r.status === 'Confirmed' && r.date >= today);
    return sorted;
  }, [reservations, filter]);

  const decline = (r) =>
    Alert.alert('Decline booking?', `${r.name} · ${formatDateLabel(r.date)} at ${r.time}`, [
      { text: 'Back', style: 'cancel' },
      { text: 'Decline', style: 'destructive', onPress: () => updateReservationStatus(r.id, 'Declined') },
    ]);

  return (
    <View>
      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.filter, filter === f && styles.filterActive]}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {visible.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="calendar-outline" size={34} color={colors.textMuted} />
          <Text style={styles.emptyText}>
            {filter === 'Pending' ? 'No bookings waiting for approval.' : 'No bookings here.'}
          </Text>
        </View>
      ) : (
        visible.map((r) => {
          const color = colors[STATUS_COLOR[r.status] ?? 'textMuted'];
          return (
            <View key={r.id} style={styles.card}>
              <View style={styles.row}>
                <View style={styles.dateBox}>
                  <Text style={styles.dateDay}>{Number(r.date.split('-')[2])}</Text>
                  <Text style={styles.dateMonth}>{formatDateLabel(r.date).split(' ')[2]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{r.name}</Text>
                  <Text style={styles.meta}>
                    {formatDateLabel(r.date)} · {r.time} · Table {r.tableNumber}
                  </Text>
                  <Text style={styles.meta}>
                    {r.partySize} {r.partySize === 1 ? 'guest' : 'guests'} · {r.phone}
                  </Text>
                  {r.note ? <Text style={styles.note}>“{r.note}”</Text> : null}
                </View>
                <Text style={[styles.status, { color, borderColor: color }]}>{r.status}</Text>
              </View>

              {r.status === 'Pending' && (
                <View style={styles.actions}>
                  <TouchableOpacity style={styles.ghostBtn} onPress={() => decline(r)}>
                    <Text style={styles.ghostText}>Decline</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={() => updateReservationStatus(r.id, 'Confirmed')}
                    accessibilityLabel={`Accept booking for ${r.name}`}
                  >
                    <Ionicons name="checkmark" size={16} color={colors.onPrimary} />
                    <Text style={styles.primaryText}>Accept</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })
      )}
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    ...createPanelStyles(colors),
    row: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
    dateBox: {
      width: 52,
      height: 56,
      borderRadius: 12,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dateDay: { fontSize: 20, fontWeight: '800', color: colors.primaryText },
    dateMonth: { fontSize: 11.5, fontWeight: '700', color: colors.primaryText },
    name: { fontSize: 15.5, fontWeight: '800', color: colors.text },
    meta: { fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
    note: { fontSize: 12.5, color: colors.textMuted, fontStyle: 'italic', marginTop: 2 },
    status: {
      fontSize: 11.5,
      fontWeight: '800',
      borderWidth: 1,
      borderRadius: 999,
      paddingHorizontal: 8,
      paddingVertical: 2,
      overflow: 'hidden',
    },
  });
