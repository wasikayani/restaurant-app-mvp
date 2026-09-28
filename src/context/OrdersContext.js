// src/context/OrdersContext.js
// Question 10 – every order in the app (all customers), managed with useReducer.
// Lives at app level (not inside the logged-in area) so that:
//   - the manager sees orders placed by customers
//   - orders survive logout, and (with AsyncStorage) app restarts.

import { createContext, useCallback, useContext, useReducer } from 'react';
import { ordersReducer, initialOrdersState, ORDER_ACTIONS } from '../reducers/ordersReducer';
import usePersistence from '../hooks/usePersistence';
import { STORAGE_KEYS } from '../utils/storage';

const OrdersContext = createContext(null);

export function OrdersProvider({ children }) {
  const [state, dispatch] = useReducer(ordersReducer, initialOrdersState);

  // stable function for usePersistence (dispatch never changes)
  const restoreOrders = useCallback(
    (saved) => dispatch({ type: ORDER_ACTIONS.HYDRATE, payload: saved }),
    [],
  );
  const isHydrated = usePersistence(STORAGE_KEYS.orders, state.orders, restoreOrders);

  return (
    <OrdersContext.Provider value={{ orders: state.orders, dispatch, isHydrated }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (context === null) {
    throw new Error('useOrders() must be used inside <OrdersProvider>.');
  }
  return context;
}
