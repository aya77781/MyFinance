import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { getItem, setItem } from './storage';
import { setAppLocale } from './format';

const LANG_KEY = 'app_lang';

// Langues proposees dans les parametres de compte.
export const LANGUAGES = [
  { code: 'fr', label: 'Francais' },
  { code: 'en', label: 'English' },
];

// Dictionnaire des traductions (cles a plat type 'budget.title').
// Les fragments par ecran sont fusionnes ci-dessous.
export const translations = {
  fr: {
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.close': 'Fermer',
    'common.add': 'Ajouter',
    'common.back': 'Retour',
    'common.optional': 'Optionnel',
    'common.noData': 'Pas encore de donnees.',
    'common.loading': 'Chargement...',
    'account.language': 'Langue',
    'account.languageHint': "Choisis la langue de l'application.",
  },
  en: {
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.close': 'Close',
    'common.add': 'Add',
    'common.back': 'Back',
    'common.optional': 'Optional',
    'common.noData': 'No data yet.',
    'common.loading': 'Loading...',
    'account.language': 'Language',
    'account.languageHint': 'Choose the app language.',
  },
};

// Fusionne un fragment { fr: {...}, en: {...} } dans le dictionnaire global.
export function registerTranslations(fragment) {
  Object.assign(translations.fr, fragment.fr || {});
  Object.assign(translations.en, fragment.en || {});
}

const LangCtx = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState('fr');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const saved = await getItem(LANG_KEY);
      const initial = saved === 'en' || saved === 'fr' ? saved : 'fr';
      setAppLocale(initial);
      setLangState(initial);
      setReady(true);
    })();
  }, []);

  const setLang = useCallback(async (next) => {
    setAppLocale(next);
    setLangState(next);
    try {
      await setItem(LANG_KEY, next);
    } catch {
      // non bloquant
    }
  }, []);

  const value = useMemo(() => ({ lang, setLang, ready }), [lang, setLang, ready]);
  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>;
}

export function useLang() {
  const ctx = useContext(LangCtx);
  if (!ctx) throw new Error('useLang doit etre utilise dans LanguageProvider');
  return ctx;
}

// Hook de traduction : const t = useT(); puis t('budget.title') ou t('x.y', { n: 3 }).
export function useT() {
  const { lang } = useLang();
  return useCallback(
    (key, vars) => {
      const dict = translations[lang] || translations.fr;
      let str = dict[key];
      if (str == null) str = translations.fr[key];
      if (str == null) return key;
      if (vars) {
        for (const k in vars) {
          str = str.split(`{${k}}`).join(String(vars[k]));
        }
      }
      return str;
    },
    [lang]
  );
}
