// src/data/categories.js
// Assignment 2 – Q6: the dishes now come from the server (GET /api/menu), so the
// old mock menu file was removed. Only these fixed UI settings stay in the app.

const img = (id) => `https://images.unsplash.com/photo-${id}?w=600&q=80&auto=format&fit=crop`;

// Category chips on the Menu screen (same names as the enum in server/models/MenuItem.js)
export const categories = [
  { id: 'All', label: 'All', icon: 'grid-outline' },
  { id: 'Starters', label: 'Starters', icon: 'leaf-outline' },
  { id: 'Mains', label: 'Mains', icon: 'fast-food-outline' },
  { id: 'Desserts', label: 'Desserts', icon: 'ice-cream-outline' },
  { id: 'Drinks', label: 'Drinks', icon: 'cafe-outline' },
];

// Photo used when the manager adds a dish without an image link
export const DEFAULT_IMAGES = {
  Starters: img('1600555379765-f82335a7b1b0'),
  Mains: img('1599155253646-7989e08c05c1'),
  Desserts: img('1578985545062-69928b1d9587'),
  Drinks: img('1587302186428-d3753405ffed'),
};
