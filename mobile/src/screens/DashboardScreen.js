import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, RefreshControl, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, spacing, radius, font, ff, brandGradient } from '../theme';
import { euro, monthLabel } from '../format';
import { Dashboard } from '../api';
import { useAuth } from '../AuthContext';
import Card from '../components/Card';
import ActionTile from '../components/ActionTile';
import DonutChart from '../components/DonutChart';
import CategoryIcon from '../components/CategoryIcon';
import TransactionRow from '../components/TransactionRow';
import EmptyState from '../components/EmptyState';

export default function DashboardScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setError(null);
      setData(await Dashboard.get());
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
        <Text style={[font.title, { textAlign: 'center', marginBottom: 6 }]}>Serveur injoignable</Text>
        <Text style={[font.caption, { textAlign: 'center' }]}>Verifie que le backend tourne. ({error})</Text>
      </View>
    );
  }

  const s = data.summary;
  const { year, month } = data.period;
  const donutData = data.expensesByCategory.map((c) => ({ value: c.total, color: c.color }));
  const totalExpenses = data.expensesByCategory.reduce((a, c) => a + c.total, 0);
  const initials = ((user?.name || user?.email || '?').trim()[0] || '?').toUpperCase();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ paddingBottom: 120 }}
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
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Pressable onPress={() => navigation.navigate('Budget')} style={styles.topBtn} hitSlop={8}>
            <View style={styles.topBtnDot} />
            <View style={styles.topBtnDot} />
            <View style={styles.topBtnDot} />
          </Pressable>
        </View>

        <Text style={styles.balanceLabel}>Solde du mois · {monthLabel(year, month)}</Text>
        <Balance value={s.net} />

        <View style={styles.actions}>
          <ActionTile glyph="plus" label="Ajouter" onBrand onPress={() => navigation.navigate('Transactions')} />
          <ActionTile glyph="savings" label="Epargne" onBrand onPress={() => navigation.navigate('Epargne')} />
          <ActionTile glyph="target" label="Challenges" onBrand onPress={() => navigation.navigate('Challenges')} />
          <ActionTile glyph="wallet" label="Budget" onBrand onPress={() => navigation.navigate('Budget')} />
        </View>
      </LinearGradient>

      <View style={styles.body}>
        {/* Entrees / sorties */}
        <View style={styles.flowRow}>
          <Flow label="Entrees" value={euro(s.realIncome)} tone={colors.positive} />
          <View style={styles.flowDivider} />
          <Flow label="Sorties" value={euro(s.totalOut)} tone={colors.negative} />
        </View>

        {/* Analyses */}
        <Text style={styles.section}>Analyses</Text>
        <Card>
          {donutData.length === 0 ? (
            <EmptyState title="Aucune depense ce mois" text="Ajoute des transactions pour voir la repartition." />
          ) : (
            <>
              <View style={styles.donutWrap}>
                <DonutChart data={donutData} size={148} strokeWidth={18}>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={font.caption}>Depenses</Text>
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
          <Text style={styles.section}>Recent</Text>
          <Pressable onPress={() => navigation.navigate('Transactions')} hitSlop={8}>
            <Text style={styles.link}>Tout voir</Text>
          </Pressable>
        </View>
        <Card padded={false} style={{ paddingHorizontal: spacing.lg }}>
          {data.recentTransactions.length === 0 ? (
            <EmptyState title="Rien pour l'instant" text="Tes mouvements apparaitront ici." />
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
function Balance({ value }) {
  const formatted = euro(value, { sign: true }); // ex : "+1 234,56 €"
  const [intPart, decPart] = formatted.split(',');
  return (
    <View style={styles.balance}>
      <Text style={styles.balanceInt}>{intPart}</Text>
      {decPart ? <Text style={styles.balanceDec}>,{decPart}</Text> : null}
    </View>
  );
}

function Flow({ label, value, tone }) {
  return (
    <View style={styles.flow}>
      <View style={[styles.flowDot, { backgroundColor: tone }]} />
      <View>
        <Text style={font.caption}>{label}</Text>
        <Text style={styles.flowValue}>{value}</Text>
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
  balanceLabel: {
    color: colors.textOnBrandMuted,
    fontFamily: ff.semibold,
    fontSize: 13,
    textAlign: 'center',
    textTransform: 'capitalize',
    marginTop: spacing.xl,
  },
  balance: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', marginTop: 6 },
  balanceInt: { ...font.hero },
  balanceDec: { color: '#fff', fontFamily: ff.bold, fontSize: 24, marginTop: 6, opacity: 0.85 },
  actions: { flexDirection: 'row', marginTop: spacing.xl, gap: spacing.sm },
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
