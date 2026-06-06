// Formatage EUR / Francais.

export function euro(value, { sign = false } = {}) {
  const n = Number(value) || 0;
  const formatted = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: n % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(n));
  if (sign) return `${n < 0 ? '-' : '+'}${formatted}`;
  return n < 0 ? `-${formatted}` : formatted;
}

export function shortDate(d) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

export function monthLabel(year, month) {
  return new Date(year, month, 1).toLocaleDateString('fr-FR', {
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
