import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { REGIONS, DEFAULT_REGION, opportunitiesFor } from '../data/market.js';

const router = Router();
router.use(auth);

// Cle API GNews (https://gnews.io). Sans cle, les news renvoient configured:false.
const GNEWS_TOKEN = process.env.GNEWS_API_TOKEN || '';

// Cache memoire par region pour economiser le quota (10 min).
const cache = new Map();
const TTL = 10 * 60 * 1000;

function resolveRegion(q) {
  const r = String(q || DEFAULT_REGION).toUpperCase();
  return REGIONS[r] ? r : DEFAULT_REGION;
}

router.get('/regions', (req, res) => {
  res.json(
    Object.entries(REGIONS).map(([key, v]) => ({ key, label: v.label }))
  );
});

router.get('/opportunities', (req, res) => {
  const region = resolveRegion(req.query.region);
  res.json({ region, items: opportunitiesFor(region) });
});

router.get('/news', async (req, res, next) => {
  try {
    const region = resolveRegion(req.query.region);

    if (!GNEWS_TOKEN) {
      return res.json({
        configured: false,
        region,
        articles: [],
        message:
          "Cle API news non configuree. Ajoute GNEWS_API_TOKEN dans le .env du backend (gratuit sur gnews.io).",
      });
    }

    const cached = cache.get(region);
    if (cached && Date.now() - cached.at < TTL) {
      return res.json({ configured: true, region, cached: true, articles: cached.articles });
    }

    const conf = REGIONS[region];
    const params = new URLSearchParams({
      topic: 'business',
      lang: conf.language,
      max: '10',
      apikey: GNEWS_TOKEN,
    });
    if (conf.countries) params.set('country', conf.countries.split(',')[0]);

    const r = await fetch(`https://gnews.io/api/v4/top-headlines?${params.toString()}`);
    if (!r.ok) {
      const body = await r.text();
      return res.status(502).json({ error: `News indisponibles (${r.status})`, detail: body.slice(0, 200) });
    }
    const data = await r.json();
    const articles = (data.articles || []).map((a) => ({
      title: a.title,
      description: a.description,
      url: a.url,
      image: a.image,
      publishedAt: a.publishedAt,
      source: a.source?.name || '',
    }));

    cache.set(region, { at: Date.now(), articles });
    res.json({ configured: true, region, articles });
  } catch (e) {
    next(e);
  }
});

export default router;
