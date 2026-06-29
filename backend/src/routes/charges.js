import { Router } from 'express';
import FixedCharge from '../models/FixedCharge.js';
import { withCategory, withCategories } from '../populate.js';
import { auth } from '../middleware/auth.js';

const router = Router();
router.use(auth);

router.get('/', async (req, res, next) => {
  try {
    const items = await FixedCharge.find({ user: req.userId });
    items.sort((a, b) => a.dayOfMonth - b.dayOfMonth);
    res.json(await withCategories(items));
  } catch (e) {
    next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    // `active` par defaut a true : sans ca, une charge creee sans ce champ peut
    // etre exclue des totaux cote app (qui filtre sur c.active).
    const item = await FixedCharge.insert({ active: true, ...req.body, user: req.userId });
    res.status(201).json(await withCategory(item));
  } catch (e) {
    next(e);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { user, ...data } = req.body;
    const item = await FixedCharge.update({ _id: req.params.id, user: req.userId }, data);
    if (!item) return res.status(404).json({ error: 'Charge introuvable' });
    res.json(await withCategory(item));
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await FixedCharge.remove({ _id: req.params.id, user: req.userId });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

export default router;
