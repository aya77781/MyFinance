import { Collection } from '../store.js';

// Charge fixe / recurrente (loyer, abonnements, credit, assurances...).
export default new Collection('fixedcharges', {
  defaults: { category: null, dayOfMonth: 1, active: true, note: '' },
});
