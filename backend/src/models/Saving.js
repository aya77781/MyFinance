import { Collection } from '../store.js';

// Objectif d'epargne (pochette / vault facon Revolut).
// Les versements sont stockes dans la table enfant saving_contributions et
// reconstitues dans le champ `contributions` a la lecture.
export default new Collection('savings', {
  children: [{ apiKey: 'contributions', table: 'saving_contributions', fk: 'saving_id' }],
});

// Sous-collection des versements (utilisee par la route savings).
export const SavingContribution = new Collection('saving_contributions');
