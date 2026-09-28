// src/screens/CartScreen.js
// Question 7 – Cart Screen (hooks: useReducer via useCart, useState, useContext)
//
// Every change to the cart is a dispatched ACTION handled by cartReducer:
//   stepper +/-  -> INCREMENT / DECREMENT (removes the item at 0)
//   trash icon   -> REMOVE_ITEM
//   note field   -> UPDATE_NOTE
//   Clear        -> CLEAR_CART
//   promo code   -> APPLY_PROMO / REMOVE_PROMO

import { useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import {
  CART_ACTIONS,
  PROMO_CODES,
  getItemCount,
  getSubtotal,
  isValidPromo,
} from '../reducers/cartReducer';
import { radius, spacing } from '../theme/colors';

const formatPrice = (value) => `Rs ${Math.round(value).toLocaleString('en-PK')}`;

export default function CartScreen({ navigation }) {
  const { state, dispatch } = useCart();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');

  const { items, promoCode, discountPercent } = state;
  const itemCount = getItemCount(items);
  const subtotal = getSubtotal(items);
  const discount = (subtotal * discountPercent) / 100;
  const total = subtotal - discount;

  // ---------- Handlers (each one only dispatches an action) ----------
  const applyPromo = () => {
    if (!promoInput.trim()) {
      setPromoError('Please enter a promo code.');
      return;
    }
    if (!isValidPromo(promoInput)) {
      setPromoError(`"${promoInput.trim()}" is not a valid code. Try WELCOME10 or FEAST20.`);
      return;
    }
    dispatch({ type: CART_ACTIONS.APPLY_PROMO, payload: { code: promoInput } });
    setPromoInput('');
    setPromoError('');
  };

  const confirmClear = () =>
    Alert.alert('Clear cart?', 'All items will be removed from your cart.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => dispatch({ type: CART_ACTIONS.CLEAR_CART }),
      },
    ]);

  const checkout = () =>
    Alert.alert(
      'Almost there!',
      'The order summary with service charge and tax is added in the next update.',
    );

  // ---------- Empty cart ----------
  if (items.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <StatusBar style="light" />
        <View style={styles.emptyIcon}>
          <Ionicons name="bag-handle-outline" size={46} color={colors.primaryText} />
        </View>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptyText}>
          Add a few delicious dishes from the menu and they will appear here.
        </Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('MenuTab')}
          activeOpacity={0.85}
        >
          <Ionicons name="restaurant-outline" size={18} color={colors.onPrimary} />
          <Text style={styles.primaryButtonText}>Browse the menu</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ---------- One cart line ----------
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Image source={{ uri: item.image }} style={styles.image} />
        <View style={{ flex: 1 }}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>
            <TouchableOpacity
              onPress={() => dispatch({ type: CART_ACTIONS.REMOVE_ITEM, payload: { id: item.id } })}
              hitSlop={10}
              accessibilityLabel={`Remove ${item.name}`}
            >
              <Ionicons name="trash-outline" size={19} color={colors.error} />
            </TouchableOpacity>
          </View>
          <Text style={styles.unitPrice}>{formatPrice(item.price)} each</Text>

          <View style={styles.bottomRow}>
            {/* Quantity stepper */}
            <View style={styles.stepper}>
              <TouchableOpacity
                style={styles.stepButton}
                onPress={() => dispatch({ type: CART_ACTIONS.DECREMENT, payload: { id: item.id } })}
                accessibilityLabel="Decrease quantity"
              >
                <Ionicons
                  name={item.quantity === 1 ? 'trash-outline' : 'remove'}
                  size={16}
                  color={colors.primaryText}
                />
              </TouchableOpacity>
              <Text style={styles.qty}>{item.quantity}</Text>
              <TouchableOpacity
                style={styles.stepButton}
                onPress={() => dispatch({ type: CART_ACTIONS.INCREMENT, payload: { id: item.id } })}
                accessibilityLabel="Increase quantity"
              >
                <Ionicons name="add" size={16} color={colors.primaryText} />
              </TouchableOpacity>
            </View>
            <Text style={styles.lineTotal}>{formatPrice(item.price * item.quantity)}</Text>
          </View>
        </View>
      </View>

      {/* Special instructions for this item */}
      <View style={styles.noteBox}>
        <Ionicons name="create-outline" size={16} color={colors.textMuted} />
        <TextInput
          value={item.note}
          onChangeText={(note) =>
            dispatch({ type: CART_ACTIONS.UPDATE_NOTE, payload: { id: item.id, note } })
          }
          placeholder='Special instructions (e.g. "no onions")'
          placeholderTextColor={colors.textMuted}
          style={styles.noteInput}
          maxLength={120}
        />
      </View>
    </View>
  );

  // ---------- Promo + totals (below the list) ----------
  const Footer = (
    <View>
      <Text style={styles.sectionTitle}>Promo code</Text>
      {promoCode ? (
        <View style={styles.appliedPromo}>
          <Ionicons name="pricetag" size={18} color={colors.primaryText} />
          <Text style={styles.appliedText}>
            {promoCode} applied · {discountPercent}% off
          </Text>
          <TouchableOpacity
            onPress={() => dispatch({ type: CART_ACTIONS.REMOVE_PROMO })}
            hitSlop={10}
          >
            <Text style={styles.removePromo}>Remove</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={[styles.promoRow, promoError && styles.promoRowError]}>
            <Ionicons name="pricetag-outline" size={18} color={colors.textMuted} />
            <TextInput
              value={promoInput}
              onChangeText={(t) => {
                setPromoInput(t);
                if (promoError) setPromoError('');
              }}
              placeholder="Enter code"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="characters"
              autoCorrect={false}
              style={styles.promoInput}
              onSubmitEditing={applyPromo}
              returnKeyType="done"
            />
            <TouchableOpacity style={styles.applyButton} onPress={applyPromo}>
              <Text style={styles.applyText}>Apply</Text>
            </TouchableOpacity>
          </View>
          {promoError ? (
            <Text style={styles.promoError}>{promoError}</Text>
          ) : (
            <Text style={styles.promoHint}>Try {Object.keys(PROMO_CODES).join(' or ')}</Text>
          )}
        </>
      )}

      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal ({itemCount} items)</Text>
          <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
        </View>
        {discountPercent > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Promo discount ({discountPercent}%)</Text>
            <Text style={[styles.summaryValue, { color: colors.success }]}>
              − {formatPrice(discount)}
            </Text>
          </View>
        )}
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatPrice(total)}</Text>
        </View>
        <Text style={styles.taxNote}>Service charge and tax are added at checkout.</Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <StatusBar style="light" />
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.headerText}>
              {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
            </Text>
            <TouchableOpacity onPress={confirmClear} hitSlop={10}>
              <Text style={styles.clearText}>Clear all</Text>
            </TouchableOpacity>
          </View>
        }
        ListFooterComponent={Footer}
      />

      {/* Sticky checkout bar */}
      <View style={styles.checkoutBar}>
        <View>
          <Text style={styles.checkoutLabel}>Total</Text>
          <Text style={styles.checkoutTotal}>{formatPrice(total)}</Text>
        </View>
        <TouchableOpacity style={styles.checkoutButton} onPress={checkout} activeOpacity={0.85}>
          <Text style={styles.checkoutText}>Checkout</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.onPrimary} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    list: { padding: spacing.md, paddingBottom: 24 },
    listHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    headerText: { fontSize: 16, fontWeight: '800', color: colors.text },
    clearText: { color: colors.error, fontWeight: '700' },

    // Card
    card: {
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      padding: 12,
      marginBottom: 12,
      shadowColor: colors.shadow,
      shadowOpacity: 0.06,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
    cardTop: { flexDirection: 'row', gap: 12 },
    image: { width: 78, height: 78, borderRadius: radius.md, backgroundColor: colors.muted },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    name: { flex: 1, fontSize: 16, fontWeight: '800', color: colors.text },
    unitPrice: { fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
    bottomRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    stepper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primarySoft,
      borderRadius: radius.pill,
      padding: 3,
    },
    stepButton: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: colors.card,
      alignItems: 'center',
      justifyContent: 'center',
    },
    qty: {
      minWidth: 32,
      textAlign: 'center',
      fontSize: 15,
      fontWeight: '800',
      color: colors.text,
    },
    lineTotal: { fontSize: 16, fontWeight: '800', color: colors.primaryText },
    noteBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 12,
      backgroundColor: colors.background,
      borderRadius: radius.md,
      paddingHorizontal: 12,
      height: 42,
      borderWidth: 1,
      borderColor: colors.border,
    },
    noteInput: { flex: 1, fontSize: 13.5, color: colors.text },

    // Promo
    sectionTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      marginTop: 8,
      marginBottom: 8,
    },
    promoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.card,
      borderRadius: radius.md,
      paddingLeft: 12,
      paddingRight: 5,
      height: 50,
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    promoRowError: { borderColor: colors.error },
    promoInput: { flex: 1, fontSize: 15, color: colors.text, fontWeight: '700' },
    applyButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 18,
      height: 38,
      borderRadius: radius.sm + 2,
      justifyContent: 'center',
    },
    applyText: { color: colors.onPrimary, fontWeight: '800' },
    promoError: { color: colors.error, fontSize: 12.5, marginTop: 6, marginLeft: 4 },
    promoHint: { color: colors.textMuted, fontSize: 12.5, marginTop: 6, marginLeft: 4 },
    appliedPromo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.primarySoft,
      borderRadius: radius.md,
      paddingHorizontal: 14,
      height: 50,
    },
    appliedText: { flex: 1, color: colors.primaryText, fontWeight: '800' },
    removePromo: { color: colors.error, fontWeight: '700' },

    // Summary
    summary: {
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      padding: spacing.md,
      marginTop: spacing.md,
    },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
    summaryLabel: { color: colors.textMuted, fontSize: 14 },
    summaryValue: { color: colors.text, fontSize: 14, fontWeight: '700' },
    totalRow: {
      borderTopWidth: 1,
      borderTopColor: colors.divider,
      marginTop: 6,
      paddingTop: 10,
    },
    totalLabel: { color: colors.text, fontSize: 17, fontWeight: '800' },
    totalValue: { color: colors.primaryText, fontSize: 18, fontWeight: '800' },
    taxNote: { color: colors.textMuted, fontSize: 12, marginTop: 6 },

    // Checkout bar
    checkoutBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.card,
      paddingHorizontal: spacing.md,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    checkoutLabel: { color: colors.textMuted, fontSize: 12 },
    checkoutTotal: { color: colors.text, fontSize: 19, fontWeight: '800' },
    checkoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.primary,
      paddingHorizontal: 26,
      paddingVertical: 14,
      borderRadius: radius.pill,
    },
    checkoutText: { color: colors.onPrimary, fontWeight: '800', fontSize: 16 },

    // Empty
    emptyWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
      backgroundColor: colors.background,
    },
    emptyIcon: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
    },
    emptyTitle: { fontSize: 21, fontWeight: '800', color: colors.text },
    emptyText: { color: colors.textMuted, textAlign: 'center', marginTop: 6, lineHeight: 20 },
    primaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: spacing.lg,
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 13,
      borderRadius: radius.pill,
    },
    primaryButtonText: { color: colors.onPrimary, fontWeight: '800', fontSize: 15 },
  });
