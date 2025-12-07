import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api-response';
import { availabilityQuerySchema } from '@/lib/schemas';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Simple parsing without Zod for now
    const restaurantId = searchParams.get('restaurantId');
    const date = searchParams.get('date');
    const partySize = parseInt(searchParams.get('partySize') || '2');
    const timeFrom = searchParams.get('timeFrom');
    const timeTo = searchParams.get('timeTo');
    
    if (!restaurantId || !date) {
      return errorResponse(400, 'Restaurant ID and date are required', 'MISSING_PARAMS');
    }

    // Validate restaurant exists
    const restaurant = await db.restaurant.findUnique({
      where: { id: restaurantId, isActive: true },
      select: {
        id: true,
        name: true,
        openingTime: true,
        closingTime: true,
      },
    });

    if (!restaurant) {
      return errorResponse(404, 'Restaurant not found', 'RESTAURANT_NOT_FOUND');
    }

    // Get available tables for the party size
    const availableTables = await db.table.findMany({
      where: {
        restaurantId,
        isAvailable: true,
        capacity: { gte: partySize },
        OR: [
          { minCapacity: null },
          { minCapacity: { lte: partySize } },
        ],
      },
      orderBy: { capacity: 'asc' },
    });

    // Get existing reservations for the date
    const existingReservations = await db.reservation.findMany({
      where: {
        restaurantId,
        reservationDate: new Date(date),
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
      },
      include: {
        table: {
          select: {
            id: true,
            capacity: true,
          },
        },
      },
      orderBy: { reservationTime: 'asc' },
    });

    // Create time slots (30-minute intervals)
    const timeSlots = generateTimeSlots(restaurant.openingTime, restaurant.closingTime);
    
    // Filter time slots if time range is specified
    const filteredTimeSlots = timeSlots.filter(slot => {
      if (timeFrom && slot.time < timeFrom) return false;
      if (timeTo && slot.time > timeTo) return false;
      return true;
    });

    // Check availability for each time slot
    const availability = filteredTimeSlots.map(slot => {
      const conflictingReservations = existingReservations.filter(reservation => {
        const reservationTime = reservation.reservationTime;
        const slotTime = slot.time;
        
        // Check if reservation conflicts with this time slot (2-hour window)
        const reservationStart = parseTime(reservationTime);
        const slotStart = parseTime(slotTime);
        
        return Math.abs(reservationStart - slotStart) < 2 * 60 * 60 * 1000; // 2 hours in milliseconds
      });

      // Get tables that are not reserved in this time slot
      const reservedTableIds = conflictingReservations.map(r => r.tableId);
      const availableTablesInSlot = availableTables.filter(table => 
        !reservedTableIds.includes(table.id)
      );

      return {
        time: slot.time,
        available: availableTablesInSlot.length > 0,
        tables: availableTablesInSlot.map(table => ({
          id: table.id,
          tableNumber: table.tableNumber,
          capacity: table.capacity,
        })),
      };
    });

    return successResponse('Availability checked successfully', {
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        openingTime: restaurant.openingTime,
        closingTime: restaurant.closingTime,
      },
      date,
      partySize,
      availability,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(400, 'Validation failed', 'VALIDATION_ERROR');
    }

    console.error('Check availability error:', error);
    return errorResponse(500, 'Internal server error', 'INTERNAL_ERROR');
  }
}

function generateTimeSlots(openingTime: string, closingTime: string): Array<{ time: string }> {
  const slots = [];
  const [openHour, openMinute] = openingTime.split(':').map(Number);
  const [closeHour, closeMinute] = closingTime.split(':').map(Number);
  
  let currentHour = openHour;
  let currentMinute = openMinute;
  
  while (currentHour < closeHour || (currentHour === closeHour && currentMinute < closeMinute)) {
    const time = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    slots.push({ time });
    
    // Add 30 minutes
    currentMinute += 30;
    if (currentMinute >= 60) {
      currentHour += 1;
      currentMinute -= 60;
    }
  }
  
  return slots;
}

function parseTime(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return (hours * 60 + minutes) * 60 * 1000; // Convert to milliseconds
}