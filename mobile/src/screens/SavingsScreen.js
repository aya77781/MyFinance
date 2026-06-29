import { useState, useCallback } from 'react';
import { View, Text, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import Screen from '../components/Screen';
import Card from '../components/Card';
import AddButton from '../components/AddButton';
import GoalCard from '../components/GoalCard';
import GradientCard from '../components/GradientCard';
import FormSheet from '../components/FormSheet';
import EmptyState from '../components/EmptyState';
import { SkeletonCard } from '../components/Skeleton';
import { useToast } from '../components/Toast';
import { colors, spacing, font, radius, palette } from '../theme';
import { euro } from '../format';
import { Savings } from '../api';
import { useT, registerTranslations } from '../i18n';

registerTranslations({
  fr: {
    'savings.title': 'Epargne',
    'savings.subtitle': 'Tes pochettes',
    'savings.totalLabel': 'Total epargne',
    'savings.pocketCount': '{count} pochette(s)',
    'savings.emptyTitle': 'Aucune pochette',
    'savings.emptyText': "Cree un objectif d'epargne pour commencer a mettre de cote.",
    'savings.deleteTitle': 'Supprimer',
    'savings.deleteConfirm': 'Supprimer "{name}" ?',
    'savings.cancel': 'Annuler',
    'savings.delete': 'Supprimer',
    'savings.newPocket': 'Nouvelle pochette',
    'savings.fieldName': 'Nom',
    'savings.fieldNamePlaceholder': 'Ex : Vacances',
    'savings.fieldTarget': 'Objectif',
    'savings.fieldColor': 'Couleur',
    'savings.addOn': 'Ajouter sur {name}',
    'savings.fieldAmount': 'Montant (negatif pour retirer)',
    'savings.fieldNote': 'Note',
    'savings.fieldNotePlaceholder': 'Optionnel',
    'savings.submitContribute': 'Valider',
    'savings.nameRequired': 'Donne un nom a ta pochette.',
    'savings.amountRequired': 'Saisis un montant.',
    'savings.created': 'Pochette creee',
    'savings.updated': 'Epargne mise a jour',
  },
  en: {
    'savings.title': 'Savings',
    'savings.subtitle': 'Your pockets',
    'savings.totalLabel': 'Total savings',
    'savings.pocketCount': '{count} pocket(s)',
    'savings.emptyTitle': 'No pockets',
    'savings.emptyText': 'Create a savings goal to start setting money aside.',
    'savings.deleteTitle': 'Delete',
    'savings.deleteConfirm': 'Delete "{name}"?',
    'savings.cancel': 'Cancel',
    'savings.delete': 'Delete',
    'savings.newPocket': 'New pocket',
    'savings.fieldName': 'Name',
    'savings.fieldNamePlaceholder': 'e.g. Holidays',
    'savings.fieldTarget': 'Goal',
    'savings.fieldColor': 'Color',
    'savings.addOn': 'Add to {name}',
    'savings.fieldAmount': 'Amount (negative to withdraw)',
    'savings.fieldNote': 'Note',
    'savings.fieldNotePlaceholder': 'Optional',
    'savings.submitContribute': 'Confirm',
    'savings.nameRequired': 'Give your pocket a name.',
    'savings.amountRequired': 'Enter an amount.',
    'savings.created': 'Pocket created',
    'savings.updated': 'Savings updated',
  },
});

export default function SavingsScreen() {
  const t = useT();
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false); // evite le flash d'etat vide au 1er chargement
  const [refreshing, setRefreshing] = useState(false);
  const [createSheet, setCreateSheet] = useState(false);
  const [contribTarget, setContribTarget] = useState(null);

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

  const total = items.reduce((s, v) => s + v.currentAmount, 0);

  // create / contribute passent par FormSheet : en cas d'erreur reseau,
  // l'exception remonte et FormSheet l'affiche (toast) sans fermer la feuille.
  const create = async (v) => {
    if (!v.name) throw new Error(t('savings.nameRequired'));
    await Savings.create({
      name: v.name,
      targetAmount: Number(v.target) || 0,
      color: v.color || palette[0],
    });
    toast.success(t('savings.created'));
    load();
  };

  const contribute = async (v) => {
    if (!Number(v.amount)) throw new Error(t('savings.amountRequired'));
    await Savings.contribute(contribTarget._id, { amount: Number(v.amount), note: v.note || '' });
    toast.success(t('savings.updated'));
    setContribTarget(null);
    load();
  };

  const confirmDelete = (item) => {
    Alert.alert(t('savings.deleteTitle'), t('savings.deleteConfirm', { name: item.name }), [
      { text: t('savings.cancel'), style: 'cancel' },
      {
        text: t('savings.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await Savings.remove(item._id);
            load();
          } catch (e) {
            toast.error(e.message);
          }
        },
      },
    ]);
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
              onLongPress={() => confirmDelete(item)}
            />
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

      <FormSheet
        visible={!!contribTarget}
        title={contribTarget ? t('savings.addOn', { name: contribTarget.name }) : ''}
        fields={[
          { key: 'amount', label: t('savings.fieldAmount'), type: 'number', placeholder: '0' },
          { key: 'note', label: t('savings.fieldNote'), type: 'text', placeholder: t('savings.fieldNotePlaceholder') },
        ]}
        submitLabel={t('savings.submitContribute')}
        onSubmit={contribute}
        onClose={() => setContribTarget(null)}
      />
    </>
  );
}

const styles = {
  totalLabel: { color: colors.textOnBrandMuted, fontSize: 14, fontWeight: '600' },
  totalValue: { color: '#fff', fontFamily: 'Manrope_800ExtraBold', fontSize: 38, marginTop: 4, letterSpacing: -1 },
  totalSub: { color: colors.textOnBrandMuted, fontSize: 13, fontWeight: '600', marginTop: 4 },
};
