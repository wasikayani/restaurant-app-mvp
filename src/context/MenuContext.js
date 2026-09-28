// src/context/MenuContext.js
// Question 10 – the ONE shared menu. The manager edits it in the Dashboard
// (add dish, change price, toggle availability) and customers see the change
// on the Menu screen straight away, because both read this same state.
// Saved in AsyncStorage, so edits survive app restarts.

import { createContext, useCallback, useContext, useState } from 'react';
import { menuItems as mockMenu } from '../data/menu';
import usePersistence from '../hooks/usePersistence';
import { STORAGE_KEYS } from '../utils/storage';

const MenuContext = createContext(null);

export function MenuProvider({ children }) {
  const [menu, setMenu] = useState(mockMenu);
  const isHydrated = usePersistence(STORAGE_KEYS.menu, menu, setMenu);

  const addMenuItem = useCallback((item) => {
    const newItem = {
      rating: 4.5,
      prepTime: 15,
      isSpecial: false,
      isAvailable: true,
      ...item,
      id: `m-${Date.now()}`,
    };
    setMenu((prev) => [newItem, ...prev]);
    return newItem;
  }, []);

  const updateMenuItemPrice = useCallback((id, price) => {
    setMenu((prev) => prev.map((item) => (item.id === id ? { ...item, price } : item)));
  }, []);

  const toggleMenuItemAvailability = useCallback((id) => {
    setMenu((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isAvailable: !item.isAvailable } : item)),
    );
  }, []);

  const resetMenu = useCallback(() => setMenu(mockMenu), []);

  return (
    <MenuContext.Provider
      value={{
        menu,
        isHydrated,
        addMenuItem,
        updateMenuItemPrice,
        toggleMenuItemAvailability,
        resetMenu,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (context === null) {
    throw new Error('useMenu() must be used inside <MenuProvider>.');
  }
  return context;
}
