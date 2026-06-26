import { Collection } from '../store.js';

// Challenge financier : un objectif a atteindre sur une periode donnee.
// Deux tables enfants reconstituees a la lecture :
//  - entries  : anciens "progres" (argent mis de cote) — conserve pour compat.
//  - missions : les "pistes" (montant estime a gagner + montant reel valide).
export default new Collection('challenges', {
  children: [
    { apiKey: 'entries', table: 'challenge_entries', fk: 'challenge_id' },
    { apiKey: 'missions', table: 'challenge_missions', fk: 'challenge_id' },
  ],
});

// Sous-collections (utilisees par la route challenges).
export const ChallengeEntry = new Collection('challenge_entries');
export const ChallengeMission = new Collection('challenge_missions');
