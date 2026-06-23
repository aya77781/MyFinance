import { Collection } from '../store.js';

// Utilisateur. On ne renvoie jamais passwordHash au client (voir publicUser).
export default new Collection('users');

export function publicUser(u) {
  if (!u) return null;
  return { id: u._id, name: u.name, email: u.email, createdAt: u.createdAt };
}
