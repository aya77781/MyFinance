import { Pressable, View, Text, StyleSheet } from 'react-native';
import Glyph from './Glyph';
import { colors, ff } from '../theme';

// Bouton d'action rond + label dessous (facon Revolut).
// onBrand = pose sur le degrade (tuile translucide, texte blanc).
export default function ActionTile({ glyph, label, onPress, onBrand = false }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.wrap, pressed && { opacity: 0.6 }]}
    >
      <View style={[styles.circle, onBrand ? styles.onBrand : styles.light]}>
        <Glyph name={glyph} color={onBrand ? '#fff' : colors.primary} size={24} />
      </View>
      <Text style={[styles.label, { color: onBrand ? '#fff' : colors.text }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', flex: 1 },
  circle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  onBrand: { backgroundColor: 'rgba(255,255,255,0.2)' },
  light: { backgroundColor: colors.primarySoft },
  label: { fontSize: 12.5, fontFamily: ff.semibold },
});
