import { Router } from 'express';
import Saving, { SavingContribution } from '../models/Saving.js';
import { auth } from '../middleware/auth.js';

const router = Router();
router.use(auth);

// Recalcule le solde d'une pochette a partir de la somme de ses versements.
// On reconstruit toujours `currentAmount` depuis la verite (les versements)
// plutot que de l'incrementer a la main : auto-correctif, pas de derive
// possible apres une modification ou une suppression de versement.
async function syncCurrentAmount(savingId, userId) {
  const contribs = await SavingContribution.find({ savingId });
  const total = contribs.reduce((s, c) => s + Number(c.amount || 0), 0);
  await Saving.update({ _id: savingId, user: userId }, { currentAmount: total });
  return Saving.findOne({ _id: savingId, user: userId });
}

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
    const { contributions, currentAmount, ...data } = req.body;
    const item = await Saving.insert({ ...data, user: req.userId });
    res.status(201).json(item);
  } catch (e) {
    next(e);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { user, contributions, currentAmount, ...data } = req.body;
    const item = await Saving.update({ _id: req.params.id, user: req.userId }, data);
    if (!item) return res.status(404).json({ error: 'Epargne introuvable' });
    res.json(item);
  } catch (e) {
    next(e);
  }
});

// Ajouter (ou retirer avec un montant negatif) sur une pochette d'epargne.
// `date` optionnel : permet d'enregistrer un versement sur un mois donne.
router.post('/:id/contributions', async (req, res, next) => {
  try {
    const { amount, note, date } = req.body;
    if (!Number(amount)) return res.status(400).json({ error: 'Montant invalide' });

    const saving = await Saving.findOne({ _id: req.params.id, user: req.userId });
    if (!saving) return res.status(404).json({ error: 'Epargne introuvable' });

    await SavingContribution.insert({
      savingId: saving._id,
      amount: Number(amount),
      note: note || '',
      date: date ? new Date(date).toISOString() : new Date().toISOString(),
    });

    const updated = await syncCurrentAmount(saving._id, req.userId);
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

// Modifier un versement (montant / note / date), puis recalculer le solde.
router.put('/:id/contributions/:cid', async (req, res, next) => {
  try {
    const { amount, note, date } = req.body;
    const saving = await Saving.findOne({ _id: req.params.id, user: req.userId });
    if (!saving) return res.status(404).json({ error: 'Epargne introuvable' });

    const contrib = await SavingContribution.findOne({ _id: req.params.cid, savingId: saving._id });
    if (!contrib) return res.status(404).json({ error: 'Versement introuvable' });

    const patch = {};
    if (amount !== undefined) {
      if (!Number(amount)) return res.status(400).json({ error: 'Montant invalide' });
      patch.amount = Number(amount);
    }
    if (note !== undefined) patch.note = note || '';
    if (date !== undefined) patch.date = new Date(date).toISOString();

    await SavingContribution.update({ _id: contrib._id }, patch);
    const updated = await syncCurrentAmount(saving._id, req.userId);
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

// Supprimer un versement, puis recalculer le solde.
router.delete('/:id/contributions/:cid', async (req, res, next) => {
  try {
    const saving = await Saving.findOne({ _id: req.params.id, user: req.userId });
    if (!saving) return res.status(404).json({ error: 'Epargne introuvable' });

    await SavingContribution.remove({ _id: req.params.cid, savingId: saving._id });
    const updated = await syncCurrentAmount(saving._id, req.userId);
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
