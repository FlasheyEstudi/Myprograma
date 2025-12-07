import axios, { AxiosError, AxiosResponse } from 'axios';
import {
  ApiResponse,
  ApiError,
  AuthTokens,
  LoginResponse,
  RegisterResponse,
  RefreshTokenResponse
} from '../types';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-domain.com/api' 
  : 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor para añadir token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor para manejar errores y refresh tokens
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Si error 401 y no es intento previo de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken
        });

        const data = response.data as ApiResponse<RefreshTokenResponse>;
        const { accessToken, refreshToken: newRefreshToken } = data.data.tokens;
        
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', newRefreshToken);
        
        // Reintentar request original
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Si refresh falla, logout
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // Manejar otros errores
    if (error.response?.status === 403) {
      // Redirigir a página de no autorizado
      window.location.href = '/unauthorized';
    }
    
    return Promise.reject(error);
  }
);

// Helper para manejar respuestas de API
export const handleApiResponse = <T>(response: AxiosResponse<ApiResponse<T>>): T => {
  if (!response.data.success) {
    throw new Error(response.data.message);
  }
  return response.data.data;
};

// Helper para manejar errores
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiError;
    return apiError?.message || error.message || 'Error desconocido';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Error desconocido';
};

export default api;