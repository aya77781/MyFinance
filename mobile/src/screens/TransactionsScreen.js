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

// Sources possibles pour un revenu (independantes des categories de depense).
const INCOME_SOURCES = [
  { label: 'Salaire', value: 'Salaire' },
  { label: 'Menage', value: 'Menage' },
  { label: 'Babysitting', value: 'Babysitting' },
  { label: 'Tutoring', value: 'Tutoring' },
  { label: 'Freelance', value: 'Freelance' },
  { label: 'Competition', value: 'Competition' },
  { label: 'Autre', value: '__autre__' },
];

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
    const isIncome = v.type === 'income';
    // Pour un revenu, la "provenance" remplace la categorie de depense.
    const source = isIncome
      ? v.source === '__autre__'
        ? (v.sourceOther || '').trim() || 'Autre'
        : v.source || ''
      : '';
    await Transactions.create({
      type: v.type || 'expense',
      amount: Number(v.amount),
      category: isIncome ? null : v.category || null,
      note: v.note || '',
      source,
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

  // Champs dynamiques : un revenu n'a pas de categorie de depense mais une source.
  const fields = (v) => {
    const isIncome = v.type === 'income';
    return [
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
      isIncome
        ? {
            key: 'source',
            label: 'Source du revenu',
            type: 'select',
            options: INCOME_SOURCES,
          }
        : {
            key: 'category',
            label: 'Categorie',
            type: 'select',
            options: categories.map((c) => ({ label: c.name, value: c._id, color: c.color })),
          },
      isIncome && v.source === '__autre__'
        ? {
            key: 'sourceOther',
            label: 'Preciser la source',
            type: 'text',
            placeholder: 'Ex : remboursement, cadeau, vente',
          }
        : null,
      { key: 'note', label: 'Note', type: 'text', placeholder: 'Optionnel' },
    ].filter(Boolean);
  };

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
