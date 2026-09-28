// src/utils/storage.js
// Question 10 – small wrapper around AsyncStorage (the phone's key-value storage).
// AsyncStorage only stores STRINGS, so values are saved as JSON text.
// Every call is wrapped in try/catch: if storage fails, the app keeps working
// with the in-memory data instead of crashing.

import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  orders: '@greenfork/orders',
  reservations: '@greenfork/reservations',
  menu: '@greenfork/menu',
};

// Returns the saved value, or `null` when nothing is saved yet
export async function loadJSON(key) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw === null ? null : JSON.parse(raw);
  } catch (error) {
    console.warn(`[storage] could not read ${key}:`, error.message);
    return null;
  }
}

export async function saveJSON(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`[storage] could not save ${key}:`, error.message);
  }
}
