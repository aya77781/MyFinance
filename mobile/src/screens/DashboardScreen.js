import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, RefreshControl } from 'react-native';

import { colors, spacing, radius, font, shadow } from '../theme';
import { euro, monthLabel } from '../format';
import { Dashboard } from '../api';
import Card from '../components/Card';
import DonutChart from '../components/DonutChart';
import BarChart from '../components/BarChart';
import TransactionRow from '../components/TransactionRow';
import EmptyState from '../components/EmptyState';

export default function DashboardScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setError(null);
      const d = await Dashboard.get();
      setData(d);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.center, { padding: spacing.xl }]}>
        <Text style={[font.title, { textAlign: 'center', marginBottom: 6 }]}>
          Connexion au serveur impossible
        </Text>
        <Text style={[font.caption, { textAlign: 'center' }]}>
          Verifie que le backend tourne et que l'app est sur le meme reseau wifi. ({error})
        </Text>
      </View>
    );
  }

  const s = data.summary;
  const { year, month } = data.period;
  const donutData = data.expensesByCategory.map((c) => ({ value: c.total, color: c.color }));
  const totalExpenses = data.expensesByCategory.reduce((a, c) => a + c.total, 0);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ paddingTop: insets.top + spacing.md, paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            load();
          }}
          tintColor={colors.primary}
        />
      }
    >
      <View style={{ paddingHorizontal: spacing.xl }}>
        <Text style={styles.period}>{monthLabel(year, month)}</Text>

        {/* Carte hero : solde net du mois */}
        <View style={styles.hero}>
          <Text style={styles.heroLabel}>Solde du mois</Text>
          <Text style={styles.heroValue}>{euro(s.net, { sign: true })}</Text>

          <View style={styles.heroRow}>
            <View>
              <Text style={styles.heroSmallLabel}>Entrees</Text>
              <Text style={styles.heroPositive}>{euro(s.realIncome)}</Text>
            </View>
            <View>
              <Text style={styles.heroSmallLabel}>Sorties</Text>
              <Text style={styles.heroNegative}>{euro(s.totalOut)}</Text>
            </View>
            <View style={styles.rateBadge}>
              <Text style={styles.rateText}>{s.savingsRate}%</Text>
              <Text style={styles.rateSub}>epargne</Text>
            </View>
          </View>
        </View>

        {/* Trois stats cles */}
        <View style={styles.statsRow}>
          <Stat label="Revenus stables" value={euro(s.stableIncome)} tone={colors.positive} />
          <Stat label="Charges fixes" value={euro(s.fixedCharges)} tone={colors.negative} />
          <Stat label="Epargne totale" value={euro(s.totalSaved)} tone={colors.primary} />
        </View>

        {/* Donut depenses par categorie */}
        <Card style={{ marginTop: spacing.lg }}>
          <Text style={font.title}>Depenses par categorie</Text>
          {donutData.length === 0 ? (
            <EmptyState title="Aucune depense ce mois" text="Ajoute des transactions pour voir la repartition." />
          ) : (
            <View style={styles.donutWrap}>
              <DonutChart data={donutData}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={font.caption}>Total</Text>
                  <Text style={styles.donutTotal}>{euro(totalExpenses)}</Text>
                </View>
              </DonutChart>
              <View style={styles.legend}>
                {data.expensesByCategory.slice(0, 6).map((c) => (
                  <View key={String(c.categoryId)} style={styles.legendRow}>
                    <View style={[styles.legendDot, { backgroundColor: c.color }]} />
                    <Text style={styles.legendName} numberOfLines={1}>
                      {c.name}
                    </Text>
                    <Text style={styles.legendVal}>{euro(c.total)}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </Card>

        {/* Tendance 6 mois */}
        <Card style={{ marginTop: spacing.lg }}>
          <Text style={[font.title, { marginBottom: spacing.lg }]}>Tendance (6 mois)</Text>
          <BarChart data={data.monthlyTrend} />
        </Card>

        {/* Transactions recentes */}
        <View style={styles.sectionHeader}>
          <Text style={font.h2}>Recent</Text>
          <Text style={styles.link} onPress={() => navigation.navigate('Transactions')}>
            Tout voir
          </Text>
        </View>
        <Card padded={false} style={{ paddingHorizontal: spacing.lg }}>
          {data.recentTransactions.length === 0 ? (
            <EmptyState title="Rien pour l'instant" text="Tes mouvements apparaitront ici." />
          ) : (
            data.recentTransactions.map((tx, i) => (
              <View
                key={tx._id}
                style={
                  i < data.recentTransactions.length - 1
                    ? { borderBottomWidth: 1, borderBottomColor: colors.border }
                    : null
                }
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

function Stat({ label, value, tone }) {
  return (
    <View style={[styles.stat, shadow]}>
      <View style={[styles.statBar, { backgroundColor: tone }]} />
      <Text style={styles.statLabel} numberOfLines={1}>
        {label}
      </Text>
      <Text style={styles.statValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  period: { ...font.label, textTransform: 'capitalize', marginBottom: spacing.sm },
  hero: {
    backgroundColor: colors.hero,
    borderRadius: radius.lg,
    padding: spacing.xl,
  },
  heroLabel: { color: colors.textOnHeroMuted, fontSize: 14, fontWeight: '600' },
  heroValue: { color: colors.textOnHero, fontSize: 38, fontWeight: '800', marginTop: 4 },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  heroSmallLabel: { color: colors.textOnHeroMuted, fontSize: 12, fontWeight: '600' },
  heroPositive: { color: colors.positive, fontSize: 16, fontWeight: '700', marginTop: 2 },
  heroNegative: { color: '#FF8CA0', fontSize: 16, fontWeight: '700', marginTop: 2 },
  rateBadge: {
    backgroundColor: colors.heroSoft,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  rateText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  rateSub: { color: colors.textOnHeroMuted, fontSize: 10, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  statBar: { width: 24, height: 4, borderRadius: 2, marginBottom: spacing.sm },
  statLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
  statValue: { fontSize: 16, fontWeight: '800', color: colors.text, marginTop: 2 },
  donutWrap: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.lg, gap: spacing.lg },
  donutTotal: { fontSize: 18, fontWeight: '800', color: colors.text },
  legend: { flex: 1, gap: spacing.sm },
  legendRow: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: spacing.sm },
  legendName: { flex: 1, fontSize: 13, color: colors.text, fontWeight: '600' },
  legendVal: { fontSize: 13, color: colors.textMuted, fontWeight: '700' },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  link: { color: colors.primary, fontWeight: '700', fontSize: 14 },
});
