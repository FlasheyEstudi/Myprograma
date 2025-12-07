import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import { db } from '@/lib/db';
import { successResponse, errorResponse, conflictResponse } from '@/lib/api-response';
import { createReviewSchema, reviewQuerySchema } from '@/lib/schemas';
import { z } from 'zod';
import { createPaginatedData, paginatedResponse } from '@/lib/api-response';

// Get all reviews (with optional filters)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Simple parsing without Zod for now
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const restaurantId = searchParams.get('restaurantId');
    const rating = searchParams.get('rating') ? parseInt(searchParams.get('rating')) : undefined;
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    const { offset } = calculatePagination(page, limit, 0);

    // Build where clause
    const where: any = {
      isApproved: true, // Only show approved reviews
    };

    if (restaurantId) {
      where.restaurantId = restaurantId;
    }

    if (rating) {
      where.rating = rating;
    }

    // Get total count
    const total = await db.review.count({ where });

    // Get reviews with related data
    const reviews = await db.review.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        restaurant: {
          select: {
            id: true,
            name: true,
            cuisine: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: offset,
      take: limit,
    });

    const paginatedData = createPaginatedData(reviews, total, page, limit);
    return paginatedResponse('Reviews retrieved successfully', paginatedData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(400, 'Validation failed', 'VALIDATION_ERROR');
    }

    console.error('Get reviews error:', error);
    return errorResponse(500, 'Internal server error', 'INTERNAL_ERROR');
  }
}

// Create new review
export async function POST(request: NextRequest) {
  return requireAuth(async (req: any) => {
    try {
      const body = await request.json();
      const reviewData = createReviewSchema.parse(body);

      // Validate restaurant exists
      const restaurant = await db.restaurant.findUnique({
        where: { id: reviewData.restaurantId, isActive: true },
      });

      if (!restaurant) {
        return errorResponse(404, 'Restaurant not found', 'RESTAURANT_NOT_FOUND');
      }

      // Check if user already reviewed this restaurant
      const existingReview = await db.review.findUnique({
        where: {
          userId_restaurantId: {
            userId: req.user.id,
            restaurantId: reviewData.restaurantId,
          },
        },
      });

      if (existingReview) {
        return conflictResponse('You have already reviewed this restaurant');
      }

      // Check if user has a completed reservation at this restaurant
      const hasReservation = await db.reservation.findFirst({
        where: {
          userId: req.user.id,
          restaurantId: reviewData.restaurantId,
          status: 'COMPLETED',
        },
      });

      if (!hasReservation) {
        return errorResponse(400, 'You must have a completed reservation to review this restaurant', 'NO_RESERVATION');
      }

      // Create review
      const review = await db.review.create({
        data: {
          ...reviewData,
          userId: req.user.id,
          isVerified: true, // Mark as verified since they have a reservation
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          restaurant: {
            select: {
              id: true,
              name: true,
              cuisine: true,
            },
          },
        },
      });

      return successResponse('Review created successfully', review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return errorResponse(400, 'Validation failed', 'VALIDATION_ERROR');
      }

      console.error('Create review error:', error);
      return errorResponse(500, 'Internal server error', 'INTERNAL_ERROR');
    }
  })(request);
}

function calculatePagination(page: number, limit: number, total: number) {
  const offset = (page - 1) * limit;
  return { offset };
}