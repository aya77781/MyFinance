import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Auth, setAuthToken, setOnUnauthorized } from './api';
import { getItem, setItem, removeItem } from './storage';

const TOKEN_KEY = 'finance_token';
const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  // Deconnexion (locale).
  const logout = useCallback(async () => {
    setToken(null);
    setUser(null);
    setAuthToken(null);
    await removeItem(TOKEN_KEY);
  }, []);

  // Au demarrage : recharge le token stocke et valide la session.
  useEffect(() => {
    (async () => {
      try {
        const stored = await getItem(TOKEN_KEY);
        if (stored) {
          setAuthToken(stored);
          const { user } = await Auth.me();
          setToken(stored);
          setUser(user);
        }
      } catch {
        await removeItem(TOKEN_KEY);
        setAuthToken(null);
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  // Si l'API renvoie 401 en cours d'usage -> on deconnecte.
  useEffect(() => {
    setOnUnauthorized(() => {
      logout();
    });
  }, [logout]);

  const persist = async (res) => {
    setAuthToken(res.token);
    await setItem(TOKEN_KEY, res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const login = useCallback(async (email, password) => {
    const res = await Auth.login({ email, password });
    await persist(res);
  }, []);

  const register = useCallback(async (name, email, password) => {
    const res = await Auth.register({ name, email, password });
    await persist(res);
  }, []);

  return (
    <AuthCtx.Provider value={{ token, user, booting, login, register, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth doit etre utilise dans AuthProvider');
  return ctx;
}
