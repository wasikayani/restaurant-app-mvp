// __tests__/orderTotals.test.js
// Question 8 – checks the Order Summary maths (named rates, promo, rounding-free values).

import { calculateTotals, SERVICE_CHARGE_RATE, SALES_TAX_RATE } from '../src/utils/orderTotals';

const items = [
  { id: 'm9', price: 3250, quantity: 1 },
  { id: 'm11', price: 1490, quantity: 1 },
];

describe('calculateTotals', () => {
  test('rates are 5% service charge and 15% sales tax', () => {
    expect(SERVICE_CHARGE_RATE).toBe(0.05);
    expect(SALES_TAX_RATE).toBe(0.15);
  });

  test('without a promo code', () => {
    const t = calculateTotals(items, 0);
    expect(t.subtotal).toBe(4740);
    expect(t.discount).toBe(0);
    expect(t.serviceCharge).toBeCloseTo(237);
    expect(t.salesTax).toBeCloseTo(711);
    expect(t.grandTotal).toBeCloseTo(5688);
    expect(t.itemCount).toBe(2);
  });

  test('with WELCOME10 (10%) – charges apply after the discount', () => {
    const t = calculateTotals(items, 10);
    expect(t.discount).toBeCloseTo(474);
    expect(t.serviceCharge).toBeCloseTo(213.3);
    expect(t.salesTax).toBeCloseTo(639.9);
    expect(t.grandTotal).toBeCloseTo(5119.2);
  });

  test('empty cart totals are all zero', () => {
    expect(calculateTotals([], 20).grandTotal).toBe(0);
  });
});
