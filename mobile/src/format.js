// Formatage monetaire multi-devises (MAD / USD / EUR), sensible a la langue.

// Locale courante : pilotee par le LanguageProvider via setAppLocale().
let LOCALE = 'fr-FR';
export function setAppLocale(lang) {
  LOCALE = lang === 'en' ? 'en-IE' : 'fr-FR'; // en-IE : anglais + euro
}
export function getLocale() {
  return LOCALE;
}

// --- Devises -----------------------------------------------------------------
// L'app stocke TOUS les montants dans une devise de base (l'euro). L'utilisateur
// choisit une devise d'AFFICHAGE (€, $ ou MAD) : les montants sont convertis a
// l'affichage (ex. 100 € -> 1000 MAD) et reconvertis vers l'euro a la saisie.
// Taux fixe demande : 1 € = 1 $ = 10 MAD.
export const CURRENCY_CODES = ['EUR', 'USD', 'MAD'];
export const BASE_CURRENCY = 'EUR';

// 1 unite de la devise vaut RATE[code] euros (donc MAD = 0,1 € -> 10 MAD = 1 €).
const RATE = { EUR: 1, USD: 1, MAD: 0.1 };

// Devise d'affichage courante. Pilotee par le CurrencyProvider.
let DISPLAY = 'EUR';
export function setDisplayCurrency(code) {
  DISPLAY = CURRENCY_CODES.includes(code) ? code : 'EUR';
}
export function displayCurrency() {
  return DISPLAY;
}

// Convertit un montant d'une devise vers une autre (taux fixe ci-dessus).
export function convertAmount(amount, from, to) {
  const n = Number(amount) || 0;
  const rFrom = RATE[from] ?? 1;
  const rTo = RATE[to] ?? 1;
  return (n * rFrom) / rTo;
}

// euro (base) -> devise d'affichage (pour montrer un montant stocke).
export function toDisplay(baseEur) {
  return convertAmount(baseEur, BASE_CURRENCY, DISPLAY);
}
// montant saisi dans la devise d'affichage -> euro (base) pour le stockage.
export function fromDisplay(shown) {
  return convertAmount(shown, DISPLAY, BASE_CURRENCY);
}

// Formate un montant DEJA exprime dans une devise donnee (sans conversion).
export function money(value, code = DISPLAY, { sign = false } = {}) {
  const n = Number(value) || 0;
  const cur = CURRENCY_CODES.includes(code) ? code : 'EUR';
  const formatted = new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: cur,
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: n % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(n));
  if (sign) return `${n < 0 ? '-' : '+'}${formatted}`;
  return n < 0 ? `-${formatted}` : formatted;
}

// `euro(x)` : x est en euro (base). On le convertit vers la devise d'affichage
// puis on le formate. Tous les ecrans qui l'appelaient suivent donc la devise.
export function euro(value, opts) {
  return money(toDisplay(value), DISPLAY, opts);
}

// Alias historique : formatage direct dans la devise d'affichage (la date n'est
// plus utilisee — conservee pour compat d'appel).
export function moneyForDate(value, _date, opts) {
  return euro(value, opts);
}

export function shortDate(d) {
  return new Date(d).toLocaleDateString(LOCALE, { day: '2-digit', month: 'short' });
}

// Date -> 'JJ/MM/AAAA' (pour la saisie). Accepte une Date, un ISO ou un timestamp.
export function dateInput(d = new Date()) {
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date)) return '';
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${date.getFullYear()}`;
}

// 'JJ/MM/AAAA' (ou 'JJ-MM-AAAA') -> ISO string a midi (evite les soucis de fuseau).
// Renvoie null si la chaine est invalide.
export function parseDateInput(s = '') {
  const m = String(s).trim().match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})$/);
  if (!m) return null;
  let [, dd, mm, yyyy] = m;
  dd = Number(dd);
  mm = Number(mm);
  yyyy = Number(yyyy);
  if (yyyy < 100) yyyy += 2000;
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return null;
  const date = new Date(yyyy, mm - 1, dd, 12, 0, 0, 0);
  if (isNaN(date)) return null;
  return date.toISOString();
}

export function monthLabel(year, month) {
  return new Date(year, month, 1).toLocaleDateString(LOCALE, {
    month: 'long',
    year: 'numeric',
  });
}

// Initiales d'une categorie pour la pastille (a la place d'un emoji / icone).
export function initials(name = '') {
  return name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
