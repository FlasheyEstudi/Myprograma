export interface Review {
  id: string;
  userId: string;
  restaurantId: string;
  rating: number;
  title?: string;
  content?: string;
  isVerified: boolean;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name?: string;
    email: string;
  };
  restaurant?: {
    id: string;
    name: string;
  };
}

export interface CreateReviewData {
  restaurantId: string;
  rating: number;
  title?: string;
  content?: string;
}

export interface ReviewFilters {
  page?: number;
  limit?: number;
  restaurantId?: string;
  rating?: number;
  isApproved?: boolean;
}