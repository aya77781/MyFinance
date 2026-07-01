import { useState, useCallback } from 'react';
import { View, Text, Pressable, Alert, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import Screen from '../components/Screen';
import Card from '../components/Card';
import AddButton from '../components/AddButton';
import { useToast } from '../components/Toast';
import GradientCard from '../components/GradientCard';
import FormSheet from '../components/FormSheet';
import EmptyState from '../components/EmptyState';
import { colors, spacing, radius, ff } from '../theme';
import { euro, dateInput, parseDateInput, shortDate, toDisplay, fromDisplay } from '../format';
import { Opportunities } from '../api';
import { useT, registerTranslations } from '../i18n';

registerTranslations({
  fr: {
    'opportunities.title': 'Opportunites',
    'opportunities.subtitle': 'Suis tes placements & paris',
    'opportunities.bannerLabel': 'Resultat net',
    'opportunities.bannerSub':
      '{engaged} engages · {open} en cours · {won} gagnees · {paid} payees · {lost} perdues',
    'opportunities.statusOpen': 'En cours',
    'opportunities.statusWon': 'Gagne',
    'opportunities.statusPaid': 'Paye',
    'opportunities.statusLost': 'Perdu',
    'opportunities.filterAll': 'Toutes',
    'opportunities.filterOpen': 'En cours',
    'opportunities.filterWon': 'Gagnees',
    'opportunities.filterPaid': 'Payees',
    'opportunities.filterLost': 'Perdues',
    'opportunities.emptyTitle': 'Aucune opportunite',
    'opportunities.emptyText':
      'Ajoute un placement ou un pari et marque-le gagne, perdu ou en cours.',
    'opportunities.engaged': '{amount} engages',
    'opportunities.wonOn': ' · gagne le {date}',
    'opportunities.closedOn': ' · cloture le {date}',
    'opportunities.paidOn': ' · paye le {date}',
    'opportunities.deleteTitle': 'Supprimer',
    'opportunities.deleteConfirm': 'Supprimer "{title}" ?',
    'opportunities.titleRequired': 'Donne un titre a cette opportunite.',
    'opportunities.cancel': 'Annuler',
    'opportunities.delete': 'Supprimer',
    'opportunities.newTitle': 'Nouvelle opportunite',
    'opportunities.submitSave': 'Enregistrer',
    'opportunities.fieldTitle': 'Titre',
    'opportunities.fieldTitlePlaceholder': 'Ex : Action Tesla',
    'opportunities.fieldDescription': 'Description',
    'opportunities.fieldDescriptionPlaceholder': 'Optionnel',
    'opportunities.fieldAmount': 'Montant engage',
    'opportunities.fieldDate': "Date de l'opportunite",
    'opportunities.fieldStatus': 'Statut',
    'opportunities.fieldResult': 'Resultat (gain / perte)',
    'opportunities.fieldClosedDateLost': 'Date de cloture',
    'opportunities.fieldClosedDateWon': 'Date du gain',
    'opportunities.fieldPaidDate': 'Date du paiement',
    'opportunities.datePlaceholder': 'JJ/MM/AAAA',
  },
  en: {
    'opportunities.title': 'Opportunities',
    'opportunities.subtitle': 'Track your investments & bets',
    'opportunities.bannerLabel': 'Net result',
    'opportunities.bannerSub':
      '{engaged} invested · {open} open · {won} won · {paid} paid · {lost} lost',
    'opportunities.statusOpen': 'Open',
    'opportunities.statusWon': 'Won',
    'opportunities.statusPaid': 'Paid',
    'opportunities.statusLost': 'Lost',
    'opportunities.filterAll': 'All',
    'opportunities.filterOpen': 'Open',
    'opportunities.filterWon': 'Won',
    'opportunities.filterPaid': 'Paid',
    'opportunities.filterLost': 'Lost',
    'opportunities.emptyTitle': 'No opportunities',
    'opportunities.emptyText':
      'Add an investment or a bet and mark it won, lost or open.',
    'opportunities.engaged': '{amount} invested',
    'opportunities.wonOn': ' · won on {date}',
    'opportunities.closedOn': ' · closed on {date}',
    'opportunities.paidOn': ' · paid on {date}',
    'opportunities.deleteTitle': 'Delete',
    'opportunities.deleteConfirm': 'Delete "{title}"?',
    'opportunities.titleRequired': 'Give this opportunity a title.',
    'opportunities.cancel': 'Cancel',
    'opportunities.delete': 'Delete',
    'opportunities.newTitle': 'New opportunity',
    'opportunities.submitSave': 'Save',
    'opportunities.fieldTitle': 'Title',
    'opportunities.fieldTitlePlaceholder': 'e.g. Tesla stock',
    'opportunities.fieldDescription': 'Description',
    'opportunities.fieldDescriptionPlaceholder': 'Optional',
    'opportunities.fieldAmount': 'Amount invested',
    'opportunities.fieldDate': 'Opportunity date',
    'opportunities.fieldStatus': 'Status',
    'opportunities.fieldResult': 'Result (gain / loss)',
    'opportunities.fieldClosedDateLost': 'Close date',
    'opportunities.fieldClosedDateWon': 'Win date',
    'opportunities.fieldPaidDate': 'Payment date',
    'opportunities.datePlaceholder': 'DD/MM/YYYY',
  },
});

// Metadonnees d'affichage par statut (labelKey resolu au rendu via t()).
const STATUS = {
  open: { labelKey: 'opportunities.statusOpen', color: colors.warning },
  won: { labelKey: 'opportunities.statusWon', color: colors.positive },
  paid: { labelKey: 'opportunities.statusPaid', color: '#38BDF8' },
  lost: { labelKey: 'opportunities.statusLost', color: colors.negative },
};

// Onglets de filtre (le 1er affiche tout) ; libelles resolus au rendu.
const FILTERS = [
  { key: 'all', labelKey: 'opportunities.filterAll' },
  { key: 'open', labelKey: 'opportunities.filterOpen' },
  { key: 'won', labelKey: 'opportunities.filterWon' },
  { key: 'paid', labelKey: 'opportunities.filterPaid' },
  { key: 'lost', labelKey: 'opportunities.filterLost' },
];

// Options de statut pour les formulaires (Paye vient apres Gagne) ; labelKey resolu au rendu.
const STATUS_OPTIONS = [
  { labelKey: 'opportunities.statusOpen', value: 'open' },
  { labelKey: 'opportunities.statusWon', value: 'won' },
  { labelKey: 'opportunities.statusPaid', value: 'paid' },
  { labelKey: 'opportunities.statusLost', value: 'lost' },
];

export default function OpportunitiesScreen() {
  const t = useT();
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [createSheet, setCreateSheet] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const load = useCallback(async () => {
    try {
      setItems(await Opportunities.list());
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

  // Convertit une magnitude saisie + un statut en resultat signe (gain + / perte -).
  const signedResult = (status, magnitude) => {
    const m = Math.abs(Number(magnitude) || 0);
    if (status === 'won' || status === 'paid') return m;
    if (status === 'lost') return -m;
    return 0;
  };

  // Construit le document a partir des valeurs du formulaire (avec les dates).
  const buildPayload = (v) => {
    const status = v.status || 'open';
    const today = parseDateInput(dateInput());
    const date = parseDateInput(v.date) || today;
    const closedAt =
      status === 'won' || status === 'lost' || status === 'paid'
        ? parseDateInput(v.closedDate) || today
        : null;
    const paidAt = status === 'paid' ? parseDateInput(v.paidDate) || today : null;
    return {
      title: v.title,
      description: v.description || '',
      amount: fromDisplay(Number(v.amount) || 0),
      status,
      result: fromDisplay(signedResult(status, v.result)),
      date,
      closedAt,
      paidAt,
    };
  };

  const create = async (v) => {
    if (!v.title?.trim()) throw new Error(t('opportunities.titleRequired'));
    await Opportunities.create(buildPayload(v));
    load();
  };

  const saveEdit = async (v) => {
    if (!v.title?.trim()) throw new Error(t('opportunities.titleRequired'));
    await Opportunities.update(editTarget._id, buildPayload(v));
    setEditTarget(null);
    load();
  };

  // Champs du formulaire, dependants du statut choisi (dates conditionnelles).
  const opportunityFields = (v) => {
    const st = v.status || 'open';
    const showClosed = st === 'won' || st === 'lost' || st === 'paid';
    const closedLabel = t(
      st === 'lost' ? 'opportunities.fieldClosedDateLost' : 'opportunities.fieldClosedDateWon'
    );
    const datePh = t('opportunities.datePlaceholder');
    return [
      {
        key: 'title',
        label: t('opportunities.fieldTitle'),
        type: 'text',
        placeholder: t('opportunities.fieldTitlePlaceholder'),
      },
      {
        key: 'description',
        label: t('opportunities.fieldDescription'),
        type: 'text',
        placeholder: t('opportunities.fieldDescriptionPlaceholder'),
      },
      { key: 'amount', label: t('opportunities.fieldAmount'), type: 'number', placeholder: '0' },
      { key: 'date', label: t('opportunities.fieldDate'), type: 'date', placeholder: datePh },
      {
        key: 'status',
        label: t('opportunities.fieldStatus'),
        type: 'select',
        options: STATUS_OPTIONS.map((o) => ({ label: t(o.labelKey), value: o.value })),
      },
      st !== 'open'
        ? {
            key: 'result',
            label: t('opportunities.fieldResult'),
            type: 'number',
            placeholder: '0',
          }
        : null,
      showClosed
        ? { key: 'closedDate', label: closedLabel, type: 'date', placeholder: datePh }
        : null,
      st === 'paid'
        ? {
            key: 'paidDate',
            label: t('opportunities.fieldPaidDate'),
            type: 'date',
            placeholder: datePh,
          }
        : null,
    ].filter(Boolean);
  };

  const confirmDelete = (item) => {
    Alert.alert(
      t('opportunities.deleteTitle'),
      t('opportunities.deleteConfirm', { title: item.title }),
      [
      { text: t('opportunities.cancel'), style: 'cancel' },
      {
        text: t('opportunities.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await Opportunities.remove(item._id);
            load();
          } catch (e) {
            toast.error(e.message);
          }
        },
      },
      ]
    );
  };

  const visible = filter === 'all' ? items : items.filter((o) => o.status === filter);

  const engaged = items
    .filter((o) => o.status === 'open')
    .reduce((s, o) => s + (Number(o.amount) || 0), 0);
  const net = items.reduce((s, o) => s + (Number(o.result) || 0), 0);

  return (
    <>
      <Screen
        title={t('opportunities.title')}
        subtitle={t('opportunities.subtitle')}
        action={<AddButton onPress={() => setCreateSheet(true)} />}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          load();
        }}
      >
        <GradientCard style={{ marginBottom: spacing.lg }}>
          <Text style={styles.bannerLabel}>{t('opportunities.bannerLabel')}</Text>
          <Text
            style={[styles.bannerValue, { color: net < 0 ? colors.negative : '#fff' }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.6}
          >
            {euro(net, { sign: net !== 0 })}
          </Text>
          <Text style={styles.bannerSub}>
            {t('opportunities.bannerSub', {
              engaged: euro(engaged),
              open: items.filter((o) => o.status === 'open').length,
              won: items.filter((o) => o.status === 'won').length,
              paid: items.filter((o) => o.status === 'paid').length,
              lost: items.filter((o) => o.status === 'lost').length,
            })}
          </Text>
        </GradientCard>

        {/* Filtres par statut : defilables pour ne pas tronquer les libelles sur mobile */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => setFilter(f.key)}
                style={[styles.filter, active && styles.filterActive]}
              >
                <Text style={[styles.filterText, active && styles.filterTextActive]}>
                  {t(f.labelKey)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {visible.length === 0 ? (
          <Card>
            <EmptyState
              title={t('opportunities.emptyTitle')}
              text={t('opportunities.emptyText')}
            />
          </Card>
        ) : (
          <View style={{ gap: spacing.md }}>
            {visible.map((o) => {
              const meta = STATUS[o.status] || STATUS.open;
              const closed = o.status !== 'open';
              return (
                <Pressable
                  key={o._id}
                  onPress={() =>
                    setEditTarget({ ...o, resultMag: Math.abs(Number(o.result) || 0) })
                  }
                  onLongPress={() => confirmDelete(o)}
                >
                  <Card>
                    <View style={styles.head}>
                      <Text style={styles.title} numberOfLines={1}>
                        {o.title}
                      </Text>
                      <View style={[styles.badge, { backgroundColor: `${meta.color}1A` }]}>
                        <Text style={[styles.badgeText, { color: meta.color }]}>
                          {t(meta.labelKey)}
                        </Text>
                      </View>
                    </View>

                    {o.description ? (
                      <Text style={styles.desc} numberOfLines={2}>
                        {o.description}
                      </Text>
                    ) : null}

                    <View style={styles.metaRow}>
                      <Text style={styles.amount}>
                        {t('opportunities.engaged', { amount: euro(o.amount) })}
                      </Text>
                      {closed ? (
                        <Text
                          style={[
                            styles.result,
                            { color: o.result < 0 ? colors.negative : colors.positive },
                          ]}
                        >
                          {euro(o.result, { sign: true })}
                        </Text>
                      ) : null}
                    </View>

                    <Text style={styles.dateLine} numberOfLines={1}>
                      {o.date ? shortDate(o.date) : ''}
                      {o.status === 'won' && o.closedAt
                        ? t('opportunities.wonOn', { date: shortDate(o.closedAt) })
                        : ''}
                      {o.status === 'lost' && o.closedAt
                        ? t('opportunities.closedOn', { date: shortDate(o.closedAt) })
                        : ''}
                      {o.status === 'paid' && o.closedAt
                        ? t('opportunities.wonOn', { date: shortDate(o.closedAt) })
                        : ''}
                      {o.status === 'paid' && o.paidAt
                        ? t('opportunities.paidOn', { date: shortDate(o.paidAt) })
                        : ''}
                    </Text>
                  </Card>
                </Pressable>
              );
            })}
          </View>
        )}
      </Screen>

      {/* Creation */}
      <FormSheet
        visible={createSheet}
        title={t('opportunities.newTitle')}
        fields={opportunityFields}
        initial={{ status: 'open', date: dateInput() }}
        onSubmit={create}
        onClose={() => setCreateSheet(false)}
      />

      {/* Edition / changement de statut */}
      <FormSheet
        visible={!!editTarget}
        title={editTarget ? editTarget.title : ''}
        fields={opportunityFields}
        initial={
          editTarget
            ? {
                title: editTarget.title,
                description: editTarget.description,
                amount: toDisplay(editTarget.amount),
                status: editTarget.status,
                result: toDisplay(editTarget.resultMag),
                date: dateInput(editTarget.date || editTarget.createdAt),
                closedDate: editTarget.closedAt ? dateInput(editTarget.closedAt) : '',
                paidDate: editTarget.paidAt ? dateInput(editTarget.paidAt) : '',
              }
            : {}
        }
        submitLabel={t('opportunities.submitSave')}
        onSubmit={saveEdit}
        onClose={() => setEditTarget(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  bannerLabel: { color: colors.textOnBrandMuted, fontSize: 14, fontWeight: '600' },
  bannerValue: {
    color: '#fff',
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 38,
    marginTop: 4,
    letterSpacing: -1,
  },
  bannerSub: { color: colors.textOnBrandMuted, fontSize: 12.5, fontWeight: '600', marginTop: 6 },

  filters: { flexDirection: 'row', gap: spacing.sm, paddingBottom: spacing.lg, paddingRight: spacing.xs },
  filter: {
    height: 38,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    backgroundColor: colors.bgSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterActive: { backgroundColor: colors.primary },
  filterText: { fontFamily: ff.semibold, fontSize: 12.5, color: colors.text },
  filterTextActive: { color: colors.textOnTeal },

  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  title: { flex: 1, fontFamily: ff.bold, fontSize: 16.5, color: colors.text },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.full },
  badgeText: { fontFamily: ff.semibold, fontSize: 11.5 },
  desc: { fontFamily: ff.medium, fontSize: 13.5, color: colors.textMuted, lineHeight: 19, marginTop: 6 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  amount: { fontFamily: ff.semibold, fontSize: 13.5, color: colors.text },
  result: { fontFamily: ff.bold, fontSize: 15 },
  dateLine: { fontFamily: ff.medium, fontSize: 12, color: colors.textMuted, marginTop: 8, textTransform: 'capitalize' },
});
