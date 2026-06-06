import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, spacing, font } from '../theme';
import { euro, shortDate } from '../format';
import Pill from './Pill';

export default function TransactionRow({ tx, onPress, onLongPress }) {
  const isIncome = tx.type === 'income';
  const name = tx.category?.name || (isIncome ? tx.source || 'Revenu' : 'Non classe');
  const color = tx.category?.color || (isIncome ? colors.positive : colors.textMuted);
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}
    >
      <Pill label={name} color={color} />
      <View style={{ flex: 1 }}>
        <Text style={font.title} numberOfLines={1}>
          {tx.note || name}
        </Text>
        <Text style={font.caption}>
          {shortDate(tx.date)}
          {tx.source ? ` · ${tx.source}` : ''}
        </Text>
      </View>
      <Text style={[styles.amount, { color: isIncome ? colors.positive : colors.text }]}>
        {euro(isIncome ? tx.amount : -tx.amount, { sign: true })}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md },
  amount: { fontSize: 16, fontWeight: '700' },
});
