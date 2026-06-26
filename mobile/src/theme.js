// MyFinance — theme sombre : fond navy profond, accent teal/vert, police Manrope.
// Minimaliste. Aucun emoji.

export const ff = {
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semibold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
  extrabold: 'Manrope_800ExtraBold',
};

export const colors = {
  bg: '#0A1628', // navy profond facon dashboard fintech
  bgSoft: '#13294D',
  surface: '#101F38',

  text: '#FFFFFF',
  textMuted: '#8294B0',
  textOnBrand: '#FFFFFF',
  textOnBrandMuted: '#94A3B8',
  textOnTeal: '#08221C', // texte sombre sur les surfaces teal

  border: '#1C3257',
  primary: '#23D3A8',
  primarySoft: 'rgba(35,211,168,0.14)',
  positive: '#22C55E',
  negative: '#FF5D73',
  warning: '#F7B84B',
  track: '#13294D', // fond des jauges / anneaux
};

// Carte hero / en-tete : navy elegant (haut -> bas).
export const brandGradient = ['#16294B', '#0A1628'];

// Degrade teal de la marque (logo, boutons principaux).
export const tealGradient = ['#43E3C4', '#15A98B'];

// Palette des categories (accent teal en tete).
export const palette = [
  '#23D3A8',
  '#F7B84B',
  '#4ADE80',
  '#38BDF8',
  '#F472B6',
  '#A78BFA',
  '#2DD4BF',
  '#FB7185',
  '#60A5FA',
  '#FACC15',
];

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 44 };

export const radius = { sm: 12, md: 16, lg: 22, xl: 28, full: 999 };

export const font = {
  hero: { fontSize: 46, fontFamily: ff.extrabold, color: '#FFFFFF', letterSpacing: -1.5 },
  h1: { fontSize: 28, fontFamily: ff.extrabold, color: '#FFFFFF', letterSpacing: -0.6 },
  h2: { fontSize: 20, fontFamily: ff.bold, color: '#FFFFFF', letterSpacing: -0.3 },
  title: { fontSize: 16, fontFamily: ff.semibold, color: '#FFFFFF' },
  body: { fontSize: 15, fontFamily: ff.medium, color: '#FFFFFF' },
  label: { fontSize: 13, fontFamily: ff.semibold, color: '#8593A6' },
  caption: { fontSize: 12.5, fontFamily: ff.medium, color: '#8593A6' },
};

// Ombres discretes sur fond sombre (on s'appuie surtout sur les bordures).
export const shadow = {
  shadowColor: '#000000',
  shadowOpacity: 0.25,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 12 },
  elevation: 3,
};
