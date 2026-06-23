import { Collection } from '../store.js';

// Challenge financier : un objectif pour mettre plus d'argent de cote.
// Les progres sont stockes dans la table enfant challenge_entries et
// reconstitues dans le champ `entries` a la lecture.
export default new Collection('challenges', {
  children: [{ apiKey: 'entries', table: 'challenge_entries', fk: 'challenge_id' }],
});

// Sous-collection des progres (utilisee par la route challenges).
export const ChallengeEntry = new Collection('challenge_entries');
