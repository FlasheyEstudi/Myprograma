import { NextResponse } from 'next/server';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function successResponse<T>(
  message: string,
  data?: T,
  meta?: ApiResponse<T>['meta']
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    message,
    data,
    meta,
  });
}

export function errorResponse(
  statusCode: number,
  message: string,
  code?: string
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      message,
      error: code,
    },
    { status: statusCode }
  );
}

export function paginatedResponse<T>(
  message: string,
  paginatedData: PaginatedData<T>
): NextResponse<ApiResponse<T[]>> {
  return NextResponse.json({
    success: true,
    message,
    data: paginatedData.items,
    meta: {
      page: paginatedData.page,
      limit: paginatedData.limit,
      total: paginatedData.total,
      totalPages: paginatedData.totalPages,
    },
  });
}

export function calculatePagination(
  page: number,
  limit: number,
  total: number
): { totalPages: number; offset: number } {
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  return { totalPages, offset };
}

export function createPaginatedData<T>(
  items: T[],
  total: number,
  page: number,
  limit: number
): PaginatedData<T> {
  const { totalPages } = calculatePagination(page, limit, total);
  return {
    items,
    total,
    page,
    limit,
    totalPages,
  };
}

// Validation error helper
export function validationErrorResponse(errors: string[]): NextResponse<ApiResponse> {
  return errorResponse(400, 'Validation failed', 'VALIDATION_ERROR');
}

// Common error responses
export const notFoundResponse = (resource: string = 'Resource') =>
  errorResponse(404, `${resource} not found`, 'NOT_FOUND');

export const unauthorizedResponse = () =>
  errorResponse(401, 'Unauthorized', 'UNAUTHORIZED');

export const forbiddenResponse = () =>
  errorResponse(403, 'Forbidden', 'FORBIDDEN');

export const conflictResponse = (message: string) =>
  errorResponse(409, message, 'CONFLICT');

export const serverErrorResponse = () =>
  errorResponse(500, 'Internal server error', 'INTERNAL_ERROR');