import Category from './models/Category.js';

// Remplace l'id de categorie par le document complet (equivalent de .populate('category')).
export function withCategory(item) {
  if (!item) return item;
  return { ...item, category: item.category ? Category.findById(item.category) : null };
}

export function withCategories(items) {
  return items.map(withCategory);
}
