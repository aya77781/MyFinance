import { Router } from 'express';
import Challenge, { ChallengeEntry } from '../models/Challenge.js';
import { auth } from '../middleware/auth.js';

const router = Router();
router.use(auth);

router.get('/', async (req, res, next) => {
  try {
    const items = await Challenge.find({ user: req.userId });
    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(items);
  } catch (e) {
    next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const item = await Challenge.insert({ ...req.body, user: req.userId });
    res.status(201).json(item);
  } catch (e) {
    next(e);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { user, ...data } = req.body;
    const item = await Challenge.update({ _id: req.params.id, user: req.userId }, data);
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
    const challenge = await Challenge.findOne({ _id: req.params.id, user: req.userId });
    if (!challenge) return res.status(404).json({ error: 'Challenge introuvable' });

    await ChallengeEntry.insert({
      challengeId: challenge._id,
      amount: Number(amount),
      note: note || '',
      date: new Date().toISOString(),
    });

    const currentAmount = Number(challenge.currentAmount) + Number(amount);
    const patch = { currentAmount };
    if (challenge.targetAmount > 0 && currentAmount >= challenge.targetAmount) {
      patch.status = 'done';
    }
    await Challenge.update({ _id: challenge._id, user: req.userId }, patch);

    const updated = await Challenge.findOne({ _id: challenge._id, user: req.userId });
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await Challenge.remove({ _id: req.params.id, user: req.userId });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

export default router;
