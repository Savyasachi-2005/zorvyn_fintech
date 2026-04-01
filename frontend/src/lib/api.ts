import axios from 'axios';

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

// Response interceptor — handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if we're not already on login/register
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login';
      }
    }

    // Enhance error message from backend
    if (error.response?.data?.detail) {
      error.message = error.response.data.detail;
    }

    return Promise.reject(error);
  }
);

export default api;
