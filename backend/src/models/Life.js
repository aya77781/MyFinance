import { Collection } from '../store.js';

// Activité "Life" : une chose à faire dans le mois, avec un budget et une
// couleur (segment de la roue). `drawn`/`drawnAt` mémorisent le tirage : une
// activité tirée sort de la roue et la date verrouille la roue jusqu'au
// lendemain (1 tirage par jour).
export default new Collection('life_activities');
