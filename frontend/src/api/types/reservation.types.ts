export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW'
}

export interface Reservation {
  id: string;
  userId: string;
  restaurantId: string;
  tableId: string;
  reservationDate: string;
  reservationTime: string;
  partySize: number;
  status: ReservationStatus;
  specialRequests?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name?: string;
    email: string;
    phone?: string;
  };
  restaurant?: {
    id: string;
    name: string;
    address: string;
    phone?: string;
  };
  table?: {
    id: string;
    tableNumber: string;
    capacity: number;
  };
}

export interface CreateReservationData {
  restaurantId: string;
  tableId: string;
  reservationDate: string;
  reservationTime: string;
  partySize: number;
  specialRequests?: string;
}

export interface ReservationFilters {
  page?: number;
  limit?: number;
  status?: ReservationStatus;
  restaurantId?: string;
  userId?: string;
}

export interface AvailabilityData {
  restaurant: {
    id: string;
    name: string;
    openingTime: string;
    closingTime: string;
  };
  date: string;
  partySize: number;
  availability: {
    time: string;
    available: boolean;
    tables: Table[];
  }[];
}

export interface AvailabilityParams {
  restaurantId: string;
  date: string;
  partySize: number;
  timeFrom?: string;
  timeTo?: string;
}