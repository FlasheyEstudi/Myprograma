import api, { handleApiResponse, handleApiError } from '../axios-client';
import {
  Restaurant,
  RestaurantWithDetails,
  CreateRestaurantData,
  RestaurantFilters,
  PaginatedResponse
} from '../types';

export const restaurantsApi = {
  // Get all restaurants with filters
  getRestaurants: async (filters: RestaurantFilters = {}): Promise<PaginatedResponse<Restaurant>> => {
    try {
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.cuisine) params.append('cuisine', filters.cuisine);
      if (filters.priceRange) params.append('priceRange', filters.priceRange);
      if (filters.search) params.append('search', filters.search);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

      const response = await api.get(`/restaurants?${params.toString()}`);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get restaurant by ID
  getRestaurantById: async (id: string): Promise<RestaurantWithDetails> => {
    try {
      const response = await api.get(`/restaurants/${id}`);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Create new restaurant (Admin only)
  createRestaurant: async (data: CreateRestaurantData): Promise<Restaurant> => {
    try {
      const response = await api.post('/restaurants', data);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Update restaurant (Admin only)
  updateRestaurant: async (id: string, data: Partial<CreateRestaurantData>): Promise<Restaurant> => {
    try {
      const response = await api.put(`/restaurants/${id}`, data);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Delete restaurant (Admin only)
  deleteRestaurant: async (id: string): Promise<void> => {
    try {
      await api.delete(`/restaurants/${id}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};