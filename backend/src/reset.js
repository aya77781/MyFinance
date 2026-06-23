import User from './models/User.js';
import Category from './models/Category.js';
import Income from './models/Income.js';
import FixedCharge from './models/FixedCharge.js';
import Transaction from './models/Transaction.js';
import Saving from './models/Saving.js';
import Challenge from './models/Challenge.js';
import Opportunity from './models/Opportunity.js';

// Vide TOUTES les donnees (comptes inclus). A utiliser pour repartir de zero.
// L'ordre supprime d'abord les tables enfants/dependantes. Les contributions et
// entries partent en cascade (ON DELETE CASCADE) avec savings / challenges.
const collections = [Transaction, Income, FixedCharge, Category, Saving, Challenge, Opportunity, User];

const counts = await Promise.all(collections.map((c) => c.clear()));
const total = counts.reduce((s, n) => s + n, 0);
console.log(`Donnees videes (${total} elements supprimes). Tu peux creer ton compte.`);
