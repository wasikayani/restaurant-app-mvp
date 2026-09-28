// src/components/MenuItemCard.js
// Question 8 – one dish card, extracted from MenuScreen and wrapped in React.memo.
//
// React.memo = "only re-render this card if its props changed".
// MenuScreen passes:
//   item, quantity, isFavorite            -> plain values (change only for THIS dish)
//   onAdd, onToggleFavorite               -> functions made with useCallback, so the
//                                            SAME function reference is passed every render
// Result: tapping the heart on one card re-renders ONLY that card.
// Proof: the console.log below prints once per card render (see the Expo terminal).

import { memo } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing } from '../theme/colors';

// Set to false to see the "before optimisation" behaviour for the Q8 screenshots:
// every card re-renders when any heart is tapped.
export const ENABLE_MEMO = false;

const formatPrice = (value) => `Rs ${value.toLocaleString('en-PK')}`;

function MenuItemCard({ item, quantity, isFavorite, onAdd, onToggleFavorite }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const disabled = !item.isAvailable;

  console.log(`[MenuItemCard] render: ${item.name}`);

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
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          {/* Favourite (heart) toggle */}
          <TouchableOpacity
            onPress={() => onToggleFavorite(item.id)}
            hitSlop={10}
            accessibilityLabel={isFavorite ? 'Remove from favourites' : 'Add to favourites'}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={21}
              color={isFavorite ? colors.error : colors.textMuted}
            />
          </TouchableOpacity>
        </View>
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
            <Text style={styles.addText}>
              {disabled ? 'N/A' : quantity > 0 ? `Add · ${quantity}` : 'Add'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      padding: 12,
      marginHorizontal: spacing.md,
      marginBottom: 14,
      shadowColor: colors.shadow,
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
      backgroundColor: colors.muted,
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
      backgroundColor: 'rgba(20,30,25,0.78)',
      paddingVertical: 4,
      alignItems: 'center',
    },
    soldOutText: { color: colors.white, fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
    cardBody: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    name: { flex: 1, fontSize: 16, fontWeight: '800', color: colors.text },
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
    price: { fontSize: 16, fontWeight: '800', color: colors.primaryText },
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
  });

// React.memo skips re-rendering when all props are the same as last time.
export default ENABLE_MEMO ? memo(MenuItemCard) : MenuItemCard;
