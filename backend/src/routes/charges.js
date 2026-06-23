import { Router } from 'express';
import FixedCharge from '../models/FixedCharge.js';
import { withCategory, withCategories } from '../populate.js';
import { auth } from '../middleware/auth.js';

const router = Router();
router.use(auth);

router.get('/', async (req, res, next) => {
  try {
    const items = FixedCharge.find({ user: req.userId }).sort((a, b) => a.dayOfMonth - b.dayOfMonth);
    res.json(withCategories(items));
  } catch (e) {
    next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const item = FixedCharge.insert({ ...req.body, user: req.userId });
    res.status(201).json(withCategory(item));
  } catch (e) {
    next(e);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { user, ...data } = req.body;
    const item = FixedCharge.update({ _id: req.params.id, user: req.userId }, data);
    if (!item) return res.status(404).json({ error: 'Charge introuvable' });
    res.json(withCategory(item));
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    FixedCharge.remove({ _id: req.params.id, user: req.userId });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

export default router;
