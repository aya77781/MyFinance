import { useState, useCallback } from 'react';
import { View, Text, Pressable, Alert, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import Screen from '../components/Screen';
import Card from '../components/Card';
import AddButton from '../components/AddButton';
import GradientCard from '../components/GradientCard';
import FormSheet from '../components/FormSheet';
import EmptyState from '../components/EmptyState';
import { colors, spacing, radius, ff } from '../theme';
import { euro } from '../format';
import { Opportunities } from '../api';

// Metadonnees d'affichage par statut.
const STATUS = {
  open: { label: 'En cours', color: colors.warning },
  won: { label: 'Gagne', color: colors.positive },
  lost: { label: 'Perdu', color: colors.negative },
};

// Onglets de filtre (le 1er affiche tout).
const FILTERS = [
  { key: 'all', label: 'Toutes' },
  { key: 'open', label: 'En cours' },
  { key: 'won', label: 'Gagnees' },
  { key: 'lost', label: 'Perdues' },
];

// Options de statut pour les formulaires.
const STATUS_OPTIONS = [
  { label: 'En cours', value: 'open' },
  { label: 'Gagne', value: 'won' },
  { label: 'Perdu', value: 'lost' },
];

export default function OpportunitiesScreen() {
  const [items, setItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [createSheet, setCreateSheet] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const load = useCallback(async () => {
    try {
      setItems(await Opportunities.list());
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

  // Convertit une magnitude saisie + un statut en resultat signe (gain + / perte -).
  const signedResult = (status, magnitude) => {
    const m = Math.abs(Number(magnitude) || 0);
    if (status === 'won') return m;
    if (status === 'lost') return -m;
    return 0;
  };

  const create = async (v) => {
    if (!v.title) return;
    const status = v.status || 'open';
    await Opportunities.create({
      title: v.title,
      description: v.description || '',
      amount: Number(v.amount) || 0,
      status,
      result: signedResult(status, v.result),
    });
    load();
  };

  const saveEdit = async (v) => {
    const status = v.status || 'open';
    await Opportunities.update(editTarget._id, {
      title: v.title,
      description: v.description || '',
      amount: Number(v.amount) || 0,
      status,
      result: signedResult(status, v.result),
    });
    setEditTarget(null);
    load();
  };

  const confirmDelete = (item) => {
    Alert.alert('Supprimer', `Supprimer "${item.title}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          await Opportunities.remove(item._id);
          load();
        },
      },
    ]);
  };

  const visible = filter === 'all' ? items : items.filter((o) => o.status === filter);

  const engaged = items
    .filter((o) => o.status === 'open')
    .reduce((s, o) => s + (Number(o.amount) || 0), 0);
  const net = items.reduce((s, o) => s + (Number(o.result) || 0), 0);

  return (
    <>
      <Screen
        title="Opportunites"
        subtitle="Suis tes placements & paris"
        action={<AddButton onPress={() => setCreateSheet(true)} />}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          load();
        }}
      >
        <GradientCard style={{ marginBottom: spacing.lg }}>
          <Text style={styles.bannerLabel}>Resultat net</Text>
          <Text style={[styles.bannerValue, { color: net < 0 ? colors.negative : '#fff' }]}>
            {euro(net, { sign: net !== 0 })}
          </Text>
          <Text style={styles.bannerSub}>
            {euro(engaged)} engages ·{' '}
            {items.filter((o) => o.status === 'open').length} en cours ·{' '}
            {items.filter((o) => o.status === 'won').length} gagnees ·{' '}
            {items.filter((o) => o.status === 'lost').length} perdues
          </Text>
        </GradientCard>

        {/* Filtres par statut */}
        <View style={styles.filters}>
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => setFilter(f.key)}
                style={[styles.filter, active && styles.filterActive]}
              >
                <Text style={[styles.filterText, active && styles.filterTextActive]}>{f.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {visible.length === 0 ? (
          <Card>
            <EmptyState
              title="Aucune opportunite"
              text="Ajoute un placement ou un pari et marque-le gagne, perdu ou en cours."
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
                        <Text style={[styles.badgeText, { color: meta.color }]}>{meta.label}</Text>
                      </View>
                    </View>

                    {o.description ? (
                      <Text style={styles.desc} numberOfLines={2}>
                        {o.description}
                      </Text>
                    ) : null}

                    <View style={styles.metaRow}>
                      <Text style={styles.amount}>{euro(o.amount)} engages</Text>
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
        title="Nouvelle opportunite"
        fields={[
          { key: 'title', label: 'Titre', type: 'text', placeholder: 'Ex : Action Tesla' },
          { key: 'description', label: 'Description', type: 'text', placeholder: 'Optionnel' },
          { key: 'amount', label: 'Montant engage', type: 'number', placeholder: '0' },
          { key: 'status', label: 'Statut', type: 'select', options: STATUS_OPTIONS },
          {
            key: 'result',
            label: 'Resultat si cloturee (gain / perte)',
            type: 'number',
            placeholder: '0',
          },
        ]}
        initial={{ status: 'open' }}
        onSubmit={create}
        onClose={() => setCreateSheet(false)}
      />

      {/* Edition / changement de statut */}
      <FormSheet
        visible={!!editTarget}
        title={editTarget ? editTarget.title : ''}
        fields={[
          { key: 'title', label: 'Titre', type: 'text', placeholder: 'Titre' },
          { key: 'description', label: 'Description', type: 'text', placeholder: 'Optionnel' },
          { key: 'amount', label: 'Montant engage', type: 'number', placeholder: '0' },
          { key: 'status', label: 'Statut', type: 'select', options: STATUS_OPTIONS },
          { key: 'result', label: 'Resultat (gain / perte)', type: 'number', placeholder: '0' },
        ]}
        initial={
          editTarget
            ? {
                title: editTarget.title,
                description: editTarget.description,
                amount: editTarget.amount,
                status: editTarget.status,
                result: editTarget.resultMag,
              }
            : {}
        }
        submitLabel="Enregistrer"
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

  filters: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  filter: {
    flex: 1,
    height: 38,
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
});
