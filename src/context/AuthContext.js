// src/context/AuthContext.js
// Question 6 (A1) – global authentication state with the Context API.
// Any screen can read the logged-in user or call login/logout with useAuth(),
// without passing props down through every component (no prop drilling).
//
// Assignment 2 – Q6:
//   - login(data) receives the server's answer from POST /api/auth/login or /register
//     ({ _id, name, email, role, token }).
//   - The token + user are kept in state AND saved in AsyncStorage, so the user
//     stays logged in after closing the app (until the 1-day token expires).
//   - The token is given to the API client, which sends it as "Bearer <token>".
//   - logout() clears the state, AsyncStorage and the API client token.

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken } from '../api/client';

const AuthContext = createContext(null);
const AUTH_KEY = '@greenfork/auth';

// The server sends "name" and "_id"; the A1 screens use "fullName" and "id"
function toAppUser(data) {
  return { id: data._id, fullName: data.name, name: data.name, email: data.email, role: data.role };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null = nobody logged in
  const [token, setToken] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false); // true once AsyncStorage has been read

  // On app start: restore a saved login (if any)
  useEffect(() => {
    AsyncStorage.getItem(AUTH_KEY)
      .then((raw) => {
        if (!raw) return;
        const saved = JSON.parse(raw);
        setAuthToken(saved.token);
        setToken(saved.token);
        setUser(saved.user);
      })
      .catch(() => {}) // broken storage -> just start logged out
      .finally(() => setIsHydrated(true));
  }, []);

  const login = useCallback(async (data) => {
    const appUser = toAppUser(data);
    setAuthToken(data.token); // from now on every request carries the token
    setToken(data.token);
    setUser(appUser);
    try {
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify({ token: data.token, user: appUser }));
    } catch {
      // saving failed – the user is still logged in for this session
    }
  }, []);

  const logout = useCallback(async () => {
    setAuthToken(null);
    setToken(null);
    setUser(null);
    try {
      await AsyncStorage.removeItem(AUTH_KEY);
    } catch {
      // nothing else to do
    }
  }, []);

  const value = { user, token, isHydrated, login, logout };

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
