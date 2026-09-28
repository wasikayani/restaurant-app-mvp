// src/data/menu.js
// Mock menu data – our "database" for dishes (no backend in this project).
// Every item has the fields required by the assignment:
//   id, name, description, price, category, image, isSpecial, isAvailable
// plus two extra display fields: rating and prepTime (minutes).

const img = (id) => `https://images.unsplash.com/photo-${id}?w=600&q=80&auto=format&fit=crop`;

export const categories = [
  { id: 'All', label: 'All', icon: 'grid-outline' },
  { id: 'Starters', label: 'Starters', icon: 'leaf-outline' },
  { id: 'Mains', label: 'Mains', icon: 'fast-food-outline' },
  { id: 'Desserts', label: 'Desserts', icon: 'ice-cream-outline' },
  { id: 'Drinks', label: 'Drinks', icon: 'cafe-outline' },
];

export const menuItems = [
  // ---------- Starters ----------
  {
    id: 'm1',
    name: 'Crispy Chicken Wings',
    description: 'Six smoky glazed wings with fresh peppers and a spicy dipping sauce.',
    price: 890,
    category: 'Starters',
    image: img('1600555379765-f82335a7b1b0'),
    isSpecial: true,
    isAvailable: true,
    rating: 4.8,
    prepTime: 15,
  },
  {
    id: 'm2',
    name: 'Loaded Nachos',
    description: 'Crispy tortilla chips with cheese sauce, jalapeños and three dips.',
    price: 790,
    category: 'Starters',
    image: img('1789990646710-66ff6de8c1d4'),
    isSpecial: false,
    isAvailable: true,
    rating: 4.5,
    prepTime: 10,
  },
  {
    id: 'm3',
    name: 'Tomato Bruschetta',
    description: 'Toasted sourdough topped with fresh tomatoes, basil and olive oil.',
    price: 650,
    category: 'Starters',
    image: img('1572695157366-5e585ab2b69f'),
    isSpecial: false,
    isAvailable: true,
    rating: 4.4,
    prepTime: 8,
  },
  {
    id: 'm4',
    name: 'Roasted Tomato Soup',
    description: 'Slow-roasted tomato soup with a swirl of cream, fresh herbs and garlic bread.',
    price: 590,
    category: 'Starters',
    image: img('1547592166-23ac45744acd'),
    isSpecial: false,
    isAvailable: true,
    rating: 4.3,
    prepTime: 10,
  },
  {
    id: 'm5',
    name: 'Classic Fries',
    description: 'Golden, crispy fries with a pinch of sea salt and ketchup.',
    price: 390,
    category: 'Starters',
    image: img('1518013431117-eb1465fa5752'),
    isSpecial: false,
    isAvailable: false,
    rating: 4.2,
    prepTime: 7,
  },

  // ---------- Mains ----------
  {
    id: 'm6',
    name: 'Double Smash Burger',
    description: 'Two smashed beef patties, cheddar, caramelised onions and house sauce.',
    price: 1450,
    category: 'Mains',
    image: img('1599155253646-7989e08c05c1'),
    isSpecial: true,
    isAvailable: true,
    rating: 4.9,
    prepTime: 18,
  },
  {
    id: 'm7',
    name: 'Chicken Supreme Pizza',
    description: 'Stone-baked 10" pizza with spiced chicken, peppers, onions and mozzarella.',
    price: 1590,
    category: 'Mains',
    image: img('1637438333503-5e218b937aef'),
    isSpecial: false,
    isAvailable: true,
    rating: 4.7,
    prepTime: 20,
  },
  {
    id: 'm8',
    name: 'Spicy Chicken Penne',
    description: 'Penne in a fiery tomato arrabbiata sauce with grilled chicken and parmesan.',
    price: 1350,
    category: 'Mains',
    image: img('1676300184847-4ee4030409c0'),
    isSpecial: false,
    isAvailable: true,
    rating: 4.6,
    prepTime: 17,
  },
  {
    id: 'm9',
    name: 'Grilled Ribeye Steak',
    description: '250g ribeye with sautéed mushrooms, fresh vegetables and crispy fries.',
    price: 3250,
    category: 'Mains',
    image: img('1762631884998-05cb22996fb2'),
    isSpecial: false,
    isAvailable: true,
    rating: 4.8,
    prepTime: 25,
  },
  {
    id: 'm10',
    name: 'Crispy Fried Chicken',
    description: 'Three pieces of crunchy buttermilk fried chicken with a spicy dip.',
    price: 1190,
    category: 'Mains',
    image: img('1647102398925-e23f6486ca04'),
    isSpecial: false,
    isAvailable: true,
    rating: 4.6,
    prepTime: 16,
  },
  {
    id: 'm11',
    name: 'Grilled Chicken Platter',
    description: 'Herb-marinated chicken breast, sliced and served with fresh dill and lemon.',
    price: 1490,
    category: 'Mains',
    image: img('1643594462181-7667928d072e'),
    isSpecial: true,
    isAvailable: true,
    rating: 4.7,
    prepTime: 22,
  },
  {
    id: 'm12',
    name: 'Classic Club Sandwich',
    description: 'Toasted triple-decker with chicken, cheese, tomato and crisp lettuce.',
    price: 990,
    category: 'Mains',
    image: img('1553909489-cd47e0907980'),
    isSpecial: false,
    isAvailable: false,
    rating: 4.4,
    prepTime: 12,
  },

  // ---------- Desserts ----------
  {
    id: 'm13',
    name: 'Chocolate Fudge Cake',
    description: 'Warm, rich chocolate cake layered with fudge and a scoop of vanilla.',
    price: 690,
    category: 'Desserts',
    image: img('1578985545062-69928b1d9587'),
    isSpecial: true,
    isAvailable: true,
    rating: 4.9,
    prepTime: 5,
  },
  {
    id: 'm14',
    name: 'New York Cheesecake',
    description: 'Creamy baked cheesecake on a buttery biscuit base with berry compote.',
    price: 750,
    category: 'Desserts',
    image: img('1533134242443-d4fd215305ad'),
    isSpecial: false,
    isAvailable: true,
    rating: 4.7,
    prepTime: 5,
  },
  {
    id: 'm15',
    name: 'Double Chocolate Brownie',
    description: 'Rich, fudgy brownies baked with dark and milk chocolate.',
    price: 550,
    category: 'Desserts',
    image: img('1588539543889-20cc7ce4df55'),
    isSpecial: false,
    isAvailable: true,
    rating: 4.5,
    prepTime: 5,
  },
  {
    id: 'm16',
    name: 'Ice Cream Sundae',
    description: 'Chocolate, vanilla and pistachio scoops with a crisp wafer cone.',
    price: 590,
    category: 'Desserts',
    image: img('1579954115563-e72bf1381629'),
    isSpecial: false,
    isAvailable: false,
    rating: 4.3,
    prepTime: 4,
  },

  // ---------- Drinks ----------
  {
    id: 'm17',
    name: 'Classic Cappuccino',
    description: 'Rich double espresso topped with velvety milk foam.',
    price: 520,
    category: 'Drinks',
    image: img('1587302186428-d3753405ffed'),
    isSpecial: false,
    isAvailable: true,
    rating: 4.6,
    prepTime: 5,
  },
  {
    id: 'm18',
    name: 'Chocolate Cookie Shake',
    description: 'Thick chocolate shake topped with whipped cream and a crunchy cookie.',
    price: 590,
    category: 'Drinks',
    image: img('1726039468346-2f3e0f1f5b52'),
    isSpecial: true,
    isAvailable: true,
    rating: 4.8,
    prepTime: 6,
  },
  {
    id: 'm19',
    name: 'Fresh Mint Lemonade',
    description: 'Freshly squeezed lemons blended with mint and crushed ice.',
    price: 350,
    category: 'Drinks',
    image: img('1633807187088-90f58cb2048b'),
    isSpecial: false,
    isAvailable: true,
    rating: 4.5,
    prepTime: 4,
  },
];

// ---------------------------------------------------------------------------
// Fake network request.
// Returns { promise, cancel }:
//   promise -> resolves with the menu after 1.5 seconds (or rejects sometimes)
//   cancel  -> clears the timer, so nothing happens after the screen unmounts
// ---------------------------------------------------------------------------
export const FETCH_DELAY = 1500; // 1.5 seconds, as required
export const FAILURE_RATE = 0.15; // 15% chance of a simulated network error (set to 1 to demo the error screen)

// Q10: `source` is the shared, editable menu from MenuContext (manager edits).
// It defaults to the original mock list, so older code still works.
export function fetchMenu(source = menuItems) {
  let timerId;
  const promise = new Promise((resolve, reject) => {
    timerId = setTimeout(() => {
      if (Math.random() < FAILURE_RATE) {
        reject(new Error('Could not reach the kitchen. Please check your connection.'));
      } else {
        // return a copy so the original mock array is never changed by screens
        resolve(source.map((item) => ({ ...item })));
      }
    }, FETCH_DELAY);
  });
  return { promise, cancel: () => clearTimeout(timerId) };
}
