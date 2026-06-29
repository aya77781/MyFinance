import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import authRoutes from './routes/auth.js';
import categories from './routes/categories.js';
import income from './routes/income.js';
import charges from './routes/charges.js';
import transactions from './routes/transactions.js';
import savings from './routes/savings.js';
import challenges from './routes/challenges.js';
import opportunities from './routes/opportunities.js';
import dashboard from './routes/dashboard.js';
import market from './routes/market.js';

// Construit l'app Express. Reutilisable en serveur local (server.js) ET en
// fonction serverless (api/index.js sur Vercel).
const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => res.json({ name: 'Finance API', status: 'ok' }));
app.get('/api', (req, res) => res.json({ name: 'Finance API', status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/categories', categories);
app.use('/api/income', income);
app.use('/api/charges', charges);
app.use('/api/transactions', transactions);
app.use('/api/savings', savings);
app.use('/api/challenges', challenges);
app.use('/api/opportunities', opportunities);
app.use('/api/dashboard', dashboard);
app.use('/api/market', market);

// Route inconnue -> 404 JSON (au lieu du HTML par defaut d'Express).
app.use((req, res) => {
  res.status(404).json({ error: `Route introuvable : ${req.method} ${req.originalUrl}` });
});

// Gestion centralisee des erreurs.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Erreur serveur' });
});

export default app;
