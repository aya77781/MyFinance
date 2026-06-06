import { View, Text, StyleSheet } from 'react-native';
import { radius, spacing } from '../theme';
import { initials } from '../format';

// Pastille coloree avec les initiales d'une categorie (remplace une icone / emoji).
export default function Pill({ label, color = '#6E56F7', size = 44 }) {
  return (
    <View
      style={[
        styles.pill,
        { width: size, height: size, borderRadius: radius.md, backgroundColor: `${color}22` },
      ]}
    >
      <Text style={[styles.text, { color, fontSize: size * 0.36 }]}>{initials(label)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  text: { fontWeight: '700' },
});
