import { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Image, Linking } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import Screen from '../components/Screen';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import { Skeleton } from '../components/Skeleton';
import Glyph from '../components/Glyph';
import { colors, spacing, font, radius, ff } from '../theme';
import { Market } from '../api';
import { getItem, setItem } from '../storage';
import { useT, registerTranslations } from '../i18n';

registerTranslations({
  fr: {
    'market.title': 'Marche',
    'market.subtitle': 'Actus & opportunites',
    'market.tab.news': 'Actualites',
    'market.tab.opps': 'Opportunites',
    'market.news.notConfigured.title': 'Actualites non configurees',
    'market.news.notConfigured.text':
      'Ajoute une cle GNews gratuite (GNEWS_API_TOKEN) dans le backend pour afficher les news.',
    'market.news.empty.title': 'Aucune actualite',
    'market.news.empty.text': 'Reessaie plus tard ou change de region.',
    'market.news.error.title': 'Actualites indisponibles',
    'market.news.error.text': 'Connexion au service impossible. Tire vers le bas pour reessayer.',
    'market.opps.empty.title': 'Aucune opportunite',
    'market.opps.empty.text': "Change de region pour voir d'autres idees.",
    'market.opps.risk': 'Risque {risk}',
    'market.timeAgo.min': '{n} min',
    'market.timeAgo.hours': '{n} h',
    'market.timeAgo.days': '{n} j',
  },
  en: {
    'market.title': 'Market',
    'market.subtitle': 'News & opportunities',
    'market.tab.news': 'News',
    'market.tab.opps': 'Opportunities',
    'market.news.notConfigured.title': 'News not configured',
    'market.news.notConfigured.text':
      'Add a free GNews key (GNEWS_API_TOKEN) in the backend to display the news.',
    'market.news.empty.title': 'No news',
    'market.news.empty.text': 'Try again later or change region.',
    'market.news.error.title': 'News unavailable',
    'market.news.error.text': 'Could not reach the service. Pull down to retry.',
    'market.opps.empty.title': 'No opportunity',
    'market.opps.empty.text': 'Change region to see other ideas.',
    'market.opps.risk': '{risk} risk',
    'market.timeAgo.min': '{n} min',
    'market.timeAgo.hours': '{n} h',
    'market.timeAgo.days': '{n} d',
  },
});

const REGION_KEY = 'finance_region';

const RISK_TONE = {
  Faible: colors.positive,
  Moyen: colors.warning,
  Eleve: colors.negative,
};

