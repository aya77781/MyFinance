import { Router } from 'express';
import Challenge, { ChallengeEntry, ChallengeMission } from '../models/Challenge.js';
import { auth } from '../middleware/auth.js';

const router = Router();
router.use(auth);

// Recalcule le montant courant d'un challenge a partir des missions validees
// (somme des montants reels) puis met a jour son statut. Renvoie le challenge
// rafraichi (avec ses missions).
async function recomputeAndReturn(challengeId, userId) {
  const challenge = await Challenge.findOne({ _id: challengeId, user: userId });
  if (!challenge) return null;
  const missions = challenge.missions || [];
  const currentAmount = missions
    .filter((m) => m.done)
    .reduce((s, m) => s + (Number(m.actualAmount) || 0), 0);
  const patch = { currentAmount };
  if (challenge.targetAmount > 0 && currentAmount >= challenge.targetAmount) {
    patch.status = 'done';
  } else if (challenge.status === 'done') {
    patch.status = 'active';
  }
  await Challenge.update({ _id: challengeId, user: userId }, patch);
  return Challenge.findOne({ _id: challengeId, user: userId });
}

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
    const { user, missions, entries, ...data } = req.body;
    const item = await Challenge.update({ _id: req.params.id, user: req.userId }, data);
    if (!item) return res.status(404).json({ error: 'Challenge introuvable' });
    res.json(item);
  } catch (e) {
    next(e);
  }
});

// --- Missions / pistes ------------------------------------------------------

// Ajouter une piste (montant estime a gagner).
router.post('/:id/missions', async (req, res, next) => {
  try {
    const challenge = await Challenge.findOne({ _id: req.params.id, user: req.userId });
    if (!challenge) return res.status(404).json({ error: 'Challenge introuvable' });

    await ChallengeMission.insert({
      challengeId: challenge._id,
      title: req.body.title || '',
      estimatedAmount: Number(req.body.estimatedAmount) || 0,
      actualAmount: req.body.actualAmount != null ? Number(req.body.actualAmount) : null,
      done: !!req.body.done,
      date: new Date().toISOString(),
    });

    res.json(await recomputeAndReturn(challenge._id, req.userId));
  } catch (e) {
    next(e);
  }
});

// Modifier / valider une piste (saisie du montant reel gagne -> done).
router.put('/:id/missions/:missionId', async (req, res, next) => {
  try {
    const challenge = await Challenge.findOne({ _id: req.params.id, user: req.userId });
    if (!challenge) return res.status(404).json({ error: 'Challenge introuvable' });

    const patch = {};
    if (req.body.title != null) patch.title = req.body.title;
    if (req.body.estimatedAmount != null) patch.estimatedAmount = Number(req.body.estimatedAmount) || 0;
    if (req.body.actualAmount !== undefined)
      patch.actualAmount = req.body.actualAmount === null ? null : Number(req.body.actualAmount) || 0;
    if (req.body.done != null) patch.done = !!req.body.done;

    const updated = await ChallengeMission.update(
      { _id: req.params.missionId, challengeId: challenge._id },
      patch
    );
    if (!updated) return res.status(404).json({ error: 'Mission introuvable' });

    res.json(await recomputeAndReturn(challenge._id, req.userId));
  } catch (e) {
    next(e);
  }
});

// Supprimer une piste.
router.delete('/:id/missions/:missionId', async (req, res, next) => {
  try {
    const challenge = await Challenge.findOne({ _id: req.params.id, user: req.userId });
    if (!challenge) return res.status(404).json({ error: 'Challenge introuvable' });
    await ChallengeMission.remove({ _id: req.params.missionId, challengeId: challenge._id });
    res.json(await recomputeAndReturn(challenge._id, req.userId));
  } catch (e) {
    next(e);
  }
});

// --- Progres "argent mis de cote" (ancien systeme, conserve) ----------------
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
