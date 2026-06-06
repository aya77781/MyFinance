import Constants from 'expo-constants';

// Detecte automatiquement l'IP de la machine de dev pour qu'un telephone
// physique (Expo Go) puisse joindre le backend sur le meme reseau wifi.
// Sur emulateur / web, localhost suffit.
function detectHost() {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.expoGoConfig?.debuggerHost ||
    Constants.manifest2?.extra?.expoClient?.hostUri ||
    '';
  const host = hostUri.split(':')[0];
  return host || 'localhost';
}

// Port du backend Express.
const API_PORT = 4000;

export const API_URL = `http://${detectHost()}:${API_PORT}/api`;
