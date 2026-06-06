import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme';

// Barres groupees (revenus vs depenses) sur 6 mois. data = [{label, income, expense}].
export default function BarChart({ data = [], height = 140 }) {
  const max =
    Math.max(1, ...data.flatMap((d) => [d.income || 0, d.expense || 0])) || 1;

  return (
    <View>
      <View style={[styles.row, { height }]}>
        {data.map((d, i) => (
          <View key={i} style={styles.col}>
            <View style={styles.bars}>
              <View
                style={[
                  styles.bar,
                  {
                    height: Math.max(3, ((d.income || 0) / max) * (height - 24)),
                    backgroundColor: colors.positive,
                  },
                ]}
              />
              <View
                style={[
                  styles.bar,
                  {
                    height: Math.max(3, ((d.expense || 0) / max) * (height - 24)),
                    backgroundColor: colors.primary,
                  },
                ]}
              />
            </View>
            <Text style={styles.label}>{d.label}</Text>
          </View>
        ))}
      </View>
      <View style={styles.legend}>
        <Legend color={colors.positive} text="Revenus" />
        <Legend color={colors.primary} text="Depenses" />
      </View>
    </View>
  );
}

function Legend({ color, text }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  col: { flex: 1, alignItems: 'center' },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, flex: 1 },
  bar: { width: 9, borderRadius: radius.sm },
  label: { marginTop: spacing.sm, fontSize: 11, color: colors.textMuted, fontWeight: '600' },
  legend: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.md, justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
});
