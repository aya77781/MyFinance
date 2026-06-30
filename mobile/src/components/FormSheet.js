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
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing, font, ff } from '../theme';
import Button from './Button';
import Glyph from './Glyph';
import { useToast } from './Toast';
import { useT, registerTranslations } from '../i18n';

registerTranslations({
  fr: { 'form.close': 'Fermer', 'form.delete': 'Supprimer', 'form.datePlaceholder': 'JJ/MM/AAAA' },
  en: { 'form.close': 'Close', 'form.delete': 'Delete', 'form.datePlaceholder': 'DD/MM/YYYY' },
});

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
  onDelete,
  deleteLabel,
  footnote,
}) {
  const t = useT();
  const toast = useToast();
  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);
  const { height: winH } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  // Limite la zone scrollable a ~55% de l'ecran pour laisser place au clavier sur petits telephones.
  const fieldsMaxH = Math.min(420, Math.round(winH * 0.55));

  useEffect(() => {
    if (visible) setValues(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const set = (k, v) => setValues((prev) => ({ ...prev, [k]: v }));

  // fields peut etre un tableau ou une fonction des valeurs courantes (champs conditionnels).
  const resolvedFields = typeof fields === 'function' ? fields(values) : fields;

  const submit = async () => {
    try {
      setSaving(true);
      await onSubmit(values);
      onClose();
    } catch (e) {
      // Erreur de validation (throw cote ecran) ou reseau : on la montre a
      // l'utilisateur et on GARDE la feuille ouverte pour qu'il puisse corriger.
      toast.error(e.message);
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
          <View style={[styles.sheet, { paddingBottom: Math.max(spacing.xxl, spacing.lg + insets.bottom) }]}>
            <View style={styles.handle} />
            <View style={styles.header}>
              <Text style={font.h2}>{title}</Text>
              <Pressable onPress={onClose} hitSlop={12}>
                <Text style={styles.close}>{t('form.close')}</Text>
              </Pressable>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: fieldsMaxH }}>
              {resolvedFields.map((f) => (
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
                              {opt.glyph ? (
                                <View style={{ marginRight: 8 }}>
                                  <Glyph
                                    name={opt.glyph}
                                    color={active ? colors.textOnTeal : opt.color || colors.text}
                                    size={18}
                                  />
                                </View>
                              ) : opt.color ? (
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
                      placeholder={f.placeholder || (f.type === 'date' ? t('form.datePlaceholder') : undefined)}
                      placeholderTextColor={colors.textMuted}
                      keyboardType={
                        f.type === 'number' || f.type === 'date' ? 'numbers-and-punctuation' : 'default'
                      }
                      style={styles.input}
                    />
                  )}

                  {f.hint ? <Text style={styles.hint}>{f.hint}</Text> : null}
                </View>
              ))}
            </ScrollView>

            {footnote ? <Text style={styles.footnote}>{footnote}</Text> : null}

            <View style={{ marginTop: spacing.md }}>
              <Button title={submitLabel} onPress={submit} loading={saving} />
            </View>
            {onDelete ? (
              <Pressable onPress={onDelete} hitSlop={8} style={styles.deleteBtn}>
                <Text style={styles.deleteText}>{deleteLabel || t('form.delete')}</Text>
              </Pressable>
            ) : null}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(4,8,14,0.6)', justifyContent: 'flex-end' },
  sheetWrap: { width: '100%' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
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
  close: { color: colors.primary, fontFamily: ff.bold, fontSize: 15 },
  field: { marginBottom: spacing.lg },
  label: { ...font.label, marginBottom: spacing.sm },
  hint: { ...font.caption, marginTop: spacing.xs },
  footnote: {
    ...font.caption,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    color: colors.textMuted,
  },
  input: {
    backgroundColor: colors.bgSoft,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    height: 52,
    fontSize: 16,
    fontFamily: ff.medium,
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
    backgroundColor: colors.bgSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  optionText: { color: colors.text, fontFamily: ff.semibold },
  optionTextActive: { color: colors.textOnTeal },
  optionDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  deleteBtn: { alignSelf: 'center', paddingVertical: spacing.md, marginTop: spacing.xs },
  deleteText: { color: colors.negative, fontFamily: ff.bold, fontSize: 15 },
});
