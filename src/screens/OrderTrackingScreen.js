// src/screens/OrderTrackingScreen.js
// Question 10 – live Order Tracking (hooks: useEffect + setInterval, useState, useContext)
//
// A simulated kitchen moves the order forward automatically:
//   Pending ── 10s ──► Preparing ── 20s ──► Ready ── 30s ──► Served
//
// HOW IT WORKS
//  - One setInterval ticks every second while the order is still active.
//  - Each tick works out the elapsed seconds since the order was placed and
//    dispatches UPDATE_STATUS with the status for that time. The reducer only
//    accepts FORWARD moves, so ticks that don't change anything are ignored.
//  - Elapsed time is based on the order's timestamp (not a counter), so it
//    stays correct after leaving the screen or restarting the app.
//  - Cleanup: clearInterval when the screen closes or the order becomes final
//    (Served / Cancelled), so no timer keeps running in the background.
//  - The manager can also move the order forward from the Dashboard.

import { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Alert, Animated, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useOrders } from '../context/OrdersContext';
import { useTheme } from '../context/ThemeContext';
import OrderStatusBadge, { STATUS_META } from '../components/OrderStatusBadge';
import {
  ORDER_ACTIONS,
  ORDER_STATUSES,
  ORDER_TYPES,
  STATUS_TIMINGS,
  CANCELLABLE_STATUSES,
  getStatusForElapsed,
  isFinalStatus,
  secondsBetween,
  statusIndex,
} from '../reducers/ordersReducer';
import { radius, spacing } from '../theme/colors';

