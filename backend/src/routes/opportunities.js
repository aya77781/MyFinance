import { Router } from 'express';
import Opportunity from '../models/Opportunity.js';
import { auth } from '../middleware/auth.js';

const router = Router();
router.use(auth);

const STATUSES = ['open', 'won', 'lost'];

// Normalise le corps recu en un document propre.
function clean(body = {}) {
  const data = {};
  if (body.title != null) data.title = String(body.title).trim();
  if (body.description != null) data.description = String(body.description);
  if (body.amount != null) data.amount = Number(body.amount) || 0;
  if (body.status != null && STATUSES.includes(body.status)) data.status = body.status;
  if (body.result != null) data.result = Number(body.result) || 0;
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
      // Si on cree directement avec un statut cloture, on date la cloture.
      closedAt: status === 'open' ? null : new Date().toISOString(),
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
    // Met a jour la date de cloture quand on passe en gagne/perdu (ou retour en cours).
    if (data.status && data.status !== item.status) {
      data.closedAt = data.status === 'open' ? null : new Date().toISOString();
    }
    // Si on repasse "en cours", on remet le resultat a zero.
    if (nextStatus === 'open') data.result = 0;

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
