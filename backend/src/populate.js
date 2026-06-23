import Category from './models/Category.js';

// Remplace l'id de categorie par le document complet (equivalent de
// .populate('category')). Asynchrone car la lecture se fait en base.
export async function withCategory(item) {
  if (!item) return item;
  const category = item.category ? await Category.findById(item.category) : null;
  return { ...item, category };
}

// Version liste : recupere toutes les categories utiles en UNE seule requete.
export async function withCategories(items) {
  const ids = [...new Set(items.map((i) => i.category).filter(Boolean))];
  const cats = ids.length ? await Category.find({ _id: { $in: ids } }) : [];
  const byId = new Map(cats.map((c) => [c._id, c]));
  return items.map((i) => ({
    ...i,
    category: i.category ? byId.get(i.category) || null : null,
  }));
}
