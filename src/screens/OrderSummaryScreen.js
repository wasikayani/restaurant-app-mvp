// src/screens/OrderSummaryScreen.js
// Question 8 – Order Summary (hook: useMemo)
//
// Calculates subtotal, promo discount, service charge, sales tax and grand total.
// The rates are NAMED CONSTANTS (no "magic numbers" hidden in the maths), and the
// whole calculation is wrapped in useMemo that depends ONLY on the cart items and
// the discount percent – so it is recalculated only when the cart really changes,
// not on every render (e.g. when the theme changes).
//
// Question 10 – Place order: the customer chooses Dine-in (pick a table) or
// Takeaway (pick a pickup time). The order is dispatched to OrdersContext
// (useReducer) with status "Pending", the cart is cleared and the app opens
// the live Order Tracking screen.

import { useEffect, useMemo, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import SuccessModal, { SUCCESS_DURATION } from '../components/SuccessModal';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrdersContext';
import { useAuth } from '../context/AuthContext';
import { CART_ACTIONS } from '../reducers/cartReducer';
import {
  ORDER_ACTIONS,
  ORDER_TYPES,
  createOrder,
  isFinalStatus,
} from '../reducers/ordersReducer';
import { mockTables } from '../data/tables';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing } from '../theme/colors';
import { calculateTotals, SERVICE_CHARGE_RATE, SALES_TAX_RATE } from '../utils/orderTotals';

// Named rates and the pure calculation live in src/utils/orderTotals.js
// (shared with Q10 and covered by Jest tests).
const formatPrice = (value) => `Rs ${Math.round(value).toLocaleString('en-PK')}`;

// Takeaway pickup choices: minutes from now (rounded up to the next 5 minutes)
const PICKUP_OPTIONS = [20, 30, 45, 60];
const pad = (n) => String(n).padStart(2, '0');
function getPickupTimes(now = new Date()) {
  const base = new Date(now);
  base.setSeconds(0, 0);
  base.setMinutes(Math.ceil(base.getMinutes() / 5) * 5);
  return PICKUP_OPTIONS.map((minutes) => {
    const t = new Date(base.getTime() + minutes * 60000);
    return { minutes, time: `${pad(t.getHours())}:${pad(t.getMinutes())}` };
  });
}

