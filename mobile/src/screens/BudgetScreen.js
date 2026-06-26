import { useState, useCallback } from 'react';
import { View, Text, Pressable, Alert, StyleSheet, ScrollView, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import Screen from '../components/Screen';
import Card from '../components/Card';
import GradientCard from '../components/GradientCard';
import FormSheet from '../components/FormSheet';
import CategoryIcon from '../components/CategoryIcon';
import TimelineChart from '../components/TimelineChart';
import DonutChart from '../components/DonutChart';
import { glyphForCategory } from '../components/Glyph';
import EmptyState from '../components/EmptyState';
import { colors, spacing, font, radius, palette, ff } from '../theme';
import { euro, getLocale } from '../format';
import { Income, Charges, Categories, Transactions } from '../api';
import Button from '../components/Button';
import { useAuth } from '../AuthContext';
import { useProfile } from '../ProfileContext';
import { useT, registerTranslations, useLang, LANGUAGES } from '../i18n';

registerTranslations({
  fr: {
    'budget.title': 'Budget',
    'budget.subtitle': 'Revenus & charges',
    'budget.remaining': 'Reste a vivre previsionnel',
    'budget.incomeSummary': '+{a} revenus',
    'budget.chargesSummary': '-{a} charges',
    'budget.budgetsSummary': '-{a} budgets',
    'budget.stableIncome': 'Revenus stables',
    'budget.noIncome': 'Aucun revenu',
    'budget.noIncomeText': 'Ajoute ton salaire ou tes revenus recurrents.',
    'budget.fixedCharges': 'Charges fixes',
    'budget.noCharges': 'Aucune charge',
    'budget.noChargesText': 'Ajoute ton loyer, tes abonnements...',
    'budget.monthExpenses': 'Depenses du mois',
    'budget.expenseCategories': 'Categories de depense',
    'budget.noCategory': 'Aucune categorie',
    'budget.noExpenseCatText': 'Cree des categories pour classer tes depenses.',
    'budget.incomeCategories': 'Categories de revenu',
    'budget.noIncomeCatText': 'Cree des categories pour classer tes revenus.',
    'budget.hint': 'Touche une categorie pour la modifier (et definir un budget). Appui long pour supprimer.',
    'budget.timeTracking': 'Suivi dans le temps',
    'budget.month': 'Mois',
    'budget.year': 'Annee',
    'budget.cumulativeTotal': 'Total cumule (reste de tous les mois)',
    'budget.netPositive': 'Net positif',
    'budget.netNegative': 'Net negatif',
    'budget.cumulative': 'Cumul',
    'budget.noData': 'Pas encore de donnees.',
    'budget.expensesOverTime': 'Depenses dans le temps',
    'budget.perYear': 'Par annee',
    'budget.perMonth': 'Par mois',
    'budget.expenseBreakdown': 'Repartition des depenses',
    'budget.total': 'Total',
    'budget.breakdownEmpty': 'Ajoute des charges fixes ou un budget pour voir la repartition.',
    'budget.loggedInAs': 'Connecte en tant que',
    'budget.logout': 'Se deconnecter',
    'budget.noBudget': 'Aucun budget',
    'budget.budgetPerMonth': 'Budget {a}/mois',
    'budget.onDayOfMonth': 'Le {d} du mois',
    'budget.incomeSub': '{name} · le {d}',
    'budget.paidSaved': 'Paye {a} · economise {b}',
    'budget.paidMore': 'Paye {a} · +{b} de plus',
    'budget.paid': 'Paye {a}',
    'budget.planned': 'Prevu {a}',
    'budget.validate': 'Valider',
    'budget.cancel': 'Annuler',
    'budget.add': 'Ajouter',
    'budget.defaultNote': 'Budget {month}',
    // Sheets
    'budget.sheet.newIncome': 'Nouveau revenu stable',
    'budget.sheet.name': 'Nom',
    'budget.sheet.namePhSalary': 'Ex : Salaire mars',
    'budget.sheet.incomeCategory': 'Categorie de revenu',
    'budget.sheet.monthlyAmount': 'Montant mensuel',
    'budget.sheet.dayOfMonth': 'Jour du mois',
    'budget.sheet.newCharge': 'Nouvelle charge fixe',
    'budget.sheet.namePhRent': 'Ex : Loyer',
    'budget.sheet.category': 'Categorie',
    'budget.sheet.editCategory': 'Modifier la categorie',
    'budget.sheet.newCategory': 'Nouvelle categorie',
    'budget.sheet.namePhLeisure': 'Ex : Loisirs',
    'budget.sheet.plannedBudget': 'Budget mensuel prevu (laisser vide si aucun)',
    'budget.sheet.color': 'Couleur',
    'budget.sheet.editIncomeCategory': 'Modifier la categorie de revenu',
    'budget.sheet.newIncomeCategory': 'Nouvelle categorie de revenu',
    'budget.sheet.namePhIncomeCat': 'Ex : Salaire, Freelance',
    'budget.sheet.validateTitle': 'Valider {name}',
    'budget.sheet.actualPaid': 'Montant reel paye',
    'budget.sheet.note': 'Note',
    'budget.sheet.notePh': 'Optionnel',
    // Alerts
    'budget.alert.deleteTitle': 'Supprimer',
    'budget.alert.deleteMsg': 'Supprimer "{name}" ?',
    'budget.alert.cancelTitle': 'Annuler',
    'budget.alert.cancelMsg': 'Annuler la validation ? La depense liee sera supprimee.',
    'budget.alert.back': 'Retour',
    'budget.alert.cancelExpense': 'Annuler la depense',
  },
  en: {
    'budget.title': 'Budget',
    'budget.subtitle': 'Income & expenses',
    'budget.remaining': 'Projected disposable income',
    'budget.incomeSummary': '+{a} income',
    'budget.chargesSummary': '-{a} expenses',
    'budget.budgetsSummary': '-{a} budgets',
    'budget.stableIncome': 'Stable income',
    'budget.noIncome': 'No income',
    'budget.noIncomeText': 'Add your salary or recurring income.',
    'budget.fixedCharges': 'Fixed expenses',
    'budget.noCharges': 'No expenses',
    'budget.noChargesText': 'Add your rent, subscriptions...',
    'budget.monthExpenses': 'This month’s expenses',
    'budget.expenseCategories': 'Expense categories',
    'budget.noCategory': 'No category',
    'budget.noExpenseCatText': 'Create categories to sort your expenses.',
    'budget.incomeCategories': 'Income categories',
    'budget.noIncomeCatText': 'Create categories to sort your income.',
    'budget.hint': 'Tap a category to edit it (and set a budget). Long-press to delete.',
    'budget.timeTracking': 'Tracking over time',
    'budget.month': 'Month',
    'budget.year': 'Year',
    'budget.cumulativeTotal': 'Cumulative total (carryover from all months)',
    'budget.netPositive': 'Net positive',
    'budget.netNegative': 'Net negative',
    'budget.cumulative': 'Cumulative',
    'budget.noData': 'No data yet.',
    'budget.expensesOverTime': 'Expenses over time',
    'budget.perYear': 'Per year',
    'budget.perMonth': 'Per month',
    'budget.expenseBreakdown': 'Expense breakdown',
    'budget.total': 'Total',
    'budget.breakdownEmpty': 'Add fixed expenses or a budget to see the breakdown.',
    'budget.loggedInAs': 'Logged in as',
    'budget.logout': 'Log out',
    'budget.noBudget': 'No budget',
    'budget.budgetPerMonth': 'Budget {a}/month',
    'budget.onDayOfMonth': 'On day {d} of the month',
    'budget.incomeSub': '{name} · on day {d}',
    'budget.paidSaved': 'Paid {a} · saved {b}',
    'budget.paidMore': 'Paid {a} · +{b} more',
    'budget.paid': 'Paid {a}',
    'budget.planned': 'Planned {a}',
    'budget.validate': 'Confirm',
    'budget.cancel': 'Cancel',
    'budget.add': 'Add',
    'budget.defaultNote': 'Budget {month}',
    // Sheets
    'budget.sheet.newIncome': 'New stable income',
    'budget.sheet.name': 'Name',
    'budget.sheet.namePhSalary': 'E.g. March salary',
    'budget.sheet.incomeCategory': 'Income category',
    'budget.sheet.monthlyAmount': 'Monthly amount',
    'budget.sheet.dayOfMonth': 'Day of the month',
    'budget.sheet.newCharge': 'New fixed expense',
    'budget.sheet.namePhRent': 'E.g. Rent',
    'budget.sheet.category': 'Category',
    'budget.sheet.editCategory': 'Edit category',
    'budget.sheet.newCategory': 'New category',
    'budget.sheet.namePhLeisure': 'E.g. Leisure',
    'budget.sheet.plannedBudget': 'Planned monthly budget (leave empty if none)',
    'budget.sheet.color': 'Color',
    'budget.sheet.editIncomeCategory': 'Edit income category',
    'budget.sheet.newIncomeCategory': 'New income category',
    'budget.sheet.namePhIncomeCat': 'E.g. Salary, Freelance',
    'budget.sheet.validateTitle': 'Confirm {name}',
    'budget.sheet.actualPaid': 'Actual amount paid',
    'budget.sheet.note': 'Note',
    'budget.sheet.notePh': 'Optional',
    // Alerts
    'budget.alert.deleteTitle': 'Delete',
    'budget.alert.deleteMsg': 'Delete "{name}"?',
    'budget.alert.cancelTitle': 'Cancel',
    'budget.alert.cancelMsg': 'Cancel the confirmation? The linked expense will be deleted.',
    'budget.alert.back': 'Back',
    'budget.alert.cancelExpense': 'Cancel the expense',
  },
});

export default function BudgetScreen() {
  const t = useT();
  const { lang, setLang } = useLang();
  const { photo, pickPhoto, removePhoto } = useProfile();
  const { user, logout } = useAuth();

  const onPickPhoto = async () => {
    const res = await pickPhoto();
    if (!res.ok && res.reason === 'permission') {
      Alert.alert(t('account.photo'), t('account.permissionDenied'));
    }
  };
  const initial = ((user?.name || user?.email || '?').trim()[0] || '?').toUpperCase();
  const [income, setIncome] = useState([]);
  const [charges, setCharges] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [sheet, setSheet] = useState(null); // 'income' | 'charge' | 'category' | 'validate'
  const [editingCat, setEditingCat] = useState(null); // categorie en cours d'edition
  const [validating, setValidating] = useState(null); // categorie a valider ce mois
  const [timeMode, setTimeMode] = useState('month'); // 'month' | 'year'

  // Mois courant : cle technique (YYYY-MM) pour tagguer les validations + libelle.
  const now = new Date();
  const MONTH_KEY = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const MONTH_LABEL = now.toLocaleDateString(getLocale(), { month: 'long' });

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

  // Separation depense / revenu.
  const expenseCats = categories.filter((c) => c.type !== 'income');
  const incomeCats = categories.filter((c) => c.type === 'income');
  const incomeCatById = new Map(incomeCats.map((c) => [c._id, c]));

  // Categories de depense avec un budget mensuel prevu (a valider chaque mois).
  const budgetCats = expenseCats.filter((c) => Number(c.planned) > 0);
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

  // --- Suivi dans le temps : net par periode + cumul (config stable projetee). ---
  const timeline = (() => {
    const curY = now.getFullYear();
    const curM = now.getMonth();
    // Premier mois avec un mouvement (sinon mois courant).
    let startY = curY;
    let startM = curM;
    for (const t of transactions) {
      const d = new Date(t.date);
      if (isNaN(d)) continue;
      if (d.getFullYear() < startY || (d.getFullYear() === startY && d.getMonth() < startM)) {
        startY = d.getFullYear();
        startM = d.getMonth();
      }
    }
    // Agregation des transactions reelles par mois.
    const agg = {};
    for (const t of transactions) {
      const d = new Date(t.date);
      if (isNaN(d)) continue;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const b = (agg[key] = agg[key] || { income: 0, expense: 0 });
      if (t.type === 'income') b.income += Number(t.amount || 0);
      else b.expense += Number(t.amount || 0);
    }
    // Liste des mois de la periode (borne a 60 par securite).
    const months = [];
    let y = startY;
    let m = startM;
    while ((y < curY || (y === curY && m <= curM)) && months.length < 60) {
      months.push({ y, m });
      m += 1;
      if (m > 11) {
        m = 0;
        y += 1;
      }
    }
    let run = 0;
    const monthly = months.map(({ y: yy, m: mm }) => {
      const a = agg[`${yy}-${mm}`] || { income: 0, expense: 0 };
      // Depenses du mois = charges fixes (config) + depenses reelles taggees ce mois.
      const expense = totalCharges + a.expense;
      const net = totalIncome - totalCharges + a.income - a.expense;
      run += net;
      return {
        y: yy,
        net,
        expense,
        cumulative: run,
        label: new Date(yy, mm, 1).toLocaleDateString(getLocale(), { month: 'short' }),
      };
    });
    // Vue annuelle : net = somme des mois de l'annee, cumul = cumul a la fin de l'annee.
    const ymap = new Map();
    for (const d of monthly) {
      const e = ymap.get(d.y) || { y: d.y, net: 0, expense: 0, cumulative: 0 };
      e.net += d.net;
      e.expense += d.expense;
      e.cumulative = d.cumulative;
      ymap.set(d.y, e);
    }
    return {
      total: run,
      month: monthly.slice(-12).map((d) => ({ label: d.label, net: d.net, expense: d.expense, cumulative: d.cumulative })),
      year: [...ymap.values()].map((e) => ({
        label: String(e.y),
        net: e.net,
        expense: e.expense,
        cumulative: e.cumulative,
      })),
    };
  })();
  const timeData = timeMode === 'year' ? timeline.year : timeline.month;
  const expenseBars = timeData.map((d) => ({ label: d.label, value: d.expense }));

  // Repartition des depenses mensuelles par categorie (charges fixes + budgets prevus).
  const expenseBreakdown = (() => {
    const map = new Map();
    const add = (name, amount, color) => {
      if (!amount) return;
      const e = map.get(name) || { name, total: 0, color };
      e.total += amount;
      if (color) e.color = color;
      map.set(name, e);
    };
    charges.forEach((c) =>
      c.active !== false && add(c.category?.name || c.name, Number(c.amount) || 0, c.category?.color)
    );
    budgetCats.forEach((c) => add(c.name, Number(c.planned) || 0, c.color));
    const list = [...map.values()].sort((a, b) => b.total - a.total);
    // Couleur de repli (palette) pour les entrees sans couleur de categorie.
    return list.map((e, i) => ({ ...e, color: e.color || palette[i % palette.length] }));
  })();
  const expenseTotal = expenseBreakdown.reduce((s, e) => s + e.total, 0);
  const donutExpense = expenseBreakdown.map((e) => ({ value: e.total, color: e.color }));

  const closeSheet = () => {
    setSheet(null);
    setEditingCat(null);
    setValidating(null);
  };

  const openEditCat = (c) => {
    setEditingCat(c);
    setSheet(c.type === 'income' ? 'incomeCategory' : 'category');
  };

  const openValidate = (c) => {
    setValidating(c);
    setSheet('validate');
  };

  const submit = async (v) => {
    if (sheet === 'income') {
      await Income.create({
        name: v.name,
        amount: Number(v.amount),
        dayOfMonth: Number(v.day) || 1,
        category: v.category || null,
      });
    } else if (sheet === 'charge') {
      await Charges.create({
        name: v.name,
        amount: Number(v.amount),
        category: v.category || null,
        dayOfMonth: Number(v.day) || 1,
      });
    } else if (sheet === 'category') {
      const payload = {
        name: v.name,
        color: v.color || palette[0],
        planned: Number(v.planned) || 0,
        type: 'expense',
      };
      if (editingCat) await Categories.update(editingCat._id, payload);
      else await Categories.create(payload);
    } else if (sheet === 'incomeCategory') {
      const payload = { name: v.name, color: v.color || palette[0], type: 'income' };
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
        note: v.note || t('budget.defaultNote', { month: MONTH_LABEL }),
      });
    }
    load();
  };

  const removeItem = (kind, item, after) => {
    Alert.alert(t('budget.alert.deleteTitle'), t('budget.alert.deleteMsg', { name: item.name }), [
      { text: t('budget.cancel'), style: 'cancel' },
      {
        text: t('budget.alert.deleteTitle'),
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
    Alert.alert(t('budget.alert.cancelTitle'), t('budget.alert.cancelMsg'), [
      { text: t('budget.alert.back'), style: 'cancel' },
      {
        text: t('budget.alert.cancelExpense'),
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
      title: t('budget.sheet.newIncome'),
      fields: [
        { key: 'name', label: t('budget.sheet.name'), type: 'text', placeholder: t('budget.sheet.namePhSalary') },
        {
          key: 'category',
          label: t('budget.sheet.incomeCategory'),
          type: 'select',
          options: incomeCats.map((c) => ({
            label: c.name,
            value: c._id,
            color: c.color,
            glyph: glyphForCategory(c.name),
          })),
        },
        { key: 'amount', label: t('budget.sheet.monthlyAmount'), type: 'number', placeholder: '0' },
        { key: 'day', label: t('budget.sheet.dayOfMonth'), type: 'number', placeholder: '1' },
      ],
    },
    charge: {
      title: t('budget.sheet.newCharge'),
      fields: [
        { key: 'name', label: t('budget.sheet.name'), type: 'text', placeholder: t('budget.sheet.namePhRent') },
        { key: 'amount', label: t('budget.sheet.monthlyAmount'), type: 'number', placeholder: '0' },
        {
          key: 'category',
          label: t('budget.sheet.category'),
          type: 'select',
          options: expenseCats.map((c) => ({
            label: c.name,
            value: c._id,
            color: c.color,
            glyph: glyphForCategory(c.name),
          })),
        },
        { key: 'day', label: t('budget.sheet.dayOfMonth'), type: 'number', placeholder: '1' },
      ],
    },
    category: {
      title: editingCat ? t('budget.sheet.editCategory') : t('budget.sheet.newCategory'),
      fields: [
        { key: 'name', label: t('budget.sheet.name'), type: 'text', placeholder: t('budget.sheet.namePhLeisure') },
        {
          key: 'planned',
          label: t('budget.sheet.plannedBudget'),
          type: 'number',
          placeholder: '0',
        },
        {
          key: 'color',
          label: t('budget.sheet.color'),
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
    incomeCategory: {
      title: editingCat ? t('budget.sheet.editIncomeCategory') : t('budget.sheet.newIncomeCategory'),
      fields: [
        { key: 'name', label: t('budget.sheet.name'), type: 'text', placeholder: t('budget.sheet.namePhIncomeCat') },
        {
          key: 'color',
          label: t('budget.sheet.color'),
          type: 'select',
          options: palette.map((c) => ({ label: ' ', value: c, color: c })),
        },
      ],
      initial: editingCat
        ? { name: editingCat.name, color: editingCat.color }
        : { color: palette[0] },
      onDelete: editingCat ? () => removeItem('category', editingCat, closeSheet) : undefined,
    },
    validate: validating
      ? {
          title: t('budget.sheet.validateTitle', { name: validating.name }),
          fields: [
            { key: 'amount', label: t('budget.sheet.actualPaid'), type: 'number', placeholder: String(validating.planned) },
            { key: 'note', label: t('budget.sheet.note'), type: 'text', placeholder: t('budget.sheet.notePh') },
          ],
          initial: { amount: String(validating.planned) },
        }
      : { title: '', fields: [] },
  };

  return (
    <>
      <Screen
        title={t('budget.title')}
        subtitle={t('budget.subtitle')}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          load();
        }}
      >
        {/* Resume mensuel previsionnel */}
        <GradientCard>
          <Text style={styles.heroLabel}>{t('budget.remaining')}</Text>
          <Text style={styles.heroValue}>{euro(dispo)}</Text>
          <View style={styles.heroRow}>
            <Text style={styles.heroPos}>{t('budget.incomeSummary', { a: euro(totalIncome) })}</Text>
            <Text style={styles.heroNeg}>{t('budget.chargesSummary', { a: euro(totalCharges) })}</Text>
            {totalPlanned > 0 ? (
              <Text style={styles.heroNeg}>{t('budget.budgetsSummary', { a: euro(totalPlanned) })}</Text>
            ) : null}
          </View>
        </GradientCard>

        <SectionHeader title={t('budget.stableIncome')} onAdd={() => setSheet('income')} />
        <Card padded={false} style={styles.listCard}>
          {income.length === 0 ? (
            <EmptyState title={t('budget.noIncome')} text={t('budget.noIncomeText')} />
          ) : (
            income.map((i, idx) => {
              const cat = incomeCatById.get(i.category);
              return (
                <Row
                  key={i._id}
                  name={cat?.name || i.name}
                  sub={
                    cat
                      ? t('budget.incomeSub', { name: i.name || cat.name, d: i.dayOfMonth })
                      : t('budget.onDayOfMonth', { d: i.dayOfMonth })
                  }
                  amount={euro(i.amount)}
                  color={cat?.color || colors.positive}
                  last={idx === income.length - 1}
                  onLongPress={() => removeItem('income', i)}
                />
              );
            })
          )}
        </Card>

        <SectionHeader title={t('budget.fixedCharges')} onAdd={() => setSheet('charge')} />
        <Card padded={false} style={styles.listCard}>
          {charges.length === 0 ? (
            <EmptyState title={t('budget.noCharges')} text={t('budget.noChargesText')} />
          ) : (
            charges.map((c, idx) => (
              <Row
                key={c._id}
                name={c.name}
                sub={c.category?.name || t('budget.onDayOfMonth', { d: c.dayOfMonth })}
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
              <Text style={font.h2}>{t('budget.monthExpenses')}</Text>
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

        <SectionHeader title={t('budget.expenseCategories')} onAdd={() => setSheet('category')} />
        <Card padded={false} style={styles.listCard}>
          {expenseCats.length === 0 ? (
            <EmptyState title={t('budget.noCategory')} text={t('budget.noExpenseCatText')} />
          ) : (
            expenseCats.map((c, idx) => (
              <Row
                key={c._id}
                name={c.name}
                sub={c.planned ? t('budget.budgetPerMonth', { a: euro(c.planned) }) : t('budget.noBudget')}
                amount={c.planned ? euro(c.planned) : ''}
                color={c.color}
                last={idx === expenseCats.length - 1}
                onPress={() => openEditCat(c)}
                onLongPress={() => removeItem('category', c)}
              />
            ))
          )}
        </Card>

        <SectionHeader title={t('budget.incomeCategories')} onAdd={() => setSheet('incomeCategory')} />
        <Card padded={false} style={styles.listCard}>
          {incomeCats.length === 0 ? (
            <EmptyState title={t('budget.noCategory')} text={t('budget.noIncomeCatText')} />
          ) : (
            incomeCats.map((c, idx) => (
              <Row
                key={c._id}
                name={c.name}
                color={c.color}
                last={idx === incomeCats.length - 1}
                onPress={() => openEditCat(c)}
                onLongPress={() => removeItem('category', c)}
              />
            ))
          )}
        </Card>

        <Text style={styles.hint}>{t('budget.hint')}</Text>

        {/* Suivi dans le temps : total cumule + graphe mois / annee */}
        <View style={styles.sectionHeader}>
          <Text style={font.h2}>{t('budget.timeTracking')}</Text>
          <View style={styles.toggle}>
            <Pressable
              onPress={() => setTimeMode('month')}
              style={[styles.toggleBtn, timeMode === 'month' && styles.toggleActive]}
            >
              <Text style={[styles.toggleText, timeMode === 'month' && styles.toggleTextActive]}>
                {t('budget.month')}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setTimeMode('year')}
              style={[styles.toggleBtn, timeMode === 'year' && styles.toggleActive]}
            >
              <Text style={[styles.toggleText, timeMode === 'year' && styles.toggleTextActive]}>
                {t('budget.year')}
              </Text>
            </Pressable>
          </View>
        </View>
        <Card>
          <Text style={font.label}>{t('budget.cumulativeTotal')}</Text>
          <Text style={[styles.timeTotal, { color: timeline.total < 0 ? colors.negative : colors.text }]}>
            {euro(timeline.total)}
          </Text>
          <View style={styles.timeLegend}>
            <Legend color={colors.positive} text={t('budget.netPositive')} />
            <Legend color={colors.negative} text={t('budget.netNegative')} />
            <Legend line text={t('budget.cumulative')} />
          </View>
          {timeData.length ? (
            <TimelineChart data={timeData} />
          ) : (
            <Text style={font.caption}>{t('budget.noData')}</Text>
          )}
        </Card>

        {/* Depenses : evolution dans le temps (suit le selecteur Mois / Annee) */}
        <View style={styles.sectionHeader}>
          <Text style={font.h2}>{t('budget.expensesOverTime')}</Text>
          <Text style={styles.monthLabel}>{timeMode === 'year' ? t('budget.perYear') : t('budget.perMonth')}</Text>
        </View>
        <Card>
          {expenseBars.some((d) => d.value > 0) ? (
            <ExpenseBars data={expenseBars} />
          ) : (
            <Text style={font.caption}>{t('budget.noData')}</Text>
          )}
        </Card>

        {/* Depenses : repartition par categorie */}
        <View style={styles.sectionHeader}>
          <Text style={font.h2}>{t('budget.expenseBreakdown')}</Text>
        </View>
        <Card>
          {expenseTotal > 0 ? (
            <View style={styles.donutWrap}>
              <DonutChart data={donutExpense} size={132} strokeWidth={16}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={font.caption}>{t('budget.total')}</Text>
                  <Text style={styles.donutTotal}>{euro(expenseTotal)}</Text>
                </View>
              </DonutChart>
              <View style={styles.donutLegend}>
                {expenseBreakdown.slice(0, 6).map((e, i) => (
                  <View key={`${e.name}-${i}`} style={styles.legendRow}>
                    <View style={[styles.legendDot, { backgroundColor: e.color }]} />
                    <Text style={styles.legendName} numberOfLines={1}>{e.name}</Text>
                    <Text style={styles.legendPct}>{Math.round((e.total / expenseTotal) * 100)}%</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <Text style={font.caption}>{t('budget.breakdownEmpty')}</Text>
          )}
        </Card>

        {/* Photo de profil */}
        <View style={styles.sectionHeader}>
          <Text style={font.h2}>{t('account.photo')}</Text>
        </View>
        <Card>
          <View style={styles.photoRow}>
            <Pressable onPress={onPickPhoto} style={styles.photoAvatar}>
              {photo ? (
                <Image source={{ uri: photo }} style={styles.photoImg} />
              ) : (
                <Text style={styles.photoInitial}>{initial}</Text>
              )}
            </Pressable>
            <View style={{ flex: 1, gap: spacing.sm }}>
              <Pressable onPress={onPickPhoto} style={styles.photoBtn}>
                <Text style={styles.photoBtnText}>
                  {photo ? t('account.changePhoto') : t('account.addPhoto')}
                </Text>
              </Pressable>
              {photo ? (
                <Pressable onPress={removePhoto} hitSlop={6} style={styles.photoRemove}>
                  <Text style={styles.photoRemoveText}>{t('account.removePhoto')}</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        </Card>

        {/* Langue de l'application */}
        <View style={styles.sectionHeader}>
          <Text style={font.h2}>{t('account.language')}</Text>
        </View>
        <Card>
          <Text style={font.label}>{t('account.languageHint')}</Text>
          <View style={styles.langRow}>
            {LANGUAGES.map((l) => {
              const active = lang === l.code;
              return (
                <Pressable
                  key={l.code}
                  onPress={() => setLang(l.code)}
                  style={[styles.langBtn, active && styles.langBtnActive]}
                >
                  <Text style={[styles.langText, active && styles.langTextActive]}>{l.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        {/* Compte */}
        <View style={styles.account}>
          <View style={{ flex: 1 }}>
            <Text style={font.label}>{t('budget.loggedInAs')}</Text>
            <Text style={font.title} numberOfLines={1}>
              {user?.email || ''}
            </Text>
          </View>
        </View>
        <Button title={t('budget.logout')} variant="ghost" onPress={logout} />
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

// Barres des depenses par periode, defilables horizontalement (mobile).
// Le montant s'affiche au survol (web) et au toucher (mobile) via une bulle.
function ExpenseBars({ data }) {
  const H = 130;
  const max = Math.max(1, ...data.map((d) => Number(d.value) || 0));
  const [active, setActive] = useState(null);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.barsRow}
    >
      {data.map((d, i) => {
        const value = Number(d.value || 0);
        const isActive = active === i;
        return (
          <Pressable
            key={i}
            style={styles.barCol}
            onPress={() => setActive((prev) => (prev === i ? null : i))}
            onHoverIn={() => setActive(i)}
            onHoverOut={() => setActive((prev) => (prev === i ? null : prev))}
          >
            <View style={[styles.barArea, { height: H }]}>
              {isActive ? (
                <View style={styles.barTip}>
                  <Text style={styles.barTipText}>{euro(value)}</Text>
                </View>
              ) : null}
              <View
                style={[
                  styles.barFill,
                  { height: Math.max(3, (value / max) * H) },
                  isActive && styles.barFillActive,
                ]}
              />
            </View>
            <Text style={[styles.barLabel, isActive && styles.barLabelActive]} numberOfLines={1}>
              {d.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function Legend({ color, line, text }) {
  return (
    <View style={styles.legChip}>
      {line ? (
        <View style={styles.legLine} />
      ) : (
        <View style={[styles.legDot, { backgroundColor: color }]} />
      )}
      <Text style={styles.legTxt}>{text}</Text>
    </View>
  );
}

function SectionHeader({ title, onAdd }) {
  const t = useT();
  return (
    <View style={styles.sectionHeader}>
      <Text style={font.h2}>{title}</Text>
      <Pressable onPress={onAdd} hitSlop={8}>
        <Text style={styles.add}>{t('budget.add')}</Text>
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
  const t = useT();
  const paid = !!tx;
  const actual = paid ? Number(tx.amount) : 0;
  const diff = paid ? Number(cat.planned) - actual : 0; // >0 economise, <0 depense en plus
  const sub = paid
    ? diff > 0
      ? t('budget.paidSaved', { a: euro(actual), b: euro(diff) })
      : diff < 0
        ? t('budget.paidMore', { a: euro(actual), b: euro(-diff) })
        : t('budget.paid', { a: euro(actual) })
    : t('budget.planned', { a: euro(cat.planned) });
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
          <Text style={styles.cancelText}>{t('budget.cancel')}</Text>
        </Pressable>
      ) : (
        <Pressable onPress={onValidate} hitSlop={8} style={styles.validateBtn}>
          <Text style={styles.validateText}>{t('budget.validate')}</Text>
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
  toggle: {
    flexDirection: 'row',
    backgroundColor: colors.bgSoft,
    borderRadius: radius.full,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleBtn: { paddingHorizontal: spacing.md, height: 30, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  toggleActive: { backgroundColor: colors.primary },
  toggleText: { color: colors.textMuted, fontWeight: '700', fontSize: 13 },
  toggleTextActive: { color: colors.textOnTeal },
  timeTotal: { fontFamily: 'Manrope_800ExtraBold', fontSize: 30, letterSpacing: -0.8, marginTop: 2, marginBottom: spacing.md },
  timeLegend: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.md },
  barsRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 14, marginTop: spacing.xl, paddingHorizontal: 2 },
  barCol: { alignItems: 'center', width: 34 },
  barArea: { width: 34, justifyContent: 'flex-end', alignItems: 'center', overflow: 'visible' },
  barFill: { width: 20, borderRadius: 6, backgroundColor: colors.negative },
  barFillActive: { backgroundColor: colors.primary },
  barTip: {
    position: 'absolute',
    top: -30,
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 10,
  },
  barTipText: { color: colors.text, fontFamily: ff.bold, fontSize: 12 },
  barLabel: { marginTop: 6, fontSize: 11, color: colors.textMuted, fontFamily: ff.semibold, textTransform: 'capitalize', textAlign: 'center', width: 34 },
  barLabelActive: { color: colors.text },
  donutWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  donutTotal: { fontFamily: ff.extrabold, fontSize: 15, color: colors.text },
  donutLegend: { flex: 1, gap: 10 },
  legendRow: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 9, height: 9, borderRadius: 5, marginRight: spacing.sm },
  legendName: { flex: 1, fontFamily: ff.semibold, fontSize: 13.5, color: colors.text },
  legendPct: { fontFamily: ff.bold, fontSize: 13.5, color: colors.textMuted },
  legChip: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legDot: { width: 9, height: 9, borderRadius: 5 },
  legLine: { width: 14, height: 2, borderRadius: 2, backgroundColor: '#FFFFFF' },
  legTxt: { color: colors.textMuted, fontFamily: ff.semibold, fontSize: 12 },
  hint: { ...font.caption, textAlign: 'center', marginTop: spacing.xl },
  photoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  photoAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.bgSoft,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoImg: { width: 64, height: 64, borderRadius: 32 },
  photoInitial: { color: colors.text, fontFamily: ff.bold, fontSize: 24 },
  photoBtn: {
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoBtnText: { color: colors.textOnTeal, fontFamily: ff.bold, fontSize: 14 },
  photoRemove: { alignItems: 'center', paddingVertical: 4 },
  photoRemoveText: { color: colors.negative, fontFamily: ff.semibold, fontSize: 13 },
  langRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  langBtn: {
    flex: 1,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.bgSoft,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  langText: { color: colors.text, fontFamily: ff.semibold, fontSize: 14 },
  langTextActive: { color: colors.textOnTeal },
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