export default function MarketScreen() {
  const t = useT();
  const [region, setRegion] = useState('FR');
  const [regions, setRegions] = useState([{ key: 'FR', label: 'France' }]);
  const [news, setNews] = useState(null);
  const [opps, setOpps] = useState([]);
  const [tab, setTab] = useState('news'); // 'news' | 'opps'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Charge la region memorisee + la liste des regions.
  useEffect(() => {
    (async () => {
      const stored = await getItem(REGION_KEY);
      if (stored) setRegion(stored);
      try {
        setRegions(await Market.regions());
      } catch {}
    })();
  }, []);

  const load = useCallback(async (reg) => {
    try {
      const [n, o] = await Promise.all([Market.news(reg), Market.opportunities(reg)]);
      setNews(n);
      setOpps(o.items || []);
    } catch (e) {
      setNews({ configured: true, articles: [], error: e.message });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(region);
    }, [load, region])
  );

  const changeRegion = async (key) => {
    setRegion(key);
    setLoading(true);
    await setItem(REGION_KEY, key);
    load(key);
  };

  return (
    <Screen
      title={t('market.title')}
      subtitle={t('market.subtitle')}
      refreshing={refreshing}
      onRefresh={() => {
        setRefreshing(true);
        load(region);
      }}
    >
      {/* Selecteur de region */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.lg }}>
        <View style={styles.regions}>
          {regions.map((r) => {
            const active = r.key === region;
            return (
              <Pressable
                key={r.key}
                onPress={() => changeRegion(r.key)}
                style={[styles.region, active && styles.regionActive]}
              >
                <Text style={[styles.regionText, active && styles.regionTextActive]}>{r.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Onglets News / Opportunites */}
      <View style={styles.segment}>
        <Seg label={t('market.tab.news')} icon="news" active={tab === 'news'} onPress={() => setTab('news')} />
        <Seg label={t('market.tab.opps')} icon="trending" active={tab === 'opps'} onPress={() => setTab('opps')} />
      </View>

      {loading ? (
        <View style={{ gap: spacing.md }}>
          {[0, 1, 2].map((i) => (
            <Card key={i}>
              <Skeleton width="40%" height={12} r={5} />
              <View style={{ height: spacing.sm }} />
              <Skeleton width="90%" height={16} r={6} />
              <View style={{ height: 6 }} />
              <Skeleton width="70%" height={16} r={6} />
            </Card>
          ))}
        </View>
      ) : tab === 'news' ? (
        <NewsList news={news} />
      ) : (
        <OppsList items={opps} />
      )}
    </Screen>
  );
}

function NewsList({ news }) {
  const t = useT();
  if (news && news.configured === false) {
    return (
      <Card>
        <EmptyState
          title={t('market.news.notConfigured.title')}
          text={t('market.news.notConfigured.text')}
        />
      </Card>
    );
  }
  const articles = news?.articles || [];
  if (articles.length === 0) {
    // Distingue l'echec reseau (fallback) d'une absence reelle d'actus.
    const isError = !!news?.error;
    return (
      <Card>
        <EmptyState
          title={t(isError ? 'market.news.error.title' : 'market.news.empty.title')}
          text={t(isError ? 'market.news.error.text' : 'market.news.empty.text')}
        />
      </Card>
    );
  }
  return (
    <View style={{ gap: spacing.md }}>
      {articles.map((a, i) => (
        <Pressable key={i} onPress={() => a.url && Linking.openURL(a.url)}>
          <Card padded={false} style={styles.article}>
            {a.image ? <Image source={{ uri: a.image }} style={styles.articleImg} /> : null}
            <View style={{ flex: 1, padding: spacing.lg }}>
              <Text style={styles.articleSource}>
                {a.source}
                {a.publishedAt ? ` · ${timeAgo(a.publishedAt, t)}` : ''}
              </Text>
              <Text style={styles.articleTitle} numberOfLines={3}>
                {a.title}
              </Text>
            </View>
          </Card>
        </Pressable>
      ))}
    </View>
  );
}

function OppsList({ items }) {
  const t = useT();
  if (!items.length) {
    return (
      <Card>
        <EmptyState title={t('market.opps.empty.title')} text={t('market.opps.empty.text')} />
      </Card>
    );
  }
  return (
    <View style={{ gap: spacing.md }}>
      {items.map((o, i) => (
        <Card key={i}>
          <View style={styles.oppHead}>
            <Text style={styles.oppType}>{o.type}</Text>
            <View style={[styles.riskBadge, { backgroundColor: `${RISK_TONE[o.risk] || colors.textMuted}1A` }]}>
              <Text style={[styles.riskText, { color: RISK_TONE[o.risk] || colors.textMuted }]}>
                {t('market.opps.risk', { risk: o.risk?.toLowerCase() })}
              </Text>
            </View>
          </View>
          <Text style={styles.oppTitle}>{o.title}</Text>
          <Text style={styles.oppDesc}>{o.description}</Text>
          <Text style={styles.oppHorizon}>{o.horizon}</Text>
        </Card>
      ))}
    </View>
  );
}

function Seg({ label, icon, active, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.seg, active && styles.segActive]}>
      <Glyph name={icon} color={active ? colors.textOnTeal : colors.textMuted} size={17} />
      <Text style={[styles.segText, active && styles.segTextActive]}>{label}</Text>
    </Pressable>
  );
}

function timeAgo(iso, t) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 3600) return t('market.timeAgo.min', { n: Math.max(1, Math.round(diff / 60)) });
  if (diff < 86400) return t('market.timeAgo.hours', { n: Math.round(diff / 3600) });
  return t('market.timeAgo.days', { n: Math.round(diff / 86400) });
}

const styles = StyleSheet.create({
  regions: { flexDirection: 'row', gap: spacing.sm, paddingVertical: 2 },
  region: {
    paddingHorizontal: spacing.lg,
    height: 38,
    borderRadius: radius.full,
    backgroundColor: colors.bgSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  regionActive: { backgroundColor: colors.primary },
  regionText: { fontFamily: ff.semibold, fontSize: 13.5, color: colors.text },
  regionTextActive: { color: colors.textOnTeal },
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.bgSoft,
    borderRadius: radius.md,
    padding: 4,
    marginBottom: spacing.lg,
  },
  seg: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 40,
    borderRadius: radius.sm,
  },
  segActive: { backgroundColor: colors.primary },
  segText: { fontFamily: ff.semibold, fontSize: 14, color: colors.textMuted },
  segTextActive: { color: colors.textOnTeal },
  article: { flexDirection: 'row', overflow: 'hidden', alignItems: 'center' },
  articleImg: { width: 92, height: 92, backgroundColor: colors.bgSoft },
  articleSource: { fontFamily: ff.semibold, fontSize: 11.5, color: colors.primary, marginBottom: 4 },
  articleTitle: { fontFamily: ff.bold, fontSize: 14.5, color: colors.text, lineHeight: 19 },
  oppHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  oppType: { fontFamily: ff.bold, fontSize: 12, color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.5 },
  riskBadge: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.full },
  riskText: { fontFamily: ff.semibold, fontSize: 11 },
  oppTitle: { fontFamily: ff.bold, fontSize: 16.5, color: colors.text, marginBottom: 4 },
  oppDesc: { fontFamily: ff.medium, fontSize: 13.5, color: colors.textMuted, lineHeight: 19 },
  oppHorizon: { fontFamily: ff.semibold, fontSize: 12, color: colors.text, marginTop: spacing.sm },
});
