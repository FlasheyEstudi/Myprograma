import api, { handleApiResponse, handleApiError } from '../axios-client';
import {
  LoginData,
  RegisterData,
  LoginResponse,
  RegisterResponse,
  RefreshTokenResponse,
  User,
  UpdateProfileData
} from '../types';

export const authApi = {
  // Login
  login: async (data: LoginData): Promise<LoginResponse> => {
    try {
      const response = await api.post('/auth/login', data);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Register
  register: async (data: RegisterData): Promise<RegisterResponse> => {
    try {
      const response = await api.post('/auth/register', data);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Refresh Token
  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    try {
      const response = await api.post('/auth/refresh', { refreshToken });
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get current user profile
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await api.get('/users/me');
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Update user profile
  updateProfile: async (data: UpdateProfileData): Promise<User> => {
    try {
      const response = await api.put('/users/me', data);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};