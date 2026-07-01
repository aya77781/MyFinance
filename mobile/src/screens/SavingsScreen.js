import { useState, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import Screen from '../components/Screen';
import Card from '../components/Card';
import AddButton from '../components/AddButton';
import GoalCard from '../components/GoalCard';
import GradientCard from '../components/GradientCard';
import FormSheet from '../components/FormSheet';
import EmptyState from '../components/EmptyState';
import Glyph from '../components/Glyph';
import { SkeletonCard } from '../components/Skeleton';
import { useToast } from '../components/Toast';
import { colors, spacing, font, radius, palette, ff } from '../theme';
import { euro, moneyForDate, shortDate, dateInput, parseDateInput, toDisplay, fromDisplay } from '../format';
import { Savings } from '../api';
import { useCurrency } from '../CurrencyContext';
import { confirmAction } from '../confirm';
import { useT, registerTranslations } from '../i18n';

registerTranslations({
  fr: {
    'savings.title': 'Epargne',
    'savings.subtitle': 'Tes objectifs',
    'savings.totalLabel': 'Total epargne',
    'savings.pocketCount': '{count} objectif(s)',
    'savings.emptyTitle': 'Aucun objectif',
    'savings.emptyText': "Cree un objectif d'epargne pour commencer a mettre de cote.",
    'savings.deleteTitle': 'Supprimer',
    'savings.deleteConfirm': 'Supprimer "{name}" ?',
    'savings.cancel': 'Annuler',
    'savings.delete': 'Supprimer',
    'savings.newPocket': 'Nouvel objectif',
    'savings.editPocket': "Modifier l'objectif",
    'savings.fieldName': 'Nom',
    'savings.fieldNamePlaceholder': 'Ex : Vacances',
    'savings.fieldTarget': 'Objectif (montant a atteindre)',
    'savings.fieldColor': 'Couleur',
    'savings.addOn': 'Verser sur {name}',
    'savings.editContribution': 'Modifier le versement',
    'savings.fieldAmount': 'Montant verse',
    'savings.fieldAmountHint': 'Negatif pour retirer de la pochette',
    'savings.fieldDate': 'Date du versement',
    'savings.datePlaceholder': 'JJ/MM/AAAA',
    'savings.monthHint': "Un versement date de ce mois est deduit de l'argent disponible du mois.",
    'savings.fieldNote': 'Note',
    'savings.fieldNotePlaceholder': 'Optionnel',
    'savings.submitContribute': 'Valider',
    'savings.nameRequired': 'Donne un nom a ton objectif.',
    'savings.amountRequired': 'Saisis un montant.',
    'savings.created': 'Objectif cree',
    'savings.updated': 'Epargne mise a jour',
    'savings.deleted': 'Objectif supprime',
    'savings.contributionDeleted': 'Versement supprime',
    'savings.historyTitle': 'Versements',
    'savings.historyHint': 'Touche un versement pour le modifier ou le supprimer.',
    'savings.historyEmpty': 'Aucun versement pour le moment.',
    'savings.showContributions': 'Voir les versements ({count})',
    'savings.hideContributions': 'Masquer les versements',
    'savings.deposit': 'Depot',
    'savings.withdraw': 'Retrait',
  },
  en: {
    'savings.title': 'Savings',
    'savings.subtitle': 'Your goals',
    'savings.totalLabel': 'Total savings',
    'savings.pocketCount': '{count} goal(s)',
    'savings.emptyTitle': 'No goals',
    'savings.emptyText': 'Create a savings goal to start setting money aside.',
    'savings.deleteTitle': 'Delete',
    'savings.deleteConfirm': 'Delete "{name}"?',
    'savings.cancel': 'Cancel',
    'savings.delete': 'Delete',
    'savings.newPocket': 'New goal',
    'savings.editPocket': 'Edit goal',
    'savings.fieldName': 'Name',
    'savings.fieldNamePlaceholder': 'e.g. Holidays',
    'savings.fieldTarget': 'Goal (target amount)',
    'savings.fieldColor': 'Color',
    'savings.addOn': 'Add to {name}',
    'savings.editContribution': 'Edit contribution',
    'savings.fieldAmount': 'Amount added',
    'savings.fieldAmountHint': 'Negative to withdraw from the pocket',
    'savings.fieldDate': 'Contribution date',
    'savings.datePlaceholder': 'DD/MM/YYYY',
    'savings.monthHint': "A contribution dated this month is deducted from this month's available money.",
    'savings.fieldNote': 'Note',
    'savings.fieldNotePlaceholder': 'Optional',
    'savings.submitContribute': 'Confirm',
    'savings.nameRequired': 'Give your goal a name.',
    'savings.amountRequired': 'Enter an amount.',
    'savings.created': 'Goal created',
    'savings.updated': 'Savings updated',
    'savings.deleted': 'Goal deleted',
    'savings.contributionDeleted': 'Contribution deleted',
    'savings.historyTitle': 'Contributions',
    'savings.historyHint': 'Tap a contribution to edit or delete it.',
    'savings.historyEmpty': 'No contributions yet.',
    'savings.showContributions': 'View contributions ({count})',
    'savings.hideContributions': 'Hide contributions',
    'savings.deposit': 'Deposit',
    'savings.withdraw': 'Withdrawal',
  },
});

export default function SavingsScreen() {
  const t = useT();
  const toast = useToast();
  useCurrency(); // re-rend l'ecran quand la devise par defaut change
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false); // evite le flash d'etat vide au 1er chargement
  const [refreshing, setRefreshing] = useState(false);
  const [createSheet, setCreateSheet] = useState(false);
  const [contribTarget, setContribTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null); // pochette en cours de modification
  const [editContrib, setEditContrib] = useState(null); // { saving, contribution }
  const [expandedId, setExpandedId] = useState(null); // pochette dont l'historique est deplie

  const load = useCallback(async () => {
    try {
      setItems(await Savings.list());
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoaded(true);
      setRefreshing(false);
    }
  }, [toast]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // Montants stockes en euro (base) ; euro() convertit vers la devise d'affichage.
  const total = items.reduce((s, v) => s + (v.currentAmount || 0), 0);

  // create / contribute passent par FormSheet : en cas d'erreur reseau,
  // l'exception remonte et FormSheet l'affiche (toast) sans fermer la feuille.
  const create = async (v) => {
    if (!v.name?.trim()) throw new Error(t('savings.nameRequired'));
    await Savings.create({
      name: v.name.trim(),
      targetAmount: fromDisplay(Number(v.target) || 0),
      color: v.color || palette[0],
    });
    toast.success(t('savings.created'));
    load();
  };

  const contribute = async (v) => {
    if (!Number(v.amount)) throw new Error(t('savings.amountRequired'));
    const payload = { amount: fromDisplay(Number(v.amount)), note: v.note || '' };
    const iso = parseDateInput(v.date);
    if (iso) payload.date = iso;
    await Savings.contribute(contribTarget._id, payload);
    toast.success(t('savings.updated'));
    setContribTarget(null);
    load();
  };

  // Modification d'un versement existant (montant / date / note).
  const saveContrib = async (v) => {
    if (!Number(v.amount)) throw new Error(t('savings.amountRequired'));
    const payload = { amount: fromDisplay(Number(v.amount)), note: v.note || '' };
    const iso = parseDateInput(v.date);
    if (iso) payload.date = iso;
    await Savings.updateContribution(editContrib.saving._id, editContrib.contribution._id, payload);
    toast.success(t('savings.updated'));
    setEditContrib(null);
    load();
  };

  const deleteContrib = async (saving, contribution) => {
    setEditContrib(null);
    const ok = await confirmAction({
      title: t('savings.deleteTitle'),
      message: `${euro(contribution.amount)} · ${shortDate(contribution.date)}`,
      confirmLabel: t('savings.delete'),
      cancelLabel: t('savings.cancel'),
      destructive: true,
    });
    if (!ok) return;
    try {
      await Savings.removeContribution(saving._id, contribution._id);
      toast.success(t('savings.contributionDeleted'));
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  // Modification d'une pochette : nom, objectif, couleur.
  const saveEdit = async (v) => {
    if (!v.name?.trim()) throw new Error(t('savings.nameRequired'));
    await Savings.update(editTarget._id, {
      name: v.name.trim(),
      targetAmount: fromDisplay(Number(v.target) || 0),
      color: v.color || editTarget.color || palette[0],
    });
    toast.success(t('savings.updated'));
    setEditTarget(null);
    load();
  };

  const confirmDelete = async (item) => {
    const ok = await confirmAction({
      title: t('savings.deleteTitle'),
      message: t('savings.deleteConfirm', { name: item.name }),
      confirmLabel: t('savings.delete'),
      cancelLabel: t('savings.cancel'),
      destructive: true,
    });
    if (!ok) return;
    try {
      await Savings.remove(item._id);
      toast.success(t('savings.deleted'));
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <>
      <Screen
        title={t('savings.title')}
        subtitle={t('savings.subtitle')}
        action={<AddButton onPress={() => setCreateSheet(true)} />}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          load();
        }}
      >
        <GradientCard style={{ marginBottom: spacing.lg }}>
          <Text style={styles.totalLabel}>{t('savings.totalLabel')}</Text>
          <Text style={styles.totalValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
            {euro(total)}
          </Text>
          <Text style={styles.totalSub}>{t('savings.pocketCount', { count: items.length })}</Text>
        </GradientCard>

        {!loaded && items.length === 0 ? (
          <View style={{ gap: spacing.lg }}>
            <SkeletonCard lines={2} />
            <SkeletonCard lines={2} />
          </View>
        ) : items.length === 0 ? (
          <Card>
            <EmptyState title={t('savings.emptyTitle')} text={t('savings.emptyText')} />
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
              onEdit={() => setEditTarget(item)}
              onPress={() => setExpandedId((id) => (id === item._id ? null : item._id))}
              expanded={expandedId === item._id}
              expandHint={
                expandedId === item._id
                  ? t('savings.hideContributions')
                  : t('savings.showContributions', { count: (item.contributions || []).length })
              }
              onLongPress={() => confirmDelete(item)}
            >
              <ContributionHistory
                t={t}
                contributions={item.contributions}
                onEdit={(c) => setEditContrib({ saving: item, contribution: c })}
              />
            </GoalCard>
          ))
        )}
      </Screen>

      <FormSheet
        visible={createSheet}
        title={t('savings.newPocket')}
        fields={[
          { key: 'name', label: t('savings.fieldName'), type: 'text', placeholder: t('savings.fieldNamePlaceholder') },
          { key: 'target', label: t('savings.fieldTarget'), type: 'number', placeholder: '0' },
          {
            key: 'color',
            label: t('savings.fieldColor'),
            type: 'select',
            options: palette.map((c) => ({ label: ' ', value: c, color: c })),
          },
        ]}
        initial={{ color: palette[2] }}
        onSubmit={create}
        onClose={() => setCreateSheet(false)}
      />

      {/* Versement : montant + date (defaut aujourd'hui) + note. Rappel que le
          mois courant est deduit de l'argent disponible. */}
      <FormSheet
        visible={!!contribTarget}
        title={contribTarget ? t('savings.addOn', { name: contribTarget.name }) : ''}
        fields={[
          {
            key: 'amount',
            label: t('savings.fieldAmount'),
            type: 'number',
            placeholder: '0',
            hint: t('savings.fieldAmountHint'),
          },
          { key: 'date', label: t('savings.fieldDate'), type: 'date', placeholder: t('savings.datePlaceholder') },
          { key: 'note', label: t('savings.fieldNote'), type: 'text', placeholder: t('savings.fieldNotePlaceholder') },
        ]}
        initial={{ date: dateInput() }}
        footnote={t('savings.monthHint')}
        submitLabel={t('savings.submitContribute')}
        onSubmit={contribute}
        onClose={() => setContribTarget(null)}
      />

      {/* Modification d'un versement existant */}
      <FormSheet
        visible={!!editContrib}
        title={t('savings.editContribution')}
        fields={[
          {
            key: 'amount',
            label: t('savings.fieldAmount'),
            type: 'number',
            placeholder: '0',
            hint: t('savings.fieldAmountHint'),
          },
          { key: 'date', label: t('savings.fieldDate'), type: 'date', placeholder: t('savings.datePlaceholder') },
          { key: 'note', label: t('savings.fieldNote'), type: 'text', placeholder: t('savings.fieldNotePlaceholder') },
        ]}
        initial={
          editContrib
            ? {
                amount: String(toDisplay(editContrib.contribution.amount)),
                date: dateInput(editContrib.contribution.date),
                note: editContrib.contribution.note || '',
              }
            : {}
        }
        footnote={t('savings.monthHint')}
        submitLabel={t('savings.submitContribute')}
        onSubmit={saveContrib}
        onClose={() => setEditContrib(null)}
        onDelete={editContrib ? () => deleteContrib(editContrib.saving, editContrib.contribution) : undefined}
        deleteLabel={t('savings.delete')}
      />

      {/* Modification d'une pochette : nom, objectif, couleur */}
      <FormSheet
        visible={!!editTarget}
        title={t('savings.editPocket')}
        fields={[
          { key: 'name', label: t('savings.fieldName'), type: 'text', placeholder: t('savings.fieldNamePlaceholder') },
          { key: 'target', label: t('savings.fieldTarget'), type: 'number', placeholder: '0' },
          {
            key: 'color',
            label: t('savings.fieldColor'),
            type: 'select',
            options: palette.map((c) => ({ label: ' ', value: c, color: c })),
          },
        ]}
        initial={
          editTarget
            ? {
                name: editTarget.name || '',
                target: editTarget.targetAmount != null ? String(toDisplay(editTarget.targetAmount)) : '',
                color: editTarget.color || palette[0],
              }
            : {}
        }
        onSubmit={saveEdit}
        onClose={() => setEditTarget(null)}
        onDelete={editTarget ? () => { setEditTarget(null); confirmDelete(editTarget); } : undefined}
        deleteLabel={t('savings.delete')}
      />
    </>
  );
}

// Historique des versements d'une pochette (du plus recent au plus ancien).
// Chaque ligne est tactile -> ouvre la feuille d'edition du versement.
function ContributionHistory({ t, contributions, onEdit }) {
  const list = [...(contributions || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
  return (
    <View>
      <Text style={styles.historyTitle}>{t('savings.historyTitle')}</Text>
      {list.length === 0 ? (
        <Text style={styles.historyEmpty}>{t('savings.historyEmpty')}</Text>
      ) : (
        <>
        <Text style={styles.historyHint}>{t('savings.historyHint')}</Text>
        {list.map((c) => {
          const positive = Number(c.amount) >= 0;
          return (
            <Pressable
              key={c._id}
              onPress={() => onEdit(c)}
              style={({ pressed }) => [styles.contribRow, pressed && { opacity: 0.6 }]}
            >
              <Glyph name={positive ? 'arrowDown' : 'arrowUp'} color={positive ? colors.positive : colors.negative} size={16} />
              <View style={{ flex: 1, marginLeft: spacing.sm }}>
                <Text style={styles.contribLabel} numberOfLines={1}>
                  {c.note?.trim() ? c.note : positive ? t('savings.deposit') : t('savings.withdraw')}
                </Text>
                <Text style={styles.contribDate}>{shortDate(c.date)}</Text>
              </View>
              <Text style={[styles.contribAmount, { color: positive ? colors.positive : colors.negative }]}>
                {moneyForDate(c.amount, c.date, { sign: true })}
              </Text>
            </Pressable>
          );
        })}
        </>
      )}
    </View>
  );
}

const styles = {
  totalLabel: { color: colors.textOnBrandMuted, fontSize: 14, fontWeight: '600' },
  totalValue: { color: '#fff', fontFamily: 'Manrope_800ExtraBold', fontSize: 38, marginTop: 4, letterSpacing: -1 },
  totalSub: { color: colors.textOnBrandMuted, fontSize: 13, fontWeight: '600', marginTop: 4 },
  historyTitle: { ...font.label, marginBottom: spacing.xs },
  historyHint: { ...font.caption, marginBottom: spacing.sm },
  historyEmpty: { ...font.caption, paddingVertical: spacing.sm },
  contribRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  contribLabel: { fontFamily: ff.semibold, fontSize: 14, color: colors.text },
  contribDate: { ...font.caption, marginTop: 1 },
  contribAmount: { fontFamily: ff.bold, fontSize: 15, marginLeft: spacing.sm },
};
