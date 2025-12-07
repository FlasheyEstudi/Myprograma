import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import { db } from '@/lib/db';
import { successResponse, errorResponse, conflictResponse } from '@/lib/api-response';
import { createReservationSchema, reservationQuerySchema } from '@/lib/schemas';
import { z } from 'zod';
import { createPaginatedData, paginatedResponse } from '@/lib/api-response';

// Get all reservations (admin only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = reservationQuerySchema.parse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      status: searchParams.get('status'),
      restaurantId: searchParams.get('restaurantId'),
      dateFrom: searchParams.get('dateFrom'),
      dateTo: searchParams.get('dateTo'),
      sortBy: searchParams.get('sortBy'),
      sortOrder: searchParams.get('sortOrder'),
    });

    const { page, limit, status, restaurantId, dateFrom, dateTo, sortBy, sortOrder } = query;
    const { offset } = calculatePagination(page, limit, 0);

    // Build where clause
    const where: any = {};

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
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
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

    console.error('Get reservations error:', error);
    return errorResponse(500, 'Internal server error', 'INTERNAL_ERROR');
  }
}

// Create new reservation
export async function POST(request: NextRequest) {
  return requireAuth(async (req: any) => {
    try {
      const body = await request.json();
      const reservationData = createReservationSchema.parse(body);

      // Validate restaurant and table exist
      const restaurant = await db.restaurant.findUnique({
        where: { id: reservationData.restaurantId, isActive: true },
      });

      if (!restaurant) {
        return errorResponse(404, 'Restaurant not found', 'RESTAURANT_NOT_FOUND');
      }

      const table = await db.table.findUnique({
        where: { 
          id: reservationData.tableId,
          restaurantId: reservationData.restaurantId,
          isAvailable: true 
        },
      });

      if (!table) {
        return errorResponse(404, 'Table not found or unavailable', 'TABLE_NOT_FOUND');
      }

      // Check if party size fits table capacity
      if (reservationData.partySize > table.capacity) {
        return errorResponse(400, 'Party size exceeds table capacity', 'PARTY_SIZE_TOO_LARGE');
      }

      if (table.minCapacity && reservationData.partySize < table.minCapacity) {
        return errorResponse(400, 'Party size below minimum table capacity', 'PARTY_SIZE_TOO_SMALL');
      }

      // Check for conflicting reservations
      const conflictingReservation = await db.reservation.findFirst({
        where: {
          tableId: reservationData.tableId,
          reservationDate: new Date(reservationData.reservationDate),
          status: {
            in: ['PENDING', 'CONFIRMED'],
          },
          OR: [
            // Check for time conflicts (assuming 2-hour slots)
            {
              AND: [
                { reservationTime: { lte: reservationData.reservationTime } },
                { reservationTime: { gte: new Date(Date.parse(`1970-01-01T${reservationData.reservationTime}:00`) - 2 * 60 * 60 * 1000).toISOString().substring(11, 16) } }
              ]
            },
            {
              AND: [
                { reservationTime: { gte: reservationData.reservationTime } },
                { reservationTime: { lte: new Date(Date.parse(`1970-01-01T${reservationData.reservationTime}:00`) + 2 * 60 * 60 * 1000).toISOString().substring(11, 16) } }
              ]
            }
          ]
        },
      });

      if (conflictingReservation) {
        return conflictResponse('Table is already reserved for this time slot');
      }

      // Create reservation
      const reservation = await db.reservation.create({
        data: {
          ...reservationData,
          userId: req.user.id,
          reservationDate: new Date(reservationData.reservationDate),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
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
      });

      return successResponse('Reservation created successfully', reservation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return errorResponse(400, 'Validation failed', 'VALIDATION_ERROR');
      }

      console.error('Create reservation error:', error);
      return errorResponse(500, 'Internal server error', 'INTERNAL_ERROR');
    }
  })(request);
}

function calculatePagination(page: number, limit: number, total: number) {
  const offset = (page - 1) * limit;
  return { offset };
}