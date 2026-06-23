import User from './models/User.js';
import Category from './models/Category.js';
import Income from './models/Income.js';
import FixedCharge from './models/FixedCharge.js';
import Transaction from './models/Transaction.js';
import Saving from './models/Saving.js';
import Challenge from './models/Challenge.js';
import Opportunity from './models/Opportunity.js';

// Vide TOUTES les donnees (comptes inclus). A utiliser pour repartir de zero.
const collections = [User, Category, Income, FixedCharge, Transaction, Saving, Challenge, Opportunity];
const total = collections.reduce((s, c) => s + c.clear(), 0);
console.log(`Donnees videes (${total} elements supprimes). Tu peux creer ton compte.`);
