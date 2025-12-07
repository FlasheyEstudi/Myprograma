import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api-response';
import { updateRestaurantSchema } from '@/lib/schemas';
import { z } from 'zod';

// Get restaurant by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const restaurant = await db.restaurant.findUnique({
      where: { 
        id: params.id,
        isActive: true 
      },
      include: {
        tables: {
          where: { isAvailable: true },
          orderBy: { tableNumber: 'asc' },
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10, // Limit to recent reviews
        },
        _count: {
          select: {
            reviews: true,
            tables: true,
          },
        },
      },
    });

    if (!restaurant) {
      return notFoundResponse('Restaurant');
    }

    // Calculate average rating
    const averageRating = restaurant.reviews.length > 0
      ? restaurant.reviews.reduce((sum, review) => sum + review.rating, 0) / restaurant.reviews.length
      : 0;

    const restaurantWithRating = {
      ...restaurant,
      averageRating: Math.round(averageRating * 10) / 10,
      reviewCount: restaurant._count.reviews,
      tableCount: restaurant._count.tables,
      _count: undefined, // Remove _count from response
    };

    return successResponse('Restaurant retrieved successfully', restaurantWithRating);
  } catch (error) {
    console.error('Get restaurant error:', error);
    return errorResponse(500, 'Internal server error', 'INTERNAL_ERROR');
  }
}

// Update restaurant (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const updateData = updateRestaurantSchema.parse(body);

    const restaurant = await db.restaurant.update({
      where: { id: params.id },
      data: updateData,
      include: {
        _count: {
          select: {
            tables: true,
            reviews: true,
          },
        },
      },
    });

    return successResponse('Restaurant updated successfully', restaurant);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(400, 'Validation failed', 'VALIDATION_ERROR');
    }

    console.error('Update restaurant error:', error);
    return errorResponse(500, 'Internal server error', 'INTERNAL_ERROR');
  }
}

// Delete restaurant (soft delete - admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.restaurant.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return successResponse('Restaurant deleted successfully');
  } catch (error) {
    console.error('Delete restaurant error:', error);
    return errorResponse(500, 'Internal server error', 'INTERNAL_ERROR');
  }
}