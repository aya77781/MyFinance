import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { REGIONS, DEFAULT_REGION, opportunitiesFor } from '../data/market.js';

const router = Router();
router.use(auth);

// Cles API news. On utilise SerpApi (google_news) en priorite si dispo,
// sinon GNews (https://gnews.io). Sans aucune cle, les news renvoient configured:false.
const SERPAPI_KEY = process.env.SERPAPI_KEY || '';
const GNEWS_TOKEN = process.env.GNEWS_API_TOKEN || '';

// Cache memoire par region pour economiser le quota (10 min).
const cache = new Map();
const TTL = 10 * 60 * 1000;

function resolveRegion(q) {
  const r = String(q || DEFAULT_REGION).toUpperCase();
  return REGIONS[r] ? r : DEFAULT_REGION;
}

// Normalise une date fournisseur en ISO (sinon renvoie la valeur d'origine).
function toISO(d) {
  if (!d) return null;
  const t = new Date(d);
  return isNaN(t.getTime()) ? d : t.toISOString();
}

// --- Fournisseur SerpApi (moteur google_news) ---
async function fetchSerpNews(conf) {
  const country = conf.countries ? conf.countries.split(',')[0] : '';
  const params = new URLSearchParams({
    engine: 'google_news',
    q: conf.language === 'en' ? 'business finance' : 'finance economie',
    hl: conf.language,
    api_key: SERPAPI_KEY,
  });
  if (country) params.set('gl', country);

  const r = await fetch(`https://serpapi.com/search.json?${params.toString()}`);
  if (!r.ok) {
    const body = await r.text();
    const err = new Error(`News indisponibles (${r.status})`);
    err.detail = body.slice(0, 200);
    err.status = 502;
    throw err;
  }
  const data = await r.json();
  // google_news renvoie news_results ; certains items sont des clusters (stories).
  const flat = [];
  for (const item of data.news_results || []) {
    if (Array.isArray(item.stories) && item.stories.length) flat.push(...item.stories);
    else flat.push(item);
  }
  return flat.slice(0, 10).map((a) => ({
    title: a.title || '',
    description: a.snippet || '',
    url: a.link || '',
    image: a.thumbnail || a.thumbnail_small || null,
    publishedAt: a.iso_date || toISO(a.date),
    source: a.source?.name || a.source?.authors?.[0] || '',
  }));
}

// --- Fournisseur GNews ---
async function fetchGNews(conf) {
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
    const err = new Error(`News indisponibles (${r.status})`);
    err.detail = body.slice(0, 200);
    err.status = 502;
    throw err;
  }
  const data = await r.json();
  return (data.articles || []).map((a) => ({
    title: a.title,
    description: a.description,
    url: a.url,
    image: a.image,
    publishedAt: a.publishedAt,
    source: a.source?.name || '',
  }));
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

    if (!SERPAPI_KEY && !GNEWS_TOKEN) {
      return res.json({
        configured: false,
        region,
        articles: [],
        message:
          "Cle API news non configuree. Ajoute SERPAPI_KEY (serpapi.com) ou GNEWS_API_TOKEN (gnews.io) dans le .env du backend.",
      });
    }

    const cached = cache.get(region);
    if (cached && Date.now() - cached.at < TTL) {
      return res.json({ configured: true, region, cached: true, articles: cached.articles });
    }

    const conf = REGIONS[region];
    // SerpApi prioritaire, repli sur GNews.
    const articles = SERPAPI_KEY ? await fetchSerpNews(conf) : await fetchGNews(conf);

    cache.set(region, { at: Date.now(), articles });
    res.json({ configured: true, region, source: SERPAPI_KEY ? 'serpapi' : 'gnews', articles });
  } catch (e) {
    if (e.status === 502) {
      return res.status(502).json({ error: e.message, detail: e.detail });
    }
    next(e);
  }
});

export default router;
