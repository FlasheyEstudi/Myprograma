import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import { db } from '@/lib/db';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api-response';
import { updateReservationSchema } from '@/lib/schemas';
import { z } from 'zod';

// Get reservation by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireAuth(async (req: any) => {
    try {
      const reservation = await db.reservation.findUnique({
        where: { id: params.id },
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
              openingTime: true,
              closingTime: true,
            },
          },
          table: {
            select: {
              id: true,
              tableNumber: true,
              capacity: true,
              hasWindow: true,
              hasOutdoor: true,
              isPrivate: true,
            },
          },
        },
      });

      if (!reservation) {
        return notFoundResponse('Reservation');
      }

      // Check if user owns this reservation or is admin
      if (reservation.userId !== req.user.id && !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
        return errorResponse(403, 'Access denied', 'ACCESS_DENIED');
      }

      return successResponse('Reservation retrieved successfully', reservation);
    } catch (error) {
      console.error('Get reservation error:', error);
      return errorResponse(500, 'Internal server error', 'INTERNAL_ERROR');
    }
  })(request);
}

// Update reservation
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireAuth(async (req: any) => {
    try {
      const body = await request.json();
      const updateData = updateReservationSchema.parse(body);

      // Get existing reservation
      const existingReservation = await db.reservation.findUnique({
        where: { id: params.id },
      });

      if (!existingReservation) {
        return notFoundResponse('Reservation');
      }

      // Check if user owns this reservation or is admin
      if (existingReservation.userId !== req.user.id && !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
        return errorResponse(403, 'Access denied', 'ACCESS_DENIED');
      }

      // Update reservation
      const reservation = await db.reservation.update({
        where: { id: params.id },
        data: updateData,
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

      return successResponse('Reservation updated successfully', reservation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return errorResponse(400, 'Validation failed', 'VALIDATION_ERROR');
      }

      console.error('Update reservation error:', error);
      return errorResponse(500, 'Internal server error', 'INTERNAL_ERROR');
    }
  })(request);
}

// Cancel reservation
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireAuth(async (req: any) => {
    try {
      // Get existing reservation
      const existingReservation = await db.reservation.findUnique({
        where: { id: params.id },
      });

      if (!existingReservation) {
        return notFoundResponse('Reservation');
      }

      // Check if user owns this reservation or is admin
      if (existingReservation.userId !== req.user.id && !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
        return errorResponse(403, 'Access denied', 'ACCESS_DENIED');
      }

      // Check if reservation can be cancelled (not already completed or cancelled)
      if (['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(existingReservation.status)) {
        return errorResponse(400, 'Cannot cancel this reservation', 'CANNOT_CANCEL');
      }

      // Update reservation status to cancelled
      const reservation = await db.reservation.update({
        where: { id: params.id },
        data: { status: 'CANCELLED' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          restaurant: {
            select: {
              id: true,
              name: true,
            },
          },
          table: {
            select: {
              id: true,
              tableNumber: true,
            },
          },
        },
      });

      return successResponse('Reservation cancelled successfully', reservation);
    } catch (error) {
      console.error('Cancel reservation error:', error);
      return errorResponse(500, 'Internal server error', 'INTERNAL_ERROR');
    }
  })(request);
}