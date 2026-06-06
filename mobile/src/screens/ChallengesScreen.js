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

export default function ChallengesScreen() {
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
    Alert.alert('Supprimer', `Supprimer "${item.name}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
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
        title="Challenges"
        subtitle="Mettre plus de cote"
        action={<AddButton onPress={() => setCreateSheet(true)} />}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          load();
        }}
      >
        <GradientCard style={{ marginBottom: spacing.lg }}>
          <Text style={styles.bannerLabel}>Cumul des challenges</Text>
          <Text style={styles.bannerValue}>{euro(totalSetAside)}</Text>
          <Text style={styles.bannerSub}>
            {items.filter((c) => c.status === 'active').length} challenge(s) en cours
          </Text>
        </GradientCard>

        {items.length === 0 ? (
          <Card>
            <EmptyState
              title="Aucun challenge"
              text="Lance un defi (no-spend, 52 semaines...) pour booster ton epargne."
            />
          </Card>
        ) : (
          items.map((item) => (
            <GoalCard
              key={item._id}
              title={item.name}
              subtitle={item.status === 'done' ? 'Termine' : item.description}
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
        title="Nouveau challenge"
        fields={[
          { key: 'name', label: 'Nom', type: 'text', placeholder: 'Ex : No-spend 30 jours' },
          { key: 'description', label: 'Description', type: 'text', placeholder: 'Optionnel' },
          { key: 'target', label: 'Objectif', type: 'number', placeholder: '0' },
          {
            key: 'color',
            label: 'Couleur',
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
        title={entryTarget ? `Progres : ${entryTarget.name}` : ''}
        fields={[
          { key: 'amount', label: 'Montant mis de cote', type: 'number', placeholder: '0' },
          { key: 'note', label: 'Note', type: 'text', placeholder: 'Optionnel' },
        ]}
        submitLabel="Valider"
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
