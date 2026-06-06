import { useState, useCallback } from 'react';
import { View, Text, Alert } from 'react-native';
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
import { Savings } from '../api';

export default function SavingsScreen() {
  const [items, setItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [createSheet, setCreateSheet] = useState(false);
  const [contribTarget, setContribTarget] = useState(null);

  const load = useCallback(async () => {
    try {
      setItems(await Savings.list());
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

  const total = items.reduce((s, v) => s + v.currentAmount, 0);

  const create = async (v) => {
    if (!v.name) return;
    await Savings.create({
      name: v.name,
      targetAmount: Number(v.target) || 0,
      color: v.color || palette[0],
    });
    load();
  };

  const contribute = async (v) => {
    if (!v.amount) return;
    await Savings.contribute(contribTarget._id, { amount: Number(v.amount), note: v.note || '' });
    setContribTarget(null);
    load();
  };

  const confirmDelete = (item) => {
    Alert.alert('Supprimer', `Supprimer "${item.name}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          await Savings.remove(item._id);
          load();
        },
      },
    ]);
  };

  return (
    <>
      <Screen
        title="Epargne"
        subtitle="Tes pochettes"
        action={<AddButton onPress={() => setCreateSheet(true)} />}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          load();
        }}
      >
        <GradientCard style={{ marginBottom: spacing.lg }}>
          <Text style={styles.totalLabel}>Total epargne</Text>
          <Text style={styles.totalValue}>{euro(total)}</Text>
          <Text style={styles.totalSub}>{items.length} pochette(s)</Text>
        </GradientCard>

        {items.length === 0 ? (
          <Card>
            <EmptyState title="Aucune pochette" text="Cree un objectif d'epargne pour commencer a mettre de cote." />
          </Card>
        ) : (
          items.map((item) => (
            <GoalCard
              key={item._id}
              title={item.name}
              current={item.currentAmount}
              target={item.targetAmount}
              color={item.color}
              onAdd={() => setContribTarget(item)}
              onLongPress={() => confirmDelete(item)}
            />
          ))
        )}
      </Screen>

      <FormSheet
        visible={createSheet}
        title="Nouvelle pochette"
        fields={[
          { key: 'name', label: 'Nom', type: 'text', placeholder: 'Ex : Vacances' },
          { key: 'target', label: 'Objectif', type: 'number', placeholder: '0' },
          {
            key: 'color',
            label: 'Couleur',
            type: 'select',
            options: palette.map((c) => ({ label: ' ', value: c, color: c })),
          },
        ]}
        initial={{ color: palette[2] }}
        onSubmit={create}
        onClose={() => setCreateSheet(false)}
      />

      <FormSheet
        visible={!!contribTarget}
        title={contribTarget ? `Ajouter sur ${contribTarget.name}` : ''}
        fields={[
          { key: 'amount', label: 'Montant (negatif pour retirer)', type: 'number', placeholder: '0' },
          { key: 'note', label: 'Note', type: 'text', placeholder: 'Optionnel' },
        ]}
        submitLabel="Valider"
        onSubmit={contribute}
        onClose={() => setContribTarget(null)}
      />
    </>
  );
}

const styles = {
  totalLabel: { color: colors.textOnBrandMuted, fontSize: 14, fontWeight: '600' },
  totalValue: { color: '#fff', fontFamily: 'Manrope_800ExtraBold', fontSize: 38, marginTop: 4, letterSpacing: -1 },
  totalSub: { color: colors.textOnBrandMuted, fontSize: 13, fontWeight: '600', marginTop: 4 },
};
