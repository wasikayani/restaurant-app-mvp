// src/screens/MenuScreen.js
// Question 4 – Menu Browsing Screen (hooks: useState, useEffect)
//
// What each hook does here:
//  useState  -> menuItems, isLoading, error, selectedCategory, filteredItems,
//               isRefreshing, toast
//  useEffect -> (1) "fetch" the menu once when the screen mounts   [ ]
//               (2) re-filter when category or menu changes      [selectedCategory, menuItems]
//               (3) update the header title with the item count  [filteredItems, isLoading]
//               (4) auto-hide the "added" toast after 2 seconds  [toast]

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  LayoutAnimation,
  Alert,
  StyleSheet,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import MenuSkeleton from '../components/MenuSkeleton';
import { categories, fetchMenu } from '../data/menu';
import { lightColors as colors, radius, spacing } from '../theme/colors';

const formatPrice = (value) => `Rs ${value.toLocaleString('en-PK')}`;

export default function MenuScreen({ route, navigation }) {
  const user = route.params?.user;

  // ---------------- State ----------------
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filteredItems, setFilteredItems] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toast, setToast] = useState(null); // text of the "added" message

  // Starts a fake request and returns its cancel function
  const loadMenu = () => {
    setIsLoading(true);
    setError(null);
    const request = fetchMenu();
    request.promise
      .then((items) => {
        setMenuItems(items);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
    return request.cancel;
  };

  // ---------------- Effect 1: load menu on mount ----------------
  // Empty dependency array [] = run ONCE, after the first render.
  // The returned cleanup clears the 1.5s timer if the user leaves the screen
  // before it finishes, so no state update happens on an unmounted screen.
  useEffect(() => {
    const cancel = loadMenu();
    return cancel; // cleanup
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------- Effect 2: filter by category ----------------
  // Runs whenever selectedCategory OR menuItems changes.
  // (In Q8 this state + effect is replaced by a single useMemo.)
  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredItems(menuItems);
    } else {
      setFilteredItems(menuItems.filter((item) => item.category === selectedCategory));
    }
  }, [selectedCategory, menuItems]);

  // ---------------- Effect 3: header title with item count ----------------
  useEffect(() => {
    navigation.setOptions({
      title: isLoading || error ? 'Menu' : `Menu (${filteredItems.length} items)`,
    });
  }, [navigation, filteredItems.length, isLoading, error]);

  // ---------------- Effect 4: auto-hide toast ----------------
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(timer); // cleanup if a new toast replaces it
  }, [toast]);

  // ---------------- Handlers ----------------
  const selectCategory = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.create(220, 'easeInEaseOut', 'opacity'));
    setSelectedCategory(id);
  };

  // Pull to refresh: keep the current list visible while reloading
  const onRefresh = () => {
    setIsRefreshing(true);
    fetchMenu()
      .promise.then((items) => {
        setMenuItems(items);
        setError(null);
      })
      .catch(() => Alert.alert('Refresh failed', 'Could not refresh the menu. Please try again.'))
      .finally(() => setIsRefreshing(false));
  };

  const onAdd = (item) => {
    setToast(`${item.name} added to cart`); // real cart arrives in Q7
  };

  const countFor = (categoryId) =>
    categoryId === 'All'
      ? menuItems.length
      : menuItems.filter((i) => i.category === categoryId).length;

  // ---------------- Render pieces ----------------
  const renderItem = ({ item }) => {
    const disabled = !item.isAvailable;
    return (
      <View style={[styles.card, disabled && styles.cardDisabled]}>
        {/* Image with placeholder icon behind it (shows if the photo fails to load) */}
        <View style={styles.imageWrap}>
          <Ionicons
            name="restaurant-outline"
            size={28}
            color={colors.textMuted}
            style={styles.imageFallback}
          />
          <Image
            source={{ uri: item.image }}
            style={[styles.image, disabled && styles.imageDisabled]}
          />
          {item.isSpecial && (
            <View style={styles.specialBadge}>
              <Ionicons name="star" size={10} color={colors.white} />
              <Text style={styles.specialText}>Daily Special</Text>
            </View>
          )}
          {disabled && (
            <View style={styles.soldOut}>
              <Text style={styles.soldOutText}>Sold out</Text>
            </View>
          )}
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.metaRow}>
            <Ionicons name="star" size={12} color={colors.accent} />
            <Text style={styles.meta}>{item.rating.toFixed(1)}</Text>
            <Text style={styles.metaDot}>•</Text>
            <Ionicons name="time-outline" size={12} color={colors.textMuted} />
            <Text style={styles.meta}>{item.prepTime} min</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={[styles.price, disabled && styles.priceDisabled]}>
              {formatPrice(item.price)}
            </Text>
            <TouchableOpacity
              style={[styles.addButton, disabled && styles.addButtonDisabled]}
              onPress={() => onAdd(item)}
              disabled={disabled}
              activeOpacity={0.8}
            >
              <Ionicons name={disabled ? 'close' : 'add'} size={16} color={colors.white} />
              <Text style={styles.addText}>{disabled ? 'N/A' : 'Add'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const ListHeader = (
    <View>
      {/* Greeting */}
      <View style={styles.greeting}>
        <Text style={styles.hello}>Hi {user?.fullName?.split(' ')[0] ?? 'there'} 👋</Text>
        <Text style={styles.question}>What would you like to eat today?</Text>
      </View>

      {/* Promo banner */}
      <View style={styles.banner}>
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerTag}>LIMITED OFFER</Text>
          <Text style={styles.bannerTitle}>20% off your first feast</Text>
          <Text style={styles.bannerText}>
            Use code <Text style={styles.bannerCode}>FEAST20</Text> at checkout
          </Text>
        </View>
        <View style={styles.bannerIcon}>
          <Ionicons name="pizza" size={38} color={colors.white} />
        </View>
      </View>

      {/* Horizontal category chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {categories.map((c) => {
          const active = selectedCategory === c.id;
          return (
            <TouchableOpacity
              key={c.id}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => selectCategory(c.id)}
              activeOpacity={0.85}
            >
              <Ionicons name={c.icon} size={16} color={active ? colors.white : colors.primary} />
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{c.label}</Text>
              {!isLoading && (
                <View style={[styles.chipCount, active && styles.chipCountActive]}>
                  <Text style={[styles.chipCountText, active && styles.chipCountTextActive]}>
                    {countFor(c.id)}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Text style={styles.sectionTitle}>
        {selectedCategory === 'All' ? 'Full menu' : selectedCategory}
      </Text>
    </View>
  );

  // ---------------- Error state ----------------
  if (error && !isLoading && menuItems.length === 0) {
    return (
      <View style={styles.center}>
        <StatusBar style="light" />
        <View style={styles.errorIcon}>
          <Ionicons name="cloud-offline-outline" size={42} color={colors.error} />
        </View>
        <Text style={styles.errorTitle}>Oops! Menu didn’t load</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadMenu} activeOpacity={0.85}>
          <Ionicons name="refresh" size={18} color={colors.white} />
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ---------------- Main screen ----------------
  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {isLoading ? (
        <View>
          {ListHeader}
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.loadingText}>Preparing today’s menu…</Text>
          </View>
          <MenuSkeleton count={4} />
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <Text style={styles.empty}>No dishes in this category right now.</Text>
          }
        />
      )}

      {/* "Added" toast */}
      {toast && (
        <View style={styles.toast}>
          <Ionicons name="checkmark-circle" size={20} color={colors.white} />
          <Text style={styles.toastText} numberOfLines={1}>
            {toast}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { paddingBottom: 100 },

  // Greeting + banner
  greeting: { paddingHorizontal: spacing.md, paddingTop: spacing.md },
  hello: { fontSize: 15, color: colors.textMuted, fontWeight: '600' },
  question: { fontSize: 24, fontWeight: '800', color: colors.text, marginTop: 2 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    margin: spacing.md,
    borderRadius: radius.lg,
    padding: 18,
    overflow: 'hidden',
  },
  bannerTag: { color: '#A7F3D0', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  bannerTitle: { color: colors.white, fontSize: 19, fontWeight: '800', marginTop: 4 },
  bannerText: { color: '#D1FAE5', fontSize: 13, marginTop: 4 },
  bannerCode: { color: colors.white, fontWeight: '800' },
  bannerIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Chips
  chips: { paddingHorizontal: spacing.md, gap: 10, paddingBottom: 4 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontWeight: '700', color: colors.text, fontSize: 14 },
  chipTextActive: { color: colors.white },
  chipCount: {
    minWidth: 20,
    paddingHorizontal: 5,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipCountActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  chipCountText: { fontSize: 11, fontWeight: '800', color: colors.primary },
  chipCountTextActive: { color: colors.white },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.sm + 4,
  },

  // Card
  card: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 12,
    marginHorizontal: spacing.md,
    marginBottom: 14,
    shadowColor: '#1C2A24',
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardDisabled: { opacity: 0.55 },
  imageWrap: {
    width: 104,
    height: 104,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: '#EFE9DC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageFallback: { position: 'absolute' },
  image: { width: '100%', height: '100%' },
  imageDisabled: { opacity: 0.5 },
  specialBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.accent,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  specialText: { color: colors.white, fontSize: 9, fontWeight: '800' },
  soldOut: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(28,42,36,0.75)',
    paddingVertical: 4,
    alignItems: 'center',
  },
  soldOutText: { color: colors.white, fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  cardBody: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
  name: { fontSize: 16, fontWeight: '800', color: colors.text },
  description: { fontSize: 12.5, color: colors.textMuted, lineHeight: 17, marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  meta: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  metaDot: { color: colors.textMuted, marginHorizontal: 3 },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  price: { fontSize: 16, fontWeight: '800', color: colors.primary },
  priceDisabled: { color: colors.textMuted },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
  },
  addButtonDisabled: { backgroundColor: '#9CA3AF' },
  addText: { color: colors.white, fontWeight: '800', fontSize: 13 },

  // Loading / empty / error
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  loadingText: { color: colors.textMuted, fontWeight: '600' },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 30 },
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  errorTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
  errorText: { color: colors.textMuted, textAlign: 'center', marginTop: 6, lineHeight: 20 },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    paddingHorizontal: 26,
    paddingVertical: 13,
    borderRadius: radius.pill,
  },
  retryText: { color: colors.white, fontWeight: '800', fontSize: 15 },

  // Toast
  toast: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.text,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  toastText: { color: colors.white, fontWeight: '700', flex: 1 },
});
