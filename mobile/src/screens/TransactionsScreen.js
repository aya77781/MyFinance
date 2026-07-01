import { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Modal } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import Screen from '../components/Screen';
import Card from '../components/Card';
import AddButton from '../components/AddButton';
import TransactionRow from '../components/TransactionRow';
import FormSheet from '../components/FormSheet';
import EmptyState from '../components/EmptyState';
import Button from '../components/Button';
import { SkeletonRow } from '../components/Skeleton';
import { useToast } from '../components/Toast';
import { colors, spacing, font, ff } from '../theme';
import { Transactions, Categories } from '../api';
import { glyphForCategory } from '../components/Glyph';
import { dateInput, parseDateInput, getLocale, monthLabel, toDisplay, fromDisplay } from '../format';
import { useT, registerTranslations } from '../i18n';

registerTranslations({
  fr: {
    'transactions.title': 'Transactions',
    'transactions.subtitle': 'Tes mouvements',
    'transactions.empty.title': 'Aucune transaction ce mois',
    'transactions.empty.text': 'Appuie sur + pour ajouter une depense ou un revenu sur ce mois.',
    'transactions.invalidAmount': 'Saisis un montant superieur a 0.',
    'transactions.saved': 'Transaction ajoutee',
    'transactions.updated': 'Transaction modifiee',
    'transactions.sheet.new': 'Nouvelle transaction',
    'transactions.sheet.edit': 'Modifier la transaction',
    'transactions.delete.title': 'Supprimer',
    'transactions.delete.message': 'Supprimer cette transaction ?',
    'transactions.delete.cancel': 'Annuler',
    'transactions.delete.confirm': 'Supprimer',
    'transactions.field.type': 'Type',
    'transactions.field.type.expense': 'Depense',
    'transactions.field.type.income': 'Revenu',
    'transactions.field.amount': 'Montant',
    'transactions.field.source': 'Source du revenu',
    'transactions.field.category': 'Categorie',
    'transactions.field.sourceOther': 'Preciser la source',
    'transactions.field.sourceOther.placeholder': 'Ex : remboursement, cadeau, vente',
    'transactions.field.note': 'Note',
    'transactions.field.note.placeholder': 'Optionnel',
    'transactions.field.date': 'Date',
    'transactions.field.date.placeholder': 'JJ/MM/AAAA',
    'transactions.source.salaire': 'Salaire',
    'transactions.source.menage': 'Mini job',
    'transactions.source.babysitting': 'Babysitting',
    'transactions.source.tutoring': 'Tutoring',
    'transactions.source.freelance': 'Freelance',
    'transactions.source.competition': 'Competition',
    'transactions.source.autre': 'Autre',
  },
  en: {
    'transactions.title': 'Transactions',
    'transactions.subtitle': 'Your activity',
    'transactions.empty.title': 'No transactions this month',
    'transactions.empty.text': 'Tap + to add an expense or income for this month.',
    'transactions.invalidAmount': 'Enter an amount greater than 0.',
    'transactions.saved': 'Transaction added',
    'transactions.updated': 'Transaction updated',
    'transactions.sheet.new': 'New transaction',
    'transactions.sheet.edit': 'Edit transaction',
    'transactions.delete.title': 'Delete',
    'transactions.delete.message': 'Delete this transaction?',
    'transactions.delete.cancel': 'Cancel',
    'transactions.delete.confirm': 'Delete',
    'transactions.field.type': 'Type',
    'transactions.field.type.expense': 'Expense',
    'transactions.field.type.income': 'Income',
    'transactions.field.amount': 'Amount',
    'transactions.field.source': 'Income source',
    'transactions.field.category': 'Category',
    'transactions.field.sourceOther': 'Specify the source',
    'transactions.field.sourceOther.placeholder': 'E.g. refund, gift, sale',
    'transactions.field.note': 'Note',
    'transactions.field.note.placeholder': 'Optional',
    'transactions.field.date': 'Date',
    'transactions.field.date.placeholder': 'DD/MM/YYYY',
    'transactions.source.salaire': 'Salary',
    'transactions.source.menage': 'Mini job',
    'transactions.source.babysitting': 'Babysitting',
    'transactions.source.tutoring': 'Tutoring',
    'transactions.source.freelance': 'Freelance',
    'transactions.source.competition': 'Competition',
    'transactions.source.autre': 'Other',
  },
});

