// src/theme/colors.js
// ONE place for ALL colours in the app (Emerald + Cream brand).
// Every screen reads these through useTheme(), so the dark-mode switch
// changes the whole app instantly (Q6).

export const lightColors = {
  primary: '#047857', // emerald – buttons, active chips, badges
  primaryDark: '#065F46', // pressed / avatar
  primarySoft: '#D1FAE5', // light emerald backgrounds (selected role, badges)
  primaryText: '#047857', // emerald used for TEXT and icons on the page (prices, links)
  onPrimary: '#FFFFFF', // text/icons placed on top of primary
  header: '#047857', // top bar background
  accent: '#D97706', // amber – "Daily Special" badge, ratings
  background: '#FBF7EF', // cream page background
  card: '#FFFFFF', // cards, inputs, sheets
  muted: '#EFE9DC', // image placeholders, segmented control, skeleton
  text: '#1C2A24', // main text
  textMuted: '#6B7280', // hints, secondary text
  border: '#E7E1D3', // input and card borders
  divider: '#F0EBE0',
  error: '#DC2626',
  errorSoft: '#FEE2E2',
  success: '#16A34A',
  white: '#FFFFFF',
  toast: '#1C2A24', // toast background
  toastText: '#FFFFFF',
  overlay: 'rgba(6, 40, 30, 0.55)', // film over hero images
  backdrop: 'rgba(6, 30, 22, 0.45)', // dim behind modals / sheets
  shadow: '#1C2A24',
};

export const darkColors = {
  primary: '#059669',
  primaryDark: '#064E3B',
  primarySoft: '#123B2E',
  primaryText: '#34D399',
  onPrimary: '#FFFFFF',
  header: '#0F241C',
  accent: '#F59E0B',
  background: '#0B1612',
  card: '#15231D',
  muted: '#1F3029',
  text: '#F3EFE6',
  textMuted: '#9CA3AF',
  border: '#26382F',
  divider: '#22332B',
  error: '#F87171',
  errorSoft: '#3B1F1F',
  success: '#4ADE80',
  white: '#FFFFFF',
  toast: '#F3EFE6',
  toastText: '#0B1612',
  overlay: 'rgba(0, 0, 0, 0.6)',
  backdrop: 'rgba(0, 0, 0, 0.6)',
  shadow: '#000000',
};

// Shared sizes so every screen looks consistent
export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
export const radius = { sm: 8, md: 12, lg: 20, pill: 999 };
