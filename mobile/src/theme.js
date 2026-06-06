// Design system inspire de Revolut : fond clair, cartes blanches arrondies,
// une carte "solde" sombre en hero, accents vibrants. Aucun emoji.

export const colors = {
  bg: '#F4F5F8',
  surface: '#FFFFFF',
  hero: '#15151B',
  heroSoft: '#23232D',
  text: '#15151B',
  textMuted: '#8A8FA3',
  textOnHero: '#FFFFFF',
  textOnHeroMuted: '#A7AAB8',
  border: '#ECEDF2',
  primary: '#6E56F7',
  primarySoft: '#EDE9FF',
  positive: '#2BBA88',
  positiveSoft: '#E2F6EE',
  negative: '#F4506B',
  negativeSoft: '#FDE7EB',
  warning: '#F7A23B',
};

// Palette de couleurs reutilisable pour les categories / segments.
export const palette = [
  '#6E56F7',
  '#F7A23B',
  '#2BBA88',
  '#3B82F6',
  '#EC4899',
  '#14B8A6',
  '#8B5CF6',
  '#F43F5E',
  '#0EA5E9',
  '#A3E635',
];

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  full: 999,
};

export const font = {
  h1: { fontSize: 32, fontWeight: '700', color: colors.text },
  h2: { fontSize: 22, fontWeight: '700', color: colors.text },
  title: { fontSize: 17, fontWeight: '600', color: colors.text },
  body: { fontSize: 15, fontWeight: '500', color: colors.text },
  label: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  caption: { fontSize: 12, fontWeight: '500', color: colors.textMuted },
};

export const shadow = {
  shadowColor: '#1B1B2F',
  shadowOpacity: 0.06,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 8 },
  elevation: 2,
};
