import axios from 'axios';
import { API_CONFIG } from './config';

// Create axios instances with default configurations
export const gdcClient = axios.create({
  baseURL: API_CONFIG.GDC.BASE_URL,
  params: API_CONFIG.GDC.DEFAULT_PARAMS
});

export const localClient = axios.create({
  baseURL: API_CONFIG.LOCAL.BASE_URL
});

// Add response interceptor for error handling
[gdcClient, localClient].forEach(client => {
  client.interceptors.response.use(
    response => response,
    error => {
      console.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        params: error.config?.params,
        error: error.response?.data || error.message
      });
      return Promise.reject(error);
    }
  );
});