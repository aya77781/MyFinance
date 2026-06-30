import { Router } from 'express';
import Life from '../models/Life.js';
import { auth } from '../middleware/auth.js';

const router = Router();
router.use(auth);

// Liste des activités de l'utilisateur (les plus récentes d'abord).
router.get('/', async (req, res, next) => {
  try {
    const items = await Life.find({ user: req.userId });
    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(items);
  } catch (e) {
    next(e);
  }
});

// Ajouter une activité (nom + budget + couleur du segment).
router.post('/', async (req, res, next) => {
  try {
    const { name, budget, color } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: "Donne un nom a l'activite." });
    }
    const item = await Life.insert({
      user: req.userId,
      name: String(name).trim(),
      budget: Number(budget) || 0,
      color: color || '#23D3A8',
      drawn: false,
      drawnAt: null,
    });
    res.status(201).json(item);
  } catch (e) {
    next(e);
  }
});

// Modifier une activité (nom / budget / couleur).
router.put('/:id', async (req, res, next) => {
  try {
    const { name, budget, color } = req.body;
    const patch = {};
    if (name !== undefined) {
      if (!String(name).trim()) return res.status(400).json({ error: "Donne un nom a l'activite." });
      patch.name = String(name).trim();
    }
    if (budget !== undefined) patch.budget = Number(budget) || 0;
    if (color !== undefined) patch.color = color;
    const item = await Life.update({ _id: req.params.id, user: req.userId }, patch);
    if (!item) return res.status(404).json({ error: 'Activite introuvable' });
    res.json(item);
  } catch (e) {
    next(e);
  }
});

// Tirer une activité : on la marque comme sortie de la roue et on horodate le
// tirage (verrouille la roue jusqu'au lendemain côté écran). Le tirage aléatoire
// est fait côté client pour piloter l'animation ; on persiste ici le résultat.
router.post('/:id/draw', async (req, res, next) => {
  try {
    const activity = await Life.findOne({ _id: req.params.id, user: req.userId });
    if (!activity) return res.status(404).json({ error: 'Activite introuvable' });
    if (activity.drawn) return res.status(409).json({ error: 'Activite deja tiree' });

    const item = await Life.update(
      { _id: req.params.id, user: req.userId },
      { drawn: true, drawnAt: new Date().toISOString() }
    );
    res.json(item);
  } catch (e) {
    next(e);
  }
});

// Recommencer le mois : remet toutes les activités sur la roue (annule les
// tirages) sans supprimer les activités ni leurs budgets.
router.post('/reset', async (req, res, next) => {
  try {
    await Life.update({ user: req.userId, drawn: true }, { drawn: false, drawnAt: null });
    const items = await Life.find({ user: req.userId });
    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(items);
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await Life.remove({ _id: req.params.id, user: req.userId });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

export default router;
