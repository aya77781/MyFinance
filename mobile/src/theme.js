// Design minimaliste inspire de Revolut : fond degrade violet/indigo plein ecran
// en tete, contenu sur feuille claire, beaucoup d'espace. Police Manrope (proche
// d'Aeonik). Aucun emoji.

// Familles de police (chargees dans App.js via @expo-google-fonts/manrope).
export const ff = {
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semibold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
  extrabold: 'Manrope_800ExtraBold',
};

export const colors = {
  bg: '#FFFFFF',
  bgSoft: '#F6F6F8',
  surface: '#FFFFFF',

  text: '#0E0E12',
  textMuted: '#9A9AA8',
  textOnBrand: '#FFFFFF',
  textOnBrandMuted: '#D9D2FF',

  border: '#F0F0F3',
  primary: '#6B4EFF',
  primarySoft: '#EEEAFF',
  positive: '#1EBE7B',
  negative: '#FF4D63',
  warning: '#F7A23B',
};

// Degrade de la zone d'en-tete (violet -> indigo), facon Revolut Personnel.
export const brandGradient = ['#8B7BFF', '#6B4EFF', '#5333E6'];

// Palette des categories.
export const palette = [
  '#6B4EFF',
  '#F7A23B',
  '#1EBE7B',
  '#3B82F6',
  '#EC4899',
  '#14B8A6',
  '#8B5CF6',
  '#FF4D63',
  '#0EA5E9',
  '#A3E635',
];

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 44 };

export const radius = { sm: 12, md: 16, lg: 22, xl: 28, full: 999 };

export const font = {
  hero: { fontSize: 46, fontFamily: ff.extrabold, color: '#FFFFFF', letterSpacing: -1.5 },
  h1: { fontSize: 28, fontFamily: ff.extrabold, color: colors.text, letterSpacing: -0.6 },
  h2: { fontSize: 20, fontFamily: ff.bold, color: colors.text, letterSpacing: -0.3 },
  title: { fontSize: 16, fontFamily: ff.semibold, color: colors.text },
  body: { fontSize: 15, fontFamily: ff.medium, color: colors.text },
  label: { fontSize: 13, fontFamily: ff.semibold, color: colors.textMuted },
  caption: { fontSize: 12.5, fontFamily: ff.medium, color: colors.textMuted },
};

export const shadow = {
  shadowColor: '#1A1330',
  shadowOpacity: 0.06,
  shadowRadius: 20,
  shadowOffset: { width: 0, height: 12 },
  elevation: 2,
};
