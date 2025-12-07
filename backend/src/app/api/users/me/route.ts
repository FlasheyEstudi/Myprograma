import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api-response';
import { updateProfileSchema } from '@/lib/schemas';
import { z } from 'zod';

// Get current user profile
export async function GET(request: NextRequest) {
  return requireAuth(async (req: any) => {
    try {
      const user = req.user;
      return successResponse('Profile retrieved successfully', user);
    } catch (error) {
      console.error('Get profile error:', error);
      return errorResponse(500, 'Internal server error', 'INTERNAL_ERROR');
    }
  })(request);
}

// Update current user profile
export async function PUT(request: NextRequest) {
  return requireAuth(async (req: any) => {
    try {
      const body = await request.json();
      const updateData = updateProfileSchema.parse(body);

      const updatedUser = await db.user.update({
        where: { id: req.user.id },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return successResponse('Profile updated successfully', updatedUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return errorResponse(400, 'Validation failed', 'VALIDATION_ERROR');
      }

      console.error('Update profile error:', error);
      return errorResponse(500, 'Internal server error', 'INTERNAL_ERROR');
    }
  })(request);
}