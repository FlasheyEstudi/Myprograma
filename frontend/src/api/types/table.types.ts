export interface Table {
  id: string;
  restaurantId: string;
  tableNumber: string;
  capacity: number;
  minCapacity?: number;
  isAvailable: boolean;
  hasWindow?: boolean;
  hasOutdoor?: boolean;
  isPrivate?: boolean;
  createdAt: string;
  updatedAt: string;
  restaurant?: {
    id: string;
    name: string;
  };
  _count?: {
    reservations: number;
  };
}

export interface CreateTableData {
  restaurantId: string;
  tableNumber: string;
  capacity: number;
  minCapacity?: number;
  hasWindow?: boolean;
  hasOutdoor?: boolean;
  isPrivate?: boolean;
}

export interface TableFilters {
  restaurantId?: string;
  isAvailable?: boolean;
  page?: number;
  limit?: number;
}