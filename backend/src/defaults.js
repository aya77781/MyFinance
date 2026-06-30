// Categories par defaut creees a l'inscription : juste des libelles + couleurs,
// AUCUN montant. L'utilisateur les modifie / complete ensuite.
// `type: 'expense'` est OBLIGATOIRE : la colonne categories.type est NOT NULL
// (sinon l'insertion echoue et toute l'inscription part en 500).
export const DEFAULT_CATEGORIES = [
  { name: 'Courses', color: '#6E56F7', type: 'expense' },
  { name: 'Restaurant', color: '#F7A23B', type: 'expense' },
  { name: 'Transport', color: '#2BBA88', type: 'expense' },
  { name: 'Logement', color: '#3B82F6', type: 'expense' },
  { name: 'Loisirs', color: '#EC4899', type: 'expense' },
  { name: 'Sante', color: '#14B8A6', type: 'expense' },
  { name: 'Abonnements', color: '#8B5CF6', type: 'expense' },
  { name: 'Shopping', color: '#F43F5E', type: 'expense' },
  { name: 'Cadeau', color: '#E879F9', type: 'expense' },
  { name: 'Ecole', color: '#0EA5E9', type: 'expense' },
  { name: 'Dettes', color: '#EF4444', type: 'expense' },
];

// Categories de REVENU par defaut (type 'income'). Servent a classer les
// revenus stables et ponctuels (salaire, freelance, etc.).
export const DEFAULT_INCOME_CATEGORIES = [
  { name: 'Salaire', color: '#23D3A8', type: 'income' },
  { name: 'Freelance', color: '#38BDF8', type: 'income' },
  { name: 'Babysitting', color: '#F472B6', type: 'income' },
  { name: 'Tutoring', color: '#A78BFA', type: 'income' },
  { name: 'Mini job', color: '#FACC15', type: 'income' },
  { name: 'Competition', color: '#FB7185', type: 'income' },
];
