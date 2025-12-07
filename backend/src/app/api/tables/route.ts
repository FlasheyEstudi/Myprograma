import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api-response';
import { createTableSchema } from '@/lib/schemas';
import { z } from 'zod';

// Get all tables (with optional restaurant filter)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');
    const isAvailable = searchParams.get('isAvailable');

    const where: any = {};

    if (restaurantId) {
      where.restaurantId = restaurantId;
    }

    if (isAvailable !== null) {
      where.isAvailable = isAvailable === 'true';
    }

    const tables = await db.table.findMany({
      where,
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            reservations: true,
          },
        },
      },
      orderBy: {
        tableNumber: 'asc',
      },
    });

    return successResponse('Tables retrieved successfully', tables);
  } catch (error) {
    console.error('Get tables error:', error);
    return errorResponse(500, 'Internal server error', 'INTERNAL_ERROR');
  }
}

// Create new table (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tableData = createTableSchema.parse(body);

    // Check if table number already exists for this restaurant
    const existingTable = await db.table.findFirst({
      where: {
        restaurantId: tableData.restaurantId,
        tableNumber: tableData.tableNumber,
      },
    });

    if (existingTable) {
      return errorResponse(409, 'Table number already exists for this restaurant', 'DUPLICATE_TABLE');
    }

    const table = await db.table.create({
      data: tableData,
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return successResponse('Table created successfully', table);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(400, 'Validation failed', 'VALIDATION_ERROR');
    }

    console.error('Create table error:', error);
    return errorResponse(500, 'Internal server error', 'INTERNAL_ERROR');
  }
}