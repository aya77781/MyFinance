import { Collection } from '../store.js';

// Mouvement reel d'argent : une depense, ou un revenu ponctuel (extra, freelance...).
// 'source' explique COMMENT l'argent est arrive (utile pour les revenus / challenges).
export default new Collection('transactions', {
  defaults: { category: null, note: '', source: '' },
});
