// src/screens/OrderSummaryScreen.js
// Question 8 – Order Summary (hook: useMemo)
//
// Calculates subtotal, promo discount, service charge, sales tax and grand total.
// The rates are NAMED CONSTANTS (no "magic numbers" hidden in the maths), and the
// whole calculation is wrapped in useMemo that depends ONLY on the cart items and
// the discount percent – so it is recalculated only when the cart really changes,
// not on every render (e.g. when the theme changes).

import { useMemo } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing } from '../theme/colors';
import { calculateTotals, SERVICE_CHARGE_RATE, SALES_TAX_RATE } from '../utils/orderTotals';

// Named rates and the pure calculation live in src/utils/orderTotals.js
// (shared with Q10 and covered by Jest tests).
const formatPrice = (value) => `Rs ${Math.round(value).toLocaleString('en-PK')}`;

export default function OrderSummaryScreen({ navigation }) {
  const { state } = useCart();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { items, promoCode, discountPercent } = state;

  // useMemo: recalculate ONLY when items or discountPercent change
  const totals = useMemo(() => calculateTotals(items, discountPercent), [items, discountPercent]);

  const placeOrder = () =>
    Alert.alert(
      'Ready to order',
      `Grand total ${formatPrice(totals.grandTotal)}. Choosing Dine-in or Takeaway and live order tracking are added in the final step.`,
    );

  if (items.length === 0) {
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
        <TouchableOpacity style={styles.placeButton} onPress={placeOrder} activeOpacity={0.85}>
          <Text style={styles.placeText}>Place order</Text>
          <Ionicons name="checkmark-circle" size={19} color={colors.onPrimary} />
        </TouchableOpacity>
      </View>
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
