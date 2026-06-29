import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Client Supabase cote serveur. On utilise la cle SERVICE_ROLE : elle contourne
// la RLS (Row Level Security), ce qui est attendu ici car l'autorisation est
// geree par le backend (JWT maison + filtre user_id sur chaque requete).
// NE JAMAIS exposer cette cle au frontend.
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Sans ces deux variables, createClient leverait "supabaseUrl is required." —
// une erreur cryptique. On echoue tot avec un message clair et actionnable
// (visible tel quel dans les logs Render/Vercel).
if (!url || !key) {
  const missing = [!url && 'SUPABASE_URL', !key && 'SUPABASE_SERVICE_ROLE_KEY']
    .filter(Boolean)
    .join(' et ');
  throw new Error(
    `[supabase] Variable(s) d'environnement manquante(s) : ${missing}. ` +
      'Renseigne-les dans le dashboard de ton hebergeur (Render/Vercel) ou dans backend/.env en local.'
  );
}

export const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});
