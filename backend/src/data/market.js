// Configuration des regions + opportunites curees par region.

// region -> pays (ISO2 pour l'API de news) + langue + libelle.
export const REGIONS = {
  FR: { label: 'France', countries: 'fr', language: 'fr' },
  MA: { label: 'Maroc', countries: 'ma', language: 'fr' },
  EU: { label: 'Europe', countries: 'fr,de,gb,es,it', language: 'fr' },
  US: { label: 'Etats-Unis', countries: 'us', language: 'en' },
  WORLD: { label: 'Monde', countries: '', language: 'fr' },
};

export const DEFAULT_REGION = 'FR';

// Opportunites pour faire fructifier / mettre de l'argent de cote, par region.
// risk : Faible | Moyen | Eleve
const COMMON = [
  {
    title: 'Fonds de securite (epargne de precaution)',
    type: 'Epargne',
    risk: 'Faible',
    horizon: 'Court terme',
    description: 'Constituer 3 a 6 mois de depenses sur un compte liquide avant tout investissement.',
  },
  {
    title: 'ETF World en DCA',
    type: 'Bourse',
    risk: 'Moyen',
    horizon: 'Long terme',
    description: 'Investir une somme fixe chaque mois sur un ETF actions monde pour lisser le risque.',
  },
];

export const OPPORTUNITIES = {
  FR: [
    {
      title: 'Livret A / LDDS',
      type: 'Epargne',
      risk: 'Faible',
      horizon: 'Court terme',
      description: 'Epargne reglementee, disponible et sans impot. Ideal pour le fonds de securite.',
    },
    {
      title: 'PEA (actions europeennes)',
      type: 'Bourse',
      risk: 'Moyen',
      horizon: 'Long terme',
      description: 'Enveloppe fiscale avantageuse apres 5 ans pour investir en actions / ETF europeens.',
    },
    {
      title: 'Assurance-vie (fonds euros + UC)',
      type: 'Epargne',
      risk: 'Moyen',
      horizon: 'Long terme',
      description: 'Support souple, fiscalite douce apres 8 ans, du fonds euros securise aux unites de compte.',
    },
  ],
  MA: [
    {
      title: 'Compte sur carnet bancaire',
      type: 'Epargne',
      risk: 'Faible',
      horizon: 'Court terme',
      description: 'Epargne remuneree et disponible aupres des banques marocaines.',
    },
    {
      title: 'OPCVM obligataires',
      type: 'Obligations',
      risk: 'Moyen',
      horizon: 'Moyen terme',
      description: 'Fonds investis en obligations d\'Etat / privees, accessibles via les banques locales.',
    },
    {
      title: 'Bourse de Casablanca (actions)',
      type: 'Bourse',
      risk: 'Eleve',
      horizon: 'Long terme',
      description: 'Investir sur les grandes capitalisations marocaines pour le long terme.',
    },
  ],
  EU: [
    {
      title: 'ETF MSCI Europe',
      type: 'Bourse',
      risk: 'Moyen',
      horizon: 'Long terme',
      description: 'S\'exposer aux grandes entreprises europeennes via un seul fonds diversifie.',
    },
    {
      title: 'Comptes a terme',
      type: 'Epargne',
      risk: 'Faible',
      horizon: 'Court terme',
      description: 'Bloquer une somme sur une duree fixe contre un taux garanti.',
    },
  ],
  US: [
    {
      title: 'ETF S&P 500',
      type: 'Bourse',
      risk: 'Moyen',
      horizon: 'Long terme',
      description: 'Suivre les 500 plus grandes entreprises americaines a faibles frais.',
    },
    {
      title: 'High-Yield Savings Account',
      type: 'Epargne',
      risk: 'Faible',
      horizon: 'Court terme',
      description: 'Comptes d\'epargne en ligne a rendement eleve pour la tresorerie.',
    },
  ],
  WORLD: [
    {
      title: 'ETF actions monde (MSCI ACWI)',
      type: 'Bourse',
      risk: 'Moyen',
      horizon: 'Long terme',
      description: 'Diversification maximale sur les marches developpes et emergents.',
    },
    {
      title: 'Or / metaux precieux',
      type: 'Diversification',
      risk: 'Moyen',
      horizon: 'Long terme',
      description: 'Valeur refuge pour diversifier une partie du patrimoine.',
    },
  ],
};

export function opportunitiesFor(region) {
  const list = OPPORTUNITIES[region] || OPPORTUNITIES[DEFAULT_REGION];
  return [...list, ...COMMON];
}
