// src/context/CartContext.js
// Question 7 – CartProvider uses useReducer and shares { state, dispatch }
// with the whole app through CartContext. Screens use the useCart() hook.

import { createContext, useContext, useReducer } from 'react';
import { cartReducer, initialCartState } from '../reducers/cartReducer';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  // useReducer(reducer, initialState) -> [current state, dispatch function]
  const [state, dispatch] = useReducer(cartReducer, initialCartState);

  return <CartContext.Provider value={{ state, dispatch }}>{children}</CartContext.Provider>;
}

// Custom consumer hook. Throws a clear error if used outside <CartProvider>.
export function useCart() {
  const context = useContext(CartContext);
  if (context === null) {
    throw new Error('useCart() must be used inside <CartProvider>.');
  }
  return context;
}
