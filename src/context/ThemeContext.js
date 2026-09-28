// src/context/ThemeContext.js
// Question 6 – global light/dark theme with the Context API.
//
// useTheme() gives every screen { isDark, toggleTheme, colors }.
// Flipping isDark swaps the whole palette, and every screen that reads
// `colors` re-renders with the new colours instantly.

import { createContext, useContext, useState } from 'react';
import { lightColors, darkColors } from '../theme/colors';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => setIsDark((prev) => !prev);
  const colors = isDark ? darkColors : lightColors;

  const value = { isDark, toggleTheme, colors };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// Custom consumer hook. Throws a clear error if used outside <ThemeProvider>.
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === null) {
    throw new Error(
      'useTheme() must be used inside <ThemeProvider>. Wrap your app with <ThemeProvider> in App.js.',
    );
  }
  return context;
}
