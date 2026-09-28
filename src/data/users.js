// src/data/users.js
// Mock users – there is NO backend, so this array acts as our "database".
// Passwords follow the app rule: at least 8 characters and at least 1 digit.

export const users = [
  {
    id: 'u1',
    fullName: 'Ali Raza',
    email: 'customer@greenfork.pk',
    password: 'customer123',
    role: 'customer',
  },
  {
    id: 'u2',
    fullName: 'Sara Khan',
    email: 'manager@greenfork.pk',
    password: 'manager123',
    role: 'manager',
  },
];

// Find a user whose email + password match (email is not case-sensitive)
export function findUser(email, password) {
  return users.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
  );
}

// Check whether an email is already registered
export function emailExists(email) {
  return users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase());
}

// Add a new user (lives only while the app is open – no database yet)
export function addUser({ fullName, email, password, role }) {
  const newUser = {
    id: 'u' + Date.now(),
    fullName: fullName.trim(),
    email: email.trim().toLowerCase(),
    password,
    role,
  };
  users.push(newUser);
  return newUser;
}
