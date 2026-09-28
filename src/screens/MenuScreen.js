// src/screens/MenuScreen.js
// Question 4 – Menu Browsing Screen (hooks: useState, useEffect)
// Question 5 – Search and Scroll Controls (hook: useRef)
// Question 8 – Performance (hooks: useMemo, useCallback + React.memo on MenuItemCard)
// Question 9 – the manual Q5 debounce is replaced by the useDebounce custom hook
//
// What each hook does here:
//  useState  -> menuItems, isLoading, error, selectedCategory, sortOrder,
//               favoriteIds, isRefreshing, toast
//  useMemo   -> visibleItems  : category filter + search + sort in ONE calculation
//               quantityById  : how many of each dish is in the cart
//  useCallback -> handleAdd, toggleFavorite, renderItem (stable function references)
//  useEffect -> (1) "fetch" the menu once when the screen mounts   [ ]
//               (2) (Q4 filter effect – replaced by useMemo in Q8)
//               (3) update the header title with the item count  [visibleItems, isLoading]
//               (4) auto-hide the "added" toast after 2 seconds  [toast]
//               (5) save a recent search when the debounced text changes [debouncedSearch]
//  useDebounce -> debouncedSearch: searchText, 400 ms after typing stops (Q9)
//  useRef    -> searchInputRef   : the TextInput element (to call .focus())
//               listRef          : the FlatList element (to call .scrollToOffset())
//               previousQueryRef : last saved search term (avoid duplicates)
//               renderCount      : how many times this screen has rendered

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TextInput,
  Keyboard,
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
import MenuItemCard, { ENABLE_MEMO } from '../components/MenuItemCard';
import useDebounce from '../hooks/useDebounce';
import { categories, fetchMenu } from '../data/menu';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useMenu } from '../context/MenuContext';
import { CART_ACTIONS } from '../reducers/cartReducer';
import { radius, spacing } from '../theme/colors';

const SORT_OPTIONS = [
  { id: 'recommended', label: 'Recommended', icon: 'sparkles-outline' },
  { id: 'priceAsc', label: 'Price: low to high', short: 'Price ↑', icon: 'trending-up-outline' },
  { id: 'priceDesc', label: 'Price: high to low', short: 'Price ↓', icon: 'trending-down-outline' },
  { id: 'nameAsc', label: 'Name: A to Z', short: 'A–Z', icon: 'text-outline' },
];
const SEARCH_DELAY = 400; // ms of "no typing" before the search is applied
const MAX_RECENT = 5; // how many recent searches to remember
const BACK_TO_TOP_OFFSET = 300; // px scrolled before the "Back to top" button appears
const SHOW_DEBUG_BY_DEFAULT = false; // long-press the search icon to show/hide the render counter

