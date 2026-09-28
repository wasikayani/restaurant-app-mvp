// src/components/FormInput.js
// Reusable text field: icon + input + optional eye toggle + error message.
// It holds NO state itself – the parent screen controls the value (controlled input).

import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { lightColors as colors, radius, spacing } from '../theme/colors';

export default function FormInput({
  icon,
  error,
  secure = false,       // true for password fields
  showSecure = false,   // parent's showPassword state
  onToggleSecure,       // parent's toggle function
  ...inputProps         // value, onChangeText, placeholder, keyboardType ...
}) {
  return (
    <View style={styles.wrapper}>
      <View style={[styles.row, error && styles.rowError]}>
        <Ionicons name={icon} size={20} color={error ? colors.error : colors.textMuted} />
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={secure && !showSecure}
          autoCapitalize="none"
          {...inputProps}
        />
        {secure && (
          <TouchableOpacity onPress={onToggleSecure} hitSlop={10}>
            <Ionicons
              name={showSecure ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 52,
    gap: 10,
  },
  rowError: { borderColor: colors.error },
  input: { flex: 1, fontSize: 15, color: colors.text },
  error: { color: colors.error, fontSize: 12, marginTop: 4, marginLeft: 4 },
});
