import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

// Stockage simple base sur des fichiers JSON (aucune base de donnees requise).
// Chaque "collection" = un fichier <nom>.json dans le dossier data/.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// Identifiant unique facon ObjectId (24 caracteres hex).
export function genId() {
  return crypto.randomBytes(12).toString('hex');
}

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

// Compare une valeur de document a une condition de filtre.
// Supporte l'egalite simple et les operateurs de dates $gte / $lte / $gt / $lt.
function matchValue(docVal, cond) {
  if (
    cond &&
    typeof cond === 'object' &&
    !Array.isArray(cond) &&
    ('$gte' in cond || '$lte' in cond || '$gt' in cond || '$lt' in cond)
  ) {
    const t = docVal == null ? NaN : new Date(docVal).getTime();
    if ('$gte' in cond && !(t >= new Date(cond.$gte).getTime())) return false;
    if ('$lte' in cond && !(t <= new Date(cond.$lte).getTime())) return false;
    if ('$gt' in cond && !(t > new Date(cond.$gt).getTime())) return false;
    if ('$lt' in cond && !(t < new Date(cond.$lt).getTime())) return false;
    return true;
  }
  if (typeof cond === 'boolean') return docVal === cond;
  return String(docVal) === String(cond);
}

export class Collection {
  constructor(name, { defaults = {} } = {}) {
    this.name = name;
    this.defaults = defaults;
    this.file = path.join(DATA_DIR, `${name}.json`);
    this.docs = this._load();
  }

  _load() {
    try {
      const raw = fs.readFileSync(this.file, 'utf8');
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  // Ecriture atomique : on ecrit dans un .tmp puis on remplace.
  _persist() {
    const tmp = `${this.file}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(this.docs, null, 2));
    fs.renameSync(tmp, this.file);
  }

  _match(doc, filter) {
    return Object.entries(filter).every(([key, cond]) => matchValue(doc[key], cond));
  }

  find(filter = {}) {
    return this.docs.filter((d) => this._match(d, filter)).map(clone);
  }

  findOne(filter = {}) {
    const d = this.docs.find((x) => this._match(x, filter));
    return d ? clone(d) : null;
  }

  findById(id) {
    if (id == null) return null;
    return this.findOne({ _id: id });
  }

  insert(data) {
    const now = new Date().toISOString();
    const doc = {
      ...clone(this.defaults),
      ...data,
      _id: genId(),
      createdAt: now,
      updatedAt: now,
    };
    this.docs.push(doc);
    this._persist();
    return clone(doc);
  }

  insertMany(arr) {
    return arr.map((d) => this.insert(d));
  }

  // Met a jour le premier document correspondant et le renvoie (ou null).
  update(filter, data) {
    const d = this.docs.find((x) => this._match(x, filter));
    if (!d) return null;
    const { _id, createdAt, ...rest } = data;
    Object.assign(d, rest, { updatedAt: new Date().toISOString() });
    this._persist();
    return clone(d);
  }

  // Remplace un document complet (utile apres mutation cote route).
  save(doc) {
    const i = this.docs.findIndex((x) => x._id === doc._id);
    if (i === -1) return null;
    this.docs[i] = { ...doc, updatedAt: new Date().toISOString() };
    this._persist();
    return clone(this.docs[i]);
  }

  remove(filter) {
    const i = this.docs.findIndex((x) => this._match(x, filter));
    if (i === -1) return false;
    this.docs.splice(i, 1);
    this._persist();
    return true;
  }

  clear() {
    const n = this.docs.length;
    this.docs = [];
    this._persist();
    return n;
  }
}
