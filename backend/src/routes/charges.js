import { Router } from 'express';
import FixedCharge from '../models/FixedCharge.js';
import { auth } from '../middleware/auth.js';

const router = Router();
router.use(auth);

router.get('/', async (req, res, next) => {
  try {
    const items = await FixedCharge.find({ user: req.userId })
      .populate('category')
      .sort({ dayOfMonth: 1 });
    res.json(items);
  } catch (e) {
    next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const item = await FixedCharge.create({ ...req.body, user: req.userId });
    res.status(201).json(item);
  } catch (e) {
    next(e);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { user, ...data } = req.body;
    const item = await FixedCharge.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      data,
      { new: true }
    );
    if (!item) return res.status(404).json({ error: 'Charge introuvable' });
    res.json(item);
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await FixedCharge.findOneAndDelete({ _id: req.params.id, user: req.userId });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

export default router;
