import api, { handleApiResponse, handleApiError } from '../axios-client';
import {
  Reservation,
  CreateReservationData,
  ReservationFilters,
  AvailabilityData,
  AvailabilityParams,
  PaginatedResponse
} from '../types';

export const reservationsApi = {
  // Get all reservations with filters
  getReservations: async (filters: ReservationFilters = {}): Promise<PaginatedResponse<Reservation>> => {
    try {
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.status) params.append('status', filters.status);
      if (filters.restaurantId) params.append('restaurantId', filters.restaurantId);
      if (filters.userId) params.append('userId', filters.userId);

      const response = await api.get(`/reservations?${params.toString()}`);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get reservation by ID
  getReservationById: async (id: string): Promise<Reservation> => {
    try {
      const response = await api.get(`/reservations/${id}`);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Create new reservation
  createReservation: async (data: CreateReservationData): Promise<Reservation> => {
    try {
      const response = await api.post('/reservations', data);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Cancel reservation
  cancelReservation: async (id: string): Promise<void> => {
    try {
      await api.delete(`/reservations/${id}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Check availability
  checkAvailability: async (params: AvailabilityParams): Promise<AvailabilityData> => {
    try {
      const searchParams = new URLSearchParams();
      
      searchParams.append('restaurantId', params.restaurantId);
      searchParams.append('date', params.date);
      searchParams.append('partySize', params.partySize.toString());
      if (params.timeFrom) searchParams.append('timeFrom', params.timeFrom);
      if (params.timeTo) searchParams.append('timeTo', params.timeTo);

      const response = await api.get(`/availability?${searchParams.toString()}`);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get user reservations
  getUserReservations: async (filters: ReservationFilters = {}): Promise<PaginatedResponse<Reservation>> => {
    try {
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.status) params.append('status', filters.status);

      const response = await api.get(`/users/me/reservations?${params.toString()}`);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};