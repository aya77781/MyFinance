import { Router } from 'express';
import Saving from '../models/Saving.js';
import { auth } from '../middleware/auth.js';

const router = Router();
router.use(auth);

router.get('/', async (req, res, next) => {
  try {
    const items = await Saving.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(items);
  } catch (e) {
    next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const item = await Saving.create({ ...req.body, user: req.userId });
    res.status(201).json(item);
  } catch (e) {
    next(e);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { user, ...data } = req.body;
    const item = await Saving.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      data,
      { new: true }
    );
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
    const item = await Saving.findOne({ _id: req.params.id, user: req.userId });
    if (!item) return res.status(404).json({ error: 'Epargne introuvable' });
    item.contributions.push({ amount, note });
    item.currentAmount += Number(amount);
    await item.save();
    res.json(item);
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await Saving.findOneAndDelete({ _id: req.params.id, user: req.userId });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

export default router;
