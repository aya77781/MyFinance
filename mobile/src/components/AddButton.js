import { Pressable, View, StyleSheet } from 'react-native';
import { colors, radius } from '../theme';

// Bouton "+" dessine en SVG-free (deux barres) pour rester sans emoji ni icone externe.
export default function AddButton({ onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.btn, pressed && { opacity: 0.85 }]}
      hitSlop={8}
    >
      <View style={styles.hbar} />
      <View style={styles.vbar} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 46,
    height: 46,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hbar: { position: 'absolute', width: 18, height: 2.5, borderRadius: 2, backgroundColor: '#fff' },
  vbar: { position: 'absolute', width: 2.5, height: 18, borderRadius: 2, backgroundColor: '#fff' },
});
