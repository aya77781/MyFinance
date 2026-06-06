import { useState, useCallback } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import Screen from '../components/Screen';
import Card from '../components/Card';
import AddButton from '../components/AddButton';
import TransactionRow from '../components/TransactionRow';
import FormSheet from '../components/FormSheet';
import EmptyState from '../components/EmptyState';
import { colors, spacing, font } from '../theme';
import { Transactions, Categories } from '../api';

export default function TransactionsScreen() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [sheet, setSheet] = useState(false);

  const load = useCallback(async () => {
    try {
      const [tx, cats] = await Promise.all([Transactions.list('?limit=200'), Categories.list()]);
      setItems(tx);
      setCategories(cats);
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
    if (!v.amount) return;
    await Transactions.create({
      type: v.type || 'expense',
      amount: Number(v.amount),
      category: v.category || null,
      note: v.note || '',
      source: v.source || '',
    });
    load();
  };

  const confirmDelete = (tx) => {
    Alert.alert('Supprimer', 'Supprimer cette transaction ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          await Transactions.remove(tx._id);
          load();
        },
      },
    ]);
  };

  const fields = [
    {
      key: 'type',
      label: 'Type',
      type: 'select',
      options: [
        { label: 'Depense', value: 'expense' },
        { label: 'Revenu', value: 'income' },
      ],
    },
    { key: 'amount', label: 'Montant', type: 'number', placeholder: '0' },
    {
      key: 'category',
      label: 'Categorie',
      type: 'select',
      options: categories.map((c) => ({ label: c.name, value: c._id, color: c.color })),
    },
    { key: 'note', label: 'Note', type: 'text', placeholder: 'Optionnel' },
    { key: 'source', label: 'Provenance (revenu)', type: 'text', placeholder: 'Ex : freelance, revente' },
  ];

  // Regroupe par jour pour un rendu type Revolut.
  const grouped = items.reduce((acc, tx) => {
    const day = new Date(tx.date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    (acc[day] = acc[day] || []).push(tx);
    return acc;
  }, {});

  return (
    <>
      <Screen
        title="Transactions"
        subtitle="Tes mouvements"
        action={<AddButton onPress={() => setSheet(true)} />}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          load();
        }}
      >
        {items.length === 0 ? (
          <Card>
            <EmptyState title="Aucune transaction" text="Appuie sur + pour ajouter ta premiere depense ou revenu." />
          </Card>
        ) : (
          Object.entries(grouped).map(([day, list]) => (
            <View key={day} style={{ marginBottom: spacing.lg }}>
              <Text style={styles.day}>{day}</Text>
              <Card padded={false} style={{ paddingHorizontal: spacing.lg }}>
                {list.map((tx, i) => (
                  <View
                    key={tx._id}
                    style={
                      i < list.length - 1
                        ? { borderBottomWidth: 1, borderBottomColor: colors.border }
                        : null
                    }
                  >
                    <TransactionRow tx={tx} onLongPress={() => confirmDelete(tx)} />
                  </View>
                ))}
              </Card>
            </View>
          ))
        )}
      </Screen>

      <FormSheet
        visible={sheet}
        title="Nouvelle transaction"
        fields={fields}
        initial={{ type: 'expense' }}
        onSubmit={create}
        onClose={() => setSheet(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  day: { ...font.label, textTransform: 'capitalize', marginBottom: spacing.sm, marginLeft: spacing.xs },
});
