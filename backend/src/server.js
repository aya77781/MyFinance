import 'dotenv/config';
import app from './app.js';

const PORT = process.env.PORT || 4000;

// Serveur local. Donnees stockees dans des fichiers JSON (dossier backend/data/),
// aucune base requise. Sur Vercel, c'est api/index.js qui reutilise la meme app.
app.listen(PORT, () => console.log(`API demarree sur http://localhost:${PORT}`));
