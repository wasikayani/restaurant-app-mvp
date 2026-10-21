// src/screens/DashboardScreen.js
// Manager Dashboard – visible ONLY to users with role "manager" (see AppNavigator).
//
// Question 10 – three tabs, all working on SHARED app-wide state:
//   Orders        -> OrdersContext (useReducer)   move orders forward / cancel
//   Reservations  -> ReservationContext           accept / decline bookings
//   Menu          -> SERVER (A2 Q6)               add dish, edit price, toggle availability
// Orders and reservations: customers read the same contexts (moved to the server in Q7).
// Menu (A2 Q6): loaded with useApi('/api/menu'); MenuPanel saves changes through the
// protected API and calls refetch() afterwards. Pull down to reload everything.

import { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useOrders } from '../context/OrdersContext';
import { useReservationContext } from '../context/ReservationContext';
import useApi from '../hooks/useApi';
import { isFinalStatus } from '../reducers/ordersReducer';
import OrdersPanel from '../components/dashboard/OrdersPanel';
import ReservationsPanel from '../components/dashboard/ReservationsPanel';
import MenuPanel from '../components/dashboard/MenuPanel';
import { radius, spacing } from '../theme/colors';

const TABS = [
  { id: 'orders', label: 'Orders', icon: 'receipt-outline' },
  { id: 'reservations', label: 'Bookings', icon: 'calendar-outline' },
  { id: 'menu', label: 'Menu', icon: 'restaurant-outline' },
];

const formatShort = (value) =>
  value >= 1000 ? `Rs ${(value / 1000).toFixed(1)}k` : `Rs ${Math.round(value)}`;

export default function DashboardScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { orders } = useOrders();
  const { reservations } = useReservationContext();
  // A2 Q6: the real menu from MongoDB (custom hook – also used in MenuScreen)
  const { data: menuData, loading: menuLoading, error: menuError, refetch: refetchMenu } =
    useApi('/api/menu');
  const menu = useMemo(() => menuData ?? [], [menuData]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await refetchMenu({ silent: true });
    setIsRefreshing(false);
  };
  const [activeTab, setActiveTab] = useState('orders');

  // Live numbers for the overview cards (derived data -> useMemo)
  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const activeOrders = orders.filter((o) => !isFinalStatus(o.status)).length;
    const pendingBookings = reservations.filter((r) => r.status === 'Pending').length;
    const revenueToday = orders
      .filter((o) => o.status !== 'Cancelled' && new Date(o.timestamp).toDateString() === today)
      .reduce((sum, o) => sum + o.total, 0);
    const available = menu.filter((m) => m.isAvailable).length;
    return { activeOrders, pendingBookings, revenueToday, available };
  }, [orders, reservations, menu]);

  const cards = [
    { icon: 'flame-outline', label: 'Active orders', value: stats.activeOrders },
    { icon: 'time-outline', label: 'Bookings to review', value: stats.pendingBookings },
    { icon: 'cash-outline', label: 'Revenue today', value: formatShort(stats.revenueToday) },
    { icon: 'restaurant-outline', label: 'Dishes on menu', value: `${stats.available}/${menu.length}` },
  ];
  const badges = { orders: stats.activeOrders, reservations: stats.pendingBookings, menu: 0 };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor={colors.primaryText}
          colors={[colors.primary]}
        />
      }
    >
      <StatusBar style="light" />
      <Text style={styles.hello}>Welcome back, {user?.fullName?.split(' ')[0]} 👋</Text>
      <Text style={styles.title}>Restaurant overview</Text>

      <View style={styles.statsGrid}>
        {cards.map((s) => (
          <View key={s.label} style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name={s.icon} size={18} color={colors.primaryText} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Segmented tabs */}
      <View style={styles.tabs}>
        {TABS.map((t) => {
          const active = activeTab === t.id;
          return (
            <TouchableOpacity
              key={t.id}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => setActiveTab(t.id)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
            >
              <Ionicons name={t.icon} size={16} color={active ? colors.onPrimary : colors.textMuted} />
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{t.label}</Text>
              {badges[t.id] > 0 && (
                <View style={[styles.badge, active && styles.badgeActive]}>
                  <Text style={styles.badgeText}>{badges[t.id]}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {activeTab === 'orders' && <OrdersPanel />}
      {activeTab === 'reservations' && <ReservationsPanel />}
      {activeTab === 'menu' && (
        <MenuPanel menu={menu} loading={menuLoading} error={menuError} onChanged={refetchMenu} />
      )}
    </ScrollView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.md, paddingBottom: 40 },
    hello: { fontSize: 15, fontWeight: '600', color: colors.textMuted, marginTop: 4 },
    title: { fontSize: 24, fontWeight: '800', color: colors.text, marginTop: 2 },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginTop: spacing.md,
    },
    statCard: {
      width: '48%',
      flexGrow: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      padding: 12,
      shadowColor: colors.shadow,
      shadowOpacity: 0.06,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
    statIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    statValue: { fontSize: 19, fontWeight: '800', color: colors.text },
    statLabel: { fontSize: 11.5, color: colors.textMuted, marginTop: 1 },
    tabs: {
      flexDirection: 'row',
      backgroundColor: colors.muted,
      borderRadius: radius.pill,
      padding: 4,
      marginTop: spacing.lg,
      marginBottom: spacing.md,
    },
    tab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      paddingVertical: 10,
      borderRadius: radius.pill,
    },
    tabActive: { backgroundColor: colors.primary },
    tabText: { fontWeight: '800', color: colors.textMuted, fontSize: 13.5 },
    tabTextActive: { color: colors.onPrimary },
    badge: {
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      paddingHorizontal: 5,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeActive: { backgroundColor: colors.accent },
    badgeText: { color: colors.white, fontSize: 11, fontWeight: '800' },
  });
