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
import { Income, Charges, Categories, Transactions } from '../api';
import Button from '../components/Button';
import { useAuth } from '../AuthContext';

export default function BudgetScreen() {
  const { user, logout } = useAuth();
  const [income, setIncome] = useState([]);
  const [charges, setCharges] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [sheet, setSheet] = useState(null); // 'income' | 'charge' | 'category' | 'validate'
  const [editingCat, setEditingCat] = useState(null); // categorie en cours d'edition
  const [validating, setValidating] = useState(null); // categorie a valider ce mois

  // Mois courant : cle technique (YYYY-MM) pour tagguer les validations + libelle.
  const now = new Date();
  const MONTH_KEY = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const MONTH_LABEL = now.toLocaleDateString('fr-FR', { month: 'long' });

  const load = useCallback(async () => {
    try {
      const [i, c, cat, tx] = await Promise.all([
        Income.list(),
        Charges.list(),
        Categories.list(),
        Transactions.list('?limit=500'),
      ]);
      setIncome(i);
      setCharges(c);
      setCategories(cat);
      setTransactions(tx);
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

  // Categories avec un budget mensuel prevu (a valider chaque mois).
  const budgetCats = categories.filter((c) => Number(c.planned) > 0);
  const totalPlanned = budgetCats.reduce((s, c) => s + Number(c.planned), 0);

  // Validations du mois courant : categorie -> transaction (taguee budget_month).
  const paidByCat = new Map();
  for (const t of transactions) {
    const cid = t.category?._id || t.category;
    if (t.budgetMonth === MONTH_KEY && cid) paidByCat.set(cid, t);
  }

  const totalIncome = income.reduce((s, i) => (i.active ? s + i.amount : s), 0);
  const totalCharges = charges.reduce((s, c) => (c.active ? s + c.amount : s), 0);
  const dispo = totalIncome - totalCharges - totalPlanned;

  const closeSheet = () => {
    setSheet(null);
    setEditingCat(null);
    setValidating(null);
  };

  const openEditCat = (c) => {
    setEditingCat(c);
    setSheet('category');
  };

  const openValidate = (c) => {
    setValidating(c);
    setSheet('validate');
  };

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
      const payload = { name: v.name, color: v.color || palette[0], planned: Number(v.planned) || 0 };
      if (editingCat) await Categories.update(editingCat._id, payload);
      else await Categories.create(payload);
    } else if (sheet === 'validate' && validating) {
      // Valider = creer une vraie depense (impacte le solde / l'Accueil),
      // taguee pour ce mois afin de retrouver son etat "paye".
      await Transactions.create({
        type: 'expense',
        category: validating._id,
        amount: Number(v.amount) || Number(validating.planned),
        budgetMonth: MONTH_KEY,
        note: v.note || `Budget ${MONTH_LABEL}`,
      });
    }
    load();
  };

  const removeItem = (kind, item, after) => {
    Alert.alert('Supprimer', `Supprimer "${item.name}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          if (kind === 'income') await Income.remove(item._id);
          if (kind === 'charge') await Charges.remove(item._id);
          if (kind === 'category') await Categories.remove(item._id);
          after?.();
          load();
        },
      },
    ]);
  };

  const cancelValidate = (tx) => {
    if (!tx) return;
    Alert.alert('Annuler', 'Annuler la validation ? La depense liee sera supprimee.', [
      { text: 'Retour', style: 'cancel' },
      {
        text: 'Annuler la depense',
        style: 'destructive',
        onPress: async () => {
          await Transactions.remove(tx._id);
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
      title: editingCat ? 'Modifier la categorie' : 'Nouvelle categorie',
      fields: [
        { key: 'name', label: 'Nom', type: 'text', placeholder: 'Ex : Loisirs' },
        {
          key: 'planned',
          label: 'Budget mensuel prevu (laisser vide si aucun)',
          type: 'number',
          placeholder: '0',
        },
        {
          key: 'color',
          label: 'Couleur',
          type: 'select',
          options: palette.map((c) => ({ label: ' ', value: c, color: c })),
        },
      ],
      initial: editingCat
        ? {
            name: editingCat.name,
            color: editingCat.color,
            planned: editingCat.planned ? String(editingCat.planned) : '',
          }
        : { color: palette[0] },
      onDelete: editingCat ? () => removeItem('category', editingCat, closeSheet) : undefined,
    },
    validate: validating
      ? {
          title: `Valider ${validating.name}`,
          fields: [
            { key: 'amount', label: 'Montant reel paye', type: 'number', placeholder: String(validating.planned) },
            { key: 'note', label: 'Note', type: 'text', placeholder: 'Optionnel' },
          ],
          initial: { amount: String(validating.planned) },
        }
      : { title: '', fields: [] },
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
            {totalPlanned > 0 ? (
              <Text style={styles.heroNeg}>-{euro(totalPlanned)} budgets</Text>
            ) : null}
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

        {budgetCats.length > 0 ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={font.h2}>Depenses du mois</Text>
              <Text style={styles.monthLabel}>{MONTH_LABEL}</Text>
            </View>
            <Card padded={false} style={styles.listCard}>
              {budgetCats.map((c, idx) => (
                <BudgetRow
                  key={c._id}
                  cat={c}
                  tx={paidByCat.get(c._id)}
                  last={idx === budgetCats.length - 1}
                  onValidate={() => openValidate(c)}
                  onCancel={() => cancelValidate(paidByCat.get(c._id))}
                />
              ))}
            </Card>
          </>
        ) : null}

        <SectionHeader title="Categories" onAdd={() => setSheet('category')} />
        <Card padded={false} style={styles.listCard}>
          {categories.length === 0 ? (
            <EmptyState title="Aucune categorie" text="Cree des categories pour classer tes depenses." />
          ) : (
            categories.map((c, idx) => (
              <Row
                key={c._id}
                name={c.name}
                sub={c.planned ? `Budget ${euro(c.planned)}/mois` : 'Aucun budget'}
                amount={c.planned ? euro(c.planned) : ''}
                color={c.color}
                last={idx === categories.length - 1}
                onPress={() => openEditCat(c)}
                onLongPress={() => removeItem('category', c)}
              />
            ))
          )}
        </Card>

        <Text style={styles.hint}>
          Touche une categorie pour definir son budget mensuel. Appui long pour supprimer.
        </Text>

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
        onClose={closeSheet}
        onDelete={sheet ? sheetConfig[sheet].onDelete : undefined}
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

function Row({ name, sub, amount, color, last, onPress, onLongPress }) {
  return (
    <Pressable
      onPress={onPress}
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

// Ligne de budget mensuel : etat "a payer" (bouton Valider) ou "paye" (montant + ecart).
function BudgetRow({ cat, tx, last, onValidate, onCancel }) {
  const paid = !!tx;
  const actual = paid ? Number(tx.amount) : 0;
  const diff = paid ? Number(cat.planned) - actual : 0; // >0 economise, <0 depense en plus
  const sub = paid
    ? diff > 0
      ? `Paye ${euro(actual)} · economise ${euro(diff)}`
      : diff < 0
        ? `Paye ${euro(actual)} · +${euro(-diff)} de plus`
        : `Paye ${euro(actual)}`
    : `Prevu ${euro(cat.planned)}`;
  return (
    <View
      style={[styles.row, !last && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
    >
      <CategoryIcon name={cat.name} color={cat.color} size={42} />
      <View style={{ flex: 1 }}>
        <Text style={font.title} numberOfLines={1}>
          {cat.name}
        </Text>
        <Text style={[font.caption, paid && { color: diff < 0 ? colors.negative : colors.positive }]}>
          {sub}
        </Text>
      </View>
      {paid ? (
        <Pressable onPress={onCancel} hitSlop={8} style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Annuler</Text>
        </Pressable>
      ) : (
        <Pressable onPress={onValidate} hitSlop={8} style={styles.validateBtn}>
          <Text style={styles.validateText}>Valider</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  heroLabel: { color: colors.textOnBrandMuted, fontSize: 14, fontWeight: '600' },
  heroValue: { color: '#fff', fontFamily: 'Manrope_800ExtraBold', fontSize: 38, marginTop: 4, letterSpacing: -1 },
  heroRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.md },
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
  monthLabel: { ...font.label, textTransform: 'capitalize', color: colors.textMuted },
  listCard: { paddingHorizontal: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md },
  amount: { fontSize: 16, fontWeight: '700', color: colors.text },
  validateBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  validateText: { color: colors.textOnTeal, fontWeight: '700', fontSize: 13 },
  cancelBtn: {
    paddingHorizontal: spacing.md,
    height: 36,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: { color: colors.textMuted, fontWeight: '700', fontSize: 13 },
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
