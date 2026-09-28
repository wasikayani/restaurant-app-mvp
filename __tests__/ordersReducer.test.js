// __tests__/ordersReducer.test.js
// Question 10 – order life cycle rules (pure reducer, no UI).

import {
  ordersReducer,
  initialOrdersState,
  ORDER_ACTIONS,
  ORDER_TYPES,
  createOrder,
  getNextStatus,
  getStatusForElapsed,
} from '../src/reducers/ordersReducer';
import { calculateTotals } from '../src/utils/orderTotals';

const NOW = new Date(2026, 8, 30, 13, 0).getTime();
const items = [
  { id: 'm6', name: 'Burger', price: 1450, quantity: 2, note: '' },
  { id: 'm18', name: 'Shake', price: 590, quantity: 1, note: 'no ice' },
];
const user = { id: 'u1', fullName: 'Ali Raza' };

const makeOrder = (overrides = {}) =>
  createOrder({
    items,
    totals: calculateTotals(items, 0),
    type: ORDER_TYPES.DINE_IN,
    tableId: 't3',
    tableNumber: 3,
    user,
    now: NOW,
    ...overrides,
  });

const withOrder = (order = makeOrder()) =>
  ordersReducer(initialOrdersState, { type: ORDER_ACTIONS.PLACE_ORDER, payload: order });

const update = (state, status, id = state.orders[0].id) =>
  ordersReducer(state, { type: ORDER_ACTIONS.UPDATE_STATUS, payload: { id, status, at: NOW } });

describe('createOrder', () => {
  test('new order is Pending with id, total, type and timestamp', () => {
    const order = makeOrder();
    expect(order.status).toBe('Pending');
    expect(order.id).toMatch(/^GF-\d{5}$/);
    expect(order.total).toBe(calculateTotals(items, 0).grandTotal);
    expect(order.type).toBe('Dine-in');
    expect(order.tableNumber).toBe(3);
    expect(order.pickupTime).toBeNull();
    expect(order.timestamp).toBe(NOW);
  });

  test('takeaway order keeps the pickup time and no table', () => {
    const order = makeOrder({ type: ORDER_TYPES.TAKEAWAY, pickupTime: '13:30' });
    expect(order.pickupTime).toBe('13:30');
    expect(order.tableId).toBeNull();
  });
});

describe('ordersReducer', () => {
  test('PLACE_ORDER adds the newest order first', () => {
    const first = withOrder();
    const second = ordersReducer(first, {
      type: ORDER_ACTIONS.PLACE_ORDER,
      payload: makeOrder({ now: NOW + 1000 }),
    });
    expect(second.orders).toHaveLength(2);
    expect(second.orders[0].timestamp).toBe(NOW + 1000);
  });

  test('status moves forward Pending → Preparing → Ready → Served', () => {
    let state = withOrder();
    state = update(state, 'Preparing');
    state = update(state, 'Ready');
    state = update(state, 'Served');
    expect(state.orders[0].status).toBe('Served');
    expect(state.orders[0].history.map((h) => h.status)).toEqual([
      'Pending',
      'Preparing',
      'Ready',
      'Served',
    ]);
  });

  test('status never moves backwards (same state object returned)', () => {
    const ready = update(update(withOrder(), 'Preparing'), 'Ready');
    expect(update(ready, 'Preparing')).toBe(ready);
    expect(update(ready, 'Ready')).toBe(ready);
  });

  test('only Pending or Preparing orders can be cancelled', () => {
    const pending = withOrder();
    const cancel = (s) =>
      ordersReducer(s, { type: ORDER_ACTIONS.CANCEL_ORDER, payload: { id: s.orders[0].id } });
    expect(cancel(pending).orders[0].status).toBe('Cancelled');
    const served = update(update(update(pending, 'Preparing'), 'Ready'), 'Served');
    expect(cancel(served)).toBe(served);
  });

  test('a cancelled order cannot be updated', () => {
    const cancelled = ordersReducer(withOrder(), {
      type: ORDER_ACTIONS.CANCEL_ORDER,
      payload: { id: makeOrder().id },
    });
    expect(update(cancelled, 'Preparing')).toBe(cancelled);
  });

  test('HYDRATE replaces orders with the saved list', () => {
    const saved = [makeOrder()];
    const state = ordersReducer(initialOrdersState, {
      type: ORDER_ACTIONS.HYDRATE,
      payload: saved,
    });
    expect(state.orders).toEqual(saved);
  });

  test('reducer is pure: previous state is not mutated', () => {
    const state = Object.freeze(withOrder());
    expect(() => update(state, 'Preparing')).not.toThrow();
    expect(state.orders[0].status).toBe('Pending');
  });
});

describe('simulated kitchen timings', () => {
  test('10s Preparing, 20s Ready, 30s Served', () => {
    expect(getStatusForElapsed(0)).toBe('Pending');
    expect(getStatusForElapsed(9)).toBe('Pending');
    expect(getStatusForElapsed(10)).toBe('Preparing');
    expect(getStatusForElapsed(20)).toBe('Ready');
    expect(getStatusForElapsed(45)).toBe('Served');
  });

  test('getNextStatus gives the next step or null at the end', () => {
    expect(getNextStatus('Pending')).toBe('Preparing');
    expect(getNextStatus('Ready')).toBe('Served');
    expect(getNextStatus('Served')).toBeNull();
  });
});
