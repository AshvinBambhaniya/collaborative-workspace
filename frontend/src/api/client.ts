import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Hardcoded for now, can be env var
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
        // Simple logout for now. Refresh token logic would go here ideally.
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
        }
    }
    return Promise.reject(error);
  }
);

export default api;
