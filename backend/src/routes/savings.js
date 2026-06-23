import { Router } from 'express';
import Saving from '../models/Saving.js';
import { genId } from '../store.js';
import { auth } from '../middleware/auth.js';

const router = Router();
router.use(auth);

router.get('/', async (req, res, next) => {
  try {
    const items = Saving.find({ user: req.userId }).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    res.json(items);
  } catch (e) {
    next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const item = Saving.insert({ ...req.body, user: req.userId });
    res.status(201).json(item);
  } catch (e) {
    next(e);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { user, ...data } = req.body;
    const item = Saving.update({ _id: req.params.id, user: req.userId }, data);
    if (!item) return res.status(404).json({ error: 'Epargne introuvable' });
    res.json(item);
  } catch (e) {
    next(e);
  }
});

// Ajouter (ou retirer avec un montant negatif) sur une pochette d'epargne.
router.post('/:id/contributions', async (req, res, next) => {
  try {
    const { amount, note } = req.body;
    const item = Saving.findOne({ _id: req.params.id, user: req.userId });
    if (!item) return res.status(404).json({ error: 'Epargne introuvable' });
    item.contributions.push({
      _id: genId(),
      amount: Number(amount),
      note: note || '',
      date: new Date().toISOString(),
    });
    item.currentAmount = Number(item.currentAmount) + Number(amount);
    const saved = Saving.save(item);
    res.json(saved);
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    Saving.remove({ _id: req.params.id, user: req.userId });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

export default router;