// Sources possibles pour un revenu (independantes des categories de depense).
// Les libelles sont traduits a l'affichage ; les `value` restent inchangees (mappage donnees).
const INCOME_SOURCES = [
  { labelKey: 'transactions.source.salaire', value: 'Salaire', glyph: 'briefcase' },
  { labelKey: 'transactions.source.menage', value: 'Menage', glyph: 'coins' },
  { labelKey: 'transactions.source.babysitting', value: 'Babysitting', glyph: 'baby' },
  { labelKey: 'transactions.source.tutoring', value: 'Tutoring', glyph: 'book' },
  { labelKey: 'transactions.source.freelance', value: 'Freelance', glyph: 'laptop' },
  { labelKey: 'transactions.source.competition', value: 'Competition', glyph: 'trophy' },
  { labelKey: 'transactions.source.autre', value: '__autre__', glyph: 'tag' },
];

const NOW = new Date();

export default function TransactionsScreen() {
  const t = useT();
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loaded, setLoaded] = useState(false); // evite le flash d'etat vide au 1er chargement
  const [refreshing, setRefreshing] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [editing, setEditing] = useState(null); // transaction en cours d'edition
  // Confirmation de suppression in-app (fiable sur web, contrairement a Alert/window.confirm).
  const [pendingDelete, setPendingDelete] = useState(null); // { tx, after } | null
  const [deleting, setDeleting] = useState(false);
  // Mois affiche (par defaut le mois courant) : on ne montre que les
  // transactions de ce mois, pas l'historique complet.
  const [sel, setSel] = useState({ year: NOW.getFullYear(), month: NOW.getMonth() });

  const load = useCallback(
    async (period = sel) => {
      try {
        const from = new Date(period.year, period.month, 1, 0, 0, 0, 0).toISOString();
        const to = new Date(period.year, period.month + 1, 0, 23, 59, 59, 999).toISOString();
        const [tx, cats] = await Promise.all([
          Transactions.list(`?from=${from}&to=${to}&limit=200`),
          Categories.list(),
        ]);
        setItems(tx);
        setCategories(cats);
      } catch (e) {
        toast.error(e.message);
      } finally {
        setLoaded(true);
        setRefreshing(false);
      }
    },
    [toast, sel]
  );

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // Navigation entre mois (passes ou futurs).
  const goMonth = (delta) => {
    const d = new Date(sel.year, sel.month + delta, 1);
    const next = { year: d.getFullYear(), month: d.getMonth() };
    setSel(next);
    load(next);
  };

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
    if (!(Number(v.amount) > 0)) {
      // throw -> FormSheet affiche l'erreur (toast) et garde la feuille ouverte.
      throw new Error(t('transactions.invalidAmount'));
    }
    const isIncome = v.type === 'income';
    // Pour un revenu, la "provenance" remplace la categorie de depense.
    const source = isIncome
      ? v.source === '__autre__'
        ? (v.sourceOther || '').trim() || 'Autre'
        : v.source || ''
      : '';
    const payload = {
      type: v.type || 'expense',
      amount: fromDisplay(Number(v.amount)),
      category: isIncome ? null : v.category || null,
      note: v.note || '',
      source,
    };
    // Date saisie (JJ/MM/AAAA) -> ISO ; on garde l'ancienne si invalide/absente.
    const iso = parseDateInput(v.date);
    if (iso) payload.date = iso;
    // En cas d'erreur reseau, on laisse l'exception remonter : FormSheet
    // l'affiche (toast) et conserve la feuille ouverte. closeSheet est
    // declenche par FormSheet apres succes.
    if (editing) await Transactions.update(editing._id, payload);
    else await Transactions.create(payload);
    toast.success(editing ? t('transactions.updated') : t('transactions.saved'));
    setEditing(null);
    load();
  };

  // Ouvre la confirmation in-app (au lieu d'Alert.alert, dont les boutons ne
  // s'affichent pas sur le web -> suppression silencieusement ignoree).
  const confirmDelete = (tx, after) => {
    setPendingDelete({ tx, after });
  };

  const doDelete = async () => {
    if (!pendingDelete) return;
    const { tx, after } = pendingDelete;
    try {
      setDeleting(true);
      await Transactions.remove(tx._id);
      setPendingDelete(null);
      after?.();
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setDeleting(false);
    }
  };

  // Valeurs initiales du formulaire selon le mode (creation ou edition).
  const initialValues = editing
    ? (() => {
        const isIncome = editing.type === 'income';
        const base = {
          type: editing.type,
          amount: String(toDisplay(editing.amount)),
          note: editing.note || '',
          date: dateInput(editing.date),
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
    : {
        type: 'expense',
        // Nouveau mouvement : date du jour si on est sur le mois courant,
        // sinon le 1er du mois affiche (pour qu'il apparaisse dans la liste).
        date:
          sel.year === NOW.getFullYear() && sel.month === NOW.getMonth()
            ? dateInput()
            : dateInput(new Date(sel.year, sel.month, 1)),
      };

  // Champs dynamiques : un revenu n'a pas de categorie de depense mais une source.
  const fields = (v) => {
    const isIncome = v.type === 'income';
    return [
      {
        key: 'type',
        label: t('transactions.field.type'),
        type: 'select',
        options: [
          { label: t('transactions.field.type.expense'), value: 'expense' },
          { label: t('transactions.field.type.income'), value: 'income' },
        ],
      },
      { key: 'amount', label: t('transactions.field.amount'), type: 'number', placeholder: '0' },
      isIncome
        ? {
            key: 'source',
            label: t('transactions.field.source'),
            type: 'select',
            options: INCOME_SOURCES.map((s) => ({
              label: t(s.labelKey),
              value: s.value,
              glyph: s.glyph,
            })),
          }
        : {
            key: 'category',
            label: t('transactions.field.category'),
            type: 'select',
            options: categories
              .filter((c) => c.type !== 'income')
              .map((c) => ({
                label: c.name,
                value: c._id,
                color: c.color,
                glyph: glyphForCategory(c.name),
              })),
          },
      isIncome && v.source === '__autre__'
        ? {
            key: 'sourceOther',
            label: t('transactions.field.sourceOther'),
            type: 'text',
            placeholder: t('transactions.field.sourceOther.placeholder'),
          }
        : null,
      { key: 'note', label: t('transactions.field.note'), type: 'text', placeholder: t('transactions.field.note.placeholder') },
      { key: 'date', label: t('transactions.field.date'), type: 'date', placeholder: t('transactions.field.date.placeholder') },
    ].filter(Boolean);
  };

  // Regroupe par jour pour un rendu type Revolut.
  const grouped = items.reduce((acc, tx) => {
    const day = new Date(tx.date).toLocaleDateString(getLocale(), {
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
        title={t('transactions.title')}
        subtitle={t('transactions.subtitle')}
        action={<AddButton onPress={openNew} />}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          load();
        }}
      >
        <View style={styles.monthNav}>
          <Pressable
            onPress={() => goMonth(-1)}
            hitSlop={12}
            style={({ pressed }) => [styles.monthArrow, pressed && { opacity: 0.5 }]}
          >
            <Text style={styles.monthArrowText}>‹</Text>
          </Pressable>
          <Text style={styles.monthLabel}>{monthLabel(sel.year, sel.month)}</Text>
          <Pressable
            onPress={() => goMonth(1)}
            hitSlop={12}
            style={({ pressed }) => [styles.monthArrow, pressed && { opacity: 0.5 }]}
          >
            <Text style={styles.monthArrowText}>›</Text>
          </Pressable>
        </View>

        {!loaded && items.length === 0 ? (
          <Card padded={false} style={{ paddingHorizontal: spacing.lg }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <View
                key={i}
                style={i < 4 ? { borderBottomWidth: 1, borderBottomColor: colors.border } : null}
              >
                <SkeletonRow />
              </View>
            ))}
          </Card>
        ) : items.length === 0 ? (
          <Card>
            <EmptyState title={t('transactions.empty.title')} text={t('transactions.empty.text')} />
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
        title={editing ? t('transactions.sheet.edit') : t('transactions.sheet.new')}
        fields={fields}
        initial={initialValues}
        onSubmit={save}
        onClose={closeSheet}
        onDelete={editing ? () => confirmDelete(editing, closeSheet) : undefined}
      />

      <Modal
        visible={!!pendingDelete}
        animationType="fade"
        transparent
        onRequestClose={() => setPendingDelete(null)}
      >
        <View style={styles.confirmBackdrop}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>{t('transactions.delete.title')}</Text>
            <Text style={styles.confirmMsg}>{t('transactions.delete.message')}</Text>
            <View style={{ marginTop: spacing.lg }}>
              <Button
                title={t('transactions.delete.confirm')}
                onPress={doDelete}
                loading={deleting}
                variant="danger"
              />
            </View>
            <Pressable
              onPress={() => setPendingDelete(null)}
              hitSlop={8}
              style={styles.confirmCancel}
            >
              <Text style={styles.confirmCancelText}>{t('transactions.delete.cancel')}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  day: { ...font.label, textTransform: 'capitalize', marginBottom: spacing.sm, marginLeft: spacing.xs },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  monthArrow: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  monthArrowText: { color: colors.text, fontFamily: ff.bold, fontSize: 24, lineHeight: 26 },
  monthLabel: {
    color: colors.text,
    fontFamily: ff.bold,
    fontSize: 16,
    textTransform: 'capitalize',
    minWidth: 150,
    textAlign: 'center',
  },
  confirmBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(4,8,14,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  confirmCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: spacing.xl,
  },
  confirmTitle: { ...font.h2, marginBottom: spacing.sm },
  confirmMsg: { ...font.body, color: colors.textMuted },
  confirmCancel: { alignSelf: 'center', paddingVertical: spacing.md, marginTop: spacing.xs },
  confirmCancelText: { color: colors.textMuted, fontFamily: ff.bold, fontSize: 15 },
});
