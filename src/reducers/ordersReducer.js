// src/reducers/ordersReducer.js
// Question 10 – all orders are managed by ONE pure reducer (useReducer in OrdersContext).
//
// Order life cycle (state machine):
//
//   Pending ──► Preparing ──► Ready ──► Served
//      │            │
//      └────────────┴──► Cancelled
//
// Status can only move FORWARD. Served and Cancelled are final.

export const ORDER_STATUSES = ['Pending', 'Preparing', 'Ready', 'Served'];
export const FINAL_STATUSES = ['Served', 'Cancelled'];
export const CANCELLABLE_STATUSES = ['Pending', 'Preparing'];

// Simulated kitchen: seconds after the order is placed when each status starts
export const STATUS_TIMINGS = { Pending: 0, Preparing: 10, Ready: 20, Served: 30 };

export const ORDER_TYPES = { DINE_IN: 'Dine-in', TAKEAWAY: 'Takeaway' };

export const ORDER_ACTIONS = {
  PLACE_ORDER: 'PLACE_ORDER',
  UPDATE_STATUS: 'UPDATE_STATUS',
  CANCEL_ORDER: 'CANCEL_ORDER',
  HYDRATE: 'HYDRATE', // replace everything with the orders loaded from AsyncStorage
  RESET: 'RESET',
};

export const initialOrdersState = { orders: [] };

// ---------------- helpers (pure) ----------------
export const statusIndex = (status) => ORDER_STATUSES.indexOf(status);
export const isFinalStatus = (status) => FINAL_STATUSES.includes(status);

export function getNextStatus(status) {
  const index = statusIndex(status);
  return index >= 0 && index < ORDER_STATUSES.length - 1 ? ORDER_STATUSES[index + 1] : null;
}

// Which status the simulated kitchen has reached after `seconds`
export function getStatusForElapsed(seconds) {
  let current = ORDER_STATUSES[0];
  ORDER_STATUSES.forEach((status) => {
    if (seconds >= STATUS_TIMINGS[status]) current = status;
  });
  return current;
}

export const secondsBetween = (from, to) => Math.max(0, Math.floor((to - from) / 1000));

// Builds a new order object. Ids and timestamps are created HERE (not inside
// the reducer) so the reducer stays pure: same input -> same output.
export function createOrder({ items, totals, promoCode, type, tableId, tableNumber, pickupTime, user, now = Date.now() }) {
  return {
    id: `GF-${String(now).slice(-5)}`,
    userId: user?.id ?? 'guest',
    customerName: user?.fullName ?? 'Guest',
    items: items.map(({ id, name, price, quantity, note, image }) => ({
      id,
      name,
      price,
      quantity,
      note,
      image,
    })),
    subtotal: totals.subtotal,
    discount: totals.discount,
    serviceCharge: totals.serviceCharge,
    salesTax: totals.salesTax,
    total: totals.grandTotal,
    itemCount: totals.itemCount,
    promoCode: promoCode ?? null,
    type,
    tableId: type === ORDER_TYPES.DINE_IN ? tableId : null,
    tableNumber: type === ORDER_TYPES.DINE_IN ? tableNumber : null,
    pickupTime: type === ORDER_TYPES.TAKEAWAY ? pickupTime : null,
    status: 'Pending',
    timestamp: now,
    history: [{ status: 'Pending', at: now }], // when each status was reached
  };
}

// ---------------- reducer ----------------
export function ordersReducer(state, action) {
  switch (action.type) {
    case ORDER_ACTIONS.PLACE_ORDER:
      // newest order first
      return { ...state, orders: [action.payload, ...state.orders] };

    case ORDER_ACTIONS.UPDATE_STATUS: {
      const { id, status, at = Date.now() } = action.payload;
      const order = state.orders.find((o) => o.id === id);
      // ignore unknown orders, final orders and backward / same-status moves
      if (!order || isFinalStatus(order.status) || statusIndex(status) <= statusIndex(order.status)) {
        return state; // same object -> React skips the re-render
      }
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === id ? { ...o, status, history: [...o.history, { status, at }] } : o,
        ),
      };
    }

    case ORDER_ACTIONS.CANCEL_ORDER: {
      const { id, at = Date.now() } = action.payload;
      const order = state.orders.find((o) => o.id === id);
      if (!order || !CANCELLABLE_STATUSES.includes(order.status)) return state;
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === id
            ? { ...o, status: 'Cancelled', history: [...o.history, { status: 'Cancelled', at }] }
            : o,
        ),
      };
    }

    case ORDER_ACTIONS.HYDRATE:
      return { ...state, orders: Array.isArray(action.payload) ? action.payload : [] };

    case ORDER_ACTIONS.RESET:
      return initialOrdersState;

    default:
      throw new Error(`Unknown order action: ${action.type}`);
  }
}
