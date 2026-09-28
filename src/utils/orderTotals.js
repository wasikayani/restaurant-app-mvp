// src/utils/orderTotals.js
// Question 8 – pure price calculations shared by Order Summary (Q8) and Orders (Q10).
// No React code here, so it is easy to unit-test with Jest.

// ---------- Named rates ----------
export const SERVICE_CHARGE_RATE = 0.05; // 5% service charge
export const SALES_TAX_RATE = 0.15; // 15% sales tax

// Pure function – easy to test and reuse (Q10 uses the same totals).
// Order of calculation:
//   1. subtotal        = sum of price × quantity
//   2. discount        = subtotal × promo %
//   3. service charge  = (subtotal − discount) × 5%
//   4. sales tax       = (subtotal − discount) × 15%
//   5. grand total     = subtotal − discount + service charge + sales tax
export function calculateTotals(items, discountPercent) {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discount = (subtotal * discountPercent) / 100;
  const afterDiscount = subtotal - discount;
  const serviceCharge = afterDiscount * SERVICE_CHARGE_RATE;
  const salesTax = afterDiscount * SALES_TAX_RATE;
  const grandTotal = afterDiscount + serviceCharge + salesTax;
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  return { subtotal, discount, serviceCharge, salesTax, grandTotal, itemCount };
}
