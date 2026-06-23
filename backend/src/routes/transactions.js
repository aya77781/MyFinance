import { Router } from 'express';
import Transaction from '../models/Transaction.js';
import { withCategory, withCategories } from '../populate.js';
import { auth } from '../middleware/auth.js';

const router = Router();
router.use(auth);

router.get('/', async (req, res, next) => {
  try {
    const filter = { user: req.userId };
    if (req.query.type) filter.type = req.query.type;
    let items = await Transaction.find(filter);

    if (req.query.from) {
      const from = new Date(req.query.from).getTime();
      items = items.filter((t) => new Date(t.date).getTime() >= from);
    }
    if (req.query.to) {
      const to = new Date(req.query.to).getTime();
      items = items.filter((t) => new Date(t.date).getTime() <= to);
    }

    items.sort((a, b) => new Date(b.date) - new Date(a.date));
    const limit = Math.min(Number(req.query.limit) || 100, 500);
    res.json(await withCategories(items.slice(0, limit)));
  } catch (e) {
    next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const data = { ...req.body, user: req.userId };
    if (!data.date) data.date = new Date().toISOString();
    const item = await Transaction.insert(data);
    res.status(201).json(await withCategory(item));
  } catch (e) {
    next(e);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { user, ...data } = req.body;
    const item = await Transaction.update({ _id: req.params.id, user: req.userId }, data);
    if (!item) return res.status(404).json({ error: 'Transaction introuvable' });
    res.json(await withCategory(item));
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await Transaction.remove({ _id: req.params.id, user: req.userId });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

export default router;
