import { Router } from 'express';
import Saving, { SavingContribution } from '../models/Saving.js';
import { auth } from '../middleware/auth.js';

const router = Router();
router.use(auth);

router.get('/', async (req, res, next) => {
  try {
    const items = await Saving.find({ user: req.userId });
    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(items);
  } catch (e) {
    next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const item = await Saving.insert({ ...req.body, user: req.userId });
    res.status(201).json(item);
  } catch (e) {
    next(e);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { user, ...data } = req.body;
    const item = await Saving.update({ _id: req.params.id, user: req.userId }, data);
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
    const saving = await Saving.findOne({ _id: req.params.id, user: req.userId });
    if (!saving) return res.status(404).json({ error: 'Epargne introuvable' });

    await SavingContribution.insert({
      savingId: saving._id,
      amount: Number(amount),
      note: note || '',
      date: new Date().toISOString(),
    });
    await Saving.update(
      { _id: saving._id, user: req.userId },
      { currentAmount: Number(saving.currentAmount) + Number(amount) }
    );

    const updated = await Saving.findOne({ _id: saving._id, user: req.userId });
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await Saving.remove({ _id: req.params.id, user: req.userId });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

export default router;
