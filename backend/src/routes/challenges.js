import { Router } from 'express';
import Challenge from '../models/Challenge.js';
import { genId } from '../store.js';
import { auth } from '../middleware/auth.js';

const router = Router();
router.use(auth);

router.get('/', async (req, res, next) => {
  try {
    const items = Challenge.find({ user: req.userId }).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    res.json(items);
  } catch (e) {
    next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const item = Challenge.insert({ ...req.body, user: req.userId });
    res.status(201).json(item);
  } catch (e) {
    next(e);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { user, ...data } = req.body;
    const item = Challenge.update({ _id: req.params.id, user: req.userId }, data);
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
    const item = Challenge.findOne({ _id: req.params.id, user: req.userId });
    if (!item) return res.status(404).json({ error: 'Challenge introuvable' });
    item.entries.push({
      _id: genId(),
      amount: Number(amount),
      note: note || '',
      date: new Date().toISOString(),
    });
    item.currentAmount = Number(item.currentAmount) + Number(amount);
    if (item.targetAmount > 0 && item.currentAmount >= item.targetAmount) {
      item.status = 'done';
    }
    const saved = Challenge.save(item);
    res.json(saved);
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    Challenge.remove({ _id: req.params.id, user: req.userId });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

export default router;
