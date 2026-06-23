import { Collection } from '../store.js';

// Categorie de depense ou de revenu. La couleur sert a la visualisation (donut, barres).
export default new Collection('categories', {
  defaults: { type: 'expense', color: '#6E56F7' },
});
