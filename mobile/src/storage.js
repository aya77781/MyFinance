import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Stockage du token : SecureStore sur mobile, localStorage sur web
// (SecureStore n'existe pas sur navigateur).
const isWeb = Platform.OS === 'web';

export async function setItem(key, value) {
  if (isWeb) {
    if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

export async function getItem(key) {
  if (isWeb) {
    if (typeof localStorage !== 'undefined') return localStorage.getItem(key);
    return null;
  }
  return SecureStore.getItemAsync(key);
}

export async function removeItem(key) {
  if (isWeb) {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}
