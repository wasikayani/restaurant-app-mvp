// src/reducers/cartReducer.js
// Question 7 – Cart state managed by a PURE reducer.
//
// State shape: { items, promoCode, discountPercent }
//   items -> [{ id, name, price, image, quantity, note }]
//
// "Pure" means:
//   - same state + same action  ->  always the same new state
//   - it NEVER changes (mutates) the previous state; it always returns new
//     objects/arrays using spread (...), map() and filter()
//   - no side effects (no API calls, timers, alerts or random numbers)

// Mock promo codes (no backend): code -> discount percent
export const PROMO_CODES = {
  WELCOME10: 10,
  FEAST20: 20,
};

export const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  INCREMENT: 'INCREMENT',
  DECREMENT: 'DECREMENT',
  UPDATE_NOTE: 'UPDATE_NOTE',
  CLEAR_CART: 'CLEAR_CART',
  APPLY_PROMO: 'APPLY_PROMO',
  REMOVE_PROMO: 'REMOVE_PROMO',
};

export const initialCartState = {
  items: [],
  promoCode: null,
  discountPercent: 0,
};

// Normalises what the user typed: " feast20 " -> "FEAST20"
export const normalizePromo = (code = '') => code.trim().toUpperCase();

// Returns true if the code exists in PROMO_CODES
export const isValidPromo = (code) =>
  Object.prototype.hasOwnProperty.call(PROMO_CODES, normalizePromo(code));

export function cartReducer(state, action) {
  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM: {
      const item = action.payload; // a menu item
      const existing = state.items.find((i) => i.id === item.id);
      if (existing) {
        // already in cart -> increase its quantity
        return {
          ...state,
          items: state.items.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
          ),
        };
      }
      // new line in the cart
      return {
        ...state,
        items: [
          ...state.items,
          {
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: 1,
            note: '',
          },
        ],
      };
    }

    case CART_ACTIONS.REMOVE_ITEM:
      return { ...state, items: state.items.filter((i) => i.id !== action.payload.id) };

    case CART_ACTIONS.INCREMENT:
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.payload.id ? { ...i, quantity: i.quantity + 1 } : i,
        ),
      };

    case CART_ACTIONS.DECREMENT: {
      const target = state.items.find((i) => i.id === action.payload.id);
      if (!target) return state;
      if (target.quantity <= 1) {
        // quantity would reach zero -> remove the item
        return { ...state, items: state.items.filter((i) => i.id !== action.payload.id) };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.payload.id ? { ...i, quantity: i.quantity - 1 } : i,
        ),
      };
    }

    case CART_ACTIONS.UPDATE_NOTE:
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.payload.id ? { ...i, note: action.payload.note } : i,
        ),
      };

    case CART_ACTIONS.CLEAR_CART:
      return initialCartState;

    case CART_ACTIONS.APPLY_PROMO: {
      const code = normalizePromo(action.payload.code);
      if (!isValidPromo(code)) return state; // invalid code -> state unchanged
      return { ...state, promoCode: code, discountPercent: PROMO_CODES[code] };
    }

    case CART_ACTIONS.REMOVE_PROMO:
      return { ...state, promoCode: null, discountPercent: 0 };

    default:
      throw new Error(`cartReducer: unknown action type "${action.type}"`);
  }
}

// ---------- Small pure helpers used by screens ----------
export const getItemCount = (items) => items.reduce((sum, i) => sum + i.quantity, 0);
export const getSubtotal = (items) => items.reduce((sum, i) => sum + i.price * i.quantity, 0);
