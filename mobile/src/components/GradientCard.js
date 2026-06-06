import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';
import { brandGradient, radius, spacing, shadow } from '../theme';

// Carte / zone en degrade violet Revolut.
export default function GradientCard({ children, style }) {
  return (
    <LinearGradient
      colors={brandGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[styles.card, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    ...shadow,
  },
});
