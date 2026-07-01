import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getItem, setItem } from './storage';
import {
  setCurrencyEpochs,
  currencyForMonth,
  currentCurrency,
  convertAmount,
  money,
  monthKey,
  CURRENCY_CODES,
} from './format';

// Devise par defaut choisie par l'utilisateur, applicable A PARTIR d'un mois
// (sans toucher aux mois passes). On persiste la liste des "epoques" localement
// (comme la langue) : c'est une preference d'affichage, pas une donnee metier.
const CURRENCY_KEY = 'app_currency_epochs';

// Libelles proposes dans les reglages.
export const CURRENCIES = [
  { code: 'EUR', label: 'Euro', symbol: '€' },
  { code: 'USD', label: 'Dollar', symbol: '$' },
  { code: 'MAD', label: 'Dirham', symbol: 'MAD' },
];

const CurrencyCtx = createContext(null);

export function CurrencyProvider({ children }) {
  const [epochs, setEpochs] = useState([]);
  const [ready, setReady] = useState(false);

  // Charge les epoques au demarrage et alimente le module format.js.
  useEffect(() => {
    (async () => {
      let saved = [];
      try {
        const raw = await getItem(CURRENCY_KEY);
        if (raw) saved = JSON.parse(raw);
      } catch {
        saved = [];
      }
      if (!Array.isArray(saved)) saved = [];
      setCurrencyEpochs(saved);
      setEpochs(saved);
      setReady(true);
    })();
  }, []);

  // Change la devise par defaut A PARTIR du mois courant (upsert d'une epoque).
  const setFromNow = useCallback(
    async (code) => {
      if (!CURRENCY_CODES.includes(code)) return;
      const ym = monthKey(new Date());
      const next = [...epochs.filter((e) => e.from !== ym), { from: ym, code }].sort((a, b) =>
        a.from < b.from ? -1 : 1
      );
      setCurrencyEpochs(next);
      setEpochs(next);
      try {
        await setItem(CURRENCY_KEY, JSON.stringify(next));
      } catch {
        // non bloquant
      }
    },
    [epochs]
  );

  const value = useMemo(
    () => ({
      ready,
      epochs,
      code: currentCurrency(), // devise active (mois courant)
      setFromNow,
      codeForMonth: currencyForMonth,
      convert: convertAmount,
      format: money,
    }),
    // `epochs` en dep : `code`/helpers relisent le module format.js deja synchronise.
    [ready, epochs, setFromNow]
  );

  return <CurrencyCtx.Provider value={value}>{children}</CurrencyCtx.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyCtx);
  if (!ctx) throw new Error('useCurrency doit etre utilise dans CurrencyProvider');
  return ctx;
}
