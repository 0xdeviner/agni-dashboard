import axios from 'axios';

// Use '/api' by default so api.get('/stats') -> '/api/stats'.
// You can override with VITE_API_BASE_URL to a full URL like 'http://host:3000/api' if needed.
const baseURL = (import.meta.env.VITE_API_BASE_URL?.trim()) || '/api';
console.log('[api] baseURL =', baseURL);

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Optional: helpful logging while debugging
api.interceptors.request.use((config) => {
  console.log(`[api] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    console.warn('[api] error', status, error?.response?.data);
    if (status === 401) {
      localStorage.removeItem('token');
      if (location.pathname !== '/login') location.href = '/login';
    }
    return Promise.reject(error);
  }
);