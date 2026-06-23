import { Collection } from '../store.js';

// Opportunite suivie par l'utilisateur (placement, pari, idee d'investissement...).
// statut : 'open' (en cours) | 'won' (gagne) | 'lost' (perdu).
// amount  : montant engage. result : gain (+) ou perte (-) une fois cloture.
export default new Collection('opportunities', {
  defaults: {
    description: '',
    amount: 0,
    result: 0,
    status: 'open',
    closedAt: null,
  },
});
