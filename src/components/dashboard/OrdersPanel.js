// src/components/dashboard/OrdersPanel.js
// Question 10 – Manager Dashboard › Incoming Orders.
// The manager moves each order forward (Pending → Preparing → Ready → Served)
// or cancels it. Changes go through the SAME orders reducer the customer uses,
// so the customer's tracking screen updates instantly.

import { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOrders } from '../../context/OrdersContext';
import { useTheme } from '../../context/ThemeContext';
import OrderStatusBadge from '../OrderStatusBadge';
import {
  ORDER_ACTIONS,
  ORDER_TYPES,
  CANCELLABLE_STATUSES,
  getNextStatus,
  isFinalStatus,
} from '../../reducers/ordersReducer';
import { radius, spacing } from '../../theme/colors';

const NEXT_LABEL = { Preparing: 'Start preparing', Ready: 'Mark ready', Served: 'Mark served' };
const FILTERS = ['Active', 'Completed', 'All'];

const formatPrice = (value) => `Rs ${Math.round(value).toLocaleString('en-PK')}`;
const timeOf = (ms) => {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export default function OrdersPanel() {
  const { orders, dispatch } = useOrders();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [filter, setFilter] = useState('Active');

  const visible = useMemo(() => {
    if (filter === 'Active') return orders.filter((o) => !isFinalStatus(o.status));
    if (filter === 'Completed') return orders.filter((o) => isFinalStatus(o.status));
    return orders;
  }, [orders, filter]);

  const advance = (order) => {
    const next = getNextStatus(order.status);
    if (next) dispatch({ type: ORDER_ACTIONS.UPDATE_STATUS, payload: { id: order.id, status: next } });
  };

  const cancel = (order) =>
    Alert.alert(`Cancel ${order.id}?`, `${order.customerName} will see the order as cancelled.`, [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Cancel order',
        style: 'destructive',
        onPress: () => dispatch({ type: ORDER_ACTIONS.CANCEL_ORDER, payload: { id: order.id } }),
      },
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
          <Ionicons name="receipt-outline" size={34} color={colors.textMuted} />
          <Text style={styles.emptyText}>
            {filter === 'Active' ? 'No active orders right now.' : 'No orders here yet.'}
          </Text>
        </View>
      ) : (
        visible.map((order) => {
          const next = getNextStatus(order.status);
          const canAdvance = next && !isFinalStatus(order.status);
          return (
            <View key={order.id} style={styles.card}>
              <View style={styles.top}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.id}>
                    {order.id} <Text style={styles.time}>· {timeOf(order.timestamp)}</Text>
                  </Text>
                  <Text style={styles.customer}>{order.customerName}</Text>
                </View>
                <OrderStatusBadge status={order.status} />
              </View>

              <View style={styles.typeRow}>
                <Ionicons
                  name={order.type === ORDER_TYPES.DINE_IN ? 'restaurant-outline' : 'bag-handle-outline'}
                  size={15}
                  color={colors.primaryText}
                />
                <Text style={styles.typeText}>
                  {order.type === ORDER_TYPES.DINE_IN
                    ? `Dine-in · Table ${order.tableNumber}`
                    : `Takeaway · Pickup ${order.pickupTime}`}
                </Text>
                <Text style={styles.total}>{formatPrice(order.total)}</Text>
              </View>

              {order.items.map((i) => (
                <Text key={i.id} style={styles.item}>
                  {i.quantity}× {i.name}
                  {i.note ? <Text style={styles.note}>  “{i.note}”</Text> : null}
                </Text>
              ))}

              {(canAdvance || CANCELLABLE_STATUSES.includes(order.status)) && (
                <View style={styles.actions}>
                  {CANCELLABLE_STATUSES.includes(order.status) && (
                    <TouchableOpacity style={styles.ghostBtn} onPress={() => cancel(order)}>
                      <Text style={styles.ghostText}>Cancel</Text>
                    </TouchableOpacity>
                  )}
                  {canAdvance && (
                    <TouchableOpacity
                      style={styles.primaryBtn}
                      onPress={() => advance(order)}
                      accessibilityLabel={`${NEXT_LABEL[next]} ${order.id}`}
                    >
                      <Text style={styles.primaryText}>{NEXT_LABEL[next]}</Text>
                      <Ionicons name="arrow-forward" size={16} color={colors.onPrimary} />
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          );
        })
      )}
    </View>
  );
}

export const createPanelStyles = (colors) => ({
  filters: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  filter: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontWeight: '700', color: colors.text, fontSize: 13 },
  filterTextActive: { color: colors.onPrimary },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: 12,
    shadowColor: colors.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  empty: { alignItems: 'center', paddingVertical: 36, gap: 8 },
  emptyText: { color: colors.textMuted, fontWeight: '600' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 12 },
  ghostBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  ghostText: { fontWeight: '800', color: colors.error },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  primaryText: { fontWeight: '800', color: colors.onPrimary },
});

const createStyles = (colors) =>
  StyleSheet.create({
    ...createPanelStyles(colors),
    top: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
    id: { fontSize: 16, fontWeight: '800', color: colors.text },
    time: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
    customer: { fontSize: 13.5, color: colors.textMuted, marginTop: 1 },
    typeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 10,
      marginBottom: 6,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    },
    typeText: { flex: 1, fontSize: 13.5, fontWeight: '700', color: colors.text },
    total: { fontSize: 15, fontWeight: '800', color: colors.primaryText },
    item: { fontSize: 13.5, color: colors.text, marginTop: 2 },
    note: { fontStyle: 'italic', color: colors.textMuted },
    spacer: { height: spacing.sm },
  });
