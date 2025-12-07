export enum PriceRange {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  PREMIUM = 'PREMIUM'
}

export interface Restaurant {
  id: string;
  name: string;
  description?: string;
  cuisine?: string;
  address: string;
  phone?: string;
  email?: string;
  openingTime: string;
  closingTime: string;
  maxCapacity: number;
  priceRange: PriceRange;
  isActive: boolean;
  averageRating?: number;
  reviewCount?: number;
  tableCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface RestaurantWithDetails extends Restaurant {
  tables?: Table[];
  reviews?: Review[];
}

export interface CreateRestaurantData {
  name: string;
  description?: string;
  cuisine?: string;
  address: string;
  phone?: string;
  email?: string;
  openingTime: string;
  closingTime: string;
  maxCapacity: number;
  priceRange: PriceRange;
}

export interface RestaurantFilters {
  page?: number;
  limit?: number;
  cuisine?: string;
  priceRange?: PriceRange;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}