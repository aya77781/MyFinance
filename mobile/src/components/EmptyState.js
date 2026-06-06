import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, font } from '../theme';

export default function EmptyState({ title, text }) {
  return (
    <View style={styles.wrap}>
      <Text style={[font.title, { marginBottom: 4 }]}>{title}</Text>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: spacing.xxl },
  text: { ...font.caption, textAlign: 'center', maxWidth: 260 },
});
