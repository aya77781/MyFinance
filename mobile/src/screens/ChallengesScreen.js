import { useState, useCallback } from 'react';
import { View, Text, Alert, Pressable, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import Screen from '../components/Screen';
import Card from '../components/Card';
import AddButton from '../components/AddButton';
import ProgressBar from '../components/ProgressBar';
import GradientCard from '../components/GradientCard';
import FormSheet from '../components/FormSheet';
import EmptyState from '../components/EmptyState';
import { SkeletonCard } from '../components/Skeleton';
import { useToast } from '../components/Toast';
import Glyph from '../components/Glyph';
import { colors, spacing, font, radius, palette, ff } from '../theme';
import { euro, toDisplay, fromDisplay } from '../format';
import { Challenges } from '../api';
import { useT, registerTranslations } from '../i18n';

registerTranslations({
  fr: {
    'challenges.title': 'Challenges',
    'challenges.subtitle': 'Mettre plus de cote',
    'challenges.bannerLabel': 'Gagne via les challenges',
    'challenges.bannerSub': '{count} en cours · potentiel {amount}',
    'challenges.emptyTitle': 'Aucun challenge',
    'challenges.emptyText': 'Lance un defi (montant cible sur une periode) et ajoute des pistes pour gagner plus.',
    'challenges.done': 'Objectif atteint',
    'challenges.deleteTitle': 'Supprimer',
    'challenges.deleteConfirm': 'Supprimer "{name}" ?',
    'challenges.nameRequired': 'Donne un nom.',
    'challenges.untitled': 'Challenge sans nom',
    'challenges.noPeriod': 'Sans echeance',
    'challenges.edit': 'Modifier',
    'challenges.editTitle': 'Modifier le challenge',
    'challenges.fieldCurrent': 'Montant actuel',
    'challenges.created': 'Challenge cree',
    'challenges.updated': 'Challenge modifie',
    'challenges.cancel': 'Annuler',
    'challenges.delete': 'Supprimer',
    'challenges.createTitle': 'Nouveau challenge',
    'challenges.fieldName': 'Nom',
    'challenges.fieldNamePlaceholder': 'Ex : Gagner 1000 € en extra',
    'challenges.fieldTarget': 'Montant cible',
    'challenges.fieldPeriod': 'Periode',
    'challenges.fieldColor': 'Couleur',
    // Pistes
    'challenges.pistes': 'Pistes',
    'challenges.addPiste': 'Ajouter une piste',
    'challenges.noPiste': 'Aucune piste pour le moment.',
    'challenges.estimated': 'Estime',
    'challenges.real': 'Reel',
    'challenges.toValidate': 'A valider',
    'challenges.validate': 'Valider',
    'challenges.pisteTotalEstimated': 'Total estime',
    'challenges.pisteEarned': 'Gagne',
    'challenges.pisteTitle': 'Nouvelle piste',
    'challenges.editPisteTitle': 'Piste : {name}',
    'challenges.fieldPisteName': 'Intitule',
    'challenges.fieldPisteNamePlaceholder': 'Ex : Vendre vieux materiel',
    'challenges.fieldEstimated': 'Montant estime a gagner',
    'challenges.validateTitle': 'Valider : {name}',
    'challenges.fieldActual': 'Montant reel gagne',
    'challenges.reopen': 'Annuler la validation',
    'challenges.deletePiste': 'Supprimer la piste',
    'challenges.submit': 'Valider',
    'challenges.save': 'Enregistrer',
    // Periode + echeance
    'challenges.period.1w': '1 semaine',
    'challenges.period.2w': '2 semaines',
    'challenges.period.1m': '1 mois',
    'challenges.period.2m': '2 mois',
    'challenges.period.3m': '3 mois',
    'challenges.period.6m': '6 mois',
    'challenges.period.1y': '1 an',
    'challenges.daysLeft': 'Plus que {n} j',
    'challenges.lastDay': "Dernier jour",
    'challenges.ended': 'Termine',
    'challenges.progress': '{pct}% atteint',
  },
  en: {
    'challenges.title': 'Challenges',
    'challenges.subtitle': 'Set aside more',
    'challenges.bannerLabel': 'Earned via challenges',
    'challenges.bannerSub': '{count} active · potential {amount}',
    'challenges.emptyTitle': 'No challenge',
    'challenges.emptyText': 'Start a challenge (target amount over a period) and add leads to earn more.',
    'challenges.done': 'Target reached',
    'challenges.deleteTitle': 'Delete',
    'challenges.deleteConfirm': 'Delete "{name}"?',
    'challenges.nameRequired': 'Enter a name.',
    'challenges.untitled': 'Untitled challenge',
    'challenges.noPeriod': 'No deadline',
    'challenges.edit': 'Edit',
    'challenges.editTitle': 'Edit challenge',
    'challenges.fieldCurrent': 'Current amount',
    'challenges.created': 'Challenge created',
    'challenges.updated': 'Challenge updated',
    'challenges.cancel': 'Cancel',
    'challenges.delete': 'Delete',
    'challenges.createTitle': 'New challenge',
    'challenges.fieldName': 'Name',
    'challenges.fieldNamePlaceholder': 'E.g. Earn €1000 on the side',
    'challenges.fieldTarget': 'Target amount',
    'challenges.fieldPeriod': 'Period',
    'challenges.fieldColor': 'Color',
    // Leads
    'challenges.pistes': 'Leads',
    'challenges.addPiste': 'Add a lead',
    'challenges.noPiste': 'No lead yet.',
    'challenges.estimated': 'Est.',
    'challenges.real': 'Actual',
    'challenges.toValidate': 'To confirm',
    'challenges.validate': 'Confirm',
    'challenges.pisteTotalEstimated': 'Total estimated',
    'challenges.pisteEarned': 'Earned',
    'challenges.pisteTitle': 'New lead',
    'challenges.editPisteTitle': 'Lead: {name}',
    'challenges.fieldPisteName': 'Title',
    'challenges.fieldPisteNamePlaceholder': 'E.g. Sell old gear',
    'challenges.fieldEstimated': 'Estimated amount to earn',
    'challenges.validateTitle': 'Confirm: {name}',
    'challenges.fieldActual': 'Actual amount earned',
    'challenges.reopen': 'Undo confirmation',
    'challenges.deletePiste': 'Delete lead',
    'challenges.submit': 'Confirm',
    'challenges.save': 'Save',
    // Period + deadline
    'challenges.period.1w': '1 week',
    'challenges.period.2w': '2 weeks',
    'challenges.period.1m': '1 month',
    'challenges.period.2m': '2 months',
    'challenges.period.3m': '3 months',
    'challenges.period.6m': '6 months',
    'challenges.period.1y': '1 year',
    'challenges.daysLeft': '{n} days left',
    'challenges.lastDay': 'Last day',
    'challenges.ended': 'Ended',
    'challenges.progress': '{pct}% reached',
  },
});

const PERIODS = ['1w', '2w', '1m', '2m', '3m', '6m', '1y'];

// Ajoute une periode a une date (echeance du challenge).
function addPeriod(date, period) {
  const d = new Date(date);
  const map = {
    '1w': [0, 7],
    '2w': [0, 14],
    '1m': [1, 0],
    '2m': [2, 0],
    '3m': [3, 0],
    '6m': [6, 0],
    '1y': [12, 0],
  };
  const [months, days] = map[period] || [1, 0];
  if (months) d.setMonth(d.getMonth() + months);
  if (days) d.setDate(d.getDate() + days);
  return d;
}

export default function ChallengesScreen() {
  const t = useT();
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false); // evite le flash d'etat vide au 1er chargement
  const [refreshing, setRefreshing] = useState(false);
  const [createSheet, setCreateSheet] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // challenge en cours de modification
  const [pisteTarget, setPisteTarget] = useState(null); // challenge auquel on ajoute une piste
  const [validateTarget, setValidateTarget] = useState(null); // { challenge, mission }

  const load = useCallback(async () => {
    try {
      setItems(await Challenges.list());
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoaded(true);
      setRefreshing(false);
    }
  }, [toast]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const create = async (v) => {
    if (!v.name?.trim()) throw new Error(t('challenges.nameRequired'));
    const period = v.period || '1m';
    await Challenges.create({
      title: v.name,
      description: '',
      targetAmount: fromDisplay(Number(v.target) || 0),
      color: v.color || palette[1],
      period,
      deadline: addPeriod(new Date(), period).toISOString(),
    });
    toast.success(t('challenges.created'));
    load();
  };

  // Modification d'un challenge existant (nom, objectif, periode, couleur).
  const saveEdit = async (v) => {
    if (!v.name?.trim()) throw new Error(t('challenges.nameRequired'));
    const period = v.period || editTarget.period || '1m';
    const patch = {
      title: v.name.trim(),
      targetAmount: fromDisplay(Number(v.target) || 0),
      color: v.color || editTarget.color || palette[1],
      period,
    };
    // Si la periode change, on recalcule l'echeance depuis le debut du challenge.
    if (period !== (editTarget.period || '')) {
      const base = editTarget.createdAt ? new Date(editTarget.createdAt) : new Date();
      patch.deadline = addPeriod(base, period).toISOString();
    }
    // Montant actuel editable a la main UNIQUEMENT si le challenge n'a pas de
    // leads (sinon le total est calcule a partir des leads valides).
    if (!(editTarget.missions || []).length && v.current != null && v.current !== '') {
      patch.currentAmount = fromDisplay(Number(v.current) || 0);
    }
    await Challenges.update(editTarget._id, patch);
    toast.success(t('challenges.updated'));
    setEditTarget(null);
    load();
  };

  const addPiste = async (v) => {
    if (!pisteTarget) return;
    if (!v.name?.trim()) throw new Error(t('challenges.nameRequired'));
    await Challenges.addMission(pisteTarget._id, {
      title: v.name,
      estimatedAmount: fromDisplay(Number(v.estimated) || 0),
    });
    setPisteTarget(null);
    load();
  };

  // Enregistre une piste : intitule + estime toujours modifiables ; si un montant
  // reel est saisi, la piste est validee (done), sinon elle reste a valider.
  const submitValidate = async (v) => {
    if (!validateTarget) return;
    if (!v.name?.trim()) throw new Error(t('challenges.nameRequired'));
    const { challenge, mission } = validateTarget;
    const hasActual = v.actual != null && String(v.actual).trim() !== '';
    await Challenges.updateMission(challenge._id, mission._id, {
      title: v.name.trim(),
      estimatedAmount: fromDisplay(Number(v.estimated) || 0),
      actualAmount: hasActual ? fromDisplay(Number(v.actual) || 0) : null,
      done: hasActual,
    });
    setValidateTarget(null);
    load();
  };

  const reopenMission = async () => {
    if (!validateTarget) return;
    const { challenge, mission } = validateTarget;
    try {
      await Challenges.updateMission(challenge._id, mission._id, { actualAmount: null, done: false });
      setValidateTarget(null);
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const deleteMission = async () => {
    if (!validateTarget) return;
    const { challenge, mission } = validateTarget;
    try {
      await Challenges.removeMission(challenge._id, mission._id);
      setValidateTarget(null);
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const confirmDelete = (item, after) => {
    Alert.alert(
      t('challenges.deleteTitle'),
      t('challenges.deleteConfirm', { name: item.title || t('challenges.untitled') }),
      [
      { text: t('challenges.cancel'), style: 'cancel' },
      {
        text: t('challenges.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await Challenges.remove(item._id);
            after?.();
            load();
          } catch (e) {
            toast.error(e.message);
          }
        },
      },
    ]);
  };

  // Totaux pour le bandeau : reel gagne + potentiel (somme des estimations).
  const totalReal = items.reduce((s, c) => s + (Number(c.currentAmount) || 0), 0);
  const totalPotential = items.reduce(
    (s, c) => s + (c.missions || []).reduce((a, m) => a + (Number(m.estimatedAmount) || 0), 0),
    0
  );
  const activeCount = items.filter((c) => c.status === 'active').length;

  return (
    <>
      <Screen
        title={t('challenges.title')}
        subtitle={t('challenges.subtitle')}
        action={<AddButton onPress={() => setCreateSheet(true)} />}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          load();
        }}
      >
        <GradientCard style={{ marginBottom: spacing.lg }}>
          <Text style={styles.bannerLabel}>{t('challenges.bannerLabel')}</Text>
          <Text style={styles.bannerValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
            {euro(totalReal)}
          </Text>
          <Text style={styles.bannerSub}>
            {t('challenges.bannerSub', { count: activeCount, amount: euro(totalPotential) })}
          </Text>
        </GradientCard>

        {!loaded && items.length === 0 ? (
          <View style={{ gap: spacing.lg }}>
            <SkeletonCard lines={2} />
            <SkeletonCard lines={2} />
          </View>
        ) : items.length === 0 ? (
          <Card>
            <EmptyState title={t('challenges.emptyTitle')} text={t('challenges.emptyText')} />
          </Card>
        ) : (
          items.map((item) => (
            <ChallengeCard
              key={item._id}
              item={item}
              onAddPiste={() => setPisteTarget(item)}
              onPressMission={(mission) => setValidateTarget({ challenge: item, mission })}
              onEdit={() => setEditTarget(item)}
              onLongPress={() => confirmDelete(item)}
            />
          ))
        )}
      </Screen>

      {/* Creation d'un challenge */}
      <FormSheet
        visible={createSheet}
        title={t('challenges.createTitle')}
        fields={[
          { key: 'name', label: t('challenges.fieldName'), type: 'text', placeholder: t('challenges.fieldNamePlaceholder') },
          { key: 'target', label: t('challenges.fieldTarget'), type: 'number', placeholder: '0' },
          {
            key: 'period',
            label: t('challenges.fieldPeriod'),
            type: 'select',
            options: PERIODS.map((p) => ({ label: t(`challenges.period.${p}`), value: p })),
          },
          {
            key: 'color',
            label: t('challenges.fieldColor'),
            type: 'select',
            options: palette.map((c) => ({ label: ' ', value: c, color: c })),
          },
        ]}
        initial={{ color: palette[1], period: '1m' }}
        submitLabel={t('challenges.save')}
        onSubmit={create}
        onClose={() => setCreateSheet(false)}
      />

      {/* Modification d'un challenge */}
      <FormSheet
        visible={!!editTarget}
        title={t('challenges.editTitle')}
        fields={[
          { key: 'name', label: t('challenges.fieldName'), type: 'text', placeholder: t('challenges.fieldNamePlaceholder') },
          // Montant actuel : editable seulement sans lead (sinon calcule depuis les leads).
          editTarget && !(editTarget.missions || []).length
            ? { key: 'current', label: t('challenges.fieldCurrent'), type: 'number', placeholder: '0' }
            : null,
          { key: 'target', label: t('challenges.fieldTarget'), type: 'number', placeholder: '0' },
          {
            key: 'period',
            label: t('challenges.fieldPeriod'),
            type: 'select',
            options: PERIODS.map((p) => ({ label: t(`challenges.period.${p}`), value: p })),
          },
          {
            key: 'color',
            label: t('challenges.fieldColor'),
            type: 'select',
            options: palette.map((c) => ({ label: ' ', value: c, color: c })),
          },
        ].filter(Boolean)}
        initial={
          editTarget
            ? {
                name: editTarget.title || '',
                current: editTarget.currentAmount != null ? String(toDisplay(editTarget.currentAmount)) : '',
                target: editTarget.targetAmount != null ? String(toDisplay(editTarget.targetAmount)) : '',
                period: editTarget.period || '1m',
                color: editTarget.color || palette[1],
              }
            : {}
        }
        submitLabel={t('challenges.save')}
        onSubmit={saveEdit}
        onClose={() => setEditTarget(null)}
        onDelete={editTarget ? () => confirmDelete(editTarget, () => setEditTarget(null)) : undefined}
        deleteLabel={t('challenges.delete')}
      />

      {/* Ajout d'une piste */}
      <FormSheet
        visible={!!pisteTarget}
        title={t('challenges.pisteTitle')}
        fields={[
          { key: 'name', label: t('challenges.fieldPisteName'), type: 'text', placeholder: t('challenges.fieldPisteNamePlaceholder') },
          { key: 'estimated', label: t('challenges.fieldEstimated'), type: 'number', placeholder: '0' },
        ]}
        submitLabel={t('challenges.save')}
        onSubmit={addPiste}
        onClose={() => setPisteTarget(null)}
      />

      {/* Modification / validation d'une piste : intitule + estime + montant reel */}
      <FormSheet
        visible={!!validateTarget}
        title={validateTarget ? t('challenges.editPisteTitle', { name: validateTarget.mission.title }) : ''}
        fields={[
          { key: 'name', label: t('challenges.fieldPisteName'), type: 'text', placeholder: t('challenges.fieldPisteNamePlaceholder') },
          { key: 'estimated', label: t('challenges.fieldEstimated'), type: 'number', placeholder: '0' },
          { key: 'actual', label: t('challenges.fieldActual'), type: 'number', placeholder: '0' },
        ]}
        initial={
          validateTarget
            ? {
                name: validateTarget.mission.title || '',
                estimated:
                  validateTarget.mission.estimatedAmount != null
                    ? String(toDisplay(validateTarget.mission.estimatedAmount))
                    : '',
                actual:
                  validateTarget.mission.actualAmount != null
                    ? String(toDisplay(validateTarget.mission.actualAmount))
                    : '',
              }
            : {}
        }
        submitLabel={t('challenges.save')}
        onSubmit={submitValidate}
        onClose={() => setValidateTarget(null)}
        onDelete={
          validateTarget && validateTarget.mission.done
            ? reopenMission
            : validateTarget
              ? deleteMission
              : undefined
        }
        deleteLabel={
          validateTarget && validateTarget.mission.done
            ? t('challenges.reopen')
            : t('challenges.deletePiste')
        }
      />
    </>
  );
}

// Carte d'un challenge : objectif + echeance + liste des pistes.
function ChallengeCard({ item, onAddPiste, onPressMission, onLongPress, onEdit }) {
  const t = useT();
  const [open, setOpen] = useState(true);
  const missions = item.missions || [];
  // Totaux des pistes : potentiel estime + ce qui a deja ete gagne (pistes validees).
  const totalEstimated = missions.reduce((a, m) => a + (Number(m.estimatedAmount) || 0), 0);
  const totalEarned = missions
    .filter((m) => m.done)
    .reduce((a, m) => a + (Number(m.actualAmount) || 0), 0);
  const target = Number(item.targetAmount) || 0;
  const current = Number(item.currentAmount) || 0;
  const progress = target > 0 ? current / target : 0;
  const pct = Math.round(progress * 100);
  const isDone = item.status === 'done';

  // Echeance restante.
  let deadlineText = null;
  if (item.deadline) {
    const ms = new Date(item.deadline) - new Date();
    const days = Math.ceil(ms / 86400000);
    if (days > 1) deadlineText = t('challenges.daysLeft', { n: days });
    else if (days === 1 || days === 0) deadlineText = t('challenges.lastDay');
    else deadlineText = t('challenges.ended');
  }

  return (
    <Pressable onLongPress={onLongPress}>
      <Card style={{ marginBottom: spacing.lg }}>
        <View style={styles.top}>
          <View style={[styles.accent, { backgroundColor: item.color }]} />
          <View style={{ flex: 1 }}>
            <Text
              style={[font.title, !item.title && { color: colors.textMuted, fontStyle: 'italic' }]}
              numberOfLines={1}
            >
              {item.title || t('challenges.untitled')}
            </Text>
            <Text style={font.caption}>
              {item.period ? t(`challenges.period.${item.period}`) : t('challenges.noPeriod')}
              {deadlineText ? `  ·  ${deadlineText}` : ''}
            </Text>
          </View>
          {isDone ? (
            <View style={[styles.doneBadge, { marginRight: spacing.sm }]}>
              <Glyph name="check" color={colors.textOnTeal} size={14} />
            </View>
          ) : null}
          {/* Modifier / supprimer le challenge (alternative explicite a l'appui long). */}
          <Pressable
            onPress={onEdit}
            hitSlop={10}
            style={({ pressed }) => [styles.editBtn, pressed && { opacity: 0.6 }]}
            accessibilityLabel={t('challenges.edit')}
          >
            <Glyph name="dots" color={colors.textMuted} size={18} />
          </Pressable>
        </View>

        <View style={styles.amounts}>
          <Text style={styles.current}>{euro(current)}</Text>
          {target > 0 ? <Text style={styles.target}> / {euro(target)}</Text> : null}
        </View>
        {target > 0 ? (
          <>
            <ProgressBar progress={progress} color={item.color} />
            <Text style={styles.pct}>{t('challenges.progress', { pct })}</Text>
          </>
        ) : null}

        {/* Pistes (section repliable) */}
        <View style={styles.pisteHeader}>
          <Pressable
            onPress={() => setOpen((o) => !o)}
            hitSlop={8}
            style={({ pressed }) => [styles.pisteToggle, pressed && { opacity: 0.6 }]}
          >
            <View style={{ transform: [{ rotate: open ? '90deg' : '0deg' }] }}>
              <Glyph name="chevron" color={colors.textMuted} size={16} />
            </View>
            <Text style={styles.pisteTitle}>
              {t('challenges.pistes')}{missions.length ? ` (${missions.length})` : ''}
            </Text>
          </Pressable>
          <Pressable onPress={onAddPiste} hitSlop={8} style={styles.addPisteBtn}>
            <Glyph name="plus" color={colors.primary} size={14} />
            <Text style={styles.addPisteText}>{t('challenges.addPiste')}</Text>
          </Pressable>
        </View>

        {!open ? null : missions.length === 0 ? (
          <Text style={[font.caption, { marginTop: spacing.xs }]}>{t('challenges.noPiste')}</Text>
        ) : (
          missions.map((m) => (
            <Pressable
              key={m._id}
              onPress={() => onPressMission(m)}
              style={({ pressed }) => [styles.pisteRow, pressed && { opacity: 0.6 }]}
            >
              <View
                style={[
                  styles.pisteDot,
                  { backgroundColor: m.done ? colors.positive : 'transparent', borderColor: m.done ? colors.positive : colors.border },
                ]}
              >
                {m.done ? <Glyph name="check" color={colors.bg} size={11} /> : null}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[font.body, m.done && { color: colors.textMuted }]} numberOfLines={1}>
                  {m.title}
                </Text>
                <Text style={font.caption}>
                  {t('challenges.estimated')} {euro(Number(m.estimatedAmount) || 0)}
                </Text>
              </View>
              {m.done ? (
                <Text style={styles.pisteReal}>+{euro(Number(m.actualAmount) || 0)}</Text>
              ) : (
                <View style={styles.validatePill}>
                  <Text style={styles.validatePillText}>{t('challenges.validate')}</Text>
                </View>
              )}
            </Pressable>
          ))
        )}

        {/* Total des pistes (petit, en bas) : potentiel estime + deja gagne. */}
        {open && missions.length > 0 ? (
          <View style={styles.pisteFooter}>
            <Text style={styles.pisteFooterLabel}>{t('challenges.pisteTotalEstimated')}</Text>
            <View style={{ flex: 1 }} />
            {totalEarned > 0 ? (
              <Text style={styles.pisteFooterEarned}>
                {t('challenges.pisteEarned')} +{euro(totalEarned)}
              </Text>
            ) : null}
            <Text style={styles.pisteFooterValue}>{euro(totalEstimated)}</Text>
          </View>
        ) : null}
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bannerLabel: { color: colors.textOnBrandMuted, fontSize: 14, fontWeight: '600' },
  bannerValue: { color: '#fff', fontFamily: 'Manrope_800ExtraBold', fontSize: 38, marginTop: 4, letterSpacing: -1 },
  bannerSub: { color: colors.textOnBrandMuted, fontSize: 13, fontWeight: '600', marginTop: 4 },
  top: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  accent: { width: 6, height: 38, borderRadius: 3, marginRight: spacing.md },
  doneBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.positive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtn: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    backgroundColor: colors.bgSoft,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amounts: { flexDirection: 'row', alignItems: 'baseline', marginBottom: spacing.md },
  current: { fontSize: 26, fontFamily: ff.extrabold, color: colors.text, letterSpacing: -0.5 },
  target: { fontSize: 15, fontWeight: '600', color: colors.textMuted },
  pct: { ...font.caption, marginTop: spacing.sm, fontWeight: '700' },
  pisteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  pisteToggle: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pisteTitle: { ...font.label, color: colors.text },
  addPisteBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  addPisteText: { color: colors.primary, fontFamily: ff.bold, fontSize: 13 },
  pisteRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm + 2 },
  pisteDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pisteReal: { color: colors.positive, fontFamily: ff.bold, fontSize: 15 },
  pisteFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  pisteFooterLabel: { ...font.caption, fontWeight: '700' },
  pisteFooterEarned: { color: colors.positive, fontFamily: ff.bold, fontSize: 12.5 },
  pisteFooterValue: { color: colors.text, fontFamily: ff.bold, fontSize: 14 },
  validatePill: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    height: 32,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  validatePillText: { color: colors.primary, fontFamily: ff.bold, fontSize: 12.5 },
});
