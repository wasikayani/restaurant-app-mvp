// src/components/dashboard/MenuPanel.js
// Question 10 – Manager Dashboard › Menu Management.
// Add a dish, edit a price, switch a dish on/off.
//
// Assignment 2 – Q6: every change is now saved on the SERVER with the manager's token:
//   add dish      -> POST /api/menu
//   edit price    -> PUT  /api/menu/:id   { price }
//   on/off switch -> PUT  /api/menu/:id   { isAvailable }
// These routes are protected (protect + managerOnly), so only a manager can do this.
// After each change we call onChanged() = refetch() to load the fresh menu from MongoDB.
// Customers get the new data the next time they load / pull-to-refresh the menu.

import { useMemo, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Image,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { request } from '../../api/client';
import { useTheme } from '../../context/ThemeContext';
import AddDishModal from './AddDishModal';
import { createPanelStyles } from './OrdersPanel';
import { radius } from '../../theme/colors';

const formatPrice = (value) => `Rs ${Math.round(value).toLocaleString('en-PK')}`;

// Props come from DashboardScreen, which loads the menu with useApi('/api/menu')
export default function MenuPanel({ menu, loading, error, onChanged }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState(null); // dish whose price is being edited
  const [priceText, setPriceText] = useState('');
  const [query, setQuery] = useState('');
  const [busyId, setBusyId] = useState(null); // dish currently being saved (disables its controls)

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? menu.filter((m) => m.name.toLowerCase().includes(q)) : menu;
  }, [menu, query]);

  const startEdit = (item) => {
    setEditingId(item.id);
    setPriceText(String(item.price));
  };

  // Sends one change to the server, then reloads the menu.
  // Errors (e.g. 401 token expired, 403 not a manager, 400 bad price) show the server's message.
  const saveChange = async (item, changes) => {
    setBusyId(item.id);
    try {
      await request(`/api/menu/${item.id}`, { method: 'PUT', body: changes });
      await onChanged({ silent: true });
      return true;
    } catch (err) {
      Alert.alert('Could not save', err.message);
      return false;
    } finally {
      setBusyId(null);
    }
  };

  const savePrice = async (item) => {
    const price = Number(priceText);
    // A1 validation stays in the app – the server also checks (price >= 0)
    if (!priceText || Number.isNaN(price) || price <= 0) {
      Alert.alert('Invalid price', 'Enter a price greater than 0.');
      return;
    }
    const ok = await saveChange(item, { price: Math.round(price) });
    if (ok) setEditingId(null);
  };

  const toggleAvailability = (item) => saveChange(item, { isAvailable: !item.isAvailable });

  const handleAdd = async (dish) => {
    try {
      await request('/api/menu', { method: 'POST', body: dish }); // 201 Created
      await onChanged({ silent: true });
      Alert.alert('Dish added', `${dish.name} is now on the menu.`);
    } catch (err) {
      Alert.alert('Could not add dish', err.message);
    }
  };

  // First load / load failed
  if (loading) {
    return <ActivityIndicator style={{ marginTop: 24 }} color={colors.primaryText} />;
  }
  if (error) {
    return (
      <View style={styles.card}>
        <Text style={styles.name}>Menu could not be loaded</Text>
        <Text style={styles.meta}>{error}</Text>
        <TouchableOpacity style={[styles.addBtn, { marginTop: 12 }]} onPress={() => onChanged()}>
          <Ionicons name="refresh" size={18} color={colors.onPrimary} />
          <Text style={styles.addText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View>
      <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)} activeOpacity={0.85}>
        <Ionicons name="add-circle-outline" size={20} color={colors.onPrimary} />
        <Text style={styles.addText}>Add new dish</Text>
      </TouchableOpacity>

      <View style={styles.search}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Find a dish"
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      {visible.map((item) => {
        const isEditing = editingId === item.id;
        const isBusy = busyId === item.id;
        return (
          <View key={item.id} style={[styles.card, styles.row, !item.isAvailable && styles.off]}>
            <Image source={{ uri: item.image }} style={styles.thumb} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.meta}>
                {item.category}
                {item.isAvailable ? '' : ' · Hidden from orders'}
              </Text>

              {isEditing ? (
                <View style={styles.editRow}>
                  <Text style={styles.rs}>Rs</Text>
                  <TextInput
                    style={styles.priceInput}
                    value={priceText}
                    onChangeText={(t) => setPriceText(t.replace(/[^0-9]/g, ''))}
                    keyboardType="number-pad"
                    autoFocus
                    onSubmitEditing={() => savePrice(item)}
                    accessibilityLabel={`New price for ${item.name}`}
                  />
                  {isBusy ? (
                    <ActivityIndicator color={colors.primaryText} />
                  ) : (
                    <TouchableOpacity onPress={() => savePrice(item)} hitSlop={8} accessibilityLabel="Save price">
                      <Ionicons name="checkmark-circle" size={26} color={colors.primaryText} />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => setEditingId(null)} hitSlop={8} accessibilityLabel="Cancel edit">
                    <Ionicons name="close-circle" size={26} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.pricePill}
                  onPress={() => startEdit(item)}
                  accessibilityLabel={`Edit price of ${item.name}`}
                >
                  <Text style={styles.price}>{formatPrice(item.price)}</Text>
                  <Ionicons name="pencil" size={13} color={colors.primaryText} />
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.switchCol}>
              <Switch
                value={item.isAvailable}
                disabled={isBusy}
                onValueChange={() => toggleAvailability(item)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.white}
                accessibilityLabel={`${item.name} available`}
              />
              <Text style={styles.switchText}>{item.isAvailable ? 'Available' : 'Off'}</Text>
            </View>
          </View>
        );
      })}

      <AddDishModal visible={showAdd} onClose={() => setShowAdd(false)} onSave={handleAdd} />
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    ...createPanelStyles(colors),
    addBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: colors.primary,
      paddingVertical: 13,
      borderRadius: radius.pill,
      marginBottom: 12,
    },
    addText: { color: colors.onPrimary, fontWeight: '800', fontSize: 15 },
    search: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.card,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
      marginBottom: 12,
    },
    searchInput: { flex: 1, paddingVertical: 10, color: colors.text, fontSize: 15 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    off: { opacity: 0.6 },
    thumb: { width: 56, height: 56, borderRadius: 12, backgroundColor: colors.muted },
    name: { fontSize: 15, fontWeight: '800', color: colors.text },
    meta: { fontSize: 12.5, color: colors.textMuted, marginTop: 1 },
    pricePill: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: 6,
      marginTop: 6,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: radius.pill,
      backgroundColor: colors.primarySoft,
    },
    price: { fontSize: 13.5, fontWeight: '800', color: colors.primaryText },
    editRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
    rs: { fontWeight: '800', color: colors.text },
    priceInput: {
      width: 80,
      borderWidth: 1.5,
      borderColor: colors.primary,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
      color: colors.text,
      fontWeight: '800',
      backgroundColor: colors.background,
    },
    switchCol: { alignItems: 'center', gap: 2 },
    switchText: { fontSize: 11, fontWeight: '700', color: colors.textMuted },
  });
