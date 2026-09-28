// src/screens/MyOrdersScreen.js
// Question 10 – the logged-in customer's orders (from OrdersContext).
// Active orders are listed first; tapping an order opens live tracking.

import { useMemo } from 'react';
import { View, Text, SectionList, TouchableOpacity, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useOrders } from '../context/OrdersContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import OrderStatusBadge from '../components/OrderStatusBadge';
import { ORDER_TYPES, isFinalStatus } from '../reducers/ordersReducer';
import { radius, spacing } from '../theme/colors';

const formatPrice = (value) => `Rs ${Math.round(value).toLocaleString('en-PK')}`;
const formatDateTime = (ms) => {
  const d = new Date(ms);
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return `${d.getDate()} ${d.toLocaleString('en-GB', { month: 'short' })} · ${time}`;
};

export default function MyOrdersScreen({ navigation }) {
  const { orders } = useOrders();
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  // Derived data: only this user's orders, split into active / past
  const sections = useMemo(() => {
    const mine = orders.filter((o) => o.userId === user?.id);
    const active = mine.filter((o) => !isFinalStatus(o.status));
    const past = mine.filter((o) => isFinalStatus(o.status));
    return [
      ...(active.length ? [{ title: 'In progress', data: active }] : []),
      ...(past.length ? [{ title: 'Past orders', data: past }] : []),
    ];
  }, [orders, user?.id]);

  if (sections.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <StatusBar style="light" />
        <View style={styles.emptyIcon}>
          <Ionicons name="receipt-outline" size={44} color={colors.primaryText} />
        </View>
        <Text style={styles.emptyTitle}>No orders yet</Text>
        <Text style={styles.emptyText}>Your orders and their live status will appear here.</Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.getParent()?.navigate('MenuTab')}
        >
          <Text style={styles.primaryButtonText}>Browse the menu</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderItem = ({ item }) => {
    const summary = item.items.map((i) => `${i.quantity}× ${i.name}`).join(', ');
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('OrderTracking', { orderId: item.id })}
        activeOpacity={0.8}
      >
        <View style={styles.cardIcon}>
          <Ionicons
            name={item.type === ORDER_TYPES.DINE_IN ? 'restaurant-outline' : 'bag-handle-outline'}
            size={22}
            color={colors.primaryText}
          />
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.cardTop}>
            <Text style={styles.cardTitle}>Order {item.id}</Text>
            <Text style={styles.cardTotal}>{formatPrice(item.total)}</Text>
          </View>
          <Text style={styles.cardMeta}>
            {formatDateTime(item.timestamp)} ·{' '}
            {item.type === ORDER_TYPES.DINE_IN ? `Table ${item.tableNumber}` : `Pickup ${item.pickupTime}`}
          </Text>
          <Text style={styles.cardItems} numberOfLines={1}>
            {summary}
          </Text>
          <View style={styles.cardBottom}>
            <OrderStatusBadge status={item.status} />
            <Text style={styles.track}>
              {isFinalStatus(item.status) ? 'Details' : 'Track live'}{' '}
              <Ionicons name="chevron-forward" size={13} color={colors.primaryText} />
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={({ section }) => <Text style={styles.section}>{section.title}</Text>}
        contentContainerStyle={styles.list}
        stickySectionHeadersEnabled={false}
      />
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    list: { padding: spacing.md },
    section: {
      fontSize: 13,
      fontWeight: '800',
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      marginTop: 6,
      marginBottom: 10,
      marginLeft: 4,
    },
    card: {
      flexDirection: 'row',
      gap: 12,
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
    cardIcon: {
      width: 46,
      height: 46,
      borderRadius: radius.md,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between' },
    cardTitle: { fontSize: 15.5, fontWeight: '800', color: colors.text },
    cardTotal: { fontSize: 15, fontWeight: '800', color: colors.primaryText },
    cardMeta: { fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
    cardItems: { fontSize: 13, color: colors.text, marginTop: 6 },
    cardBottom: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 10,
    },
    track: { color: colors.primaryText, fontWeight: '800', fontSize: 13 },
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
    emptyText: { color: colors.textMuted, marginTop: 6, textAlign: 'center' },
    primaryButton: {
      marginTop: spacing.lg,
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 13,
      borderRadius: radius.pill,
    },
    primaryButtonText: { color: colors.onPrimary, fontWeight: '800', fontSize: 15 },
  });
