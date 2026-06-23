import { Router } from 'express';
import bcrypt from 'bcryptjs';
import User, { publicUser } from '../models/User.js';
import Category from '../models/Category.js';
import { signToken, auth } from '../middleware/auth.js';
import { DEFAULT_CATEGORIES } from '../defaults.js';

const router = Router();

// Inscription : cree le compte + les categories par defaut (libelles seulement).
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ error: 'Mot de passe : 6 caracteres minimum' });
    }
    const normalizedEmail = String(email).toLowerCase().trim();
    const existing = User.findOne({ email: normalizedEmail });
    if (existing) return res.status(409).json({ error: 'Un compte existe deja avec cet email' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = User.insert({ name: name || '', email: normalizedEmail, passwordHash });

    Category.insertMany(DEFAULT_CATEGORIES.map((c) => ({ ...c, user: user._id })));

    const token = signToken(user._id);
    res.status(201).json({ token, user: publicUser(user) });
  } catch (e) {
    next(e);
  }
});

// Connexion.
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = User.findOne({ email: String(email || '').toLowerCase().trim() });
    if (!user) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    const ok = await bcrypt.compare(password || '', user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    const token = signToken(user._id);
    res.json({ token, user: publicUser(user) });
  } catch (e) {
    next(e);
  }
});

// Profil de l'utilisateur connecte.
router.get('/me', auth, async (req, res, next) => {
  try {
    const user = User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
    res.json({ user: publicUser(user) });
  } catch (e) {
    next(e);
  }
});

export default router;
