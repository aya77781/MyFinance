import { useState, useCallback, useRef } from 'react';
import { View, Text, Pressable, useWindowDimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import Screen from '../components/Screen';
import Card from '../components/Card';
import AddButton from '../components/AddButton';
import Button from '../components/Button';
import GradientCard from '../components/GradientCard';
import FormSheet from '../components/FormSheet';
import EmptyState from '../components/EmptyState';
import Wheel from '../components/Wheel';
import { SkeletonCard } from '../components/Skeleton';
import { useToast } from '../components/Toast';
import { colors, spacing, font, radius, palette, ff } from '../theme';
import { euro, shortDate } from '../format';
import { Life } from '../api';
import { confirmAction } from '../confirm';
import { useT, registerTranslations } from '../i18n';

registerTranslations({
  fr: {
    'life.title': 'Life',
    'life.subtitle': 'La roue du mois',
    'life.add': 'Ajouter une activite',
    'life.edit': "Modifier l'activite",
    'life.fieldName': 'Activite',
    'life.fieldNamePlaceholder': 'Ex : Cinema, Resto, Rando',
    'life.fieldBudget': 'Budget',
    'life.fieldColor': 'Couleur sur la roue',
    'life.nameRequired': "Donne un nom a l'activite.",
    'life.created': 'Activite ajoutee',
    'life.updated': 'Activite mise a jour',
    'life.deleted': 'Activite supprimee',
    'life.spin': 'Tourner la roue',
    'life.spinning': 'La roue tourne...',
    'life.comeBack': 'Reviens demain',
    'life.lockedHint': 'Un seul tirage par jour. Reviens demain pour la prochaine activite.',
    'life.resetMonth': 'Recommencer le mois',
    'life.resetConfirmTitle': 'Recommencer le mois',
    'life.resetConfirmText': 'Remettre toutes les activites sur la roue ?',
    'life.resetDone': 'Roue reinitialisee',
    'life.heroPromptTitle': 'Fais tourner la roue !',
    'life.heroPromptText': '{count} activite(s) sur la roue. Tire celle que tu feras aujourd\'hui.',
    'life.heroEmptyTitle': 'Commence par ajouter tes activites',
    'life.heroEmptyText': "Liste ce que tu veux faire ce mois-ci, chacune avec son budget.",
    'life.heroAllDoneTitle': 'Tout est tire ce mois-ci',
    'life.heroAllDoneText': 'Recommence le mois pour relancer la roue.',
    'life.todayTitle': "Activite du jour",
    'life.budgetTotal': 'Budget total {amount}',
    'life.onWheel': 'Sur la roue ({count})',
    'life.drawn': 'Deja tirees ({count})',
    'life.emptyTitle': 'Aucune activite',
    'life.emptyText': 'Ajoute ta premiere activite pour remplir la roue.',
    'life.deleteTitle': 'Supprimer',
    'life.deleteConfirm': 'Supprimer "{name}" ?',
    'life.cancel': 'Annuler',
    'life.delete': 'Supprimer',
    'life.tapToEdit': 'Touche une activite pour la modifier · appui long pour supprimer.',
  },
  en: {
    'life.title': 'Life',
    'life.subtitle': 'The monthly wheel',
    'life.add': 'Add an activity',
    'life.edit': 'Edit activity',
    'life.fieldName': 'Activity',
    'life.fieldNamePlaceholder': 'e.g. Cinema, Dinner, Hike',
    'life.fieldBudget': 'Budget',
    'life.fieldColor': 'Color on the wheel',
    'life.nameRequired': 'Give the activity a name.',
    'life.created': 'Activity added',
    'life.updated': 'Activity updated',
    'life.deleted': 'Activity deleted',
    'life.spin': 'Spin the wheel',
    'life.spinning': 'Spinning...',
    'life.comeBack': 'Come back tomorrow',
    'life.lockedHint': 'One spin per day. Come back tomorrow for the next activity.',
    'life.resetMonth': 'Restart the month',
    'life.resetConfirmTitle': 'Restart the month',
    'life.resetConfirmText': 'Put every activity back on the wheel?',
    'life.resetDone': 'Wheel reset',
    'life.heroPromptTitle': 'Spin the wheel!',
    'life.heroPromptText': '{count} activity(ies) on the wheel. Draw the one you\'ll do today.',
    'life.heroEmptyTitle': 'Start by adding your activities',
    'life.heroEmptyText': 'List what you want to do this month, each with its budget.',
    'life.heroAllDoneTitle': 'All drawn this month',
    'life.heroAllDoneText': 'Restart the month to spin again.',
    'life.todayTitle': "Today's activity",
    'life.budgetTotal': 'Total budget {amount}',
    'life.onWheel': 'On the wheel ({count})',
    'life.drawn': 'Already drawn ({count})',
    'life.emptyTitle': 'No activity',
    'life.emptyText': 'Add your first activity to fill the wheel.',
    'life.deleteTitle': 'Delete',
    'life.deleteConfirm': 'Delete "{name}"?',
    'life.cancel': 'Cancel',
    'life.delete': 'Delete',
    'life.tapToEdit': 'Tap an activity to edit · long-press to delete.',
  },
});

const sameLocalDay = (a, b) => {
  if (!a || !b) return false;
  const x = new Date(a);
  const y = new Date(b);
  return (
    x.getFullYear() === y.getFullYear() &&
    x.getMonth() === y.getMonth() &&
    x.getDate() === y.getDate()
  );
};

export default function LifeScreen() {
  const t = useT();
  const toast = useToast();
  const { width } = useWindowDimensions();
  const wheelRef = useRef(null);

  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [createSheet, setCreateSheet] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const load = useCallback(async () => {
    try {
      setItems(await Life.list());
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

  const remaining = items.filter((a) => !a.drawn);
  const drawn = items.filter((a) => a.drawn);
  const lastDraw = drawn
    .slice()
    .sort((a, b) => new Date(b.drawnAt) - new Date(a.drawnAt))[0];
  const drawnToday = lastDraw && sameLocalDay(lastDraw.drawnAt, new Date());
  const canSpin = !spinning && !drawnToday && remaining.length > 0;
  const totalBudget = items.reduce((s, a) => s + (Number(a.budget) || 0), 0);

  const segments = remaining.map((a) => ({ label: a.name, color: a.color || colors.primary }));
  const wheelSize = Math.min(300, Math.max(220, width - 96));

  const spin = () => {
    if (!canSpin || !wheelRef.current) return;
    const index = Math.floor(Math.random() * remaining.length);
    const winner = remaining[index];
    setSpinning(true);
    wheelRef.current.spinTo(index, async () => {
      try {
        await Life.draw(winner._id);
        toast.success(winner.name);
        await load();
      } catch (e) {
        toast.error(e.message);
      } finally {
        setSpinning(false);
      }
    });
  };

  const resetMonth = async () => {
    const ok = await confirmAction({
      title: t('life.resetConfirmTitle'),
      message: t('life.resetConfirmText'),
      confirmLabel: t('life.resetMonth'),
      cancelLabel: t('life.cancel'),
    });
    if (!ok) return;
    try {
      setItems(await Life.reset());
      toast.success(t('life.resetDone'));
    } catch (e) {
      toast.error(e.message);
    }
  };

  const create = async (v) => {
    if (!v.name?.trim()) throw new Error(t('life.nameRequired'));
    await Life.create({
      name: v.name.trim(),
      budget: Number(v.budget) || 0,
      color: v.color || palette[items.length % palette.length],
    });
    toast.success(t('life.created'));
    setCreateSheet(false);
    load();
  };

  const saveEdit = async (v) => {
    if (!v.name?.trim()) throw new Error(t('life.nameRequired'));
    await Life.update(editTarget._id, {
      name: v.name.trim(),
      budget: Number(v.budget) || 0,
      color: v.color || editTarget.color,
    });
    toast.success(t('life.updated'));
    setEditTarget(null);
    load();
  };

  const confirmDelete = async (item) => {
    setEditTarget(null);
    const ok = await confirmAction({
      title: t('life.deleteTitle'),
      message: t('life.deleteConfirm', { name: item.name }),
      confirmLabel: t('life.delete'),
      cancelLabel: t('life.cancel'),
      destructive: true,
    });
    if (!ok) return;
    try {
      await Life.remove(item._id);
      toast.success(t('life.deleted'));
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const colorField = {
    key: 'color',
    label: t('life.fieldColor'),
    type: 'select',
    options: palette.map((c) => ({ label: ' ', value: c, color: c })),
  };

  return (
    <>
      <Screen
        title={t('life.title')}
        subtitle={t('life.subtitle')}
        action={<AddButton onPress={() => setCreateSheet(true)} />}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          load();
        }}
      >
        {/* Hero : état du jour */}
        <GradientCard style={{ marginBottom: spacing.lg }}>
          {drawnToday ? (
            <>
              <Text style={styles.heroLabel}>{t('life.todayTitle')}</Text>
              <View style={styles.todayRow}>
                <View style={[styles.dot, { backgroundColor: lastDraw.color || colors.primary }]} />
                <Text style={styles.todayName} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
                  {lastDraw.name}
                </Text>
              </View>
              <Text style={styles.todayBudget}>{euro(lastDraw.budget)}</Text>
            </>
          ) : items.length === 0 ? (
            <>
              <Text style={styles.heroTitle}>{t('life.heroEmptyTitle')}</Text>
              <Text style={styles.heroText}>{t('life.heroEmptyText')}</Text>
            </>
          ) : remaining.length === 0 ? (
            <>
              <Text style={styles.heroTitle}>{t('life.heroAllDoneTitle')}</Text>
              <Text style={styles.heroText}>{t('life.heroAllDoneText')}</Text>
            </>
          ) : (
            <>
              <Text style={styles.heroTitle}>{t('life.heroPromptTitle')}</Text>
              <Text style={styles.heroText}>{t('life.heroPromptText', { count: remaining.length })}</Text>
            </>
          )}
          {items.length > 0 ? (
            <Text style={styles.heroBudget}>{t('life.budgetTotal', { amount: euro(totalBudget) })}</Text>
          ) : null}
        </GradientCard>

        {!loaded && items.length === 0 ? (
          <SkeletonCard lines={3} />
        ) : items.length === 0 ? (
          <Card>
            <EmptyState title={t('life.emptyTitle')} text={t('life.emptyText')} />
          </Card>
        ) : (
          <>
            <Card style={{ alignItems: 'center', marginBottom: spacing.lg }}>
              <Wheel ref={wheelRef} segments={segments} size={wheelSize} />

              {remaining.length > 0 ? (
                <Button
                  title={spinning ? t('life.spinning') : drawnToday ? t('life.comeBack') : t('life.spin')}
                  onPress={spin}
                  loading={spinning}
                  disabled={!canSpin}
                  style={{ alignSelf: 'stretch', marginTop: spacing.lg }}
                />
              ) : (
                <Button
                  title={t('life.resetMonth')}
                  variant="ghost"
                  onPress={resetMonth}
                  style={{ alignSelf: 'stretch', marginTop: spacing.lg }}
                />
              )}

              {drawnToday && remaining.length > 0 ? (
                <Text style={styles.lockHint}>{t('life.lockedHint')}</Text>
              ) : null}
            </Card>

            <Text style={styles.tapHint}>{t('life.tapToEdit')}</Text>

            {remaining.length > 0 ? (
              <>
                <Text style={styles.section}>{t('life.onWheel', { count: remaining.length })}</Text>
                <Card style={{ marginBottom: spacing.lg }} padded={false}>
                  {remaining.map((item, i) => (
                    <ActivityRow
                      key={item._id}
                      item={item}
                      last={i === remaining.length - 1}
                      onPress={() => setEditTarget(item)}
                      onLongPress={() => confirmDelete(item)}
                    />
                  ))}
                </Card>
              </>
            ) : null}

            {drawn.length > 0 ? (
              <>
                <Text style={styles.section}>{t('life.drawn', { count: drawn.length })}</Text>
                <Card padded={false}>
                  {drawn
                    .slice()
                    .sort((a, b) => new Date(b.drawnAt) - new Date(a.drawnAt))
                    .map((item, i, arr) => (
                      <ActivityRow
                        key={item._id}
                        item={item}
                        drawn
                        last={i === arr.length - 1}
                        onPress={() => setEditTarget(item)}
                        onLongPress={() => confirmDelete(item)}
                      />
                    ))}
                </Card>
              </>
            ) : null}
          </>
        )}
      </Screen>

      <FormSheet
        visible={createSheet}
        title={t('life.add')}
        fields={[
          { key: 'name', label: t('life.fieldName'), type: 'text', placeholder: t('life.fieldNamePlaceholder') },
          { key: 'budget', label: t('life.fieldBudget'), type: 'number', placeholder: '0' },
          colorField,
        ]}
        initial={{ color: palette[items.length % palette.length] }}
        submitLabel={t('common.add')}
        onSubmit={create}
        onClose={() => setCreateSheet(false)}
      />

      <FormSheet
        visible={!!editTarget}
        title={t('life.edit')}
        fields={[
          { key: 'name', label: t('life.fieldName'), type: 'text', placeholder: t('life.fieldNamePlaceholder') },
          { key: 'budget', label: t('life.fieldBudget'), type: 'number', placeholder: '0' },
          colorField,
        ]}
        initial={
          editTarget
            ? {
                name: editTarget.name || '',
                budget: editTarget.budget != null ? String(editTarget.budget) : '',
                color: editTarget.color || palette[0],
              }
            : {}
        }
        onSubmit={saveEdit}
        onClose={() => setEditTarget(null)}
        onDelete={editTarget ? () => confirmDelete(editTarget) : undefined}
        deleteLabel={t('life.delete')}
      />
    </>
  );
}

function ActivityRow({ item, drawn, last, onPress, onLongPress }) {
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={350}
      style={({ pressed }) => [
        styles.row,
        !last && styles.rowBorder,
        pressed && { opacity: 0.6 },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: item.color || colors.primary, opacity: drawn ? 0.45 : 1 }]} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowName, drawn && styles.rowNameDrawn]} numberOfLines={1}>
          {item.name}
        </Text>
        {drawn && item.drawnAt ? (
          <Text style={styles.rowDate}>{shortDate(item.drawnAt)}</Text>
        ) : null}
      </View>
      <Text style={[styles.rowBudget, drawn && styles.rowNameDrawn]}>{euro(item.budget)}</Text>
    </Pressable>
  );
}

