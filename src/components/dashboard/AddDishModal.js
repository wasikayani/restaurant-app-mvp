// src/components/dashboard/AddDishModal.js
// Question 10 – form to add a new dish. Reuses the custom useForm hook from Q9.

import { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Switch,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FormInput from '../FormInput';
import useForm from '../../hooks/useForm';
import { useTheme } from '../../context/ThemeContext';
import { categories, menuItems as mockMenu } from '../../data/menu';
import { radius, spacing } from '../../theme/colors';

const EMPTY_DISH = { name: '', description: '', price: '', category: 'Mains', image: '' };
const CATEGORY_IDS = categories.map((c) => (typeof c === 'string' ? c : c.id)).filter((c) => c !== 'All');

// Default photo per category (taken from the existing menu) when no URL is given
const defaultImageFor = (category) => mockMenu.find((m) => m.category === category)?.image ?? mockMenu[0].image;

// Module-level (stable) validate function, as useForm expects
function validateDish(values) {
  const errors = {};
  const price = Number(values.price);
  if (values.name.trim().length < 3) errors.name = 'Name must be at least 3 characters.';
  if (values.description.trim().length < 10) errors.description = 'Add a short description (10+ characters).';
  if (!values.price || Number.isNaN(price) || price <= 0) errors.price = 'Enter a price greater than 0.';
  else if (price > 100000) errors.price = 'Price looks too high.';
  if (values.image && !/^https?:\/\//.test(values.image.trim())) errors.image = 'Image must be a web link (https://…).';
  return errors;
}

export default function AddDishModal({ visible, onClose, onSave }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { values, errors, handleChange, handleSubmit, reset } = useForm(EMPTY_DISH, validateDish);
  const [isSpecial, setIsSpecial] = useState(false);

  const close = () => {
    reset();
    setIsSpecial(false);
    onClose();
  };

  const save = () =>
    handleSubmit((valid) => {
      onSave({
        name: valid.name.trim(),
        description: valid.description.trim(),
        price: Math.round(Number(valid.price)),
        category: valid.category,
        image: valid.image.trim() || defaultImageFor(valid.category),
        isSpecial,
      });
      close();
    });

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={close}>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Add a new dish</Text>
            <TouchableOpacity onPress={close} hitSlop={10} accessibilityLabel="Close">
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled">
            <FormInput
              icon="fast-food-outline"
              placeholder="Dish name"
              value={values.name}
              onChangeText={(t) => handleChange('name', t)}
              error={errors.name}
              autoCapitalize="words"
            />
            <FormInput
              icon="document-text-outline"
              placeholder="Short description"
              value={values.description}
              onChangeText={(t) => handleChange('description', t)}
              error={errors.description}
              autoCapitalize="sentences"
            />
            <FormInput
              icon="pricetag-outline"
              placeholder="Price in Rs, e.g. 950"
              keyboardType="number-pad"
              value={values.price}
              onChangeText={(t) => handleChange('price', t.replace(/[^0-9]/g, ''))}
              error={errors.price}
            />
            <FormInput
              icon="image-outline"
              placeholder="Image link (optional)"
              value={values.image}
              onChangeText={(t) => handleChange('image', t)}
              error={errors.image}
              keyboardType="url"
            />

            <Text style={styles.label}>Category</Text>
            <View style={styles.chips}>
              {CATEGORY_IDS.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => handleChange('category', c)}
                  style={[styles.chip, values.category === c && styles.chipActive]}
                >
                  <Text style={[styles.chipText, values.category === c && styles.chipTextActive]}>
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchLabel}>Daily special</Text>
                <Text style={styles.switchSub}>Shows the “Daily Special” badge</Text>
              </View>
              <Switch
                value={isSpecial}
                onValueChange={setIsSpecial}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.white}
              />
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={save} activeOpacity={0.85}>
              <Ionicons name="add-circle" size={20} color={colors.onPrimary} />
              <Text style={styles.saveText}>Add to menu</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.backdrop },
    sheet: {
      maxHeight: '90%',
      backgroundColor: colors.background,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      padding: spacing.lg,
      paddingBottom: 36,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    title: { fontSize: 21, fontWeight: '800', color: colors.text },
    label: { fontSize: 13.5, fontWeight: '800', color: colors.text, marginBottom: 8, marginTop: 4 },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: radius.pill,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    chipText: { fontWeight: '700', color: colors.text },
    chipTextActive: { color: colors.onPrimary },
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: radius.md,
      padding: 14,
      marginBottom: spacing.md,
    },
    switchLabel: { fontSize: 15, fontWeight: '800', color: colors.text },
    switchSub: { fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
    saveBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: colors.primary,
      paddingVertical: 15,
      borderRadius: radius.pill,
    },
    saveText: { color: colors.onPrimary, fontWeight: '800', fontSize: 16 },
  });
