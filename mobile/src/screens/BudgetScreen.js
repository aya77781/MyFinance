import { useState, useCallback } from 'react';
import { View, Text, Pressable, Alert, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import Screen from '../components/Screen';
import Card from '../components/Card';
import GradientCard from '../components/GradientCard';
import FormSheet from '../components/FormSheet';
import CategoryIcon from '../components/CategoryIcon';
import EmptyState from '../components/EmptyState';
import { colors, spacing, font, radius, palette } from '../theme';
import { euro } from '../format';
import { Income, Charges, Categories } from '../api';
import Button from '../components/Button';
import { useAuth } from '../AuthContext';

export default function BudgetScreen() {
  const { user, logout } = useAuth();
  const [income, setIncome] = useState([]);
  const [charges, setCharges] = useState([]);
  const [categories, setCategories] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [sheet, setSheet] = useState(null); // 'income' | 'charge' | 'category'

  const load = useCallback(async () => {
    try {
      const [i, c, cat] = await Promise.all([Income.list(), Charges.list(), Categories.list()]);
      setIncome(i);
      setCharges(c);
      setCategories(cat);
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

  const totalIncome = income.reduce((s, i) => (i.active ? s + i.amount : s), 0);
  const totalCharges = charges.reduce((s, c) => (c.active ? s + c.amount : s), 0);
  const dispo = totalIncome - totalCharges;

  const submit = async (v) => {
    if (sheet === 'income') {
      await Income.create({ name: v.name, amount: Number(v.amount), dayOfMonth: Number(v.day) || 1 });
    } else if (sheet === 'charge') {
      await Charges.create({
        name: v.name,
        amount: Number(v.amount),
        category: v.category || null,
        dayOfMonth: Number(v.day) || 1,
      });
    } else if (sheet === 'category') {
      await Categories.create({ name: v.name, color: v.color || palette[0] });
    }
    setSheet(null);
    load();
  };

  const removeItem = (kind, item) => {
    Alert.alert('Supprimer', `Supprimer "${item.name}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          if (kind === 'income') await Income.remove(item._id);
          if (kind === 'charge') await Charges.remove(item._id);
          if (kind === 'category') await Categories.remove(item._id);
          load();
        },
      },
    ]);
  };

  const sheetConfig = {
    income: {
      title: 'Nouveau revenu stable',
      fields: [
        { key: 'name', label: 'Nom', type: 'text', placeholder: 'Ex : Salaire' },
        { key: 'amount', label: 'Montant mensuel', type: 'number', placeholder: '0' },
        { key: 'day', label: 'Jour du mois', type: 'number', placeholder: '1' },
      ],
    },
    charge: {
      title: 'Nouvelle charge fixe',
      fields: [
        { key: 'name', label: 'Nom', type: 'text', placeholder: 'Ex : Loyer' },
        { key: 'amount', label: 'Montant mensuel', type: 'number', placeholder: '0' },
        {
          key: 'category',
          label: 'Categorie',
          type: 'select',
          options: categories.map((c) => ({ label: c.name, value: c._id, color: c.color })),
        },
        { key: 'day', label: 'Jour du mois', type: 'number', placeholder: '1' },
      ],
    },
    category: {
      title: 'Nouvelle categorie',
      fields: [
        { key: 'name', label: 'Nom', type: 'text', placeholder: 'Ex : Loisirs' },
        {
          key: 'color',
          label: 'Couleur',
          type: 'select',
          options: palette.map((c) => ({ label: ' ', value: c, color: c })),
        },
      ],
      initial: { color: palette[0] },
    },
  };

  return (
    <>
      <Screen
        title="Budget"
        subtitle="Revenus & charges"
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          load();
        }}
      >
        {/* Resume mensuel previsionnel */}
        <GradientCard>
          <Text style={styles.heroLabel}>Reste a vivre previsionnel</Text>
          <Text style={styles.heroValue}>{euro(dispo)}</Text>
          <View style={styles.heroRow}>
            <Text style={styles.heroPos}>+{euro(totalIncome)} revenus</Text>
            <Text style={styles.heroNeg}>-{euro(totalCharges)} charges</Text>
          </View>
        </GradientCard>

        <SectionHeader title="Revenus stables" onAdd={() => setSheet('income')} />
        <Card padded={false} style={styles.listCard}>
          {income.length === 0 ? (
            <EmptyState title="Aucun revenu" text="Ajoute ton salaire ou tes revenus recurrents." />
          ) : (
            income.map((i, idx) => (
              <Row
                key={i._id}
                name={i.name}
                sub={`Le ${i.dayOfMonth} du mois`}
                amount={euro(i.amount)}
                color={colors.positive}
                last={idx === income.length - 1}
                onLongPress={() => removeItem('income', i)}
              />
            ))
          )}
        </Card>

        <SectionHeader title="Charges fixes" onAdd={() => setSheet('charge')} />
        <Card padded={false} style={styles.listCard}>
          {charges.length === 0 ? (
            <EmptyState title="Aucune charge" text="Ajoute ton loyer, tes abonnements..." />
          ) : (
            charges.map((c, idx) => (
              <Row
                key={c._id}
                name={c.name}
                sub={c.category?.name || `Le ${c.dayOfMonth} du mois`}
                amount={`-${euro(c.amount)}`}
                color={c.category?.color || colors.negative}
                last={idx === charges.length - 1}
                onLongPress={() => removeItem('charge', c)}
              />
            ))
          )}
        </Card>

        <SectionHeader title="Categories" onAdd={() => setSheet('category')} />
        <Card padded={false} style={styles.listCard}>
          {categories.length === 0 ? (
            <EmptyState title="Aucune categorie" text="Cree des categories pour classer tes depenses." />
          ) : (
            categories.map((c, idx) => (
              <Row
                key={c._id}
                name={c.name}
                color={c.color}
                last={idx === categories.length - 1}
                onLongPress={() => removeItem('category', c)}
              />
            ))
          )}
        </Card>

        <Text style={styles.hint}>Astuce : appui long sur une ligne pour la supprimer.</Text>

        {/* Compte */}
        <View style={styles.account}>
          <View style={{ flex: 1 }}>
            <Text style={font.label}>Connecte en tant que</Text>
            <Text style={font.title} numberOfLines={1}>
              {user?.email || ''}
            </Text>
          </View>
        </View>
        <Button title="Se deconnecter" variant="ghost" onPress={logout} />
      </Screen>

      <FormSheet
        visible={!!sheet}
        title={sheet ? sheetConfig[sheet].title : ''}
        fields={sheet ? sheetConfig[sheet].fields : []}
        initial={sheet ? sheetConfig[sheet].initial || {} : {}}
        onSubmit={submit}
        onClose={() => setSheet(null)}
      />
    </>
  );
}

function SectionHeader({ title, onAdd }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={font.h2}>{title}</Text>
      <Pressable onPress={onAdd} hitSlop={8}>
        <Text style={styles.add}>Ajouter</Text>
      </Pressable>
    </View>
  );
}

function Row({ name, sub, amount, color, last, onLongPress }) {
  return (
    <Pressable
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.row,
        !last && { borderBottomWidth: 1, borderBottomColor: colors.border },
        pressed && { opacity: 0.6 },
      ]}
    >
      <CategoryIcon name={name} color={color} size={42} />
      <View style={{ flex: 1 }}>
        <Text style={font.title} numberOfLines={1}>
          {name}
        </Text>
        {sub ? <Text style={font.caption}>{sub}</Text> : null}
      </View>
      {amount ? <Text style={styles.amount}>{amount}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  heroLabel: { color: colors.textOnBrandMuted, fontSize: 14, fontWeight: '600' },
  heroValue: { color: '#fff', fontFamily: 'Manrope_800ExtraBold', fontSize: 38, marginTop: 4, letterSpacing: -1 },
  heroRow: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.md },
  heroPos: { color: '#9FE7C4', fontWeight: '700', fontSize: 13 },
  heroNeg: { color: '#FFB3BE', fontWeight: '700', fontSize: 13 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  add: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  listCard: { paddingHorizontal: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md },
  amount: { fontSize: 16, fontWeight: '700', color: colors.text },
  hint: { ...font.caption, textAlign: 'center', marginTop: spacing.xl },
  account: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
});
