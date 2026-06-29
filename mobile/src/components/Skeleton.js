import { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, Easing } from 'react-native';
import { colors, radius, spacing } from '../theme';

// Bloc de chargement animé (pulsation douce). 100% JS, aucune dep native.
// Remplace le spinner basique par un aperçu de la mise en page à venir.
export function Skeleton({ width = '100%', height = 16, radius: r = 8, style }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.75] });

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: r, backgroundColor: colors.bgSoft, opacity },
        style,
      ]}
    />
  );
}

// Carte squelette générique (réutilisable comme placeholder de liste/section).
export function SkeletonCard({ lines = 3, style }) {
  return (
    <View style={[styles.card, style]}>
      <Skeleton width="55%" height={18} r={6} />
      <View style={{ height: spacing.md }} />
      {Array.from({ length: lines }).map((_, i) => (
        <View key={i} style={{ marginBottom: i === lines - 1 ? 0 : spacing.sm }}>
          <Skeleton width={`${90 - i * 12}%`} height={12} r={5} />
        </View>
      ))}
    </View>
  );
}

// Ligne squelette façon transaction (puce + deux lignes + montant).
export function SkeletonRow({ style }) {
  return (
    <View style={[styles.row, style]}>
      <Skeleton width={42} height={42} r={radius.full} />
      <View style={{ flex: 1, marginLeft: spacing.md }}>
        <Skeleton width="45%" height={13} r={5} />
        <View style={{ height: 6 }} />
        <Skeleton width="30%" height={11} r={5} />
      </View>
      <Skeleton width={64} height={15} r={5} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
});

export default Skeleton;
