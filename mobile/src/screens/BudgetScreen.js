import { useState, useCallback, useMemo } from 'react';
import { View, Text, Pressable, Alert, StyleSheet, ScrollView, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import Screen from '../components/Screen';
import Card from '../components/Card';
import GradientCard from '../components/GradientCard';
import FormSheet from '../components/FormSheet';
import CategoryIcon from '../components/CategoryIcon';
import ProgressBar from '../components/ProgressBar';
import TimelineChart from '../components/TimelineChart';
import DonutChart from '../components/DonutChart';
import { glyphForCategory } from '../components/Glyph';
import EmptyState from '../components/EmptyState';
import { useToast } from '../components/Toast';
import { colors, spacing, font, radius, palette, ff } from '../theme';
import { euro, getLocale, toDisplay, fromDisplay } from '../format';
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
    'budget.backToCurrent': 'Revenir au mois courant',
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
    'budget.remainingLabel': '{pct}% depense · reste {a}',
    'budget.overBy': '{pct}% · depasse de {a}',
    'budget.spentSub': 'Depense ce mois (sans budget)',
    'budget.validate': 'Valider',
    'budget.cancel': 'Annuler',
    'budget.errNameRequired': 'Donne un nom.',
    'budget.errAmountRequired': 'Saisis un montant superieur a 0.',
    'budget.add': 'Ajouter',
    'budget.defaultNote': 'Budget {month}',
    // Sheets
    'budget.sheet.newIncome': 'Nouveau revenu stable',
    'budget.sheet.editIncome': 'Modifier le revenu',
    'budget.sheet.editCharge': 'Modifier la charge',
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
    'budget.backToCurrent': 'Back to current month',
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
    'budget.remainingLabel': '{pct}% spent · {a} left',
    'budget.overBy': '{pct}% · over by {a}',
    'budget.spentSub': 'Spent this month (no budget)',
    'budget.validate': 'Confirm',
    'budget.cancel': 'Cancel',
    'budget.errNameRequired': 'Enter a name.',
    'budget.errAmountRequired': 'Enter an amount greater than 0.',
    'budget.add': 'Add',
    'budget.defaultNote': 'Budget {month}',
    // Sheets
    'budget.sheet.newIncome': 'New stable income',
    'budget.sheet.editIncome': 'Edit income',
    'budget.sheet.editCharge': 'Edit expense',
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
  const toast = useToast();
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
  const [editingItem, setEditingItem] = useState(null); // { kind: 'income'|'charge', item }
  const [validating, setValidating] = useState(null); // categorie a valider ce mois
  const [monthOffset, setMonthOffset] = useState(0); // 0 = mois courant, +1 = mois prochain...

  // Mois affiche = mois courant decale de monthOffset (pour preparer les mois a venir).
  // Cle technique (YYYY-MM) pour tagguer les validations + libelle lisible.
  const now = new Date();
  const viewDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const MONTH_KEY = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}`;
  const MONTH_LABEL = viewDate.toLocaleDateString(getLocale(), { month: 'long' });
  // On ajoute l'annee au libelle quand on n'est pas sur l'annee en cours, pour lever l'ambiguite.
  const MONTH_LABEL_FULL =
    viewDate.getFullYear() === now.getFullYear()
      ? MONTH_LABEL
      : `${MONTH_LABEL} ${viewDate.getFullYear()}`;

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
      toast.error(e.message);
    } finally {
      setRefreshing(false);
    }
  }, [toast]);

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
  // Memoise : ne se recalcule que si les transactions ou le mois affiche changent
  // (et non a chaque frappe dans une feuille de saisie).
  const paidByCat = useMemo(() => {
    const m = new Map();
    for (const t of transactions) {
      const cid = t.category?._id || t.category;
      if (t.budgetMonth === MONTH_KEY && cid) m.set(cid, t);
    }
    return m;
  }, [transactions, MONTH_KEY]);

  // active !== false : un enregistrement sans le champ (legacy) est compte actif.
  const totalIncome = income.reduce((s, i) => (i.active !== false ? s + i.amount : s), 0);
  const totalCharges = charges.reduce((s, c) => (c.active !== false ? s + c.amount : s), 0);
  const dispo = totalIncome - totalCharges - totalPlanned;

  // Depense reelle par categorie sur le mois affiche : somme des VRAIES
  // transactions (type depense) datees de ce mois. Alimente le suivi de conso.
  const spentByCat = useMemo(() => {
    const VY = viewDate.getFullYear();
    const VM = viewDate.getMonth();
    const m = new Map();
    for (const tx of transactions) {
      if (tx.type !== 'expense') continue;
      const d = new Date(tx.date);
      if (isNaN(d) || d.getFullYear() !== VY || d.getMonth() !== VM) continue;
      const cid = tx.category?._id || tx.category;
      if (!cid) continue;
      m.set(cid, (m.get(cid) || 0) + Number(tx.amount || 0));
    }
    return m;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions, monthOffset]);
  // Categories sans budget mais avec des depenses ce mois (affichees sans %).
  const spentNonBudget = expenseCats.filter(
    (c) => !(Number(c.planned) > 0) && (spentByCat.get(c._id) || 0) > 0
  );

  const closeSheet = () => {
    setSheet(null);
    setEditingCat(null);
    setEditingItem(null);
    setValidating(null);
  };

  const openEditCat = (c) => {
    setEditingCat(c);
    setSheet(c.type === 'income' ? 'incomeCategory' : 'category');
  };

  // Edition d'un revenu stable / d'une charge fixe (memes feuilles que la creation).
  const openEditItem = (kind, item) => {
    setEditingItem({ kind, item });
    setSheet(kind);
  };

  const openValidate = (c) => {
    setValidating(c);
    setSheet('validate');
  };

  const submit = async (v) => {
    // Validations (throw -> FormSheet affiche le toast et garde la feuille ouverte).
    const needsName = ['income', 'charge', 'category', 'incomeCategory'].includes(sheet);
    if (needsName && !v.name?.trim()) throw new Error(t('budget.errNameRequired'));
    if ((sheet === 'income' || sheet === 'charge') && !(Number(v.amount) > 0)) {
      throw new Error(t('budget.errAmountRequired'));
    }
    if (sheet === 'income') {
      const payload = {
        name: v.name,
        amount: fromDisplay(Number(v.amount)),
        dayOfMonth: Number(v.day) || 1,
        category: v.category || null,
      };
      if (editingItem?.kind === 'income') await Income.update(editingItem.item._id, payload);
      else await Income.create(payload);
    } else if (sheet === 'charge') {
      const payload = {
        name: v.name,
        amount: fromDisplay(Number(v.amount)),
        category: v.category || null,
        dayOfMonth: Number(v.day) || 1,
      };
      if (editingItem?.kind === 'charge') await Charges.update(editingItem.item._id, payload);
      else await Charges.create(payload);
    } else if (sheet === 'category') {
      const payload = {
        name: v.name,
        color: v.color || palette[0],
        planned: fromDisplay(Number(v.planned) || 0),
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
        amount: v.amount ? fromDisplay(Number(v.amount)) : Number(validating.planned),
        budgetMonth: MONTH_KEY,
        note: v.note || t('budget.defaultNote', { month: MONTH_LABEL_FULL }),
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
          try {
            if (kind === 'income') await Income.remove(item._id);
            if (kind === 'charge') await Charges.remove(item._id);
            if (kind === 'category') await Categories.remove(item._id);
            after?.();
            load();
          } catch (e) {
            toast.error(e.message);
          }
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
          try {
            await Transactions.remove(tx._id);
            load();
          } catch (e) {
            toast.error(e.message);
          }
        },
      },
    ]);
  };

  const sheetConfig = {
    income: {
      title: editingItem?.kind === 'income' ? t('budget.sheet.editIncome') : t('budget.sheet.newIncome'),
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
      initial:
        editingItem?.kind === 'income'
          ? {
              name: editingItem.item.name || '',
              category: editingItem.item.category || null,
              amount: editingItem.item.amount != null ? String(toDisplay(editingItem.item.amount)) : '',
              day: editingItem.item.dayOfMonth != null ? String(editingItem.item.dayOfMonth) : '',
            }
          : undefined,
      onDelete:
        editingItem?.kind === 'income'
          ? () => removeItem('income', editingItem.item, closeSheet)
          : undefined,
    },
    charge: {
      title: editingItem?.kind === 'charge' ? t('budget.sheet.editCharge') : t('budget.sheet.newCharge'),
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
      initial:
        editingItem?.kind === 'charge'
          ? {
              name: editingItem.item.name || '',
              amount: editingItem.item.amount != null ? String(toDisplay(editingItem.item.amount)) : '',
              category: editingItem.item.category?._id || editingItem.item.category || null,
              day: editingItem.item.dayOfMonth != null ? String(editingItem.item.dayOfMonth) : '',
            }
          : undefined,
      onDelete:
        editingItem?.kind === 'charge'
          ? () => removeItem('charge', editingItem.item, closeSheet)
          : undefined,
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
            planned: editingCat.planned ? String(toDisplay(editingCat.planned)) : '',
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
            { key: 'amount', label: t('budget.sheet.actualPaid'), type: 'number', placeholder: String(toDisplay(validating.planned)) },
            { key: 'note', label: t('budget.sheet.note'), type: 'text', placeholder: t('budget.sheet.notePh') },
          ],
          initial: { amount: String(toDisplay(validating.planned)) },
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
          <Text style={styles.heroValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
            {euro(dispo)}
          </Text>
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
                  onPress={() => openEditItem('income', i)}
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
                onPress={() => openEditItem('charge', c)}
                onLongPress={() => removeItem('charge', c)}
              />
            ))
          )}
        </Card>

        {budgetCats.length > 0 || spentNonBudget.length > 0 ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={font.h2}>{t('budget.monthExpenses')}</Text>
              <View style={styles.monthNav}>
                <Pressable
                  onPress={() => setMonthOffset((o) => o - 1)}
                  hitSlop={8}
                  style={styles.monthNavBtn}
                >
                  <Text style={styles.monthNavArrow}>‹</Text>
                </Pressable>
                <Text style={styles.monthNavLabel}>{MONTH_LABEL_FULL}</Text>
                <Pressable
                  onPress={() => setMonthOffset((o) => o + 1)}
                  hitSlop={8}
                  style={styles.monthNavBtn}
                >
                  <Text style={styles.monthNavArrow}>›</Text>
                </Pressable>
              </View>
            </View>
            {monthOffset !== 0 ? (
              <Pressable onPress={() => setMonthOffset(0)} hitSlop={6} style={styles.monthReset}>
                <Text style={styles.monthResetText}>{t('budget.backToCurrent')}</Text>
              </Pressable>
            ) : null}
            <Card padded={false} style={styles.listCard}>
              {budgetCats.map((c, idx) => (
                <BudgetProgressRow
                  key={c._id}
                  cat={c}
                  spent={spentByCat.get(c._id) || 0}
                  last={idx === budgetCats.length - 1 && spentNonBudget.length === 0}
                  onPress={() => openEditCat(c)}
                  onLongPress={() => removeItem('category', c)}
                />
              ))}
              {spentNonBudget.map((c, idx) => (
                <Row
                  key={c._id}
                  name={c.name}
                  sub={t('budget.spentSub')}
                  amount={euro(spentByCat.get(c._id) || 0)}
                  color={c.color}
                  last={idx === spentNonBudget.length - 1}
                  onPress={() => openEditCat(c)}
                  onLongPress={() => removeItem('category', c)}
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

// Ligne de suivi de budget : depense reelle (somme des transactions du mois)
// vs budget prevu, avec barre de progression, % et reste (ou depassement).
function BudgetProgressRow({ cat, spent, last, onPress, onLongPress }) {
  const t = useT();
  const planned = Number(cat.planned) || 0;
  const pct = planned > 0 ? Math.round((spent / planned) * 100) : 0;
  const remaining = planned - spent;
  const over = remaining < 0;
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.budgetRow,
        !last && { borderBottomWidth: 1, borderBottomColor: colors.border },
        pressed && { opacity: 0.6 },
      ]}
    >
      <View style={styles.budgetTop}>
        <CategoryIcon name={cat.name} color={cat.color} size={42} />
        <View style={{ flex: 1 }}>
          <Text style={font.title} numberOfLines={1}>
            {cat.name}
          </Text>
        </View>
        <Text style={styles.amount} numberOfLines={1}>
          {euro(spent)} / {euro(planned)}
        </Text>
      </View>
      <ProgressBar
        progress={planned > 0 ? Math.min(1, spent / planned) : 0}
        color={over ? colors.negative : cat.color}
      />
      <Text style={[styles.budgetSub, { color: over ? colors.negative : colors.textMuted }]}>
        {over
          ? t('budget.overBy', { pct, a: euro(-remaining) })
          : t('budget.remainingLabel', { pct, a: euro(remaining) })}
      </Text>
    </Pressable>
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
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.bgSoft,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 4,
  },
  monthNavBtn: { width: 28, height: 28, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  monthNavArrow: { color: colors.primary, fontSize: 20, fontWeight: '800', lineHeight: 22 },
  monthNavLabel: {
    ...font.label,
    textTransform: 'capitalize',
    color: colors.text,
    minWidth: 80,
    textAlign: 'center',
  },
  monthReset: { alignSelf: 'flex-end', marginTop: -spacing.sm, marginBottom: spacing.sm },
  monthResetText: { color: colors.primary, fontFamily: ff.semibold, fontSize: 12 },
  listCard: { paddingHorizontal: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md },
  budgetRow: { paddingVertical: spacing.md },
  budgetTop: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  budgetSub: { ...font.caption, marginTop: spacing.sm, fontFamily: ff.semibold },
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
