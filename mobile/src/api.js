import { API_URL } from './config';

// Token courant + callback declenche quand le serveur repond 401 (session invalide).
let authToken = null;
let onUnauthorized = null;

export function setAuthToken(token) {
  authToken = token;
}

export function setOnUnauthorized(fn) {
  onUnauthorized = fn;
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    if (onUnauthorized) onUnauthorized();
    throw new Error('Session expiree, reconnecte-toi');
  }
  if (!res.ok) {
    let message = `Erreur ${res.status}`;
    try {
      const body = await res.json();
      message = body.error || message;
    } catch {}
    throw new Error(message);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  get: (p) => request(p),
  post: (p, body) => request(p, { method: 'POST', body: JSON.stringify(body) }),
  put: (p, body) => request(p, { method: 'PUT', body: JSON.stringify(body) }),
  del: (p) => request(p, { method: 'DELETE' }),
};

// Authentification.
export const Auth = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// Helpers dedies par ressource.
export const Dashboard = {
  get: (year, month) => {
    const q = [];
    if (year != null) q.push(`year=${year}`);
    if (month != null) q.push(`month=${month}`);
    return api.get(`/dashboard${q.length ? `?${q.join('&')}` : ''}`);
  },
};

export const Transactions = {
  list: (params = '') => api.get(`/transactions${params}`),
  create: (data) => api.post('/transactions', data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  remove: (id) => api.del(`/transactions/${id}`),
};

export const Categories = {
  list: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  remove: (id) => api.del(`/categories/${id}`),
};

export const Income = {
  list: () => api.get('/income'),
  create: (data) => api.post('/income', data),
  update: (id, data) => api.put(`/income/${id}`, data),
  remove: (id) => api.del(`/income/${id}`),
};

export const Charges = {
  list: () => api.get('/charges'),
  create: (data) => api.post('/charges', data),
  update: (id, data) => api.put(`/charges/${id}`, data),
  remove: (id) => api.del(`/charges/${id}`),
};

export const Savings = {
  list: () => api.get('/savings'),
  create: (data) => api.post('/savings', data),
  update: (id, data) => api.put(`/savings/${id}`, data),
  contribute: (id, data) => api.post(`/savings/${id}/contributions`, data),
  remove: (id) => api.del(`/savings/${id}`),
};

export const Challenges = {
  list: () => api.get('/challenges'),
  create: (data) => api.post('/challenges', data),
  update: (id, data) => api.put(`/challenges/${id}`, data),
  addEntry: (id, data) => api.post(`/challenges/${id}/entries`, data),
  remove: (id) => api.del(`/challenges/${id}`),
};
