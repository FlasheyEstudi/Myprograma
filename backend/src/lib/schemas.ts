import { z } from 'zod';

// User schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
});

// Restaurant schemas
export const createRestaurantSchema = z.object({
  name: z.string().min(1, 'Restaurant name is required'),
  description: z.string().optional(),
  cuisine: z.string().optional(),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
  email: z.string().email('Invalid email address').optional(),
  website: z.string().url('Invalid website URL').optional(),
  openingTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  closingTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  maxCapacity: z.number().min(1, 'Max capacity must be at least 1'),
  priceRange: z.enum(['LOW', 'MEDIUM', 'HIGH', 'PREMIUM']).default('MEDIUM'),
});

export const updateRestaurantSchema = createRestaurantSchema.partial();

export const restaurantQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  cuisine: z.string().optional(),
  priceRange: z.enum(['LOW', 'MEDIUM', 'HIGH', 'PREMIUM']).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'createdAt', 'priceRange']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Table schemas
export const createTableSchema = z.object({
  restaurantId: z.string().min(1, 'Restaurant ID is required'),
  tableNumber: z.string().min(1, 'Table number is required'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  minCapacity: z.number().min(1).optional(),
  hasWindow: z.boolean().default(false),
  hasOutdoor: z.boolean().default(false),
  isPrivate: z.boolean().default(false),
});

export const updateTableSchema = createTableSchema.partial();

// Reservation schemas
export const createReservationSchema = z.object({
  restaurantId: z.string().min(1, 'Restaurant ID is required'),
  tableId: z.string().min(1, 'Table ID is required'),
  reservationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  reservationTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  partySize: z.number().min(1, 'Party size must be at least 1'),
  specialRequests: z.string().optional(),
  notes: z.string().optional(),
});

export const updateReservationSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW']).optional(),
  specialRequests: z.string().optional(),
  notes: z.string().optional(),
});

export const reservationQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW']).optional(),
  restaurantId: z.string().optional(),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
  sortBy: z.enum(['createdAt', 'reservationDate', 'reservationTime']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const availabilityQuerySchema = z.object({
  restaurantId: z.string().optional(),
  date: z.string().optional(),
  partySize: z.string().optional(),
  timeFrom: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)').optional(),
  timeTo: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)').optional(),
});

// Review schemas
export const createReviewSchema = z.object({
  restaurantId: z.string().min(1, 'Restaurant ID is required'),
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  title: z.string().optional(),
  content: z.string().optional(),
});

export const updateReviewSchema = z.object({
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5').optional(),
  title: z.string().optional(),
  content: z.string().optional(),
});

export const reviewQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  restaurantId: z.string().optional(),
  rating: z.coerce.number().min(1).max(5).optional(),
  sortBy: z.enum(['createdAt', 'rating']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Refresh token schema
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// Export types
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateRestaurantInput = z.infer<typeof createRestaurantSchema>;
export type UpdateRestaurantInput = z.infer<typeof updateRestaurantSchema>;
export type RestaurantQueryInput = z.infer<typeof restaurantQuerySchema>;
export type CreateTableInput = z.infer<typeof createTableSchema>;
export type UpdateTableInput = z.infer<typeof updateTableSchema>;
export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type UpdateReservationInput = z.infer<typeof updateReservationSchema>;
export type ReservationQueryInput = z.infer<typeof reservationQuerySchema>;
export type AvailabilityQueryInput = z.infer<typeof availabilityQuerySchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type ReviewQueryInput = z.infer<typeof reviewQuerySchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;