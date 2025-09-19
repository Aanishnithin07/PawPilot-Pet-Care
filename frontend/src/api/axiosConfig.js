import axios from 'axios';
import { getIdToken } from '../firebase/config';

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000',
});

apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Try to get fresh Firebase ID token
      const token = await getIdToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        // Fallback to stored token
        const storedToken = localStorage.getItem('firebase_token');
        if (storedToken) {
          config.headers.Authorization = `Bearer ${storedToken}`;
        }
      }
    } catch (error) {
      console.error('Error getting Firebase token:', error);
      // Remove invalid token
      localStorage.removeItem('firebase_token');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, redirect to login
      localStorage.removeItem('firebase_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;