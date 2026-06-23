// Formatage EUR, sensible a la langue choisie (FR / EN).

// Locale courante : pilotee par le LanguageProvider via setAppLocale().
let LOCALE = 'fr-FR';
export function setAppLocale(lang) {
  LOCALE = lang === 'en' ? 'en-IE' : 'fr-FR'; // en-IE : anglais + euro
}
export function getLocale() {
  return LOCALE;
}

export function euro(value, { sign = false } = {}) {
  const n = Number(value) || 0;
  const formatted = new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: n % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(n));
  if (sign) return `${n < 0 ? '-' : '+'}${formatted}`;
  return n < 0 ? `-${formatted}` : formatted;
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
