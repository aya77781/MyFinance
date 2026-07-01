import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  Image,
  Alert,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Card from '../components/Card';
import Button from '../components/Button';
import TimelineChart from '../components/TimelineChart';
import DonutChart from '../components/DonutChart';
import { colors, spacing, font, radius, palette, ff } from '../theme';
import { euro, getLocale } from '../format';
import { Income, Charges, Categories, Transactions } from '../api';
import { useAuth } from '../AuthContext';
import { useProfile } from '../ProfileContext';
import { useCurrency, CURRENCIES } from '../CurrencyContext';
import { useT, registerTranslations, useLang, LANGUAGES } from '../i18n';

registerTranslations({
  fr: {
    'settings.title': 'Reglages',
    'settings.currency': "Devise d'affichage",
    'settings.currencyHint':
      'Tous les montants sont convertis dans cette devise. Taux fixe : 1 € = 1 $ = 10 MAD.',
  },
  en: {
    'settings.title': 'Settings',
    'settings.currency': 'Display currency',
    'settings.currencyHint':
      'All amounts are converted to this currency. Fixed rate: 1 € = 1 $ = 10 MAD.',
  },
});

// Panneau Reglages : s'ouvre au clic sur la photo/l'icone du Dashboard.
// Contient la devise par defaut, le suivi dans le temps (deplace du Budget),
// les depenses, la repartition, la photo, la langue et le compte.
export default function SettingsSheet({ visible, onClose }) {
  const t = useT();
  const { lang, setLang } = useLang();
  const { photo, pickPhoto, removePhoto } = useProfile();
  const { user, logout } = useAuth();
  const { code: currencyCode, setCurrency } = useCurrency();

  const [income, setIncome] = useState([]);
  const [charges, setCharges] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [timeMode, setTimeMode] = useState('month'); // 'month' | 'year'

  const now = new Date();
  const monthLabelNow = now.toLocaleDateString(getLocale(), { month: 'long', year: 'numeric' });
  const initial = ((user?.name || user?.email || '?').trim()[0] || '?').toUpperCase();

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
    } catch {
      // silencieux : les reglages restent utilisables meme si les stats echouent
    }
  }, []);

  useEffect(() => {
    if (visible) load();
  }, [visible, load]);

  const onPickPhoto = async () => {
    const res = await pickPhoto();
    if (!res.ok && res.reason === 'permission') {
      Alert.alert(t('account.photo'), t('account.permissionDenied'));
    }
  };

  const expenseCats = categories.filter((c) => c.type !== 'income');
  const budgetCats = expenseCats.filter((c) => Number(c.planned) > 0);
  const totalPlanned = budgetCats.reduce((s, c) => s + Number(c.planned), 0);
  const totalIncome = income.reduce((s, i) => (i.active !== false ? s + i.amount : s), 0);
  const totalCharges = charges.reduce((s, c) => (c.active !== false ? s + c.amount : s), 0);

  // Suivi dans le temps : net par periode + cumul (config stable projetee).
  const timeline = useMemo(() => {
    const curY = now.getFullYear();
    const curM = now.getMonth();
    let startY = curY;
    let startM = curM;
    for (const tx of transactions) {
      const d = new Date(tx.date);
      if (isNaN(d)) continue;
      if (d.getFullYear() < startY || (d.getFullYear() === startY && d.getMonth() < startM)) {
        startY = d.getFullYear();
        startM = d.getMonth();
      }
    }
    const agg = {};
    for (const tx of transactions) {
      const d = new Date(tx.date);
      if (isNaN(d)) continue;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const b = (agg[key] = agg[key] || { income: 0, expense: 0 });
      if (tx.type === 'income') b.income += Number(tx.amount || 0);
      else b.expense += Number(tx.amount || 0);
    }
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
      year: [...ymap.values()].map((e) => ({ label: String(e.y), net: e.net, expense: e.expense, cumulative: e.cumulative })),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions, totalIncome, totalCharges]);

  const timeData = timeMode === 'year' ? timeline.year : timeline.month;
  const expenseBars = timeData.map((d) => ({ label: d.label, value: d.expense }));

  const expenseBreakdown = useMemo(() => {
    const map = new Map();
    const add = (name, amount, color) => {
      if (!amount) return;
      const e = map.get(name) || { name, total: 0, color };
      e.total += amount;
      if (color) e.color = color;
      map.set(name, e);
    };
    charges.forEach(
      (c) => c.active !== false && add(c.category?.name || c.name, Number(c.amount) || 0, c.category?.color)
    );
    budgetCats.forEach((c) => add(c.name, Number(c.planned) || 0, c.color));
    const list = [...map.values()].sort((a, b) => b.total - a.total);
    return list.map((e, i) => ({ ...e, color: e.color || palette[i % palette.length] }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [charges, categories]);
  const expenseTotal = expenseBreakdown.reduce((s, e) => s + e.total, 0);
  const donutExpense = expenseBreakdown.map((e) => ({ value: e.total, color: e.color }));

  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={font.h1}>{t('settings.title')}</Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <Text style={styles.close}>{t('form.close')}</Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.xl + insets.bottom }}
          showsVerticalScrollIndicator={false}
        >
          {/* Devise par defaut */}
          <View style={styles.sectionHeader}>
            <Text style={font.h2}>{t('settings.currency')}</Text>
          </View>
          <Card>
            <View style={styles.currencyRow}>
              {CURRENCIES.map((c) => {
                const active = currencyCode === c.code;
                return (
                  <Pressable
                    key={c.code}
                    onPress={() => setCurrency(c.code)}
                    style={[styles.currencyBtn, active && styles.currencyBtnActive]}
                  >
                    <Text style={[styles.currencySymbol, active && styles.currencyTextActive]}>{c.symbol}</Text>
                    <Text style={[styles.currencyLabel, active && styles.currencyTextActive]}>{c.label}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.currencyHint}>{t('settings.currencyHint', { month: monthLabelNow })}</Text>
          </Card>

          {/* Suivi dans le temps */}
          <View style={styles.sectionHeader}>
            <Text style={font.h2}>{t('budget.timeTracking')}</Text>
            <View style={styles.toggle}>
              <Pressable onPress={() => setTimeMode('month')} style={[styles.toggleBtn, timeMode === 'month' && styles.toggleActive]}>
                <Text style={[styles.toggleText, timeMode === 'month' && styles.toggleTextActive]}>{t('budget.month')}</Text>
              </Pressable>
              <Pressable onPress={() => setTimeMode('year')} style={[styles.toggleBtn, timeMode === 'year' && styles.toggleActive]}>
                <Text style={[styles.toggleText, timeMode === 'year' && styles.toggleTextActive]}>{t('budget.year')}</Text>
              </Pressable>
            </View>
          </View>
          <Card>
            <Text style={font.label}>{t('budget.cumulativeTotal')}</Text>
            <Text
              style={[styles.timeTotal, { color: timeline.total < 0 ? colors.negative : colors.text }]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.6}
            >
              {euro(timeline.total)}
            </Text>
            <View style={styles.timeLegend}>
              <Legend color={colors.positive} text={t('budget.netPositive')} />
              <Legend color={colors.negative} text={t('budget.netNegative')} />
              <Legend line text={t('budget.cumulative')} />
            </View>
            {timeData.length ? <TimelineChart data={timeData} /> : <Text style={font.caption}>{t('budget.noData')}</Text>}
          </Card>

          {/* Depenses dans le temps */}
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

          {/* Repartition des depenses */}
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
                {photo ? <Image source={{ uri: photo }} style={styles.photoImg} /> : <Text style={styles.photoInitial}>{initial}</Text>}
              </Pressable>
              <View style={{ flex: 1, gap: spacing.sm }}>
                <Pressable onPress={onPickPhoto} style={styles.photoBtn}>
                  <Text style={styles.photoBtnText}>{photo ? t('account.changePhoto') : t('account.addPhoto')}</Text>
                </Pressable>
                {photo ? (
                  <Pressable onPress={removePhoto} hitSlop={6} style={styles.photoRemove}>
                    <Text style={styles.photoRemoveText}>{t('account.removePhoto')}</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          </Card>

          {/* Langue */}
          <View style={styles.sectionHeader}>
            <Text style={font.h2}>{t('account.language')}</Text>
          </View>
          <Card>
            <Text style={font.label}>{t('account.languageHint')}</Text>
            <View style={styles.langRow}>
              {LANGUAGES.map((l) => {
                const active = lang === l.code;
                return (
                  <Pressable key={l.code} onPress={() => setLang(l.code)} style={[styles.langBtn, active && styles.langBtnActive]}>
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
              <Text style={font.title} numberOfLines={1}>{user?.email || ''}</Text>
            </View>
          </View>
          <Button title={t('budget.logout')} variant="ghost" onPress={logout} />
        </ScrollView>
      </View>
    </Modal>
  );
}

// Barres des depenses par periode (defilables horizontalement).
function ExpenseBars({ data }) {
  const H = 130;
  const max = Math.max(1, ...data.map((d) => Number(d.value) || 0));
  const [active, setActive] = useState(null);
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.barsRow}>
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
              <View style={[styles.barFill, { height: Math.max(3, (value / max) * H) }, isActive && styles.barFillActive]} />
            </View>
            <Text style={[styles.barLabel, isActive && styles.barLabelActive]} numberOfLines={1}>{d.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function Legend({ color, line, text }) {
  return (
    <View style={styles.legChip}>
      {line ? <View style={styles.legLine} /> : <View style={[styles.legDot, { backgroundColor: color }]} />}
      <Text style={styles.legTxt}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  close: { color: colors.primary, fontFamily: ff.bold, fontSize: 15 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  currencyRow: { flexDirection: 'row', gap: spacing.sm },
  currencyBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.bgSoft,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: 2,
  },
  currencyBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  currencySymbol: { color: colors.text, fontFamily: ff.extrabold, fontSize: 20 },
  currencyLabel: { color: colors.textMuted, fontFamily: ff.semibold, fontSize: 12 },
  currencyTextActive: { color: colors.textOnTeal },
  currencyHint: { ...font.caption, marginTop: spacing.md },
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
  monthLabel: { ...font.label, textTransform: 'capitalize', color: colors.textMuted },
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
  photoBtn: { height: 44, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
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
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
});
