import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api-response';
import { updateTableSchema } from '@/lib/schemas';
import { z } from 'zod';

// Get table by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const table = await db.table.findUnique({
      where: { id: params.id },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        reservations: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            reservationDate: 'desc',
          },
          take: 10, // Recent reservations
        },
        _count: {
          select: {
            reservations: true,
          },
        },
      },
    });

    if (!table) {
      return notFoundResponse('Table');
    }

    return successResponse('Table retrieved successfully', table);
  } catch (error) {
    console.error('Get table error:', error);
    return errorResponse(500, 'Internal server error', 'INTERNAL_ERROR');
  }
}

// Update table (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const updateData = updateTableSchema.parse(body);

    // If updating table number or restaurant, check for duplicates
    if (updateData.tableNumber || updateData.restaurantId) {
      const currentTable = await db.table.findUnique({
        where: { id: params.id },
        select: { restaurantId: true, tableNumber: true },
      });

      if (!currentTable) {
        return notFoundResponse('Table');
      }

      const duplicateTable = await db.table.findFirst({
        where: {
          id: { not: params.id },
          restaurantId: updateData.restaurantId || currentTable.restaurantId,
          tableNumber: updateData.tableNumber || currentTable.tableNumber,
        },
      });

      if (duplicateTable) {
        return errorResponse(409, 'Table number already exists for this restaurant', 'DUPLICATE_TABLE');
      }
    }

    const table = await db.table.update({
      where: { id: params.id },
      data: updateData,
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return successResponse('Table updated successfully', table);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(400, 'Validation failed', 'VALIDATION_ERROR');
    }

    console.error('Update table error:', error);
    return errorResponse(500, 'Internal server error', 'INTERNAL_ERROR');
  }
}

// Delete table (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if table has existing reservations
    const existingReservations = await db.reservation.count({
      where: {
        tableId: params.id,
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
      },
    });

    if (existingReservations > 0) {
      return errorResponse(400, 'Cannot delete table with existing reservations', 'HAS_RESERVATIONS');
    }

    await db.table.delete({
      where: { id: params.id },
    });

    return successResponse('Table deleted successfully');
  } catch (error) {
    console.error('Delete table error:', error);
    return errorResponse(500, 'Internal server error', 'INTERNAL_ERROR');
  }
}