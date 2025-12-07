import api, { handleApiResponse, handleApiError } from '../axios-client';
import {
  Review,
  CreateReviewData,
  ReviewFilters,
  PaginatedResponse
} from '../types';

export const reviewsApi = {
  // Get all reviews with filters
  getReviews: async (filters: ReviewFilters = {}): Promise<PaginatedResponse<Review>> => {
    try {
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.restaurantId) params.append('restaurantId', filters.restaurantId);
      if (filters.rating) params.append('rating', filters.rating.toString());
      if (filters.isApproved !== undefined) params.append('isApproved', filters.isApproved.toString());

      const response = await api.get(`/reviews?${params.toString()}`);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get review by ID
  getReviewById: async (id: string): Promise<Review> => {
    try {
      const response = await api.get(`/reviews/${id}`);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Create new review
  createReview: async (data: CreateReviewData): Promise<Review> => {
    try {
      const response = await api.post('/reviews', data);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Update review (Admin only)
  updateReview: async (id: string, data: Partial<CreateReviewData>): Promise<Review> => {
    try {
      const response = await api.put(`/reviews/${id}`, data);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Delete review (Admin only)
  deleteReview: async (id: string): Promise<void> => {
    try {
      await api.delete(`/reviews/${id}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Approve review (Admin only)
  approveReview: async (id: string): Promise<Review> => {
    try {
      const response = await api.put(`/reviews/${id}/approve`);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};