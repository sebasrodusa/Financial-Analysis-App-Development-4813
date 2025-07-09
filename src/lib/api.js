import { useAuth } from '@clerk/clerk-react';

const API_URL = import.meta.env?.VITE_API_URL || '';

export default function useApi() {
  const { getToken } = useAuth();

  async function request(path, options = {}) {
    const url = `${API_URL}${path}`;
    const token = await getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(text || res.statusText);
    }
    return res.json().catch(() => ({}));
  }

  const api = {
    // Auth
    login: (email, password) =>
      request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

    signup: (data) =>
      request('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),

    // Users
    getUsers: () => request('/users'),
    createUser: (data) =>
      request('/users', { method: 'POST', body: JSON.stringify(data) }),
    updateUser: (id, data) =>
      request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteUser: (id) =>
      request(`/users/${id}`, { method: 'DELETE' }),

    // Clients
    getClients: () => request('/clients'),
    createClient: (data) =>
      request('/clients', { method: 'POST', body: JSON.stringify(data) }),
    updateClient: (id, data) =>
      request(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteClient: (id) =>
      request(`/clients/${id}`, { method: 'DELETE' }),

    // Analyses
    getAnalyses: () => request('/analyses'),
    createAnalysis: (data) =>
      request('/analyses', { method: 'POST', body: JSON.stringify(data) }),
    updateAnalysis: (id, data) =>
      request(`/analyses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteAnalysis: (id) =>
      request(`/analyses/${id}`, { method: 'DELETE' }),
  };

  return api;
}