export default function OrderSummaryScreen({ navigation }) {
  const { state, dispatch: cartDispatch } = useCart();
  const { orders, dispatch: ordersDispatch } = useOrders();
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { items, promoCode, discountPercent } = state;

  // Q10 checkout state
  const [orderType, setOrderType] = useState(ORDER_TYPES.DINE_IN);
  const [tableId, setTableId] = useState(null);
  const [pickupTime, setPickupTime] = useState(null);
  const [checkoutError, setCheckoutError] = useState(null);
  const [placedOrderId, setPlacedOrderId] = useState(null);
  const [pickupTimes] = useState(() => getPickupTimes()); // calculated once per visit

  // useMemo: recalculate ONLY when items or discountPercent change
  const totals = useMemo(() => calculateTotals(items, discountPercent), [items, discountPercent]);

  // Tables that already have an active dine-in order are shown as "In use"
  const busyTableIds = useMemo(
    () =>
      orders
        .filter((o) => o.type === ORDER_TYPES.DINE_IN && !isFinalStatus(o.status))
        .map((o) => o.tableId),
    [orders],
  );

  const chooseType = (type) => {
    setOrderType(type);
    setCheckoutError(null);
  };

  const placeOrder = () => {
    if (orderType === ORDER_TYPES.DINE_IN && !tableId) {
      setCheckoutError('Please choose your table.');
      return;
    }
    if (orderType === ORDER_TYPES.TAKEAWAY && !pickupTime) {
      setCheckoutError('Please choose a pickup time.');
      return;
    }
    const table = mockTables.find((t) => t.id === tableId);
    const order = createOrder({
      items,
      totals,
      promoCode,
      type: orderType,
      tableId,
      tableNumber: table?.number,
      pickupTime,
      user,
    });
    ordersDispatch({ type: ORDER_ACTIONS.PLACE_ORDER, payload: order });
    setPlacedOrderId(order.id); // shows the success popup
  };

  // After the success popup: empty the cart and open live tracking.
  // Cleanup clears the timer if the screen closes early.
  useEffect(() => {
    if (!placedOrderId) return undefined;
    const timerId = setTimeout(() => {
      cartDispatch({ type: CART_ACTIONS.CLEAR_CART });
      navigation.navigate('OrdersTab', {
        screen: 'OrderTracking',
        params: { orderId: placedOrderId },
        initial: false, // so "back" goes to My Orders
      });
      navigation.popToTop(); // Cart tab starts fresh next time
    }, SUCCESS_DURATION);
    return () => clearTimeout(timerId);
  }, [placedOrderId, cartDispatch, navigation]);

  if (items.length === 0 && !placedOrderId) {
    return (
      <View style={styles.emptyWrap}>
        <StatusBar style="light" />
        <Ionicons name="receipt-outline" size={46} color={colors.primaryText} />
        <Text style={styles.emptyTitle}>Nothing to summarise</Text>
        <TouchableOpacity style={styles.linkButton} onPress={() => navigation.goBack()}>
          <Text style={styles.linkText}>Back to cart</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const rows = [
    { label: `Subtotal (${totals.itemCount} items)`, value: formatPrice(totals.subtotal) },
    ...(discountPercent > 0
      ? [
          {
            label: `Promo ${promoCode} (${discountPercent}%)`,
            value: `− ${formatPrice(totals.discount)}`,
            color: colors.success,
          },
        ]
      : []),
    {
      label: `Service charge (${SERVICE_CHARGE_RATE * 100}%)`,
      value: formatPrice(totals.serviceCharge),
    },
    { label: `Sales tax (${SALES_TAX_RATE * 100}%)`, value: formatPrice(totals.salesTax) },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Items */}
        <Text style={styles.sectionTitle}>Your order</Text>
        <View style={styles.card}>
          {items.map((item, index) => (
            <View key={item.id} style={[styles.itemRow, index > 0 && styles.itemBorder]}>
              <Image source={{ uri: item.image }} style={styles.thumb} />
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.quantity} × {item.name}
                </Text>
                {item.note ? (
                  <Text style={styles.itemNote} numberOfLines={2}>
                    “{item.note}”
                  </Text>
                ) : null}
              </View>
              <Text style={styles.itemPrice}>{formatPrice(item.price * item.quantity)}</Text>
            </View>
          ))}
        </View>

        {/* Q10: order type */}
        <Text style={styles.sectionTitle}>How would you like it?</Text>
        <View style={styles.card}>
          <View style={styles.segment}>
            {[
              { type: ORDER_TYPES.DINE_IN, icon: 'restaurant-outline', sub: 'Eat at the restaurant' },
              { type: ORDER_TYPES.TAKEAWAY, icon: 'bag-handle-outline', sub: 'Pick up and go' },
            ].map((opt) => {
              const active = orderType === opt.type;
              return (
                <TouchableOpacity
                  key={opt.type}
                  style={[styles.segmentItem, active && styles.segmentItemActive]}
                  onPress={() => chooseType(opt.type)}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <Ionicons
                    name={opt.icon}
                    size={22}
                    color={active ? colors.onPrimary : colors.primaryText}
                  />
                  <Text style={[styles.segmentLabel, active && styles.segmentLabelActive]}>
                    {opt.type}
                  </Text>
                  <Text style={[styles.segmentSub, active && styles.segmentSubActive]}>
                    {opt.sub}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {orderType === ORDER_TYPES.DINE_IN ? (
            <>
              <Text style={styles.pickLabel}>Choose your table</Text>
              <View style={styles.chipWrap}>
                {mockTables.map((t) => {
                  const busy = busyTableIds.includes(t.id);
                  const active = tableId === t.id;
                  return (
                    <TouchableOpacity
                      key={t.id}
                      disabled={busy}
                      onPress={() => {
                        setTableId(t.id);
                        setCheckoutError(null);
                      }}
                      style={[styles.chip, active && styles.chipActive, busy && styles.chipBusy]}
                      accessibilityLabel={`Table ${t.number}${busy ? ' in use' : ''}`}
                    >
                      <Text style={[styles.chipTitle, active && styles.chipTextActive]}>
                        Table {t.number}
                      </Text>
                      <Text style={[styles.chipSub, active && styles.chipTextActive]}>
                        {busy ? 'In use' : `${t.seats} seats`}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          ) : (
            <>
              <Text style={styles.pickLabel}>Pickup time</Text>
              <View style={styles.chipWrap}>
                {pickupTimes.map((p) => {
                  const active = pickupTime === p.time;
                  return (
                    <TouchableOpacity
                      key={p.time}
                      onPress={() => {
                        setPickupTime(p.time);
                        setCheckoutError(null);
                      }}
                      style={[styles.chip, active && styles.chipActive]}
                      accessibilityLabel={`Pickup at ${p.time}`}
                    >
                      <Text style={[styles.chipTitle, active && styles.chipTextActive]}>
                        {p.time}
                      </Text>
                      <Text style={[styles.chipSub, active && styles.chipTextActive]}>
                        in {p.minutes} min
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}
          {checkoutError ? (
            <View style={styles.errorRow}>
              <Ionicons name="alert-circle" size={16} color={colors.error} />
              <Text style={styles.errorText}>{checkoutError}</Text>
            </View>
          ) : null}
        </View>

        {/* Bill */}
        <Text style={styles.sectionTitle}>Bill details</Text>
        <View style={styles.card}>
          {rows.map((r) => (
            <View key={r.label} style={styles.billRow}>
              <Text style={styles.billLabel}>{r.label}</Text>
              <Text style={[styles.billValue, r.color && { color: r.color }]}>{r.value}</Text>
            </View>
          ))}
          <View style={[styles.billRow, styles.grandRow]}>
            <Text style={styles.grandLabel}>Grand total</Text>
            <Text style={styles.grandValue}>{formatPrice(totals.grandTotal)}</Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={18} color={colors.textMuted} />
          <Text style={styles.infoText}>
            Service charge and tax are calculated on the amount after your promo discount.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomLabel}>Grand total</Text>
          <Text style={styles.bottomTotal}>{formatPrice(totals.grandTotal)}</Text>
        </View>
        <TouchableOpacity
          style={styles.placeButton}
          onPress={placeOrder}
          activeOpacity={0.85}
          disabled={Boolean(placedOrderId)}
        >
          <Text style={styles.placeText}>Place order</Text>
          <Ionicons name="checkmark-circle" size={19} color={colors.onPrimary} />
        </TouchableOpacity>
      </View>

      <SuccessModal
        visible={Boolean(placedOrderId)}
        icon="receipt"
        title="Order placed!"
        message={`Order ${placedOrderId ?? ''} was sent to the kitchen.`}
      />
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.md, paddingBottom: 30 },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      marginTop: 8,
      marginBottom: 8,
      marginLeft: 4,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      paddingHorizontal: spacing.md,
      paddingVertical: 6,
      marginBottom: spacing.md,
    },
    itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
    itemBorder: { borderTopWidth: 1, borderTopColor: colors.divider },
    thumb: { width: 46, height: 46, borderRadius: 10, backgroundColor: colors.muted },
    itemName: { fontSize: 15, fontWeight: '700', color: colors.text },
    itemNote: { fontSize: 12.5, color: colors.textMuted, fontStyle: 'italic', marginTop: 2 },
    itemPrice: { fontSize: 15, fontWeight: '800', color: colors.text },
    billRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
    billLabel: { color: colors.textMuted, fontSize: 14.5 },
    billValue: { color: colors.text, fontSize: 14.5, fontWeight: '700' },
    grandRow: { borderTopWidth: 1, borderTopColor: colors.divider, marginTop: 4, paddingTop: 12 },
    grandLabel: { color: colors.text, fontSize: 17, fontWeight: '800' },
    grandValue: { color: colors.primaryText, fontSize: 19, fontWeight: '800' },
    infoBox: { flexDirection: 'row', gap: 8, paddingHorizontal: 6 },
    segment: { flexDirection: 'row', gap: 10, paddingTop: 8 },
    segmentItem: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 12,
      borderRadius: radius.md,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.background,
      gap: 2,
    },
    segmentItemActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    segmentLabel: { fontSize: 15, fontWeight: '800', color: colors.text, marginTop: 4 },
    segmentLabelActive: { color: colors.onPrimary },
    segmentSub: { fontSize: 12, color: colors.textMuted },
    segmentSubActive: { color: colors.onPrimary, opacity: 0.85 },
    pickLabel: { fontSize: 13.5, fontWeight: '800', color: colors.text, marginTop: 14, marginBottom: 8 },
    chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 10 },
    chip: {
      width: '23%',
      flexGrow: 1,
      alignItems: 'center',
      paddingVertical: 9,
      borderRadius: radius.md,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    chipActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
    chipBusy: { opacity: 0.4 },
    chipTitle: { fontSize: 13.5, fontWeight: '800', color: colors.text },
    chipSub: { fontSize: 11.5, color: colors.textMuted, marginTop: 1 },
    chipTextActive: { color: colors.primaryText },
    errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingBottom: 10 },
    errorText: { color: colors.error, fontWeight: '700', fontSize: 13 },
    infoText: { flex: 1, color: colors.textMuted, fontSize: 12.5, lineHeight: 18 },
    bottomBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.card,
      paddingHorizontal: spacing.md,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    bottomLabel: { color: colors.textMuted, fontSize: 12 },
    bottomTotal: { color: colors.text, fontSize: 19, fontWeight: '800' },
    placeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 14,
      borderRadius: radius.pill,
    },
    placeText: { color: colors.onPrimary, fontWeight: '800', fontSize: 16 },
    emptyWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
      gap: 10,
    },
    emptyTitle: { fontSize: 19, fontWeight: '800', color: colors.text },
    linkButton: { padding: 8 },
    linkText: { color: colors.primaryText, fontWeight: '800' },
  });
