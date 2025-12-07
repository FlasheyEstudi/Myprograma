"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Star, User, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoadingSpinner } from "@/components/shared"
import { EmptyState } from "@/components/shared"
import { ReviewForm } from "./ReviewForm"
import { reviewsApi } from "@/api"
import { Review } from "@/api/types"
import { useAuth } from "@/stores/auth.store"
import { useToast } from "@/hooks/use-toast"

interface ReviewsSectionProps {
  restaurantId: string
  restaurantName: string
  initialReviews?: Review[]
}

export function ReviewsSection({ 
  restaurantId, 
  restaurantName, 
  initialReviews = [] 
}: ReviewsSectionProps) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("reviews")
  const toast = useToast()

  const loadReviews = async () => {
    setLoading(true)
    try {
      const response = await reviewsApi.getReviews({ 
        restaurantId, 
        limit: 20,
        isApproved: true 
      })
      setReviews(response.data)
    } catch (error) {
      toast.error("Error", "No se pudieron cargar las reseñas")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialReviews.length === 0) {
      loadReviews()
    }
  }, [restaurantId])

  const handleReviewSuccess = () => {
    loadReviews()
    setActiveTab("reviews")
  }

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

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
    return sum / reviews.length
  }

  const averageRating = calculateAverageRating()

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Reseñas y Calificaciones</span>
            <Badge variant="secondary">
              {reviews.length} {reviews.length === 1 ? "reseña" : "reseñas"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold">
                {averageRating.toFixed(1)}
              </div>
              <div className="flex items-center justify-center">
                {renderStars(Math.round(averageRating))}
              </div>
              <div className="text-sm text-muted-foreground">
                {reviews.length > 0 
                  ? `Basado en ${reviews.length} ${reviews.length === 1 ? "reseña" : "reseñas"}`
                  : "Sin reseñas aún"
                }
              </div>
            </div>
            
            {/* Rating Distribution */}
            {reviews.length > 0 && (
              <div className="flex-1 space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = reviews.filter(r => r.rating === rating).length
                  const percentage = (count / reviews.length) * 100
                  
                  return (
                    <div key={rating} className="flex items-center gap-2">
                      <span className="text-sm w-8">{rating}</span>
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-400 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm w-8 text-right">{count}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reviews Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="reviews">Reseñas</TabsTrigger>
          {user && <TabsTrigger value="write">Escribir Reseña</TabsTrigger>}
        </TabsList>

        <TabsContent value="reviews" className="mt-6">
          {loading ? (
            <LoadingSpinner />
          ) : reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id}>
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
                      {renderStars(review.rating)}
                    </div>
                    
                    {review.title && (
                      <h4 className="font-medium mb-2">{review.title}</h4>
                    )}
                    
                    {review.content && (
                      <p className="text-muted-foreground">{review.content}</p>
                    )}
                    
                    {review.isVerified && (
                      <Badge variant="secondary" className="mt-3">
                        Reseña verificada
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No hay reseñas aún"
              description="Sé el primero en compartir tu experiencia en este restaurante."
              icon={<Star className="h-12 w-12 text-muted-foreground" />}
              action={{
                label: "Escribir la primera reseña",
                onClick: () => setActiveTab("write")
              }}
            />
          )}
        </TabsContent>

        {user && (
          <TabsContent value="write" className="mt-6">
            <ReviewForm
              restaurantId={restaurantId}
              restaurantName={restaurantName}
              onSuccess={handleReviewSuccess}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}