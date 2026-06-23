import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Text, TextInput, Platform } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  useFonts,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';

import Tabs from './src/navigation/Tabs';
import AuthScreen from './src/screens/AuthScreen';
import { AuthProvider, useAuth } from './src/AuthContext';
import { ProfileProvider } from './src/ProfileContext';
import { LanguageProvider } from './src/i18n';
import { colors, ff } from './src/theme';

// Sur le web : titre, theme et icones "Ajouter a l'ecran d'accueil" (PWA).
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  document.title = 'MyFinance';
  const head = document.head;
  const ensure = (selector, tag, attrs) => {
    if (head.querySelector(selector)) return;
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    head.appendChild(el);
  };
  ensure('link[rel="manifest"]', 'link', { rel: 'manifest', href: '/manifest.json' });
  ensure('link[rel="apple-touch-icon"]', 'link', { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' });
  ensure('meta[name="theme-color"]', 'meta', { name: 'theme-color', content: '#0F1520' });
  ensure('meta[name="apple-mobile-web-app-capable"]', 'meta', { name: 'apple-mobile-web-app-capable', content: 'yes' });
  ensure('meta[name="apple-mobile-web-app-title"]', 'meta', { name: 'apple-mobile-web-app-title', content: 'MyFinance' });
  ensure('meta[name="apple-mobile-web-app-status-bar-style"]', 'meta', {
    name: 'apple-mobile-web-app-status-bar-style',
    content: 'black-translucent',
  });
}

// Police Manrope par defaut sur tous les textes.
Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.style = [{ fontFamily: ff.regular, color: colors.text }];
TextInput.defaultProps = TextInput.defaultProps || {};
TextInput.defaultProps.style = [{ fontFamily: ff.regular }];

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.bg, primary: colors.primary },
};

function Root() {
  const { token, booting } = useAuth();

  if (booting) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!token) {
    return (
      <>
        <StatusBar style="light" />
        <AuthScreen />
      </>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style="light" />
      <Tabs />
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <LanguageProvider>
          <AuthProvider>
            <ProfileProvider>
              <Root />
            </ProfileProvider>
          </AuthProvider>
        </LanguageProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
