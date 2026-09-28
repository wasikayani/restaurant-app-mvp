// src/context/AuthContext.js
// Question 6 – global authentication state with the Context API.
//
// Any screen can read the logged-in user or call login/logout with useAuth(),
// without passing props down through every component (no prop drilling).

import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null = nobody logged in

  const login = (userData) => setUser(userData);
  const logout = () => setUser(null);

  const value = { user, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom consumer hook. Throws a clear error if used outside <AuthProvider>.
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error(
      'useAuth() must be used inside <AuthProvider>. Wrap your app with <AuthProvider> in App.js.',
    );
  }
  return context;
}
