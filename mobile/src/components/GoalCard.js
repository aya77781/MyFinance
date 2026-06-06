import { View, Text, Pressable, StyleSheet } from 'react-native';
import Card from './Card';
import ProgressBar from './ProgressBar';
import { colors, spacing, font, radius, ff } from '../theme';
import { euro } from '../format';

// Carte d'objectif (epargne ou challenge) avec progression.
export default function GoalCard({ title, subtitle, current, target, color, onAdd, onLongPress }) {
  const progress = target > 0 ? current / target : 0;
  const pct = Math.round(progress * 100);
  return (
    <Pressable onLongPress={onLongPress}>
      <Card style={{ marginBottom: spacing.lg }}>
        <View style={styles.top}>
          <View style={[styles.accent, { backgroundColor: color }]} />
          <View style={{ flex: 1 }}>
            <Text style={font.title} numberOfLines={1}>
              {title}
            </Text>
            {subtitle ? <Text style={font.caption}>{subtitle}</Text> : null}
          </View>
          <Pressable
            onPress={onAdd}
            style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.addText}>Ajouter</Text>
          </Pressable>
        </View>

        <View style={styles.amounts}>
          <Text style={styles.current}>{euro(current)}</Text>
          {target > 0 ? <Text style={styles.target}> / {euro(target)}</Text> : null}
        </View>

        {target > 0 ? (
          <>
            <ProgressBar progress={progress} color={color} />
            <Text style={styles.pct}>{pct}% atteint</Text>
          </>
        ) : null}
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  accent: { width: 6, height: 36, borderRadius: 3, marginRight: spacing.md },
  addBtn: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    height: 34,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  amounts: { flexDirection: 'row', alignItems: 'baseline', marginBottom: spacing.md },
  current: { fontSize: 26, fontFamily: ff.extrabold, color: colors.text, letterSpacing: -0.5 },
  target: { fontSize: 15, fontWeight: '600', color: colors.textMuted },
  pct: { ...font.caption, marginTop: spacing.sm, fontWeight: '700' },
});