export default function MenuScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { user } = useAuth(); // Q6: logged-in user comes from AuthContext
  const { state: cart, dispatch } = useCart(); // Q7: shared cart (useReducer)
  const { menu: sharedMenu } = useMenu(); // Q10: menu the manager can edit

  // ---------------- State ----------------
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOrder, setSortOrder] = useState('recommended'); // Q8
  const [favoriteIds, setFavoriteIds] = useState([]); // Q8: ids of favourite dishes
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toast, setToast] = useState(null); // text of the "added" message

  // ---------------- Q5 state ----------------
  const [searchText, setSearchText] = useState(''); // what the user typed (every keystroke)

  // Q9: custom hook replaces the manual useRef + setTimeout debounce from Q5.
  // debouncedSearch only updates 400 ms after the user stops typing.
  const debouncedSearch = useDebounce(searchText, SEARCH_DELAY);
  // Clearing the box should empty the results immediately, not after 400 ms
  const searchQuery = searchText.trim() === '' ? '' : debouncedSearch;
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]); // last 5 search terms
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showDebug, setShowDebug] = useState(SHOW_DEBUG_BY_DEFAULT);

  // ---------------- Q5 refs ----------------
  const searchInputRef = useRef(null);
  const listRef = useRef(null);
  const previousQueryRef = useRef('');

  // Render counter.
  // WHY a ref does not re-render but state does:
  //  - useRef returns the SAME mutable object { current } on every render.
  //    Changing ref.current just changes a value in memory; React is not told
  //    about it, so no new render is scheduled. That is why we can safely do
  //    `renderCount.current += 1` during render without an infinite loop.
  //  - Calling a state setter (e.g. setSearchText) tells React "data changed",
  //    so React re-renders the component to show the new value on screen.
  //  If we used useState for the counter, updating it during render would
  //  trigger another render, which updates it again... forever.
  const renderCount = useRef(0);
  renderCount.current += 1;

  // Q10: always "fetch" the latest shared menu (a ref avoids a stale value
  // inside the load effect, which only runs once).
  const latestMenuRef = useRef(sharedMenu);
  useEffect(() => {
    latestMenuRef.current = sharedMenu;
  }, [sharedMenu]);

  // Starts a fake request and returns its cancel function
  const loadMenu = () => {
    setIsLoading(true);
    setError(null);
    const request = fetchMenu(latestMenuRef.current);
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

  // ---------------- Q8: derived list with ONE useMemo ----------------
  // The Q4 version stored `filteredItems` in state and updated it inside a
  // useEffect. That caused an extra render every time (render -> effect ->
  // setFilteredItems -> render again) and two copies of the same data that
  // could get out of sync.
  //
  // WHY derived data should NOT be stored in state:
  //  visibleItems can always be CALCULATED from state we already have
  //  (menuItems, selectedCategory, searchQuery, sortOrder). Storing it again
  //  would duplicate data. useMemo simply recalculates it during render, and
  //  only when one of those four inputs changes; otherwise it reuses the cached list.
  const visibleItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = menuItems.filter((item) => {
      const inCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch =
        q === '' ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);
      return inCategory && matchesSearch;
    });
    // sort a COPY – never mutate the original array
    const sorted = [...filtered];
    if (sortOrder === 'priceAsc') sorted.sort((a, b) => a.price - b.price);
    if (sortOrder === 'priceDesc') sorted.sort((a, b) => b.price - a.price);
    if (sortOrder === 'nameAsc') sorted.sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  }, [menuItems, selectedCategory, searchQuery, sortOrder]);

  // Map of dish id -> quantity in cart, rebuilt only when the cart items change
  const quantityById = useMemo(() => {
    const map = {};
    cart.items.forEach((i) => {
      map[i.id] = i.quantity;
    });
    return map;
  }, [cart.items]);

  // ---------------- Effect 3: header title with item count ----------------
  useEffect(() => {
    navigation.setOptions({
      title: isLoading || error ? 'Menu' : `Menu (${visibleItems.length} items)`,
    });
  }, [navigation, visibleItems.length, isLoading, error]);

  // ---------------- Effect 4: auto-hide toast ----------------
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(timer); // cleanup if a new toast replaces it
  }, [toast]);

  // ---------------- Q5 handlers: search (Q9: debounced by useDebounce) ----------------
  // Saves a search term in "recent searches" (max 5)
  const saveRecent = (term) => {
    const clean = term.trim();
    if (clean.length < 2) return; // ignore empty / 1-letter searches
    // previousQueryRef stops the SAME term being added twice in a row
    if (clean.toLowerCase() === previousQueryRef.current.toLowerCase()) return;
    previousQueryRef.current = clean;
    setRecentSearches((prev) =>
      [clean, ...prev.filter((t) => t.toLowerCase() !== clean.toLowerCase())].slice(0, MAX_RECENT),
    );
  };

  // Effect 5: when the debounced text settles, remember it as a recent search
  useEffect(() => {
    saveRecent(debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Every keystroke just updates the text; useDebounce handles the waiting
  const onChangeSearch = (text) => setSearchText(text);

  const submitSearch = () => saveRecent(searchText);

  // Tapping the search icon focuses the input through its ref
  const focusSearch = () => searchInputRef.current?.focus();

  // Clear button: empty the text AND keep the keyboard open (focus stays)
  const clearSearch = () => {
    setSearchText('');
    searchInputRef.current?.focus();
  };

  const selectRecent = (term) => {
    setSearchText(term);
    Keyboard.dismiss();
  };

  // ---------------- Q5 handlers: scroll ----------------
  // Only update state when crossing the 300px line, not on every pixel
  const onScroll = (event) => {
    const shouldShow = event.nativeEvent.contentOffset.y > BACK_TO_TOP_OFFSET;
    if (shouldShow !== showBackToTop) setShowBackToTop(shouldShow);
  };

  const scrollToTop = () => listRef.current?.scrollToOffset({ offset: 0, animated: true });

  // ---------------- Handlers ----------------
  // ---------------- Q10: live manager edits ----------------
  // When the manager adds a dish, changes a price or toggles availability,
  // the shared menu changes and the loaded list is updated immediately.
  // (Skipped while the first load is still running or has failed.)
  useEffect(() => {
    setMenuItems((prev) => (prev.length === 0 ? prev : sharedMenu.map((item) => ({ ...item }))));
  }, [sharedMenu]);

  const selectCategory = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.create(220, 'easeInEaseOut', 'opacity'));
    setSelectedCategory(id);
  };

  // Pull to refresh: keep the current list visible while reloading
  const onRefresh = () => {
    setIsRefreshing(true);
    fetchMenu(latestMenuRef.current)
      .promise.then((items) => {
        setMenuItems(items);
        setError(null);
      })
      .catch(() => Alert.alert('Refresh failed', 'Could not refresh the menu. Please try again.'))
      .finally(() => setIsRefreshing(false));
  };

  // ---------------- Q8: stable handlers with useCallback ----------------
  // useCallback returns the SAME function object on every render (until its
  // dependencies change). Because MenuItemCard is wrapped in React.memo, a
  // stable function prop means the card does not re-render needlessly.
  // `dispatch` and state setters are already stable, so the deps stay tiny.
  const handleAdd = useCallback(
    (item) => {
      dispatch({ type: CART_ACTIONS.ADD_ITEM, payload: item }); // Q7 cart reducer
      setToast(`${item.name} added to cart`);
    },
    [dispatch],
  );

  // Favourites: ONE state array of ids. The functional update (prev => ...)
  // means this function never needs to change, so its deps are [].
  const toggleFavorite = useCallback((id) => {
    setFavoriteIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const countFor = (categoryId) =>
    categoryId === 'All'
      ? menuItems.length
      : menuItems.filter((i) => i.category === categoryId).length;

  // ---------------- Render pieces ----------------
  // renderItem is also memoised so FlatList receives a stable function.
  // Each card gets only simple values for ITS dish, so when one heart is
  // tapped, only that card's `isFavorite` prop changes.
  const renderItem = useCallback(
    ({ item }) => (
      <MenuItemCard
        item={item}
        quantity={quantityById[item.id] ?? 0}
        isFavorite={favoriteIds.includes(item.id)}
        onAdd={ENABLE_MEMO ? handleAdd : (dish) => handleAdd(dish)}
        onToggleFavorite={ENABLE_MEMO ? toggleFavorite : (id) => toggleFavorite(id)}
      />
    ),
    [quantityById, favoriteIds, handleAdd, toggleFavorite],
  );

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
              <Ionicons
                name={c.icon}
                size={16}
                color={active ? colors.onPrimary : colors.primaryText}
              />
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

      {/* Q8: sort options */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sortRow}
      >
        <Text style={styles.sortLabel}>Sort</Text>
        {SORT_OPTIONS.map((o) => {
          const active = sortOrder === o.id;
          return (
            <TouchableOpacity
              key={o.id}
              style={[styles.sortPill, active && styles.sortPillActive]}
              onPress={() => setSortOrder(o.id)}
              accessibilityLabel={`Sort by ${o.label}`}
            >
              <Ionicons
                name={o.icon}
                size={14}
                color={active ? colors.primaryText : colors.textMuted}
              />
              <Text style={[styles.sortText, active && styles.sortTextActive]}>
                {o.short ?? o.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>
          {selectedCategory === 'All' ? 'Full menu' : selectedCategory}
        </Text>
        {favoriteIds.length > 0 && (
          <View style={styles.favCount}>
            <Ionicons name="heart" size={12} color={colors.error} />
            <Text style={styles.favCountText}>{favoriteIds.length}</Text>
          </View>
        )}
      </View>
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

  // ---------------- Search bar (fixed above the list) ----------------
  const showRecent = isSearchFocused && searchText === '' && recentSearches.length > 0;
  const SearchBar = (
    <View style={styles.searchArea}>
      <View style={[styles.searchBar, isSearchFocused && styles.searchBarFocused]}>
        <TouchableOpacity
          onPress={focusSearch}
          onLongPress={() => setShowDebug((v) => !v)}
          hitSlop={10}
          accessibilityLabel="Focus search"
        >
          <Ionicons name="search" size={20} color={colors.primaryText} />
        </TouchableOpacity>
        <TextInput
          ref={searchInputRef}
          value={searchText}
          onChangeText={onChangeSearch}
          onSubmitEditing={submitSearch}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          placeholder="Search burgers, pizza, shakes…"
          placeholderTextColor={colors.textMuted}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          style={styles.searchInput}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={clearSearch} hitSlop={10} accessibilityLabel="Clear search">
            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Debug label required by Q5 – shows the useRef render counter */}
      {/* Hidden by default – long-press the search icon to toggle it */}
      {showDebug && <Text style={styles.debugLabel}>Debug · renders: {renderCount.current}</Text>}

      {/* Recent searches – visible when the input is focused and empty */}
      {showRecent && (
        <View style={styles.recentPanel}>
          <Text style={styles.recentTitle}>Recent searches</Text>
          {recentSearches.map((term) => (
            <TouchableOpacity
              key={term}
              style={styles.recentRow}
              onPress={() => selectRecent(term)}
            >
              <Ionicons name="time-outline" size={18} color={colors.textMuted} />
              <Text style={styles.recentText}>{term}</Text>
              <Ionicons
                name="arrow-up-outline"
                size={16}
                color={colors.textMuted}
                style={styles.recentArrow}
              />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  // ---------------- Main screen ----------------
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {SearchBar}

      {isLoading ? (
        <View>
          {ListHeader}
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.primaryText} />
            <Text style={styles.loadingText}>Preparing today’s menu…</Text>
          </View>
          <MenuSkeleton count={4} />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          onScroll={onScroll}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          data={visibleItems}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={colors.primaryText}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            searchQuery.trim() ? (
              <View style={styles.emptyWrap}>
                <View style={styles.emptyIcon}>
                  <Ionicons name="search-outline" size={34} color={colors.primaryText} />
                </View>
                <Text style={styles.emptyTitle}>No dishes found</Text>
                <Text style={styles.emptyText}>
                  Nothing matches “{searchQuery.trim()}”
                  {selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}. Try another word.
                </Text>
                <TouchableOpacity style={styles.emptyButton} onPress={clearSearch}>
                  <Text style={styles.emptyButtonText}>Clear search</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.empty}>No dishes in this category right now.</Text>
            )
          }
        />
      )}

      {/* Floating "Back to top" button (visible after scrolling 300px) */}
      {showBackToTop && !isLoading && (
        <TouchableOpacity
          style={[styles.backToTop, toast && styles.backToTopRaised]}
          onPress={scrollToTop}
          activeOpacity={0.85}
          accessibilityLabel="Back to top"
        >
          <Ionicons name="arrow-up" size={18} color={colors.white} />
          <Text style={styles.backToTopText}>Top</Text>
        </TouchableOpacity>
      )}

      {/* "Added" toast */}
      {toast && (
        <View style={styles.toast}>
          <Ionicons name="checkmark-circle" size={20} color={colors.toastText} />
          <Text style={styles.toastText} numberOfLines={1}>
            {toast}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('CartTab')} hitSlop={10}>
            <Text style={styles.toastAction}>View cart</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
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
    chipCountText: { fontSize: 11, fontWeight: '800', color: colors.primaryText },
    chipCountTextActive: { color: colors.white },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text,
      marginHorizontal: spacing.md,
      marginTop: spacing.lg,
      marginBottom: spacing.sm + 4,
    },

    // Sort (Q8)
    sortRow: { paddingHorizontal: spacing.md, gap: 8, alignItems: 'center', marginTop: 12 },
    sortLabel: { fontSize: 13, fontWeight: '800', color: colors.textMuted, marginRight: 2 },
    sortPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 11,
      paddingVertical: 6,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sortPillActive: { borderColor: colors.primaryText, backgroundColor: colors.primarySoft },
    sortText: { fontSize: 12.5, fontWeight: '700', color: colors.textMuted },
    sortTextActive: { color: colors.primaryText },
    sectionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginRight: spacing.md,
    },
    favCount: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.errorSoft,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: radius.pill,
      marginTop: spacing.lg - 4,
    },
    favCountText: { fontSize: 12, fontWeight: '800', color: colors.error },

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
      backgroundColor: colors.errorSoft,
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

    // Search (Q5)
    searchArea: {
      paddingHorizontal: spacing.md,
      paddingTop: 12,
      paddingBottom: 6,
      backgroundColor: colors.background,
      zIndex: 10,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: colors.card,
      borderRadius: radius.pill,
      borderWidth: 1.5,
      borderColor: colors.border,
      paddingHorizontal: 16,
      height: 50,
      shadowColor: colors.shadow,
      shadowOpacity: 0.05,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 1,
    },
    searchBarFocused: { borderColor: colors.primaryText },
    searchInput: { flex: 1, fontSize: 15, color: colors.text },
    debugLabel: {
      alignSelf: 'flex-end',
      marginTop: 4,
      fontSize: 10,
      fontWeight: '700',
      color: colors.textMuted,
      backgroundColor: colors.muted,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: radius.pill,
      overflow: 'hidden',
    },
    recentPanel: {
      position: 'absolute',
      top: 66,
      left: spacing.md,
      right: spacing.md,
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      paddingVertical: 8,
      shadowColor: '#000',
      shadowOpacity: 0.12,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 8,
    },
    recentTitle: {
      fontSize: 12,
      fontWeight: '800',
      color: colors.textMuted,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      paddingHorizontal: 16,
      paddingVertical: 6,
    },
    recentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 16,
      paddingVertical: 11,
    },
    recentText: { flex: 1, fontSize: 15, color: colors.text, fontWeight: '600' },
    recentArrow: { transform: [{ rotate: '-45deg' }] },
    emptyWrap: { alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: 30 },
    emptyIcon: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    emptyTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
    emptyText: { color: colors.textMuted, textAlign: 'center', marginTop: 6, lineHeight: 20 },
    emptyButton: {
      marginTop: 16,
      borderWidth: 1.5,
      borderColor: colors.primaryText,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: radius.pill,
    },
    emptyButtonText: { color: colors.primaryText, fontWeight: '800' },
    backToTop: {
      position: 'absolute',
      right: spacing.md,
      bottom: 28,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 11,
      borderRadius: radius.pill,
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 6,
    },
    backToTopRaised: { bottom: 92 },
    backToTopText: { color: colors.white, fontWeight: '800' },

    // Toast
    toast: {
      position: 'absolute',
      left: spacing.md,
      right: spacing.md,
      bottom: 30,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.toast,
      paddingVertical: 13,
      paddingHorizontal: 16,
      borderRadius: radius.md,
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 6,
    },
    toastText: { color: colors.toastText, fontWeight: '700', flex: 1 },
    toastAction: { color: colors.accent, fontWeight: '800' },
  });
