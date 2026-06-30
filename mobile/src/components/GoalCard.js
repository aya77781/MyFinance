import { View, Text, Pressable, StyleSheet } from 'react-native';
import Card from './Card';
import ProgressBar from './ProgressBar';
import Glyph from './Glyph';
import { colors, spacing, font, radius, ff } from '../theme';
import { euro } from '../format';
import { useT, registerTranslations } from '../i18n';

registerTranslations({
  fr: { 'goalCard.add': 'Ajouter', 'goalCard.reached': '{pct}% atteint', 'goalCard.edit': 'Modifier' },
  en: { 'goalCard.add': 'Add', 'goalCard.reached': '{pct}% reached', 'goalCard.edit': 'Edit' },
});

// Carte d'objectif (epargne ou challenge) avec progression.
// `onPress` + `expanded` + `children` : permet de deplier un contenu sous la
// carte (ex. l'historique des versements d'une pochette d'epargne).
export default function GoalCard({
  title,
  subtitle,
  current,
  target,
  color,
  onAdd,
  onEdit,
  onPress,
  onLongPress,
  expanded,
  expandHint,
  children,
}) {
  const t = useT();
  const progress = target > 0 ? current / target : 0;
  const pct = Math.round(progress * 100);
  return (
    <Pressable onPress={onPress} onLongPress={onLongPress}>
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
            <Text style={styles.addText}>{t('goalCard.add')}</Text>
          </Pressable>
          {onEdit ? (
            <Pressable
              onPress={onEdit}
              hitSlop={10}
              style={({ pressed }) => [styles.editBtn, pressed && { opacity: 0.6 }]}
              accessibilityLabel={t('goalCard.edit')}
            >
              <Glyph name="dots" color={colors.textMuted} size={18} />
            </Pressable>
          ) : null}
        </View>

        <View style={styles.amounts}>
          <Text style={styles.current}>{euro(current)}</Text>
          {target > 0 ? <Text style={styles.target}> / {euro(target)}</Text> : null}
        </View>

        {target > 0 ? (
          <>
            <ProgressBar progress={progress} color={color} />
            <Text style={styles.pct}>{t('goalCard.reached', { pct })}</Text>
          </>
        ) : null}

        {expanded && children ? <View style={styles.expand}>{children}</View> : null}

        {onPress ? (
          <View style={styles.chevronWrap}>
            {expandHint ? <Text style={styles.expandHint}>{expandHint}</Text> : null}
            <Glyph name={expanded ? 'arrowUp' : 'arrowDown'} color={colors.primary} size={16} />
          </View>
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
  editBtn: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    backgroundColor: colors.bgSoft,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  amounts: { flexDirection: 'row', alignItems: 'baseline', marginBottom: spacing.md },
  current: { fontSize: 26, fontFamily: ff.extrabold, color: colors.text, letterSpacing: -0.5 },
  target: { fontSize: 15, fontWeight: '600', color: colors.textMuted },
  pct: { ...font.caption, marginTop: spacing.sm, fontWeight: '700' },
  expand: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  chevronWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, marginTop: spacing.sm },
  expandHint: { color: colors.primary, fontFamily: ff.semibold, fontSize: 13 },
});
