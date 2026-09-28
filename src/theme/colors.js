// src/theme/colors.js
// One place for ALL colours in the app (Emerald + Cream brand).
// Q3 uses the light palette directly. In Q6 we will read these through
// useTheme() so the dark mode switch changes every screen at once.

export const lightColors = {
  primary: '#047857',      // emerald – buttons, active chips, links
  primaryDark: '#065F46',  // pressed / headers
  primarySoft: '#D1FAE5',  // light emerald backgrounds (selected role, badges)
  accent: '#D97706',       // warm amber – "Daily Special" badge, highlights
  background: '#FBF7EF',   // cream page background
  card: '#FFFFFF',         // cards, inputs
  text: '#1C2A24',         // main text
  textMuted: '#6B7280',    // hints, secondary text
  border: '#E7E1D3',       // input and card borders
  error: '#DC2626',
  success: '#16A34A',
  white: '#FFFFFF',
  overlay: 'rgba(6, 40, 30, 0.55)', // dark green film over hero images
};

export const darkColors = {
  primary: '#34D399',
  primaryDark: '#10B981',
  primarySoft: '#064E3B',
  accent: '#F59E0B',
  background: '#0E1814',
  card: '#17241E',
  text: '#F3EFE6',
  textMuted: '#9CA3AF',
  border: '#27372F',
  error: '#F87171',
  success: '#4ADE80',
  white: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.6)',
};

// Shared sizes so every screen looks consistent
export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
export const radius = { sm: 8, md: 12, lg: 20, pill: 999 };
