import { View, StyleSheet } from 'react-native';
import Glyph, { glyphForCategory } from './Glyph';
import { radius, spacing } from '../theme';

// Avatar de categorie : tuile arrondie douce, fond teinte, icone de la couleur.
export default function CategoryIcon({ name, color = '#1F3BE0', glyph, size = 46, style }) {
  const g = glyph || glyphForCategory(name);
  return (
    <View
      style={[
        styles.tile,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: `${color}2E` },
        style,
      ]}
    >
      <Glyph name={g} color={color} size={size * 0.48} />
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
});
