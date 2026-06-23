// Categories par defaut creees a l'inscription : juste des libelles + couleurs,
// AUCUN montant. L'utilisateur les modifie / complete ensuite.
export const DEFAULT_CATEGORIES = [
  { name: 'Courses', color: '#6E56F7' },
  { name: 'Restaurant', color: '#F7A23B' },
  { name: 'Transport', color: '#2BBA88' },
  { name: 'Logement', color: '#3B82F6' },
  { name: 'Loisirs', color: '#EC4899' },
  { name: 'Sante', color: '#14B8A6' },
  { name: 'Abonnements', color: '#8B5CF6' },
  { name: 'Shopping', color: '#F43F5E' },
  { name: 'Cadeau', color: '#E879F9' },
];

// Categories de REVENU par defaut (type 'income'). Servent a classer les
// revenus stables et ponctuels (salaire, freelance, etc.).
export const DEFAULT_INCOME_CATEGORIES = [
  { name: 'Salaire', color: '#23D3A8', type: 'income' },
  { name: 'Freelance', color: '#38BDF8', type: 'income' },
  { name: 'Babysitting', color: '#F472B6', type: 'income' },
  { name: 'Tutoring', color: '#A78BFA', type: 'income' },
  { name: 'Menage', color: '#FACC15', type: 'income' },
  { name: 'Competition', color: '#FB7185', type: 'income' },
];
