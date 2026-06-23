import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, spacing, radius, font, ff, brandGradient } from '../theme';
import Button from '../components/Button';
import { LogoMark, Wordmark } from '../components/Logo';
import { useAuth } from '../AuthContext';
import { useT, registerTranslations } from '../i18n';

registerTranslations({
  fr: {
    'auth.tagline': 'Tes revenus, charges, epargnes et challenges, au meme endroit.',
    'auth.fillEmailPassword': 'Renseigne ton email et ton mot de passe.',
    'auth.loginTitle': 'Connexion',
    'auth.registerTitle': 'Creer mon compte',
    'auth.loginSub': 'Content de te revoir.',
    'auth.registerSub': "Quelques secondes et c'est parti.",
    'auth.firstName': 'Prenom',
    'auth.optional': 'Optionnel',
    'auth.email': 'Email',
    'auth.emailPlaceholder': 'toi@email.fr',
    'auth.password': 'Mot de passe',
    'auth.passwordPlaceholder': 'Ton mot de passe',
    'auth.minChars': '{n} caracteres minimum',
    'auth.loginButton': 'Se connecter',
    'auth.registerButton': 'Creer mon compte',
    'auth.noAccount': 'Pas encore de compte ? ',
    'auth.haveAccount': 'Deja un compte ? ',
    'auth.createAccountLink': 'Creer un compte',
    'auth.loginLink': 'Se connecter',
  },
  en: {
    'auth.tagline': 'Your income, expenses, savings and challenges, all in one place.',
    'auth.fillEmailPassword': 'Enter your email and password.',
    'auth.loginTitle': 'Sign in',
    'auth.registerTitle': 'Create my account',
    'auth.loginSub': 'Good to see you again.',
    'auth.registerSub': "A few seconds and you're all set.",
    'auth.firstName': 'First name',
    'auth.optional': 'Optional',
    'auth.email': 'Email',
    'auth.emailPlaceholder': 'you@email.com',
    'auth.password': 'Password',
    'auth.passwordPlaceholder': 'Your password',
    'auth.minChars': '{n} characters minimum',
    'auth.loginButton': 'Sign in',
    'auth.registerButton': 'Create my account',
    'auth.noAccount': "Don't have an account? ",
    'auth.haveAccount': 'Already have an account? ',
    'auth.createAccountLink': 'Create an account',
    'auth.loginLink': 'Sign in',
  },
});

export default function AuthScreen() {
  const t = useT();
  const insets = useSafeAreaInsets();
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isLogin = mode === 'login';

  const submit = async () => {
    setError(null);
    if (!email || !password) {
      setError(t('auth.fillEmailPassword'));
      return;
    }
    try {
      setLoading(true);
      if (isLogin) await login(email.trim(), password);
      else await register(name.trim(), email.trim(), password);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={brandGradient} style={{ flex: 1 }}>
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 60 }]}
        keyboardShouldPersistTaps="handled"
      >
        <LogoMark size={58} />
        <View style={{ marginTop: spacing.lg }}>
          <Wordmark size={34} />
        </View>
        <Text style={styles.tagline}>{t('auth.tagline')}</Text>

        <View style={styles.card}>
          <Text style={font.h2}>{isLogin ? t('auth.loginTitle') : t('auth.registerTitle')}</Text>
          <Text style={styles.cardSub}>
            {isLogin ? t('auth.loginSub') : t('auth.registerSub')}
          </Text>

          {!isLogin && (
            <Field
              label={t('auth.firstName')}
              value={name}
              onChangeText={setName}
              placeholder={t('auth.optional')}
            />
          )}
          <Field
            label={t('auth.email')}
            value={email}
            onChangeText={setEmail}
            placeholder={t('auth.emailPlaceholder')}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Field
            label={t('auth.password')}
            value={password}
            onChangeText={setPassword}
            placeholder={isLogin ? t('auth.passwordPlaceholder') : t('auth.minChars', { n: 6 })}
            secureTextEntry
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={{ marginTop: spacing.md }}>
            <Button
              title={isLogin ? t('auth.loginButton') : t('auth.registerButton')}
              onPress={submit}
              loading={loading}
            />
          </View>

          <Pressable
            onPress={() => {
              setError(null);
              setMode(isLogin ? 'register' : 'login');
            }}
            style={styles.switch}
          >
            <Text style={styles.switchText}>
              {isLogin ? t('auth.noAccount') : t('auth.haveAccount')}
              <Text style={styles.switchLink}>{isLogin ? t('auth.createAccountLink') : t('auth.loginLink')}</Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </LinearGradient>
  );
}

function Field({ label, ...props }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  tagline: { color: colors.textOnBrandMuted, fontSize: 15, marginTop: spacing.md, marginBottom: spacing.xl, lineHeight: 21, fontFamily: ff.medium },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardSub: { ...font.caption, marginTop: 4, marginBottom: spacing.lg },
  field: { marginBottom: spacing.lg },
  label: { ...font.label, marginBottom: spacing.sm },
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
  error: { color: colors.negative, fontFamily: ff.semibold, marginTop: spacing.sm },
  switch: { marginTop: spacing.lg, alignItems: 'center' },
  switchText: { color: colors.textMuted, fontSize: 14, fontFamily: ff.medium },
  switchLink: { color: colors.primary, fontFamily: ff.bold },
});
