import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getItem, setItem } from './storage';
import { setDisplayCurrency, displayCurrency, CURRENCY_CODES } from './format';

// Devise d'AFFICHAGE choisie par l'utilisateur. Les montants sont stockes en
// euro (base) et convertis a l'affichage / a la saisie (taux fixe 1 € = 10 MAD).
// Preference locale (comme la langue).
const CURRENCY_KEY = 'app_currency';

export const CURRENCIES = [
  { code: 'EUR', label: 'Euro', symbol: '€' },
  { code: 'USD', label: 'Dollar', symbol: '$' },
  { code: 'MAD', label: 'Dirham', symbol: 'MAD' },
];

const CurrencyCtx = createContext(null);

export function CurrencyProvider({ children }) {
  const [code, setCode] = useState('EUR');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      let saved = 'EUR';
      try {
        const raw = await getItem(CURRENCY_KEY);
        if (raw && CURRENCY_CODES.includes(raw)) saved = raw;
      } catch {
        saved = 'EUR';
      }
      setDisplayCurrency(saved);
      setCode(saved);
      setReady(true);
    })();
  }, []);

  const setCurrency = useCallback(async (next) => {
    if (!CURRENCY_CODES.includes(next)) return;
    setDisplayCurrency(next);
    setCode(next);
    try {
      await setItem(CURRENCY_KEY, next);
    } catch {
      // non bloquant
    }
  }, []);

  const value = useMemo(() => ({ ready, code, setCurrency }), [ready, code, setCurrency]);
  return <CurrencyCtx.Provider value={value}>{children}</CurrencyCtx.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyCtx);
  if (!ctx) throw new Error('useCurrency doit etre utilise dans CurrencyProvider');
  return ctx;
}
