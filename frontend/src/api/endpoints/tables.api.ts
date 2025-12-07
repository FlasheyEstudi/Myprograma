import api, { handleApiResponse, handleApiError } from '../axios-client';
import {
  Table,
  CreateTableData,
  TableFilters,
  PaginatedResponse
} from '../types';

export const tablesApi = {
  // Get all tables with filters
  getTables: async (filters: TableFilters = {}): Promise<PaginatedResponse<Table>> => {
    try {
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.restaurantId) params.append('restaurantId', filters.restaurantId);
      if (filters.isAvailable !== undefined) params.append('isAvailable', filters.isAvailable.toString());

      const response = await api.get(`/tables?${params.toString()}`);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get table by ID
  getTableById: async (id: string): Promise<Table> => {
    try {
      const response = await api.get(`/tables/${id}`);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Create new table (Admin only)
  createTable: async (data: CreateTableData): Promise<Table> => {
    try {
      const response = await api.post('/tables', data);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Update table (Admin only)
  updateTable: async (id: string, data: Partial<CreateTableData>): Promise<Table> => {
    try {
      const response = await api.put(`/tables/${id}`, data);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Delete table (Admin only)
  deleteTable: async (id: string): Promise<void> => {
    try {
      await api.delete(`/tables/${id}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};