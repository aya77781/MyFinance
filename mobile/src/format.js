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
// L'utilisateur choisit une devise par defaut qui s'applique A PARTIR d'un mois
// donne (sans modifier les mois passes). On stocke donc une liste d'"epoques" :
//   [{ from: 'YYYY-MM', code: 'EUR' }, { from: '2026-07', code: 'MAD' }]
// La devise d'un mois = l'epoque la plus recente dont `from` <= ce mois.
// Avant toute epoque : EUR (devise historique de l'app).
export const CURRENCY_CODES = ['EUR', 'USD', 'MAD'];

// Taux fixe demande : 10 MAD = 1 $ = 1 € (le $ et le € sont a parite).
// On exprime chaque devise en "base EUR" : 1 unite vaut RATE[code] euros.
const RATE = { EUR: 1, USD: 1, MAD: 0.1 };

// Epoques de devise, triees par `from` croissant. Pilotees par le CurrencyProvider.
let EPOCHS = [];
export function setCurrencyEpochs(epochs = []) {
  EPOCHS = [...epochs].filter((e) => e && e.from && e.code).sort((a, b) => (a.from < b.from ? -1 : 1));
}

// Cle 'YYYY-MM' d'une date.
export function monthKey(d = new Date()) {
  const dt = d instanceof Date ? d : new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
}

// Devise applicable a un mois ('YYYY-MM').
export function currencyForMonth(ym) {
  let code = 'EUR';
  for (const e of EPOCHS) {
    if (e.from <= ym) code = e.code;
    else break;
  }
  return CURRENCY_CODES.includes(code) ? code : 'EUR';
}

export function currencyForDate(d = new Date()) {
  return currencyForMonth(monthKey(d));
}

// Devise "par defaut" active aujourd'hui (celle du mois courant).
export function currentCurrency() {
  return currencyForDate(new Date());
}

// Convertit un montant d'une devise vers une autre (taux fixe ci-dessus).
export function convertAmount(amount, from, to) {
  const n = Number(amount) || 0;
  const rFrom = RATE[from] ?? 1;
  const rTo = RATE[to] ?? 1;
  return (n * rFrom) / rTo;
}

// Formate un montant dans une devise donnee.
export function money(value, code = currentCurrency(), { sign = false } = {}) {
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

// Formate dans la devise du mois de la date fournie (pas de conversion : chaque
// mois garde sa devise d'origine).
export function moneyForDate(value, date, opts) {
  return money(value, currencyForDate(date), opts);
}

// Compat historique : `euro()` formate desormais dans la devise par defaut
// active (mois courant). Tous les ecrans qui l'appelaient suivent la devise.
export function euro(value, opts) {
  return money(value, currentCurrency(), opts);
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
