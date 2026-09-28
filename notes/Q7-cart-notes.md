# Q7 Notes – Cart reducer

## Test cases for `cartReducer`

Burger = `{ id: 'm6', price: 1450 }`, Shake = `{ id: 'm18', price: 590 }`.
All cases are automated in `__tests__/cartReducer.test.js` (run `npm test`: 14 tests, all passing).

| # | Action | Initial state | Expected state |
|---|--------|---------------|----------------|
| 1 | `ADD_ITEM` (Burger) | `items: []` | `items: [{ Burger, quantity: 1, note: '' }]` |
| 2 | `ADD_ITEM` (Burger) | `items: [Burger ×1]` | `items: [Burger ×2]` (no duplicate line) |
| 3 | `INCREMENT` (Shake) | `items: [Shake ×2]` | `items: [Shake ×3]` |
| 4 | `DECREMENT` (Shake) | `items: [Shake ×3]` | `items: [Shake ×2]` |
| 5 | `DECREMENT` (Burger) | `items: [Burger ×1, Shake ×2]` | `items: [Shake ×2]` (Burger removed at zero) |
| 6 | `REMOVE_ITEM` (Burger) | `items: [Burger ×4, Shake ×1]` | `items: [Shake ×1]` |
| 7 | `UPDATE_NOTE` (Burger, "no onions") | `items: [Burger, note: '']` | `items: [Burger, note: 'no onions']` |
| 8 | `APPLY_PROMO` (" feast20 ") | `promoCode: null, discountPercent: 0` | `promoCode: 'FEAST20', discountPercent: 20` |
| 9 | `APPLY_PROMO` ("FREE100") | `promoCode: null, discountPercent: 0` | unchanged (same object); the screen shows an error message |
| 10 | `REMOVE_PROMO` | `promoCode: 'WELCOME10', discountPercent: 10` | `promoCode: null, discountPercent: 0` |
| 11 | `CLEAR_CART` | `items: [Burger ×2, Shake ×1], promoCode: 'FEAST20'` | `{ items: [], promoCode: null, discountPercent: 0 }` |
| 12 | Any action on a frozen state | frozen state object | previous state is not mutated (purity check) |

## useReducer vs useState for this cart

The cart has several related pieces of state (items, quantities, notes, promo code and discount) and eight different ways to change them.
With `useState` this logic would be spread across many setter calls inside the screens, and it would be easy to forget a rule, for example removing an item when its quantity reaches zero.
`useReducer` puts every transition in one pure function, so the screens only `dispatch` an action that describes *what happened*. The reducer is also easy to test without any UI, which is exactly what the Jest tests do.
`useState` would have been enough for a very simple cart, such as a single item count or a list where you only add and remove items, with no quantities, notes or promo codes.
