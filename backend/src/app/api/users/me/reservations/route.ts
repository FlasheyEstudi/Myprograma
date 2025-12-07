import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import { db } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api-response';
import { reservationQuerySchema } from '@/lib/schemas';
import { z } from 'zod';
import { createPaginatedData, paginatedResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  return requireAuth(async (req: any) => {
    try {
      const { searchParams } = new URL(request.url);
      
      // Simple parsing without Zod for now
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '20');
      const status = searchParams.get('status');
      const restaurantId = searchParams.get('restaurantId');
      const dateFrom = searchParams.get('dateFrom');
      const dateTo = searchParams.get('dateTo');
      const sortBy = searchParams.get('sortBy') || 'createdAt';
      const sortOrder = searchParams.get('sortOrder') || 'desc';
      
      const { offset } = calculatePagination(page, limit, 0);

      // Build where clause
      const where: any = {
        userId: req.user.id,
      };

      if (status) {
        where.status = status;
      }

      if (restaurantId) {
        where.restaurantId = restaurantId;
      }

      if (dateFrom || dateTo) {
        where.reservationDate = {};
        if (dateFrom) {
          where.reservationDate.gte = new Date(dateFrom);
        }
        if (dateTo) {
          where.reservationDate.lte = new Date(dateTo);
        }
      }

      // Get total count
      const total = await db.reservation.count({ where });

      // Get reservations with related data
      const reservations = await db.reservation.findMany({
        where,
        include: {
          restaurant: {
            select: {
              id: true,
              name: true,
              address: true,
              phone: true,
            },
          },
          table: {
            select: {
              id: true,
              tableNumber: true,
              capacity: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip: offset,
        take: limit,
      });

      const paginatedData = createPaginatedData(reservations, total, page, limit);
      return paginatedResponse('Reservations retrieved successfully', paginatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return errorResponse(400, 'Validation failed', 'VALIDATION_ERROR');
      }

      console.error('Get user reservations error:', error);
      return errorResponse(500, 'Internal server error', 'INTERNAL_ERROR');
    }
  })(request);
}

function calculatePagination(page: number, limit: number, total: number) {
  const offset = (page - 1) * limit;
  return { offset };
}