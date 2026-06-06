import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { tealGradient, colors, ff } from '../theme';

// Logo "M" geometrique dans un carre arrondi en degrade teal.
export function LogoMark({ size = 56, radius }) {
  const r = radius ?? size * 0.3;
  return (
    <LinearGradient
      colors={tealGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.mark, { width: size, height: size, borderRadius: r }]}
    >
      <Svg width={size * 0.56} height={size * 0.56} viewBox="0 0 24 24" fill="none">
        <Path
          d="M4 19 V6 a1 1 0 0 1 1.7-0.7 L12 11 L17.3 5.3 A1 1 0 0 1 19 6 V19"
          stroke={colors.textOnTeal}
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    </LinearGradient>
  );
}

// Wordmark "MyFinance." : "My" gris clair, "Finance" blanc, point teal.
export function Wordmark({ size = 30 }) {
  return (
    <View style={styles.wordmark}>
      <Text style={[styles.word, { fontSize: size, color: '#9DAABE' }]}>My</Text>
      <Text style={[styles.word, { fontSize: size, color: '#FFFFFF' }]}>Finance</Text>
      <Text style={[styles.word, { fontSize: size, color: colors.primary }]}>.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  mark: { alignItems: 'center', justifyContent: 'center' },
  wordmark: { flexDirection: 'row', alignItems: 'baseline' },
  word: { fontFamily: ff.extrabold, letterSpacing: -0.5 },
});
