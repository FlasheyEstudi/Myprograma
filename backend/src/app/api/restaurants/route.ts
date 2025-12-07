import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api-response';
import { restaurantQuerySchema, createRestaurantSchema } from '@/lib/schemas';
import { z } from 'zod';
import { createPaginatedData, paginatedResponse } from '@/lib/api-response';

// Get all restaurants with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    console.log('Raw searchParams:', Object.fromEntries(searchParams.entries()));
    
    // Simple parsing without Zod for now
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const cuisine = searchParams.get('cuisine');
    const priceRange = searchParams.get('priceRange');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    
    console.log('Processed values:', { page, limit, cuisine, priceRange, search, sortBy, sortOrder });
    const { offset } = calculatePagination(page, limit, 0);

    // Build where clause
    const where: any = {
      isActive: true,
    };

    if (cuisine) {
      where.cuisine = {
        contains: cuisine,
        mode: 'insensitive',
      };
    }

    if (priceRange) {
      where.priceRange = priceRange;
    }

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          cuisine: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    // Get total count
    const total = await db.restaurant.count({ where });

    // Get restaurants with average rating
    const restaurants = await db.restaurant.findMany({
      where,
      include: {
        reviews: {
          select: {
            rating: true,
          },
        },
        _count: {
          select: {
            reviews: true,
            tables: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: offset,
      take: limit,
    });

    // Calculate average rating for each restaurant
    const restaurantsWithRating = restaurants.map(restaurant => {
      const averageRating = restaurant.reviews.length > 0
        ? restaurant.reviews.reduce((sum, review) => sum + review.rating, 0) / restaurant.reviews.length
        : 0;

      return {
        ...restaurant,
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
        reviewCount: restaurant._count.reviews,
        tableCount: restaurant._count.tables,
        reviews: undefined, // Remove reviews array from response
        _count: undefined, // Remove _count from response
      };
    });

    const paginatedData = createPaginatedData(restaurantsWithRating, total, page, limit);
    return paginatedResponse('Restaurants retrieved successfully', paginatedData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log('Zod error:', error.errors);
      return errorResponse(400, 'Validation failed', 'VALIDATION_ERROR');
    }

    console.error('Get restaurants error:', error);
    return errorResponse(500, 'Internal server error', 'INTERNAL_ERROR');
  }
}

// Create new restaurant (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const restaurantData = createRestaurantSchema.parse(body);

    const restaurant = await db.restaurant.create({
      data: restaurantData,
      include: {
        _count: {
          select: {
            tables: true,
            reviews: true,
          },
        },
      },
    });

    return successResponse('Restaurant created successfully', restaurant);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(400, 'Validation failed', 'VALIDATION_ERROR');
    }

    console.error('Create restaurant error:', error);
    return errorResponse(500, 'Internal server error', 'INTERNAL_ERROR');
  }
}

function calculatePagination(page: number, limit: number, total: number) {
  const offset = (page - 1) * limit;
  return { offset };
}