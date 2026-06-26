import crypto from 'crypto';
import { supabase } from './supa.js';

// Couche d'acces aux donnees adossee a Supabase / PostgreSQL.
// On conserve volontairement la MEME API que l'ancien stockage JSON
// (find / findOne / findById / insert / update / save / remove / clear) afin
// de limiter les changements dans les routes — a ceci pres que tout est
// desormais ASYNCHRONE (les methodes renvoient des Promises).
//
// L'API "metier" (cote routes / frontend) utilise des champs en camelCase et
// la convention Mongo (_id, user, category). La base, elle, utilise du
// snake_case et des cles etrangeres (id, user_id, category_id). On traduit
// dans les deux sens ici, de facon transparente.

// Identifiant hex (encore expose pour compat ; les ids sont en realite des
// uuid generes par PostgreSQL).
export function genId() {
  return crypto.randomBytes(12).toString('hex');
}

// --- Traduction des noms de champs API <-> base -----------------------------
const TO_DB = { _id: 'id', user: 'user_id', category: 'category_id' };
const FROM_DB = { id: '_id', user_id: 'user', category_id: 'category' };

// Champs numeriques : PostgREST renvoie les `numeric` sous forme de chaine pour
// preserver la precision. On les reconvertit en nombres cote API.
const NUMERIC_KEYS = new Set([
  'amount',
  'targetAmount',
  'currentAmount',
  'result',
  'planned',
  'estimatedAmount',
  'actualAmount',
]);

const camelToSnake = (s) => s.replace(/[A-Z]/g, (m) => '_' + m.toLowerCase());
const snakeToCamel = (s) => s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

const keyToDb = (k) => TO_DB[k] || camelToSnake(k);
const keyFromDb = (k) => FROM_DB[k] || snakeToCamel(k);

function toDb(obj = {}) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    out[keyToDb(k)] = v;
  }
  return out;
}

function fromDb(row) {
  if (!row) return row;
  const out = {};
  for (const [k, v] of Object.entries(row)) {
    const key = keyFromDb(k);
    out[key] = NUMERIC_KEYS.has(key) && v != null ? Number(v) : v;
  }
  return out;
}

export class Collection {
  // children : tableaux imbriques a reconstituer a la lecture (ex. les
  // contributions d'une epargne, stockees dans une table enfant).
  //   { apiKey: 'contributions', table: 'saving_contributions', fk: 'saving_id' }
  constructor(table, { children = [] } = {}) {
    this.table = table;
    this.children = children;
  }

  _selectStr() {
    if (!this.children.length) return '*';
    return ['*', ...this.children.map((c) => `${c.table}(*)`)].join(', ');
  }

  // Transforme une ligne brute (avec ses enfants joints) en document API.
  _hydrate(row) {
    if (!row) return row;
    const childArrays = {};
    for (const c of this.children) {
      const arr = Array.isArray(row[c.table]) ? row[c.table] : [];
      childArrays[c.apiKey] = arr
        .map(fromDb)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      delete row[c.table];
    }
    const doc = fromDb(row);
    for (const c of this.children) doc[c.apiKey] = childArrays[c.apiKey];
    return doc;
  }

  // Applique un filtre facon Mongo a une requete Supabase.
  // Supporte l'egalite simple, $in, et les operateurs de date $gte/$lte/$gt/$lt.
  _applyFilter(query, filter = {}) {
    for (const [key, cond] of Object.entries(filter)) {
      const col = keyToDb(key);
      if (cond && typeof cond === 'object' && !Array.isArray(cond)) {
        if ('$in' in cond) query = query.in(col, cond.$in);
        if ('$gte' in cond) query = query.gte(col, cond.$gte);
        if ('$lte' in cond) query = query.lte(col, cond.$lte);
        if ('$gt' in cond) query = query.gt(col, cond.$gt);
        if ('$lt' in cond) query = query.lt(col, cond.$lt);
      } else {
        query = query.eq(col, cond);
      }
    }
    return query;
  }

  async find(filter = {}) {
    let query = supabase.from(this.table).select(this._selectStr());
    query = this._applyFilter(query, filter);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data || []).map((r) => this._hydrate(r));
  }

  async findOne(filter = {}) {
    let query = supabase.from(this.table).select(this._selectStr());
    query = this._applyFilter(query, filter).limit(1);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data && data[0] ? this._hydrate(data[0]) : null;
  }

  async findById(id) {
    if (id == null) return null;
    return this.findOne({ _id: id });
  }

  async insert(data) {
    const { data: row, error } = await supabase
      .from(this.table)
      .insert(toDb(data))
      .select(this._selectStr())
      .single();
    if (error) throw new Error(error.message);
    return this._hydrate(row);
  }

  async insertMany(arr) {
    if (!arr.length) return [];
    const { data, error } = await supabase
      .from(this.table)
      .insert(arr.map(toDb))
      .select(this._selectStr());
    if (error) throw new Error(error.message);
    return (data || []).map((r) => this._hydrate(r));
  }

  // Met a jour la premiere ligne correspondante et la renvoie (ou null).
  async update(filter, data) {
    const patch = toDb(data);
    delete patch.id; // on ne modifie jamais la cle primaire
    delete patch.created_at;
    // On ignore les cles de tableaux enfants (pas des colonnes).
    for (const c of this.children) delete patch[c.apiKey];
    let query = supabase.from(this.table).update(patch);
    query = this._applyFilter(query, filter).select(this._selectStr());
    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    return rows && rows[0] ? this._hydrate(rows[0]) : null;
  }

  // Remplace un document complet (compat ancienne API). S'appuie sur l'_id.
  async save(doc) {
    return this.update({ _id: doc._id }, doc);
  }

  async remove(filter) {
    let query = supabase.from(this.table).delete();
    query = this._applyFilter(query, filter);
    const { error } = await query;
    if (error) throw new Error(error.message);
    return true;
  }

  // Vide la table entiere. Renvoie le nombre de lignes supprimees.
  async clear() {
    const { count } = await supabase
      .from(this.table)
      .select('*', { count: 'exact', head: true });
    const { error } = await supabase
      .from(this.table)
      .delete()
      .not('id', 'is', null);
    if (error) throw new Error(error.message);
    return count || 0;
  }
}
