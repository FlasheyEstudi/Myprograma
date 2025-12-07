import { useState, useCallback } from 'react';

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface UsePaginationOptions {
  initialPage?: number;
  initialLimit?: number;
}

export const usePagination = (options: UsePaginationOptions = {}) => {
  const [pagination, setPagination] = useState<PaginationState>({
    page: options.initialPage || 1,
    limit: options.initialLimit || 10,
    total: 0,
    totalPages: 0,
  });

  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  }, []);

  const setTotal = useCallback((total: number) => {
    const totalPages = Math.ceil(total / pagination.limit);
    setPagination(prev => ({ ...prev, total, totalPages }));
  }, [pagination.limit]);

  const nextPage = useCallback(() => {
    setPagination(prev => ({
      ...prev,
      page: Math.min(prev.page + 1, prev.totalPages)
    }));
  }, []);

  const prevPage = useCallback(() => {
    setPagination(prev => ({
      ...prev,
      page: Math.max(prev.page - 1, 1)
    }));
  }, []);

  const firstPage = useCallback(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const lastPage = useCallback(() => {
    setPagination(prev => ({ ...prev, page: prev.totalPages }));
  }, []);

  return {
    ...pagination,
    setPage,
    setLimit,
    setTotal,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    hasNextPage: pagination.page < pagination.totalPages,
    hasPrevPage: pagination.page > 1,
  };
};