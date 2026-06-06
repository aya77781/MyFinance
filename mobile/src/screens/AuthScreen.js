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
import { useAuth } from '../AuthContext';

export default function AuthScreen() {
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
      setError('Renseigne ton email et ton mot de passe.');
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
        <View style={styles.brandMark} />
        <Text style={styles.brand}>Finance</Text>
        <Text style={styles.tagline}>Tes revenus, charges, epargnes et challenges, au meme endroit.</Text>

        <View style={styles.card}>
          <Text style={font.h2}>{isLogin ? 'Connexion' : 'Creer mon compte'}</Text>
          <Text style={styles.cardSub}>
            {isLogin ? 'Content de te revoir.' : 'Quelques secondes et c\'est parti.'}
          </Text>

          {!isLogin && (
            <Field
              label="Prenom"
              value={name}
              onChangeText={setName}
              placeholder="Optionnel"
            />
          )}
          <Field
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="toi@email.fr"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Field
            label="Mot de passe"
            value={password}
            onChangeText={setPassword}
            placeholder={isLogin ? 'Ton mot de passe' : '6 caracteres minimum'}
            secureTextEntry
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={{ marginTop: spacing.md }}>
            <Button
              title={isLogin ? 'Se connecter' : 'Creer mon compte'}
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
              {isLogin ? "Pas encore de compte ? " : 'Deja un compte ? '}
              <Text style={styles.switchLink}>{isLogin ? 'Creer un compte' : 'Se connecter'}</Text>
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
  brandMark: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.9)',
    marginBottom: spacing.md,
  },
  brand: { color: '#fff', fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
  tagline: { color: colors.textOnBrandMuted, fontSize: 15, marginTop: 6, marginBottom: spacing.xl, lineHeight: 21 },
  card: {
    backgroundColor: colors.bg,
    borderRadius: radius.lg,
    padding: spacing.xl,
  },
  cardSub: { ...font.caption, marginTop: 4, marginBottom: spacing.lg },
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
  error: { color: colors.negative, fontWeight: '600', marginTop: spacing.sm },
  switch: { marginTop: spacing.lg, alignItems: 'center' },
  switchText: { color: colors.textMuted, fontSize: 14, fontWeight: '500' },
  switchLink: { color: colors.primary, fontWeight: '700' },
});
