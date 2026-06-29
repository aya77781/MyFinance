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
import { euro } from '../format';
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
      targetAmount: Number(v.target) || 0,
      color: v.color || palette[1],
      period,
      deadline: addPeriod(new Date(), period).toISOString(),
    });
    load();
  };

  const addPiste = async (v) => {
    if (!pisteTarget) return;
    if (!v.name?.trim()) throw new Error(t('challenges.nameRequired'));
    await Challenges.addMission(pisteTarget._id, {
      title: v.name,
      estimatedAmount: Number(v.estimated) || 0,
    });
    setPisteTarget(null);
    load();
  };

  const submitValidate = async (v) => {
    if (!validateTarget) return;
    const { challenge, mission } = validateTarget;
    await Challenges.updateMission(challenge._id, mission._id, {
      actualAmount: Number(v.actual) || 0,
      done: true,
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

  const confirmDelete = (item) => {
    Alert.alert(t('challenges.deleteTitle'), t('challenges.deleteConfirm', { name: item.title }), [
      { text: t('challenges.cancel'), style: 'cancel' },
      {
        text: t('challenges.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await Challenges.remove(item._id);
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
          <Text style={styles.bannerValue}>{euro(totalReal)}</Text>
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

      {/* Validation d'une piste : saisie du montant reel gagne */}
      <FormSheet
        visible={!!validateTarget}
        title={validateTarget ? t('challenges.validateTitle', { name: validateTarget.mission.title }) : ''}
        fields={[
          { key: 'actual', label: t('challenges.fieldActual'), type: 'number', placeholder: '0' },
        ]}
        initial={
          validateTarget
            ? {
                actual: String(
                  validateTarget.mission.actualAmount != null
                    ? validateTarget.mission.actualAmount
                    : validateTarget.mission.estimatedAmount || ''
                ),
              }
            : {}
        }
        submitLabel={t('challenges.submit')}
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
function ChallengeCard({ item, onAddPiste, onPressMission, onLongPress }) {
  const t = useT();
  const [open, setOpen] = useState(true);
  const missions = item.missions || [];
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
            <Text style={font.title} numberOfLines={1}>{item.title}</Text>
            <Text style={font.caption}>
              {item.period ? t(`challenges.period.${item.period}`) : ''}
              {deadlineText ? `  ·  ${deadlineText}` : ''}
            </Text>
          </View>
          {isDone ? (
            <View style={styles.doneBadge}>
              <Glyph name="check" color={colors.textOnTeal} size={14} />
            </View>
          ) : null}
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
