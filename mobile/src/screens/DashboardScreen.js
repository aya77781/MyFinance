import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, spacing, radius, font, ff, brandGradient } from '../theme';
import { euro, monthLabel } from '../format';
import { Dashboard } from '../api';
import { useAuth } from '../AuthContext';
import { useProfile } from '../ProfileContext';
import Card from '../components/Card';
import ActionTile from '../components/ActionTile';
import GaugeRing from '../components/GaugeRing';
import DonutChart from '../components/DonutChart';
import CategoryIcon from '../components/CategoryIcon';
import TransactionRow from '../components/TransactionRow';
import EmptyState from '../components/EmptyState';
import { Skeleton } from '../components/Skeleton';
import { useT, registerTranslations } from '../i18n';

registerTranslations({
  fr: {
    'dashboard.serverDown': 'Serveur injoignable',
    'dashboard.serverDownHint': 'Verifie que le backend tourne. ({error})',
    'dashboard.balanceLabel': 'Solde du mois · {month}',
    'dashboard.netLabel': 'SOLDE NET',
    'dashboard.savedRate': '{rate}% épargné',
    'dashboard.overspent': 'Dépenses > entrées',
    'dashboard.add': 'Ajouter',
    'dashboard.savings': 'Epargne',
    'dashboard.challenges': 'Challenges',
    'dashboard.budget': 'Budget',
    'dashboard.income': 'Entrees',
    'dashboard.expensesFlow': 'Sorties',
    'dashboard.analyses': 'Analyses',
    'dashboard.noExpensesTitle': 'Aucune depense ce mois',
    'dashboard.noExpensesText': 'Ajoute des transactions pour voir la repartition.',
    'dashboard.expenses': 'Depenses',
    'dashboard.recent': 'Recent',
    'dashboard.seeAll': 'Tout voir',
    'dashboard.emptyRecentTitle': "Rien pour l'instant",
    'dashboard.emptyRecentText': 'Tes mouvements apparaitront ici.',
  },
  en: {
    'dashboard.serverDown': 'Server unreachable',
    'dashboard.serverDownHint': 'Make sure the backend is running. ({error})',
    'dashboard.balanceLabel': 'Monthly balance · {month}',
    'dashboard.netLabel': 'NET BALANCE',
    'dashboard.savedRate': '{rate}% saved',
    'dashboard.overspent': 'Spending > income',
    'dashboard.add': 'Add',
    'dashboard.savings': 'Savings',
    'dashboard.challenges': 'Challenges',
    'dashboard.budget': 'Budget',
    'dashboard.income': 'Income',
    'dashboard.expensesFlow': 'Expenses',
    'dashboard.analyses': 'Analytics',
    'dashboard.noExpensesTitle': 'No expenses this month',
    'dashboard.noExpensesText': 'Add transactions to see the breakdown.',
    'dashboard.expenses': 'Expenses',
    'dashboard.recent': 'Recent',
    'dashboard.seeAll': 'See all',
    'dashboard.emptyRecentTitle': 'Nothing yet',
    'dashboard.emptyRecentText': 'Your activity will show up here.',
  },
});

