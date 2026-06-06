import { Router } from 'express';
import Challenge from '../models/Challenge.js';
import { auth } from '../middleware/auth.js';

const router = Router();
router.use(auth);

router.get('/', async (req, res, next) => {
  try {
    const items = await Challenge.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(items);
  } catch (e) {
    next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const item = await Challenge.create({ ...req.body, user: req.userId });
    res.status(201).json(item);
  } catch (e) {
    next(e);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { user, ...data } = req.body;
    const item = await Challenge.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      data,
      { new: true }
    );
    if (!item) return res.status(404).json({ error: 'Challenge introuvable' });
    res.json(item);
  } catch (e) {
    next(e);
  }
});

// Enregistrer un progres sur un challenge (argent mis de cote).
router.post('/:id/entries', async (req, res, next) => {
  try {
    const { amount, note } = req.body;
    const item = await Challenge.findOne({ _id: req.params.id, user: req.userId });
    if (!item) return res.status(404).json({ error: 'Challenge introuvable' });
    item.entries.push({ amount, note });
    item.currentAmount += Number(amount);
    if (item.targetAmount > 0 && item.currentAmount >= item.targetAmount) {
      item.status = 'done';
    }
    await item.save();
    res.json(item);
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await Challenge.findOneAndDelete({ _id: req.params.id, user: req.userId });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

export default router;
