import { useState, useCallback } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import Screen from '../components/Screen';
import Card from '../components/Card';
import AddButton from '../components/AddButton';
import GoalCard from '../components/GoalCard';
import GradientCard from '../components/GradientCard';
import FormSheet from '../components/FormSheet';
import EmptyState from '../components/EmptyState';
import { colors, spacing, font, radius, palette } from '../theme';
import { euro } from '../format';
import { Challenges } from '../api';
import { useT, registerTranslations } from '../i18n';

registerTranslations({
  fr: {
    'challenges.title': 'Challenges',
    'challenges.subtitle': 'Mettre plus de cote',
    'challenges.bannerLabel': 'Cumul des challenges',
    'challenges.bannerSub': '{count} challenge(s) en cours',
    'challenges.emptyTitle': 'Aucun challenge',
    'challenges.emptyText': 'Lance un defi (no-spend, 52 semaines...) pour booster ton epargne.',
    'challenges.done': 'Termine',
    'challenges.deleteTitle': 'Supprimer',
    'challenges.deleteConfirm': 'Supprimer "{name}" ?',
    'challenges.cancel': 'Annuler',
    'challenges.delete': 'Supprimer',
    'challenges.createTitle': 'Nouveau challenge',
    'challenges.fieldName': 'Nom',
    'challenges.fieldNamePlaceholder': 'Ex : No-spend 30 jours',
    'challenges.fieldDescription': 'Description',
    'challenges.fieldOptional': 'Optionnel',
    'challenges.fieldTarget': 'Objectif',
    'challenges.fieldColor': 'Couleur',
    'challenges.entryTitle': 'Progres : {name}',
    'challenges.fieldAmount': 'Montant mis de cote',
    'challenges.fieldNote': 'Note',
    'challenges.submit': 'Valider',
  },
  en: {
    'challenges.title': 'Challenges',
    'challenges.subtitle': 'Set aside more',
    'challenges.bannerLabel': 'Total of challenges',
    'challenges.bannerSub': '{count} challenge(s) in progress',
    'challenges.emptyTitle': 'No challenge',
    'challenges.emptyText': 'Start a challenge (no-spend, 52 weeks...) to boost your savings.',
    'challenges.done': 'Completed',
    'challenges.deleteTitle': 'Delete',
    'challenges.deleteConfirm': 'Delete "{name}"?',
    'challenges.cancel': 'Cancel',
    'challenges.delete': 'Delete',
    'challenges.createTitle': 'New challenge',
    'challenges.fieldName': 'Name',
    'challenges.fieldNamePlaceholder': 'E.g. No-spend 30 days',
    'challenges.fieldDescription': 'Description',
    'challenges.fieldOptional': 'Optional',
    'challenges.fieldTarget': 'Target',
    'challenges.fieldColor': 'Color',
    'challenges.entryTitle': 'Progress: {name}',
    'challenges.fieldAmount': 'Amount set aside',
    'challenges.fieldNote': 'Note',
    'challenges.submit': 'Confirm',
  },
});

export default function ChallengesScreen() {
  const t = useT();
  const [items, setItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [createSheet, setCreateSheet] = useState(false);
  const [entryTarget, setEntryTarget] = useState(null);

  const load = useCallback(async () => {
    try {
      setItems(await Challenges.list());
    } catch (e) {
      console.warn(e.message);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const create = async (v) => {
    if (!v.name) return;
    await Challenges.create({
      name: v.name,
      description: v.description || '',
      targetAmount: Number(v.target) || 0,
      color: v.color || palette[1],
    });
    load();
  };

  const addEntry = async (v) => {
    if (!v.amount) return;
    await Challenges.addEntry(entryTarget._id, { amount: Number(v.amount), note: v.note || '' });
    setEntryTarget(null);
    load();
  };

  const confirmDelete = (item) => {
    Alert.alert(t('challenges.deleteTitle'), t('challenges.deleteConfirm', { name: item.name }), [
      { text: t('challenges.cancel'), style: 'cancel' },
      {
        text: t('challenges.delete'),
        style: 'destructive',
        onPress: async () => {
          await Challenges.remove(item._id);
          load();
        },
      },
    ]);
  };

  const totalSetAside = items.reduce((s, c) => s + c.currentAmount, 0);

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
          <Text style={styles.bannerValue}>{euro(totalSetAside)}</Text>
          <Text style={styles.bannerSub}>
            {t('challenges.bannerSub', { count: items.filter((c) => c.status === 'active').length })}
          </Text>
        </GradientCard>

        {items.length === 0 ? (
          <Card>
            <EmptyState
              title={t('challenges.emptyTitle')}
              text={t('challenges.emptyText')}
            />
          </Card>
        ) : (
          items.map((item) => (
            <GoalCard
              key={item._id}
              title={item.name}
              subtitle={item.status === 'done' ? t('challenges.done') : item.description}
              current={item.currentAmount}
              target={item.targetAmount}
              color={item.color}
              onAdd={() => setEntryTarget(item)}
              onLongPress={() => confirmDelete(item)}
            />
          ))
        )}
      </Screen>

      <FormSheet
        visible={createSheet}
        title={t('challenges.createTitle')}
        fields={[
          { key: 'name', label: t('challenges.fieldName'), type: 'text', placeholder: t('challenges.fieldNamePlaceholder') },
          { key: 'description', label: t('challenges.fieldDescription'), type: 'text', placeholder: t('challenges.fieldOptional') },
          { key: 'target', label: t('challenges.fieldTarget'), type: 'number', placeholder: '0' },
          {
            key: 'color',
            label: t('challenges.fieldColor'),
            type: 'select',
            options: palette.map((c) => ({ label: ' ', value: c, color: c })),
          },
        ]}
        initial={{ color: palette[1] }}
        onSubmit={create}
        onClose={() => setCreateSheet(false)}
      />

      <FormSheet
        visible={!!entryTarget}
        title={entryTarget ? t('challenges.entryTitle', { name: entryTarget.name }) : ''}
        fields={[
          { key: 'amount', label: t('challenges.fieldAmount'), type: 'number', placeholder: '0' },
          { key: 'note', label: t('challenges.fieldNote'), type: 'text', placeholder: t('challenges.fieldOptional') },
        ]}
        submitLabel={t('challenges.submit')}
        onSubmit={addEntry}
        onClose={() => setEntryTarget(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  bannerLabel: { color: colors.textOnBrandMuted, fontSize: 14, fontWeight: '600' },
  bannerValue: { color: '#fff', fontFamily: 'Manrope_800ExtraBold', fontSize: 38, marginTop: 4, letterSpacing: -1 },
  bannerSub: { color: colors.textOnBrandMuted, fontSize: 13, fontWeight: '600', marginTop: 4 },
});