export default function DashboardScreen({ navigation }) {
  const t = useT();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { photo } = useProfile();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  // Mois affiche : null = mois courant (le backend choisit), sinon { year, month }.
  const [sel, setSel] = useState(null);

  const load = useCallback(
    async (period = sel) => {
      try {
        setError(null);
        setData(await Dashboard.get(period?.year, period?.month));
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [sel]
  );

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <LinearGradient
          colors={brandGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[styles.header, { paddingTop: insets.top + spacing.md }]}
        >
          <View style={styles.topbar}>
            <Skeleton width={44} height={44} r={radius.full} />
            <Skeleton width={36} height={20} r={10} />
          </View>
          <View style={[styles.gaugeWrap, { alignItems: 'center' }]}>
            <Skeleton width={236} height={236} r={radius.full} />
          </View>
          <View style={{ alignItems: 'center', marginTop: spacing.md }}>
            <Skeleton width={160} height={14} r={6} />
          </View>
          <View style={[styles.actions, { marginTop: spacing.xl }]}>
            <Skeleton width="48%" height={64} r={radius.md} />
            <Skeleton width="48%" height={64} r={radius.md} />
          </View>
        </LinearGradient>
        <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing.xl, gap: spacing.lg }}>
          <Skeleton width="100%" height={150} r={radius.lg} />
          <Skeleton width="100%" height={110} r={radius.lg} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.center, { padding: spacing.xl }]}>
        <Text style={[font.title, { textAlign: 'center', marginBottom: 6 }]}>{t('dashboard.serverDown')}</Text>
        <Text style={[font.caption, { textAlign: 'center' }]}>{t('dashboard.serverDownHint', { error })}</Text>
      </View>
    );
  }

  const s = data.summary;
  const { year, month } = data.period;

  // Navigation entre mois (passes ou futurs, pour preparer les mois a venir).
  const goMonth = (delta) => {
    const d = new Date(year, month + delta, 1);
    const next = { year: d.getFullYear(), month: d.getMonth() };
    setSel(next);
    load(next);
  };
  const donutData = data.expensesByCategory.map((c) => ({ value: c.total, color: c.color }));
  const totalExpenses = data.expensesByCategory.reduce((a, c) => a + c.total, 0);
  const initials = ((user?.name || user?.email || '?').trim()[0] || '?').toUpperCase();

  // Jauge "solde net" : le remplissage de l'anneau represente la part du
  // revenu qui reste (net / entrees, 0..1) — pas l'epargne.
  const isPositive = s.net >= 0;
  const tone = isPositive ? colors.positive : colors.negative;
  const netRate = s.realIncome > 0 ? Math.max(0, Math.min(1, s.net / s.realIncome)) : 0;
  const gaugeProgress = isPositive ? Math.max(netRate, 0.04) : 1;
  // Pastille "X% epargne" : VRAI taux d'epargne = ce qui a ete mis en pochettes
  // ce mois-ci rapporte au revenu (et non le net, qui inclut tout le reste).
  const ratePct = s.realIncome > 0
    ? Math.min(100, Math.max(0, Math.round((Number(s.savedThisMonth) || 0) / s.realIncome * 100)))
    : 0;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ paddingBottom: spacing.xl }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            load();
          }}
          tintColor="#fff"
        />
      }
    >
      {/* En-tete degrade plein largeur */}
      <LinearGradient
        colors={brandGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + spacing.md }]}
      >
        <View style={styles.topbar}>
          <Pressable
            onPress={() => navigation.navigate('Budget')}
            style={({ pressed }) => [styles.avatar, pressed && { opacity: 0.7 }]}
            hitSlop={8}
          >
            {photo ? (
              <Image source={{ uri: photo }} style={styles.avatarImg} />
            ) : (
              <Text style={styles.avatarText}>{initials}</Text>
            )}
          </Pressable>
          <Pressable onPress={() => navigation.navigate('Budget')} style={styles.topBtn} hitSlop={8}>
            <View style={styles.topBtnDot} />
            <View style={styles.topBtnDot} />
            <View style={styles.topBtnDot} />
          </Pressable>
        </View>

        <View style={styles.gaugeWrap}>
          <GaugeRing
            progress={gaugeProgress}
            size={236}
            strokeWidth={20}
            color={tone}
            colorEnd={isPositive ? colors.primary : colors.negative}
          >
            <Text style={styles.gaugeLabel}>{t('dashboard.netLabel')}</Text>
            <Balance value={s.net} tone={tone} />
            <View style={[styles.gaugePill, { backgroundColor: isPositive ? colors.primarySoft : 'rgba(255,93,115,0.16)' }]}>
              <Text style={[styles.gaugePillText, { color: tone }]}>
                {isPositive ? t('dashboard.savedRate', { rate: ratePct }) : t('dashboard.overspent')}
              </Text>
            </View>
          </GaugeRing>
        </View>
        <View style={styles.monthNav}>
          <Pressable
            onPress={() => goMonth(-1)}
            hitSlop={12}
            style={({ pressed }) => [styles.monthArrow, pressed && { opacity: 0.5 }]}
          >
            <Text style={styles.monthArrowText}>‹</Text>
          </Pressable>
          <Text style={styles.gaugeMonth}>{t('dashboard.balanceLabel', { month: monthLabel(year, month) })}</Text>
          <Pressable
            onPress={() => goMonth(1)}
            hitSlop={12}
            style={({ pressed }) => [styles.monthArrow, pressed && { opacity: 0.5 }]}
          >
            <Text style={styles.monthArrowText}>›</Text>
          </Pressable>
        </View>

        <View style={styles.actions}>
          <ActionTile glyph="plus" label={t('dashboard.add')} onBrand onPress={() => navigation.navigate('Transactions')} />
          <ActionTile glyph="savings" label={t('dashboard.savings')} onBrand onPress={() => navigation.navigate('Epargne')} />
          <ActionTile glyph="target" label={t('dashboard.challenges')} onBrand onPress={() => navigation.navigate('Challenges')} />
          <ActionTile glyph="wallet" label={t('dashboard.budget')} onBrand onPress={() => navigation.navigate('Budget')} />
        </View>
      </LinearGradient>

      <View style={styles.body}>
        {/* Entrees / sorties */}
        <View style={styles.flowRow}>
          <Flow label={t('dashboard.income')} value={euro(s.realIncome)} tone={colors.positive} />
          <View style={styles.flowDivider} />
          <Flow label={t('dashboard.expensesFlow')} value={euro(s.totalOut)} tone={colors.negative} />
        </View>

        {/* Analyses */}
        <Text style={styles.section}>{t('dashboard.analyses')}</Text>
        <Card>
          {donutData.length === 0 ? (
            <EmptyState title={t('dashboard.noExpensesTitle')} text={t('dashboard.noExpensesText')} />
          ) : (
            <>
              <View style={styles.donutWrap}>
                <DonutChart data={donutData} size={148} strokeWidth={18}>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={font.caption}>{t('dashboard.expenses')}</Text>
                    <Text style={styles.donutTotal}>{euro(totalExpenses)}</Text>
                  </View>
                </DonutChart>
                <View style={styles.legend}>
                  {data.expensesByCategory.slice(0, 5).map((c) => {
                    const pct = totalExpenses > 0 ? Math.round((c.total / totalExpenses) * 100) : 0;
                    return (
                      <View key={String(c.categoryId)} style={styles.legendRow}>
                        <View style={[styles.legendDot, { backgroundColor: c.color }]} />
                        <Text style={styles.legendName} numberOfLines={1}>{c.name}</Text>
                        <Text style={styles.legendPct}>{pct}%</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </>
          )}
        </Card>

        {/* Recent */}
        <View style={styles.sectionRow}>
          <Text style={styles.section}>{t('dashboard.recent')}</Text>
          <Pressable onPress={() => navigation.navigate('Transactions')} hitSlop={8}>
            <Text style={styles.link}>{t('dashboard.seeAll')}</Text>
          </Pressable>
        </View>
        <Card padded={false} style={{ paddingHorizontal: spacing.lg }}>
          {data.recentTransactions.length === 0 ? (
            <EmptyState title={t('dashboard.emptyRecentTitle')} text={t('dashboard.emptyRecentText')} />
          ) : (
            data.recentTransactions.map((tx, i) => (
              <View
                key={tx._id}
                style={i < data.recentTransactions.length - 1 ? styles.sep : null}
              >
                <TransactionRow tx={tx} />
              </View>
            ))
          )}
        </Card>
      </View>
    </ScrollView>
  );
}

// Solde : partie entiere grande, centimes plus petits (facon Revolut).
// Affiche au centre de la jauge, colore selon le signe.
function Balance({ value, tone = '#fff' }) {
  const formatted = euro(value, { sign: true }); // ex : "+1 234,56 €"
  const [intPart, decPart] = formatted.split(',');
  return (
    <View style={styles.balance}>
      <Text style={[styles.balanceInt, { color: tone }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5}>
        {intPart}
      </Text>
      {decPart ? <Text style={[styles.balanceDec, { color: tone }]}>,{decPart}</Text> : null}
    </View>
  );
}

function Flow({ label, value, tone }) {
  return (
    <View style={styles.flow}>
      <View style={[styles.flowDot, { backgroundColor: tone }]} />
      <View style={{ flex: 1 }}>
        <Text style={font.caption} numberOfLines={1}>{label}</Text>
        <Text style={styles.flowValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  header: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontFamily: ff.bold, fontSize: 16 },
  avatarImg: { width: 42, height: 42, borderRadius: 21 },
  topBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.22)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  topBtnDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#fff' },
  gaugeWrap: { alignItems: 'center', justifyContent: 'center', marginTop: spacing.xl },
  gaugeLabel: {
    color: colors.textOnBrandMuted,
    fontFamily: ff.bold,
    fontSize: 11.5,
    letterSpacing: 3,
    marginBottom: 4,
  },
  gaugePill: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  gaugePillText: { fontFamily: ff.bold, fontSize: 12 },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  monthArrow: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthArrowText: {
    color: '#fff',
    fontFamily: ff.bold,
    fontSize: 22,
    lineHeight: 24,
  },
  gaugeMonth: {
    color: colors.textOnBrandMuted,
    fontFamily: ff.semibold,
    fontSize: 13,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  // maxWidth borne la ligne au diametre interne de l'anneau (236 - 2*strokeWidth) :
  // sans largeur contrainte, adjustsFontSizeToFit ne reduit jamais la police et
  // les gros montants debordent de la jauge.
  balance: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', maxWidth: 188 },
  balanceInt: { fontFamily: ff.extrabold, fontSize: 40, letterSpacing: -1.2, flexShrink: 1 },
  balanceDec: { fontFamily: ff.bold, fontSize: 19, marginTop: 5, opacity: 0.9 },
  actions: { flexDirection: 'row', marginTop: spacing.xxl, gap: spacing.sm },
  body: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl },
  flowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSoft,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  flow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  flowDot: { width: 10, height: 10, borderRadius: 5 },
  flowValue: { fontFamily: ff.extrabold, fontSize: 17, color: colors.text, marginTop: 1 },
  flowDivider: { width: 1, height: 32, backgroundColor: colors.border },
  section: { ...font.h2, marginTop: spacing.xl, marginBottom: spacing.md },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  donutWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.xl },
  donutTotal: { fontFamily: ff.extrabold, fontSize: 17, color: colors.text },
  legend: { flex: 1, gap: 10 },
  legendRow: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 9, height: 9, borderRadius: 5, marginRight: spacing.sm },
  legendName: { flex: 1, fontFamily: ff.semibold, fontSize: 13.5, color: colors.text },
  legendPct: { fontFamily: ff.bold, fontSize: 13.5, color: colors.textMuted },
  sep: { borderBottomWidth: 1, borderBottomColor: colors.border },
  link: { color: colors.primary, fontFamily: ff.bold, fontSize: 14, marginTop: spacing.xl, marginBottom: spacing.md },
});
