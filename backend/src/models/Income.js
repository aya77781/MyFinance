import { Collection } from '../store.js';

// Revenu stable / recurrent (salaire, loyer percu, etc.).
export default new Collection('incomes', {
  defaults: { dayOfMonth: 1, active: true, note: '' },
});
