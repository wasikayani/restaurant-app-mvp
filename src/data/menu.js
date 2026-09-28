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
    description: 'Six wings tossed in smoky buffalo sauce, served with garlic mayo dip.',
    price: 890,
    category: 'Starters',
    image: img('1567620832903-9fc6debc209f'),
    isSpecial: true,
    isAvailable: true,
    rating: 4.8,
    prepTime: 15,
  },
  {
    id: 'm2',
    name: 'Loaded Nachos',
    description: 'Tortilla chips with melted cheddar, jalapeños, salsa and sour cream.',
    price: 790,
    category: 'Starters',
    image: img('1513456852971-30c0b8199d4d'),
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
    name: 'Classic Salted Fries',
    description: 'Golden, crispy fries with sea salt and a side of ketchup.',
    price: 390,
    category: 'Starters',
    image: img('1573080496219-bb080dd4f877'),
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
    image: img('1568901346375-23c9450c58cd'),
    isSpecial: true,
    isAvailable: true,
    rating: 4.9,
    prepTime: 18,
  },
  {
    id: 'm7',
    name: 'Garden Veggie Pizza',
    description: 'Stone-baked 10" pizza loaded with peppers, onions, mushrooms and mozzarella.',
    price: 1590,
    category: 'Mains',
    image: img('1565299624946-b28f40a0ae38'),
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
    image: img('1621996346565-e3dbc646d9a9'),
    isSpecial: false,
    isAvailable: true,
    rating: 4.6,
    prepTime: 17,
  },
  {
    id: 'm9',
    name: 'Grilled Ribeye Steak',
    description: '250g ribeye grilled to your liking, served with crispy fries and pepper sauce.',
    price: 3250,
    category: 'Mains',
    image: img('1600891964092-4316c288032e'),
    isSpecial: false,
    isAvailable: true,
    rating: 4.8,
    prepTime: 25,
  },
  {
    id: 'm10',
    name: 'Crispy Fried Chicken',
    description: 'Three pieces of buttermilk fried chicken with coleslaw and fries.',
    price: 1190,
    category: 'Mains',
    image: img('1626645738196-c2a7c87a8f58'),
    isSpecial: false,
    isAvailable: true,
    rating: 4.6,
    prepTime: 16,
  },
  {
    id: 'm11',
    name: 'Grilled Chicken Platter',
    description: 'Herb-marinated chicken breast with rice, grilled veggies and mushroom sauce.',
    price: 1490,
    category: 'Mains',
    image: img('1532550907401-a500c9a57435'),
    isSpecial: true,
    isAvailable: true,
    rating: 4.7,
    prepTime: 22,
  },
  {
    id: 'm12',
    name: 'Grilled Club Sandwich',
    description: 'Triple-decker with chicken, egg, cheese and lettuce, served with fries.',
    price: 990,
    category: 'Mains',
    image: img('1528735602780-2552fd46c7af'),
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
    name: 'Walnut Brownie',
    description: 'Fudgy brownie with toasted walnuts and hot chocolate sauce.',
    price: 550,
    category: 'Desserts',
    image: img('1606313564200-e75d5e30476c'),
    isSpecial: false,
    isAvailable: true,
    rating: 4.5,
    prepTime: 5,
  },
  {
    id: 'm16',
    name: 'Ice Cream Sundae',
    description: 'Three scoops with chocolate sauce, whipped cream and sprinkles.',
    price: 590,
    category: 'Desserts',
    image: img('1563805042-7684c019e1cb'),
    isSpecial: false,
    isAvailable: false,
    rating: 4.3,
    prepTime: 4,
  },

  // ---------- Drinks ----------
  {
    id: 'm17',
    name: 'Classic Café Latte',
    description: 'Double shot espresso with silky steamed milk and latte art.',
    price: 520,
    category: 'Drinks',
    image: img('1541167760496-1628856ab772'),
    isSpecial: false,
    isAvailable: true,
    rating: 4.6,
    prepTime: 5,
  },
  {
    id: 'm18',
    name: 'Oreo Milkshake',
    description: 'Thick vanilla shake blended with Oreo cookies and topped with cream.',
    price: 590,
    category: 'Drinks',
    image: img('1572490122747-3968b75cc699'),
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
    image: img('1513558161293-cdaf765ed2fd'),
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

export function fetchMenu() {
  let timerId;
  const promise = new Promise((resolve, reject) => {
    timerId = setTimeout(() => {
      if (Math.random() < FAILURE_RATE) {
        reject(new Error('Could not reach the kitchen. Please check your connection.'));
      } else {
        // return a copy so the original mock array is never changed by screens
        resolve(menuItems.map((item) => ({ ...item })));
      }
    }, FETCH_DELAY);
  });
  return { promise, cancel: () => clearTimeout(timerId) };
}
