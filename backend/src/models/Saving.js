import { Collection } from '../store.js';

// Objectif d'epargne (pochette / vault facon Revolut).
export default new Collection('savings', {
  defaults: { targetAmount: 0, currentAmount: 0, color: '#2BBA88', contributions: [] },
});
