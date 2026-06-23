import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Client Supabase cote serveur. On utilise la cle SERVICE_ROLE : elle contourne
// la RLS (Row Level Security), ce qui est attendu ici car l'autorisation est
// geree par le backend (JWT maison + filtre user_id sur chaque requete).
// NE JAMAIS exposer cette cle au frontend.
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.warn(
    '[supabase] SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant — ' +
      'renseigne-les dans backend/.env.'
  );
}

export const supabase = createClient(url || '', key || '', {
  auth: { persistSession: false, autoRefreshToken: false },
});
