// Fonction serverless Vercel : reutilise l'app Express du backend.
// Toutes les requetes /api/* sont redirigees ici (voir vercel.json).
// NB : sur Vercel, le stockage fichiers JSON va dans /tmp et est EPHEMERE
// (donnees perdues aux redemarrages). Adapte a une demo, pas a un usage durable.
import app from '../backend/src/app.js';

export default app;
