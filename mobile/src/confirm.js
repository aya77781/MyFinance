import { Alert, Platform } from 'react-native';

// Confirmation cross-plateforme.
// Sur le web, `Alert.alert` de React Native n'affiche PAS les boutons : le
// callback de confirmation n'est jamais declenche (suppression silencieusement
// ignoree). On bascule donc sur `window.confirm` sur le web et on garde
// `Alert.alert` (natif) sur iOS / Android. Renvoie une Promise<boolean>.
export function confirmAction({
  title,
  message,
  confirmLabel = 'OK',
  cancelLabel = 'Annuler',
  destructive = false,
}) {
  if (Platform.OS === 'web') {
    const ok =
      typeof window !== 'undefined' && typeof window.confirm === 'function'
        ? window.confirm([title, message].filter(Boolean).join('\n\n'))
        : true;
    return Promise.resolve(ok);
  }
  return new Promise((resolve) => {
    Alert.alert(title || '', message || '', [
      { text: cancelLabel, style: 'cancel', onPress: () => resolve(false) },
      {
        text: confirmLabel,
        style: destructive ? 'destructive' : 'default',
        onPress: () => resolve(true),
      },
    ]);
  });
}
