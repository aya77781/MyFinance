import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './db.js';
import User from './models/User.js';
import Category from './models/Category.js';
import Income from './models/Income.js';
import FixedCharge from './models/FixedCharge.js';
import Transaction from './models/Transaction.js';
import Saving from './models/Saving.js';
import Challenge from './models/Challenge.js';

// Vide TOUTES les donnees (comptes inclus). A utiliser pour repartir de zero.
const URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/finance_app';

async function run() {
  await connectDB(URI);
  const res = await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Income.deleteMany({}),
    FixedCharge.deleteMany({}),
    Transaction.deleteMany({}),
    Saving.deleteMany({}),
    Challenge.deleteMany({}),
  ]);
  const total = res.reduce((s, r) => s + (r.deletedCount || 0), 0);
  console.log(`Base videe (${total} documents supprimes). Tu peux creer ton compte.`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
