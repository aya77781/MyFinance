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
import { glyphForCategory } from '../components/Glyph';

// Sources possibles pour un revenu (independantes des categories de depense).
const INCOME_SOURCES = [
  { label: 'Salaire', value: 'Salaire', glyph: 'briefcase' },
  { label: 'Menage', value: 'Menage', glyph: 'sparkle' },
  { label: 'Babysitting', value: 'Babysitting', glyph: 'baby' },
  { label: 'Tutoring', value: 'Tutoring', glyph: 'book' },
  { label: 'Freelance', value: 'Freelance', glyph: 'laptop' },
  { label: 'Competition', value: 'Competition', glyph: 'trophy' },
  { label: 'Autre', value: '__autre__', glyph: 'tag' },
];

export default function TransactionsScreen() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [editing, setEditing] = useState(null); // transaction en cours d'edition

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

  const openNew = () => {
    setEditing(null);
    setSheet(true);
  };

  const openEdit = (tx) => {
    setEditing(tx);
    setSheet(true);
  };

  const closeSheet = () => {
    setSheet(false);
    setEditing(null);
  };

  const save = async (v) => {
    if (!v.amount) return;
    const isIncome = v.type === 'income';
    // Pour un revenu, la "provenance" remplace la categorie de depense.
    const source = isIncome
      ? v.source === '__autre__'
        ? (v.sourceOther || '').trim() || 'Autre'
        : v.source || ''
      : '';
    const payload = {
      type: v.type || 'expense',
      amount: Number(v.amount),
      category: isIncome ? null : v.category || null,
      note: v.note || '',
      source,
    };
    if (editing) await Transactions.update(editing._id, payload);
    else await Transactions.create(payload);
    load();
  };

  const confirmDelete = (tx, after) => {
    Alert.alert('Supprimer', 'Supprimer cette transaction ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          await Transactions.remove(tx._id);
          after?.();
          load();
        },
      },
    ]);
  };

  // Valeurs initiales du formulaire selon le mode (creation ou edition).
  const initialValues = editing
    ? (() => {
        const isIncome = editing.type === 'income';
        const base = {
          type: editing.type,
          amount: String(editing.amount),
          note: editing.note || '',
        };
        if (isIncome) {
          const known = INCOME_SOURCES.some((s) => s.value === editing.source);
          if (known) {
            base.source = editing.source;
          } else {
            base.source = '__autre__';
            base.sourceOther = editing.source || '';
          }
        } else {
          base.category = editing.category?._id || null;
        }
        return base;
      })()
    : { type: 'expense' };

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
            options: categories.map((c) => ({
              label: c.name,
              value: c._id,
              color: c.color,
              glyph: glyphForCategory(c.name),
            })),
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
        action={<AddButton onPress={openNew} />}
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
                    <TransactionRow
                      tx={tx}
                      onPress={() => openEdit(tx)}
                      onLongPress={() => confirmDelete(tx)}
                    />
                  </View>
                ))}
              </Card>
            </View>
          ))
        )}
      </Screen>

      <FormSheet
        visible={sheet}
        title={editing ? 'Modifier la transaction' : 'Nouvelle transaction'}
        fields={fields}
        initial={initialValues}
        onSubmit={save}
        onClose={closeSheet}
        onDelete={editing ? () => confirmDelete(editing, closeSheet) : undefined}
      />
    </>
  );
}

const styles = StyleSheet.create({
  day: { ...font.label, textTransform: 'capitalize', marginBottom: spacing.sm, marginLeft: spacing.xs },
});
