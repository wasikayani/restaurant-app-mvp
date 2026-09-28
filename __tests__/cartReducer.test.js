// __tests__/cartReducer.test.js
// Question 7 (bonus) – Jest unit tests for the pure cart reducer.
// Run with:  npm test

import {
  cartReducer,
  initialCartState,
  CART_ACTIONS,
  getItemCount,
  getSubtotal,
} from '../src/reducers/cartReducer';

const burger = { id: 'm6', name: 'Double Smash Burger', price: 1450, image: 'burger.jpg' };
const shake = { id: 'm18', name: 'Chocolate Cookie Shake', price: 590, image: 'shake.jpg' };

// Helper: a cart that already contains items
const cartWith = (...lines) => ({
  ...initialCartState,
  items: lines.map(([item, quantity, note = '']) => ({
    id: item.id,
    name: item.name,
    price: item.price,
    image: item.image,
    quantity,
    note,
  })),
});

describe('cartReducer', () => {
  test('1. ADD_ITEM adds a new item with quantity 1', () => {
    const next = cartReducer(initialCartState, { type: CART_ACTIONS.ADD_ITEM, payload: burger });
    expect(next.items).toHaveLength(1);
    expect(next.items[0]).toMatchObject({ id: 'm6', quantity: 1, note: '' });
  });

  test('2. ADD_ITEM on an existing item increases its quantity', () => {
    const next = cartReducer(cartWith([burger, 1]), {
      type: CART_ACTIONS.ADD_ITEM,
      payload: burger,
    });
    expect(next.items).toHaveLength(1);
    expect(next.items[0].quantity).toBe(2);
  });

  test('3. INCREMENT adds one to the quantity', () => {
    const next = cartReducer(cartWith([shake, 2]), {
      type: CART_ACTIONS.INCREMENT,
      payload: { id: 'm18' },
    });
    expect(next.items[0].quantity).toBe(3);
  });

  test('4. DECREMENT subtracts one when quantity is above 1', () => {
    const next = cartReducer(cartWith([shake, 3]), {
      type: CART_ACTIONS.DECREMENT,
      payload: { id: 'm18' },
    });
    expect(next.items[0].quantity).toBe(2);
  });

  test('5. DECREMENT removes the item when quantity reaches zero', () => {
    const next = cartReducer(cartWith([burger, 1], [shake, 2]), {
      type: CART_ACTIONS.DECREMENT,
      payload: { id: 'm6' },
    });
    expect(next.items.map((i) => i.id)).toEqual(['m18']);
  });

  test('6. REMOVE_ITEM deletes the item completely', () => {
    const next = cartReducer(cartWith([burger, 4], [shake, 1]), {
      type: CART_ACTIONS.REMOVE_ITEM,
      payload: { id: 'm6' },
    });
    expect(next.items).toHaveLength(1);
    expect(next.items[0].id).toBe('m18');
  });

  test('7. UPDATE_NOTE sets special instructions for one item', () => {
    const next = cartReducer(cartWith([burger, 1]), {
      type: CART_ACTIONS.UPDATE_NOTE,
      payload: { id: 'm6', note: 'no onions' },
    });
    expect(next.items[0].note).toBe('no onions');
  });

  test('8. APPLY_PROMO with a valid code sets code and discount', () => {
    const next = cartReducer(cartWith([burger, 1]), {
      type: CART_ACTIONS.APPLY_PROMO,
      payload: { code: ' feast20 ' },
    });
    expect(next.promoCode).toBe('FEAST20');
    expect(next.discountPercent).toBe(20);
  });

  test('9. APPLY_PROMO with an invalid code leaves state unchanged', () => {
    const start = cartWith([burger, 1]);
    const next = cartReducer(start, {
      type: CART_ACTIONS.APPLY_PROMO,
      payload: { code: 'FREE100' },
    });
    expect(next).toBe(start); // exact same object
    expect(next.discountPercent).toBe(0);
  });

  test('10. REMOVE_PROMO clears the code and discount', () => {
    const withPromo = { ...cartWith([burger, 1]), promoCode: 'WELCOME10', discountPercent: 10 };
    const next = cartReducer(withPromo, { type: CART_ACTIONS.REMOVE_PROMO });
    expect(next.promoCode).toBeNull();
    expect(next.discountPercent).toBe(0);
  });

  test('11. CLEAR_CART returns the initial empty state', () => {
    const withPromo = {
      ...cartWith([burger, 2], [shake, 1]),
      promoCode: 'FEAST20',
      discountPercent: 20,
    };
    expect(cartReducer(withPromo, { type: CART_ACTIONS.CLEAR_CART })).toEqual(initialCartState);
  });

  test('12. The reducer is pure: it never mutates the previous state', () => {
    const start = cartWith([burger, 1]);
    const snapshot = JSON.parse(JSON.stringify(start));
    Object.freeze(start);
    Object.freeze(start.items);
    start.items.forEach(Object.freeze);

    cartReducer(start, { type: CART_ACTIONS.INCREMENT, payload: { id: 'm6' } });
    cartReducer(start, { type: CART_ACTIONS.ADD_ITEM, payload: shake });
    cartReducer(start, {
      type: CART_ACTIONS.UPDATE_NOTE,
      payload: { id: 'm6', note: 'extra cheese' },
    });

    expect(start).toEqual(snapshot);
  });

  test('13. Unknown actions throw a clear error', () => {
    expect(() => cartReducer(initialCartState, { type: 'FLY_TO_MOON' })).toThrow(/unknown action/);
  });

  test('14. Helpers count items and subtotal correctly', () => {
    const cart = cartWith([burger, 2], [shake, 3]);
    expect(getItemCount(cart.items)).toBe(5);
    expect(getSubtotal(cart.items)).toBe(2 * 1450 + 3 * 590);
  });
});
