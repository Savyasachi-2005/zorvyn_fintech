import axios from 'axios';
import toast from 'react-hot-toast';

function formatBackendDetail(detail: unknown): string {
  if (!detail) return 'Request failed';
  if (typeof detail === 'string') return detail;

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object' && 'msg' in item) {
          const msg = (item as { msg?: unknown }).msg;
          if (typeof msg !== 'string') return null;

          const loc = (item as { loc?: unknown }).loc;
          if (Array.isArray(loc)) {
            const fieldPath = loc
              .filter((part) => typeof part === 'string' || typeof part === 'number')
              .join('.');
            return fieldPath ? `${fieldPath}: ${msg}` : msg;
          }

          return msg;
        }
        return null;
      })
      .filter((msg): msg is string => Boolean(msg));

    if (messages.length > 0) {
      return messages.join(', ');
    }
    return 'Validation failed';
  }

  if (typeof detail === 'object' && detail !== null) {
    if ('msg' in detail && typeof (detail as { msg?: unknown }).msg === 'string') {
      return (detail as { msg: string }).msg;
    }
    return 'Request failed';
  }

  return 'Request failed';
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle errors globally with toast
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const detail = error.response?.data?.detail;
    const message = formatBackendDetail(detail);

    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if we're not already on login/register
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        toast.error('Session expired — please log in again');
        window.location.href = '/login';
      }
    } else if (status === 403) {
      toast.error(message || 'Access denied');
    } else if (status === 404) {
      toast.error(message || 'Resource not found');
    }

    // Enhance error message from backend
    error.message = message;

    return Promise.reject(error);
  }
);

export default api;
