import { Router } from 'express';
import Opportunity from '../models/Opportunity.js';
import { auth } from '../middleware/auth.js';

const router = Router();
router.use(auth);

const STATUSES = ['open', 'won', 'lost', 'paid'];

// Normalise le corps recu en un document propre.
function clean(body = {}) {
  const data = {};
  if (body.title != null) data.title = String(body.title).trim();
  if (body.description != null) data.description = String(body.description);
  if (body.amount != null) data.amount = Number(body.amount) || 0;
  if (body.status != null && STATUSES.includes(body.status)) data.status = body.status;
  if (body.result != null) data.result = Number(body.result) || 0;
  // Dates (ISO ou null) : date de l'opportunite, date du gain/cloture, date du paiement.
  if (body.date !== undefined) data.date = body.date || null;
  if (body.closedAt !== undefined) data.closedAt = body.closedAt || null;
  if (body.paidAt !== undefined) data.paidAt = body.paidAt || null;
  return data;
}

router.get('/', async (req, res, next) => {
  try {
    const items = await Opportunity.find({ user: req.userId });
    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(items);
  } catch (e) {
    next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const data = clean(req.body);
    if (!data.title) return res.status(400).json({ error: 'Titre requis' });
    const status = data.status || 'open';
    const item = await Opportunity.insert({
      ...data,
      user: req.userId,
      status,
      date: data.date || new Date().toISOString(),
      // La date de cloture fournie par le client prevaut ; sinon on date si cloture.
      closedAt:
        data.closedAt !== undefined
          ? data.closedAt
          : status === 'open'
            ? null
            : new Date().toISOString(),
    });
    res.status(201).json(item);
  } catch (e) {
    next(e);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const item = await Opportunity.findOne({ _id: req.params.id, user: req.userId });
    if (!item) return res.status(404).json({ error: 'Opportunite introuvable' });

    const data = clean(req.body);
    const nextStatus = data.status || item.status;
    // Met a jour la date de cloture au changement de statut SEULEMENT si le client
    // n'a pas fourni de date explicite.
    if (data.status && data.status !== item.status && data.closedAt === undefined) {
      data.closedAt = data.status === 'open' ? null : new Date().toISOString();
    }
    // Si on repasse "en cours", on remet le resultat a zero et on efface les dates de cloture.
    if (nextStatus === 'open') {
      data.result = 0;
      data.closedAt = null;
      data.paidAt = null;
    }

    const saved = await Opportunity.update({ _id: req.params.id, user: req.userId }, data);
    res.json(saved);
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await Opportunity.remove({ _id: req.params.id, user: req.userId });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

export default router;
