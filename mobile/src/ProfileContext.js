import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { getItem, setItem, removeItem } from './storage';
import { useAuth } from './AuthContext';

// Photo de profil stockee localement (sur l'appareil), par utilisateur.
// - Natif : on conserve l'URI du fichier choisi (chaine courte) dans SecureStore.
// - Web : on conserve une data-URI base64 dans localStorage (survit au rechargement).
const ProfileCtx = createContext(null);

// SecureStore (natif) n'accepte que [A-Za-z0-9._-] dans les cles : on nettoie l'email.
const keyFor = (user) =>
  `profile_photo_${(user?.email || 'anon').replace(/[^A-Za-z0-9._-]/g, '_')}`;
const isWeb = Platform.OS === 'web';

export function ProfileProvider({ children }) {
  const { user } = useAuth();
  const [photo, setPhoto] = useState(null);

  // Recharge la photo a chaque changement d'utilisateur.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user) {
        setPhoto(null);
        return;
      }
      const saved = await getItem(keyFor(user));
      if (!cancelled) setPhoto(saved || null);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Ouvre la galerie, recadre en carre, puis enregistre.
  const pickPhoto = useCallback(async () => {
    if (!isWeb) {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) return { ok: false, reason: 'permission' };
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
      base64: isWeb, // web : on a besoin du base64 pour persister
    });
    if (result.canceled) return { ok: false, reason: 'canceled' };

    const asset = result.assets[0];
    const uri = isWeb ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;

    setPhoto(uri);
    if (user) await setItem(keyFor(user), uri);
    return { ok: true };
  }, [user]);

  const removePhoto = useCallback(async () => {
    setPhoto(null);
    if (user) await removeItem(keyFor(user));
  }, [user]);

  return (
    <ProfileCtx.Provider value={{ photo, pickPhoto, removePhoto }}>
      {children}
    </ProfileCtx.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileCtx);
  if (!ctx) throw new Error('useProfile doit etre utilise dans ProfileProvider');
  return ctx;
}
