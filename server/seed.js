// server/seed.js
// Q3: fills the database with the A1 mock data.  Run:  npm run seed
// Q5: User.create runs the password-hashing hook in models/User.js, so seed users are stored hashed.
// 1. connect  2. empty every collection  3. insert users, menu items, tables  4. disconnect

require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const User = require('./models/User');
const MenuItem = require('./models/MenuItem');
const Table = require('./models/Table');
const Reservation = require('./models/Reservation');
const Order = require('./models/Order');

const users = require('./data/users');
const menuItems = require('./data/menuItems');
const tables = require('./data/tables');

async function seed() {
  await connectDB();

  // Empty the collections first, so running the seed twice does not create duplicates
  await Promise.all([
    User.deleteMany({}),
    MenuItem.deleteMany({}),
    Table.deleteMany({}),
    Reservation.deleteMany({}),
    Order.deleteMany({}),
  ]);
  console.log('Collections emptied');

  const createdUsers = await User.create(users);
  const createdItems = await MenuItem.insertMany(menuItems);
  const createdTables = await Table.insertMany(tables);

  console.log(`Inserted ${createdUsers.length} users (passwords hashed)`);
  console.log(`Inserted ${createdItems.length} menu items`);
  console.log(`Inserted ${createdTables.length} tables`);
  console.log('Seeding finished');
}

seed()
  .catch((error) => {
    console.error('Seeding failed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
