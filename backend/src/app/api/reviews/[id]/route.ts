import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import { db } from '@/lib/db';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api-response';
import { updateReviewSchema } from '@/lib/schemas';
import { z } from 'zod';

// Get review by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const review = await db.review.findUnique({
      where: { id: params.id },
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
            address: true,
          },
        },
      },
    });

    if (!review) {
      return notFoundResponse('Review');
    }

    // Only show approved reviews unless it's the user's own review or admin
    if (!review.isApproved) {
      return errorResponse(403, 'Review not approved', 'NOT_APPROVED');
    }

    return successResponse('Review retrieved successfully', review);
  } catch (error) {
    console.error('Get review error:', error);
    return errorResponse(500, 'Internal server error', 'INTERNAL_ERROR');
  }
}

// Update review
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireAuth(async (req: any) => {
    try {
      const body = await request.json();
      const updateData = updateReviewSchema.parse(body);

      // Get existing review
      const existingReview = await db.review.findUnique({
        where: { id: params.id },
      });

      if (!existingReview) {
        return notFoundResponse('Review');
      }

      // Check if user owns this review or is admin
      if (existingReview.userId !== req.user.id && !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
        return errorResponse(403, 'Access denied', 'ACCESS_DENIED');
      }

      // Update review
      const review = await db.review.update({
        where: { id: params.id },
        data: updateData,
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

      return successResponse('Review updated successfully', review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return errorResponse(400, 'Validation failed', 'VALIDATION_ERROR');
      }

      console.error('Update review error:', error);
      return errorResponse(500, 'Internal server error', 'INTERNAL_ERROR');
    }
  })(request);
}

// Delete review
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireAuth(async (req: any) => {
    try {
      // Get existing review
      const existingReview = await db.review.findUnique({
        where: { id: params.id },
      });

      if (!existingReview) {
        return notFoundResponse('Review');
      }

      // Check if user owns this review or is admin
      if (existingReview.userId !== req.user.id && !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
        return errorResponse(403, 'Access denied', 'ACCESS_DENIED');
      }

      // Delete review
      await db.review.delete({
        where: { id: params.id },
      });

      return successResponse('Review deleted successfully');
    } catch (error) {
      console.error('Delete review error:', error);
      return errorResponse(500, 'Internal server error', 'INTERNAL_ERROR');
    }
  })(request);
}