const TICK_MS = 1000;
const formatPrice = (value) => `Rs ${Math.round(value).toLocaleString('en-PK')}`;
const formatClock = (seconds) =>
  `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

export default function OrderTrackingScreen({ route, navigation }) {
  const { orderId } = route.params;
  const { orders, dispatch } = useOrders();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const order = orders.find((o) => o.id === orderId);
  const status = order?.status;
  const timestamp = order?.timestamp;
  const isActive = Boolean(order) && !isFinalStatus(status);

  // Seconds since the order was placed (refreshed by the interval)
  const [elapsed, setElapsed] = useState(() => (timestamp ? secondsBetween(timestamp, Date.now()) : 0));

  // ---------------- setInterval: the simulated kitchen ----------------
  useEffect(() => {
    if (!isActive) return undefined; // Served / Cancelled -> no timer needed

    const tick = () => {
      const seconds = secondsBetween(timestamp, Date.now());
      setElapsed(seconds);
      dispatch({
        type: ORDER_ACTIONS.UPDATE_STATUS,
        payload: { id: orderId, status: getStatusForElapsed(seconds) },
      });
    };
    tick(); // run once immediately (e.g. after reopening the app)
    const intervalId = setInterval(tick, TICK_MS);

    return () => clearInterval(intervalId); // cleanup
  }, [isActive, timestamp, orderId, dispatch]);

  // Smoothly animated progress bar (0 -> 1 across the 4 steps)
  const [progress] = useState(() => new Animated.Value(0));
  const [pulse] = useState(() => new Animated.Value(1));
  const stepIndex = Math.max(0, statusIndex(status));

  useEffect(() => {
    Animated.timing(progress, {
      toValue: stepIndex / (ORDER_STATUSES.length - 1),
      duration: 500,
      useNativeDriver: false, // width cannot use the native driver
    }).start();
  }, [stepIndex, progress]);

  // Gentle pulse on the status icon while the order is active
  useEffect(() => {
    if (!isActive) {
      pulse.setValue(1);
      return undefined;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [isActive, pulse]);

  if (!order) {
    return (
      <View style={styles.emptyWrap}>
        <Ionicons name="search-outline" size={40} color={colors.textMuted} />
        <Text style={styles.emptyTitle}>Order not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.link}>Back to my orders</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const meta = STATUS_META[status];
  const statusColor = colors[meta.colorKey];
  const isCancelled = status === 'Cancelled';
  const finishedAt = order.history[order.history.length - 1]?.at ?? Date.now();
  const shownSeconds = isActive ? elapsed : secondsBetween(timestamp, finishedAt);
  const nextStatus = ORDER_STATUSES[stepIndex + 1];
  const secondsToNext =
    isActive && nextStatus ? Math.max(0, STATUS_TIMINGS[nextStatus] - elapsed) : null;
  const readyText =
    order.type === ORDER_TYPES.TAKEAWAY ? 'Collect it at the counter.' : 'A waiter is bringing it to your table.';

  const confirmCancel = () =>
    Alert.alert('Cancel this order?', 'The kitchen will stop preparing it.', [
      { text: 'Keep order', style: 'cancel' },
      {
        text: 'Cancel order',
        style: 'destructive',
        onPress: () => dispatch({ type: ORDER_ACTIONS.CANCEL_ORDER, payload: { id: order.id } }),
      },
    ]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Status hero */}
        <View style={styles.hero}>
          <Animated.View
            style={[styles.heroIcon, { backgroundColor: statusColor, transform: [{ scale: pulse }] }]}
          >
            <Ionicons name={meta.icon} size={40} color={colors.white} />
          </Animated.View>
          <Text style={styles.heroTitle}>{meta.title}</Text>
          <Text style={styles.heroSub}>{status === 'Ready' ? readyText : meta.sub}</Text>

          <View style={styles.timerRow}>
            <View style={styles.timerBox}>
              <Text style={styles.timerValue}>{formatClock(shownSeconds)}</Text>
              <Text style={styles.timerLabel}>{isActive ? 'elapsed' : 'total time'}</Text>
            </View>
            {secondsToNext !== null && (
              <View style={styles.timerBox}>
                <Text style={styles.timerValue}>{secondsToNext}s</Text>
                <Text style={styles.timerLabel}>until {nextStatus}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Step progress */}
        {!isCancelled && (
          <View style={styles.card}>
            <View style={styles.track}>
              <Animated.View
                style={[
                  styles.trackFill,
                  { width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
                ]}
              />
            </View>
            <View style={styles.steps}>
              {ORDER_STATUSES.map((s, i) => {
                const done = i <= stepIndex;
                const current = i === stepIndex;
                return (
                  <View key={s} style={styles.step}>
                    <View
                      style={[
                        styles.stepDot,
                        done && styles.stepDotDone,
                        current && styles.stepDotCurrent,
                      ]}
                    >
                      <Ionicons
                        name={done ? 'checkmark' : STATUS_META[s].icon}
                        size={15}
                        color={done ? colors.onPrimary : colors.textMuted}
                      />
                    </View>
                    <Text style={[styles.stepLabel, done && styles.stepLabelDone]}>{s}</Text>
                    <Text style={styles.stepTime}>{STATUS_TIMINGS[s]}s</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Order details */}
        <View style={styles.card}>
          <View style={styles.detailHeader}>
            <View>
              <Text style={styles.orderId}>Order {order.id}</Text>
              <Text style={styles.orderMeta}>
                {order.type === ORDER_TYPES.DINE_IN
                  ? `Dine-in · Table ${order.tableNumber}`
                  : `Takeaway · Pickup ${order.pickupTime}`}
              </Text>
            </View>
            <OrderStatusBadge status={status} />
          </View>

          {order.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              {item.image ? <Image source={{ uri: item.image }} style={styles.thumb} /> : null}
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.quantity} × {item.name}
                </Text>
                {item.note ? <Text style={styles.itemNote}>“{item.note}”</Text> : null}
              </View>
              <Text style={styles.itemPrice}>{formatPrice(item.price * item.quantity)}</Text>
            </View>
          ))}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Grand total</Text>
            <Text style={styles.totalValue}>{formatPrice(order.total)}</Text>
          </View>
        </View>

        {CANCELLABLE_STATUSES.includes(status) && (
          <TouchableOpacity style={styles.cancelButton} onPress={confirmCancel}>
            <Ionicons name="close-circle-outline" size={18} color={colors.error} />
            <Text style={styles.cancelText}>Cancel order</Text>
          </TouchableOpacity>
        )}

        {!isActive && (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.getParent()?.navigate('MenuTab')}
          >
            <Text style={styles.primaryButtonText}>Order something else</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.md, paddingBottom: 40 },
    hero: {
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      paddingVertical: 24,
      paddingHorizontal: spacing.md,
      marginBottom: spacing.md,
    },
    heroIcon: {
      width: 84,
      height: 84,
      borderRadius: 42,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 14,
    },
    heroTitle: { fontSize: 23, fontWeight: '800', color: colors.text },
    heroSub: { fontSize: 14.5, color: colors.textMuted, marginTop: 4, textAlign: 'center' },
    timerRow: { flexDirection: 'row', gap: 12, marginTop: 18 },
    timerBox: {
      minWidth: 110,
      alignItems: 'center',
      backgroundColor: colors.background,
      borderRadius: radius.md,
      paddingVertical: 10,
      paddingHorizontal: 14,
    },
    timerValue: { fontSize: 24, fontWeight: '800', color: colors.primaryText, fontVariant: ['tabular-nums'] },
    timerLabel: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
    card: {
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    track: {
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.muted,
      overflow: 'hidden',
      marginHorizontal: 35,
      marginTop: 14,
      marginBottom: -20,
    },
    trackFill: { height: 6, backgroundColor: colors.primary },
    steps: { flexDirection: 'row', justifyContent: 'space-between' },
    step: { alignItems: 'center', width: 70 },
    stepDot: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: colors.card,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepDotDone: { backgroundColor: colors.primary, borderColor: colors.primary },
    stepDotCurrent: { borderColor: colors.primarySoft, borderWidth: 4 },
    stepLabel: { fontSize: 12.5, fontWeight: '700', color: colors.textMuted, marginTop: 6 },
    stepLabelDone: { color: colors.text },
    stepTime: { fontSize: 11, color: colors.textMuted },
    detailHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    orderId: { fontSize: 16.5, fontWeight: '800', color: colors.text },
    orderMeta: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 8,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    },
    thumb: { width: 40, height: 40, borderRadius: 8, backgroundColor: colors.muted },
    itemName: { fontSize: 14.5, fontWeight: '700', color: colors.text },
    itemNote: { fontSize: 12, color: colors.textMuted, fontStyle: 'italic' },
    itemPrice: { fontSize: 14.5, fontWeight: '800', color: colors.text },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderTopWidth: 1,
      borderTopColor: colors.divider,
      paddingTop: 12,
      marginTop: 4,
    },
    totalLabel: { fontSize: 16, fontWeight: '800', color: colors.text },
    totalValue: { fontSize: 17, fontWeight: '800', color: colors.primaryText },
    cancelButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 14,
      borderRadius: radius.pill,
      borderWidth: 1.5,
      borderColor: colors.error,
    },
    cancelText: { color: colors.error, fontWeight: '800', fontSize: 15 },
    primaryButton: {
      alignItems: 'center',
      paddingVertical: 15,
      borderRadius: radius.pill,
      backgroundColor: colors.primary,
    },
    primaryButtonText: { color: colors.onPrimary, fontWeight: '800', fontSize: 15.5 },
    emptyWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      backgroundColor: colors.background,
    },
    emptyTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
    link: { color: colors.primaryText, fontWeight: '800' },
  });
