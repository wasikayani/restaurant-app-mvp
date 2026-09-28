// src/components/OrderStatusBadge.js
// Small coloured pill showing an order's status. STATUS_META is shared by the
// tracking screen, My Orders and the manager Dashboard so colours match everywhere.

import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export const STATUS_META = {
  Pending: { icon: 'time-outline', colorKey: 'accent', title: 'Order received', sub: 'Waiting for the kitchen to start.' },
  Preparing: { icon: 'flame-outline', colorKey: 'primaryText', title: 'Being prepared', sub: 'Our chefs are cooking your food.' },
  Ready: { icon: 'bag-check-outline', colorKey: 'success', title: 'Ready!', sub: 'Your order is ready.' },
  Served: { icon: 'restaurant-outline', colorKey: 'primaryText', title: 'Served – enjoy!', sub: 'Thank you for ordering with Green Fork.' },
  Cancelled: { icon: 'close-circle-outline', colorKey: 'error', title: 'Order cancelled', sub: 'This order was cancelled.' },
};

export default function OrderStatusBadge({ status }) {
  const { colors } = useTheme();
  const meta = STATUS_META[status] ?? STATUS_META.Pending;
  const color = colors[meta.colorKey];
  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <Ionicons name={meta.icon} size={13} color={color} />
      <Text style={[styles.text, { color }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  text: { fontSize: 12, fontWeight: '800' },
});