const styles = {
  heroLabel: { color: colors.textOnBrandMuted, fontSize: 13, fontFamily: ff.semibold },
  heroTitle: { color: '#fff', fontFamily: ff.extrabold, fontSize: 22, letterSpacing: -0.5 },
  heroText: { color: colors.textOnBrandMuted, fontSize: 14, fontFamily: ff.medium, marginTop: 6 },
  heroBudget: { color: colors.primary, fontSize: 13, fontFamily: ff.bold, marginTop: spacing.md },
  todayRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  todayName: { color: '#fff', fontFamily: ff.extrabold, fontSize: 30, letterSpacing: -0.8, flex: 1 },
  todayBudget: { color: colors.primary, fontSize: 16, fontFamily: ff.bold, marginTop: 4 },
  lockHint: { ...font.caption, textAlign: 'center', marginTop: spacing.md, maxWidth: 280 },
  tapHint: { ...font.caption, marginBottom: spacing.sm },
  section: { ...font.label, marginBottom: spacing.sm, marginTop: spacing.xs },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  dot: { width: 14, height: 14, borderRadius: 7, marginRight: spacing.md },
  rowName: { fontFamily: ff.semibold, fontSize: 15, color: colors.text },
  rowNameDrawn: { color: colors.textMuted, textDecorationLine: 'line-through' },
  rowDate: { ...font.caption, marginTop: 1 },
  rowBudget: { fontFamily: ff.bold, fontSize: 15, color: colors.text, marginLeft: spacing.sm },
};
