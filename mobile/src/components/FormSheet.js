import { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors, radius, spacing, font } from '../theme';
import Button from './Button';

// Formulaire modal generique pilote par une config de champs.
// fields: [{ key, label, type: 'text'|'number'|'select', options?, placeholder }]
export default function FormSheet({
  visible,
  title,
  fields = [],
  initial = {},
  submitLabel = 'Enregistrer',
  onSubmit,
  onClose,
}) {
  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) setValues(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const set = (k, v) => setValues((prev) => ({ ...prev, [k]: v }));

  const submit = async () => {
    try {
      setSaving(true);
      await onSubmit(values);
      onClose();
    } catch (e) {
      // L'erreur est geree par l'ecran appelant si besoin.
      console.warn(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.sheetWrap}
        >
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <View style={styles.header}>
              <Text style={font.h2}>{title}</Text>
              <Pressable onPress={onClose} hitSlop={12}>
                <Text style={styles.close}>Fermer</Text>
              </Pressable>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 420 }}>
              {fields.map((f) => (
                <View key={f.key} style={styles.field}>
                  <Text style={styles.label}>{f.label}</Text>

                  {f.type === 'select' ? (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={styles.options}>
                        {f.options.map((opt) => {
                          const active = values[f.key] === opt.value;
                          return (
                            <Pressable
                              key={String(opt.value)}
                              onPress={() => set(f.key, opt.value)}
                              style={[styles.option, active && styles.optionActive]}
                            >
                              {opt.color ? (
                                <View style={[styles.optionDot, { backgroundColor: opt.color }]} />
                              ) : null}
                              <Text style={[styles.optionText, active && styles.optionTextActive]}>
                                {opt.label}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    </ScrollView>
                  ) : (
                    <TextInput
                      value={values[f.key] != null ? String(values[f.key]) : ''}
                      onChangeText={(t) =>
                        set(f.key, f.type === 'number' ? t.replace(',', '.') : t)
                      }
                      placeholder={f.placeholder}
                      placeholderTextColor={colors.textMuted}
                      keyboardType={f.type === 'number' ? 'decimal-pad' : 'default'}
                      style={styles.input}
                    />
                  )}
                </View>
              ))}
            </ScrollView>

            <View style={{ marginTop: spacing.md }}>
              <Button title={submitLabel} onPress={submit} loading={saving} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(10,10,20,0.45)', justifyContent: 'flex-end' },
  sheetWrap: { width: '100%' },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  close: { color: colors.primary, fontWeight: '700', fontSize: 15 },
  field: { marginBottom: spacing.lg },
  label: { ...font.label, marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    height: 52,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  options: { flexDirection: 'row', gap: spacing.sm, paddingVertical: 2 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  optionText: { color: colors.text, fontWeight: '600' },
  optionTextActive: { color: '#fff' },
  optionDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
});
