import { Router } from 'express';
import Income from '../models/Income.js';
import { auth } from '../middleware/auth.js';

const router = Router();
router.use(auth);

router.get('/', async (req, res, next) => {
  try {
    const items = await Income.find({ user: req.userId });
    items.sort((a, b) => a.dayOfMonth - b.dayOfMonth);
    res.json(items);
  } catch (e) {
    next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    // `active` par defaut a true : sans ca, un revenu cree sans ce champ peut
    // etre exclu des totaux cote app (qui filtre sur i.active).
    const item = await Income.insert({ active: true, ...req.body, user: req.userId });
    res.status(201).json(item);
  } catch (e) {
    next(e);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { user, ...data } = req.body;
    const item = await Income.update({ _id: req.params.id, user: req.userId }, data);
    if (!item) return res.status(404).json({ error: 'Revenu introuvable' });
    res.json(item);
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await Income.remove({ _id: req.params.id, user: req.userId });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

export default router;
