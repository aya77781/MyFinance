import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, spacing, font, ff } from '../theme';
import { moneyForDate, shortDate } from '../format';
import CategoryIcon from './CategoryIcon';
import { useT, registerTranslations } from '../i18n';

registerTranslations({
  fr: { 'tx.income': 'Revenu', 'tx.uncategorized': 'Non classe' },
  en: { 'tx.income': 'Income', 'tx.uncategorized': 'Uncategorized' },
});

export default function TransactionRow({ tx, onPress, onLongPress }) {
  const t = useT();
  const isIncome = tx.type === 'income';
  const name = tx.category?.name || (isIncome ? tx.source || t('tx.income') : t('tx.uncategorized'));
  const color = tx.category?.color || (isIncome ? colors.positive : colors.textMuted);
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}
    >
      <CategoryIcon
        name={name}
        color={color}
        glyph={isIncome ? 'arrowDown' : undefined}
        size={46}
      />
      <View style={{ flex: 1 }}>
        <Text style={font.title} numberOfLines={1}>
          {tx.note || name}
        </Text>
        <Text style={font.caption}>
          {shortDate(tx.date)}
          {tx.source ? ` · ${tx.source}` : ''}
        </Text>
      </View>
      <Text
        style={[styles.amount, { color: isIncome ? colors.positive : colors.text }]}
        numberOfLines={1}
      >
        {moneyForDate(isIncome ? tx.amount : -tx.amount, tx.date, { sign: true })}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md },
  amount: { fontSize: 16, fontFamily: ff.bold, marginLeft: spacing.sm, flexShrink: 0 },
});
