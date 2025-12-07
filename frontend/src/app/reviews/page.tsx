"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  Star,
  User,
  Calendar,
  Search,
  Filter,
  Store,
  ThumbsUp
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PageContainer } from "@/components/shared"
import { LoadingSpinner } from "@/components/shared"
import { EmptyState } from "@/components/shared"
import { reviewsApi, restaurantsApi } from "@/api"
import { Review, Restaurant } from "@/api/types"
import { useApi } from "@/hooks/use-api"
import { useDebounce } from "@/hooks/use-debounce"
import { useToast } from "@/hooks/use-toast"

export default function ReviewsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("")
  const [selectedRating, setSelectedRating] = useState<string>("")
  const debouncedSearch = useDebounce(searchTerm, 300)
  
  const { data: reviews, isLoading, error, execute } = useApi<{ data: Review[], meta: any }>()
  const { data: restaurants, execute: loadRestaurants } = useApi<Restaurant[]>()
  
  const toast = useToast()

  const loadReviews = async () => {
    const filters: any = { limit: 20 }
    
    if (debouncedSearch) {
      filters.search = debouncedSearch
    }
    if (selectedRestaurant) {
      filters.restaurantId = selectedRestaurant
    }
    if (selectedRating) {
      filters.rating = parseInt(selectedRating)
    }
    
    await execute(() => reviewsApi.getReviews(filters))
  }

  const loadRestaurantsList = async () => {
    await loadRestaurants(() => 
      restaurantsApi.getRestaurants({ limit: 100 }).then(response => response.data)
    )
  }

  useEffect(() => {
    loadReviews()
    loadRestaurantsList()
  }, [debouncedSearch, selectedRestaurant, selectedRating])

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <PageContainer title="Reseñas">
        <div className="text-center text-destructive py-8">
          Error al cargar reseñas: {error}
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer 
      title="Reseñas" 
      description="Descubre las experiencias de otros comensales"
    >
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar reseñas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedRestaurant} onValueChange={setSelectedRestaurant}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Restaurantes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              {restaurants?.map((restaurant) => (
                <SelectItem key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedRating} onValueChange={setSelectedRating}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value="5">5 estrellas</SelectItem>
              <SelectItem value="4">4 estrellas</SelectItem>
              <SelectItem value="3">3 estrellas</SelectItem>
              <SelectItem value="2">2 estrellas</SelectItem>
              <SelectItem value="1">1 estrella</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : reviews?.data && reviews.data.length > 0 ? (
        <div className="space-y-4">
          {reviews.data.map((review) => (
            <Card key={review.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {review.user?.name || "Usuario Anónimo"}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(review.createdAt), "dd MMM yyyy", { locale: es })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {renderStars(review.rating)}
                    <Badge variant="secondary" className="ml-2">
                      {review.rating}/5
                    </Badge>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Store className="h-4 w-4" />
                    <span>{review.restaurant?.name}</span>
                  </div>
                </div>
                
                {review.title && (
                  <h4 className="font-medium mb-2">{review.title}</h4>
                )}
                
                {review.content && (
                  <p className="text-muted-foreground mb-3">{review.content}</p>
                )}
                
                <div className="flex items-center justify-between">
                  {review.isVerified && (
                    <Badge variant="outline" className="text-green-600">
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      Reseña verificada
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No se encontraron reseñas"
          description="No hay reseñas que coincidan con los filtros seleccionados."
          icon={<Star className="h-12 w-12 text-muted-foreground" />}
          action={{
            label: "Limpiar filtros",
            onClick: () => {
              setSearchTerm("")
              setSelectedRestaurant("")
              setSelectedRating("")
            }
          }}
        />
      )}
    </PageContainer>
  )
}