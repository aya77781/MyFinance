import Constants from 'expo-constants';

// En PRODUCTION (web/Vercel), definis EXPO_PUBLIC_API_URL avec l'URL complete
// du backend deploye, ex : https://mon-backend.onrender.com/api
// Expo inline cette variable au build.
const ENV_URL = process.env.EXPO_PUBLIC_API_URL;

// En DEV, on detecte l'IP de la machine pour qu'un telephone (Expo Go) joigne
// le backend local sur le meme wifi.
function detectHost() {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.expoGoConfig?.debuggerHost ||
    Constants.manifest2?.extra?.expoClient?.hostUri ||
    '';
  const host = hostUri.split(':')[0];
  return host || 'localhost';
}

const API_PORT = 4000;

export const API_URL = ENV_URL || `http://${detectHost()}:${API_PORT}/api`;
