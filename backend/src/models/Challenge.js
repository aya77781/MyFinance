import { Collection } from '../store.js';

// Challenge financier : un objectif pour mettre plus d'argent de cote.
export default new Collection('challenges', {
  defaults: {
    description: '',
    currentAmount: 0,
    deadline: null,
    status: 'active',
    color: '#F7A23B',
    entries: [],
  },
});
